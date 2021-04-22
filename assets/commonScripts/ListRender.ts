// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class ListRender extends cc.Component {
  spList: cc.Node[] = [];

  @property
  spaceBetween: number = 4;

  @property(cc.Node)
  cellPrefab: cc.Node = null;

  selectedIdx = -1;

  _listData: any[] = [];
  set listData(list) {
    this._listData = list;
    this.refresh();
  }
  get listData() {
    return this._listData;
  }
  renderHandler(cell, data, idx) {}

  refresh() {
    let list = this.listData;
    list.forEach((conf, idx) => {
      let targetSp = this.spList[idx];
      if (!targetSp) {
        this.spList[idx] = cc.instantiate(this.cellPrefab);
        targetSp = this.spList[idx];
        this.node.addChild(targetSp);
      }
      targetSp.y = -(
        idx * (targetSp.height + this.spaceBetween) -
        this.spaceBetween
      );
      this.node.height = -targetSp.y + targetSp.height;
      targetSp.active = true;
      this.renderHandler(targetSp, conf, idx);
    });
    if (this.spList.length > list.length) {
      for (let i = list.length; i < this.spList.length; i++) {
        let spItem = this.spList[i];
        spItem.active = false;
      }
    }
  }
  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    if (this.cellPrefab.parent) {
      this.node.removeChild(this.cellPrefab);
    }
    this.node.removeAllChildren();
  }

  start() {}

  // update (dt) {}
}
