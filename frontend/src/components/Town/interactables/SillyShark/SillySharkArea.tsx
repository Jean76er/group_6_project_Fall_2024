import {
  Button,
  List,
  ListItem,
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
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { InteractableID } from '../../../../types/CoveyTownSocket';
import GameAreaInteractable from '../GameArea';
import SillySharkAreaController from '../../../../classes/interactable/SillySharkAreaController';
import SkinSelectionScreen from './SkinSelection';
//import { render } from '@testing-library/react';

export type SillySharkGameProps = {
  gameAreaController: SillySharkAreaController;
};

function SillySharkArea({
  interactableID,
  gameArea,
}: {
  interactableID: InteractableID;
  gameArea: GameAreaInteractable;
}): JSX.Element {
  const gameAreaController =
    useInteractableAreaController<SillySharkAreaController>(interactableID);
  const townController = useTownController();
  //const [player1, setPlayer1] = useState(gameAreaController?.player1);
  //const [player2, setPlayer2] = useState(gameAreaController?.player2);
  const ourPlayer = townController.ourPlayer;
  //const [history, setHistory] = useState(gameAreaController?.history || []);
  const [joining, setJoin] = useState(false);
  const [canJoin, setCanJoin] = useState(false);
  const [observers, setObservers] = useState(gameAreaController?.observers);
  const [showSkinSelection, setShowSkinSelection] = useState(false); //Used to determine if the next screen should be called

  const toast = useToast();

  const handleJoinGame = useCallback(async () => {
    setJoin(true);
    setShowSkinSelection(true);
    try {
      await gameAreaController.joinGame();
    } catch (error) {
      toast({
        description: `${error}`,
        status: 'error',
      });
    } finally {
      setJoin(false);
    }
  }, [gameAreaController, toast]);

  const handleJoinButtonVisibility = useCallback(() => {
    const { status, isPlayer } = gameAreaController;
    const isWaitingToStart = status === 'WAITING_TO_START';
    const isSingleGameInProgress = status === 'SINGLE_PLAYER_IN_PROGRESS';
    const isMultiGameInProgress = status === 'MULTI_PLAYER_IN_PROGRESS';
    const isGameOver = status === 'OVER';

    setCanJoin(
      !isPlayer &&
        !isSingleGameInProgress &&
        !isMultiGameInProgress &&
        (isWaitingToStart || isGameOver),
    );
  }, [gameAreaController]);

  useEffect(() => {
    handleJoinButtonVisibility();

    const handleGameUpdate = () => {
      //setHistory(gameAreaController.history || []);
      setObservers(gameAreaController.observers);
      //setPlayer1(gameAreaController.player1);
      //setPlayer2(gameAreaController.player2);

      handleJoinButtonVisibility();
    };

    const handleGameEnd = () => {
      const { winner } = gameAreaController;
      const message = winner ? (winner === ourPlayer ? 'Winner' : 'Loser') : 'Tie';

      toast({ description: message });
    };

    gameAreaController.addListener('gameUpdated', handleGameUpdate);
    gameAreaController.addListener('gameEnd', handleGameEnd);

    return () => {
      gameAreaController.removeListener('gameUpdated', handleGameUpdate);
      gameAreaController.removeListener('gameEnd', handleGameEnd);
    };
  }, [ourPlayer, gameAreaController, handleJoinButtonVisibility, toast]);

  return (
    <>
      {canJoin && (
        <Center paddingTop='400'>
          <Button onClick={handleJoinGame} isDisabled={joining} size='lg' bg='blue' color='white'>
            {joining ? 'Loading...' : 'Start'}
          </Button>
        </Center>
      )}
      {showSkinSelection && (
        <SkinSelectionScreen gameAreaController={gameAreaController} gameArea={gameArea} />
      )}
      <Center paddingTop='10px'>
        <Button size='lg' bg='blue' color='white'>
          Join
        </Button>
      </Center>
      <Center paddingTop='10px'>{gameAreaController.status}</Center>
      <List aria-label='observers:'>
        {observers.map(observer => (
          <ListItem key={observer.id}>{observer.userName}</ListItem>
        ))}
      </List>
    </>
  );
}

export default function SillySharkAreaWrapper(): JSX.Element {
  const gameArea = useInteractable<GameAreaInteractable>('gameArea');
  const townController = useTownController();
  const closeModal = useCallback(() => {
    if (gameArea) {
      townController.interactEnd(gameArea);
      const controller = townController.getGameAreaController(gameArea);
      controller.leaveGame();
    }
  }, [townController, gameArea]);

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
          <SillySharkArea interactableID={gameArea.name} gameArea={gameArea} />
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
