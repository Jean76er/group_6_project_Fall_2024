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
  protected _skins: { [playerName: string]: Skin } = {}; 

  get player1(): PlayerController | undefined {
    return this._players[0] || undefined;
  }

  get player2(): PlayerController | undefined {
    return this._players[1] || undefined;
  }

  get skin(): Skin | undefined {
    if (this._skins) {
      return this._skins[this._townController.ourPlayer.id];
    }
    return undefined;
  }
  
  set skin(skin: string | undefined) {
    if (skin) {
      this._skins[this._townController.ourPlayer.id] = skin;
    } else {
      this._skins[this._townController.ourPlayer.id] = '/SillySharkResources/skins/sillyshark.png';
    }
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
