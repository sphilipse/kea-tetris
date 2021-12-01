import React, { useEffect } from 'react'
import logo from './logo.svg'
import './App.scss'
import { useActions, useValues } from 'kea'
import { appLogic } from './logic/appLogic'
import { GameState } from './shared/tetris.interfaces'
import { Controls } from './components/controls'
import { Block } from './components/block'

function App() {
  const { blocks, score } = useValues(appLogic);
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
    <div>
      <header className="title">
        Tetris
      </header>
      <main>
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
