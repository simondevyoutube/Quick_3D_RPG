import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

import {entity} from './entity.js';

import {math} from './math.js';


export const attack_controller = (() => {

  class AttackController extends entity.Component {
    constructor(params) {
      super();
      this._params = params;
      this._timeElapsed = 0.0;
      this._action = null;
    }

    InitComponent() {
      this._RegisterHandler('player.action', (m) => { this._OnAnimAction(m); });
    }

    _OnAnimAction(m) {
      if (m.action != this._action) {
        this._action = m.action;
        this._timeElapsed = 0.0;
      }

      const oldTiming = this._timeElapsed;
      this._timeElapsed = m.time;

      if (oldTiming < this._params.timing && this._timeElapsed >= this._params.timing) {
        const inventory = this.GetComponent('InventoryController');
        const equip = this.GetComponent('EquipWeapon');
        let item = null;
        if (equip) {
          item = inventory.GetItemByName(equip.Name);
          if (item) {
            item = item.GetComponent('InventoryItem');
          }
        }

        const grid = this.GetComponent('SpatialGridController');
        const nearby = grid.FindNearbyEntities(2);

        const _Filter = (c) => {
          if (c.entity == this._parent) {
            return false;
          }
  
          const h = c.entity.GetComponent('HealthComponent');
          if (!h) {
            return false;
          }

          return h.IsAlive();
        };

        const attackable = nearby.filter(_Filter);
        for (let a of attackable) {
          const target = a.entity;

          const dirToTarget = target._position.clone().sub(this._parent._position);
          dirToTarget.normalize();

          const forward = new THREE.Vector3(0, 0, 1);
          forward.applyQuaternion(this._parent._rotation);
          forward.normalize();
    
          let damage = this.GetComponent('HealthComponent')._params.strength;
          if (item) {
            damage *= item.Params.damage;
            damage = Math.round(damage);
          }

          const dot = forward.dot(dirToTarget);
          if (math.in_range(dot, 0.9, 1.1)) {
            target.Broadcast({
              topic: 'health.damage',
              value: damage,
              attacker: this._parent,
            });
          }
        }
      }
    }
  };

  return {
      AttackController: AttackController,
  };
})();