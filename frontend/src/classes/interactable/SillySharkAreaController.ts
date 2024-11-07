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
        return false; //TODO
    }

    get status(): GameStatus {
        return 'WAITING_TO_START'; 
    }
}