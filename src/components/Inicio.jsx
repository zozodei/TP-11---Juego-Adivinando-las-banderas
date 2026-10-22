// <Inicio />: pantalla inicial. El jugador pone su nombre y elige el modo.
import { useState } from 'react'
import { useJuego } from '../GameContext'
import Leaderboard from './Leaderboard'

export default function Inicio() {
  const { iniciarPartida, cargando, errorCarga } = useJuego()

  // Estado local del formulario (solo sirve acá)
  const [nombre, setNombre] = useState('')
  const [modo, setModo] = useState('banderas')

  if (cargando) return <p>Cargando países...</p>
  if (errorCarga) return <p>No se pudieron cargar los países. Probá recargar la página.</p>

  function empezar(evento) {
    evento.preventDefault()
    if (nombre.trim() === '') return // el nombre es obligatorio
    iniciarPartida(nombre.trim(), modo)
  }

  return (
    <div>
      <form onSubmit={empezar}>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Tu nombre"
        />
        <select value={modo} onChange={(e) => setModo(e.target.value)}>
          <option value="banderas">🚩 Adivinar la bandera</option>
          <option value="capitales">🏛️ Adivinar la capital</option>
        </select>
        <button type="submit">Jugar</button>
      </form>
      <Leaderboard />
    </div>
  )
}
