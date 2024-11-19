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
  Text,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { InteractableID } from '../../../../types/CoveyTownSocket';
import GameAreaInteractable from '../GameArea';
import SillySharkAreaController from '../../../../classes/interactable/SillySharkAreaController';
import NewSillySharkCanvas from './SillySharkCanvas';

function SillySharkArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const gameAreaController =
    useInteractableAreaController<SillySharkAreaController>(interactableID);
  const townController = useTownController();
  const [player1, setPlayer1] = useState(gameAreaController?.player1);
  const [player2, setPlayer2] = useState(gameAreaController?.player2);
  const ourPlayer = townController.ourPlayer;
  const [history, setHistory] = useState(gameAreaController?.history || []);
  const [joining, setJoin] = useState(false);
  const [canJoin, setCanJoin] = useState(false);
  const [observers, setObservers] = useState(gameAreaController?.observers);
  const toast = useToast();

  const renderGame = useCallback (() => {
    return <NewSillySharkCanvas gameAreaController={gameAreaController}/>;
  }, [gameAreaController])

  const handleJoinGame = useCallback(async () => {
    setJoin(true);
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
      setHistory(gameAreaController.history || []);
      setObservers(gameAreaController.observers);
      setPlayer1(gameAreaController.player1);
      setPlayer2(gameAreaController.player2);

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
      {renderGame()}
      {gameAreaController.status}
      {canJoin && (
        <Button onClick={handleJoinGame} isDisabled={joining}>
          {joining ? 'Loading...' : 'Join New Game'}
        </Button>
      )}
      <List aria-label='observers:'>
        {observers.map(observer => (
          <ListItem key={observer.id}>{observer.userName}</ListItem>
        ))}
      </List>
      <List aria-label='list of players in the game'>
        <ListItem>Player 1: {player1?.userName || '(No player yet!)'}</ListItem>
        <ListItem>Player 2: {player2?.userName || '(No player yet!)'}</ListItem>
      </List>
      <div>
        <Text fontWeight='bold' mt='4'>
          Game History:
        </Text>
        {history.length > 0 ? (
          <List aria-label='game history'>
            {history.map((event, index) => (
              <ListItem key={index}>{event}</ListItem>
            ))}
          </List>
        ) : (
          <Text>No history available yet.</Text>
        )}
      </div>
      <div>
        {gameAreaController.status === 'WAITING_TO_START' && <div>Game not yet started</div>}
        {gameAreaController.status === 'SINGLE_PLAYER_IN_PROGRESS' ||
          (gameAreaController.status === 'MULTI_PLAYER_IN_PROGRESS' && (
            <div>Game is in progress</div>
          ))}
        {gameAreaController.status === 'OVER' && <div>Game over</div>}
      </div>
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
        <ModalContent>
          <ModalHeader>{gameArea.name}</ModalHeader>
          <ModalCloseButton />

          <SillySharkArea interactableID={gameArea.name} />
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
