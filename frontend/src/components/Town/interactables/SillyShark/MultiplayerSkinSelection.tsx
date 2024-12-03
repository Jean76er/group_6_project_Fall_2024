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
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import SillySharkAreaController from '../../../../classes/interactable/SillySharkAreaController';
import NewSillySharkCanvas from './SillySharkCanvas';
import GameAreaInteractable from '../GameArea';
import { Skin } from '../../../../types/CoveyTownSocket';
import TownController from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';

export enum Skins {
  SillyShark = '/SillySharkResources/skins/sillyshark.jpg',
  Walrus = '/SillySharkResources/skins/walrus.jpg',
  Penguin = '/SillySharkResources/skins/penguin.jpg',
  PolarBear = '/SillySharkResources/skins/polarbear.jpg',
}

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
 * A component that will render the TicTacToe board, styled
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

const SKINS = [Skins.SillyShark, Skins.Walrus, Skins.Penguin, Skins.PolarBear];

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
  const [playersReady, setPlayersReady] = useState(0);
  const isMultiGameInProgress = gameAreaController.status === 'MULTI_PLAYER_IN_PROGRESS';
  const [player1, setPlayer1] = useState(gameAreaController.player1);
  const [player2, setPlayer2] = useState(gameAreaController.player2);
  const ourPlayer = coveyTownController.ourPlayer;

  const handleSkinSelection = useCallback(
    (skin: Skin) => {
      setSkinSelected(skin);
      gameAreaController.skin = skin;
    },
    [gameAreaController],
  );

  const handleCanvas = useCallback(() => {
    if (!skinSelected) {
      alert('Please select a skin before continuing!!!!');
      return;
    }

    setPlayersReady(prevReady => {
      const newReadyCount = prevReady + 1;
  
      if (newReadyCount === 2) {
        setShowCanvas(true);
      }
      return newReadyCount;
    });
  }, [skinSelected, isMultiGameInProgress]);

  useEffect(() => {    
    const handleScreenUpdate = () => {
      setPlayer1(gameAreaController.player1)
      setPlayer2(gameAreaController.player2)
    }

    gameAreaController.addListener('screenUpdated', handleScreenUpdate);
    gameAreaController.addListener('skinSelected', handleSkinSelection);

    return () => {
      gameAreaController.removeListener('screenUpdated', handleScreenUpdate);
      gameAreaController.addListener('skinSelected', handleSkinSelection);
    };
  }, [gameAreaController, player1,player2]);

  const renderSkins = useCallback(() => {
    return (
      <>
        <ModalContent maxW='500px' h='720px' bg='skyblue'>
          <ModalHeader>
            <Center>Select your skin {ourPlayer.userName}!</Center>
          </ModalHeader>

          <StyledSelectionContainer>
            {SKINS.map(skin => (
              <StyledSelectionSquare
                key={skin}
                onClick={() => handleSkinSelection(skin)}
                border={skinSelected === skin ? '8px solid blue' : 'none'}>
                <Image src={skin} alt='Skin Image' objectFit='cover' boxSize='100%' />
              </StyledSelectionSquare>
            ))}
          </StyledSelectionContainer>

          
          <Center>
            <List aria-label='list of players in the game'>
              <ListItem>{player1?.userName || '(Waiting for player)'}</ListItem>
              <ListItem>{player2?.userName || '(Waiting for player)'}</ListItem>
            </List>
          </Center>
        

          <Center paddingTop='10px'>
            <Button size='sm' width='fit-content' onClick={handleCanvas}>
              Continue
            </Button>
            
          </Center>
          <Center paddingTop='10px'>
              <p>{playersReady}/2 players are ready</p>
          </Center>
          
            
          
        </ModalContent>
        {showCanvas && (
          <NewSillySharkCanvas
            gameAreaController={gameAreaController}
            newSillySharkGame={gameArea}
            coveyTownController={coveyTownController}
            gameArea={gameArea}
          />
        )}
        <></>
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
  ]);

  return <>{renderSkins()}</>;
}
