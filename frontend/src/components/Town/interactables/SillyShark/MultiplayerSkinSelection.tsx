import {
  Button,
  chakra,
  ModalContent,
  Image,
  ModalHeader,
  Container,
  Center,
  List,
  ListItem,
  useToast,
  Modal,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import SillySharkAreaController from '../../../../classes/interactable/SillySharkAreaController';
import GameAreaInteractable from '../GameArea';
import { Skin } from '../../../../types/CoveyTownSocket';
import TownController from '../../../../classes/TownController';
import NewMultiplayerSillySharkCanvas from './MultiplayerSillySharkCanvas';

/**
 * An enum that defines the file paths for the available skins in the SillyShark game.
 *
 * Each key in the enum represents a skin's name, and its value is the relative path to the corresponding
 * image file for that skin. These paths are used to dynamically load and display the skin options
 * for the player during the selection process.
 */
export enum Skins {
  SillyShark = '/SillySharkResources/skins/sillyshark.png',
  Walrus = '/SillySharkResources/skins/walrus.png',
  Penguin = '/SillySharkResources/skins/penguin.png',
  PolarBear = '/SillySharkResources/skins/polarbear.png',
}

/**
 * A constant array that contains all the skins available for selection.
 *
 * This array is populated using the values from the Skins enum and is used to dynamically render
 * the skin selection options in the SkinSelectionScreen component.
 */
const SKINS = [Skins.SillyShark, Skins.Walrus, Skins.Penguin, Skins.PolarBear];

/**
 * This component renders a square that contains an image of the skin to be chosen
 */
const StyledSelectionSquare = chakra(Button, {
  baseStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    flexBasis: '50%',
    padding: '5px',
    border: '1px solid black',
    height: '50%',
    fontSize: '50px',
    _disabled: {
      opacity: '50%',
    },
  },
});

/**
 * A component that will render the Container for the skins
 */
const StyledSelectionContainer = chakra(Container, {
  baseStyle: {
    display: 'flex',
    width: '400px',
    height: '400px',
    padding: '5px',
    flexWrap: 'wrap',
  },
});

/**
 * A component that renders the Multiplayer Skin Selection Screen
 *
 * Renders a skin selection screen as a modal, allowing players to select their desired skins.
 * The modal displays all available skins, showing visual indicators to indicate whether a skin is
 * selected by the current player (blue border) or by another player (red border).
 *
 * The component listens for updates to the player readiness status, skin selections, and game state.
 * When both players are ready, the game starts, and a canvas is displayed.
 *
 * Players must select a skin before continuing. If a player attempts to continue without selecting
 * a skin, a toast is displayed. The number of players who are ready is shown at the bottom of the modal.
 *
 * @param gameAreaController - the controller for managing skin selection and game state
 * @param gameArea - the current game area interactable
 * @param coveyTownController - the controller for managing the town and interactions
 */

export default function MultiplayerSkinSelectionScreen({
  gameAreaController,
  gameArea,
  coveyTownController,
}: {
  gameAreaController: SillySharkAreaController;
  gameArea: GameAreaInteractable;
  coveyTownController: TownController;
}): JSX.Element {
  const [showCanvas, setShowCanvas] = useState(false);
  const [skinSelected, setSkinSelected] = useState<Skin | undefined>(undefined);
  const [playersReady, setPlayersReady] = useState(gameAreaController.readyCount);
  const [skinsState, setSkinsState] = useState(gameAreaController.skinsState);
  const [hasClickedContinue, setHasClickedContinue] = useState(false);
  const ourPlayer = coveyTownController.ourPlayer;

  const toast = useToast();

  const handleSkinSelection = useCallback(
    (skin: Skin) => {
      setSkinSelected(skin);
      gameAreaController.setSkin(ourPlayer.id, skin);
    },
    [gameAreaController, ourPlayer.id],
  );

  const handleCanvas = useCallback(() => {
    if (hasClickedContinue) {
      return;
    }
    if (!skinSelected) {
      toast({
        title: 'Select a skin before continuing',
      });
      return;
    }
    setHasClickedContinue(true);
    gameAreaController.setReady(ourPlayer.id);

    if (playersReady === 2) {
      setShowCanvas(true);
      gameAreaController.startGame();
    }
  }, [toast, skinSelected, playersReady, gameAreaController, ourPlayer.id, hasClickedContinue]);

  useEffect(() => {
    const handlePlayersReadyUpdated = (readyCount: number) => {
      setPlayersReady(readyCount);
    };

    const handleSkinChanged = (updatedSkins: [string, Skin | undefined][]) => {
      setSkinsState(updatedSkins);
    };

    const handleGameStarted = () => {
      setShowCanvas(true);
    };

    gameAreaController.addListener('playersReadyUpdated', handlePlayersReadyUpdated);
    gameAreaController.addListener('skinChanged', handleSkinChanged);
    gameAreaController.addListener('gameStarted', handleGameStarted);

    return () => {
      gameAreaController.removeListener('playersReadyUpdated', handlePlayersReadyUpdated);
      gameAreaController.removeListener('skinChanged', handleSkinChanged);
      gameAreaController.removeListener('gameStarted', handleGameStarted);
    };
  }, [gameAreaController]);

  const closeModal = useCallback(() => {
    if (gameArea) {
      coveyTownController.unPause();
      coveyTownController.interactEnd(gameArea);
      const controller = coveyTownController.getGameAreaController(gameArea);
      controller.leaveGame();
    }
  }, [coveyTownController, gameArea]);

  const renderSkins = useCallback(
    () => (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
        <ModalContent maxW='500px' h='720px' bg='skyblue'>
          <ModalHeader>
            <Center>Select your skin, {ourPlayer.userName}!</Center>
          </ModalHeader>

          <StyledSelectionContainer>
            {SKINS.map(skin => {
              const isOwnedByUs = skinSelected === skin;
              const isOwnedByOther = skinsState.some(
                ([playerID, selectedSkin]) => playerID !== ourPlayer.id && selectedSkin === skin,
              );

              let borderStyle = 'none';
              if (isOwnedByUs) {
                borderStyle = '7px solid blue';
              } else if (isOwnedByOther) {
                borderStyle = '7px solid red';
              }

              return (
                <StyledSelectionSquare
                  key={skin}
                  onClick={() => handleSkinSelection(skin)}
                  border={borderStyle}
                  isDisabled={isOwnedByOther}>
                  <Image src={skin} alt='Skin Image' objectFit='contain' boxSize='100%' />
                </StyledSelectionSquare>
              );
            })}
          </StyledSelectionContainer>

          <Center>
            <List aria-label='list of players in the game'>
              {skinsState.map(([playerID, skin]) => {
                const player =
                  gameAreaController.player1?.id === playerID
                    ? gameAreaController.player1
                    : gameAreaController.player2?.id === playerID
                    ? gameAreaController.player2
                    : null;

                return (
                  <ListItem key={playerID}>
                    {player?.userName || 'Unknown Player'}:{' '}
                    {skin ? <Image src={skin} boxSize='20px' /> : '(No skin selected)'}
                  </ListItem>
                );
              })}
            </List>
          </Center>

          <Center paddingTop='10px'>
            <Button
              size='sm'
              width='fit-content'
              onClick={handleCanvas}
              isDisabled={hasClickedContinue}>
              Continue
            </Button>
          </Center>
          <Center paddingTop='10px'>
            <p>{playersReady}/2 players are ready</p>
          </Center>
        </ModalContent>
      </Modal>
    ),
    [
      gameAreaController.player1,
      gameAreaController.player2,
      skinSelected,
      handleSkinSelection,
      handleCanvas,
      skinsState,
      playersReady,
      ourPlayer.userName,
      ourPlayer.id,
      hasClickedContinue,
      closeModal,
    ],
  );

  return (
    <>
      {renderSkins()}
      {showCanvas && (
        <NewMultiplayerSillySharkCanvas
          gameAreaController={gameAreaController}
          newSillySharkGame={gameArea}
          coveyTownController={coveyTownController}
          gameArea={gameArea}
        />
      )}
    </>
  );
}
