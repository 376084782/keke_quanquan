import { PopupBase } from "../../commonScripts/popups/PopupBase";
import Switch from "../components/Switch";
import AudioPlayer from "../../commonScripts/core/AudioPlayer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ModalSound extends PopupBase {
  @property(Switch)
  switchSound: Switch = null;

  @property(Switch)
  switchEffect: Switch = null;

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() {
    this.switchEffect.flag = AudioPlayer.effectVolume > 0;
    this.switchSound.flag = AudioPlayer.musicVolume > 0;
    this.switchEffect.node.on("trigger", e => {
      AudioPlayer.setEffectVolume(this.switchEffect.flag ? 1 : 0);
    });
    this.switchSound.node.on("trigger", e => {
      AudioPlayer.setMusicVolume(this.switchSound.flag ? 1 : 0);
    });
  }

  // update (dt) {}
}
