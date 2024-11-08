import { chakra, Container, useToast } from '@chakra-ui/react';
import React, {useCallback, useEffect, useState } from 'react';
import SillySharkAreaController from '../../../../classes/interactable/SillySharkAreaController';

export type SillySharkProps = {
  gameAreaController: SillySharkAreaController;
}

/*
 * This component will render the background 
 */

const StyledSillySharkBoard = chakra(Container, {
    baseStyle: {
        background: 'skyblue',
        width: '400px',
        height: '400px',
        flexWrap: 'wrap'
    },
});

export default function SillySharkCanvas({ gameAreaController }: SillySharkProps): JSX.Element {
  const playerInGame = gameAreaController.isPlayer;
  
  const toast = useToast();

  const renderCanvas = useCallback(() => {
    return (
      <StyledSillySharkBoard aria label='Silly Shark Canvas'>
        
      </StyledSillySharkBoard>
    );
  }, []);

  return <>{renderCanvas()}</>;
}

