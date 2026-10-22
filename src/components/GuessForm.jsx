// <GuessForm />: donde el jugador responde.
//  - Modo banderas: input de texto con sugerencias + botón de pista.
//  - Modo capitales: 3 botones (se van sacando opciones con el tiempo).
import { useState } from 'react'
import { useJuego } from '../GameContext'

export default function GuessForm() {
  const { modo, paises, guess, pistaTexto, pedirPista, opcionesVisibles } = useJuego()

  // Texto que el usuario está escribiendo (estado local del input, no es dato del juego)
  const [texto, setTexto] = useState('')

  // ---------- MODO CAPITALES ----------
  if (modo === 'capitales') {
    return (
      <div className="opciones">
        <p>¿Cuál es la capital?</p>
        {opcionesVisibles.map((capital) => (
          <button key={capital} onClick={() => guess(capital)}>
            {capital}
          </button>
        ))}
      </div>
    )
  }

  // ---------- MODO BANDERAS ----------
  function enviar(evento) {
    evento.preventDefault() // evita que se recargue la página
    if (texto.trim() === '') return
    guess(texto)
    setTexto('') // limpiamos el input
  }

  return (
    <form onSubmit={enviar}>
      {/* La pista: letras reveladas y guiones bajos */}
      <p className="pista">{pistaTexto}</p>

      {/* "list" conecta el input con el datalist de abajo (autocompletado) */}
      <input
        list="lista-paises"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="¿De qué país es?"
      />
      <datalist id="lista-paises">
        {paises.map((p) => (
          <option key={p.iso2} value={p.name} />
        ))}
      </datalist>

      <button type="submit">Adivinar</button>
      <button type="button" onClick={pedirPista}>
        💡 Pista (-2s)
      </button>
    </form>
  )
}
