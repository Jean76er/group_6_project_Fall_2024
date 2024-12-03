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
  const gameAreaController =
    useInteractableAreaController<SillySharkAreaController>(interactableID);
  const [player1, setPlayer1] = useState(gameAreaController?.player1);
  const [player2, setPlayer2] = useState(gameAreaController?.player2);
  const ourPlayer = coveyTownController.ourPlayer;
  //const [history, setHistory] = useState(gameAreaController?.history || []);
  const [joining, setJoin] = useState(false);
  const [CanJoinSinglePlayer, setCanJoinSinglePlayer] = useState(false);
  const [CanJoinMultiPlayer, setCanJoinMultiPlayer] = useState(false);
  const [observers, setObservers] = useState(gameAreaController?.observers);
  const [showSkinSelection, setShowSkinSelection] = useState(false); //Used to determine if the next screen should be called
  const [showMultiplayerSkinSelection, setShowMultiplayerSkinSelection] = useState(false); // For multiplayer skin selection
  const [playerCount, setPlayerCount] = useState(coveyTownController.players.length)

  const toast = useToast();

  
  
  const handleJoinSinglePlayerGame = useCallback(async () => {
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
  
  const handleJoinMultiplayerGame = useCallback(async () => {
    setJoin(true);
    setShowMultiplayerSkinSelection(true);
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

    setCanJoinSinglePlayer(
      !isPlayer &&
        !isSingleGameInProgress &&
        !isMultiGameInProgress &&
        (isWaitingToStart || isGameOver),
    );

    setCanJoinMultiPlayer(
      !isPlayer && !isMultiGameInProgress && (isWaitingToStart || isGameOver || isSingleGameInProgress)
    );
  }, [gameAreaController]);

  useEffect(() => {
    handleJoinButtonVisibility();

    const handleGameUpdate = () => {
      //setHistory(gameAreaController.history || []);
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

    const updatePlayerCount = () => {
      setPlayerCount(coveyTownController.players.length);
    };

    coveyTownController.addListener('playersChanged', updatePlayerCount);
    gameAreaController.addListener('gameUpdated', handleGameUpdate);
    gameAreaController.addListener('gameEnd', handleGameEnd);

    return () => {
      coveyTownController.removeListener('playersChanged', updatePlayerCount);
      gameAreaController.removeListener('gameUpdated', handleGameUpdate);
      gameAreaController.removeListener('gameEnd', handleGameEnd);
    };
  }, [ourPlayer, gameAreaController, handleJoinButtonVisibility, toast]);

  return (
    <>
      {CanJoinSinglePlayer && (
        <Center paddingTop='400'>
          <Button onClick={handleJoinSinglePlayerGame} isDisabled={joining} size='lg' bg='blue' color='white'>
            {joining ? 'Loading...' : 'Start'}
          </Button>
        </Center>
      )}
      {CanJoinMultiPlayer&&(
        <Center paddingTop='10px'>
          <Button onClick={handleJoinMultiplayerGame} isDisabled={joining || playerCount <= 1 } size='lg' bg='blue' color='white'>
            Join
          </Button>
        </Center>
      )}
      
      {showSkinSelection && (
        <SkinSelectionScreen
          gameAreaController={gameAreaController}
          gameArea={gameArea}
          coveyTownController={coveyTownController}
        />
      )}
      {showMultiplayerSkinSelection && (
        <MultiplayerSkinSelectionScreen
          gameAreaController={gameAreaController}
          gameArea={gameArea}
          coveyTownController={coveyTownController}
        />
      )}

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
