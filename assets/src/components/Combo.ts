import Utils from "../../commonScripts/utils/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Combo extends cc.Component {
  @property({ type: cc.Label })
  spNum: cc.Label = null;

  @property({ type: sp.Skeleton })
  animate: sp.Skeleton = null;

  onLoad() {}
  start() {}

  showNum(num: number) {
    this.spNum.string = "" + num;
    this.spNum.node.scale = 0;
    this.spNum.node.opacity = 255;
    this.animate.setAnimation(0, "combo", false);
    // todo:时间稍微有点对不齐，考虑一下怎么解决
    cc.tween(this.spNum.node)
      .to((1 / 30) * 6, {
        scale: 1
      })
      .delay((1 / 30) * 2)
      .to((1 / 30) * 9, { opacity: 0 })
      .start();
  }
  // update (dt) {}
}
