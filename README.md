## 引擎使用
cocos creator 2.4.3
引擎使用详见cocos官网
## 发布说明
1. 检查配置文件ws指向 build/web-mobile/index.html下配置
```
  window.kkUrlConfig = {
    isApp: true,
    wsHost: 'wss://ztaudio-roomgame.qianyancm.com:3002',
    testHost: 'ws://39.101.162.107:3001'
    // testHost: 'ws://localhost:3001'
  }
``` 
2. 打包后文件位置：build/web-mobile 发布到静态资源服务器

## 文件说明
-assets
  -commonScripts 通用脚本文件
  -design 设计稿
  -libs 三方库
  -resources 游戏资源
    -animate 动画资源
    -font 字体资源
    -prefab 预设
    -... 其他按照页面功能区分的一些资源
  -src 游戏脚本
    -components 组件
    -manager 数据控制类
    -modal 弹窗相关
    -scene 场景相关
  Interface.ts 公共接口声明