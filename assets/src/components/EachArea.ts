import Utils from "../../commonScripts/utils/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export class EachArea extends cc.Component {
  @property([cc.Sprite])
  quanList: cc.Sprite[] = [];

  @property({ type: cc.Node })
  dingzi: cc.Node = null;

  datasource: number[] = [0, 0, 0];
  //   是否显示中间的柱子
  _showCenter = false;

  @property({ type: cc.Boolean })
  set showCenter(val: boolean) {
    this._showCenter = val;
    this.dingzi.active = val;
  }
  get showCenter() {
    return this._showCenter;
  }

  setData(colorList: Array<number>) {
    colorList.forEach((color, idx) => {
      this.addQuan(idx, color);
    });
    this.datasource = colorList;
  }
  addQuan(type: number, color: number) {
    let spQuan = this.quanList[type];
    if (color == 0) {
      spQuan.node.active = false;
    } else {
      spQuan.node.active = true;
      let typeMap = ["xiao", "zhong", "da"];
      let sp = spQuan.getComponent(cc.Sprite) as cc.Sprite;
      sp.trim = false;
      sp.sizeMode = cc.Sprite.SizeMode.RAW;
      Utils.setSpImg(sp, `quan/${typeMap[type]}${color}`);
    }
  }

  start() {
    // Your initialization goes here.
    // this.addQuan(1, 1);
  }

  // update (deltaTime: number) {
  //     // Your update function goes here.
  // }
}
