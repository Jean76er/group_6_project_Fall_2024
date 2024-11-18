import {
  Button,
  chakra,
  ModalContent,
  Image,
  ModalHeader,
  Container,
  Center,
} from '@chakra-ui/react';
import React, { useCallback } from 'react';
import SillySharkAreaController from '../../../../classes/interactable/SillySharkAreaController';

export type SillySharkGameProps = {
  gameAreaController: SillySharkAreaController;
};

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

export default function SkinSelectionScreen({ gameAreaController }: SillySharkGameProps): JSX.Element {
  gameAreaController.id; //This is to prevent the error of it not being used. Remove this once you pass it through to the next screen
  const renderSkins = useCallback(() => {
    return (
      <>
        <ModalContent maxW='500px' h='720px' bg='skyblue'>
          <ModalHeader>
            <Center>Select you skin!</Center>
          </ModalHeader>

          <StyledSelectionContainer>
            <StyledSelectionSquare>
              <Image
                src='/SillySharkResources/skins/sillyshark.jpg'
                alt='Button Image'
                objectFit='cover'
                boxSize='100%'
              />
            </StyledSelectionSquare>
            <StyledSelectionSquare>
              <Image
                src='/SillySharkResources/skins/sillyshark.jpg'
                alt='Button Image'
                objectFit='cover'
                boxSize='100%'
              />
            </StyledSelectionSquare>
            <StyledSelectionSquare>
              <Image
                src='/SillySharkResources/skins/sillyshark.jpg'
                alt='Button Image'
                objectFit='cover'
                boxSize='100%'
              />
            </StyledSelectionSquare>
            <StyledSelectionSquare>
              <Image
                src='/SillySharkResources/skins/sillyshark.jpg'
                alt='Button Image'
                objectFit='cover'
                boxSize='100%'
              />
            </StyledSelectionSquare>
          </StyledSelectionContainer>

          <Center paddingTop='10px'>
            <Button size='sm' width='fit-content'>
              Continue
            </Button>
          </Center>
        </ModalContent>
        <></>
      </>
    );
  }, []);

  return <>{renderSkins()}</>;
}
