import { useState, useEffect, useRef } from 'react';
import './MarkovChain.css';

// Los lugares donde puede estar nuestro gatito
type Lugar = '🏠 Casa' | '🌳 Parque' | '🏫 Escuela';

const MarkovChain = () => {
  // Lugares disponibles con sus emojis y colores
  const lugares: { nombre: Lugar; emoji: string; color: string }[] = [
    { nombre: '🏠 Casa', emoji: '🏠', color: '#FF6B6B' },
    { nombre: '🌳 Parque', emoji: '🌳', color: '#4ECB71' },
    { nombre: '🏫 Escuela', emoji: '🏫', color: '#4DABF7' },
  ];

  // Matriz de probabilidades (qué tan probable es que el gatito vaya a cada lugar)
  const [probabilidades, setProbabilidades] = useState({
    '🏠 Casa': { '🏠 Casa': 30, '🌳 Parque': 50, '🏫 Escuela': 20 },
    '🌳 Parque': { '🏠 Casa': 40, '🌳 Parque': 30, '🏫 Escuela': 30 },
    '🏫 Escuela': { '🏠 Casa': 60, '🌳 Parque': 30, '🏫 Escuela': 10 },
  });

  // Estado actual del gatito
  const [lugarActual, setLugarActual] = useState<Lugar>('🏠 Casa');
  const [historial, setHistorial] = useState<Lugar[]>(['🏠 Casa']);
  const [visitas, setVisitas] = useState({ '🏠 Casa': 1, '🌳 Parque': 0, '🏫 Escuela': 0 });
  const [isAnimando, setIsAnimando] = useState(false);
  const [mostrarDado, setMostrarDado] = useState(false);
  const [numeroDado, setNumeroDado] = useState(0);
  const [mensaje, setMensaje] = useState('¡Hola! Soy Michi 🐱 y estoy en casa. ¿A dónde iré?');
  const [velocidad, setVelocidad] = useState(1500);
  const [autoPlay, setAutoPlay] = useState(false);
  const autoPlayRef = useRef(autoPlay);
  const lugarActualRef = useRef(lugarActual);

  // Mantener referencias actualizadas
  useEffect(() => {
    autoPlayRef.current = autoPlay;
  }, [autoPlay]);

  useEffect(() => {
    lugarActualRef.current = lugarActual;
  }, [lugarActual]);

  // Función para elegir el siguiente lugar basado en probabilidades
  const elegirSiguienteLugar = (actual: Lugar): { lugar: Lugar; numero: number } => {
    const numero = Math.floor(Math.random() * 100) + 1;
    const probs = probabilidades[actual];
    
    let acumulado = 0;
    for (const lugar of lugares) {
      acumulado += probs[lugar.nombre];
      if (numero <= acumulado) {
        return { lugar: lugar.nombre, numero };
      }
    }
    return { lugar: lugares[2].nombre, numero };
  };

  // Dar un paso (mover al gatito)
  const darPaso = async () => {
    if (isAnimando) return;
    
    setIsAnimando(true);
    setMostrarDado(true);
    
    // Animación del dado
    for (let i = 0; i < 10; i++) {
      setNumeroDado(Math.floor(Math.random() * 100) + 1);
      await new Promise(r => setTimeout(r, 100));
    }
    
    const { lugar: nuevoLugar, numero } = elegirSiguienteLugar(lugarActualRef.current);
    setNumeroDado(numero);
    
    await new Promise(r => setTimeout(r, 500));
    
    // Generar mensaje divertido
    const mensajes = {
      '🏠 Casa': [
        '¡Michi vuelve a casa a dormir una siesta! 😴',
        '¡Hora de comer en casa! 🍽️',
        'Michi extrañaba su cama 🛏️',
      ],
      '🌳 Parque': [
        '¡Michi va al parque a jugar! ⚽',
        '¡A cazar mariposas! 🦋',
        'Michi quiere trepar árboles 🌲',
      ],
      '🏫 Escuela': [
        '¡Michi va a aprender cosas nuevas! 📚',
        '¡Hora de estudiar matemáticas! ➕',
        'Michi visita a sus amigos 👋',
      ],
    };
    
    const mensajesLugar = mensajes[nuevoLugar];
    setMensaje(mensajesLugar[Math.floor(Math.random() * mensajesLugar.length)]);
    
    setLugarActual(nuevoLugar);
    setHistorial(prev => [...prev.slice(-19), nuevoLugar]);
    setVisitas(prev => ({ ...prev, [nuevoLugar]: prev[nuevoLugar] + 1 }));
    
    await new Promise(r => setTimeout(r, 500));
    setMostrarDado(false);
    setIsAnimando(false);
  };

  // Auto-play
  useEffect(() => {
    if (!autoPlay) return;
    
    const intervalo = setInterval(() => {
      if (autoPlayRef.current) {
        darPaso();
      }
    }, velocidad);
    
    return () => clearInterval(intervalo);
  }, [autoPlay, velocidad]);

  // Reiniciar
  const reiniciar = () => {
    setAutoPlay(false);
    setLugarActual('🏠 Casa');
    setHistorial(['🏠 Casa']);
    setVisitas({ '🏠 Casa': 1, '🌳 Parque': 0, '🏫 Escuela': 0 });
    setMensaje('¡Hola! Soy Michi 🐱 y estoy en casa. ¿A dónde iré?');
    setMostrarDado(false);
  };

  // Actualizar probabilidad
  const actualizarProb = (desde: Lugar, hacia: Lugar, valor: number) => {
    setProbabilidades(prev => ({
      ...prev,
      [desde]: { ...prev[desde], [hacia]: valor }
    }));
  };

  // Verificar si las probabilidades suman 100
  const sumaProbs = (lugar: Lugar) => {
    return Object.values(probabilidades[lugar]).reduce((a, b) => a + b, 0);
  };

  const totalVisitas = Object.values(visitas).reduce((a, b) => a + b, 0);

  return (
    <div className="markov-game">
      {/* Header divertido */}
      <header className="game-header">
        <h1>🐱 Las Aventuras de Michi 🐱</h1>
      </header>

      {/* Explicación para niños */}
      <section className="explicacion-ninos">
        <div className="libro-icon">📖</div>
        <div className="explicacion-texto">
          <h2>¿Qué está pasando aquí?</h2>
          <p>
            <strong>Michi el gatito</strong> puede estar en 3 lugares: 
            <span className="lugar-tag casa">🏠 Casa</span>, 
            <span className="lugar-tag parque">🌳 Parque</span> o 
            <span className="lugar-tag escuela">🏫 Escuela</span>.
          </p>
          <p>
            Cada vez que Michi decide moverse, <strong>lanzamos un dado mágico</strong> 🎲 
            que elige a dónde va. ¡Pero aquí está el truco! Las probabilidades de ir a cada 
            lugar dependen de <strong>dónde está ahora</strong>.
          </p>
          <p className="ejemplo">
            💡 Por ejemplo: Si Michi está en la <strong>escuela</strong>, es más probable 
            que vaya a <strong>casa</strong> (¡porque está cansado de estudiar! 😄)
          </p>
        </div>
      </section>

      {/* Área principal del juego */}
      <section className="area-juego">
        {/* Mapa visual */}
        <div className="mapa-container">
          <h2>🗺️ Mapa de Michi</h2>
          <div className="mapa">
            {lugares.map(lugar => (
              <div 
                key={lugar.nombre}
                className={`lugar-card ${lugarActual === lugar.nombre ? 'activo' : ''}`}
                style={{ '--lugar-color': lugar.color } as React.CSSProperties}
              >
                <div className="lugar-emoji">{lugar.emoji}</div>
                <div className="lugar-nombre">{lugar.nombre.split(' ')[1]}</div>
                {lugarActual === lugar.nombre && (
                  <div className="michi-aqui">
                    <span className="michi-sprite">🐱</span>
                  </div>
                )}
                <div className="visitas-badge">
                  {visitas[lugar.nombre]} visitas
                </div>
              </div>
            ))}
          </div>
          
          {/* Burbuja de mensaje */}
          <div className="mensaje-burbuja">
            <div className="michi-cara">🐱</div>
            <div className="mensaje-texto">{mensaje}</div>
          </div>
        </div>

        {/* Dado mágico */}
        <div className={`dado-container ${mostrarDado ? 'visible' : ''}`}>
          <div className="dado">
            <span className="dado-numero">{numeroDado}</span>
          </div>
          <p>¡Número mágico!</p>
        </div>
      </section>



      {/* Tabla de probabilidades interactiva */}
      <section className="probabilidades-section">
        <h2>🎲 ¿Qué tan probable es que Michi vaya a cada lugar?</h2>
        <p className="prob-hint">
          Los números son porcentajes (%). <strong>Cada fila debe sumar 100%</strong> 
          (porque Michi SIEMPRE tiene que ir a algún lugar). <strong>¡Puedes cambiarlos!</strong>
        </p>
        
        <div className="tabla-probabilidades">
          <div className="tabla-header">
            <div className="celda-header">Si está en...</div>
            <div className="celda-header">→ 🏠 Casa</div>
            <div className="celda-header">→ 🌳 Parque</div>
            <div className="celda-header">→ 🏫 Escuela</div>
            <div className="celda-header">Total</div>
          </div>
          
          {lugares.map(desde => (
            <div 
              key={desde.nombre} 
              className={`tabla-fila ${sumaProbs(desde.nombre) !== 100 ? 'fila-error' : ''}`}
            >
              <div className="celda-lugar">
                <span className="emoji-mini">{desde.emoji}</span>
                {desde.nombre.split(' ')[1]}
              </div>
              {lugares.map(hacia => (
                <div key={hacia.nombre} className="celda-input">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={probabilidades[desde.nombre][hacia.nombre]}
                    onChange={(e) => actualizarProb(desde.nombre, hacia.nombre, parseInt(e.target.value) || 0)}
                    disabled={isAnimando || autoPlay}
                  />
                  <span className="porcentaje">%</span>
                </div>
              ))}
              <div className={`celda-total ${sumaProbs(desde.nombre) === 100 ? 'correcto' : 'incorrecto'}`}>
                {sumaProbs(desde.nombre)}%
                {sumaProbs(desde.nombre) === 100 ? ' ✅' : ' ❌'}
              </div>
            </div>
          ))}
        </div>
      </section>

           {/* Explicación de cómo se construyen las probabilidades */}
      <section className="porque-probabilidades-section">
        <h2>🤔 ¿Por qué estas probabilidades?</h2>
        <p className="porque-intro">
          Las probabilidades se basan en el <strong>comportamiento lógico</strong> de Michi. 
          ¡Piensa como un gatito! 🐱
        </p>
        
        <div className="porque-grid">
          <div className="porque-card">
            <div className="porque-header casa-bg">
              <span>🏠</span> Si está en CASA...
            </div>
            <ul className="porque-lista">
              <li><strong>30% quedarse:</strong> Es cómodo, pero Michi es curioso</li>
              <li><strong>50% → Parque:</strong> ¡A los gatos les encanta explorar!</li>
              <li><strong>20% → Escuela:</strong> Menos probable, los gatos prefieren jugar</li>
            </ul>
          </div>
          
          <div className="porque-card">
            <div className="porque-header parque-bg">
              <span>🌳</span> Si está en el PARQUE...
            </div>
            <ul className="porque-lista">
              <li><strong>40% → Casa:</strong> Se cansa de jugar y quiere descansar</li>
              <li><strong>30% quedarse:</strong> Puede seguir jugando un rato</li>
              <li><strong>30% → Escuela:</strong> A veces pasa por ahí de camino</li>
            </ul>
          </div>
          
          <div className="porque-card">
            <div className="porque-header escuela-bg">
              <span>🏫</span> Si está en la ESCUELA...
            </div>
            <ul className="porque-lista">
              <li><strong>60% → Casa:</strong> ¡Cansado de estudiar, quiere ir a casa!</li>
              <li><strong>30% → Parque:</strong> Puede ir a descansar al parque</li>
              <li><strong>10% quedarse:</strong> Casi nunca, ¡ya quiere salir! 😄</li>
            </ul>
          </div>
        </div>
        
        <div className="mundo-real-box">
          <h3>🌍 ¿Y en la vida real?</h3>
          <p>Las probabilidades se obtienen de:</p>
          <ul>
            <li><strong>📊 Datos históricos:</strong> "De 100 días soleados, 70 fueron seguidos por otro día soleado" → P = 70%</li>
            <li><strong>📋 Encuestas:</strong> "El 60% de clientes que compran leche, vuelven a comprar leche"</li>
            <li><strong>🔧 Reglas del sistema:</strong> "El semáforo en verde SIEMPRE pasa a amarillo" → P = 100%</li>
          </ul>
        </div>
      </section>

      {/* Controles del juego */}
      <section className="controles-section">
        <h2>🎮 Controles</h2>
        
        <div className="controles-grid">
          <button 
            className="btn-juego btn-paso"
            onClick={darPaso}
            disabled={isAnimando || autoPlay}
          >
            <span className="btn-icon">👆</span>
            <span className="btn-texto">Un Paso</span>
          </button>
          
          <button 
            className={`btn-juego btn-auto ${autoPlay ? 'activo' : ''}`}
            onClick={() => setAutoPlay(!autoPlay)}
            disabled={isAnimando}
          >
            <span className="btn-icon">{autoPlay ? '⏸️' : '▶️'}</span>
            <span className="btn-texto">{autoPlay ? 'Pausar' : 'Auto-Play'}</span>
          </button>
          
          <button 
            className="btn-juego btn-reiniciar"
            onClick={reiniciar}
          >
            <span className="btn-icon">🔄</span>
            <span className="btn-texto">Reiniciar</span>
          </button>
        </div>
        
        <div className="velocidad-control">
          <label>
            🐌 Velocidad: 
            <input
              type="range"
              min="500"
              max="3000"
              step="100"
              value={velocidad}
              onChange={(e) => setVelocidad(parseInt(e.target.value))}
            />
            🐇
          </label>
          <span className="velocidad-valor">{(velocidad / 1000).toFixed(1)}s</span>
        </div>
      </section>
 

      {/* Estadísticas visuales */}
      <section className="estadisticas-section">
        <h2>📊 ¿Cuántas veces fue Michi a cada lugar?</h2>
        
        <div className="barras-container">
          {lugares.map(lugar => {
            const porcentaje = totalVisitas > 0 
              ? ((visitas[lugar.nombre] / totalVisitas) * 100).toFixed(1) 
              : 0;
            return (
              <div key={lugar.nombre} className="barra-item">
                <div className="barra-label">
                  <span>{lugar.emoji}</span>
                  <span>{lugar.nombre.split(' ')[1]}</span>
                </div>
                <div className="barra-track">
                  <div 
                    className="barra-fill"
                    style={{ 
                      width: `${porcentaje}%`,
                      backgroundColor: lugar.color
                    }}
                  >
                    <span className="barra-valor">{visitas[lugar.nombre]}</span>
                  </div>
                </div>
                <div className="barra-porcentaje">{porcentaje}%</div>
              </div>
            );
          })}
        </div>
        
        <div className="total-pasos">
          Total de movimientos: <strong>{totalVisitas - 1}</strong>
        </div>
      </section>

      {/* Historial visual */}
      <section className="historial-section">
        <h2>📜 El viaje de Michi</h2>
        <div className="historial-visual">
          {historial.map((lugar, index) => (
            <div key={index} className="historial-paso">
              <span className="paso-emoji">
                {lugar === '🏠 Casa' ? '🏠' : lugar === '🌳 Parque' ? '🌳' : '🏫'}
              </span>
              {index < historial.length - 1 && <span className="paso-flecha">→</span>}
            </div>
          ))}
        </div>
      </section>

               {/* Explicación del dado mágico */}
      <section className="dado-explicacion-section">
        <h2>🎲 ¿Cómo funciona el Dado Mágico?</h2>
        <div className="dado-explicacion-content">
          <div className="dado-demo">
            <div className="dado-mini">🎲</div>
            <div className="dado-rango">1 - 100</div>
          </div>
          <div className="dado-texto">
            <p>
              El dado genera un <strong>número del 1 al 100</strong>. 
              Dependiendo del número que salga, Michi irá a un lugar diferente.
            </p>
            <div className="rangos-ejemplo">
              <p><strong>Ejemplo si Michi está en 🏠 Casa:</strong></p>
              <div className="rango-item casa-rango">
                <span>1 - 30</span> → 🏠 Se queda en Casa (30%)
              </div>
              <div className="rango-item parque-rango">
                <span>31 - 80</span> → 🌳 Va al Parque (50%)
              </div>
              <div className="rango-item escuela-rango">
                <span>81 - 100</span> → 🏫 Va a la Escuela (20%)
              </div>
            </div>
            <p className="dado-conclusion">
              💡 <strong>¡Entre más grande el rango, más probable es que Michi vaya ahí!</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Sección de aprendizaje */}
      <section className="aprendizaje-section">
        <h2>🧠 ¿Qué aprendimos?</h2>
        
        <div className="conceptos-grid">
          <div className="concepto-card" style={{ borderColor: '#FF6B6B' }}>
            <div className="concepto-icon">🔮</div>
            <h3>Propiedad de Markov</h3>
            <p>
              Michi solo piensa en <strong>dónde está AHORA</strong>. 
              No le importa dónde estuvo antes. ¡Es como si tuviera memoria de pez! 🐟
            </p>
          </div>
          
          <div className="concepto-card" style={{ borderColor: '#4ECB71' }}>
            <div className="concepto-icon">📊</div>
            <h3>Probabilidades</h3>
            <p>
              Los números en la tabla dicen qué tan probable es cada movimiento. 
              Si un número es <strong>grande</strong>, es más probable que pase. 
              Si es <strong>pequeño</strong>, es raro que pase.
            </p>
          </div>
          
          <div className="concepto-card" style={{ borderColor: '#4DABF7' }}>
            <div className="concepto-icon">🎯</div>
            <h3>Patrones</h3>
            <p>
              Si haces muchos movimientos, verás que Michi visita algunos lugares 
              más que otros. ¡Eso se llama <strong>distribución estacionaria</strong>!
            </p>
          </div>
          
          <div className="concepto-card" style={{ borderColor: '#9775FA' }}>
            <div className="concepto-icon">🌍</div>
            <h3>Usos en la vida real</h3>
            <p>
              Las cadenas de Markov se usan para predecir el clima ☀️🌧️, 
              recomendar videos en YouTube 📺, ¡y hasta para que Google 
              encuentre las mejores páginas web! 🔍
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default MarkovChain;
