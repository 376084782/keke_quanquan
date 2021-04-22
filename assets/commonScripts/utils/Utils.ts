import { ajaxUrl } from "../config/CustomConfig";
import PromiseUtil from "./PromiseUtil";
import Toast from "../Toast";

// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass("Utils")
export default class Utils {
  static loadingToast = false;
  static prefabToast = null;
  static async showToast(txt) {
    if (this.loadingToast) {
      PromiseUtil.wait(0.2).then(e => {
        this.showToast(txt);
      });
      return;
    }
    if (!this.prefabToast) {
      this.loadingToast = true;
      this.prefabToast = await Utils.load("common/toast", cc.Prefab);
      this.loadingToast = false;
    }
    let toast = cc.instantiate(this.prefabToast) as cc.Node;
    let ctr = toast.getComponent(Toast);
    ctr.setData(txt);
    cc.director
      .getScene()
      .getChildByName("Canvas")
      .addChild(toast);
    cc.tween(toast)
      .set({
        y: -200,
        opacity: 0
      })
      .to(0.2, { y: -150, opacity: 255 })
      .delay(1)
      .to(0.2, {
        y: -200,
        opacity: 0
      })
      .start();
  }

  static browserVersions() {
    let u = window.navigator.userAgent;
    return {
      trident: u.indexOf("Trident") > -1, // IE内核
      presto: u.indexOf("Presto") > -1, // opera内核
      webKit: u.indexOf("AppleWebKit") > -1, // 苹果、谷歌内核
      gecko: u.indexOf("Gecko") > -1 && u.indexOf("KHTML") === -1, // 火狐内核
      mobile: !!u.match(/AppleWebKit.*Mobile.*/), // 是否为移动终端
      ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), // ios终端
      android: u.indexOf("Android") > -1 || u.indexOf("Adr") > -1, // android终端
      iPhone: u.indexOf("iPhone") > -1, // 是否为iPhone或者QQHD浏览器
      iPad: u.indexOf("iPad") > -1, // 是否iPad
      webApp: u.indexOf("Safari") === -1, // 是否web应该程序，没有头部与底部
      weixin: u.indexOf("MicroMessenger") > -1 // 是否微信
    };
  }

  // static show

  static playSound(url) {
    return new Promise(rsv => {
      cc.resources.load(url, cc.AudioClip, (err, res: cc.AudioClip) => {
        let audio = cc.audioEngine.play(res, false, 1);
        rsv(audio);
      });
    });
  }
  static async asyncByTime(time) {
    return new Promise(rsv => {
      setTimeout(() => {
        rsv();
      }, time);
    });
  }
  static throttle(func, delay) {
    var prev = Date.now();
    return function() {
      var context = this;
      var args = arguments;
      var now = Date.now();
      if (now - prev >= delay) {
        func.apply(context, args);
        prev = Date.now();
      }
    };
  }
  static getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      if (pair[0] == variable) {
        return pair[1];
      }
    }
    return false;
  }
  static goScene(url) {
    return new Promise(rsv => {
      cc.director.loadScene(url, (err, scene) => {
        rsv();
      });
    });
    // cc.tween(self)
    //   .to(0.2, { opacity: 0 })
    //   .start();
  }
  static getPrefab(addres: string) {
    return new Promise(rsv => {
      cc.resources.load(addres, cc.Prefab, (err, res) => {
        rsv(res);
      });
    });
  }
  static setSpFont(container: cc.Label, addres: string) {
    return new Promise((rsv, rej) => {
      cc.resources.load(addres, cc.BitmapFont, (err, spFrame) => {
        container.font = spFrame as cc.BitmapFont | null;
        rsv();
      });
    });
  }

  static setSpImgFromNet(container: cc.Sprite, addres: string) {
    return new Promise((rsv, rej) => {
      cc.loader.load(addres, (err, texture: any) => {
        var frame = new cc.SpriteFrame(texture);
        container.spriteFrame = frame as cc.SpriteFrame | null;
        rsv();
      });
    });
  }
  static async load(addres, type) {
    return new Promise(rsv => {
      cc.resources.load(addres, type, (err, res) => {
        rsv(res);
      });
    });
  }
  static setSpImg(container: cc.Sprite, addres: string) {
    return new Promise((rsv, rej) => {
      if (!addres) {
        container.spriteFrame = null;
        rsv();
      } else {
        cc.resources.load(addres, cc.SpriteFrame, (err, spFrame) => {
          if (container && container.isValid && spFrame) {
            container.spriteFrame = spFrame as cc.SpriteFrame | null;
          }
          rsv();
        });
      }
    });
  }
  static doAjax({ url = "", data = {}, method = "get" }) {
    method = method.toLowerCase();
    // 测试地址
    // let host = "http://localhost:3000";
    let host = ajaxUrl;
    if (url.indexOf("http") == -1) {
      url = host + url;
    }
    return new Promise((rsv, rej) => {
      let request = new XMLHttpRequest();
      request.timeout = 20000;
      request.onreadystatechange = e => {
        if (
          request.readyState == 4 &&
          request.status >= 200 &&
          request.status < 400
        ) {
          var response = request.responseText;
          let res: any = {};
          if (response.indexOf("{") > -1) {
            res = JSON.parse(response);
          } else {
            res = response;
          }
          if (res.code == 0) {
            rsv(res.data);
          } else {
            rej(res.message);
          }
        }
      };
      request.onerror = e => {
        console.error("网络错误", e);
        rej();
      };
      let dataNew = Object.assign({}, data);
      let dataStr = "";
      for (let key in dataNew) {
        dataStr += `${key}=${dataNew[key]}&`;
      }
      if (method == "post") {
        request.open("post", url);
        request.setRequestHeader("Content-Type", "application/json");
        request.send(JSON.stringify(dataNew));
      } else {
        request.open("get", url);
        request.send(null);
      }
    });
  }
}

window["Utils"] = Utils;
