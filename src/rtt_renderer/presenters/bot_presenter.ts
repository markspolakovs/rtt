import * as THREE from 'three';
import { Player, Vector } from '../../rtt_engine';
import { Bot } from '../../rtt_engine/entities';
import { InstancedGeometryPresenter } from './lib';

import vehicle_vert from '../shaders/vehicle_vert.glsl.js';
import vehicle_frag from '../shaders/vehicle_frag.glsl.js';

export function botShape(): THREE.Shape {
  var shape = new THREE.Shape();
  shape.moveTo(5, 0);
  const closeness = 0.8;
  shape.ellipse(-5, 0, 5, 5, 0, Math.PI * closeness * 2, false, -Math.PI * closeness);
  shape.lineTo(-0.5, 0);
  return shape;
}

export class BotPresenter extends InstancedGeometryPresenter {
  player: Player;

  constructor(player: Player, scene: THREE.Group) {
    const geometry = new THREE.ShapeBufferGeometry(botShape());
    const material = new THREE.ShaderMaterial({
      vertexShader: vehicle_vert,
      fragmentShader: vehicle_frag,
      blending: THREE.NoBlending,
    });
    super(geometry, material, scene);
    this.player = player;
  }

  getInstances(): {position: Vector, direction: number, player: Player | null}[] {
    return this.player.units.vehicles.filter(v => v instanceof Bot);
  }
}
