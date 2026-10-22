// =====================================================================
// GameContext: ACÁ VIVE TODA LA LÓGICA Y EL ESTADO DEL JUEGO.
// Los componentes no se pasan datos por props: todos leen de acá
// usando el hook useJuego().
// =====================================================================
import { createContext, useContext, useEffect, useState } from 'react'

// Creamos el "contexto": es como una caja global donde dejamos los datos
const GameContext = createContext()

// Hook propio para leer la caja más fácil desde cualquier componente
export function useJuego() {
  return useContext(GameContext)
}

// ---------- Constantes del juego ----------
const TIEMPO_INICIAL = 15 // segundos que dura cada bandera
const PUNTOS_ACIERTO = 10 // puntos base por acertar
const PUNTOS_ERROR = 1 // puntos que se restan al fallar
const COSTO_PISTA = 2 // segundos que se descuentan al pedir una pista
const URL_BANDERAS = 'https://countriesnow.space/api/v0.1/countries/flag/images'
const URL_CAPITALES = 'https://countriesnow.space/api/v0.1/countries/capital'

// ---------- Funciones auxiliares (no usan estado) ----------

// Devuelve un elemento al azar de una lista
function elegirAlAzar(lista) {
  return lista[Math.floor(Math.random() * lista.length)]
}

// Mezcla una lista (para que la capital correcta no quede siempre primera)
function mezclar(lista) {
  return [...lista].sort(() => Math.random() - 0.5)
}

// Saca mayúsculas y tildes para comparar textos sin que importe cómo se escribió
// Ej: "  Perú " -> "peru"
function normalizar(texto) {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

// Lee el ranking guardado en el navegador (si no hay nada, devuelve lista vacía)
function leerRankingGuardado() {
  const guardado = localStorage.getItem('ranking')
  return guardado ? JSON.parse(guardado) : []
}

// ---------- El Provider: envuelve la app y reparte el estado ----------
export function GameProvider({ children }) {
  // --- Datos que vienen de las APIs ---
  const [paises, setPaises] = useState([]) // [{name, flag, iso2}, ...]
  const [capitales, setCapitales] = useState({}) // { AR: 'Buenos Aires', ... }
  const [cargando, setCargando] = useState(true) // true mientras esperamos las APIs
  const [errorCarga, setErrorCarga] = useState(false) // true si falló la API

  // --- Datos de la partida ---
  const [jugando, setJugando] = useState(false) // false = pantalla de inicio
  const [modo, setModo] = useState('banderas') // 'banderas' o 'capitales'
  const [jugador, setJugador] = useState('') // nombre del jugador actual
  const [paisActual, setPaisActual] = useState(null) // país que hay que adivinar
  const [puntaje, setPuntaje] = useState(0)
  const [tiempo, setTiempo] = useState(TIEMPO_INICIAL) // segundos que quedan
  const [mensaje, setMensaje] = useState('') // feedback ("¡Correcto!", etc.)

  // --- Pistas (modo banderas): posiciones de las letras ya reveladas ---
  const [letrasReveladas, setLetrasReveladas] = useState([])

  // --- Modo capitales ---
  const [opciones, setOpciones] = useState([]) // las 3 capitales posibles
  const [descartadas, setDescartadas] = useState([]) // opciones que el jugador erró

  // --- Ranking: se inicializa leyendo localStorage ---
  const [ranking, setRanking] = useState(leerRankingGuardado)

  // ===================================================================
  // EFECTO 1: al montar la app, traer países (banderas) y capitales
  // ===================================================================
  useEffect(() => {
    // Pedimos las dos APIs a la vez y esperamos que terminen ambas
    Promise.all([
      fetch(URL_BANDERAS).then((r) => r.json()),
      fetch(URL_CAPITALES).then((r) => r.json()),
    ])
      .then(([respuestaBanderas, respuestaCapitales]) => {
        setPaises(respuestaBanderas.data)

        // Armamos un "diccionario" iso2 -> capital para buscar rápido
        // (usamos iso2 porque los nombres no siempre coinciden entre APIs)
        const diccionario = {}
        respuestaCapitales.data.forEach((p) => {
          if (p.capital) diccionario[p.iso2] = p.capital
        })
        setCapitales(diccionario)
        setCargando(false)
      })
      .catch(() => {
        setErrorCarga(true)
        setCargando(false)
      })
  }, [])

  // ===================================================================
  // EFECTO 2: guardar el ranking en localStorage cada vez que cambia
  // ===================================================================
  useEffect(() => {
    localStorage.setItem('ranking', JSON.stringify(ranking))
  }, [ranking])

  // ===================================================================
  // EFECTO 3: el TIMER. Cada vez que cambia "tiempo" se programa
  // un descuento de 1 segundo. Si llega a 0, se pierde la bandera.
  // ===================================================================
  useEffect(() => {
    if (!jugando || !paisActual) return // sin partida no hay timer

    // Se acabó el tiempo: -1 punto y pasamos al siguiente país
    if (tiempo === 0) {
      setPuntaje((p) => p - PUNTOS_ERROR)
      setMensaje(`⏰ Se acabó el tiempo. Era ${paisActual.name}`)
      nextCountry()
      return
    }

    // Dentro de 1 segundo, bajamos el tiempo en 1
    const id = setTimeout(() => setTiempo((t) => t - 1), 1000)
    // Limpieza: si el efecto se vuelve a ejecutar, cancelamos el anterior
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jugando, paisActual, tiempo])

  // ===================================================================
  // FUNCIONES DEL JUEGO
  // ===================================================================

  // Elige un país nuevo al azar y reinicia timer, pistas y opciones
  function nextCountry() {
    // En modo capitales solo sirven los países que tienen capital conocida
    const candidatos =
      modo === 'capitales' ? paises.filter((p) => capitales[p.iso2]) : paises

    // Evitamos que salga el mismo país dos veces seguidas
    const nuevo = elegirAlAzar(candidatos.filter((p) => p.name !== paisActual?.name))
    const paisConCapital = { ...nuevo, capital: capitales[nuevo.iso2] }

    setPaisActual(paisConCapital)
    setTiempo(TIEMPO_INICIAL)
    setLetrasReveladas([])
    setDescartadas([])

    if (modo === 'capitales') {
      // 2 capitales incorrectas al azar + la correcta, todas mezcladas
      const incorrectas = mezclar(
        candidatos.filter((p) => p.iso2 !== nuevo.iso2).map((p) => capitales[p.iso2]),
      ).slice(0, 2)
      setOpciones(mezclar([paisConCapital.capital, ...incorrectas]))
    }
  }

  // Empieza una partida nueva con el nombre y modo elegidos
  function iniciarPartida(nombre, modoElegido) {
    setJugador(nombre)
    setModo(modoElegido)
    setPuntaje(0)
    setMensaje('')
    setPaisActual(null) // así el primer país no depende del de la partida anterior
    setJugando(true)
  }

  // Cuando arranca la partida (jugando pasa a true) elegimos el primer país.
  // Se hace en un efecto porque necesita que "modo" ya esté actualizado.
  useEffect(() => {
    if (jugando) nextCountry()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jugando])

  // El jugador arriesga una respuesta (texto del país o de la capital)
  function guess(respuesta) {
    // Qué texto es el correcto depende del modo
    const correcta = modo === 'banderas' ? paisActual.name : paisActual.capital

    if (normalizar(respuesta) === normalizar(correcta)) {
      // ACIERTO: 10 puntos + los segundos que sobraron
      const ganados = PUNTOS_ACIERTO + tiempo
      setPuntaje((p) => p + ganados)
      setMensaje(`✅ ¡Correcto! +${ganados} puntos`)
      nextCountry()
    } else {
      // ERROR: -1 punto
      setPuntaje((p) => p - PUNTOS_ERROR)
      setMensaje('❌ Incorrecto: -1 punto')
      // En capitales, la opción errada se tacha para no volver a elegirla
      if (modo === 'capitales') setDescartadas((d) => [...d, respuesta])
    }
  }

  // Revela una letra al azar del nombre del país y resta 2 segundos
  function pedirPista() {
    const nombre = paisActual.name
    // Posiciones que todavía no se revelaron (ignoramos los espacios)
    const ocultas = [...nombre]
      .map((letra, i) => i)
      .filter((i) => nombre[i] !== ' ' && !letrasReveladas.includes(i))

    if (ocultas.length === 0) return // ya está todo revelado
    setLetrasReveladas([...letrasReveladas, elegirAlAzar(ocultas)])
    setTiempo((t) => Math.max(t - COSTO_PISTA, 0))
  }

  // Termina la partida: guarda el puntaje en el ranking y vuelve al inicio
  function terminarPartida() {
    const nuevoRanking = [...ranking, { nombre: jugador, puntaje }]
      .sort((a, b) => b.puntaje - a.puntaje) // de mayor a menor
      .slice(0, 10) // nos quedamos con los 10 mejores
    setRanking(nuevoRanking)
    setJugando(false)
    setPaisActual(null)
  }

  // Pone el puntaje de nuevo en 0
  function resetScore() {
    setPuntaje(0)
    setMensaje('')
  }

  // ===================================================================
  // VALORES DERIVADOS (se calculan en cada render a partir del estado)
  // ===================================================================

  // Nombre con guiones bajos: "A _ g _ n t _ _ a" según las letras reveladas
  const pistaTexto = paisActual
    ? [...paisActual.name]
        .map((letra, i) => (letra === ' ' ? '  ' : letrasReveladas.includes(i) ? letra : '_'))
        .join(' ')
    : ''

  // Opciones de capitales que se muestran. Cada 5 segundos desaparece una
  // incorrecta: a los 5s transcurridos (quedan 10) se va una, a los 10s otra.
  const eliminadasPorTiempo = Math.floor((TIEMPO_INICIAL - tiempo) / 5)
  const incorrectas = opciones.filter((o) => o !== paisActual?.capital)
  const sacadasPorTiempo = incorrectas.slice(0, eliminadasPorTiempo)
  const opcionesVisibles = opciones.filter(
    (o) => !sacadasPorTiempo.includes(o) && !descartadas.includes(o),
  )

  // Todo lo que expone el Context a los componentes
  const valor = {
    paises,
    cargando,
    errorCarga,
    jugando,
    modo,
    jugador,
    paisActual,
    puntaje,
    tiempo,
    mensaje,
    ranking,
    pistaTexto,
    opcionesVisibles,
    iniciarPartida,
    guess,
    nextCountry,
    resetScore,
    pedirPista,
    terminarPartida,
  }

  return <GameContext.Provider value={valor}>{children}</GameContext.Provider>
}
