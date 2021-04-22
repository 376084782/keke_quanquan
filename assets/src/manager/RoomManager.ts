import SocketManager from "./SocketManager";
import Utils from "../../commonScripts/utils/Utils";
export default class RoomManager {
  static get userOppo() {
    let dataSelf = this.dataSelf;
    if (dataSelf.belong == 1) {
      return this.listBlue[0];
    } else {
      return this.listRed[0];
    }
  }
  static roundPeople = 10;
  static getNumByUserId(userId) {
    let dataUser = RoomManager.userList.find(e => e.userId == userId);
    let idx = RoomManager.userList.indexOf(dataUser);
    return idx + 1;
  }
  static get canPlay() {
    let dataSelf = this.userList.find(
      (item: any) => item.userId == this.userId
    );
    return (
      dataSelf && dataSelf.userId == this.currentUser && !dataSelf.isAutoPlay
    );
  }
  static get dataSelf() {
    let dataSelf = this.userList.find(
      (item: any) => item.userId == this.userId
    );
    return dataSelf;
  }
  static currentUser = 0;
  static leftSec = 0;
  static get inGame() {
    let flagInGame = !!this.userList.find(
      (item: any) => item.userId == this.userId
    );
    return flagInGame;
  }
  static listRed = [];
  static listBlue = [];
  static get userList() {
    return this.listRed.concat(this.listBlue);
  }
  static get isApp() {
    return +Utils.getQueryVariable("test") != 2;
  }
  static hideLoading() {
    if (!this.isApp) {
      return;
    }
    kk.H5LoadingSuccess();
  }
  static ruleOpened = false;
  static get env() {
    return +Utils.getQueryVariable("test");
  }
  static connect = false;
  static async doInit() {
    return new Promise(rsv => {
      this.isHost = !!+Utils.getQueryVariable("isHost");
      rsv(null);
    });
  }
  static _isHost = false;
  static get isHost() {
    return this._isHost;
  }
  static set isHost(flag) {
    if (flag != this.isHost) {
      this._isHost = flag;
    }
  }
  static get userId() {
    return +Utils.getQueryVariable("userId") || 1;
  }
  static get roomId() {
    return +Utils.getQueryVariable("roomId") || 1;
  }
  static init(isHost = this.isHost) {
    this.isHost = isHost;
    SocketManager.sendMessage("joinRoom", {
      isHost: isHost
    });
  }

  static getGameInfoByUserId(userId) {
    let dataUser = RoomManager.userList.find(e => e.userId == userId);
    return dataUser;
  }
}
window["RoomManager"] = RoomManager;
