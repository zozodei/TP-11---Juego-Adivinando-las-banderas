// <Timer />: muestra la cuenta regresiva.
// El conteo en sí lo hace el GameContext; acá solo se muestra.
import { useJuego } from '../GameContext'

export default function Timer() {
  const { tiempo } = useJuego()

  // Cuando quedan 5 segundos o menos se pone en rojo (clase "urgente")
  return <div className={tiempo <= 5 ? 'timer urgente' : 'timer'}>⏱️ {tiempo}s</div>
}
