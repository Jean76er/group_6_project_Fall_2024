import { GameArea, GameStatus, SillySharkGameState, Skin } from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, { GameEventTypes } from './GameAreaController';

export const PLAYER_NOT_IN_GAME_ERROR = 'Player is not in game';
export const NO_GAME_IN_PROGRESS_ERROR = 'No game in progress';
export const NO_INSTANCE_ERROR = 'No game instance found';

export type SillySharkEvents = GameEventTypes & {
  playersUpdated: (newPlayers: PlayerController[]) => void;
  playersReadyUpdated: (readyCount: number) => void;
  skinChanged: (data: [string, Skin | undefined][]) => void;
  gameStarted: () => void;
  positionUpdated: (data: [string, number][]) => void;
};
export default class SillySharkAreaController extends GameAreaController<
  SillySharkGameState,
  SillySharkEvents
> {
  protected _skins: { [playerName: string]: Skin } = {};

  protected _ready: { [playerID: string]: boolean } = {};

  public async setReady(playerId: string): Promise<void> {
    const instanceID = this._ensureInstanceID();
    // Send the ready command to the server
    await this._townController.sendInteractableCommand(this.id, {
      type: 'SetReady',
      gameID: instanceID,
      playerID: playerId,
    });
  }

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

  public async setPosition(positionY: number): Promise<void> {
    const instanceID = this._ensureInstanceID();
    // Send the ready command to the server
    await this._townController.sendInteractableCommand(this.id, {
      type: 'RenderSprite',
      gameID: instanceID,
      positionY: positionY,
    });
  }

  public async startGame(): Promise<void> {
    const instanceID = this._ensureInstanceID();
    // Send the ready command to the server
    await this._townController.sendInteractableCommand(this.id, {
      type: 'StartGame',
      gameID: instanceID,
    });

    this.emit('gameStarted');
  }

  public get skinsState(): [string, Skin | undefined][] {
    const skinsmap = this._model.game?.state.skins;
    const players = this._players;

    if (skinsmap && players) {
      return players.map(player => [player.userName, skinsmap[player.id]]);
    }

    // If no skinsmap or players are available, return an empty array
    return [];
  }

  /**get how many players are ready */
  public get readyCount(): number {
    const readymap = this._model.game?.state.ready;
    if (readymap) {
      return Object.values(readymap).filter(ready => ready).length;
    }
    return 0;
  }

  public get renderPlayerState(): [string, number][] {
    const renderPlayerMap = this._model.game?.state.spritesData;
    const players = this._players;

    if (renderPlayerMap && players) {
      return players.map(player => [player.userName, renderPlayerMap[player.id]]);
    }
    return [];
  }

  get player1(): PlayerController | undefined {
    return this._players[0] || undefined;
  }

  get player2(): PlayerController | undefined {
    return this._players[1] || undefined;
  }

  get skin(): Skin | undefined {
    if (this._skins) {
      return this._skins[this._townController.ourPlayer.id];
    }
    return undefined;
  }

  set skin(skin: Skin | undefined) {
    this._skins[this._townController.ourPlayer.id] =
      skin ?? '/SillySharkResources/skins/sillyshark.png';
  }

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

  get isPlayer(): boolean {
    return this._players.includes(this._townController.ourPlayer);
  }

  get status(): GameStatus {
    const gameState = this._model.game?.state;
    if (gameState?.status === 'SINGLE_PLAYER_IN_PROGRESS') {
      return 'SINGLE_PLAYER_IN_PROGRESS';
    } else if (gameState?.status === 'MULTI_PLAYER_IN_PROGRESS') {
      return 'MULTI_PLAYER_IN_PROGRESS';
    } else if (gameState?.status === 'OVER') {
      return 'OVER';
    }
    return 'WAITING_TO_START';
  }

  public isActive(): boolean {
    const gameState = this._model.game?.state;
    return (
      gameState?.status === 'SINGLE_PLAYER_IN_PROGRESS' ||
      gameState?.status === 'MULTI_PLAYER_IN_PROGRESS'
    );
  }

  public updateFrom(newModel: GameArea<SillySharkGameState>): void {
    const previousReadyCount = this.readyCount;
    const previousSkinsState = this.skinsState;
    const previousPlayerIds = this._players.map(player => player.id);
    const previousPosition = this.renderPlayerState;

    super._updateFrom(newModel);

    const currentReadyCount = this.readyCount;
    const currentSkinsState = this.skinsState;
    const currentPlayerIds = this._players.map(player => player.id);
    const currentPosition = this.renderPlayerState;

    if (!this._arraysEqual(previousPlayerIds, currentPlayerIds)) {
      this.emit('playersUpdated', this._players);
    }
    if (previousReadyCount !== currentReadyCount) {
      this.emit('playersReadyUpdated', currentReadyCount);
      if (currentReadyCount === 2) {
        this.startGame().catch(console.error);
      }
    }
    if (!this._arraysEqual(previousSkinsState, currentSkinsState)) {
      this.emit('skinChanged', currentSkinsState);
    }
    if (!this._arraysEqual(previousPosition, currentPosition)) {
      this.emit('positionUpdated', currentPosition);
    }
  }

  private _arraysEqual<T>(a: T[], b: T[]): boolean {
    return a.length === b.length && a.every((value, index) => value === b[index]);
  }

  private _ensureInstanceID(): string {
    const instanceID = this._instanceID;
    if (!instanceID) {
      throw new Error(NO_INSTANCE_ERROR);
    }
    return instanceID;
  }

  public async jump(): Promise<void> {
    this.emit('jump');
  }
}
