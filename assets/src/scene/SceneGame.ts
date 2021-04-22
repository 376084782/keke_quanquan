import { DataDispelled } from "../Interface";
import GameCtr from "../manager/GameCtr";
import SocketManager from "../manager/SocketManager";
import EventManager from "../../commonScripts/core/EventManager";
import Utils from "../../commonScripts/utils/Utils";
import RoomManager from "../manager/RoomManager";
import SceneNavigator from "../../commonScripts/core/SceneNavigator";
import { EachArea } from "../components/EachArea";
import QuanOperate from "../components/QuanOperate";
import Combo from "../components/Combo";
import PopupManager from "../../commonScripts/core/PopupManager";
import AudioPlayer from "../../commonScripts/core/AudioPlayer";
const { ccclass, property } = cc._decorator;

@ccclass
export class SceneGame extends cc.Component {
  @property(cc.Sprite)
  imgClockWrap: cc.Sprite = null;

  @property(cc.Sprite)
  imgClockInner: cc.Sprite = null;

  @property(cc.SpriteFrame)
  imgClockInner1: cc.SpriteFrame = null;
  @property(cc.SpriteFrame)
  imgClockInner2: cc.SpriteFrame = null;

  @property(cc.SpriteFrame)
  imgClock1: cc.SpriteFrame = null;
  @property(cc.SpriteFrame)
  imgClock2: cc.SpriteFrame = null;

  @property(cc.Node)
  imgPrg: cc.Node = null;

  @property(cc.Prefab)
  prefabQuan: cc.Prefab = null;

  moveOffsetY = 70;

  set sec(val) {
    if (val < 0) {
      val = 0;
    }
    GameCtr.sec = val;
  }
  get sec() {
    return GameCtr.sec;
  }

  update() {
    // 计算本机时间和开始时间的差值得出当前秒数
    let timeNow = new Date().getTime();
    let sec = GameCtr.maxSec - Math.ceil((timeNow - GameCtr.startTime) / 1000);

    if (sec >= 0) {
      this.imgPrg.width =
        (352 * (GameCtr.maxSec - (timeNow - GameCtr.startTime) / 1000)) /
        GameCtr.maxSec;
      this.sec = sec;
      if (sec < 10) {
        this.imgClockInner.spriteFrame =
          sec % 2 == 0 ? this.imgClockInner1 : this.imgClockInner2;
        this.imgClockWrap.spriteFrame =
          sec % 2 == 0 ? this.imgClock1 : this.imgClock2;
      }
    }
  }

  map: EachArea[] = [];

  @property({ type: cc.Node })
  wrapInner: cc.Node = null;

  @property(QuanOperate)
  quanLeft: QuanOperate = null;

  @property(QuanOperate)
  quanRight: QuanOperate = null;

  @property(cc.Node)
  btnRule: cc.Node = null;

  @property(cc.Node)
  btnExit: cc.Node = null;

  @property(cc.Node)
  btnSound: cc.Node = null;
  start() {
    this.listen();
  }
  updateInfo(wrap: cc.Node, data: any) {
    let spName = wrap.getChildByName("name");
    let labelName = spName.getComponent(cc.Label);
    labelName.string = data.nickname;
    let wrapAvatar = wrap.getChildByName("avatar");
    let wrapAvatar1 = wrapAvatar.getChildByName("avatar");
    let avatarInner = wrapAvatar1.getChildByName("inner");
    let imgAvatar = avatarInner.getComponent(cc.Sprite);
    Utils.setSpImgFromNet(imgAvatar, data.avatar);
  }
  updateInfoList() {
    this.btnExit.active = RoomManager.isHost;
    this.updateInfo(this.quanLeft.node, RoomManager.listRed[0]);
    this.updateInfo(this.quanRight.node, RoomManager.listBlue[0]);
  }
  onEnable() {
    this.initQuan();
    this.updateRings();
    this.updateScore();
    this.updateInfoList();
  }
  updateRings() {
    for (let userId in GameCtr.playerRings) {
      let colorList = GameCtr.playerRings[userId];
      let userData = RoomManager.getGameInfoByUserId(userId);
      let targetQuan = userData.belong == 1 ? this.quanLeft : this.quanRight;
      targetQuan.setData(colorList);
      targetQuan.userId = +userId;
    }
  }
  flagCreatingOppo = false;
  onDestroy() {
    SceneNavigator;
  }
  playAniXiao(type, x, y, playSound = true) {
    if (playSound) {
      AudioPlayer.playEffectByUrl("sound/dismiss2");
    }
    // 方向 1本圈 2横 3竖 4左上到右下 5右上到左下
    let aniName = "";
    if (type == 1) {
      aniName = "dian" + (y * 3 + x + 1);
    } else if (type == 2) {
      aniName = "heng" + (y + 1);
    } else if (type == 3) {
      aniName = "shu" + (x + 1);
    } else if (type == 4) {
      aniName = "xie1";
    } else if (type == 5) {
      aniName = "xie2";
    }
    if (!aniName) {
      return false;
    }

    cc.resources.load("animate/taoquan", sp.SkeletonData, (err, data) => {
      let spNode = new cc.Node();
      spNode.parent = this.node;
      spNode.position = new cc.Vec3(0, -30);
      let spSke = spNode.addComponent(sp.Skeleton);
      spSke.premultipliedAlpha = true;
      spSke.skeletonData = data as sp.SkeletonData | null;
      spSke.setAnimation(0, aniName, false);
      spSke.setCompleteListener(e => {
        spNode.active = false;
        this.node.removeChild(spNode);
      });
    });
    return true;
  }
  listen() {
    this.btnSound.on(
      cc.Node.EventType.TOUCH_END,
      e => {
        PopupManager.show("modal/ModalSound");
      },
      this
    );
    this.btnExit.on(
      cc.Node.EventType.TOUCH_END,
      e => {
        PopupManager.show("modal/ModalMessage", {
          content: "是否确定退出游戏？",
          onSure() {
            SocketManager.sendMessage("resetGame", {});
          }
        });
      },
      this
    );
    this.btnRule.on(
      cc.Node.EventType.TOUCH_END,
      e => {
        PopupManager.show("modal/ModalRule");
      },
      this
    );
    EventManager.on(
      "updateRings",
      e => {
        this.updateRings();
      },
      this
    );
    this.quanLeft.node.on("moveEnd", this.moveEnd, this);
    this.quanRight.node.on("moveEnd", this.moveEnd, this);
    EventManager.on(
      "updateBoard",
      e => {
        this.resetBoard(GameCtr.dataList);
      },
      this
    );
    EventManager.on(
      "showCombo",
      e => {
        let count = e.currentTarget;
        this.showCombo(count);
      },
      this
    );
    EventManager.on("showBoardAddRing", this.showBoardAddRing, this);
  }
  updateScore() {
    let score = this.node.getChildByName("score");
    let spScore = score.getComponent(cc.Label);
    spScore.string = "" + GameCtr.score;
  }
  async showCombo(count) {
    AudioPlayer.playEffectByUrl("sound/combo");
    let spComboPrefab = (await Utils.getPrefab("prefab/combo")) as cc.Prefab;
    let spCombo = cc.instantiate(spComboPrefab);
    let scpCombo = spCombo.getComponent(Combo);
    this.node.addChild(spCombo);
    scpCombo.showNum(count);
  }
  showBoardAddRing({
    afterPutData,
    dataTarget,
    dispelledList,
    type,
    addScore = 0,
    comboCount,
    userId
  }) {
    EventManager.emit("game/moveQuanBack", false, userId);
    if (type != 0) {
      GameCtr.dataList = afterPutData;
      EventManager.emit("updateBoard");
      console.log(comboCount, "comboCount");
      dispelledList.forEach((dataDispelled: DataDispelled) => {
        this.playAniXiao(
          dataDispelled.dir,
          dataDispelled.x,
          dataDispelled.y,
          comboCount == 1
        );
      });

      // 单次消多行增加good提示
      if (dispelledList.length > 1) {
        let img = new cc.Node();
        let spImg = img.addComponent(cc.Sprite);
        Utils.setSpImg(spImg, "img/game/good");
        img.scale = 0.65;
        this.node.addChild(img);
        img.opacity = 0;
        img.y = 30;
        cc.tween(img)
          .to(0.2, { opacity: 255, y: 120 })
          .delay(1)
          .to(0.2, { opacity: 0, y: 30 })
          .call(e => {
            img.parent = null;
          })
          .start();
      } else if (dispelledList.length == 0) {
        AudioPlayer.playEffectByUrl("sound/gua");
      }
      // 加分显示
      if (!!addScore && dispelledList.length > 0) {
        let txt = new cc.Node();
        let spTxt = txt.addComponent(cc.Label);
        Utils.setSpFont(spTxt, "fnt/scoreadd");
        spTxt.fontSize = 100;
        spTxt.string = "+" + addScore;
        this.node.addChild(txt);
        txt.opacity = 0;
        let finalY = 305;
        txt.y = finalY;
        txt.x = -16;
        txt.anchorX = 0;
        cc.tween(txt)
          .delay(0.2)
          .to(0.2, { opacity: 255, y: finalY + 50 })
          .delay(0.6)
          .to(0.2, { opacity: 0, y: finalY })
          .call(e => {
            txt.parent = null;
          })
          .start();
      }

      if (comboCount > 1) {
        this.showCombo(comboCount);
      }
      this.updateScore();
    }
  }
  resetBoard(afterPutData: number[][][]) {
    afterPutData.forEach((dataRow, y) => {
      dataRow.forEach((colorList, x) => {
        this.map[y * 3 + x].setData(colorList);
      });
    });
  }
  flagCanMove = true;

  getItemByXY(x: number, y: number) {
    if (x >= 0 && x < 3 && y >= 0 && y < 3) {
      return this.map[3 * y + x];
    }
  }
  eachW!: number;
  eachH!: number;
  startX!: number;
  startY!: number;
  async initQuan() {
    let wrapInner = this.wrapInner as cc.Node;
    wrapInner.removeAllChildren();
    let w = wrapInner.width;
    let h = wrapInner.height;
    this.eachW = w / 3;
    this.eachH = h / 3;
    this.startX = -w / 2 + this.eachW / 2;
    this.startY = -h / 2 + this.eachH / 2;
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        let subNode = cc.instantiate(this.prefabQuan);
        wrapInner.addChild(subNode);
        subNode.position = new cc.Vec3(
          this.startX + x * this.eachW,
          this.startY + this.eachH * (2 - y)
        );
        let script = subNode.getComponent(EachArea) as EachArea;
        script.setData(GameCtr.dataList[y][x]);
        this.map[y * 3 + x] = script;
      }
    }
  }

  moveEnd(posGlobal1, dataQuan, userId) {
    let posLocal = this.node.convertToNodeSpaceAR(posGlobal1);
    let x = Math.floor(
      (posLocal.x - this.startX + this.eachW / 2) / this.eachW
    );
    let y =
      2 - Math.floor((posLocal.y - this.startY + this.eachH / 2) / this.eachH);
    let target = this.getItemByXY(x, y);
    if (
      target &&
      Math.abs(posLocal.x - target.node.x) < 100 &&
      Math.abs(posLocal.y + this.moveOffsetY - target.node.y) < 100
    ) {
      // 如果有新的目标，判断是否可以放上去，可以放则更新这个圈，否则动画过度到原位置
      let data = GameCtr.addQuan(x, y, dataQuan);
      if (data.type != 0) {
        SocketManager.sendGameMessage("putQuan", {
          rings: dataQuan,
          y: y,
          x: x
        });
      } else {
        EventManager.emit("game/moveQuanBack", true, userId);
      }
    } else {
      EventManager.emit("game/moveQuanBack", true, userId);
    }
  }
  // update (deltaTime: number) {
  // }
}
