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

export enum Skins {
  SillyShark = '/SillySharkResources/skins/sillyshark.png',
  Walrus = '/SillySharkResources/skins/walrus.png',
  Penguin = '/SillySharkResources/skins/penguin.png',
  PolarBear = '/SillySharkResources/skins/polarbear.png',
}

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
  const [playersReady, setPlayersReady] = useState(gameAreaController.readyCount);
  const [skinsState, setSkinsState] = useState(gameAreaController.skinsState);
  const ourPlayer = coveyTownController.ourPlayer;

  const handleSkinSelection = useCallback(
    (skin: Skin) => {
      setSkinSelected(skin);
      gameAreaController.setSkin(ourPlayer.id, skin);
    },
    [gameAreaController, ourPlayer.id],
  );

  const handleCanvas = useCallback(() => {
    if (!skinSelected) {
      alert('Please select a skin before continuing!');
      return;
    }

    gameAreaController.setReady(ourPlayer.id); // Mark the player as ready
    if (playersReady + 1 === 2) {
      setShowCanvas(true); // Start the game when both players are ready
    }
  }, [skinSelected, playersReady, gameAreaController, ourPlayer.id]);

  useEffect(() => {
    const handlePlayersReadyUpdated = (readyCount: number) => {
      setPlayersReady(readyCount);
    };

    const handleSkinChanged = (updatedSkins: [string, Skin | undefined][]) => {
      setSkinsState(updatedSkins);
    };

    gameAreaController.addListener('playersReadyUpdated', handlePlayersReadyUpdated);
    gameAreaController.addListener('skinChanged', handleSkinChanged);

    return () => {
      gameAreaController.removeListener('playersReadyUpdated', handlePlayersReadyUpdated);
      gameAreaController.removeListener('skinChanged', handleSkinChanged);
    };
  }, [gameAreaController]);

  const renderSkins = useCallback(
    () => (
      <ModalContent maxW='500px' h='720px' bg='skyblue'>
        <ModalHeader>
          <Center>Select your skin, {ourPlayer.userName}!</Center>
        </ModalHeader>

        <StyledSelectionContainer>
          {SKINS.map(skin => {
            const isOwnedByUs = skinSelected === skin; // Check if this player selected the skin
            const isOwnedByOther = skinsState.some(
              ([playerID, selectedSkin]) => playerID !== ourPlayer.id && selectedSkin === skin,
            );

            // Set the border color based on ownership
            let borderStyle = 'none';
            if (isOwnedByUs) {
              borderStyle = '8px solid blue'; // Blue border for the player's selected skin
            } else if (isOwnedByOther) {
              borderStyle = '8px solid red'; // Red border for skins selected by the other player
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
            {skinsState.map(([playerName, skin]) => (
              <ListItem key={playerName}>
                {playerName}: {skin ? <Image src={skin} boxSize='20px' /> : '(No skin selected)'}
              </ListItem>
            ))}
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
    ),
    [
      skinSelected,
      handleSkinSelection,
      handleCanvas,
      skinsState,
      playersReady,
      ourPlayer.userName,
      ourPlayer.id,
    ],
  );

  return (
    <>
      {renderSkins()}
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
}
