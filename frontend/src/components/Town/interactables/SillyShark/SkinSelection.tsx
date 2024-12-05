import {
  Button,
  chakra,
  ModalContent,
  Image,
  ModalHeader,
  Container,
  Center,
} from '@chakra-ui/react';
import React, { useCallback, useState } from 'react';
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

  const handleSkinSelection = useCallback(
    (skin: Skin) => {
      setSkinSelected(skin);
      gameAreaController.skin1 = skin;
    },
    [gameAreaController],
  );

  const handleCanvas = useCallback(() => {
    if (skinSelected) {
      setShowCanvas(true);
    } else {
      alert('Please select a skin before continuing!!!!');
    }
  }, [skinSelected]);

  const renderSkins = useCallback(() => {
    return (
      <>
        <ModalContent maxW='500px' h='720px' bg='skyblue'>
          <ModalHeader>
            <Center>Select you skin!</Center>
          </ModalHeader>

          <StyledSelectionContainer>
            {SKINS.map(skin => (
              <StyledSelectionSquare
                key={skin}
                onClick={() => handleSkinSelection(skin)}
                border={skinSelected === skin ? '8px solid blue' : 'none'}>
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
  ]);

  return <>{renderSkins()}</>;
}
