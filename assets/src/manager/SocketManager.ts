import RoomManager from "./RoomManager";
import GameManager from "./GameManager";
import SceneNavigator from "../../commonScripts/core/SceneNavigator";
import { wsUrl } from "../../commonScripts/config/CustomConfig";
import EventManager from "../../commonScripts/core/EventManager";
import Utils from "../../commonScripts/utils/Utils";
import GameCtr from "./GameCtr";
import PopupManager from "../../commonScripts/core/PopupManager";

export default class SocketManager {
  static get io() {
    return window["io"];
  }
  static socket;
  static init() {
    if (this.socket) {
      return;
    }
    console.log("connect");

    let url =
      window["kkUrlConfig"][
        Utils.getQueryVariable("test") ? "testHost" : "wsHost"
      ];
    this.socket = this.io(url);
    this.listen();
  }
  static listen() {
    this.socket.on("connect", this.onConnect.bind(this));
    this.socket.on("message", this.onMessage);
  }
  static async onMessage(res) {
    let type = res.type;
    let data = res.data;
    if (type.indexOf("updateBoard") == -1) {
      console.log(res, "收到服务端消息");
      // alert(JSON.stringify(res));
    }
    switch (type) {
      case "goMicro": {
        RoomManager.isApp && kk.joinGameCallBack(RoomManager.userId);
        break;
      }
      case "resCloseRoom": {
        SceneNavigator.go("scene/start");
        break;
      }
      case "resResetGame": {
        // 离开房间
        SceneNavigator.go("scene/start");
        break;
      }
      case "resClearRoom": {
        SceneNavigator.go("scene/start");
        break;
      }
      case "resToast": {
        Utils.showToast(data.message);
        break;
      }
      case "resLeaveGame": {
        // 离开房间
        SceneNavigator.go("scene/start");
        break;
      }
      case "resUpdateUserList": {
        // 加入房间，切换按钮
        let { listBlue, listRed } = data.userList;
        RoomManager.listRed = listRed;
        RoomManager.listBlue = listBlue;
        EventManager.emit("game/updateUserList");
        break;
      }
      case "resUpdateHost": {
        RoomManager.isHost = data.hostId == RoomManager.userId;
        if (data.userId == RoomManager.userId) {
          EventManager.emit("game/updateUserList");
        }
        break;
      }
      case "reconnect": {
        RoomManager.connect = true;
        if (data.hostId) {
          RoomManager.isHost = data.hostId == RoomManager.userId;
        }
        RoomManager.roundPeople = data.roundPeople;
        if (data.isReconnect) {
          SocketManager.handleInitData(data);
          SceneNavigator.go("scene/game");
        } else {
          SceneNavigator.go("scene/start");
          if (!RoomManager.ruleOpened) {
            RoomManager.ruleOpened = true;
            // Laya.Scene.open("modal/modalRule.scene");
          }
        }
        break;
      }
      case "resJoinRoom": {
        if (data.gameStarting) {
          let gameMap = data.gameMap;
        }
        break;
      }
      case "quanquan/resStartGame": {
        SocketManager.handleInitData(data);
        SceneNavigator.go("scene/game");
        break;
      }
      case "quanquan/respPutQuan": {
        GameCtr.playerRings = data.playerRings;
        GameCtr.score = data.score;

        EventManager.emit("showBoardAddRing", data);
        EventManager.emit("updateRings");
        break;
      }
      case "quanquan/updateLocation": {
        EventManager.emit("game/doUpdateLocation", data);
        break;
      }
      case "quanquan/quanBack": {
        EventManager.emit("game/moveQuanBack", true, data.userId);
        break;
      }
      case "quanquan/result": {
        GameCtr.score = data.score;
        PopupManager.show("modal/ModalResult", data);
        break;
      }
    }
  }
  static handleInitData(data) {
    let gameData = data.gameData;
    GameCtr.score = gameData.score;
    GameCtr.playerRings = gameData.playerRings;
    GameCtr.dataList = gameData.dataList;
    GameCtr.startTime = data.startTime;
    GameCtr.maxSec = data.totalSec;
  }
  static sendMessage(type, data: any = {}) {
    data.userId = RoomManager.userId;
    data.roomId = RoomManager.roomId;
    data.gameType = GameManager.gameType;
    this.socket.emit("message", { type, data });
    console.log(type, data, "发送消息");
  }
  static sendGameMessage(type, data: any = {}) {
    type = GameManager.gameType + "/" + type;
    data.userId = RoomManager.userId;
    data.roomId = RoomManager.roomId;
    this.socket.emit("message", { type, data });
    console.log(type, data, "发送游戏内消息");
  }
  static async onConnect() {
    this.socket.emit("init", { userId: RoomManager.userId });
    RoomManager.init();
  }
}
window["SocketManager"] = SocketManager;
