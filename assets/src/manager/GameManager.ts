import SocketManager from "./SocketManager";
import RoomManager from "./RoomManager";

export default class GameManager {
  static resetAll() {
    RoomManager.userList.forEach(item => {
      item.isOut = false;
    });
    this.pkList = [];
    this.lastOutUser = {};
    this.step = -1;
    this.currentUser = {};
    this.votedList = [];
  }
  static pkList = [];
  static lastOutUser: any = {};
  static gameType = "quanquan";
  static step = -1;
  static currentUser: any = {};
  static votedList = [];
  static reqVote(spyUserId) {
    SocketManager.sendGameMessage("reqVote", { spyUserId });
  }
  static reqNextSpeak() {
    SocketManager.sendGameMessage("reqNextSpeak");
  }
  static get countSpy() {
    return RoomManager.userList.filter(item => item.isSpy && !item.isOut)
      .length;
  }
  static get countNormal() {
    return RoomManager.userList.filter(item => !item.isSpy && !item.isOut)
      .length;
  }
}
