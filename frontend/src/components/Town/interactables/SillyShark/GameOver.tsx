import { Button, ModalContent, ModalHeader, Center, Image } from '@chakra-ui/react';
import React from 'react';

export default function NewGameOverScreen() {
  /*
  To be implemented
  const closeModal = useCallback(() => {
    if (gameArea) {
      townController.interactEnd(gameArea);
      const controller = townController.getGameAreaController(gameArea);
      controller.leaveGame();
    }
  }, [townController, gameArea]);*/

  return (
    <>
      <ModalContent maxW='500px' h='720px' bg='skyblue'>
        <ModalHeader>
          <Image
            src='https://see.fontimg.com/api/rf5/MXOr/NGM3ZDI5YTQ3NTg3NGU1YzhkMWFmNTAxOGFlMTQ1MjUudHRm/R2FtZSBPdmVy/botsmatic-demo.png?r=fs&h=81&w=1250&fg=000000&bg=FFFFFF&tb=1&s=65 '
            alt='Minecraft fonts'
          />
        </ModalHeader>
        <Center paddingTop='400'>
          <Button size='lg' bg='blue' color='white'>
            Replay
          </Button>
        </Center>
        <Center paddingTop='10px'>
          <Button size='lg' bg='blue' color='white'>
            Exit
          </Button>
        </Center>
      </ModalContent>
    </>
  );
}
