import React, { useEffect } from 'react'
import logo from './logo.svg'
import './App.scss'
import { useActions, useValues } from 'kea'
import { appLogic } from './logic/appLogic'
import { GameState } from './shared/tetris.interfaces'

function App() {
  const { blocks, score, gameState } = useValues(appLogic);
  const { keyDown, startGame, pauseGame, resumeGame } = useActions(appLogic);
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      keyDown(event.key);
    }

    document.addEventListener('keydown', handleKeyDown);

    // Don't forget to clean up
    return function cleanup() {
      document.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  return (
    <div onKeyDown={event => keyDown(event.key)}>
      <header className="title">
        Tetris
      </header>
      <main>
        <div className="wrapper">
          {
            blocks.map((color, index) => (<div key={index} className={color}></div>))
          }
        </div>
        <div>Score: {score}</div>
        <div>
          {gameState === GameState.INACTIVE || gameState === GameState.LOST ? (<button onClick={startGame}>Start new game</button>) : ('')}
          {gameState === GameState.PAUSED ? (<button onClick={resumeGame}>Resume game</button>) : ('')}
          {gameState === GameState.ACTIVE ? (<button onClick={pauseGame}>Pause game</button>) : ('')}
        </div>
      </main>
    </div>
  )
}

export default App
