/*
 * @Author: your name
 * @Date: 2020-04-29 11:26:32
 * @LastEditTime: 2020-04-29 11:27:52
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \rshare\demo.js
 */
var kk = (function (w) {

  function Tool() {

  }

  //@desc是否是苹果移动端
  //@return Boolean
  Tool.prototype.isIos = (function () {
    return !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
  })()

  //@desc 是否是安卓移动端
  //@return Boolean
  Tool.prototype.isAndroid = (function () {
    return navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Linux') > -1;
  })()

  Tool.prototype.joinGameCallBack = function (user_id) {
    var data = {
      user_id: user_id
    }
    if (this.isIos) {

      window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.H5LoadingSuccess && window.webkit.messageHandlers.joinGameCallBack.postMessage(data);
    } else if (this.isAndroid) {
      window['keke'] && keke.joinGameCallBack(user_id);
    }
  }

  Tool.prototype.H5LoadingSuccess = function () {
    if (this.isIos) {
      window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.H5LoadingSuccess && window.webkit.messageHandlers.H5LoadingSuccess.postMessage('');
    } else if (this.isAndroid) {
      window['keke'] && keke.H5LoadingSuccess();
    }
  }
  Tool.prototype.saveImageToLocal = function (imgData) {
    if (this.isIos) {
      window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.saveImageToLocal && window.webkit.messageHandlers.saveImageToLocal.postMessage(imgData);
    } else if (this.isAndroid) {
      window['keke'] && keke.saveImageToLocal(imgData);
    }
  }

  return new Tool();
})(window)