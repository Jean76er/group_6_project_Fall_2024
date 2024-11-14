import { Button, chakra } from '@chakra-ui/react';
import React from 'react';

/**
 * This component renders a square that contains an image of the skin to be chosen
 */
const StyledSelectionSquare = chakra(Button, {
  baseStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    flexBasis: '33%',
    border: '1px solid black',
    height: '33%',
    fontSize: '50px',
    _disabled: {
      opacity: '100%',
    },
  },
});

export default function SkinSelectionScreen(): JSX.Element {
  return (
    <>
      <StyledSelectionSquare />
    </>
  );
}
