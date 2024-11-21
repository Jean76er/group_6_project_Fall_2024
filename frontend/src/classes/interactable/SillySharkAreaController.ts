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
  protected _skin1?: Skin;

  protected _skin2?: Skin;

  get player1(): PlayerController | undefined {
    if (this._model.game?.state.player1) {
      return this._players[0];
    }
    return undefined;
  }

  get player2(): PlayerController | undefined {
    if (this._model.game?.state.player2) {
      return this._players[1];
    }
    return undefined;
  }

  get skin1(): Skin | undefined {
    return this._skin1;
  }

  set skin1(skin: Skin | undefined) {
    this._skin1 = skin;
  }

  get skin2(): Skin | undefined {
    return this._skin2;
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
    const gameState = this._model.game?.state;
    if (gameState?.status === 'SINGLE_PLAYER_IN_PROGRESS') {
      return 'SINGLE_PLAYER_IN_PROGRESS';
    } else if (gameState?.status === 'MULTI_PLAYER_IN_PROGRESS') {
      return 'MULTI_PLAYER_IN_PROGRESS';
    } else if (gameState?.status === 'OVER') {
      return 'OVER';
    }
    return 'WAITING_TO_START';
  }

  public isActive(): boolean {
    const gameState = this._model.game?.state;
    return (
      gameState?.status === 'SINGLE_PLAYER_IN_PROGRESS' ||
      gameState?.status === 'MULTI_PLAYER_IN_PROGRESS'
    );
  }

  public updateFrom(newModel: GameArea<SillySharkGameState>): void {
    super._updateFrom(newModel);
  }

  public async jump(): Promise<void> {
    this.emit('jump');
  }
}
