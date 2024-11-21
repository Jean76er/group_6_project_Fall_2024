import {
  Button,
  chakra,
  ModalContent,
  Image,
  ModalHeader,
  Container,
  Center,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import SillySharkAreaController from '../../../../classes/interactable/SillySharkAreaController';
import NewSillySharkCanvas from './SillySharkCanvas';
import GameAreaInteractable from '../GameArea';
import { Skin } from '../../../../types/CoveyTownSocket';

export enum Skins {
  SillyShark = '/SillySharkResources/skins/sillyshark.jpg',
  Walrus = '/SillySharkResources/skins/walrus.jpg',

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
 * A component that will render the Skin selection grid, styled
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



export default function SkinSelectionScreen({
  gameAreaController,
  gameArea,
}: {
  gameAreaController: SillySharkAreaController;
  gameArea: GameAreaInteractable;
}): JSX.Element {

  const [showCanvas, setShowCanvas] = useState(false);
  const [skinSelected, setSkinSelected] = useState(false);


  const handleSkinSelection = useCallback((skin : Skin) => {
    setSkinSelected(true);
    gameAreaController.skin1 = skin;
  }, []);


  const handleCanvas = useCallback(() => {
    if (skinSelected) {
      setShowCanvas(true);
    } else {
      alert('Please select a skin before continuing!!!!');
    }
  }, [skinSelected]);
  const SKINS = [
    Skins.SillyShark,
    Skins.Walrus,
    // Add more skins
  ];
    
  function renderSkins() {
    return (
      <StyledSelectionContainer>
        {SKINS.map(skin => (
          <StyledSelectionSquare key={skin} onClick={() => handleSkinSelection(skin)}>
            <Image src={skin} alt="Skin Image" objectFit="cover" boxSize="100%" />
          </StyledSelectionSquare>
        ))}
      </StyledSelectionContainer>
    );
  }

  return <>{renderSkins()}</>;
}
