import {
  ConversationArea,
  Interactable,
  ViewingArea,
  GameArea,
  SillySharkGameState,
} from './CoveyTownSocket';

/**
 * Test to see if an interactable is a conversation area
 */
export function isConversationArea(interactable: Interactable): interactable is ConversationArea {
  return 'occupantsByID' in interactable;
}
/**
 * Test to see if an interactable is a SillyShark area
 */
export function isSillySharkArea(
  interactable: Interactable,
): interactable is GameArea<SillySharkGameState> {
  return 'game' in interactable;
}
/**
 * Test to see if an interactable is a viewing area
 */
export function isViewingArea(interactable: Interactable): interactable is ViewingArea {
  return 'isPlaying' in interactable;
}
