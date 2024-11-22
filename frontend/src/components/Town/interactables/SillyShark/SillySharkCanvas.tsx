import { Modal, ModalContent, ModalOverlay } from '@chakra-ui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import SillySharkAreaController from '../../../../classes/interactable/SillySharkAreaController';
import GameArea from '../GameArea';
import GameAreaInteractable from '../GameArea';
import Obstacle from './Obstacle';
import TownController from '../../../../classes/TownController';
import NewGameOverScreen from './GameOver';

export type SillySharkProps = {
  gameAreaController: SillySharkAreaController;
};

export default function NewSillySharkCanvas({
  gameAreaController,
  newSillySharkGame,
  gameArea,
  coveyTownController,
}: {
  gameAreaController: SillySharkAreaController;
  newSillySharkGame: GameAreaInteractable;
  gameArea: GameArea;
  coveyTownController: TownController;
}): JSX.Element {
  const isOpen = newSillySharkGame !== undefined;
  const [gameOver, setGameOver] = useState(false);
  const gravity = 1; /**Makes spirte fall faster or slower*/
  const [velocity, setVelocity] = useState(0);

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
    scored: boolean;
  }

  const [obstacles, setObstacles] = useState<ObstaclePair[]>([]);
  /**canvasHeight: The vertical height of the canvas
   * obstacleWidth: Width of the obstacles; while the heights of the pipes will vary, the widths should remain constant
   * gapHeight: Represents the gap between the top and bottom obstacles. The heights of the top and bottom pipes will
   * change, however, the space between them should not become smaller or bigger.
   * obstacleSpacing: The space between each obstacle pair. This will determine how far apart each obstacle pair is
   */
  const canvasHeight = 720;
  const gapHeight = 150;
  const obstacleWidth = 50;
  const obstacleImage = useRef(new Image());
  const canvas = useRef<HTMLCanvasElement>(null);
  const obstacleSpacing = 300;
  /** Sprite properties and state */
  const [spriteY, setSpriteY] = useState(canvasHeight / 2);
  const spriteWidth = 50;
  const spriteHeight = 50;
  const spriteImage = useRef(new Image());
  /** adding state for the score*/
  const [score, setScore] = useState(0);

  /**Load the sprite image when the component mounts */
  useEffect(() => {
    spriteImage.current.src = gameAreaController.skin1 as string;
  }, [gameAreaController.skin1]);

  /** Generate random heights for obstacles */
  const randomObstacleHeights = () => {
    const topHeight = Math.floor(Math.random() * (canvasHeight - gapHeight - 100)) + 50;
    const bottomHeight = Math.floor(Math.random() * (canvasHeight - gapHeight - 100)) + 50;
    return { topHeight, bottomHeight };
  };

  useEffect(() => {
    if (isOpen) {
      obstacleImage.current.src = '/SillySharkResources/obstacles/obstacle.png';

      obstacleImage.current.onload = () => {
        console.log('Obstacle image loaded:', obstacleImage.current.src);
        const { topHeight, bottomHeight } = randomObstacleHeights();
        const firstTopObstacle = new Obstacle(topHeight, obstacleWidth, obstacleImage.current);
        const firstBottomObstacle = new Obstacle(
          bottomHeight,
          obstacleWidth,
          obstacleImage.current,
        );
        setObstacles([
          {
            top: firstTopObstacle,
            bottom: firstBottomObstacle,
            x: canvas.current?.width || 500,
            scored: false,
          },
        ]);
      };

      obstacleImage.current.onerror = () => {
        console.error('Failed to load bottom obstacle image:', obstacleImage.current.src);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    /** checkCollision function calculates the position of the sprite and checks for collision between the
     *  sprite and obstacle
     */
    const checkCollision = () => {
      for (const obstacle of obstacles) {
        const spriteLeft =
          (canvas.current?.width ?? 500) /
          4; /** Position the sprite at 1/4 the width of the canvas */
        const spriteRight = spriteLeft + spriteWidth;
        const spriteTop = spriteY;
        const spriteBottom = spriteY + spriteHeight;

        /** Define top obstacle boundaries */
        const topObstacleLeft = obstacle.x;
        const topObstacleRight = obstacle.x + obstacleWidth;
        const topObstacleTop = 0;
        const topObstacleBottom = obstacle.top.obstacleHeight;

        /** Define bottom obstacle boundaries */

        const bottomObstacleLeft = obstacle.x;
        const bottomObstacleRight = obstacle.x + obstacleWidth;
        const bottomObstacleTop = obstacle.top.obstacleHeight + gapHeight;
        const bottomObstacleBottom = canvasHeight;

        /** Check collision with top obstacle*/
        if (
          spriteRight > topObstacleLeft &&
          spriteLeft < topObstacleRight &&
          spriteBottom > topObstacleTop &&
          spriteTop < topObstacleBottom
        ) {
          return true;
        }

        /** Check collision with bottom obstacle */
        if (
          spriteRight > bottomObstacleLeft &&
          spriteLeft < bottomObstacleRight &&
          spriteBottom > bottomObstacleTop &&
          spriteTop < bottomObstacleBottom
        ) {
          return true;
        }

        /** Check if sprite hit the floor */
        if (spriteY + spriteHeight >= canvasHeight) {
          return true;
        }
        return false;
      }
    };
    const draw = () => {
      /** If collision was detected, stop drawing and updating the game */
      if (gameOver) {
        return;
      }
      const canvasCurr = canvas.current;
      if (!canvasCurr) {
        return;
      }
      const context = canvasCurr.getContext('2d');
      if (!context) {
        return;
      }

      context.clearRect(0, 0, canvasCurr.width, canvasCurr.height);

      if (spriteImage.current.complete) {
        context.drawImage(
          spriteImage.current,
          canvasCurr.width / 4,
          spriteY,
          spriteWidth,
          spriteHeight,
        );
      }

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
          obstacle.top.obstacleHeight +
            gapHeight /** Bottom starts after the top obstacle end + gap height */,
          obstacleWidth,
          canvasCurr.height - obstacle.top.obstacleHeight - gapHeight,
        );
        context.fillStyle = 'white';
        context.font = '30px Arial';
        context.fillText(`Score: ${score}`, 20, 50);
      });

      /** Check for collision */
      if (checkCollision()) {
        setGameOver(true);
        setScore(0);
        /** Implement additional logic to set the game state to game over and switch to game
         * over screen
         */
      }
    };

    /**Handles sprite's vertical movement */
    const updateSpritePosition = () => {
      setSpriteY(prevY => {
        const newY = prevY + velocity;
        return Math.max(0, newY);
      });

      setVelocity(prevVelocity =>
        Math.min(prevVelocity + gravity, 4),
      ); /** Cap the downward velocity*/
    };

    /** The update obstacles function updates the position of each obstacle, moving them
     * to the left and removing obstacles that have moved off-screen to free memory
     */
    const updateObstacles = () => {
      const spriteX = (canvas.current?.width ?? 500) / 4;

      setObstacles(prevObstacles => {
        /** Move all obstacles to the left */
        const newObstacles = prevObstacles.map(obstacle => ({
          ...obstacle,
          x: obstacle.x - 2,
        }));

        /** Remove obstacles that have moved off screen */
        const filteredObstacles = newObstacles.filter(obstacle => obstacle.x + obstacleWidth > 0);

        /** Add new a new obstacle if the obstacle furthest to the left has moved off the screen */
        const lastObstacle = filteredObstacles[filteredObstacles.length - 1];
        if (!lastObstacle || lastObstacle.x <= canvasHeight) {
          const { topHeight, bottomHeight } = randomObstacleHeights();
          const newTopObstacle = new Obstacle(topHeight, obstacleWidth, obstacleImage.current);
          const newBottomObstacle = new Obstacle(
            bottomHeight,
            obstacleWidth,
            obstacleImage.current,
          );

          /**  Space the new obstacle from the previous one */
          const newObstacleX = lastObstacle ? lastObstacle.x + obstacleSpacing : canvasHeight;
          filteredObstacles.push({
            top: newTopObstacle,
            bottom: newBottomObstacle,
            x: newObstacleX,
            scored: false,
          });
        }

        return filteredObstacles;
      });

      setObstacles(prevObstacles => {
        prevObstacles.forEach(obstacle => {
          if (obstacle.x + obstacleWidth < spriteX && !obstacle.scored) {
            setScore(prevScore => prevScore + 1);
            obstacle.scored = true;
          }
        });

        return prevObstacles;
      });
    };

    /** Redraw and update obstacles every frame */
    const interval = setInterval(() => {
      updateSpritePosition();
      draw();
      updateObstacles();
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [obstacles, spriteY, gameOver, score, gravity, velocity]);

  useEffect(() => {
    const handleJumpEvent = () => {
      setVelocity(-10);
    };

    gameAreaController.addListener('JUMP', handleJumpEvent);

    return () => {
      gameAreaController.removeListener('JUMP', handleJumpEvent);
    };
  }, [gameAreaController]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        gameAreaController.emit('JUMP');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameAreaController]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}
      size='xs'>
      <ModalOverlay style={{ pointerEvents: 'none' }} />
      <ModalContent
        maxW='500px'
        h='720px'
        bg='skyblue'
        style={{ pointerEvents: 'auto' }}
        onClick={() => {
          console.log('Click event triggered');
          gameAreaController.emit('JUMP');
        }}>
        <canvas ref={canvas} width='500' height='720' />
      </ModalContent>
      {gameOver && (
        <NewGameOverScreen gameArea={gameArea} coveyTownController={coveyTownController} gameAreaController={gameAreaController} />
      )}
    </Modal>
  );
}
