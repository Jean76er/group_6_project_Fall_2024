import SillySharkPlayer from './SillySharkPlayer';
import InvalidParametersError from '../../lib/InvalidParametersError';
import * as paramerrors from '../../lib/InvalidParametersError';
import Game from './Game';
import {
  Player,
  SillySharkCanvasState,
  SillySharkGameState,
  Skin,
} from '../../types/CoveyTownSocket';

const DEFAULT_SKIN = '/SillySharkResources/skins/sillyshark.png';
export default class SillySharkGame extends Game<SillySharkGameState & SillySharkCanvasState> {
  /* This constructor may need to be revised later with further development. */
  public constructor() {
    super({
      status: 'WAITING_TO_START',
      ready: {},
      spritesData: {},
      canvasHeight: 720,
      lost: {},
    });
  }

  public isReady(): boolean {
    const readyCount = Object.values(this.state.ready).filter(isReady => isReady).length;
    return readyCount === 2;
  }

  public startSinglePlayer(): void {
    if (this.state.status === 'SINGLE_PLAYER_IN_PROGRESS') {
      throw new Error(paramerrors.GAME_ALREADY_IN_PROGRESS_MESSAGE);
    }

    if (this.state.status === 'WAITING_TO_START') {
      this.state = {
        ...this.state,
        status: 'SINGLE_PLAYER_IN_PROGRESS',
      };
    }
  }

  public startMultiPlayer(): void {
    if (this.state.status === 'MULTI_PLAYER_IN_PROGRESS') {
      throw new Error(paramerrors.GAME_ALREADY_IN_PROGRESS_MESSAGE);
    }

    // Ensure both players are ready
    if (!this.isReady()) {
      throw new InvalidParametersError(paramerrors.BOTH_PLAYERS_READY_MESSAGE);
    }

    // Only set status to MULTI_PLAYER_IN_PROGRESS if players are ready and status is WAITING_TO_START
    if (this.state.status === 'WAITING_TO_START') {
      this.state = {
        ...this.state,
        status: 'MULTI_PLAYER_IN_PROGRESS',
      };
    }
  }

  private _setReady(player: Player): void {
    this.state = {
      ...this.state,
      ready: { ...this.state.ready, [player.id]: true },
    };
  }

  public setReady(player: Player): void {
    if (!this._players.some(p => p.id === player.id)) {
      throw new InvalidParametersError(paramerrors.PLAYER_NOT_IN_GAME_MESSAGE);
    }

    this._setReady(player);
  }

  private _setSkin(player: Player, skin: Skin | undefined): void {
    this.state = {
      ...this.state,
      skins: {
        ...(this.state.skins || {}),
        [player.id]: skin || DEFAULT_SKIN, // Set skin or default to SillyShark
      },
    };
  }

  public setSkin(player: Player, skin: Skin | undefined): void {
    if (!this._players.some(p => p.id === player.id)) {
      throw new InvalidParametersError(paramerrors.PLAYER_NOT_IN_GAME_MESSAGE);
    }
    this._setSkin(player, skin);
  }

  public setPosition(player: Player, positionY: number): void {
    // Ensure the player is part of the game
    const gamePlayer = this._players.find(p => p.id === player.id);
    if (!gamePlayer) {
      throw new InvalidParametersError('Player is not part of this game.');
    }
    // Validate the position
    if (positionY < 0 || positionY > this.state.canvasHeight) {
      throw new InvalidParametersError('Position is out of bounds.');
    }
    // Update the player's position in the game state'
    this.state = {
      ...this.state,
      spritesData: {
        ...(this.state.spritesData || {}),
        [player.id]: positionY,
      },
    };
  }

  private _checkForWinner(playerId: string) {
    const { player1, player2 } = this.state;

    // Ensure that both players exist
    if (!player1 || !player2) {
      throw new InvalidParametersError('Both players must be in the game to determine a winner.');
    }

    // If the player has already been identified as the winner, no need to continue
    if (this.state.winner) {
      return;
    }

    // If the playerId is player1, then player2 is the winner, and vice versa
    if (playerId === player1) {
      this.state.winner = player2;
    } else if (playerId === player2) {
      this.state.winner = player1;
    } else {
      throw new InvalidParametersError('Invalid player ID.');
    }

    // Set the "lost" status for the other player
    if (this.state.winner === player1) {
      this.state.lost = { [player2]: true, [player1]: false };
    } else if (this.state.winner === player2) {
      this.state.lost = { [player1]: true, [player2]: false };
    }
  }

  public checkForWinner(playerId: string) {
    this._checkForWinner(playerId);
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
    const updatedSkins = { ...this.state.skins };
    delete updatedSkins[player.id]; 
    if (!this.state.player1) {
      this.state = {
        ...this.state,
        skins:
            updatedSkins,
        player1: player.id,
        ready: { ...this.state.ready, [player.id]: false },
      };
    } else if (!this.state.player2) {
      this.state = {
        ...this.state,
        skins:
            updatedSkins,
        player2: player.id,
        ready: { ...this.state.ready, [player.id]: false },
      };
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

    if (this.state.status === 'WAITING_TO_START') {
// Explicitly remove the player's skin
      if (this.state.player1 === player.id) {
        this.state = {
          ...this.state,
          player1: undefined,
          ready: {},
          spritesData: {},
        };
      } else {
        this.state = {
          ...this.state,
          player2: undefined,
          ready: {},
          spritesData: {},
        };
      }
    } else if (this.state.status === 'MULTI_PLAYER_IN_PROGRESS') {
      if (this.state.player1 === player.id) {
        this.state = {
          ...this.state,
          player1: undefined,
          winner: this.state.player2,
        };
      } else if (this.state.player2 === player.id) {
        this.state = {
          ...this.state,
          player2: undefined,
          winner: this.state.player1,
        };
      }

      // Check if both players are undefined
      if (!this.state.player1 && !this.state.player2) {
        this.state = {
          ...this.state,
          status: 'WAITING_TO_START',
          winner: undefined,
          ready: {},
        };
      }
    }
  }
}
