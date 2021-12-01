import { useEffect } from 'react'
import './App.scss'
import { useActions, useValues } from 'kea'
import { appLogic } from './logic/appLogic'
import { Controls } from './components/controls'
import { Block } from './components/block'
import { GameState } from './shared/tetris.interfaces';

function App() {
  const { blocks, score, gameState } = useValues(appLogic);
  const { keyDown } = useActions(appLogic);
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
    <div className="mainWrapper">
      <header className="title">
        <h1>Tetris</h1>
      </header>
      <main>
        {(gameState === GameState.LOST ? <h1 className="lost">GAME OVER</h1> : null)}
        <div className="wrapper">
          {
            blocks.map((color, index) => (<Block key={index} color={color} />))
          }
        </div>
        <div>Score: {score}</div>
        <Controls />
      </main>
    </div>
  )
}

export default App
