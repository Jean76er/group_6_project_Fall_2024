import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { createPlayerForTesting } from '../../TestUtils';
import {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_COMMAND_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  GameInstanceID,
  SillySharkGameState,
  SillySharkCanvasState,
  TownEmitter,
} from '../../types/CoveyTownSocket';
import Game from './Game';
import SillySharkGameArea from './SillySharkGameArea';
import * as SillySharkGameModule from './SillySharkGame';

class TestingGame extends Game<SillySharkGameState> {
  public constructor() {
    super({
      player1: undefined,
      player2: undefined,
      skins: {},
      score: {},
      lost: {},
      ready: {},
      spritesData: {},
      status: 'WAITING_TO_START',
      winner: undefined,
    });
  }

  public endGame(winner?: string) {
    this.state = {
      ...this.state,
      status: 'OVER',
      winner,
    };
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
});
