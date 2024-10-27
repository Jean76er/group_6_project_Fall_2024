export default class Obstacle {
  private _obstacleHeight: number;

  private _obstacleWidth: number;

  private _obstacleImage: HTMLImageElement;

  private _passed = false;

  constructor(obstacleHeight: number, obstacleWidth: number, obstacleImage: HTMLImageElement) {
    this._obstacleHeight = obstacleHeight;
    this._obstacleWidth = obstacleWidth;
    this._obstacleImage = obstacleImage;
  }

  get obstacleHeight(): number {
    return this._obstacleHeight;
  }

  get obstacleWidth(): number {
    return this._obstacleWidth;
  }

  get obstacleImage(): HTMLImageElement {
    return this._obstacleImage;
  }

  get passed(): boolean {
    return this._passed;
  }

  set passed(passed: boolean) {
    this._passed = passed;
  }
}
