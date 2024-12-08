import { createPlayerForTesting } from '../../TestUtils';
import {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  BOTH_PLAYERS_READY_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import SillySharkGame from './SillySharkGame';
import Player from '../../lib/Player';

describe('SillySharkGame', () => {
  let game: SillySharkGame;

  beforeEach(() => {
    game = new SillySharkGame();
  });

  describe('[T1.1] _join', () => {
    it('should throw an error if the player is already in the game', () => {
      const player = createPlayerForTesting();
      game.join(player);
      expect(() => game.join(player)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    });

    it('should throw an error if the game is full', () => {
      const player1 = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      const player3 = createPlayerForTesting();
      game.join(player1);
      game.join(player2);

      expect(() => game.join(player3)).toThrowError(GAME_FULL_MESSAGE);
    });

    describe('When the player can be added', () => {
      it('assigns the first player as player1 with initial state', () => {
        const player = createPlayerForTesting();
        game.join(player);
        expect(game.state.player1).toEqual(player.id);
        expect(game.state.player2).toBeUndefined();
        expect(game.state.status).toEqual('WAITING_TO_START');
        expect(game.state.ready[player.id]).toEqual(false);
      });
      describe('When the second player joins', () => {
        const player1 = createPlayerForTesting();
        const player2 = createPlayerForTesting();
        beforeEach(() => {
          game.join(player1);
          game.join(player2);
        });
        it('assigns the second player as player2', () => {
          expect(game.state.player1).toEqual(player1.id);
          expect(game.state.player2).toEqual(player2.id);
        });
        it('sets the game status to WAITING_TO_START', () => {
          expect(game.state.status).toEqual('WAITING_TO_START');
          expect(game.state.winner).toBeUndefined();
        });
        it('initializes readiness states for both players', () => {
          expect(game.state.ready[player1.id]).toEqual(false);
          expect(game.state.ready[player2.id]).toEqual(false);
        });
      });
    });
  });
});
