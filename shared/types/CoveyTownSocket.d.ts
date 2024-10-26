export type TownJoinResponse = {
  /** Unique ID that represents this player * */
  userID: string;
  /** Secret token that this player should use to authenticate
   * in future requests to this service * */
  sessionToken: string;
  /** Secret token that this player should use to authenticate
   * in future requests to the video service * */
  providerVideoToken: string;
  /** List of players currently in this town * */
  currentPlayers: Player[];
  /** Friendly name of this town * */
  friendlyName: string;
  /** Is this a private town? * */
  isPubliclyListed: boolean;
  /** Current state of interactables in this town */
  interactables: Interactable[];
}

export type Interactable = ViewingArea | ConversationArea;

export type TownSettingsUpdate = {
  friendlyName?: string;
  isPubliclyListed?: boolean;
}

export type Direction = 'front' | 'back' | 'left' | 'right';
export interface Player {
  id: string;
  userName: string;
  location: PlayerLocation;
};

export type XY = { x: number, y: number };

export interface PlayerLocation {
  /* The CENTER x coordinate of this player's location */
  x: number;
  /* The CENTER y coordinate of this player's location */
  y: number;
  /** @enum {string} */
  rotation: Direction;
  moving: boolean;
  interactableID?: string;
};
export type ChatMessage = {
  author: string;
  sid: string;
  body: string;
  dateCreated: Date;
};

export interface ConversationArea {
  id: string;
  topic?: string;
  occupantsByID: string[];
};
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
};

export interface ViewingArea {
  id: string;
  video?: string;
  isPlaying: boolean;
  elapsedTimeSec: number;
}

export interface ServerToClientEvents {
  playerMoved: (movedPlayer: Player) => void;
  playerDisconnect: (disconnectedPlayer: Player) => void;
  playerJoined: (newPlayer: Player) => void;
  initialize: (initialData: TownJoinResponse) => void;
  townSettingsUpdated: (update: TownSettingsUpdate) => void;
  townClosing: () => void;
  chatMessage: (message: ChatMessage) => void;
  interactableUpdate: (interactable: Interactable) => void;
}

export interface ClientToServerEvents {
  chatMessage: (message: ChatMessage) => void;
  playerMovement: (movementData: PlayerLocation) => void;
  interactableUpdate: (update: Interactable) => void;
}

export type GameInstanceID = string;
export type InteractableID = string;
export type PlayerID = string;

/** 
 * SINGLE_PLAYER_IN_PROGRESS: One player in game
 * MULTI_PLAYER_IN_PROGRESS: Two players in game
 * OVER: Game is over when both players have crashed into an obstacle and players are either restarting the game or leaving
 * WAITING_TO_START: Game is waiting for player(s) to join
 */
export type GameStatus = 'SINGLE_PLAYER_IN_PROGRESS' | 'MULTI_PLAYER_IN_PROGRESS' | 'OVER' | 'WAITING_TO_START';

/** 
 * Base type for the state of the game
*/
export interface GameState{
  status: GameStatus;
}

/**
 * Type for the state of a game that can be won
 */
export interface WinnableGameState extends GameState{
  winner?: PlayerID;
}

export interface GameResult{
  gameID: gameInstanceID;
  winner?: PlayerID;
}

export interface GameInstance<GS extends GameState> {
  state: GS;
  id: GameInstanceID;
  players: PlayerID[];
  result?: GameResult;
}
