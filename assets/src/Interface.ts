export interface DataDispelled {
  // 方向 1本圈 2横 3竖 4左上到右下 5右上到左下
  dir: number;
  x: number;
  y: number;
  list: DataCircle[];
}
export interface DataGrid {
  x: number;
  y: number;
  colorList: number[];
}
export interface DataCircle {
  x: number;
  y: number;
  circlePos: number;
  color: number;
}
export interface DataAddedReturn {
  afterPutData?: number[][][];
  dataTarget?: number[];
  type: number;
  dispelledList?: DataDispelled[];
}