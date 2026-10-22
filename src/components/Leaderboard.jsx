// <Leaderboard />: tabla de posiciones. Los datos vienen de localStorage
// (el Context los carga y los guarda).
import { useJuego } from '../GameContext'

export default function Leaderboard() {
  const { ranking } = useJuego()

  if (ranking.length === 0) return <p>Todavía no hay puntajes guardados.</p>

  return (
    <div>
      <h2>🏆 Ranking</h2>
      <table>
        <tbody>
          {/* Una fila por cada jugador, ya ordenados de mayor a menor */}
          {ranking.map((fila, i) => (
            <tr key={i}>
              <td>{i + 1}°</td>
              <td>{fila.nombre}</td>
              <td>{fila.puntaje} pts</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
