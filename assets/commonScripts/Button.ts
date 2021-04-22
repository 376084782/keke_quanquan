import AudioPlayer from "./core/AudioPlayer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Button extends cc.Component {
  @property(cc.SpriteFrame)
  skinNormal: cc.SpriteFrame = null;

  @property(cc.SpriteFrame)
  skinDisabled: cc.SpriteFrame = null;

  @property(cc.Label)
  txtTime: cc.Label = null;
  // onLoad () {}
  sec = 0;
  startCountDown(sec) {
    this.disabled = true;
    this.sec = sec;
    this.tickerTimeDown();
    this.unschedule(this.tickerTimeDown);
    this.schedule(this.tickerTimeDown, 1, sec);
  }
  tickerTimeDown() {
    if (!this.txtTime) {
      return;
    }
    this.txtTime.node.active = true;
    this.txtTime.string = `${this.sec}s`;
    this.sec--;
    if (this.sec <= 0) {
      this.txtTime.node.active = false;
      this.disabled = false;
    }
  }

  _disabled: boolean = false;
  @property
  set disabled(flag) {
    this._disabled = flag;
    this.setSkin();
  }
  get disabled() {
    return this._disabled;
  }
  onLoad() {
    if (this.txtTime) {
      this.txtTime.node.active = false;
    }
    this.disabled = false;
  }
  setSkin() {
    let sp = this.getComponent(cc.Sprite);
    if (this._disabled && this.skinDisabled) {
      sp.spriteFrame = this.skinDisabled;
    }
    if (!this._disabled && this.skinNormal) {
      sp.spriteFrame = this.skinNormal;
    }
  }
  start() {
    this.node.on(
      cc.Node.EventType.TOUCH_START,
      e => {
        AudioPlayer.playEffectByUrl("sound/btn", false);
        cc.tween(this.node)
          .to(0.15, { scaleX: 1.1, scaleY: 1.1 })
          .start();
      },
      this
    );
    this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.doAtCancel, this);
    this.node.on(cc.Node.EventType.TOUCH_END, this.doAtCancel, this);
  }
  doAtCancel() {
    cc.tween(this.node)
      .to(0.15, { scaleX: 1, scaleY: 1 })
      .start();
  }

  // update (dt) {}
}
