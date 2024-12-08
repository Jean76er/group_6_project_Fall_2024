import { createPlayerForTesting } from '../../TestUtils';
import {
  GAME_FULL_MESSAGE,
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

          expect(game.state.player1).toBeUndefined();
          expect(game.state.player2).toBeUndefined();
          expect(game.state.status).toEqual('WAITING_TO_START');
          expect(game.state.winner).toBeUndefined();
          expect(game.state.ready).toEqual({});
        });
      });
    });
  });

  describe('[T1.3] gamestart', () => {
    it('should throw an error if the both players are not ready before starting multiplayer', () => {
      const player1 = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      game.join(player1);
      game.join(player2);
      game.setReady(player1);
      expect(() => game.startMultiPlayer()).toThrowError(BOTH_PLAYERS_READY_MESSAGE);
    });
    it('should successfully enter SINGLE_PLAYER_IN_PROGRESS', () => {
      const player = createPlayerForTesting();
      game.join(player);
      expect(game.state.status).toEqual('WAITING_TO_START');
      game.setReady(player);
      game.startSinglePlayer();
      expect(game.state.status).toEqual('SINGLE_PLAYER_IN_PROGRESS');
    });
  });

  describe('[T1.4] Winner Detection', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();
    beforeEach(() => {
      game.join(player1);
      game.join(player2);
      game.setReady(player1);
      game.setReady(player2);
      game.startMultiPlayer();

      expect(game.state.status).toEqual('MULTI_PLAYER_IN_PROGRESS');
    });

    it('should declare player 1 as the winner when their score is higher', () => {
      game.updateScore(player1, 10);
      game.updateScore(player2, 5);

      game.checkForWinner();

      expect(game.state.winner).toEqual(player1.id);
      expect(game.state.lost[player1.id]).toEqual(false);
      expect(game.state.lost[player2.id]).toEqual(true);
    });

    it('should declare player 2 as the winner when their score is higher', () => {
      game.updateScore(player1, 5);
      game.updateScore(player2, 15);

      game.checkForWinner();

      expect(game.state.winner).toEqual(player2.id);
      expect(game.state.lost[player1.id]).toEqual(true);
      expect(game.state.lost[player2.id]).toEqual(false);
    });

    it('should declare a tie when both players have the same score', () => {
      game.updateScore(player1, 10);
      game.updateScore(player2, 10);

      game.checkForWinner();

      expect(game.state.winner).toBeUndefined();
      expect(game.state.lost[player1.id]).toEqual(true);
      expect(game.state.lost[player2.id]).toEqual(true);
    });

    it('should not declare a winner when no scores are set', () => {
      game.checkForWinner();

      expect(game.state.winner).toBeUndefined();
      expect(game.state.lost[player1.id]).toEqual(true);
      expect(game.state.lost[player2.id]).toEqual(true);
    });
  });

  describe('[T1.5] Position Updates', () => {
    let player: Player;

    beforeEach(() => {
      player = createPlayerForTesting();
      game.join(player);
      expect(game.state.player1).toEqual(player.id);
    });

    it('should update the position for a valid input within bounds', () => {
      const validPosition = 100;

      game.setPosition(player, validPosition);
      expect(game.state.spritesData[player.id]).toEqual(validPosition);
    });

    it('should allow position at the boundary (0)', () => {
      const boundaryPosition = 0;
      game.setPosition(player, boundaryPosition);
      expect(game.state.spritesData[player.id]).toEqual(boundaryPosition);
    });

    it('should allow position at the upper boundary (canvas height)', () => {
      const boundaryPosition = game.state.canvasHeight;

      game.setPosition(player, boundaryPosition);
      expect(game.state.spritesData[player.id]).toEqual(boundaryPosition);
    });

    it('should throw an error for a position below 0', () => {
      const invalidPosition = -10;

      expect(() => game.setPosition(player, invalidPosition)).toThrowError(
        'Position is out of bounds.',
      );
    });

    it('should throw an error for a position above canvas height', () => {
      const invalidPosition = game.state.canvasHeight + 1;

      expect(() => game.setPosition(player, invalidPosition)).toThrowError(
        'Position is out of bounds.',
      );
    });

    it('should throw an error if a non-participating player attempts to update position', () => {
      const nonParticipatingPlayer = createPlayerForTesting();

      expect(() => game.setPosition(nonParticipatingPlayer, 100)).toThrowError(
        'Player is not part of this game.',
      );
    });
  });

  describe('[T1.6] Score Management', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();

    beforeEach(() => {
      game.join(player1);
      game.join(player2);
    });

    it('should update the score for a valid player', () => {
      game.updateScore(player1, 10);

      expect(game.state.score[player1.id]).toEqual(10);
    });

    it('should allow scores to be updated multiple times', () => {
      game.updateScore(player1, 5);
      game.updateScore(player1, 15);

      expect(game.state.score[player1.id]).toEqual(15);
    });

    it('should not affect other players when updating one player’s score', () => {
      game.updateScore(player1, 20);

      expect(game.state.score[player2.id]).toBeUndefined();
      expect(game.state.score[player1.id]).toEqual(20);
    });

    it('should throw an error when updating score for a non-participating player', () => {
      const nonParticipatingPlayer = createPlayerForTesting();

      expect(() => game.updateScore(nonParticipatingPlayer, 10)).toThrowError(
        'Player is not in this game',
      );
    });

    it('should handle a score of 0 without errors', () => {
      game.updateScore(player1, 0);

      expect(game.state.score[player1.id]).toEqual(0);
    });
  });

  describe('[T1.7] Skin Customization', () => {
    const player = createPlayerForTesting();
    beforeEach(() => {
      game.join(player);
      expect(game.state.player1).toEqual(player.id);
    });

    it('should set a custom skin for a valid player', () => {
      const customSkin = '/customSkin.png';

      game.setSkin(player, customSkin);

      expect(game.state.skins?.[player.id]).toEqual(customSkin);
    });

    it('should apply the default skin if no skin is provided', () => {
      game.setSkin(player, undefined);

      expect(game.state.skins?.[player.id]).toEqual('/SillySharkResources/skins/sillyshark.png');
    });

    it('should allow the player to update their skin multiple times', () => {
      const skin1 = '/skin1.png';
      const skin2 = '/skin2.png';

      game.setSkin(player, skin1);
      expect(game.state.skins?.[player.id]).toEqual(skin1);

      game.setSkin(player, skin2);
      expect(game.state.skins?.[player.id]).toEqual(skin2);
    });

    it('should throw an error if a non-participating player tries to set a skin', () => {
      const nonParticipatingPlayer = createPlayerForTesting();

      expect(() => game.setSkin(nonParticipatingPlayer, '/customSkin.png')).toThrowError(
        'Player is not in this game',
      );
    });
  });

  describe('[T1.8] Skin Selection Prioritization', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();

    beforeEach(() => {
      game.join(player1);
      game.join(player2);
      expect(game.state.player1).toEqual(player1.id);
      expect(game.state.player2).toEqual(player2.id);
    });

    it('should allow the first player to select any skin', () => {
      const customSkin = '/uniqueSkin1.png';

      game.setSkin(player1, customSkin);
      expect(game.state.skins?.[player1.id]).toEqual(customSkin);
    });

    it('should prevent the second player from selecting the same skin as the first player', () => {
      const customSkin = '/uniqueSkin1.png';

      game.setSkin(player1, customSkin);

      expect(game.state.skins?.[player2.id]).toBeUndefined();
    });

    it('should allow the second player to select a different skin', () => {
      const skin1 = '/uniqueSkin1.png';
      const skin2 = '/uniqueSkin2.png';

      game.setSkin(player1, skin1);
      game.setSkin(player2, skin2);

      expect(game.state.skins?.[player1.id]).toEqual(skin1);
      expect(game.state.skins?.[player2.id]).toEqual(skin2);
    });

    it('should not allow the second player to overwrite the first player’s skin', () => {
      const skin1 = '/uniqueSkin1.png';

      game.setSkin(player1, skin1);

      expect(game.state.skins?.[player1.id]).toEqual(skin1);
    });

    it('should allow the first player to change their skin, and the second player cannot use the new skin', () => {
      const skin1 = '/uniqueSkin1.png';
      const skin2 = '/uniqueSkin2.png';

      game.setSkin(player1, skin1);
      game.setSkin(player1, skin2);

      expect(game.state.skins?.[player1.id]).toEqual(skin2);
    });
  });
});
