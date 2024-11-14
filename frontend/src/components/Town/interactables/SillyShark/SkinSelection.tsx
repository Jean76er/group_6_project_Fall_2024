import { Button, chakra, ModalContent, Image, ModalHeader } from '@chakra-ui/react';
import React from 'react';

/**
 * This component renders a square that contains an image of the skin to be chosen
 */
const StyledSelectionSquare = chakra(Button, {
  baseStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid black',
    height: '150px',
    width: '150px',
    fontSize: '50px',
    _disabled: {
      opacity: '100%',
    },
  },
});

export default function SkinSelectionScreen(): JSX.Element {
  return (
    <>
      <ModalContent maxW='500px' h='720px' bg='skyblue'>
        <ModalHeader>{'Silly Shark'}</ModalHeader>
        <StyledSelectionSquare>
          <Image
            src='/SillySharkImages/sillyshark.jpg'
            alt='Button Image'
            objectFit='cover'
            boxSize='100%'
          />
        </StyledSelectionSquare>
      </ModalContent>

      <></>
    </>
  );
}
