import InvalidParametersError, {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_COMMAND_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  GameInstance,
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
  SillySharkGameState,
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

  private _checkForWin() {}

  private _stateUpdated(updatedState: GameInstance<SillySharkGameState>) {
    if (updatedState.state.status === 'OVER') {
      // If we haven't yet recorded the outcome, do so now.
      const gameID = this._game?.id;
      if (gameID && !this._history.find(eachResult => eachResult.gameID === gameID)) {
        const { player1, player2 } = updatedState.state;
        if (player1 && player2) {
          const p1Name =
            this._occupants.find(eachPlayer => eachPlayer.id === player1)?.userName || player1;
          /** const p2Name = 
            this._occupants.find(eachPlayer => eachPlayer.id === player2)?.userName || player2;
            
            I commented this out to avoid linting conflicts 
            until we write the logic for winning
            */
          this._history.push({
            gameID,
            winner: p1Name /** placeholder* */,
          });
        }
      }
    }
    this._emitAreaChanged();
  }

  /**
   * Handle a command from a player in this game area.
   * Supported commands:
   * - JoinGame (joins the game `this._game`, or creates a new one if none is in progress)
   * - GameMove (applies a move to the game)
   * - LeaveGame (leaves the game)
   *
   * If the command ended the game, records the outcome in this._history
   * If the command is successful (does not throw an error), calls this._emitAreaChanged (necessary
   *  to notify any listeners of a state update, including any change to history)
   * If the command is unsuccessful (throws an error), the error is propagated to the caller
   *
   * @see InteractableCommand
   *
   * @param command command to handle
   * @param player player making the request
   * @returns response to the command, @see InteractableCommandResponse
   * @throws InvalidParametersError if the command is not supported or is invalid. Invalid commands:
   *  - LeaveGame and GameMove: No game in progress (GAME_NOT_IN_PROGRESS_MESSAGE),
   *        or gameID does not match the game in progress (GAME_ID_MISSMATCH_MESSAGE)
   *  - Any command besides LeaveGame, GameMove and JoinGame: INVALID_COMMAND_MESSAGE
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    /** handle the game moves */
    if (command.type === 'JoinGame') {
      let game = this._game;
      if (!game || game.state.status === 'OVER') {
        // No game in progress, make a new one
        game = new SillySharkGame();
        this._game = game;
      }
      game.join(player);
      this._stateUpdated(game.toModel());
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
      this._stateUpdated(game.toModel());
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

      // Mark the player as ready in the game state
      game.setReady(player);
      // Update the state to notify listeners
      this._stateUpdated(game.toModel());

      return undefined as InteractableCommandReturnType<CommandType>;
    }

    if (command.type === 'UpdateScore') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }

      game.updateScore(player, command.score);

      this._stateUpdated(game.toModel());

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

      game.checkForWinner();

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

      // Set the skin for the player
      game.setSkin(player, command.skin);
      // Update the state to notify listeners
      this._stateUpdated(game.toModel());

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

      if (!command.multiPlayer){
        game.startSinglePlayer()
      }
      else{
        // Check if both players are ready
        if (!game.isReady()) {
          throw new InvalidParametersError('Both players must be ready to start the game.');
        }

        if (game.isReady() && game.state.status === 'WAITING_TO_START') {
          game.startMultiPlayer();
        }

      }


      console.log('status:', game.state.status)
      // Notify listeners about the game start
      this._stateUpdated(game.toModel());

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

      this._stateUpdated(game.toModel());

      return undefined as InteractableCommandReturnType<CommandType>;
    }

    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }
}
