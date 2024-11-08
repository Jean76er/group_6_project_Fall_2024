import { chakra, Container } from '@chakra-ui/react';
import React, { useCallback } from 'react';
import SillySharkAreaController from '../../../../classes/interactable/SillySharkAreaController';

export type SillySharkProps = {
  gameAreaController: SillySharkAreaController;
};

/*
 * This component will render the background
 */

const StyledSillySharkBoard = chakra(Container, {
  baseStyle: {
    background: 'skyblue',
    width: '400px',
    height: '400px',
    flexWrap: 'wrap',
  },
});

export default function SillySharkCanvas(): JSX.Element {
  //const playerInGame = gameAreaController.isPlayer;

  //const toast = useToast();

  const renderCanvas = useCallback(() => {
    return (
      <StyledSillySharkBoard aria label='Silly Shark Canvas'>
        <p>This is a test</p>
      </StyledSillySharkBoard>
    );
  }, []);

  return <>{renderCanvas()}</>;
}
