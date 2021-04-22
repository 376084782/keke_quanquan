import Progress from "../../commonScripts/Progress";
import SceneNavigator from "../../commonScripts/core/SceneNavigator";
import SocketManager from "../manager/SocketManager";
import RoomManager from "../manager/RoomManager";
import AudioPlayer from "../../commonScripts/core/AudioPlayer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SceneLoading extends cc.Component {
  @property(Progress)
  prg: Progress = null;

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() {
    RoomManager.hideLoading()
    cc.resources.loadDir(
      "/",
      (finish, total1) => {
        console.log("加载中...", ((finish / total1) * 100).toFixed(2));
        this.prg.progress = finish / total1;
      },
      async e => {
        AudioPlayer.playMusicByUrl("sound/bgm");
        await RoomManager.doInit();
        // GameManager.doInit();
        SocketManager.init();
      }
    );
  }

  // update (dt) {}
}
