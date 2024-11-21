import { GameArea, GameStatus, SillySharkGameState, Skin } from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';

export const PLAYER_NOT_IN_GAME_ERROR = 'Player is not in game';

export const NO_GAME_IN_PROGRESS_ERROR = 'No game in progress';

export type SillySharkEvents = GameEventTypes;

export default class SillySharkAreaController extends GameAreaController<
  SillySharkGameState,
  SillySharkEvents
> {

  protected _skin1? : Skin;
  protected _skin2? : Skin;
  /*
   *This getter is not yet defined. This is because I am unsure how exactly we
   *will implement the canvas.
   */
  getcanvas() {
    //To be filled in
  }

  get player1(): PlayerController | undefined {
    if (this._model.game?.state.player1) {
      return this._players[0];
    }
    return undefined;
  }

  get player2(): PlayerController | undefined {
    if (this._model.game?.state.player1) {
      return this._players[1];
    }
    return undefined;
  }

  get skin1(): Skin | undefined {
    if (this._model.game?.state.skin1) {
      return this._skin1;
    }
    return undefined;
  }

  set skin1(skin: Skin | undefined) {
    this._skin1 = skin;
  }

  get skin2(): Skin | undefined {
    if (this._model.game?.state.skin2) {
      return this._skin2;
    }
    return undefined;
  }

  set skin2(skin: Skin | undefined) {
    this._skin2 = skin;
  }

  get winner(): PlayerController | undefined {
    const gameState = this._model.game?.state;
    if (gameState && gameState.winner === gameState.player1) {
      return this._players[0];
    } else if (gameState && gameState.winner === gameState.player2) {
      return this._players[1];
    } else {
      return undefined;
    }
  }

  get isPlayer(): boolean {
    return this._players.includes(this._townController.ourPlayer);
  }

  get status(): GameStatus {
    if (this._model.game?.state.status == 'SINGLE_PLAYER_IN_PROGRESS') {
      return 'SINGLE_PLAYER_IN_PROGRESS';
    } else if (this._model.game?.state.status == 'MULTI_PLAYER_IN_PROGRESS') {
      return 'MULTI_PLAYER_IN_PROGRESS';
    } else if (this._model.game?.state.status == 'OVER') {
      return 'OVER';
    }
    return 'WAITING_TO_START';
  }

  public isActive(): boolean {
    if (this._model.game?.state.status == 'SINGLE_PLAYER_IN_PROGRESS') {
      return true;
    } else if (this._model.game?.state.status == 'MULTI_PLAYER_IN_PROGRESS') {
      return true;
    }
    return false;
  }

  /*
   *Below is not filled out because we do not have a model for the canvas yet.
   */
  public updateFrom(newModel: GameArea<SillySharkGameState>): void {
    //To modified
    super._updateFrom(newModel);
    if (newModel.game?.state.skin1) {
      this._skin1 = newModel.game.state.skin1;
    }
    if (newModel.game?.state.skin2) {
      this._skin2 = newModel.game.state.skin2;
    }
  }

  /*
   *This function would send a request to the server to jump.
   *This would make our sprite jump.
   */

  public async jump(): Promise<void> {
    this.emit('jump');
  }
}
