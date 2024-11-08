import { Modal, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/react';
import React, { useCallback, useEffect } from 'react';
import { useInteractable } from '../../../../classes/TownController';
//import { ConversationArea } from '../../../../generated/client';
import useTownController from '../../../../hooks/useTownController';

export default function NewSillySharkCanvas(): JSX.Element {
  const coveyTownController = useTownController();
  const newConversation = useInteractable('gameArea');

  const isOpen = newConversation !== undefined;

  useEffect(() => {
    if (newConversation) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, newConversation]);

  const closeModal = useCallback(() => {
    if (newConversation) {
      coveyTownController.interactEnd(newConversation);
    }
  }, [coveyTownController, newConversation]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}
      size='xs'>
      <ModalOverlay />
      <ModalContent maxW='500px' h='720px' bg='skyblue'>
        <ModalHeader>{coveyTownController.userName}</ModalHeader>
      </ModalContent>
    </Modal>
  );
}
