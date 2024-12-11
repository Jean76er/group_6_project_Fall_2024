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
    });
  }

  public isReady(): boolean {
    const readyCount = Object.values(this.state.ready).filter(isReady => isReady).length;
    return readyCount === 2;
  }

  public startGame(): void {
    if (this.state.status === 'IN_PROGRESS') {
      throw new Error(paramerrors.GAME_ALREADY_IN_PROGRESS_MESSAGE);
    }

    /** Ensure both players are ready */
    if (!this.isReady()) {
      throw new InvalidParametersError(paramerrors.BOTH_PLAYERS_READY_MESSAGE);
    }

    /** Only set status to IN_PROGRESS if players are ready and status is WAITING_TO_START */
    if (this.state.status === 'WAITING_TO_START') {
      this.state = {
        ...this.state,
        status: 'IN_PROGRESS',
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
        [player.id]: skin || DEFAULT_SKIN,
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
      throw new InvalidParametersError(paramerrors.PLAYER_NOT_IN_GAME_MESSAGE);
      throw new InvalidParametersError(paramerrors.PLAYER_NOT_IN_GAME_MESSAGE);
    }
    // Validate the position
    if (positionY < 0 || positionY > this.state.canvasHeight) {
      throw new InvalidParametersError(paramerrors.INVALID_MOVE_MESSAGE);
    }
    /** Update the player's position in the game state' */
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
      throw new InvalidParametersError(paramerrors.BOTH_PLAYERS_READY_MESSAGE);
      throw new InvalidParametersError(paramerrors.BOTH_PLAYERS_READY_MESSAGE);
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
      throw new InvalidParametersError(paramerrors.PLAYER_NOT_IN_GAME_MESSAGE);
    }
  }

  public checkForWinner(playerId: string) {
    this._checkForWinner(playerId);
  }

  /**
   * Adds a player to the game.
   * Updates the game's state to reflect the addition of the new player.
   * Makes sure to set the players ready state to false.
   * it also deletes they are trying to join after leaving a game where they chose a skin
   * @param player The player to join the game
   */
  public _join(player: Player) {
    if (this.state.player1 === player.id || this.state.player2 === player.id) {
      throw new InvalidParametersError(paramerrors.PLAYER_ALREADY_IN_GAME_MESSAGE);
    }
    const updatedSkins = { ...this.state.skins };
    delete updatedSkins[player.id];
    if (!this.state.player1) {
      this.state = {
        ...this.state,
        skins: updatedSkins,
        player1: player.id,
        ready: { ...this.state.ready, [player.id]: false },
      };
    } else if (!this.state.player2) {
      this.state = {
        ...this.state,
        skins: updatedSkins,
        player2: player.id,
        ready: { ...this.state.ready, [player.id]: false },
      };
    } else {
      throw new InvalidParametersError(paramerrors.GAME_FULL_MESSAGE);
    }
  }

  /**
   * Allows a player to exit the game and declares a winner if the game is IN_PROGRESS
   * If the game hasn't started yet, it removes every data related to the player, such as thir ready state.
   * @param player The player to remove from the game
   */
  public _leave(player: Player) {
    if (this.state.player1 !== player.id && this.state.player2 !== player.id) {
      throw new InvalidParametersError(paramerrors.PLAYER_NOT_IN_GAME_MESSAGE);
    }

    if (this.state.status === 'WAITING_TO_START') {
      /** Explicitly remove the player's skin */
      if (this.state.player1 === player.id) {
        this.state = {
          ...this.state,
          player1: undefined,
          ready: { ...this.state.ready, [player.id]: false },
          spritesData: {},
        };
      } else {
        this.state = {
          ...this.state,
          player2: undefined,
          ready: { ...this.state.ready, [player.id]: false },
          spritesData: {},
        };
      }
    } else if (this.state.status === 'IN_PROGRESS') {
      if (this.state.player1 === player.id) {
        this.state = {
          ...this.state,
          player1: undefined,
          winner: this.state.player2,
        };
      }
      if (this.state.player2 === player.id) {
        this.state = {
          ...this.state,
          player2: undefined,
          winner: this.state.player1,
        };
      }
      /** Check if both players are undefined */
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
