import { GameArea, GameStatus, SillySharkGameState, Skin } from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';
import TownController from '../TownController';

export const PLAYER_NOT_IN_GAME_ERROR = 'Player is not in game';
export const NO_GAME_IN_PROGRESS_ERROR = 'No game in progress';
export const NO_INSTANCE_ERROR = 'No game instance found';

export type SillySharkEvents = GameEventTypes & {
  playersUpdated: (newPlayers: PlayerController[]) => void;
  playersReadyUpdated: (readyCount: number) => void;
  skinChanged: (data: [string, Skin | undefined][]) => void;
  gameStarted: () => void;
  positionUpdated: (data: [string, number][]) => void;
  loserUpdated: (player: PlayerController) => void;
  gamePlayersChanged: (players: PlayerController[]) => void;
};

/**
 * This class is responsible for managing the state of the SillyShark game, and for sending commands to the server
 */
export default class SillySharkAreaController extends GameAreaController<
  SillySharkGameState,
  SillySharkEvents
> {
  protected _skins: { [playerName: string]: Skin } = {};

  protected _ready: { [playerID: string]: boolean } = {};

  /** Sends a request to the server to set the player ready
   * Uses the this._townController.sendInteractableCommand method to send the request.
   * The request should be of type 'SetReady',
   * and send the gameID provided by `this._instanceID`.
   *
   * @param playerId id of the player that's ready
   */
  public async setReady(playerId: string): Promise<void> {
    const instanceID = this._ensureInstanceID();
    // Send the ready command to the server
    await this._townController.sendInteractableCommand(this.id, {
      type: 'SetReady',
      gameID: instanceID,
      playerID: playerId,
    });
  }

  /** Sends a request to the server to set the player's skin.
   * Uses the this._townController.sendInteractableCommand method to send the request.
   * The request should be of type 'SetSkin',
   * and send the gameID provided by `this._instanceID`.
   *
   * @param playerId id of the player
   * @param skin the skin that the player will get
   */
  public async setSkin(playerId: string, skin: Skin): Promise<void> {
    const instanceID = this._ensureInstanceID();
    // Send the ready command to the server
    await this._townController.sendInteractableCommand(this.id, {
      type: 'SetSkin',
      gameID: instanceID,
      playerID: playerId,
      skin: skin,
    });
    this.skin = skin;
  }

  /** Sends a request to the server to set player as the loser of the game.
   * Uses the this._townController.sendInteractableCommand method to send the request.
   * The request should be of type 'CheckForWinner',
   * and send the gameID provided by `this._instanceID`.
   *
   * @param player the player that lost
   */
  public async setLoser(player: PlayerController): Promise<void> {
    const instanceID = this._ensureInstanceID();
    // Send the ready command to the server
    await this._townController.sendInteractableCommand(this.id, {
      type: 'CheckForWinner',
      gameID: instanceID,
      playerID: player.id,
    });
  }

  /** Sends a request to the server to set the players positon.
   * Uses the this._townController.sendInteractableCommand method to send the request.
   * The request should be of type 'RenderSprite',
   * and send the gameID provided by `this._instanceID`.
   *
   * @param positionY the position of the player that called this method
   */
  public async setPosition(positionY: number): Promise<void> {
    const instanceID = this._ensureInstanceID();
    await this._townController.sendInteractableCommand(this.id, {
      type: 'RenderSprite',
      gameID: instanceID,
      positionY: positionY,
    });
  }

  /** Sends a request to the server to start the game.
   * Uses the this._townController.sendInteractableCommand method to send the request.
   * The request should be of type 'StartGame',
   * and send the gameID provided by `this._instanceID`.
   *
   */
  public async startGame(): Promise<void> {
    const instanceID = this._ensureInstanceID();
    await this._townController.sendInteractableCommand(this.id, {
      type: 'StartGame',
      gameID: instanceID,
    });

    this.emit('gameStarted');
  }

  /** Returns a map with a playerId and a skin attached to it*/
  public get skinsState(): [string, Skin | undefined][] {
    const skinsmap = this._model.game?.state.skins;
    const players = this._players;

    if (skinsmap && players) {
      return players.map(player => [player.id, skinsmap[player.id]]);
    }

    /**If no skinsmap or players are available, return an empty array*/
    return [];
  }

  /**
   * Returns how many players are ready, if the ready players array is not initialized it returns 0.
   */
  public get readyCount(): number {
    const readymap = this._model.game?.state.ready;
    if (readymap) {
      return Object.values(readymap).filter(ready => ready).length;
    }
    return 0;
  }

  /**
   * Returns the array with the renderState (A player and their current position), returns empty array if
   * the positions are not initialized.
   */
  public get renderPlayerState(): [string, number][] {
    const renderPlayerMap = this._model.game?.state.spritesData;
    const players = this._players;

    if (renderPlayerMap && players) {
      return players.map(player => [player.id, renderPlayerMap[player.id]]);
    }
    return [];
  }

  /**
   * Returns player1 if there is one, or undefined otherwise
   */
  get player1(): PlayerController | undefined {
    return this._players[0] || undefined;
  }

  /**
   * Returns player2 if there is one, or undefined otherwise
   */
  get player2(): PlayerController | undefined {
    return this._players[1] || undefined;
  }

  /**
   * Returns the skin of the player
   */
  get skin(): Skin | undefined {
    if (this._skins) {
      return this._skins[this._townController.ourPlayer.id];
    }
    return undefined;
  }

  /**
   * Sets the skin of the player, and gives them the default skin if the skin is undefined
   * @skin given skin
   */
  set skin(skin: Skin | undefined) {
    this._skins[this._townController.ourPlayer.id] =
      skin ?? '/SillySharkResources/skins/sillyshark.png';
  }

  /**
   * Returns the winner of the game, if there is one
   */
  get winner(): PlayerController | undefined {
    const gameState = this._model.game?.state;
    if (gameState && gameState.winner === gameState.player1) {
      return this._players[0];
    } else if (gameState && gameState.winner === gameState.player2) {
      return this._players[1];
    } else {
      return undefined;
    }
  }

  /**
   * Returns true if the current player is a player in this game
   */
  get isPlayer(): boolean {
    return this._players.includes(this._townController.ourPlayer);
  }

  /**
   * Returns status of the game.
   */
  get status(): GameStatus {
    const gameState = this._model.game?.state;
    if (gameState?.status === 'IN_PROGRESS') {
      return 'IN_PROGRESS';
    }
    return 'WAITING_TO_START';
  }

  /**
   * Returns true if the game is in progress
   */
  public isActive(): boolean {
    const gameState = this._model.game?.state;
    return gameState?.status === 'IN_PROGRESS';
  }

  /**
   * Updates the internal state of this SillySharkAreaControler to match the new model.
   *
   * Calls super._updateFrom, which updates common properties in th game area (including this._model).
   *
   * If the amount of players in the town changed, emits a 'playerUpdated' event.
   *
   * If a new player clicks ready, emits 'playersReadyUpdated' and starts game if the amount of
   * ready players is two.
   *
   * If the amount of players in the SillyShark game changes, emits 'gamePlayersChanged'
   *
   * If there's a winner in the game, emits 'loserUpdated'.
   *
   * If a player changes their skin, emits 'skinChanged'.
   *
   * If the players position changes, emits 'positionUpdated'
   *
   */
  public updateFrom(newModel: GameArea<SillySharkGameState>): void {
    const previousReadyCount = this.readyCount;
    const previousSkinsState = this.skinsState;
    const previousPlayerIds = this._players.map(player => player.id);
    const previousPosition = this.renderPlayerState;
    const previousGamePlayers = this.players;

    super._updateFrom(newModel);

    const currentReadyCount = this.readyCount;
    const currentSkinsState = this.skinsState;
    const currentPlayerIds = this._players.map(player => player.id);
    const currentPosition = this.renderPlayerState;
    const currentGamePlayers = this.players;

    if (!this._arraysEqual(previousPlayerIds, currentPlayerIds)) {
      this.emit('playersUpdated', this.players);
    }
    if (previousReadyCount !== currentReadyCount) {
      this.emit('playersReadyUpdated', currentReadyCount);
      if (currentReadyCount === 2) {
        this.startGame().catch(console.error);
      }
    }
    if (previousGamePlayers !== currentGamePlayers) {
      this.emit('gamePlayersChanged', currentGamePlayers);
    }

    if (this.winner) {
      this.emit('loserUpdated', this.winner);
    }

    if (!this._arraysEqual(previousSkinsState, currentSkinsState)) {
      this.emit('skinChanged', currentSkinsState);
    }

    if (!this._arraysEqual(previousPosition, currentPosition)) {
      this.emit('positionUpdated', currentPosition);
    }
  }

  /** Helper function to compare arrays */
  private _arraysEqual<T>(a: T[], b: T[]): boolean {
    return a.length === b.length && a.every((value, index) => value === b[index]);
  }

  /**Helper function to ensure there's an instanceID */
  private _ensureInstanceID(): string {
    const instanceID = this._instanceID;
    if (!instanceID) {
      throw new Error(NO_INSTANCE_ERROR);
    }
    return instanceID;
  }

  /** Emits 'jump' event */
  public async jump(): Promise<void> {
    this.emit('jump');
  }

  public get instanceID(): string {
    return this._instanceID ?? '';
  }

  public set instanceID(value: string) {
    this._instanceID = value;
  }

  public get model(): GameArea<SillySharkGameState> {
    return this._model;
  }

  public set model(value: GameArea<SillySharkGameState>) {
    this._model = value;
  }

  public get townController(): TownController {
    return this._townController;
  }
}
