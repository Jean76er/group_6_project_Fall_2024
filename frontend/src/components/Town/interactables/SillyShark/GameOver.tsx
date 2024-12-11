import { Button, ModalContent, ModalHeader, Center, Image, Text, Modal } from '@chakra-ui/react';
import React, { useCallback } from 'react';
import GameArea from '../GameArea';
import TownController from '../../../../classes/TownController';

/**
 * A component that renders the Game Over screen
 *
 * Displays a modal that renders one player with their respective skin, obstacles and their movement.
 * It manages sprite movements, gravity, and collision detection.
 *
 * Tracks the player's score during the game. When a player loses, their score
 * is compared to their highest score and updated if necessary. The Game Over screen is displayed, and the
 * final score is passed to the next modal.
 *
 * Utilizes React state to manage gameplay variables, including sprite positions, obstacle placements, and more.
 * Listens to and responds to game-related events (e.g., jumps, position updates) using event listeners.
 *
 * @param gameArea the interactive game area in Covey Town
 * @param coveyTownController the main controller for managing the town and player interactions
 * @param score the most recent score from the player, passed from the previous screen.
 * @param multipalyer boolean that indicates whether or not the game was multiplayer, this is used
 * to handle exiting the game.
 */

export default function NewGameOverScreen({
  gameArea,
  coveyTownController,
  score,
  multiplayer,
}: {
  gameArea: GameArea;
  coveyTownController: TownController;
  score: number;
  multiplayer: boolean;
}) {
  const ourPlayer = coveyTownController.ourPlayer;
  const closeModal = useCallback(() => {
    if (gameArea) {
      coveyTownController.unPause();
      coveyTownController.interactEnd(gameArea);
      const controller = coveyTownController.getGameAreaController(gameArea);
      if (multiplayer) {
        controller.leaveGame();
      }
    }
  }, [coveyTownController, gameArea, multiplayer]);

  return (
    <>
      <Modal isOpen={true} onClose={closeModal} closeOnOverlayClick={false}>
        <ModalContent maxW='500px' h='720px' bg='skyblue'>
          <ModalHeader>
            <Image
              src='https://see.fontimg.com/api/rf5/MXOr/NGM3ZDI5YTQ3NTg3NGU1YzhkMWFmNTAxOGFlMTQ1MjUudHRm/R2FtZSBPdmVy/botsmatic-demo.png?r=fs&h=81&w=1250&fg=000000&bg=FFFFFF&tb=1&s=65'
              alt='Minecraft fonts'
            />
          </ModalHeader>
          <Center>
            <Text fontSize='3xl' fontWeight='bold' color='white' mt={5}>
              Your score was:
            </Text>
          </Center>

          <Center>
            <Text fontSize='5xl' fontWeight='bold' color='yellow.400' mt={2}>
              {score}
            </Text>
          </Center>

          <Center>
            <Text fontSize='3xl' fontWeight='bold' color='white' mt={5}>
              Your best score is:
            </Text>
          </Center>
          <Center>
            <Text fontSize='5xl' fontWeight='bold' color='yellow.400' mt={2}>
              {ourPlayer.highScore}
            </Text>
          </Center>
          <Center paddingTop='200'>
            <Button
              size='lg'
              bg='blue.400'
              color='white'
              _hover={{ bg: 'blue.500' }}
              _active={{ bg: 'blue.600' }}
              onClick={closeModal}>
              Exit
            </Button>
          </Center>
        </ModalContent>
      </Modal>
    </>
  );
}
