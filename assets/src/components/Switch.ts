const { ccclass, property } = cc._decorator;

@ccclass
export default class Switch extends cc.Component {
  @property(cc.SpriteFrame)
  img1: cc.SpriteFrame = null;

  @property(cc.SpriteFrame)
  img2: cc.SpriteFrame = null;

  @property(cc.Sprite)
  img: cc.Sprite = null;

  _flag: boolean = false;
  @property
  set flag(flag) {
    this._flag = flag;
    this.img.spriteFrame = flag ? this.img1 : this.img2;
    this.node.emit('trigger')
  }
  get flag() {
    return this._flag;
  }
  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() {
    this.node.on(
      cc.Node.EventType.TOUCH_END,
      e => {
        this.flag = !this.flag;
      },
      this
    );
  }

  // update (dt) {}
}
