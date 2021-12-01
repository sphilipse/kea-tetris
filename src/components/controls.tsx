import { useActions, useValues } from "kea"
import { appLogic } from "../logic/appLogic";
import { GameState } from "../shared/tetris.interfaces";


export const Controls = () => {
  const { gameState } = useValues(appLogic);
  const { startGame, resumeGame, pauseGame } = useActions(appLogic);
  return (<div>
    {gameState === GameState.INACTIVE || gameState === GameState.LOST ? (<button onClick={startGame}>Start new game</button>) : ('')}
    {gameState === GameState.PAUSED ? (<button onClick={resumeGame}>Resume game</button>) : ('')}
    {gameState === GameState.ACTIVE ? (<button onClick={pauseGame}>Pause game</button>) : ('')}
  </div >)
};
