import { PopupBase } from "../../commonScripts/popups/PopupBase";
import GameCtr from "../manager/GameCtr";
import SceneNavigator from "../../commonScripts/core/SceneNavigator";
import RoomManager from "../manager/RoomManager";
import Utils from "../../commonScripts/utils/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ModalResult extends PopupBase {
  @property([cc.Node])
  listAvatar: cc.Node[] = [];

  @property(cc.Node)
  btnAgain: cc.Node = null;

  @property(cc.Label)
  score: cc.Label = null;

  @property(cc.Sprite)
  spReason: cc.Sprite = null;

  @property(cc.SpriteFrame)
  imgReason1: cc.SpriteFrame = null;

  @property(cc.SpriteFrame)
  imgReason2: cc.SpriteFrame = null;
  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() {
    this.btnAgain.on(
      cc.Node.EventType.TOUCH_END,
      e => {
        SceneNavigator.go("scene/start");
      },
      this
    );
  }
  init(data) {
    this.score.string = "" + GameCtr.score;
    this.listAvatar.forEach((avatar, idx) => {
      let userInfo = RoomManager.userList[idx];
      let spName = avatar.getChildByName("name");
      let labelName = spName.getComponent(cc.Label);
      labelName.string = userInfo.nickname;
      let wrapAvatar = avatar.getChildByName("avatar");
      let avatarInner = wrapAvatar.getChildByName("inner");
      let imgAvatar = avatarInner.getComponent(cc.Sprite);
      Utils.setSpImgFromNet(imgAvatar, userInfo.avatar);
    });

    this.spReason.spriteFrame =
      data.reason == 1 ? this.imgReason1 : this.imgReason2;
  }

  // update (dt) {}
}
