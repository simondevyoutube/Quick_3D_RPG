import {entity} from './entity.js';


export const inventory_controller = (() => {

  class InventoryController extends entity.Component {
    constructor(params) {
      super();

      this._inventory = {};
      for (let i = 1; i <= 24; ++i) {
        this._inventory['inventory-' + i] = {
          type: 'inventory',
          value: null,
        };
      }

      for (let i = 1; i <= 8; ++i) {
        this._inventory['inventory-equip-' + i] = {
          type: 'equip',
          value: null,
        };
      }
    }

    InitComponent() {
      this._RegisterHandler('inventory.add', (m) => this._OnInventoryAdded(m));

      const _SetupElement = (n) => {
        const element = document.getElementById(n);
        element.ondragstart = (ev) => {
          ev.dataTransfer.setData('text/plain', n);
        };
        element.ondragover = (ev) => {
          ev.preventDefault();
        };
        element.ondrop = (ev) => {
          ev.preventDefault();
          const data = ev.dataTransfer.getData('text/plain');
          const other = document.getElementById(data);
    
          this._OnItemDropped(other, element);
        };
      }

      for (let k in this._inventory) {
        _SetupElement(k);
      }
    }

    _OnItemDropped(oldElement, newElement) {
      const oldItem = this._inventory[oldElement.id];
      const newItem = this._inventory[newElement.id];

      const oldValue = oldItem.value;
      const newValue = newItem.value;

      this._SetItemAtSlot(oldElement.id, newValue);
      this._SetItemAtSlot(newElement.id, oldValue);

      if (newItem.type == 'equip') {
        this.Broadcast({
          topic: 'inventory.equip',
          value: oldValue,
          added: false,
        });
      }
    }

    _SetItemAtSlot(slot, itemName) {
      const div = document.getElementById(slot);
      const obj = this.FindEntity(itemName);
      if (obj) {
        const item = obj.GetComponent('InventoryItem');
        const path = './resources/icons/weapons/' + item.RenderParams.icon;
        div.style.backgroundImage = "url('" + path + "')";
      } else {
        div.style.backgroundImage = '';
      }
      this._inventory[slot].value = itemName;
    }

    _OnInventoryAdded(msg) {
      for (let k in this._inventory) {
        if (!this._inventory[k].value && this._inventory[k].type == 'inventory') {
          this._inventory[k].value = msg.value;
          msg.added = true;

          this._SetItemAtSlot(k, msg.value);
  
          break;
        }
      }
    }

    GetItemByName(name) {
      for (let k in this._inventory) {
        if (this._inventory[k].value == name) {
          return this.FindEntity(name);
        }
      }
      return null;
    }
  };


  class InventoryItem extends entity.Component {
    constructor(params) {
      super();
      this._params = params;
    }

    InitComponent() {}

    get Params() {
      return this._params;
    }

    get RenderParams() {
      return this._params.renderParams;
    }
  };

  
  return {
      InventoryController: InventoryController,
      InventoryItem: InventoryItem,
  };
})();