import { Modal, ModalOverlay } from '@chakra-ui/react';
import React, { useCallback, useEffect } from 'react';
// import Obstacle from './Obstacle';
import { useInteractable } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import SkinSelectionScreen from './SkinSelection';
export default function NewSillySharkCanvas(): JSX.Element {
  const coveyTownController = useTownController();
  const newSillySharkGame = useInteractable('gameArea');

  const isOpen = newSillySharkGame !== undefined;

  useEffect(() => {
    if (newSillySharkGame) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, newSillySharkGame]);

  const closeModal = useCallback(() => {
    if (newSillySharkGame) {
      coveyTownController.interactEnd(newSillySharkGame);
    }
  }, [coveyTownController, newSillySharkGame]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}
      size='xs'>
      <ModalOverlay />
      <SkinSelectionScreen />
    </Modal>
  );
}
