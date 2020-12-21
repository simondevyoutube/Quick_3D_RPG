import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118.1/build/three.module.js';

import {entity} from './entity.js';
import {math} from './math.js';


export const health_bar = (() => {

  const _VS = `#version 300 es
varying vec2 vUV;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  vUV = uv;
}
`;

  const _PS = `#version 300 es
uniform vec3 colour;
uniform float health;

varying vec2 vUV;

out vec4 out_FragColor;

void main() {
  out_FragColor = vec4(mix(colour, vec3(0.0), step(health, vUV.y)), 1.0);
}
`;

class HealthBar extends entity.Component {
  constructor(params) {
    super();
    this._params = params;
    this._Initialize();
  }

  _Initialize() {
    const uniforms = {
      colour: {
        value: new THREE.Color(0, 1, 0),
      },
      health: {
        value: 1.0,
      },
    };
    this._material = new THREE.ShaderMaterial( {
      uniforms: uniforms,
      vertexShader: _VS,
      fragmentShader: _PS,
      blending: THREE.NormalBlending,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    this._geometry = new THREE.BufferGeometry();

    this._bar = new THREE.Mesh(this._geometry, this._material);
    this._bar.frustumCulled = false;
    this._bar.scale.set(2, 0.125, 1);

    this._realHealth = 1.0;
    this._animHealth = 1.0;

    this._params.parent.add(this._bar);
    this._GenerateBuffers();
  }

  InitComponent() {
    this._RegisterHandler('health.update', (m) => { this._OnHealth(m); });
  }

  _OnHealth(msg) {
    const healthPercent = (msg.health / msg.maxHealth);
    
    this._realHealth = healthPercent;
  }

  Update(timeElapsed) {
    const t = 1.0 - Math.pow(0.001, timeElapsed);

    this._animHealth = math.lerp(t, this._animHealth, this._realHealth);

    const _R = new THREE.Color(1.0, 0, 0);
    const _G = new THREE.Color(0.0, 1.0, 0.0);
    const c = _R.clone();
    c.lerpHSL(_G, this._animHealth);

    this._material.uniforms.health.value = this._animHealth;
    this._material.uniforms.colour.value = c;
    this._bar.position.copy(this._parent._position);
    this._bar.position.y += 8.0;
    this._bar.quaternion.copy(this._params.camera.quaternion);
  }

  _GenerateBuffers() {
    const indices = [];
    const positions = [];
    const uvs = [];

    const square = [0, 1, 2, 2, 3, 0];

    indices.push(...square);

    const p1 = new THREE.Vector3(-1, -1, 0);
    const p2 = new THREE.Vector3(-1, 1, 0);
    const p3 = new THREE.Vector3(1, 1, 0);
    const p4 = new THREE.Vector3(1, -1, 0);

    uvs.push(0.0, 0.0);
    uvs.push(1.0, 0.0);
    uvs.push(1.0, 1.0);
    uvs.push(0.0, 1.0);

    positions.push(p1.x, p1.y, p1.z);
    positions.push(p2.x, p2.y, p2.z);
    positions.push(p3.x, p3.y, p3.z);
    positions.push(p4.x, p4.y, p4.z);

    this._geometry.setAttribute(
        'position', new THREE.Float32BufferAttribute(positions, 3));
    this._geometry.setAttribute(
        'uv', new THREE.Float32BufferAttribute(uvs, 2));
    this._geometry.setIndex(
        new THREE.BufferAttribute(new Uint32Array(indices), 1));

    this._geometry.attributes.position.needsUpdate = true;
  }
};

  return {
    HealthBar: HealthBar,
  };
})();