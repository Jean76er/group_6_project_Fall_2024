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
    });

    describe('when player 1 leaves', () => {
      it('should remove player 1, mark player 2 as the winner, and keep the game in progress', () => {
        const player1 = createPlayerForTesting();
        const player2 = createPlayerForTesting();
        game.join(player1);
        game.join(player2);
        game.setReady(player1);
        game.setReady(player2);
        game.startGame();

        expect(game.state.player1).toEqual(player1.id);
        expect(game.state.player2).toEqual(player2.id);
        expect(game.state.status).toEqual('IN_PROGRESS');

        game.leave(player1);

        // Ensure player1 is removed and player2 is the winner
        expect(game.state.player1).toBeUndefined();
        expect(game.state.player2).toEqual(player2.id);
        expect(game.state.status).toEqual('IN_PROGRESS');
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
        game.startGame();

        expect(game.state.player1).toEqual(player1.id);
        expect(game.state.player2).toEqual(player2.id);
        expect(game.state.status).toEqual('IN_PROGRESS');

        game.leave(player2);

        // Ensure player2 is removed and player1 is the winner
        expect(game.state.player1).toEqual(player1.id);
        expect(game.state.player2).toBeUndefined();
        expect(game.state.status).toEqual('IN_PROGRESS');
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
        game.startGame();

        expect(game.state.player1).toEqual(player1.id);
        expect(game.state.player2).toEqual(player2.id);
        expect(game.state.status).toEqual('IN_PROGRESS');

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

  describe('[T1.3] gamestart', () => {
    it('should throw an error if the both players are not ready before starting', () => {
      const player1 = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      game.join(player1);
      game.join(player2);
      game.setReady(player1);
      expect(() => game.startGame()).toThrowError(BOTH_PLAYERS_READY_MESSAGE);
    });
    it('should set status to IN_PROGRESS when both players are ready and game has started', () => {
      const player1 = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      game.join(player1);
      game.join(player2);
      game.setReady(player1);
      game.setReady(player2);
      game.startGame();
      expect(game.state.status).toEqual('IN_PROGRESS');
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
      game.startGame();

      expect(game.state.status).toEqual('IN_PROGRESS');
      expect(game.state.winner).toBeUndefined();
      expect(game.state.lost).toEqual({});
    });

    it('should throw an error if both players are not present', () => {
      const newGame = new SillySharkGame();
      expect(() => newGame.checkForWinner(player1.id)).toThrowError(
        'Both players must be in the game to determine a winner.',
      );
    });

    it('should throw an error for an invalid player ID', () => {
      const invalidPlayer = createPlayerForTesting();
      expect(() => game.checkForWinner(invalidPlayer.id)).toThrowError('Invalid player ID.');
    });

    it('should declare player 2 as the winner when player 1’s ID is passed', () => {
      game.checkForWinner(player1.id);

      expect(game.state.winner).toEqual(player2.id);
      expect(game.state.lost).toEqual({ [player1.id]: true, [player2.id]: false });
    });

    it('should declare player 1 as the winner when player 2’s ID is passed', () => {
      game.checkForWinner(player2.id);

      expect(game.state.winner).toEqual(player1.id);
      expect(game.state.lost).toEqual({ [player1.id]: false, [player2.id]: true });
    });

    it('should not update the winner if it is already set', () => {
      game.checkForWinner(player1.id);

      game.checkForWinner(player2.id);

      expect(game.state.winner).toEqual(player2.id);
      expect(game.state.lost).toEqual({ [player1.id]: true, [player2.id]: false });
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
});
