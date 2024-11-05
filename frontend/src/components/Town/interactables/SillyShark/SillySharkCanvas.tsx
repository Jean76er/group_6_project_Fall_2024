import { chakra, Container } from '@chakra-ui/react';
import React, { useCallback } from 'react';

/*
 * This component will render the background
 */

const StyledSillySharkBoard = chakra(Container, {
  baseStyle: {
    background: 'skyblue',
    border: '1px solid black',
    width: '400px',
    height: '400px',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/*
 * Componet that renders the SillyShark board
 */

export default function SillySharkBoard(): JSX.Element {
  const renderBoard = useCallback(() => {
    return <StyledSillySharkBoard>{/*test*/}</StyledSillySharkBoard>;
  }, []);

  return <div>{renderBoard()}</div>;
}
