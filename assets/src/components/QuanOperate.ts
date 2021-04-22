import { EachArea } from "./EachArea";
import Utils from "../../commonScripts/utils/Utils";
import SocketManager from "../manager/SocketManager";
import EventManager from "../../commonScripts/core/EventManager";
import RoomManager from "../manager/RoomManager";
import AudioPlayer from "../../commonScripts/core/AudioPlayer";

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class QuanOperate extends cc.Component {
  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  get isSelf() {
    return this.userId == RoomManager.userId;
  }
  userId = -1;

  @property({ type: cc.Node })
  wrapQuan: cc.Node = null;

  @property({ type: EachArea })
  ctrQuan: EachArea = null;

  movingTarget!: cc.Node;
  updateLocation = Utils.throttle(e => {
    // return;
    if (!this.movingTarget) {
      return;
    }
    let pos = this.movingTarget.position;
    SocketManager.sendGameMessage("updateLocation", {
      x: pos.x,
      y: pos.y,
      active: this.movingTarget.active
    });
  }, 60);
  start() {
    this.listen();
  }

  doUpdateLocation(e) {
    let { x, y, active, userId } = e;
    if (this.userId != userId || userId == RoomManager.userId) {
      return;
    }
    console.log("update", userId);
    if (!this.movingTarget) {
      this.movingTarget = cc.instantiate(this.wrapQuan);
      this.node.addChild(this.movingTarget);
    }
    let ctrNew = this.movingTarget.getComponent(EachArea) as EachArea;
    ctrNew.setData(this.ctrQuan.datasource);
    this.movingTarget.opacity = 180;
    this.movingTarget.scale = 1;
    this.movingTarget.position = new cc.Vec3(x, y);
    if (active) {
      this.movingTarget.active = true;
      this.wrapQuan.active = false;
    } else {
      this.movingTarget.active = false;
      this.wrapQuan.active = true;
    }
  }
  setData(colorList: number[]) {
    this.ctrQuan.setData(colorList);
    if (this.movingTarget) {
      let ctr = this.movingTarget.getComponent(EachArea);
      ctr.setData(colorList);
    }
  }
  flagCanMove = true;
  listen() {
    this.node.on(cc.Node.EventType.TOUCH_START, (e: cc.Event.EventTouch) => {
      if (!this.flagCanMove || !this.isSelf) {
        return;
      }
      this.flagCanMove = false;
      if (!this.movingTarget) {
        this.movingTarget = cc.instantiate(this.wrapQuan);

        this.node.addChild(this.movingTarget);
      }
      AudioPlayer.playEffectByUrl("sound/dismiss1");
      let ctrNew = this.movingTarget.getComponent(EachArea) as EachArea;
      ctrNew.setData(this.ctrQuan.datasource);
      this.wrapQuan.active = false;
      this.movingTarget.active = true;
      this.movingTarget.scale = 1;
      this.movingTarget.position = this.wrapQuan.position;
    });

    (<cc.Node>this.node).on(
      cc.Node.EventType.TOUCH_MOVE,
      (e: cc.Event.EventTouch) => {
        if (!this.isSelf) {
          return;
        }
        if (this.movingTarget && this.movingTarget.active) {
          let posGlobal1 = e.touch.getLocation();
          let posLocal = this.node.convertToNodeSpaceAR(posGlobal1);
          this.movingTarget.position = new cc.Vec3(posLocal.x, posLocal.y);
          this.updateLocation();
        }
      }
    );
    (<cc.Node>this.node).on(cc.Node.EventType.TOUCH_END, this.moveEnd, this);
    (<cc.Node>this.node).on(cc.Node.EventType.TOUCH_CANCEL, this.moveEnd, this);

    EventManager.on("game/moveQuanBack", this.moveQuanBack, this);
    EventManager.on("game/doUpdateLocation", this.doUpdateLocation, this);
  }

  moveEnd(e: cc.Event.EventTouch) {
    if (this.movingTarget && this.movingTarget.active) {
      let posGlobal1 = e.touch.getLocation();
      this.node.emit(
        "moveEnd",
        posGlobal1,
        this.ctrQuan.datasource,
        this.userId
      );
    }
  }
  moveQuanBack(withAni = true, userId) {
    if (userId != this.userId) {
      return;
    }
    console.log("moveQuanBack", userId);
    if (this.movingTarget) {
      let ffCall = () => {
        this.flagCanMove = true;
        this.movingTarget.active = false;
        this.wrapQuan.active = true;
        this.updateLocation();
      };
      if (withAni) {
        AudioPlayer.playEffectByUrl("sound/dismiss1");
        cc.tween(this.movingTarget)
          .to(0.1, {
            x: this.wrapQuan.x,
            y: this.wrapQuan.y,
            scale: this.wrapQuan.scale
          })
          .call((e: any) => {
            ffCall();
          })
          .start();
      } else {
        ffCall();
      }
    }
  }
  // update (dt) {}
}
