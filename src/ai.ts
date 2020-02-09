import * as rtt_engine from './rtt_engine';

export interface IAI {
  game: rtt_engine.Game;
  player: rtt_engine.Player;
  opponents: rtt_engine.Player[];

  update(): void;
}

export class ExistingAI implements IAI {
  game: rtt_engine.Game;
  player: rtt_engine.Player;
  opponents: rtt_engine.Player[];

  constructor(game: rtt_engine.Game, player: rtt_engine.Player, opponents: rtt_engine.Player[]) {
    this.game = game;
    this.player = player;
    this.opponents = opponents;
  }

  update() {
    this.opponents = this.opponents.filter((p) => !p.isDefeated());
    if (this.opponents.length == 0) {
      return;
    }

    if (this.player.units.commander != null && this.player.units.factories.length == 0) {
      this.player.units.commander.orders[0] = {
        kind: 'construct',
        structureClass: rtt_engine.Factory,
        position: new rtt_engine.Vector(
          this.player.units.commander.position.x,
          this.player.units.commander.position.y,
        ),
      };
    }

    for (let factory of this.player.units.factories) {
      if (factory.orders.length > 0) {
        continue;
      }
      factory.orders[0] = {
        kind: 'construct',
        unitClass: Math.random() < 0.6 ? rtt_engine.Bot : (Math.random() < 0.7 ? rtt_engine.ShotgunTank : rtt_engine.ArtilleryTank),
      };
    }

    const opponent = this.opponents[0];
    const opposingUnits = opponent.units.allKillableCollidableUnits();
    const opposingUnitCount = opposingUnits.length;
    if (opposingUnitCount > 0) {
      for (let j in this.player.units.vehicles) {
        if (this.player.units.vehicles[j].orders.length > 0) {
          continue;
        }
        const target = opposingUnits[j % opposingUnitCount];
        this.player.units.vehicles[j].orders[0] = { kind: 'attack', target: target };
      }
    }
  }
}

export class AttackNearestAI implements IAI {
  game: rtt_engine.Game;
  player: rtt_engine.Player;
  opponents: rtt_engine.Player[];

  constructor(game: rtt_engine.Game, player: rtt_engine.Player, opponents: rtt_engine.Player[]) {
    this.game = game;
    this.player = player;
    this.opponents = opponents;
  }

  update() {
    this.opponents = this.opponents.filter((p) => !p.isDefeated());
    if (this.opponents.length == 0) {
      return;
    }
    this.updateFactoryConstruction();
    this.updateCommanderConstruction();
    this.updateVehicleAttacks();
  }

  updateFactoryConstruction() {
    let numberOfBots = this.player.units.vehicles.filter((v) => v instanceof rtt_engine.Bot).length;
    let unitClass = numberOfBots < 1 ? rtt_engine.Bot : rtt_engine.ShotgunTank;
    for (let factory of this.player.units.factories) {
      if (factory.orders.length > 0) {
        continue;
      }
      factory.orders[0] = { kind: 'construct', unitClass: unitClass };
    }
  }

  updateCommanderConstruction() {
    // STRATEGY: do the first (if CONDITION, then ACT) in this list where the condition is met.
    // 1. If the commander is dead, do nothing.
    //    OR If the commander is already doing something, do nothing.
    // 2. If the player has no factories, build a new factory on top of the commander.
    //    OR If the player has 500 stored energy, build a new factory on top of the commander.
    // 3. If there are unoccupied power sources near the player's factories, build power generators on them.
    // 4. If the player has no turrets, build one near the player's nearest factory.

    if (this.player.units.commander == null || this.player.units.commander.orders.length > 0) {
      return;
    }

    if (this.player.units.factories.length == 0 || this.player.storedEnergy > 500) {
      this.player.units.commander!.orders[0] = {
        kind: 'construct',
        structureClass: rtt_engine.Factory,
        position: this.player.units.commander!.position,
      };
      return;
    }

    const powerSourcesNearFactories = this.game.powerSources.filter((powerSource) => {
      const nearestFactory = _.minBy(this.player.units.factories, (factory) => {
        return rtt_engine.Vector.distance(factory.position, powerSource.position);
      });
      if (nearestFactory == null) {
        return false;
      }
      return rtt_engine.Vector.distance(nearestFactory!.position, powerSource.position) < 160;
    });
    const desiredPowerSources = powerSourcesNearFactories.filter((powerSource) => powerSource.structure == null);
    if (desiredPowerSources.length > 0) {
      const nearestDesiredPowerSource = _.minBy(desiredPowerSources, (powerSource) => {
        return rtt_engine.Vector.distance(powerSource.position, this.player.units.commander!.position);
      });
      this.player.units.commander!.orders[0] = {
        kind: 'construct',
        structureClass: rtt_engine.PowerGenerator,
        position: nearestDesiredPowerSource!.position,
        extra: [nearestDesiredPowerSource],
      };
      return;
    }

    if (this.player.units.turrets.length == 0) {
      const nearestFactory = _.minBy(this.player.units.factories, (factory) => {
        return rtt_engine.Vector.distance(this.player.units.commander!.position, factory.position);
      });
      if (rtt_engine.Vector.distance(this.player.units.commander!.position, nearestFactory!.position) < 50) {
        this.player.units.commander!.orders[0] = {
          kind: 'construct',
          structureClass: rtt_engine.Turret,
          position: this.player.units.commander!.position,
        };
      } else {
        this.player.units.commander!.orders[0] = { kind: 'manoeuvre', destination: nearestFactory!.position };
      }
    }
  }

  updateVehicleAttacks() {
    const opposingUnits = this.opponents.map((p) => p.units.allKillableCollidableUnits()).flat();
    for (let vehicle of this.player.units.vehicles) {
      if (vehicle.orders.length > 0 && vehicle.orders[0].kind == 'construct') {
        continue;
      }
      let nearestOpposingUnit = _.minBy(opposingUnits, (u) => rtt_engine.Vector.distance(u.position, vehicle.position));
      vehicle.orders[0] = { kind: 'attack', target: nearestOpposingUnit };
    }
  }
}