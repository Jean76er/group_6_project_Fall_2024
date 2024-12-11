import InvalidParametersError, {
  BOTH_PLAYERS_READY_MESSAGE,
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_COMMAND_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
} from '../../types/CoveyTownSocket';
import GameArea from './GameArea';
import SillySharkGame from './SillySharkGame';

/**
 * A SillySharkGameArea is a GameArea that hosts a SillySharkGame.
 * @see SillySharkGame
 * @see GameArea
 */
export default class SillySharkGameArea extends GameArea<SillySharkGame> {
  protected getType(): InteractableType {
    return 'SillySharkArea';
  }

  private _stateUpdated() {
    this._emitAreaChanged();
  }

  /**
   * Handle a command from a player in this game area.
   * Supported commands:
   * - JoinGame (joins the game `this._game`, or creates a new one if none is in progress)
   * - LeaveGame (leaves the game)
   * - SetReady (sets the player state to ready, this is used in multiplayer)
   * - CheckForWinner (Check's if there's a winner)
   * - SetSkin (Sets the player's skin)
   * - StartGame (Starts a game only if both players are ready and the game is WAITING_TO_START)
   * - RenderSprite (Sents the position of the player)
   * If the command is successful (does not throw an error), calls this._emitAreaChanged (necessary
   *  to notify any listeners of a state update.
   * If the command is unsuccessful (throws an error), the error is propagated to the caller
   *
   * @see InteractableCommand
   *
   * @param command command to handle
   * @param player player making the request
   * @returns response to the command, @see InteractableCommandResponse
   * @throws InvalidParametersError if the command is not supported or is invalid. Invalid commands:
   *  - Every Command: No game in progress (GAME_NOT_IN_PROGRESS_MESSAGE),
   *        or gameID does not match the game in progress (GAME_ID_MISSMATCH_MESSAGE)
   *  - Any command besides the previously stated: INVALID_COMMAND_MESSAGE
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    /** handle the game moves */
    if (command.type === 'JoinGame') {
      let game = this._game;
      if (!game) {
        // No game in progress, make a new one
        game = new SillySharkGame();
        this._game = game;
      }
      game.join(player);
      this._stateUpdated();
      return { gameID: game.id } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'LeaveGame') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      game.leave(player);
      this._stateUpdated();
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'SetReady') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }

      game.setReady(player);
      this._stateUpdated();

      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'CheckForWinner') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }

      game.checkForWinner(player.id);
      this._stateUpdated();

      return undefined as InteractableCommandReturnType<CommandType>;
    }

    if (command.type === 'SetSkin') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }

      game.setSkin(player, command.skin);
      this._stateUpdated();

      return undefined as InteractableCommandReturnType<CommandType>;
    }

    if (command.type === 'StartGame') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }

      if (!game.isReady()) {
        throw new InvalidParametersError(BOTH_PLAYERS_READY_MESSAGE);
      }

      if (game.isReady() && game.state.status === 'WAITING_TO_START') {
        game.startGame();
      }

      this._stateUpdated();

      return undefined as InteractableCommandReturnType<CommandType>;
    }

    if (command.type === 'RenderSprite') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }

      game.setPosition(player, command.positionY);
      this._stateUpdated();

      return undefined as InteractableCommandReturnType<CommandType>;
    }

    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }
}
