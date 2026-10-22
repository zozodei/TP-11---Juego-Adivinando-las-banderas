// <ScoreBoard />: muestra el puntaje actual y el jugador, siempre visible.
import { useJuego } from '../GameContext'

export default function ScoreBoard() {
  const { puntaje, jugador } = useJuego()

  return (
    <div className="puntaje">
      <span>👤 {jugador}</span>
      <strong>Puntaje: {puntaje}</strong>
    </div>
  )
}
