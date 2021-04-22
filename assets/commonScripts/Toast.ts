const { ccclass, property } = cc._decorator;

@ccclass
export default class Toast extends cc.Component {
  @property(cc.Label)
  label: cc.Label = null;

  setData(txt) {
    this.label.string = txt;
  }
  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() {}

  // update (dt) {}
}
