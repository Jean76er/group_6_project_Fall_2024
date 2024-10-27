export const GAME_FULL_MESSAGE = 'Game is full';
export const GAME_NOT_FOUND_MESSAGE = 'Game not found';
export const PLAYER_ALREADY_IN_GAME_MESSAGE = 'Player is already in a game';
export const PLAYER_NOT_IN_GAME_MESSAGE = 'Player is not in this game';

export default class InvalidParametersError extends Error {
  public message: string;

  public constructor(message: string) {
    super(message);
    this.message = message;
  }
}
