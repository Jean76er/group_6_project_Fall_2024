export const INVALID_MOVE_MESSAGE = 'Invalid move';
export const INVALID_COMMAND_MESSAGE = 'Invalid command';

export const GAME_FULL_MESSAGE = 'Game is full';
export const GAME_NOT_IN_PROGRESS_MESSAGE = 'Game is not in progress';
export const GAME_OVER_MESSAGE = 'Game is over';
export const GAME_ID_MISSMATCH_MESSAGE = 'Game ID mismatch';
export const GAME_ALREADY_IN_PROGRESS_MESSAGE = 'Game already in progress.';

export const BOTH_PLAYERS_READY_MESSAGE = 'Both players must be ready to start the game.';
export const PLAYER_NOT_IN_GAME_MESSAGE = 'Player is not in this game';
export const PLAYER_ALREADY_IN_GAME_MESSAGE = 'Player is already in this game';
export default class InvalidParametersError extends Error {
  public message: string;

  public constructor(message: string) {
    super(message);
    this.message = message;
  }
}
