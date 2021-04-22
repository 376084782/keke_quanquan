import ListRender from "../../commonScripts/ListRender";
import EventManager from "../../commonScripts/core/EventManager";
import RoomManager from "../manager/RoomManager";
import SocketManager from "../manager/SocketManager";
import GameManager from "../manager/GameManager";
import Utils from "../../commonScripts/utils/Utils";
import AudioPlayer from "../../commonScripts/core/AudioPlayer";

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class SceneStart extends cc.Component {
  @property(cc.Node)
  btn: cc.Node = null;

  @property(ListRender)
  listAvatar: ListRender = null;

  // LIFE-CYCLE CALLBACKS:

  async onLoad() {
    this.listAvatar.renderHandler = async (cell, data, idx) => {
      cell.x = idx * 120;
      cell.y = 0;
      let iconCheck = cell.getChildByName("iconCheck");
      let avatarCliper = cell.getChildByName("avatar");
      let avatarNode = avatarCliper.getChildByName("inner") as cc.Node;
      let avatar = avatarNode.getComponent(cc.Sprite);
      if (data.blank) {
        avatarNode.active = false;
        iconCheck.active = false;
      } else {
        avatarNode.active = true;
        iconCheck.active = true;
        Utils.setSpImgFromNet(avatar, data.avatar);
      }
    };
  }

  start() {
    this.listen();
    this.updateBtn();
    this.setAvatarList();
  }
  setAvatarList() {
    this.listAvatar.listData = RoomManager.userList
      .concat([{ blank: true }, { blank: true }])
      .slice(0, 2);
    this.listAvatar.node.width = (this.listAvatar.listData.length - 1) * 120;
  }
  listen() {
    EventManager.on("game/updateUserList", e => {
      this.updateBtn();
      this.setAvatarList();
    });
    this.btn.on(
      cc.Node.EventType.TOUCH_END,
      e => {
        let isHost = RoomManager.isHost;
        let isInGame = RoomManager.inGame;
        if (isHost) {
          if (isInGame) {
            SocketManager.sendMessage("startGame", {
              gameType: GameManager.gameType
            });
          } else {
            SocketManager.sendMessage("joinGame", {
              roomId: RoomManager.roomId
            });
          }
        } else {
          if (isInGame) {
            SocketManager.sendMessage("exitRoom");
          } else {
            SocketManager.sendMessage("joinGame", {
              roomId: RoomManager.roomId
            });
          }
        }
      },
      this
    );
  }
  async updateBtn() {
    let bg = this.btn.getComponent(cc.Sprite);
    let nodeTxt = this.btn.getChildByName("txt");
    let txt = nodeTxt.getComponent(cc.Label);
    let isHost = RoomManager.isHost;
    let isInGame = RoomManager.inGame;
    let bgSkin = `img/btnYellow`;
    if (isHost) {
      if (isInGame) {
        bgSkin = `img/btnBlue`;
        txt.string = "开始";
      } else {
        bgSkin = `img/btnYellow`;
        txt.string = "准备";
      }
    } else {
      if (isInGame) {
        bgSkin = `img/btnBlue`;
        txt.string = "退出";
      } else {
        bgSkin = `img/btnYellow`;
        txt.string = "准备";
      }
    }
    bg.spriteFrame = (await Utils.load(
      bgSkin,
      cc.SpriteFrame
    )) as cc.SpriteFrame;
  }

  // update (dt) {}
}
