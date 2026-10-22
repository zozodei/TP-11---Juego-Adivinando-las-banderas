// App: decide qué pantalla mostrar según si hay partida en curso.
// No recibe ni pasa props: cada componente lee del Context.
import { GameProvider, useJuego } from './GameContext'
import Inicio from './components/Inicio'
import Flag from './components/Flag'
import GuessForm from './components/GuessForm'
import ScoreBoard from './components/ScoreBoard'
import Timer from './components/Timer'
import Leaderboard from './components/Leaderboard'

// Pantalla de juego (se muestra mientras "jugando" es true)
function Partida() {
  const { mensaje, terminarPartida, resetScore } = useJuego()

  return (
    <div>
      <ScoreBoard />
      <Timer />
      <Flag />
      <p className="mensaje">{mensaje}</p>
      <GuessForm />
      <button onClick={resetScore}>Reiniciar puntaje</button>
      <button onClick={terminarPartida}>Terminar y guardar puntaje</button>
      <Leaderboard />
    </div>
  )
}

// Elige entre la pantalla de inicio y la de partida
function Pantalla() {
  const { jugando } = useJuego()
  return jugando ? <Partida /> : <Inicio />
}

export default function App() {
  return (
    // GameProvider envuelve todo para que cualquier componente acceda al juego
    <GameProvider>
      <main>
        <h1>🌍 Adiviná el país</h1>
        <Pantalla />
      </main>
    </GameProvider>
  )
}
