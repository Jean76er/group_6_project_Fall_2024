import {
  Button,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useToast,
  Center,
  Image,
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

function SillySharkArea({
  interactableID,
  gameArea,
  coveyTownController,
}: {
  interactableID: InteractableID;
  gameArea: GameAreaInteractable;
  coveyTownController: TownController;
}): JSX.Element {
  const singleGameAreaController =
    useInteractableAreaController<SillySharkAreaController>(interactableID);

  const multiGameAreaController =
    useInteractableAreaController<SillySharkAreaController>(interactableID);
  const ourPlayer = coveyTownController.ourPlayer;
  //const [history, setHistory] = useState(gameAreaController?.history || []);
  const [joining, setJoin] = useState(false);
  const [canJoinSinglePlayer, setCanJoinSinglePlayer] = useState(false);
  const [canJoinMultiPlayer, setCanJoinMultiPlayer] = useState(false);
  // const [observers, setObservers] = useState(singleGameAreaController?.observers);
  const [showSkinSelection, setShowSkinSelection] = useState(false); //Used to determine if the next screen should be called
  const [showMultiplayerSkinSelection, setShowMultiplayerSkinSelection] = useState(false); // For multiplayer skin selection
  const [playerCount, setPlayerCount] = useState(coveyTownController.players.length);

  const toast = useToast();

  const renderMultiSkinScreen = useCallback(()=>{
    return <MultiplayerSkinSelectionScreen
    gameAreaController={multiGameAreaController}
    gameArea={gameArea}
    coveyTownController={coveyTownController}
    />
  }, [multiGameAreaController, gameArea, coveyTownController])

  const handleJoinSinglePlayerGame = useCallback(async () => {
    setJoin(true);
    setShowSkinSelection(true);
    try {
      await singleGameAreaController.joinGame();
    } catch (error) {
      toast({
        description: `${error}`,
        status: 'error',
      });
    } finally {
      setJoin(false);
    }
  }, [singleGameAreaController, toast]);

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

  const handleSingleJoinButtonVisibility = useCallback(() => {
    const { status, isPlayer } = singleGameAreaController;
    const isWaitingToStart = status === 'WAITING_TO_START';
    const isSingleGameInProgress = status === 'SINGLE_PLAYER_IN_PROGRESS';
    const isMultiGameInProgress = status === 'MULTI_PLAYER_IN_PROGRESS';
    const isGameOver = status === 'OVER';

    setCanJoinSinglePlayer(
      !isPlayer &&
        !isSingleGameInProgress &&
        !isMultiGameInProgress &&
        (isWaitingToStart || isGameOver),
    );
  }, [singleGameAreaController]);

  const handleMultiJoinButtonVisibility = useCallback(() => {
    const { status, isPlayer } = multiGameAreaController;
    const isWaitingToStart = status === 'WAITING_TO_START';
    const isSingleGameInProgress = status === 'SINGLE_PLAYER_IN_PROGRESS';
    const isMultiGameInProgress = status === 'MULTI_PLAYER_IN_PROGRESS';
    const isGameOver = status === 'OVER';

    setCanJoinMultiPlayer(
      !isPlayer &&
        !isMultiGameInProgress &&
        (isWaitingToStart || isGameOver || isSingleGameInProgress),
    );
  }, [multiGameAreaController]);

  useEffect(() => {
    handleSingleJoinButtonVisibility();
    handleMultiJoinButtonVisibility();

    const handleSingleGameUpdate = () => {
      //setHistory(gameAreaController.history || []);
      // setObservers(singleGameAreaController.observers);

      handleSingleJoinButtonVisibility();
    };

    const handleMultiGameUpdate = () => {
      //setHistory(gameAreaController.history || []);
      // setObservers(multiGameAreaController.observers);

      handleMultiJoinButtonVisibility();
    };

    const handleSingleGameEnd = () => {
      const { winner } = singleGameAreaController;
      const message = winner ? (winner === ourPlayer ? 'Winner' : 'Loser') : 'Tie';

      toast({ description: message });
    };

    const handleMultiGameEnd = () => {
      const { winner } = multiGameAreaController;
      const message = winner ? (winner === ourPlayer ? 'Winner' : 'Loser') : 'Tie';

      toast({ description: message });
    };
    const updatePlayerCount = () => {
      setPlayerCount(coveyTownController.players.length);
    };

    coveyTownController.addListener('playersChanged', updatePlayerCount);
    singleGameAreaController.addListener('gameUpdated', handleSingleGameUpdate);
    singleGameAreaController.addListener('gameEnd', handleSingleGameEnd);
    multiGameAreaController.addListener('gameUpdated', handleMultiGameUpdate);
    multiGameAreaController.addListener('gameEnd', handleMultiGameEnd);

    return () => {
      coveyTownController.removeListener('playersChanged', updatePlayerCount);
      singleGameAreaController.removeListener('gameUpdated', handleSingleGameUpdate);
      singleGameAreaController.removeListener('gameEnd', handleSingleGameEnd);
      multiGameAreaController.removeListener('gameUpdated', handleMultiGameUpdate);
      multiGameAreaController.removeListener('gameEnd', handleMultiGameEnd);
    };
  }, [
    coveyTownController,
    ourPlayer,
    singleGameAreaController,
    multiGameAreaController,
    handleMultiJoinButtonVisibility,
    handleSingleJoinButtonVisibility,
    toast,
  ]);

  return (
    <>
      {canJoinSinglePlayer && (
        <Center paddingTop='400'>
          <Button
            onClick={handleJoinSinglePlayerGame}
            isDisabled={joining}
            size='lg'
            bg='blue'
            color='white'>
            {joining ? 'Loading...' : 'Start'}
          </Button>
        </Center>
      )}
      {canJoinMultiPlayer && (
        <Center paddingTop='10px'>
          <Button
            onClick={handleJoinMultiplayerGame}
            isDisabled={joining || playerCount <= 1}
            size='lg'
            bg='blue'
            color='white'>
            Join
          </Button>
        </Center>
      )}

      {showSkinSelection && (
        <SkinSelectionScreen
          gameAreaController={singleGameAreaController}
          gameArea={gameArea}
          coveyTownController={coveyTownController}
        />
      )}
      {showMultiplayerSkinSelection && (
        <MultiplayerSkinSelectionScreen
          gameAreaController={multiGameAreaController}
          gameArea={gameArea}
          coveyTownController={coveyTownController}
        />
      )}

      {/* <Center paddingTop='10px'>{gameAreaController.status}</Center>
      <List aria-label='observers:'>
        {observers.map(observer => (
          <ListItem key={observer.id}>{observer.userName}</ListItem>
        ))}
      </List> */}
    </>
  );
}

export default function SillySharkAreaWrapper(): JSX.Element {
  const gameArea = useInteractable<GameAreaInteractable>('gameArea');
  const coveyTownController = useTownController();
  const closeModal = useCallback(() => {
    if (gameArea) {
      coveyTownController.interactEnd(gameArea);
      const controller = coveyTownController.getGameAreaController(gameArea);
      controller.leaveGame();
    }
  }, [coveyTownController, gameArea]);

  if (gameArea && gameArea.getData('type') === 'SillyShark') {
    return (
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent maxW='500px' h='720px' bg='skyblue'>
          <ModalHeader>
            <Image
              src='https://see.fontimg.com/api/rf5/Exl8/NjhmNTJiODNkNDBjNDgwNWE0ZmM5N2JmM2IxMWNlNDcudHRm/U2lsbHkgU2hhcms/botsmatic3d.png?r=fs&h=68&w=1040&fg=000000&bg=FFFFFF&tb=1&s=65'
              alt='Minecraft fonts'
            />
          </ModalHeader>
          <ModalCloseButton />
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
