import {
    GameArea,
    GameStatus,
    SillySharkGameState
} from '../../types/CoveyTownSocket'
import PlayerController from '../PlayerController'
import GameAreaController, { GameEventTypes } from './GameAreaController'

export const PLAYER_NOT_IN_GAME_ERROR = 'Player is not in game';

export const NO_GAME_IN_PROGRESS_ERROR = 'No game in progress';

export type SillySharkEvents = GameEventTypes;

export default class SillySharkAreaController extends GameAreaController<
SillySharkGameState,
SillySharkEvents
> {


    get isPlayer(): boolean {
        return this._players.includes(this._townController.ourPlayer);
    }

    get status(): GameStatus {
        if (this._model.game?.state.status == 'SINGLE_PLAYER_IN_PROGRESS') {
            return 'SINGLE_PLAYER_IN_PROGRESS';
          } else if(this._model.game?.state.status == 'MULTI_PLAYER_IN_PROGRESS') {
            return 'MULTI_PLAYER_IN_PROGRESS'
          } else if (this._model.game?.state.status == 'OVER') {
            return 'OVER';
          }
          return 'WAITING_TO_START';
    }
}