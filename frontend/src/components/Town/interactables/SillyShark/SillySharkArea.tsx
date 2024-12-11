import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useToast,
  Center,
  Image,
  Text,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import TownController, {
  useInteractable,
  useInteractableAreaController,
} from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { InteractableID } from '../../../../types/CoveyTownSocket';
import GameAreaInteractable from '../GameArea';
import SillySharkAreaController from '../../../../classes/interactable/SillySharkAreaController';
import SkinSelectionScreen from './SkinSelection';
import MultiplayerSkinSelectionScreen from './MultiplayerSkinSelection';

export type SillySharkGameProps = {
  gameAreaController: SillySharkAreaController;
};

/**
 * A component that handles the SillyShark game area in Covey Town.
 *
 * Displays buttons for joining SinglePlayer or MultiPlayer modes.
 * Renders the appropriate skin selection screen based on the game mode.
 * Updates game and player states dynamically using controller listeners.
 * Provides real-time feedback to players, such as displaying scores.
 *
 * The modal is always open during gameplay and closes when the game interaction ends or the player leaves.
 * The `closeModal` function handles unpausing the town, ending the interaction, and removing the player from the game area.
 *
 * @param interactableID - The unique identifier for the interactable game area.
 * @param gameArea - The current game area object containing relevant data and methods.
 * @param coveyTownController - The main controller for managing the town and player interactions.
 */
function SillySharkArea({
  interactableID,
  gameArea,
  coveyTownController,
}: {
  interactableID: InteractableID;
  gameArea: GameAreaInteractable;
  coveyTownController: TownController;
}): JSX.Element {
  useEffect(() => {
    if (gameArea) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, gameArea]);

  const singleGameAreaController =
    useInteractableAreaController<SillySharkAreaController>(interactableID);

  const multiGameAreaController =
    useInteractableAreaController<SillySharkAreaController>(interactableID);
  const ourPlayer = coveyTownController.ourPlayer;
  const [joining, setJoin] = useState(false);
  const [canJoinMultiPlayer, setCanJoinMultiPlayer] = useState(false);
  const [showSkinSelection, setShowSkinSelection] = useState(false);
  const [showMultiplayerSkinSelection, setShowMultiplayerSkinSelection] = useState(false);
  const [playerCount, setPlayerCount] = useState(coveyTownController.players.length);
  const [gamePlayerCount, setGamePlayerCount] = useState(multiGameAreaController.players.length);
  const toast = useToast();

  const renderMultiSkinScreen = useCallback(() => {
    return (
      <MultiplayerSkinSelectionScreen
        gameAreaController={multiGameAreaController}
        gameArea={gameArea}
        coveyTownController={coveyTownController}
      />
    );
  }, [multiGameAreaController, gameArea, coveyTownController]);

  const handleJoinSinglePlayerGame = useCallback(async () => {
    setJoin(true);
    setShowSkinSelection(true);
  }, []);

  const handleJoinMultiplayerGame = useCallback(async () => {
    setJoin(true);
    setShowMultiplayerSkinSelection(true);
    try {
      await multiGameAreaController.joinGame();
    } catch (error) {
      toast({
        description: `${error}`,
        status: 'error',
      });
    } finally {
      setJoin(false);
    }
  }, [multiGameAreaController, toast]);

  const handleMultiJoinButtonVisibility = useCallback(() => {
    const { status, isPlayer } = multiGameAreaController;
    const isWaitingToStart = status === 'WAITING_TO_START';
    const isInProgress = status === 'IN_PROGRESS';
    setCanJoinMultiPlayer(!isPlayer && !isInProgress && isWaitingToStart);
  }, [multiGameAreaController]);

  useEffect(() => {
    handleMultiJoinButtonVisibility();
    const handleMultiGameUpdate = () => {
      handleMultiJoinButtonVisibility();
    };

    const handleMultiGameEnd = () => {
      const { winner } = multiGameAreaController;
      const message = winner ? (winner === ourPlayer ? 'Winner' : 'Loser') : 'Tie';

      toast({ description: message });
    };
    /**Checks Players in town to only enable multiplayer button when there's more than one player */
    const updatePlayerCount = () => {
      setPlayerCount(coveyTownController.players.length);
    };

    /**Check players inside the game to disable multiplayer button if game is full */
    const updateGamePlayerCount = () => {
      setGamePlayerCount(multiGameAreaController.players.length);
    };
    coveyTownController.addListener('playersChanged', updatePlayerCount);
    multiGameAreaController.addListener('gameUpdated', handleMultiGameUpdate);
    multiGameAreaController.addListener('gameEnd', handleMultiGameEnd);
    multiGameAreaController.addListener('gamePlayersChanged', updateGamePlayerCount);

    return () => {
      coveyTownController.removeListener('playersChanged', updatePlayerCount);
      multiGameAreaController.removeListener('gameUpdated', handleMultiGameUpdate);
      multiGameAreaController.removeListener('gameEnd', handleMultiGameEnd);
      multiGameAreaController.removeListener('gamePlayersChanged', updateGamePlayerCount);
    };
  }, [
    coveyTownController,
    ourPlayer,
    singleGameAreaController,
    multiGameAreaController,
    handleMultiJoinButtonVisibility,
    toast,
  ]);

  return (
    <>
      <Center>
        <Text fontSize='4xl' fontWeight='bold' color='white' mt={2}>
          Best Score: {ourPlayer.highScore}
        </Text>
      </Center>

      <Center paddingTop='400'>
        <Button
          onClick={handleJoinSinglePlayerGame}
          isDisabled={joining}
          size='lg'
          bg='blue.400'
          color='white'
          _hover={{ bg: 'blue.500' }}
          _active={{ bg: 'blue.600' }}>
          {joining ? 'Loading...' : 'SinglePlayer'}
        </Button>
      </Center>

      <Center paddingTop='10px'>
        <Button
          isDisabled={
            gamePlayerCount >= 2 || (!canJoinMultiPlayer && (joining || playerCount <= 1))
          }
          onClick={handleJoinMultiplayerGame}
          size='lg'
          bg='blue.400'
          color='white'
          _hover={{ bg: 'blue.500' }}
          _active={{ bg: 'blue.600' }}>
          {joining ? 'Loading...' : 'MultiPlayer'}
        </Button>
      </Center>

      {showSkinSelection && (
        <SkinSelectionScreen
          gameAreaController={singleGameAreaController}
          gameArea={gameArea}
          coveyTownController={coveyTownController}
        />
      )}

      {showMultiplayerSkinSelection && renderMultiSkinScreen()}
    </>
  );
}

export default function SillySharkAreaWrapper(): JSX.Element {
  const gameArea = useInteractable<GameAreaInteractable>('gameArea');
  const coveyTownController = useTownController();

  const closeModal = useCallback(() => {
    if (gameArea) {
      coveyTownController.unPause();
      coveyTownController.interactEnd(gameArea);
      const controller = coveyTownController.getGameAreaController(gameArea);
      controller.leaveGame();
    }
  }, [coveyTownController, gameArea]);

  if (gameArea && gameArea.getData('type') === 'SillyShark') {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent maxW='500px' h='720px' bg='skyblue' borderRadius='lg'>
          <ModalHeader textAlign='center'>
            <Image
              src='https://see.fontimg.com/api/rf5/Exl8/NjhmNTJiODNkNDBjNDgwNWE0ZmM5N2JmM2IxMWNlNDcudHRm/U2lsbHkgU2hhcms/botsmatic3d.png?r=fs&h=68&w=1040&fg=000000&bg=FFFFFF&tb=1&s=65'
              alt='Minecraft fonts'
              objectFit='contain'
              maxW='full'
            />
          </ModalHeader>
          <SillySharkArea
            interactableID={gameArea.name}
            gameArea={gameArea}
            coveyTownController={coveyTownController}
          />
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
