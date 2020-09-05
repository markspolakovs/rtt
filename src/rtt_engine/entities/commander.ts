import { Player } from '../player';
import { Vector } from '../vector';
import { Engineerable } from './abilities';
import { Vehicle } from './lib';
import { PowerGenerator, PowerSource } from './';

export class Commander extends Engineerable(Vehicle) {
  public energyOutput: number;
  constructing: boolean;

  constructor(position: Vector, direction: number, player: Player) {
    super({
      position,
      direction,
      collisionRadius: 8,
      built: true,
      buildCost: 10000,
      player,
      fullHealth: 1000,
      health: 1000,
      movementRate: 0.03,
      turnRate: 2.0 / 3.0,
      productionRange: 35.0,
    } as any);
    this.energyOutput = 5;
    this.orderExecutionCallbacks['construct'] = (constructionOrder: any): boolean => {
      return this.construct(constructionOrder);
    };
    this.constructing = false;
  }

  kill() {
    super.kill();
  }

  update() {
    super.update();
    if (this.construction != null && (this.construction.isBuilt() || this.construction.isDead())) {
      this.construction = null;
    }
    this.updateProduction();
    this.updateOrders();
    if (this.construction == null) {
      this.constructing = false;
    }
  }

  // FIXME: Deduplicate this code with what's on Engineer
  construct(constructionOrder: { position: Vector, structureClass: any, extra?: any[] }): boolean {
    if (Vector.subtract(this.position, constructionOrder.position).magnitude() > this.productionRange) {
      this.manoeuvre({ destination: constructionOrder.position });
      return true;
    }
    if (constructionOrder.extra == null) {
      constructionOrder.extra = [];
    }
    if (this.construction == null) {
      if (this.constructing) {
        this.constructing = false;
        return false;
      } else if (constructionOrder.structureClass == PowerGenerator) {
        const powerSource: PowerSource = constructionOrder.extra[0];
        if (powerSource.structure == null) {
          this.constructing = true;
          this.construction = new constructionOrder.structureClass(
            constructionOrder.position,
            this.player,
            false,
            ...constructionOrder.extra,
          );
        } else if (powerSource.structure.player == this.player && powerSource.structure.isUnderConstruction()) {
          this.constructing = true;
          this.construction = powerSource.structure;
        }
      } else {
        this.constructing = true;
        this.construction = new constructionOrder.structureClass(
          constructionOrder.position,
          this.player,
          false,
          ...constructionOrder.extra,
        );
        return true;
      }
    }
    return true;
  }
}
