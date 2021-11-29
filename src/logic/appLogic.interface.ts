import { MakeLogicType } from 'kea';
import { Color, GameState, Grid, Shape, TetroState, BoardLocation } from '../shared/tetris.interfaces';

interface AppLogicValues {
  board: {
    grid: Grid;
    activeTetro?: TetroState;
  },
  score: number,
  speed: number,
  gameState: GameState,
  intervalId?: number,

  // selectors
  blocks: Color[],
  activeTetro: TetroState | undefined,
  tetroBlocks: BoardLocation[],
  tetroBlocksLocation: BoardLocation[],
  tetroColor: Color,
};

interface AppLogicActions {
  tick(): {};
  keyDown(key: string): { key: string };
  moveDown(): {};
  moveUp(): {};
  moveLeft(): {};
  moveRight(): {};
  rotateClockwise(): {};
  rotateCounterClockwise(): {};
  startGame(): {};
  stopGame(): {};
  pauseGame(): {};
  resumeGame(): {};
  loseGame(): {};
  removeLines(lines: number[]): { lines: number[] };
  setSpeed(speed: number): { speed: number };
  createTetro(color: Color, shape: Shape): {color: Color, shape: Shape};
  setIntervalId(intervalId: number): { intervalId: number };
};

export type AppLogicType = MakeLogicType<AppLogicValues, AppLogicActions>;
