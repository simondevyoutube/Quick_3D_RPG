import {entity} from './entity.js';


export const spatial_grid_controller = (() => {

  class SpatialGridController extends entity.Component {
    constructor(params) {
      super();

      this._grid = params.grid;
    }

    InitComponent() {
      const pos = [
          this._parent._position.x,
          this._parent._position.z,
      ];

      this._client = this._grid.NewClient(pos, [1, 1]);
      this._client.entity = this._parent;
      this._RegisterHandler('update.position', (m) => this._OnPosition(m));
    }

    _OnPosition(msg) {
      this._client.position = [msg.value.x, msg.value.z];
      this._grid.UpdateClient(this._client);
    }

    FindNearbyEntities(range) {
      const results = this._grid.FindNear(
          [this._parent._position.x, this._parent._position.z], [range, range]);
          
      return results.filter(c => c.entity != this._parent);
    }
  };

  return {
      SpatialGridController: SpatialGridController,
  };
})();