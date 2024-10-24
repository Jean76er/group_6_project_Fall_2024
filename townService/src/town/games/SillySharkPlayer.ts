import { TownEmitter } from '../../types/CoveyTownSocket';
import Player from '../../lib/Player';

/**
 * SillySharkPlayer extends the Player class and it adds a
 * _highScore which stores the highest score.
 * It also adds valus, _playerHeight and _playerWidth
 *
 */
export default class SillySharkPlayer extends Player {
  private _highScore: number;

  private _playerHeight = 0;

  private _playerWidth = 0;

  constructor(userName: string, townEmitter: TownEmitter) {
    super(userName, townEmitter);
    this._highScore = 0;
  }

  get highScore(): number {
    return this._highScore;
  }

  get playerHeight(): number {
    return this._playerHeight;
  }

  get playerWidth(): number {
    return this._playerWidth;
  }

  /** The updateHighScore method takes a number and assigns
   * it to the _highScore if it's greater than the previous one
   *
   */
  updateHighScore(newScore: number): void {
    if (newScore > this._highScore) {
      this._highScore = newScore;
    }
  }
}
