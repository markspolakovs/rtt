import lodash from 'lodash';
import { unionize, ofType, UnionOf } from 'unionize';
import { Vector } from '../../vector';
import { newPhysics } from './physics';
import { ARTILLERY_RANGE, SHOTGUN_RANGE, TURRET_RANGE } from '../';

export const UnitUnion = unionize({
  artilleryTank: ofType<IArtilleryTank>(),
  bot: ofType<IBot>(),
  commander: ofType<ICommander>(),
  engineer: ofType<IEngineer>(),
  factory: ofType<IFactory>(),
  powerGenerator: ofType<IPowerGenerator>(),
  shotgunTank: ofType<IShotgunTank>(),
  titan: ofType<ITitan>(),
  turret: ofType<ITurret>(),
}, {tag: "kind"});
export type Unit = UnionOf<typeof UnitUnion>;
export type UnitRecord = typeof UnitUnion._Record;

export type KindsOfUnits = keyof MetadataForUnits;
export type KindsOfUnitsWithAbility<AbilityConfig> =
  ({
    [P in KindsOfUnits]:
    MetadataForUnits[P] extends AbilityConfig ? P : never
  })[KindsOfUnits];

export type MetadataForUnits = typeof UnitMetadata;
export const UnitMetadata = {
  artilleryProjectile: {
    collisionRadius: 5,
    movementRate: 1.0,
    velocity: 1.8,
    fullHealth: 18,
    lifetime: ARTILLERY_RANGE / 1.8,
  },
  artilleryTank: {
    collisionRadius: 9,
    buildCost: 500,
    fullHealth: 50,
    movementRate: 0.04,
    turnRate: 4.0 / 3.0,
    firingRate: 75,
  },
  bot: {
    collisionRadius: 5,
    buildCost: 70,
    fullHealth: 10,
    movementRate: 0.15,
    turnRate: 5.0 / 3.0,
    physics: newPhysics(),
    constructableByMobileUnits: true,
    orderBehaviours: {
      default: (_: any) => false,
    },
  },
  commander: {
    collisionRadius: 8,
    buildCost: 10000,
    fullHealth: 1000,
    health: 1000,
    movementRate: 0.03,
    turnRate: 2.0 / 3.0,
    physics: newPhysics(),
    productionRange: 35.0,
    energyOutput: 5,
    orderBehaviours: {
      default: (_: any) => false,
    },
  },
  engineer: {
    collisionRadius: 6,
    buildCost: 50,
    fullHealth: 16,
    movementRate: 0.06,
    turnRate: 4.0 / 3.0,
    productionRange: 25.0,
  },
  factory: {
    collisionRadius: 15,
    buildCost: 1200,
    fullHealth: 120,
  },
  powerGenerator: {
    collisionRadius: 8,
    buildCost: 300,
    fullHealth: 60,
    constructableByMobileUnits: true,
    orderBehaviours: {
      default: (_: any) => false,
    },
  },
  powerSource: {
    collisionRadius: 7.0,
  },
  shotgunProjectile: {
    collisionRadius: 3,
    movementRate: 1.0,
    velocity: 6.5,
    // FIXME: Change `lifetime` to a `projectileRange` parameter, and
    // fix `SHOTGUN_RANGE` because it's actually not being divided by
    // the velocity here
    lifetime: SHOTGUN_RANGE / 5,
    fullHealth: 2.5,
  },
  shotgunTank: {
    collisionRadius: 8,
    buildCost: 400,
    fullHealth: 35,
    movementRate: 0.07,
    turnRate: 4.0 / 3.0,
    firingRate: 40,
    turretInput: [0.08, 1, 0.8],
  },
  titan: {
    collisionRadius: 12,
    buildCost: 7000,
    fullHealth: 700,
    movementRate: 0.03,
    turnRate: 1 / 3,
    turretInput: [0.05, 1, 0.8, 0],
  },
  turret: {
    collisionRadius: 5,
    buildCost: 600,
    fullHealth: 60,
    constructableByMobileUnits: true,
    firingRate: 5,
  },
  turretProjectile: {
    collisionRadius: 4,
    movementRate: 1.0,
    velocity: 3.5,
    lifetime: TURRET_RANGE / 3.5,
    fullHealth: 7,
  },
};

interface IArtilleryTank {

}

interface IBot {

}

interface ICommander {

}

interface IEngineer {

}

interface IFactory {

}

interface IPowerGenerator {

}

interface IShotgunTank {

}

interface ITitan {

}

interface ITurret {

}
