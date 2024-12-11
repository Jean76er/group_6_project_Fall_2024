import TownController from '../../../../classes/TownController';
import { GameArea, GameStatus, SillySharkGameState } from '../../../../types/CoveyTownSocket';
import PlayerController from '../../../../classes/PlayerController';
import { nanoid } from 'nanoid';
import { mock } from 'jest-mock-extended';
import SillySharkAreaController from '../../../../classes/interactable/SillySharkAreaController';

const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => {
  const ui = jest.requireActual('@chakra-ui/react');
  return {
    ...ui,
    useToast: () => mockToast,
  };
});

class MockSillySharkAreaController extends SillySharkAreaController {
  makeMove = jest.fn();

  mockIsPlayer = false;

  score = 0;

  public setTownController(townController: any) {
    this._townController = townController;
  }

  public constructor() {
    super(nanoid(), mock<GameArea<SillySharkGameState>>(), mock<TownController>());
  }

  get player1(): PlayerController | undefined {
    throw new Error('Method should not be called within this component.');
  }

  get player2(): PlayerController | undefined {
    throw new Error('Method should not be called within this component.');
  }

  get winner(): PlayerController | undefined {
    throw new Error('Method should not be called within this component.');
  }

  get status(): GameStatus {
    throw new Error('Method should not be called within this component.');
  }

  get isPlayer() {
    return this.mockIsPlayer;
  }

  public isActive(): boolean {
    throw new Error('Method should not be called within this component.');
  }
}

describe('SillySharkCanvas Tests', () => {
  it('calls sendInteractableCommand with the correct arguments when setSkin is called', async () => {
    const playerId = 'testPlayerId';
    const skin = '/path/to/skin.png';

    const mockSendInteractableCommand = jest.fn();
    const mockTownController = {
      sendInteractableCommand: mockSendInteractableCommand,
      ourPlayer: { id: playerId },
    } as any;

    const controller = new SillySharkAreaController('testAreaId', {} as any, mockTownController);
    controller.instanceID = 'testInstanceID';

    await controller.setSkin(playerId, skin);

    expect(mockSendInteractableCommand).toHaveBeenCalledWith(controller.id, {
      type: 'SetSkin',
      gameID: 'testInstanceID',
      playerID: playerId,
      skin,
    });
  });
  it('calls sendInteractableCommand with the correct arguments when setPosition is called', async () => {
    const positionY = 150;
    const mockSendInteractableCommand = jest.fn();
    const mockTownController = { sendInteractableCommand: mockSendInteractableCommand } as any;

    const controller = new SillySharkAreaController('testAreaId', {} as any, mockTownController);
    controller.instanceID = 'testInstanceID';

    await controller.setPosition(positionY);

    expect(mockSendInteractableCommand).toHaveBeenCalledWith(controller.id, {
      type: 'RenderSprite',
      gameID: 'testInstanceID',
      positionY,
    });
  });
  it('emits "gameStarted" and sends the correct arguments when startGame is called', async () => {
    const mockSendInteractableCommand = jest.fn();
    const mockEmit = jest.spyOn(SillySharkAreaController.prototype, 'emit');
    const mockTownController = { sendInteractableCommand: mockSendInteractableCommand } as any;

    const controller = new SillySharkAreaController('testAreaId', {} as any, mockTownController);
    controller.instanceID = 'testInstanceID';

    await controller.startGame();

    expect(mockSendInteractableCommand).toHaveBeenCalledWith(controller.id, {
      type: 'StartGame',
      gameID: 'testInstanceID',
    });
    expect(mockEmit).toHaveBeenCalledWith('gameStarted');
  });

  it('calls jump and emits the jump event', async () => {
    const mockEmit = jest.fn();
    const mockSendInteractableCommand = jest.fn();

    const mockController = new MockSillySharkAreaController();

    mockController.setTownController({
      sendInteractableCommand: mockSendInteractableCommand,
    });

    mockController.emit = mockEmit;

    await mockController.jump();

    expect(mockEmit).toHaveBeenCalledWith('jump');
    expect(mockSendInteractableCommand).not.toHaveBeenCalled();
  });

  it('calls sendInteractableCommand with the correct arguments when setReady is called', async () => {
    const playerId = 'testPlayerId';
    const mockSendInteractableCommand = jest.fn();
    const mockTownController = { sendInteractableCommand: mockSendInteractableCommand } as any;

    const controller = new SillySharkAreaController('testAreaId', {} as any, mockTownController);
    controller.instanceID = 'testInstanceID';
    await controller.setReady(playerId);

    expect(mockSendInteractableCommand).toHaveBeenCalledWith(controller.id, {
      type: 'SetReady',
      gameID: 'testInstanceID',
      playerID: playerId,
    });
  });

 
});
