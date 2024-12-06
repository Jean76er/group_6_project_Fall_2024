import SillySharkPlayer from './SillySharkPlayer';
import InvalidParametersError from '../../lib/InvalidParametersError';
import * as paramerrors from '../../lib/InvalidParametersError';
import Game from './Game';
import { Player, SillySharkGameState, Skin } from '../../types/CoveyTownSocket';

const DEFAULT_SKIN = '/SillySharkResources/skins/sillyshark.png';
const DEFAULT_SCORE = 0;

export default class SillySharkGame extends Game<SillySharkGameState> {
  /* This constructor may need to be revised later with further development. */
  public constructor() {
    super({
      status: 'WAITING_TO_START',
      ready: {},
      score: {},
      lost: {},
    });
  }

  public isReady(): boolean {
    const readyCount = Object.values(this.state.ready).filter(isReady => isReady).length;
    return readyCount === 2;
  }

  public start(): void {
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

    // Initialize game mechanics
    this.startGameLogic();
  }

  startGameLogic(): void {
    // to add later
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

  private _updateScore(player: Player, score: number) {
    this.state = {
      ...this.state,
      score: {
        ...(this.state.score || {}),
        [player.id]: score || DEFAULT_SCORE,
      },
    };
  }

  public updateScore(player: Player, score: number) {
    if (!this._players.some(p => p.id === player.id)) {
      throw new InvalidParametersError(paramerrors.PLAYER_NOT_IN_GAME_MESSAGE);
    }
    this._updateScore(player, score);
  }

  private _checkForWinner() {
    const player1Id = this.state.player1;
    const player2Id = this.state.player2;

    const player1Score = player1Id !== undefined ? this.state.score[player1Id] || 0 : 0;
    const player2Score = player2Id !== undefined ? this.state.score[player2Id] || 0 : 0;
    if (player1Id !== undefined && player2Id !== undefined) {
      if (player1Score > player2Score) {
        this.state.lost[player2Id] = true;
        this.state.lost[player1Id] = false;
        this.state.winner = player1Id;
      } else if (player2Score > player1Score) {
        this.state.lost[player1Id] = true;
        this.state.lost[player2Id] = false;
        this.state.winner = player2Id;
      } else {
        this.state.lost[player1Id] = true;
        this.state.lost[player2Id] = true;
        this.state.winner = undefined;
      }
    }
  }

  public checkForWinner() {
    this._checkForWinner();
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

    // if (this.state.player1 && this.state.player2) {
    //   this.state = {
    //     ...this.state,
    //     status: 'WAITING_TO_START',
    //   };
    // } else {
    //   this.state = {
    //     ...this.state,
    //     status: 'WAITING_TO_START',
    //   };
    // }
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
        score: {},
        lost: {},
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
