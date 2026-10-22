// <Flag />: muestra la bandera del país que hay que adivinar.
// Lee el país actual directamente del Context (sin props).
import { useJuego } from '../GameContext'

export default function Flag() {
  const { paisActual } = useJuego()

  if (!paisActual) return null

  return <img className="bandera" src={paisActual.flag} alt="Bandera a adivinar" />
}
