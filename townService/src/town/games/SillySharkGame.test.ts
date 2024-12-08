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
  describe('[T1.2] _leave', () => {
    it('should throw an error if the player is not in the game', () => {
      expect(() => game.leave(createPlayerForTesting())).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
      const player = createPlayerForTesting();
      game.join(player);
      expect(() => game.leave(createPlayerForTesting())).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
    });

    describe('when in single-player mode', () => {
      it('should reset the game state when the single player leaves', () => {
        const player = createPlayerForTesting();
        game.join(player);

        game.startSinglePlayer();
        expect(game.state.status).toEqual('SINGLE_PLAYER_IN_PROGRESS');

        game.leave(player);

        // Ensure the game resets completely
        expect(game.state.player1).toBeUndefined();
        expect(game.state.player2).toBeUndefined();
        expect(game.state.status).toEqual('WAITING_TO_START');
        expect(game.state.ready).toEqual({});
        expect(game.state.spritesData).toEqual({});
        expect(game.state.score).toEqual({});
        expect(game.state.lost).toEqual({});
      });
    });

    describe('when in multiplayer mode', () => {
      describe('when player 1 leaves', () => {
        it('should remove player 1, mark player 2 as the winner, and keep the game in progress', () => {
          const player1 = createPlayerForTesting();
          const player2 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);
          game.setReady(player1);
          game.setReady(player2);
          game.startMultiPlayer();

          expect(game.state.player1).toEqual(player1.id);
          expect(game.state.player2).toEqual(player2.id);
          expect(game.state.status).toEqual('MULTI_PLAYER_IN_PROGRESS');

          game.leave(player1);

          // Ensure player1 is removed and player2 is the winner
          expect(game.state.player1).toBeUndefined();
          expect(game.state.player2).toEqual(player2.id);
          expect(game.state.status).toEqual('MULTI_PLAYER_IN_PROGRESS');
          expect(game.state.winner).toEqual(player2.id);
        });
      });

      describe('when player 2 leaves', () => {
        it('should remove player 2, mark player 1 as the winner, and keep the game in progress', () => {
          const player1 = createPlayerForTesting();
          const player2 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);
          game.setReady(player1);
          game.setReady(player2);
          game.startMultiPlayer();

          expect(game.state.player1).toEqual(player1.id);
          expect(game.state.player2).toEqual(player2.id);
          expect(game.state.status).toEqual('MULTI_PLAYER_IN_PROGRESS');

          game.leave(player2);

          // Ensure player2 is removed and player1 is the winner
          expect(game.state.player1).toEqual(player1.id);
          expect(game.state.player2).toBeUndefined();
          expect(game.state.status).toEqual('MULTI_PLAYER_IN_PROGRESS');
          expect(game.state.winner).toEqual(player1.id);
        });
      });

      describe('when both players leave', () => {
        it('should reset the game state to WAITING_TO_START when both players are gone', () => {
          const player1 = createPlayerForTesting();
          const player2 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);
          game.setReady(player1);
          game.setReady(player2);
          game.startMultiPlayer();

          expect(game.state.player1).toEqual(player1.id);
          expect(game.state.player2).toEqual(player2.id);
          expect(game.state.status).toEqual('MULTI_PLAYER_IN_PROGRESS');

          game.leave(player1);
          game.leave(player2);

          // Ensure the game resets completely
          expect(game.state.player1).toBeUndefined();
          expect(game.state.player2).toBeUndefined();
          expect(game.state.status).toEqual('WAITING_TO_START');
          expect(game.state.winner).toBeUndefined();
          expect(game.state.ready).toEqual({});
        });
      });
    });
  });
});
