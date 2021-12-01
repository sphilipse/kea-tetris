import { kea } from 'kea'
import { AppLogicType } from './appLogic.interface'
import { shapeMap } from '../shared/shapes.map';
import { BoardLocation, BoardState, Color, GameState, Grid, GRID_HEIGHT, GRID_WIDTH, Shape, TetroState } from '../shared/tetris.interfaces';
import { generateNewTetro, getBlocks, getClockwiseRotation, getCounterClockwiseRotation, hasCollision, isNotNullish, transformTetro } from '../shared/utils.functions';

const initialGridState: Grid = Array(GRID_HEIGHT).fill(
  Array(GRID_WIDTH).fill(undefined)
);

const scoreMap = new Map([
  [1, 40],
  [2, 100],
  [3, 300],
  [4, 1200],
]);


export const appLogic = kea<AppLogicType>({
  actions: {
    tick: () => true,
    keyDown: (key: string) => ({ key }),
    moveDown: () => true,
    moveUp: () => true,
    moveLeft: () => true,
    moveRight: () => true,
    rotateClockwise: () => true,
    rotateCounterClockwise: () => true,
    startGame: () => true,
    stopGame: () => true,
    pauseGame: () => true,
    resumeGame: () => true,
    loseGame: () => true,
    removeLines: (lines: number[]) => ({ lines }),
    setSpeed: (speed: number) => ({ speed }),
    createTetro: (color: Color, shape: Shape) => ({ color, shape }),
    setIntervalId: (intervalId: NodeJS.Timer) => ({ intervalId })
  },
  reducers: {
    score: [
      0,
      {
        removeLines: (state, action) => {
          const score = scoreMap.get(action.lines.length) ?? 0;
          return state + score;
        }
      }
    ],
    speed: [
      500,
      {
        setSpeed: (_, action) => action.speed
      }
    ],
    intervalId: {
      setIntervalId: (_, action) => action.intervalId
    },
    gameState: [
      GameState.INACTIVE,
      {
        startGame: () => GameState.ACTIVE,
        pauseGame: () => GameState.PAUSED,
        resumeGame: () => GameState.ACTIVE,
        stopGame: () => GameState.INACTIVE,
        loseGame: () => GameState.LOST,
      }
    ],
    board: [
      { grid: initialGridState, activeTetro: undefined },
      {
        startGame: () => ({ grid: initialGridState, activeTetro: generateNewTetro() }),
        removeLines: (state, action) => {
          const cleanedGrid = state.grid.filter(
            (_, index) => !action.lines.some((line) => line === index)
          );
          const linesToAdd = Array(action.lines.length).fill(
            Array(GRID_WIDTH).fill(undefined)
          );
          return { ...state, grid: [...linesToAdd, ...cleanedGrid] };
        },
        rotateClockwise: (state) => transformTetro(state, state.activeTetro?.rotation != null ? getClockwiseRotation(state.activeTetro.rotation) : undefined, undefined),
        rotateCounterClockwise: (state) => transformTetro(state, state.activeTetro?.rotation != null ? getCounterClockwiseRotation(state.activeTetro.rotation) : undefined, undefined),
        moveLeft: (state) => transformTetro(state, state.activeTetro?.rotation, state.activeTetro?.location ? { ...state.activeTetro?.location, x: state.activeTetro.location.x - 1 } : undefined),
        moveRight: (state) => transformTetro(
          state,
          state.activeTetro?.rotation,
          state.activeTetro?.location
            ? {
              ...state.activeTetro.location,
              x: state.activeTetro.location.x + 1,
            }
            : undefined
        ),
        moveDown: (state) => {
          if (!state.activeTetro) {
            return state;
          }
          const newLocation = {
            ...state.activeTetro.location,
            y: state.activeTetro.location.y + 1,
          };
          const newLocationBlocks = getBlocks(
            state.activeTetro.shape,
            state.activeTetro.rotation,
            newLocation
          );
          const collided = hasCollision(state.grid, newLocationBlocks);
          // second time in a row that tetro tried to move down and couldn't, merge with board
          if (collided && state.activeTetro.settled) {
            const oldLocationBlocks = getBlocks(
              state.activeTetro.shape,
              state.activeTetro.rotation,
              state.activeTetro.location
            );
            return {
              ...state,
              grid: state.grid.map((line, indexY) =>
                line.map((block, indexX) => {
                  const tetroLivesHere = oldLocationBlocks.some(
                    ({ x, y }) => indexX === x && indexY === y
                  );
                  return tetroLivesHere ? state.activeTetro?.color : block;
                })
              ),
              activeTetro: generateNewTetro(),
            };
          }
          return {
            ...state,
            activeTetro: {
              ...state.activeTetro,
              settled: collided,
              location: collided ? state.activeTetro.location : newLocation,
            },
          };
        }
      }
    ]
  },
  listeners: ({ actions, values }) => ({
    keyDown: ({ key }) => {
      // Possibly move this check to the actual move logic in the reducer?
      if (values.gameState === GameState.ACTIVE) {
        switch (key) {
          case 'ArrowDown':
            actions.moveDown();
            break;
          case 'ArrowLeft':
            actions.moveLeft();
            break;
          case 'ArrowRight':
            actions.moveRight();
            break;
          case 'ArrowUp':
            actions.rotateClockwise();
            break;
          case 'Control':
            actions.rotateCounterClockwise();
            break;
          case 'Escape':
            actions.pauseGame();
            break;
        }
      }
    },
    startGame: () => {
      // If I don't specify window.setInterval it grabs the Node type definition for some reason
      const intervalId = window.setInterval(actions.tick, 500);
      actions.setIntervalId(intervalId);
    },
    stopGame: () => { clearInterval(values.intervalId) },
    pauseGame: () => { clearInterval(values.intervalId) },
    resumeGame: () => { const intervalId = window.setInterval(actions.tick, values.speed); actions.setIntervalId(intervalId); },
    loseGame: () => { clearInterval(values.intervalId) },
    setSpeed: (action) => { clearInterval(values.intervalId); const intervalId = window.setInterval(actions.tick, action.speed); actions.setIntervalId(intervalId); },
    tick: () => { actions.moveDown(); },
    moveDown: () => {
      if (values.board.grid[0].some(value => value != undefined)) {
        actions.loseGame();
      } else {
        const filteredGrid = values.board.grid
          .map((line, index) =>
            line.every((block) => block != undefined) ? index : undefined
          )
          .filter(isNotNullish);
        if (filteredGrid.length > 0) {
          actions.removeLines(filteredGrid)
        }
      }
    }
  }),
  selectors: ({ selectors }) => ({
    activeTetro: [
      () => [selectors.board],
      (board: BoardState) => board.activeTetro,
    ],
    tetroColor: [
      () => [selectors.activeTetro],
      (activeTetro: TetroState | undefined) => activeTetro?.color ?? Color.GREY
    ],
    tetroBlocks: [
      () => [selectors.activeTetro],
      (activeTetro: TetroState) => activeTetro?.shape ? shapeMap.get(activeTetro.shape)?.[activeTetro.rotation] ?? [] : []
    ],
    tetroBlocksLocation: [
      () => [selectors.board, selectors.tetroBlocks],
      (board: BoardState, tetroBlocks: BoardLocation[]) => tetroBlocks.map(({ x, y }) => {
        const locationX = board.activeTetro?.location?.x ?? 0;
        const locationY = board.activeTetro?.location?.y ?? 0;
        return { x: x + locationX, y: y + locationY };
      })
    ],
    blocks: [
      () => [selectors.board, selectors.tetroBlocksLocation, selectors.tetroColor],
      (board: BoardState, tetroBlocksLocation: BoardLocation[], tetroColor: Color) => {
        return board.grid
          .map((lines, indexY) =>
            lines.map((block, indexX) => {
              const color = tetroBlocksLocation.find(
                ({ x, y }) => x === indexX && y === indexY
              )
                ? tetroColor
                : block;
              return color ?? Color.GREY;
            })
          )
          .reduce((prev, curr) => [...prev, ...curr]);
      }
    ],
  })
});
