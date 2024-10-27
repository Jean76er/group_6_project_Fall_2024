import SillySharkPlayer from './SillySharkPlayer';
import InvalidParametersError from '../../lib/InvalidParametersError';
import * as paramerrors from '../../lib/InvalidParametersError';
import Game from './Game';
import { SillySharkGameState } from '../../types/CoveyTownSocket';

export default class SillySharkGame extends Game<SillySharkGameState> {
  /* This constructor may need to be revised later with further development. */
  public constructor(initialState: SillySharkGameState) {
    super({
      ...initialState,
      status: 'WAITING_TO_START',
    });
  }

  /**
   * Adds a player to the game.
   * Updates the game's state to reflect the addition of the new player.
   * @param player The player to join the game
   */
  public _join(player: SillySharkPlayer) {
    if (this.state.player1 === player.id || this.state.player2 === player.id) {
      throw new InvalidParametersError(paramerrors.PLAYER_ALREADY_IN_GAME_MESSAGE);
    }

    if (this.state.player1 === undefined) {
      this.state.player1 = player.id;
      this.state.status = 'SINGLE_PLAYER_IN_PROGRESS';
    } else if (this.state.player2 === undefined) {
      this.state.player2 = player.id;
      this.state.status = 'MULTI_PLAYER_IN_PROGRESS';
    } else {
      throw new InvalidParametersError(paramerrors.GAME_FULL_MESSAGE);
    }
  }

  /**
   * Allows a player to exit the game and declares a winner if in multi player mode
   * Allows a player to continue playing in single player mode if second player leave prematurely
   * DOES NOT handle instances where players want a rematch
   * @param player The player to remove from the game
   */
  public _leave(player: SillySharkPlayer) {
    if (this.state.player1 !== player.id && this.state.player2 !== player.id) {
      throw new InvalidParametersError(paramerrors.PLAYER_NOT_IN_GAME_MESSAGE);
    }
    if (this.state.status === 'MULTI_PLAYER_IN_PROGRESS') {
      this.state.status = 'SINGLE_PLAYER_IN_PROGRESS';
      if (this.state.player1 === player.id) {
        this.state.winner = this.state.player2;
      } else if (this.state.player2 === player.id){
        this.state.winner = this.state.player1;
      }
    } else {
      if (this.state.player1 === player.id) {
        this.state.player1 = undefined;
      } else if (this.state.player2 === player.id) {
        this.state.player2 = undefined;
      }
      this.state.status = 'WAITING_TO_START';
    }
  }
}
