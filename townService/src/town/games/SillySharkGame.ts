import SillySharkPlayer from './SillySharkPlayer';
import InvalidParametersError from '../../lib/InvalidParametersError';
import * as paramerrors from '../../lib/InvalidParametersError';
import Game from './Game';
import { Player, SillySharkGameState, Skin } from '../../types/CoveyTownSocket';

export default class SillySharkGame extends Game<SillySharkGameState> {
  /* This constructor may need to be revised later with further development. */
  public constructor() {
    /** initialState: SillySharkGameState */
    super({
      /** ...initialState, uncomment if we need it in the future
       * this was causing conflicts with SillySharkGameArea.ts
       */
      status: 'WAITING_TO_START',
      ready: {},
    });
  }

  private _setReady(player: Player): void {
    this.state = {
      ...this.state,
      ready: { ...this.state.ready, [player.id]: true },
    };
  }

  public setReady(player: Player): void {
    if (!this._players.some(p => p.id === player.id)) {
      throw new InvalidParametersError('Player is not in the game');
    }
    this._setReady(player);
  }

  private _setSkin(player: Player, skin: Skin | undefined): void {
    this.state = {
      ...this.state,
      skins: {
        ...(this.state.skins || {}),
        [player.id]: skin || '/SillySharkResources/skins/sillyshark.png', // Set skin or default to SillyShark
      },
    };
  }

  public setSkin(player: Player, skin: Skin | undefined): void {
    if (!this._players.some(p => p.id === player.id)) {
      throw new InvalidParametersError('Player is not in the game');
    }
    this._setSkin(player, skin);
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
    if (!this.state.player1) {
      this.state = {
        ...this.state,
        player1: player.id,
        ready: { ...this.state.ready, [player.id]: false },
      };
    } else if (!this.state.player2) {
      this.state = {
        ...this.state,
        player2: player.id,
        ready: { ...this.state.ready, [player.id]: false },
      };
    } else {
      throw new InvalidParametersError(paramerrors.GAME_FULL_MESSAGE);
    }

    if (this.state.player1 && this.state.player2) {
      this.state = {
        ...this.state,
        status: 'MULTI_PLAYER_IN_PROGRESS',
      };
    } else {
      this.state = {
        ...this.state,
        status: 'SINGLE_PLAYER_IN_PROGRESS',
      };
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

    if (this.state.status === 'SINGLE_PLAYER_IN_PROGRESS') {
      this.state = {
        status: 'WAITING_TO_START',
        ready: {},
      };
    } else if (this.state.status === 'MULTI_PLAYER_IN_PROGRESS') {
      if (this.state.player1 === player.id) {
        this.state = {
          ...this.state,
          status: 'WAITING_TO_START',
          winner: this.state.player2,
        };
      } else {
        this.state = {
          ...this.state,
          status: 'WAITING_TO_START',
          winner: this.state.player1,
        };
      }
    }
  }
}
