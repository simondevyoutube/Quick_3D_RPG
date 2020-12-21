import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';


export const entity = (() => {

  class Entity {
    constructor() {
      this._name = null;
      this._components = {};

      this._position = new THREE.Vector3();
      this._rotation = new THREE.Quaternion();
      this._handlers = {};
      this._parent = null;
    }

    _RegisterHandler(n, h) {
      if (!(n in this._handlers)) {
        this._handlers[n] = [];
      }
      this._handlers[n].push(h);
    }

    SetParent(p) {
      this._parent = p;
    }

    SetName(n) {
      this._name = n;
    }

    get Name() {
      return this._name;
    }

    SetActive(b) {
      this._parent.SetActive(this, b);
    }

    AddComponent(c) {
      c.SetParent(this);
      this._components[c.constructor.name] = c;

      c.InitComponent();
    }

    GetComponent(n) {
      return this._components[n];
    }

    FindEntity(n) {
      return this._parent.Get(n);
    }

    Broadcast(msg) {
      if (!(msg.topic in this._handlers)) {
        return;
      }

      for (let curHandler of this._handlers[msg.topic]) {
        curHandler(msg);
      }
    }

    SetPosition(p) {
      this._position.copy(p);
      this.Broadcast({
          topic: 'update.position',
          value: this._position,
      });
    }

    SetQuaternion(r) {
      this._rotation.copy(r);
      this.Broadcast({
          topic: 'update.rotation',
          value: this._rotation,
      });
    }

    Update(timeElapsed) {
      for (let k in this._components) {
        this._components[k].Update(timeElapsed);
      }
    }
  };

  class Component {
    constructor() {
      this._parent = null;
    }

    SetParent(p) {
      this._parent = p;
    }

    InitComponent() {}

    GetComponent(n) {
      return this._parent.GetComponent(n);
    }

    FindEntity(n) {
      return this._parent.FindEntity(n);
    }

    Broadcast(m) {
      this._parent.Broadcast(m);
    }

    Update(_) {}

    _RegisterHandler(n, h) {
      this._parent._RegisterHandler(n, h);
    }
  };

  return {
    Entity: Entity,
    Component: Component,
  };

})();