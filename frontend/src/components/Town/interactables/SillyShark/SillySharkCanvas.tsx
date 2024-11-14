import { Modal, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Obstacle from './Obstacle';
import { useInteractable } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';

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

  /** Define an obstacle pair */
  interface ObstaclePair {
    top: Obstacle;
    bottom: Obstacle;
    x: number;
  }

  const [obstacles, setObstacles] = useState<ObstaclePair[]>([]);
  const canvasHeight = 600;
  const gapHeight = 150;
  const obstacleWidth = 50;
  const topObstacleImage = useRef(new Image());
  const bottomObstacleImage = useRef(new Image());
  const canvas = useRef<HTMLCanvasElement>(null);

  const randomObstacleHeights = () => {
    const topHeight = Math.floor(Math.random() * (canvasHeight - gapHeight - 100)) + 50;
    const bottomHeight = Math.floor(Math.random() * (canvasHeight - gapHeight - 100)) + 50;
    return { topHeight, bottomHeight };
  };

  useEffect(() => {
    if (isOpen) {
      topObstacleImage.current.src = '/SillySharkImages/top_obstacle.png';
      bottomObstacleImage.current.src = '/SillySharkImages/bottom_obstacle.png';

      topObstacleImage.current.onload = () => {
        console.log('Top obstacle image loaded:', topObstacleImage.current.src);
        bottomObstacleImage.current.onload = () => {
          console.log('Bottom obstacle image loaded:', bottomObstacleImage.current.src);
          const { topHeight, bottomHeight } = randomObstacleHeights();
          const firstTopObstacle = new Obstacle(topHeight, obstacleWidth, topObstacleImage.current);
          const firstBottomObstacle = new Obstacle(
            bottomHeight,
            obstacleWidth,
            bottomObstacleImage.current,
          );
          setObstacles([{ top: firstTopObstacle, bottom: firstBottomObstacle, x: canvas.current?.width || 500 }]);
        };
      };
      topObstacleImage.current.onerror = () => {
        console.error('Failed to load top obstacle image:', topObstacleImage.current.src);
      };
      bottomObstacleImage.current.onerror = () => {
        console.error('Failed to load bottom obstacle image:', bottomObstacleImage.current.src);
      };
    }
  }, [isOpen]);

  /** Draw is responsible for rendering the current game state on the canvas.
   *  It also clears the canvas on each frame and redraws the obstacles at their updated positions,
   *  redrawing at 60 fps for smooth animation
    */
  useEffect(() => {
    const draw = () => {
      const canvasCurr = canvas.current;
      if (!canvasCurr) {
        return;
      }
      const context = canvasCurr.getContext('2d');
      if (!context) {
        return;
      }

      context.clearRect(0, 0, canvasCurr.width, canvasCurr.height);

      /** Drawing obstacles on the canvas */
      obstacles.forEach(obstacle => {
        context.drawImage(
          obstacle.top.obstacleImage,
          obstacle.x,
          0,
          obstacleWidth,
          obstacle.top.obstacleHeight,
        );
        context.drawImage(
          obstacle.bottom.obstacleImage,
          obstacle.x,
          obstacle.top.obstacleHeight + gapHeight, /** Bottom starts after the top obstacle end + gap height */
          obstacleWidth,
          canvasCurr.height - obstacle.top.obstacleHeight - gapHeight,
        );
      });
    };

    /** The update obstacles function updates the position of each obstacle, moving them
     * to the left and removing obstacles that have moved off-screen to free memory
     */
    const updateObstacles = () => {
      setObstacles(prevObstacles => {
        /** Move all obstacles to the left */
        const newObstacles = prevObstacles.map(obstacle => ({
          ...obstacle,
          x: obstacle.x - 2, 
        }));

        /** Remove obstacles that have moved off screen */
        const filteredObstacles = newObstacles.filter(obstacle => obstacle.x + obstacleWidth > 0);

        return filteredObstacles;
      });
    };

    /** Redraw and update obstacles every frame */
    const interval = setInterval(() => {
      draw();
      updateObstacles();
    }, 1000 / 60); 

    return () => clearInterval(interval);
  }, [obstacles]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}
      size="xs"
    >
      <ModalOverlay />
      <ModalContent maxW="500px" h="720px" bg="skyblue">
        <ModalHeader>{"Silly Shark"}</ModalHeader>
        <canvas ref={canvas} width="500" height="600" />
      </ModalContent>
    </Modal>
  );
}
