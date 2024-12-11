import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { createPlayerForTesting } from '../../TestUtils';
import {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_COMMAND_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import { SillySharkGameState, TownEmitter } from '../../types/CoveyTownSocket';
import Game from './Game';
import SillySharkGameArea from './SillySharkGameArea';
import * as SillySharkGameModule from './SillySharkGame';

class TestingGame extends Game<SillySharkGameState> {
  public constructor() {
    super({
      player1: undefined,
      player2: undefined,
      skins: {},
      ready: {},
      spritesData: {},
      status: 'WAITING_TO_START',
      winner: undefined,
    });
  }

  public endGame(winner?: string) {
    this.state = {
      ...this.state,
      status: 'WAITING_TO_START',
      winner,
    };
  }

  public setReady(player: Player): void {
    this.state.ready[player.id] = true;
  }

  public checkForWinner(playerID: string): void {
    if (this.state.player1 === playerID || this.state.player2 === playerID) {
      this.state.winner = playerID;
    }
  }

  public setSkin(player: Player, skin: string): void {
    if (!this.state.skins) {
      this.state.skins = {};
    }
    this.state.skins[player.id] = skin;
  }

  public isReady(): boolean {
    if (!this.state.player1 || !this.state.player2) {
      return false;
    }
    return this.state.ready[this.state.player1] && this.state.ready[this.state.player2];
  }

  public startGame(): void {
    if (this.state.status === 'WAITING_TO_START') {
      this.state.status = 'IN_PROGRESS';
    }
  }

  public setPosition(player: Player, positionY: number): void {
    if (!this.state.spritesData) {
      this.state.spritesData = {};
    }
    this.state.spritesData[player.id] = positionY; // Update the sprite's position
  }

  protected _join(player: Player): void {
    if (this.state.player1) {
      this.state.player2 = player.id;
    } else {
      this.state.player1 = player.id;
    }
    this._players.push(player);
  }

  protected _leave(): void {}
}
describe('SillySharkGameArea', () => {
  let gameArea: SillySharkGameArea;
  let player1: Player;
  let player2: Player;
  let interactableUpdateSpy: jest.SpyInstance;
  let game: TestingGame;
  beforeEach(() => {
    const gameConstructorSpy = jest.spyOn(SillySharkGameModule, 'default');
    game = new TestingGame();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (Testing without using the real game class)
    gameConstructorSpy.mockReturnValue(game);

    player1 = createPlayerForTesting();
    player2 = createPlayerForTesting();
    gameArea = new SillySharkGameArea(
      nanoid(),
      { x: 0, y: 0, width: 100, height: 100 },
      mock<TownEmitter>(),
    );
    gameArea.add(player1);
    gameArea.add(player2);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (Test requires access to protected method)
    interactableUpdateSpy = jest.spyOn(gameArea, '_emitAreaChanged');
  });
  describe('handleCommand', () => {
    describe('[T3.1] when given a JoinGame command', () => {
      describe('when there is no game in progress', () => {
        it('should create a new game and call _emitAreaChanged', () => {
          const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
          expect(gameID).toBeDefined();
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          expect(gameID).toEqual(game.id);
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
        });
      });
      describe('when there is a game in progress', () => {
        it('should dispatch the join command to the game and call _emitAreaChanged', () => {
          const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);

          const joinSpy = jest.spyOn(game, 'join');
          const gameID2 = gameArea.handleCommand({ type: 'JoinGame' }, player2).gameID;
          expect(joinSpy).toHaveBeenCalledWith(player2);
          expect(gameID).toEqual(gameID2);
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
        });
        it('should not call _emitAreaChanged if the game throws an error', () => {
          gameArea.handleCommand({ type: 'JoinGame' }, player1);
          if (!game) {
            throw new Error('Game was not created by the first call to join');
          }
          interactableUpdateSpy.mockClear();

          const joinSpy = jest.spyOn(game, 'join').mockImplementationOnce(() => {
            throw new Error('Test Error');
          });
          expect(() => gameArea.handleCommand({ type: 'JoinGame' }, player2)).toThrowError(
            'Test Error',
          );
          expect(joinSpy).toHaveBeenCalledWith(player2);
          expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
      });
    });
  });
  describe('[T3.4] when given an invalid command', () => {
    it('should throw an error', () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore (Testing an invalid command, only possible at the boundary of the type system)
      expect(() => gameArea.handleCommand({ type: 'InvalidCommand' }, player1)).toThrowError(
        INVALID_COMMAND_MESSAGE,
      );
      expect(interactableUpdateSpy).not.toHaveBeenCalled();
    });
  });
  describe('[T3.3] when given a LeaveGame command', () => {
    describe('when there is no game in progress', () => {
      it('should throw an error', () => {
        expect(() =>
          gameArea.handleCommand({ type: 'LeaveGame', gameID: nanoid() }, player1),
        ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
        expect(interactableUpdateSpy).not.toHaveBeenCalled();
      });
    });
    describe('when there is a game in progress', () => {
      it('should throw an error when the game ID does not match', () => {
        gameArea.handleCommand({ type: 'JoinGame' }, player1);
        interactableUpdateSpy.mockClear();
        expect(() =>
          gameArea.handleCommand({ type: 'LeaveGame', gameID: nanoid() }, player1),
        ).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
        expect(interactableUpdateSpy).not.toHaveBeenCalled();
      });
      it('should dispatch the leave command to the game and call _emitAreaChanged', () => {
        const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
        if (!game) {
          throw new Error('Game was not created by the first call to join');
        }
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
        const leaveSpy = jest.spyOn(game, 'leave');
        gameArea.handleCommand({ type: 'LeaveGame', gameID }, player1);
        expect(leaveSpy).toHaveBeenCalledWith(player1);
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
      });
      it('should not call _emitAreaChanged if the game throws an error', () => {
        gameArea.handleCommand({ type: 'JoinGame' }, player1);
        if (!game) {
          throw new Error('Game was not created by the first call to join');
        }
        interactableUpdateSpy.mockClear();
        const leaveSpy = jest.spyOn(game, 'leave').mockImplementationOnce(() => {
          throw new Error('Test Error');
        });
        expect(() =>
          gameArea.handleCommand({ type: 'LeaveGame', gameID: game.id }, player1),
        ).toThrowError('Test Error');
        expect(leaveSpy).toHaveBeenCalledWith(player1);
        expect(interactableUpdateSpy).not.toHaveBeenCalled();
      });
    });
  });
  describe('SetReady command', () => {
    it('marks the player as ready and emits a state update', () => {
      const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);

      game.setReady = jest.fn();
      const setReadySpy = jest.spyOn(game, 'setReady');

      gameArea.handleCommand({ type: 'SetReady', gameID, playerID: player1.id }, player1);

      expect(setReadySpy).toHaveBeenCalledWith(player1);
      expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
    });

    it('throws an error if no game is in progress', () => {
      expect(() => {
        gameArea.handleCommand(
          { type: 'SetReady', gameID: nanoid(), playerID: player1.id },
          player1,
        );
      }).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
      expect(interactableUpdateSpy).not.toHaveBeenCalled();
    });

    it('throws an error for mismatched gameID', () => {
      gameArea.handleCommand({ type: 'JoinGame' }, player1);
      expect(() => {
        gameArea.handleCommand(
          { type: 'SetReady', gameID: nanoid(), playerID: player1.id },
          player1,
        );
      }).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
      expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
    });
  });
  describe('CheckForWinner command', () => {
    it('checks for the winner and emits a state update', () => {
      const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);

      game.checkForWinner = jest.fn();
      const checkForWinnerSpy = jest.spyOn(game, 'checkForWinner');

      gameArea.handleCommand({ type: 'CheckForWinner', gameID, playerID: player1.id }, player1);

      expect(checkForWinnerSpy).toHaveBeenCalledWith(player1.id);
      expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
    });

    it('throws an error if no game is in progress', () => {
      expect(() => {
        gameArea.handleCommand(
          { type: 'CheckForWinner', gameID: nanoid(), playerID: player1.id },
          player1,
        );
      }).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
      expect(interactableUpdateSpy).not.toHaveBeenCalled();
    });

    it('throws an error for mismatched gameID', () => {
      gameArea.handleCommand({ type: 'JoinGame' }, player1);
      expect(() => {
        gameArea.handleCommand(
          { type: 'CheckForWinner', gameID: nanoid(), playerID: player1.id },
          player1,
        );
      }).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
      expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
    });
  });
  describe('SetSkin command', () => {
    it('sets the player skin and emits a state update', () => {
      const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);

      // Mock `setSkin` method
      game.setSkin = jest.fn();
      const setSkinSpy = jest.spyOn(game, 'setSkin');

      gameArea.handleCommand(
        { type: 'SetSkin', gameID, playerID: player1.id, skin: 'SharkSkin' },
        player1,
      );

      // Assert that `setSkin` is called with the correct player and skin
      expect(setSkinSpy).toHaveBeenCalledWith(player1, 'SharkSkin');
      // Assert that `_stateUpdated` is called
      expect(interactableUpdateSpy).toHaveBeenCalledTimes(2); // Once for JoinGame, once for SetSkin
    });

    it('throws an error if no game is in progress', () => {
      expect(() => {
        gameArea.handleCommand(
          { type: 'SetSkin', gameID: nanoid(), playerID: player1.id, skin: 'SharkSkin' },
          player1,
        );
      }).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
      expect(interactableUpdateSpy).not.toHaveBeenCalled();
    });

    it('throws an error for mismatched gameID', () => {
      gameArea.handleCommand({ type: 'JoinGame' }, player1);
      expect(() => {
        gameArea.handleCommand(
          { type: 'SetSkin', gameID: nanoid(), playerID: player1.id, skin: 'SharkSkin' },
          player1,
        );
      }).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
      expect(interactableUpdateSpy).toHaveBeenCalledTimes(1); // Only for JoinGame
    });
  });

  describe('RenderSprite command', () => {
    it('updates the sprite position and emits a state update', () => {
      const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);

      game.setPosition = jest.fn();
      const setPositionSpy = jest.spyOn(game, 'setPosition');

      const positionY = 100;
      gameArea.handleCommand(
        { type: 'RenderSprite', gameID, playerID: player1.id, positionY },
        player1,
      );

      expect(setPositionSpy).toHaveBeenCalledWith(player1, positionY);
      expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
    });

    it('throws an error if no game is in progress', () => {
      expect(() => {
        gameArea.handleCommand(
          { type: 'RenderSprite', gameID: nanoid(), playerID: player1.id, positionY: 100 },
          player1,
        );
      }).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
      expect(interactableUpdateSpy).not.toHaveBeenCalled();
    });

    it('throws an error for mismatched gameID', () => {
      gameArea.handleCommand({ type: 'JoinGame' }, player1);
      expect(() => {
        gameArea.handleCommand(
          { type: 'RenderSprite', gameID: nanoid(), playerID: player1.id, positionY: 100 },
          player1,
        );
      }).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
      expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
    });
  });
});
