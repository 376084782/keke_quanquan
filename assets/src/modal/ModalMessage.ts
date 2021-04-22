import { PopupBase } from "../../commonScripts/popups/PopupBase";
import SocketManager from "../manager/SocketManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends PopupBase {
  @property(cc.Node)
  btnSure: cc.Node = null;

  @property(cc.Node)
  btnCancel: cc.Node = null;

  @property(cc.Label)
  content: cc.Label = null;

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() {
    this.btnSure.on(cc.Node.EventType.TOUCH_END, this.onSure, this);
  }
  onSure() {}
  init(data: { onSure?; content }) {
    this.content.string = data.content;
    if (data.onSure) {
      this.onSure = data.onSure;
    }
  }

  // update (dt) {}
}
