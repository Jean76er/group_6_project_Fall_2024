import {
  Button,
  chakra,
  ModalContent,
  Image,
  ModalHeader,
  Container,
  Center,
  Modal,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useState } from 'react';
import SillySharkAreaController from '../../../../classes/interactable/SillySharkAreaController';
import NewSillySharkCanvas from './SillySharkCanvas';
import GameAreaInteractable from '../GameArea';
import { Skin } from '../../../../types/CoveyTownSocket';
import TownController from '../../../../classes/TownController';

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
      opacity: '100%',
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
 * A component that renders the skin selection screen for the SillyShark game
 *
 * Displays a modal where players can select their character skin from a set of predefined options.
 * The modal contains a "StyledSelectionContainer" which holds several "StyledSelectionSquare" components,
 * each displaying an image of a skin. The currently selected skin is highlighted with a border.
 *
 * The modal is always open until the player selects a skin and clicks "Continue".
 * If no skin is selected, an alert is shown prompting the user to make a selection before proceeding.
 *
 * Clicking "Continue" will start the game by rendering the "NewSillySharkCanvas" component.
 *
 * The "CloseModal" function unpauses the game, ends the interaction, and removes the player from the game area.
 * The selected skin is saved to the game area controller.
 *
 * @param gameAreaController the controller for managing the SillyShark game
 * @param gameArea the interactive game area in Covey Town
 * @param coveyTownController the main controller for managing the town and player interactions
 */
export default function SkinSelectionScreen({
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
  const ourPlayer = coveyTownController.ourPlayer;
  const toast = useToast();

  const closeModal = useCallback(() => {
    if (gameArea) {
      coveyTownController.unPause();
      coveyTownController.interactEnd(gameArea);
      const controller = coveyTownController.getGameAreaController(gameArea);
      controller.leaveGame();
    }
  }, [coveyTownController, gameArea]);

  const handleSkinSelection = useCallback(
    (skin: Skin) => {
      setSkinSelected(skin);
      gameAreaController.skin = skin;
    },
    [gameAreaController],
  );

  const handleCanvas = useCallback(() => {
    if (!skinSelected) {
      toast({
        title: 'Select a skin before continuing',
      });
      return;
    }
    setShowCanvas(true);
  }, [skinSelected, toast]);

  const renderSkins = useCallback(() => {
    return (
      <>
        <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
          <ModalContent maxW='500px' h='720px' bg='skyblue'>
            <ModalHeader>
              <Center>Select your skin {ourPlayer.userName}!</Center>
            </ModalHeader>

            <StyledSelectionContainer>
              {SKINS.map(skin => (
                <StyledSelectionSquare
                  key={skin}
                  onClick={() => handleSkinSelection(skin)}
                  border={skinSelected === skin ? '7px solid blue' : 'none'}>
                  <Image src={skin} alt='Skin Image' objectFit='contain' boxSize='100%' />
                </StyledSelectionSquare>
              ))}
            </StyledSelectionContainer>

            <Center paddingTop='10px'>
              <Button size='sm' width='fit-content' onClick={handleCanvas}>
                Continue
              </Button>
            </Center>
          </ModalContent>
        </Modal>
        {showCanvas && (
          <NewSillySharkCanvas
            gameAreaController={gameAreaController}
            newSillySharkGame={gameArea}
            coveyTownController={coveyTownController}
            gameArea={gameArea}
          />
        )}
      </>
    );
  }, [
    gameAreaController,
    handleCanvas,
    handleSkinSelection,
    showCanvas,
    gameArea,
    skinSelected,
    coveyTownController,
    ourPlayer,
    closeModal,
  ]);

  return <>{renderSkins()}</>;
}
