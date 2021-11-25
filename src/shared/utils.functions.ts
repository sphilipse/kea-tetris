import { shapeMap } from "./shapes.map";
import { Rotation, Grid, BoardLocation, BoardState, Shape, Color, TetroState, tetroMap } from "./tetris.interfaces";

export function getClockwiseRotation(rotation: Rotation): Rotation {
  return (rotation + 1) % 4;
}

export function getCounterClockwiseRotation(rotation: Rotation): Rotation {
  return rotation > 0 ? rotation - 1 : Rotation.LEFT;
}

export function hasCollision(grid: Grid, blocks: BoardLocation[]): boolean {
  return blocks
    .map(({ x, y }) => {
      if (y > 21 || x < 0 || x > 9 || y < 0) {
        return true;
      }
      return grid[y][x] != undefined;
    })
    .reduce((prev, curr) => prev || curr);
}

export function transformTetro(
  state: BoardState,
  newRotation: Rotation | undefined,
  newLocation: BoardLocation | undefined
): BoardState {
  if (!state?.activeTetro) {
    return state;
  }
  const location = newLocation ?? state.activeTetro.location;
  const rotation = newRotation ?? state.activeTetro.rotation;
  const locationBlocks = getBlocks(
    state.activeTetro.shape,
    rotation,
    location
  );
  if (hasCollision(state.grid, locationBlocks)) {
    return state;
  }
  return {
    ...state,
    activeTetro: {
      ...state.activeTetro,
      location,
      rotation,
      settled: false,
    },
  };
}

export function getBlocks(
  shape: Shape,
  rotation: Rotation,
  location: BoardLocation
): BoardLocation[] {
  const blocks = shapeMap.get(shape)?.[rotation] ?? [];
  return blocks.map(({ x, y }) => ({ x: x + location.x, y: y + location.y }));
}

export function generateNewTetro(): TetroState {
  const tetro = tetroMap.get(getRandomInt(0, tetroMap.size));
  if (!tetro) {
    return generateNewTetro();
  }
  const { color, shape } = tetro;
  return {
    color,
    shape,
    rotation: Rotation.UP,
    location: {
      x: 5,
      y: 0,
    },
    settled: false,
  };
}

export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

export function isNotNullish<T>(input: T | null | undefined): input is T {
  return input != null;
}
