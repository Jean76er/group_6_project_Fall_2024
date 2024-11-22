import {
    Button,
    List,
    ListItem,
    Modal,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    useToast,
    Center,
    Image,
  } from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { InteractableID } from '../../../../types/CoveyTownSocket';
import GameAreaInteractable from '../GameArea';
import SillySharkAreaController from '../../../../classes/interactable/SillySharkAreaController';
import SkinSelectionScreen from './SkinSelection';

export default function NewGameOverScreen() {  

    return (
    <>
    <ModalContent maxW='500px' h='720px' bg='skyblue'>
    <ModalHeader>
      <Image
        src='https://see.fontimg.com/api/rf5/Exl8/NjhmNTJiODNkNDBjNDgwNWE0ZmM5N2JmM2IxMWNlNDcudHRm/U2lsbHkgU2hhcms/botsmatic3d.png?r=fs&h=68&w=1040&fg=000000&bg=FFFFFF&tb=1&s=65'
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