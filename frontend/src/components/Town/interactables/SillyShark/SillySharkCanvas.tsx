import { chakra, Container, useToast } from '@chakra-ui/react';
import React, {useCallback, useEffect, useState } from 'react';

export {};

/*
 * This component will render the background 
 */

const StyledSillySharkBoard = chakra(Container, {
    baseStyle: {
        background: 'skyblue',
        width: '400px',
        height: '400px',
        alignItems: 'center'
    },
});

