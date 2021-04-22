import { DataDispelled, DataAddedReturn, DataCircle } from "../Interface";

export default class GameCtr {
  static playerRings = {};
  static sec = 120;
  static maxSec=120;
  static startTime = 1615816363239;
  /**
   *
   * @param x
   * @param y
   * @param colorList
   * @returns type 0不可消除 1可以消除
   * @returns afterPutData 新地图数据
   * @returns dataTarget 目标圈
   * @returns dispelledList 消除目标列表
   *
   */
  static addQuan(
    x: number,
    y: number,
    colorList: Array<number>
  ): DataAddedReturn {
    let dispelledList: DataDispelled[] = [];
    // 判断这个格子能不能放
    let afterPutData = this.putQuan(x, y, colorList);
    if (!afterPutData) {
      return {
        type: 0
      };
    }
    // 强制类型转换
    afterPutData = <number[][][]>afterPutData;
    // 获取当前格子数据
    let dataTarget = afterPutData[y][x];
    // 检查当前格子，是否三色同时消除
    let flagSameInGrid = this.checkSameInGrid(x, y, afterPutData);
    if (flagSameInGrid) {
      let typeData: DataDispelled = {
        dir: 1,
        x,
        y,
        list: []
      };
      // 当前格子三个都需要消除
      dataTarget.forEach((color, type) => {
        let data2: DataCircle = { x, y, circlePos: type, color };
        typeData.list.push(data2);
      });
      dispelledList.push(typeData);
    }

    let listWillCheck: {
      x: number;
      y: number;
      dir: number;
      list: { x: number; y: number; circleList: number[] }[];
    }[] = [];
    // 获取所在的横向三格
    listWillCheck.push({
      x: 1,
      y: y,
      dir: 2,
      list: [
        { circleList: afterPutData[y][0], x: 0, y },
        { circleList: afterPutData[y][1], x: 1, y },
        { circleList: afterPutData[y][2], x: 2, y }
      ]
    });
    // 获取所在的纵向三格
    listWillCheck.push({
      x: x,
      y: 1,
      dir: 3,
      list: [
        { circleList: afterPutData[0][x], x, y: 0 },
        { circleList: afterPutData[1][x], x, y: 1 },
        { circleList: afterPutData[2][x], x, y: 2 }
      ]
    });
    // 左上到右下
    if (x == y) {
      listWillCheck.push({
        x: 1,
        y: 1,
        dir: 4,
        list: [
          { circleList: afterPutData[0][0], x: 0, y: 0 },
          { circleList: afterPutData[1][1], x: 1, y: 1 },
          { circleList: afterPutData[2][2], x: 2, y: 2 }
        ]
      });
    }
    // 右上到左下
    if (x == 2 - y) {
      listWillCheck.push({
        x: 1,
        y: 1,
        dir: 5,
        list: [
          { circleList: afterPutData[0][2], x: 2, y: 0 },
          { circleList: afterPutData[1][1], x: 1, y: 1 },
          { circleList: afterPutData[2][0], x: 0, y: 2 }
        ]
      });
    }
    listWillCheck.forEach(dataWillCheck => {
      // 循环检查，能消除的颜色消除并返回对应位置
      for (let color = 1; color <= this.maxColor; color++) {
        let list3: number[][] = dataWillCheck.list.map(item => item.circleList);
        if (this.checkHaveNumInList(list3, color)) {
          let dispelledData = dispelledList.find(
            item => item.x == dataWillCheck.x && item.y == dataWillCheck.y
          ) as DataDispelled;
          if (!dispelledData) {
            dispelledData = {
              x: dataWillCheck.x,
              y: dataWillCheck.y,
              dir: dataWillCheck.dir,
              list: []
            };
            dispelledList.push(dispelledData);
          }
          // 在待检查的列中遍历每一格的数据
          dataWillCheck.list.forEach(dataGrid => {
            // 在每格中查到对应颜色的圈，将对应的圈数据返回
            dataGrid.circleList.forEach((colorCircle, idx) => {
              if (colorCircle == color) {
                dispelledData.list.push({
                  x: dataGrid.x,
                  y: dataGrid.y,
                  color,
                  circlePos: idx
                });
              }
            });
          });
        }
      }
    });

    // 根据结果消除对应的所有同色
    dispelledList.forEach((dataDispelled: DataDispelled) => {
      dataDispelled.list.forEach((dataCircle: DataCircle) => {
        afterPutData = <number[][][]>afterPutData;
        afterPutData[dataCircle.y][dataCircle.x][dataCircle.circlePos] = 0;
      });
    });

    return {
      dispelledList,
      afterPutData,
      dataTarget,
      type: 1
    };
  }
  static lastQuan = [];
  static lastQuanOppo = [];
  static score = 0;
  static comboCount = 0;
  // 红黄蓝绿紫
  static maxColor = 5;
  static dataList: Array<Array<Array<number>>> = [];
  static resetAll() {
    this.comboCount = 0;
    this.sec = 120;
    this.playerRings = {};
  }
  static initDataList() {
    this.dataList = [];
    for (let m = 0; m < 3; m++) {
      let dataRow: Array<Array<number>> = [];
      for (let m = 0; m < 3; m++) {
        dataRow[m] = [0, 0, 0];
      }
      this.dataList[m] = dataRow;
    }
    this.score = 0;
  }
  static getRandomColor() {
    return Math.floor(Math.random() * this.maxColor);
  }
  static createQuan() {
    // todo:根据现在还能摆放的剩下的位置生成一个新圈
    let arr = [];
    let quan1 = 1 + Math.floor(Math.random() * this.maxColor);
    let pos = Math.floor(Math.random() * 3);
    arr[pos] = quan1;
    // for (let i = 0; i < 3; i++) {
    //   if (!arr[i]) {
    //     arr[i] = this.getRandomColor();
    //   }
    // }
    return arr;
  }
  static putQuan(
    x: number,
    y: number,
    colorList: Array<number>
  ): number[][][] | boolean {
    cc.log(x,y, this.dataList, "dataListdataListdataList");
    let dataTarget = JSON.parse(JSON.stringify(this.dataList[y][x]));
    // 判断这个格子能不能放
    let flagCanPut = !dataTarget.find(
      (color, index) => color && colorList[index]
    );
    if (!flagCanPut) {
      cc.log("不能放");
      return false;
    }
    colorList.forEach((color, idx) => {
      if (color) {
        dataTarget[idx] = color;
      }
    });
    let mapList = JSON.parse(JSON.stringify(this.dataList));
    mapList[y][x] = dataTarget;
    return mapList;
  }
  static checkSameInGrid(x: number, y: number, mapData: number[][][]) {
    let dataTarget = mapData[y][x];
    if (this.checkGridFull(x, y, mapData)) {
      return Math.min(...dataTarget) == Math.max(...dataTarget);
    } else {
      return false;
    }
  }
  static checkHaveNumInList(list: number[][], color: number) {
    return list.every(item => item.indexOf(color) > -1);
  }

  static checkGridFull(x: number, y: number, mapData: number[][][]) {
    let dataTarget = mapData[y][x];
    return dataTarget[0] && dataTarget[1] && dataTarget[2];
  }
}
