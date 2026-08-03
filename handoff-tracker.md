# Handoff — Tracker de Partidos

## 1. Descripción del proyecto

Aplicación web para registrar y trackear partidos de fútbol entre un grupo de amigos. Desplegada en **https://trackercoop.netlify.app**.

### Stack
- **Frontend:** HTML + CSS + JavaScript vanilla (sin frameworks)
- **Backend:** Supabase (PostgreSQL + Auth)
- **Despliegue:** Netlify (conectado a GitHub para deploy automático)
- **Archivos:** `index.html`, `styles.css`, `app.js`

---

## 2. Funcionalidades implementadas

### Autenticación
- Login con email y contraseña real via Supabase Auth
- Botón FAB 🔐 para abrir modal de login
- Botón "Cerrar sesión" fijo en esquina superior derecha
- Visitantes en modo solo lectura
- Tab "Registrar" e "Historial" ocultos para visitantes

### Registro de partidos
- Mínimo 2 jugadores por equipo, máximo 3
- No se puede seleccionar resultado sin jugadores en ambos equipos
- Resultado: Victoria local / Empate / Derrota local
- Marcador con validaciones coherentes al resultado
- Goles individuales por jugador (suma por equipo no puede superar goles del marcador)
- Asistencias por jugador (suma por equipo no puede superar goles del equipo)
- Tarjetas rojas por jugador (máximo 5 por equipo)
- Temporada se guarda automáticamente en cada partido

### Jugadores
- Alta y baja (solo admin)
- Avatar con color personalizable
- Vista rápida de stats (V/E/D y %)
- Click → detalle completo

### Perfil de jugador (filtrado por temporada seleccionada)
- Stats generales: V/E/D, % victorias
- Racha actual
- Forma reciente (dots de colores)
- Estadísticas de goles: equipo a favor/contra, goles propios, promedio, asistencias, rojas
- Logros y medallas automáticos
- Logro único Top 1 victorias y Top 1 derrotas (cambia de nombre al cambiar líder)
- Destacados: mejor compañero, rival fácil/difícil
- Con quién ha jugado: ordenado por partidos juntos con % victorias
- Récords personales
- Todos los partidos con filtro por V/E/D

### Historial (solo admin)
- Lista completa, filtro por jugador y resultado
- Borrar historial

### Ranking (filtrado por temporada)
- Selector de temporada
- Jugador más activo
- Individual: victorias, empates, derrotas
- Equipos: 2vs2, 2vs3, 3vs3

### Dashboard (filtrado por temporada)
- Selector de temporada
- Resumen global: partidos, victorias locales, empates, derrotas locales
- Partido más goleado
- Día más activo
- Top 3 goleadores (goles individuales)
- Top 3 asistencias
- Top 3 tarjetas rojas
- Head to Head
- Logros y medallas
- Gráfica de evolución de victorias
- Comparar temporadas (usa todos los partidos, no filtrado)

### Temporadas
- Banner con temporada activa
- Cambio de temporada sin perder datos anteriores
- Selector en Dashboard y Ranking
- Por defecto muestra temporada activa; si no tiene partidos, muestra la primera disponible

---

## 3. Estructura de datos en Supabase

### Tabla `players`
```json
{
  "id": "texto (genId())",
  "name": "texto",
  "color": "hex color",
  "created_at": "timestamp"
}
```

### Tabla `matches`
```json
{
  "id": "texto",
  "local_players": ["id1", "id2", "id3"],
  "visit_players": ["id1", "id2"],
  "result": "w | d | l",
  "goals_local": 2,
  "goals_visit": 1,
  "season": "Junio",
  "date": "01 de jun. de 2026, 10:30 p. m.",
  "scorers": {"player_id": 2, "player_id2": 0},
  "assists": {"player_id": 1},
  "reds": {"player_id": 1},
  "created_at": "timestamp"
}
```

### Tabla `config`
```json
[
  {"key": "season", "value": "Agosto"},
  {"key": "top1_wins_title_index", "value": "1"},
  {"key": "top1_losses_title_index", "value": "0"},
  {"key": "top1_wins_player_id", "value": "abc123"},
  {"key": "top1_losses_player_id", "value": "xyz789"}
]
```

### Estado en memoria (`state`)
```js
let state = {
  players: [],
  matches: [],
  localPlayers: [],      // jugadores seleccionados partido actual (local)
  visitPlayers: [],      // jugadores seleccionados partido actual (visitante)
  selectedResult: null,  // 'w' | 'd' | 'l'
  season: '',            // temporada activa actual
  selectedSeason: '',    // temporada seleccionada en el selector
  scoreLocal: 0,
  scoreVisit: 0,
  editingAvatarId: null,
  scorers: {},           // { id_jugador: goles }
  assists: {},           // { id_jugador: asistencias }
  reds: {},              // { id_jugador: rojas }
  top1WinsTitleIndex: 0,
  top1LossesTitleIndex: 0,
  top1WinsPlayerId: '',
  top1LossesPlayerId: ''
};
```

### Row Level Security
- Lectura pública en las 3 tablas
- Escritura/borrado solo para `auth.role() = 'authenticated'`

---

## 4. Credenciales y configuración

- **Supabase URL:** `https://ddezobualtvmnjavuipr.supabase.co`
- **Supabase anon key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkZXpvYnVhbHR2bW5qYXZ1aXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NjE1MDYsImV4cCI6MjA5NTIzNzUwNn0.OrDAbQaFAa8WxSM6epWgKtk21xsoOz0b5DOkeF1a0PQ`
- **Admin email:** `andresj2026@gmail.com`
- **Netlify:** `https://trackercoop.netlify.app`
- **GitHub:** conectado a Netlify para deploy automático

---

## 5. Pendientes y próximos pasos

1. Filtro de temporada en el **perfil de jugador** no actualiza al cambiar temporada en el selector (solo re-renderiza si se entra de nuevo al perfil)
2. **Head to Head** usa `state.matches` completo, no filtrado por temporada
3. Los **logros del Top 1** se calculan sobre todos los partidos (no filtrados por temporada)
4. Posibles mejoras mencionadas pero no desarrolladas:
   - Estadísticas de rendimiento por día de la semana más detalladas
   - Notificaciones en tiempo real cuando se registra un partido
   - Modo torneo

---

## 6. Código completo

### `index.html`
```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Tracker de Partidos</title>
  <link rel="icon" href="copa .png" type="image/svg+xml" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/tabler-icons.min.css" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>

<div class="app">

  <!-- BANNER DE TEMPORADA -->
  <div class="season-banner" id="season-banner">
    <div class="season-info">
      <span class="season-icon">🏅</span>
      <span id="season-name-display">Sin temporada activa</span>
    </div>
    <div style="display:flex;gap:6px;align-items:center;">
      <button class="season-edit-btn" onclick="openSeasonModal()"><i class="ti ti-pencil"></i></button>
      </button>
    </div>
  </div>

  <h1>⚽ Tracker de partidos</h1>

  <div class="tabs" id="main-tabs">
    <button class="tab" id="tab-btn-registro" onclick="switchTab('registro')">Registrar</button>
    <button class="tab active" onclick="switchTab('jugadores')">Jugadores</button>
    <button class="tab" id="tab-btn-historial"onclick="switchTab('historial')">Historial</button>
    <button class="tab" onclick="switchTab('ranking')">Ranking</button>
    <button class="tab" onclick="switchTab('dashboard')">Dashboard</button>
  </div>

  <!-- TAB: REGISTRO -->
  <div id="tab-registro" style="display: none;">
    <div class="card team-card team-local">
      <div class="team-header">
        <span class="team-badge local-badge">🏠 Local</span>
      </div>
      <div class="section-label">Jugadores locales</div>
      <div class="row" style="margin-bottom:8px;">
        <select id="player-select-local" style="flex:1; min-width:120px;"></select>
        <button class="btn btn-primary" onclick="addToTeam('local')">Agregar</button>
      </div>
      <div id="match-players-local"><div class="empty">Selecciona jugadores del equipo local</div></div>
    </div>

    <div class="card">
      <div class="section-label">Resultado del partido</div>
      <div class="result-hint">¿Cómo le fue al equipo <strong>local</strong>?</div>
      <div class="row result-row" style="margin-bottom:14px;">
        <button class="result-btn w" id="btn-w" onclick="selectResult('w')">🏆 Victoria local</button>
        <button class="result-btn d" id="btn-d" onclick="selectResult('d')">🤝 Empate</button>
        <button class="result-btn l" id="btn-l" onclick="selectResult('l')">💀 Derrota local</button>
      </div>
      <div class="score-row" id="score-row" style="display:none;">
        <div class="score-label">🏠 Goles local</div>
        <div class="score-inputs">
          <button class="score-btn" onclick="changeScore('local',-1)">−</button>
          <span class="score-num" id="score-local">0</span>
          <button class="score-btn" onclick="changeScore('local',+1)">+</button>
        </div>
        <div class="score-sep">–</div>
        <div class="score-inputs">
          <button class="score-btn" onclick="changeScore('visit',-1)">−</button>
          <span class="score-num" id="score-visit">0</span>
          <button class="score-btn" onclick="changeScore('visit',+1)">+</button>
        </div>
        <div class="score-label">✈️ Goles visit.</div>
      </div>
      <div id="scorers-section" style="display:none;margin-top:14px;">
  <div class="section-label">⚽ ¿Quién anotó los goles?</div>
  <div id="scorers-list"></div>
  <div id="scorers-error" style="font-size:12px;color:var(--red);margin-top:6px;display:none;"></div>
</div>
<div id="assists-section" style="display:none;margin-top:14px;">
  <div class="section-label">🎯 ¿Quién dio asistencias?</div>
  <div id="assists-list"></div>
  <div id="assists-error" style="font-size:12px;color:var(--red);margin-top:6px;display:none;"></div>
</div>
<div id="reds-section" style="display:none;margin-top:14px;">
  <div class="section-label">🟥 ¿Quién vio tarjeta roja?</div>
  <div id="reds-list"></div>
</div>
<button class="btn btn-primary" id="save-btn" onclick="saveMatch()" disabled>Guardar partido</button>
    </div>

    <div class="card team-card team-visitante">
      <div class="team-header">
        <span class="team-badge visit-badge">✈️ Visitante</span>
        <span class="result-mirror" id="result-mirror"></span>
      </div>
      <div class="section-label">Jugadores visitantes</div>
      <div class="row" style="margin-bottom:8px;">
        <select id="player-select-visit" style="flex:1; min-width:120px;"></select>
        <button class="btn btn-primary" onclick="addToTeam('visit')">Agregar</button>
      </div>
      <div id="match-players-visit"><div class="empty">Selecciona jugadores del equipo visitante</div></div>
    </div>
  </div>

  <!-- TAB: JUGADORES -->
  <div id="tab-jugadores">
    <div class="card">
      <div class="section-label">Nuevo jugador</div>
      <div class="row">
        <input type="text" id="new-player-name" placeholder="Nombre del jugador"
          style="flex:1; max-width:240px;" onkeydown="if(event.key==='Enter') addPlayer()" />
        <button class="btn btn-primary" onclick="addPlayer()">Agregar</button>
      </div>
      <div class="err" id="add-err" style="display:none;"></div>
    </div>
    <div class="card">
      <div class="section-label">Jugadores registrados</div>
      <div id="players-list"></div>
    </div>
  </div>

  <!-- TAB: HISTORIAL -->
  <div id="tab-historial" style="display:none;">
    <div class="row" style="margin-bottom:1rem; gap:8px;">
      <select id="filter-player" onchange="renderHistory()" style="flex:1;"></select>
      <select id="filter-result" onchange="renderHistory()" style="max-width:160px;">
        <option value="">Todos los resultados</option>
        <option value="w">Victoria</option>
        <option value="d">Empate</option>
        <option value="l">Derrota</option>
      </select>
    </div>
    <div style="display:flex; justify-content:flex-end; margin-bottom:10px;">
      <button class="btn btn-danger-outline" onclick="clearHistory()">
        <i class="ti ti-trash"></i> Borrar historial
      </button>
    </div>
    <div class="card" id="history-list"></div>
  </div>

  <!-- TAB: RANKING -->
  <div id="tab-ranking" style="display:none;">
  <div id="ranking-season-selector"></div>
    <div class="ranking-section-title">🎮 Jugador más activo</div>
    <div class="card" style="margin-bottom:12px;"><div id="rank-most-active"></div></div>

    <div class="ranking-section-title">👤 Ranking individual</div>
    <div class="ranking-row">
      <div class="card ranking-card"><div class="ranking-title rank-w">🏆 Victorias</div><div id="rank-wins"></div></div>
      <div class="card ranking-card"><div class="ranking-title rank-d">🤝 Empates</div><div id="rank-draws"></div></div>
      <div class="card ranking-card"><div class="ranking-title rank-l">💀 Derrotas</div><div id="rank-losses"></div></div>
    </div>

    <div class="ranking-section-title">⚔️ Ranking 2 vs 2</div>
    <div class="ranking-row">
      <div class="card ranking-card"><div class="ranking-title rank-w">🏆 Más victorias</div><div id="rank-2v2-wins"></div></div>
      <div class="card ranking-card"><div class="ranking-title rank-d">🤝 Más empates</div><div id="rank-2v2-draws"></div></div>
      <div class="card ranking-card"><div class="ranking-title rank-l">💀 Más derrotas</div><div id="rank-2v2-losses"></div></div>
    </div>

    <div class="ranking-section-title">⚔️ Ranking 2 vs 3</div>
    <div class="ranking-row">
      <div class="card ranking-card"><div class="ranking-title rank-w">🏆 Más victorias</div><div id="rank-2v3-wins"></div></div>
      <div class="card ranking-card"><div class="ranking-title rank-d">🤝 Más empates</div><div id="rank-2v3-draws"></div></div>
      <div class="card ranking-card"><div class="ranking-title rank-l">💀 Más derrotas</div><div id="rank-2v3-losses"></div></div>
    </div>

    <div class="ranking-section-title">⚔️ Ranking 3 vs 3</div>
    <div class="ranking-row">
      <div class="card ranking-card"><div class="ranking-title rank-w">🏆 Más victorias</div><div id="rank-3v3-wins"></div></div>
      <div class="card ranking-card"><div class="ranking-title rank-d">🤝 Más empates</div><div id="rank-3v3-draws"></div></div>
      <div class="card ranking-card"><div class="ranking-title rank-l">💀 Más derrotas</div><div id="rank-3v3-losses"></div></div>
    </div>
  </div>

  <!-- TAB: DASHBOARD -->
  <div id="tab-dashboard" style="display:none;">
    <div id="dashboard-season-selector"></div>
    <!-- Stats globales -->
    <div class="ranking-section-title">🌍 Resumen global</div>
    <div id="dashboard-global"></div>

    <!-- Head to Head -->
    <div class="ranking-section-title">⚔️ Head to Head</div>
    <div class="card">
      <div class="row" style="margin-bottom:12px; gap:8px;">
        <select id="h2h-p1" style="flex:1;"></select>
        <span style="color:var(--text3); font-weight:700;">vs</span>
        <select id="h2h-p2" style="flex:1;"></select>
      </div>
      <button class="btn btn-primary" style="width:100%;" onclick="renderH2H()">Ver enfrentamiento</button>
      <div id="h2h-result" style="margin-top:14px;"></div>
    </div>

    <!-- Logros -->
    <div class="ranking-section-title">🏅 Logros y medallas</div>
    <div id="dashboard-logros"></div>

    <!-- Gráfica de evolución -->
    <div class="ranking-section-title">📈 Evolución de victorias</div>
    <div class="card">
      <div style="margin-bottom:10px;">
        <select id="evo-player" onchange="renderEvolution()" style="width:100%;"></select>
      </div>
      <canvas id="evo-chart" height="180"></canvas>
      <div id="evo-empty" class="empty" style="display:none;">Sin partidos suficientes.</div>
    </div>

    <!-- Comparar temporadas -->
    <div class="ranking-section-title">🏅 Comparar temporadas</div>
    <div id="season-comparison"></div>
  </div>

  <!-- TAB: DETALLE JUGADOR -->
  <div id="tab-player-detail" style="display:none;">
    <button class="back-btn" onclick="switchTab('jugadores')">
      <i class="ti ti-arrow-left"></i> Volver
    </button>
    <div class="card" id="player-detail-content"></div>
  </div>

</div>

<div class="toast" id="toast"></div>

<!-- MODAL TEMPORADA -->
<div class="modal-overlay" id="season-modal" onclick="closeSeasonModal(event)">
  <div class="modal-box">
    <div class="modal-title">🏅 Temporada</div>
    <input type="text" id="season-input" placeholder="ej. Temporada Mayo 2026" maxlength="40" />
    <div class="modal-actions">
      <button class="btn" onclick="closeSeasonModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveSeason()">Guardar</button>
    </div>
    <button class="btn btn-danger-outline" style="width:100%;margin-top:8px;" onclick="clearSeason()">Quitar temporada</button>
  </div>
</div>

<!-- MODAL AVATAR -->
<div class="modal-overlay" id="avatar-modal" onclick="closeAvatarModal(event)">
  <div class="modal-box">
    <div class="modal-title">🎨 Personalizar jugador</div>
    <div style="font-size:12px;color:var(--text2);margin-bottom:10px;">Elige un color de avatar</div>
    <div class="color-picker" id="color-picker"></div>
    <div class="modal-actions" style="margin-top:14px;">
      <button class="btn" onclick="closeAvatarModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveAvatar()">Guardar</button>
    </div>
  </div>
</div>

<!-- BOTÓN ADMIN FLOTANTE (esquina inferior derecha) -->
<button class="admin-fab" id="admin-fab" onclick="openLoginModal()" title="Acceso administrador">
  <i class="ti ti-lock"></i>
</button>

<!-- MODAL PIN -->
<div class="modal-overlay" id="login-modal">
  <div class="modal-box">
    <div class="modal-title">🔐 Acceso administrador</div>
    <div style="font-size:12px;color:var(--text2);margin-bottom:12px;">Inicia sesión para editar.</div>
    <input type="email" id="login-email" placeholder="Email" style="margin-bottom:8px;" />
    <input type="password" id="login-password" placeholder="Contraseña" style="margin-bottom:4px;"
      onkeydown="if(event.key==='Enter') submitLogin()" />
    <div id="login-error" style="color:var(--red);font-size:12px;margin-top:6px;display:none;"></div>
    <div class="modal-actions" style="margin-top:14px;">
      <button class="btn" onclick="closeLoginModal()">Cancelar</button>
      <button class="btn btn-primary" id="login-submit-btn" onclick="submitLogin()">Entrar</button>
    </div>
  </div>
</div>
<button id="admin-logout-btn" onclick="adminLogout()" title="Cerrar sesión" style="display:none;position:fixed;top:12px;right:12px;background:var(--red-bg);color:var(--red);border:1px solid var(--red);border-radius:8px;padding:6px 10px;cursor:pointer;font-size:13px;z-index:999;">
  <i class="ti ti-lock"></i> Cerrar sesión
</button>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="app.js"></script>
</body>
</html>
```

### `styles.css`
```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #f8f7f4;
  --surface: #ffffff;
  --surface2: #f1efe8;
  --border: rgba(0,0,0,0.12);
  --border2: rgba(0,0,0,0.22);
  --text: #1a1a18;
  --text2: #6b6a65;
  --text3: #9a9992;
  --radius-md: 8px;
  --radius-lg: 12px;
  --blue: #185FA5;
  --blue-bg: #E6F1FB;
  --green: #3B6D11;
  --green-bg: #EAF3DE;
  --amber: #854F0B;
  --amber-bg: #FAEEDA;
  --red: #A32D2D;
  --red-bg: #FCEBEB;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #1a1a18;
    --surface: #242422;
    --surface2: #2e2e2c;
    --border: rgba(255,255,255,0.1);
    --border2: rgba(255,255,255,0.2);
    --text: #f0ede8;
    --text2: #a8a69f;
    --text3: #6b6a65;
    --blue: #85B7EB;
    --blue-bg: #042C53;
    --green: #97C459;
    --green-bg: #173404;
    --amber: #EF9F27;
    --amber-bg: #412402;
    --red: #F09595;
    --red-bg: #501313;
  }
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--bg);
  color: var(--text);
  font-size: 15px;
  line-height: 1.5;
  min-height: 100vh;
}

.app {
  max-width: 680px;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
}

h1 {
  font-size: 22px;
  font-weight: 500;
  margin-bottom: 1.5rem;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 2px;
  border-bottom: 0.5px solid var(--border);
  margin-bottom: 1.5rem;
}

.tab {
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  color: var(--text2);
  border: none;
  background: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.15s;
  font-family: inherit;
}

.tab:hover { color: var(--text); }

.tab.active {
  color: var(--blue);
  border-bottom-color: var(--blue);
  font-weight: 500;
}

/* Cards */
.card {
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1rem 1.25rem;
  margin-bottom: 12px;
}

.section-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text2);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 10px;
}

/* Inputs */
input[type=text], select {
  width: 100%;
  padding: 7px 10px;
  border: 0.5px solid var(--border2);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text);
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}

input[type=text]:focus, select:focus {
  border-color: var(--blue);
}

/* Buttons */
.btn {
  padding: 7px 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 0.5px solid var(--border2);
  background: var(--surface);
  color: var(--text2);
  font-family: inherit;
  transition: all 0.12s;
}

.btn:hover { background: var(--surface2); }

.btn-primary {
  background: var(--blue);
  color: #fff;
  border-color: var(--blue);
}

.btn-primary:hover { opacity: 0.88; }

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-danger {
  background: transparent;
  color: var(--text3);
  border-color: var(--border);
  padding: 5px 10px;
}

.btn-danger:hover {
  background: var(--red-bg);
  color: var(--red);
  border-color: var(--red);
}

/* Layout */
.row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

/* Pills / badges */
.pill {
  display: inline-block;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 20px;
}

.pill-w { background: var(--green-bg); color: var(--green); }
.pill-d { background: var(--amber-bg); color: var(--amber); }
.pill-l { background: var(--red-bg); color: var(--red); }

/* Player tags in match */
.tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--surface2);
  border: 0.5px solid var(--border);
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 13px;
  margin: 3px;
}

.tag-x {
  cursor: pointer;
  color: var(--text3);
  font-size: 16px;
  line-height: 1;
}

.tag-x:hover { color: var(--red); }

/* Result buttons */
.result-btn {
  padding: 8px 18px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  background: var(--surface2);
  color: var(--text2);
  font-family: inherit;
  transition: all 0.12s;
}

.result-btn.w  { background: var(--green-bg); color: var(--green); border-color: var(--green); }
.result-btn.d  { background: var(--amber-bg); color: var(--amber); border-color: var(--amber); }
.result-btn.l  { background: var(--red-bg);   color: var(--red);   border-color: var(--red); }

.result-btn.sel-w { background: #3B6D11; color: #fff; border-color: #3B6D11; }
.result-btn.sel-d { background: #BA7517; color: #fff; border-color: #BA7517; }
.result-btn.sel-l { background: #A32D2D; color: #fff; border-color: #A32D2D; }

/* List items */
.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 0;
  border-bottom: 0.5px solid var(--border);
}

.list-item:last-child { border-bottom: none; }

.match-name  { font-size: 14px; color: var(--text); }
.match-meta  { font-size: 12px; color: var(--text2); margin-top: 2px; }

.empty {
  color: var(--text3);
  font-size: 13px;
  text-align: center;
  padding: 1.5rem 0;
}

/* Player detail stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 1rem;
}

.stat-box {
  background: var(--surface2);
  border-radius: var(--radius-md);
  padding: 10px;
  text-align: center;
}

.stat-num { font-size: 24px; font-weight: 500; }
.stat-lbl { font-size: 11px; color: var(--text2); margin-top: 2px; }

/* Avatar circle */
.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--blue-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  color: var(--blue);
  flex-shrink: 0;
}

/* Back button */
.back-btn {
  background: none;
  border: none;
  color: var(--text2);
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  padding: 0;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.back-btn:hover { color: var(--text); }

/* Error text */
.err {
  font-size: 12px;
  color: var(--red);
  margin-top: 5px;
}

/* Toast notification */
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: #3B6D11;
  color: #fff;
  padding: 9px 20px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  opacity: 0;
  transition: all 0.25s;
  pointer-events: none;
  z-index: 999;
}

.toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* Player list row */
.player-row { cursor: pointer; }
.player-row:hover .match-name { color: var(--blue); }

/* ─── Equipos ─────────────────────────────────────────────── */

.team-card { border-left: 3px solid var(--border2); }
.team-local   { border-left-color: var(--blue); }
.team-visitante { border-left-color: var(--amber); }

.team-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.team-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.04em;
}

.local-badge  { background: var(--blue-bg);  color: var(--blue);  }
.visit-badge  { background: var(--amber-bg); color: var(--amber); }

.result-mirror { font-size: 12px; }

.result-hint {
  font-size: 12px;
  color: var(--text2);
  margin-bottom: 10px;
}

.team-local-txt  { font-weight: 500; color: var(--blue); }
.team-visit-txt  { font-weight: 500; color: var(--amber); }

/* ─── Historial mejorado ──────────────────────────────────── */

.history-item { align-items: flex-start; }

.btn-danger-outline {
  background: transparent;
  color: var(--red);
  border: 1px solid var(--red);
  font-size: 12px;
  padding: 5px 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.12s;
}

.btn-danger-outline:hover {
  background: var(--red-bg);
}

/* ─── Detalle jugador: nuevas secciones ────────────────────── */

.detail-section-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--text2);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 14px 0 8px;
}

/* Stats grid 4 columnas */
.stats-grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 1rem;
}

/* Racha badge */
.streak-badge {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 10px;
  padding: 7px 12px;
  border-radius: var(--radius-md);
  background: var(--surface2);
  border: 0.5px solid var(--border);
}

/* Forma reciente */
.form-bar {
  display: flex;
  gap: 5px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.form-dot {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  opacity: 0.9;
}

/* Highlight boxes (mejor compañero, rival) */
.highlight-box {
  font-size: 13px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.highlight-green {
  background: var(--green-bg);
  color: var(--green);
  border: 0.5px solid var(--green);
}

.highlight-red {
  background: var(--red-bg);
  color: var(--red);
  border: 0.5px solid var(--red);
}

.toast-danger { background: var(--red) !important; }

/* ─── Banner de temporada ──────────────────────────────────── */

.season-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--blue-bg);
  border: 0.5px solid var(--blue);
  border-radius: var(--radius-md);
  padding: 8px 12px;
  margin-bottom: 14px;
}

.season-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--blue);
}

.season-icon { font-size: 16px; }

.season-edit-btn {
  background: none;
  border: none;
  color: var(--blue);
  cursor: pointer;
  font-size: 15px;
  padding: 2px 4px;
  border-radius: 4px;
  opacity: 0.7;
  transition: opacity 0.15s;
}
.season-edit-btn:hover { opacity: 1; }

/* ─── Modal ────────────────────────────────────────────────── */

.modal-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 1000;
  align-items: center;
  justify-content: center;
}

.modal-overlay.open { display: flex; }

.modal-box {
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  width: 90%;
  max-width: 340px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
}

.modal-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text);
}

.modal-box input {
  width: 100%;
  margin-bottom: 12px;
}

.modal-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* ─── Chip "Hoy" en historial ──────────────────────────────── */

.chip-today {
  font-size: 10px;
  font-weight: 700;
  background: var(--blue);
  color: #fff;
  padding: 2px 7px;
  border-radius: 20px;
  letter-spacing: 0.04em;
  vertical-align: middle;
  margin-left: 4px;
}

/* ─── Ranking ──────────────────────────────────────────────── */

.ranking-section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text2);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin: 1.2rem 0 8px;
}

.ranking-row {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.ranking-card {
  flex: 1;
  min-width: 0;
  padding: 10px 10px;
}

.ranking-title {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-w { color: var(--green); }
.rank-d { color: var(--amber); }
.rank-l { color: var(--red);   }

.rank-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 0;
  border-bottom: 0.5px solid var(--border);
}

.rank-item:last-child { border-bottom: none; }

.rank-pos {
  font-size: 14px;
  width: 22px;
  text-align: center;
  flex-shrink: 0;
}

.rank-name-wrap { flex: 1; min-width: 0; }

.rank-name { font-size: 12px; font-weight: 500; white-space: normal; overflow: visible; text-overflow: unset; word-break: break-word; }
.rank-games { font-size: 10px; color: var(--text2); }

.rank-pill {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 8px;
  flex-shrink: 0;
}

/* ─── Marcador con goles ───────────────────────────────────── */

.score-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: var(--surface2);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.score-label {
  font-size: 11px;
  color: var(--text2);
  font-weight: 500;
}

.score-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-num {
  font-size: 26px;
  font-weight: 700;
  color: var(--text);
  min-width: 32px;
  text-align: center;
  line-height: 1;
}

.score-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1.5px solid var(--border2);
  background: var(--surface);
  color: var(--text);
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: all 0.12s;
}

.score-btn:hover {
  background: var(--blue-bg);
  border-color: var(--blue);
  color: var(--blue);
}

.score-sep {
  font-size: 22px;
  font-weight: 700;
  color: var(--text3);
}

.score-chip {
  font-size: 12px;
  font-weight: 700;
  background: var(--surface2);
  border: 0.5px solid var(--border2);
  border-radius: 6px;
  padding: 2px 8px;
  color: var(--text);
  letter-spacing: 0.04em;
}

.goals-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 1rem;
}

/* ─── Color picker de avatar ───────────────────────────────── */

.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.color-swatch {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid transparent;
  transition: transform 0.12s, border-color 0.12s;
}

.color-swatch:hover { transform: scale(1.15); }
.color-swatch.selected { border-color: var(--text); transform: scale(1.1); }

/* ─── Logros ───────────────────────────────────────────────── */

.achievements-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.achievement-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--surface2);
  border: 0.5px solid var(--border2);
  border-radius: 10px;
  padding: 6px 8px;
  min-width: 60px;
  cursor: default;
  transition: transform 0.12s;
}

.achievement-badge:hover { transform: scale(1.06); }

.achievement-icon { font-size: 20px; line-height: 1.2; }

.achievement-name {
  font-size: 9px;
  color: var(--text2);
  text-align: center;
  margin-top: 2px;
  font-weight: 500;
  line-height: 1.2;
}

/* ─── Dashboard global ─────────────────────────────────────── */

.global-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 4px;
}

/* ─── Head to Head ─────────────────────────────────────────── */

.h2h-section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text2);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 10px 0 6px;
}

.h2h-score-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 10px;
  background: var(--surface2);
  border-radius: var(--radius-md);
}

.h2h-player-score { text-align: center; }

.h2h-big-num {
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
}

.h2h-player-lbl {
  font-size: 11px;
  color: var(--text2);
  margin-top: 2px;
}

.h2h-mid { text-align: center; }

.h2h-draw {
  font-size: 11px;
  color: var(--text3);
  font-weight: 500;
}

/* ─── Toast racha especial ─────────────────────────────────── */

.toast-streak {
  background: linear-gradient(135deg, #e67e00, #c0392b) !important;
  font-size: 15px !important;
  font-weight: 600 !important;
  padding: 14px 20px !important;
  box-shadow: 0 4px 20px rgba(200,60,0,0.35) !important;
}

/* ─── Comparar temporadas ──────────────────────────────────── */

.season-bar-wrap {
  display: grid;
  grid-template-columns: 100px 1fr 36px 40px;
  align-items: center;
  gap: 8px;
  margin-bottom: 7px;
}

.season-bar-label {
  font-size: 11px;
  color: var(--text2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.season-bar-track {
  height: 8px;
  background: var(--surface2);
  border-radius: 99px;
  overflow: hidden;
}

.season-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.4s ease;
}

.season-bar-pct {
  font-size: 11px;
  font-weight: 700;
  text-align: right;
}

.season-bar-sub {
  font-size: 10px;
  color: var(--text3);
  text-align: right;
}

/* ─── Modo solo lectura ────────────────────────────────────── */

.readonly-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface2);
  border: 0.5px solid var(--border2);
  border-radius: var(--radius-md);
  padding: 8px 12px;
  margin-bottom: 10px;
  font-size: 13px;
  color: var(--text2);
  font-weight: 500;
}

.admin-login-btn {
  background: var(--blue-bg);
  color: var(--blue);
  border: 0.5px solid var(--blue);
  border-radius: var(--radius-md);
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.admin-login-btn:hover { opacity: 0.8; }

/* ─── Chip solo lectura (visible) ─────────────────────────── */

.readonly-chip {
  display: none;
  font-size: 13px;
  font-weight: 600;
  color: var(--amber);
  background: var(--amber-bg);
  border: 1px solid var(--amber);
  border-radius: var(--radius-md);
  text-align: center;
  padding: 9px 14px;
  margin-bottom: 12px;
  letter-spacing: 0.02em;
}

/* ─── Botón FAB admin flotante ─────────────────────────────── */

.admin-fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--surface2);
  border: 0.5px solid var(--border);
  color: var(--text3);
  font-size: 16px;
  cursor: pointer;
  display: none;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.15);
  transition: opacity 0.2s, transform 0.2s;
  z-index: 500;
  opacity: 0.45;
}

.admin-fab:hover {
  opacity: 1;
  transform: scale(1.08);
}

.toast-info {
  background: #A32D2D !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  padding: 12px 20px !important;
  top: 50% !important;
  bottom: auto !important;
  transform: translateX(-50%) translateY(-50%) !important;
}

.toast-info.show {
  transform: translateX(-50%) translateY(-50%) !important;
}

/* ═══════════════════════════════════════════════════════════
   RESPONSIVE — móvil primero
   ═══════════════════════════════════════════════════════════ */

/* ─── Base móvil (< 480px) ─────────────────────────────────── */
@media (max-width: 480px) {

  .app {
    padding: 0.75rem 0.65rem 5rem;
  }

  h1 {
    font-size: 18px;
    margin-bottom: 1rem;
  }

  /* Tabs: scroll horizontal sin saltos */
  .tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    gap: 0;
    flex-wrap: nowrap;
  }
  .tabs::-webkit-scrollbar { display: none; }

  .tab {
    padding: 8px 12px;
    font-size: 13px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* Cards más compactas */
  .card {
    padding: 0.75rem 0.9rem;
    margin-bottom: 10px;
  }

  /* Botones de resultado en columna */
  .row.result-row,
  .card > .row {
    flex-direction: column;
    align-items: stretch;
  }

  .result-btn {
    width: 100%;
    text-align: center;
    padding: 10px;
  }

  /* Inputs y selects full width */
  input[type=text], select {
    font-size: 16px; /* evita zoom automático en iOS */
  }

  /* Stats grid: 2 columnas en móvil */
  .stats-grid-4 {
    grid-template-columns: repeat(2, 1fr);
  }

  /* Goals grid: 3 columnas se mantienen pero más pequeñas */
  .goals-grid {
    gap: 6px;
  }

  .stat-num { font-size: 20px; }
  .stat-lbl { font-size: 10px; }

  /* Ranking en columna en móvil */
  .ranking-row {
    flex-direction: column;
    gap: 8px;
  }

  .ranking-card {
    padding: 10px 12px;
  }

  /* Global grid: 2x2 en móvil */
  .global-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  /* Season bar: ajuste de columnas */
  .season-bar-wrap {
    grid-template-columns: 80px 1fr 32px 36px;
    gap: 5px;
  }

  /* H2H big numbers más pequeños */
  .h2h-big-num {
    font-size: 28px;
  }

  /* Score row más compacto */
  .score-row {
    gap: 8px;
    padding: 8px;
  }

  .score-num { font-size: 22px; }

  /* Forma reciente: puntos más pequeños */
  .form-dot {
    width: 24px;
    height: 24px;
    font-size: 9px;
  }

  /* Modal más ancho en móvil */
  .modal-box {
    width: 95%;
    padding: 1rem;
  }

  /* FAB más abajo para no tapar contenido */
  .admin-fab {
    bottom: 14px;
    right: 14px;
    width: 36px;
    height: 36px;
    font-size: 14px;
  }

  /* List items más cómodos al tacto */
  .list-item {
    padding: 11px 0;
  }

  /* Chip Hoy */
  .chip-today {
    font-size: 9px;
    padding: 1px 5px;
  }

  /* Logros: más pequeños */
  .achievement-badge {
    min-width: 52px;
    padding: 5px 6px;
  }
  .achievement-icon { font-size: 18px; }
  .achievement-name { font-size: 8px; }

  /* Back button más visible */
  .back-btn {
    font-size: 14px;
    margin-bottom: 0.75rem;
  }
}

/* ─── Tablet (480px – 680px) ───────────────────────────────── */
@media (min-width: 480px) and (max-width: 680px) {

  .app {
    padding: 1rem 0.85rem 4rem;
  }

  .stats-grid-4 {
    grid-template-columns: repeat(2, 1fr);
  }

  .global-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .ranking-row {
    flex-direction: column;
  }

  .tab {
    padding: 8px 13px;
    font-size: 13px;
  }

  .tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    flex-wrap: nowrap;
  }
  .tabs::-webkit-scrollbar { display: none; }
}

/* ─── Desktop grande (> 680px): layout original ───────────── */
@media (min-width: 680px) {
  .ranking-row {
    flex-direction: row;
  }

  .stats-grid-4 {
    grid-template-columns: repeat(4, 1fr);
  }

  .global-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### `app.js`
```js
// ─── Admin  ────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://ddezobualtvmnjavuipr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkZXpvYnVhbHR2bW5qYXZ1aXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NjE1MDYsImV4cCI6MjA5NTIzNzUwNn0.OrDAbQaFAa8WxSM6epWgKtk21xsoOz0b5DOkeF1a0PQ';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let isAdmin = false;

async function initAdmin() {
  const { data: { session } } = await sb.auth.getSession();
  isAdmin = !!session;
  applyAdminMode();
  if (!isAdmin) setTimeout(() => showToast('👁️ Estás en modo solo lectura', 'info'), 500);
}

function applyAdminMode() {
  const fab = document.getElementById('admin-fab');
  if (fab) fab.style.display = isAdmin ? 'none' : 'flex';
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) logoutBtn.style.display = isAdmin ? 'inline-flex' : 'none';
  const writeSelectors = ['#save-btn','#btn-w','#btn-d','#btn-l','.score-btn','.season-edit-btn','.btn-danger','.btn-danger-outline'];
  writeSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.disabled = !isAdmin;
      el.style.opacity = isAdmin ? '' : '0.35';
      el.style.cursor = isAdmin ? '' : 'not-allowed';
    });
  });
  const tabRegistro = document.getElementById('tab-btn-registro');
if (tabRegistro) {
  tabRegistro.style.display = isAdmin ? '' : 'none';
}
  const tabHistorial = document.getElementById('tab-btn-historial');
if (tabHistorial) {
  tabHistorial.style.display = isAdmin ? '' : 'none';
}
  document.querySelectorAll('.btn-primary').forEach(el => {
    const isH2H = el.getAttribute('onclick') === 'renderH2H()';
    const isLogin = el.id === 'login-submit-btn';
    if (isH2H || isLogin) return;
    el.disabled = !isAdmin;
    el.style.opacity = isAdmin ? '' : '0.35';
    el.style.cursor = isAdmin ? '' : 'not-allowed';
  });
  document.querySelectorAll('input[type="text"], input[type="number"]').forEach(el => {
    el.readOnly = !isAdmin;
    el.style.opacity = isAdmin ? '' : '0.5';
  });
}

function openLoginModal() {
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('login-error').style.display = 'none';
  document.getElementById('login-modal').classList.add('open');
}

function closeLoginModal() {
  document.getElementById('login-modal').classList.remove('open');
}

async function submitLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  const btn = document.getElementById('login-submit-btn');
  btn.disabled = true; btn.textContent = 'Entrando...';
  const { error } = await sb.auth.signInWithPassword({ email, password: pass });
  btn.disabled = false; btn.textContent = 'Entrar';
  if (error) {
    errEl.textContent = 'Email o contraseña incorrectos.';
    errEl.style.display = 'block';
  } else {
    isAdmin = true;
    applyAdminMode();
    closeLoginModal();
    showToast('✅ Modo administrador activado');
  }
}

async function adminLogout() {
  await sb.auth.signOut();
  isAdmin = false;
  applyAdminMode();
  showToast('Sesión cerrada');
}
// ─── Estado ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#185FA5','#3B6D11','#A32D2D','#854F0B','#6B3FA0',
  '#1A7D6B','#B5580B','#2E5FA3','#7A2B5F','#2D6E4E',
  '#C0392B','#1F618D','#117A65','#6C3483','#B7770D'
];
const WIN_TITLES = [
  { icon: '👑', name: 'Rey del vestuario' },
  { icon: '🐐', name: 'La Cabra' },
  { icon: '⚡', name: 'El Imparable' },
  { icon: '🔥', name: 'El Depredador' },
  { icon: '🏆', name: 'El Campeón' },
  { icon: '💎', name: 'El Élite' },
  { icon: '🦁', name: 'El León' }
];

const LOSS_TITLES = [
  { icon: '💀', name: 'Cabeza de turco' },
  { icon: '😤', name: 'El Eterno Perdedor' },
  { icon: '😭', name: 'El Sufridor' },
  { icon: '🪦', name: 'El Sepultado' },
  { icon: '🥶', name: 'El Frío' },
  { icon: '🤡', name: 'El Payaso' },
  { icon: '🐔', name: 'El Gallina' }
];

let state = {
  players: [],
  matches: [],
  localPlayers: [],
  visitPlayers: [],
  selectedResult: null,
  season: '',
  scoreLocal: 0,
  scoreVisit: 0,
  editingAvatarId: null,
  scorers: {},
  assists: {},
  reds: {},
  selectedSeason: ''
};

async function loadFromSupabase() {
  const [{ data: players }, { data: matches }, { data: config }] = await Promise.all([
    sb.from('players').select('*').order('created_at'),
    sb.from('matches').select('*').order('created_at'),
    sb.from('config').select('*')
  ]);
  state.players = (players || []).map(p => ({ id: p.id, name: p.name, color: p.color }));
  state.matches = (matches || []).map(m => ({
    id: m.id, localPlayers: m.local_players, visitPlayers: m.visit_players,
    result: m.result, goalsLocal: m.goals_local, goalsVisit: m.goals_visit,
    season: m.season, date: m.date, scorers: m.scorers || {}, assists: m.assists || {}, reds: m.reds || {}
  }));
  const seasonRow = (config || []).find(r => r.key === 'season');
  state.season = seasonRow ? seasonRow.value : '';
  // Si la temporada activa no tiene partidos, usar la primera temporada disponible
const availableSeasons = [...new Set(state.matches.map(m => m.season || '').filter(Boolean))];
state.selectedSeason = availableSeasons.includes(state.season) ? state.season : (availableSeasons[0] || '');
  const winsIdx = (config || []).find(r => r.key === 'top1_wins_title_index');
  const lossIdx = (config || []).find(r => r.key === 'top1_losses_title_index');
  const winsPlayer = (config || []).find(r => r.key === 'top1_wins_player_id');
  const lossPlayer = (config || []).find(r => r.key === 'top1_losses_player_id');
  state.top1WinsTitleIndex = winsIdx ? parseInt(winsIdx.value) : 0;
  state.top1LossesTitleIndex = lossIdx ? parseInt(lossIdx.value) : 0;
  state.top1WinsPlayerId = winsPlayer ? winsPlayer.value : '';
  state.top1LossesPlayerId = lossPlayer ? lossPlayer.value : '';
}
async function checkTop1Changes() {
  if (!state.players.length || !state.matches.length) return;

  const stats = state.players.map(p => {
    const ms = state.matches.filter(m =>
      (m.localPlayers||[]).includes(p.id)||(m.visitPlayers||[]).includes(p.id)
    );
    const w = ms.filter(m => getPlayerResult(m,p.id)==='w').length;
    const l = ms.filter(m => getPlayerResult(m,p.id)==='l').length;
    return { id: p.id, w, l };
  });

  const top1Wins = [...stats].sort((a,b) => b.w - a.w)[0];
  const top1Losses = [...stats].sort((a,b) => b.l - a.l)[0];

  if (top1Wins && top1Wins.id !== state.top1WinsPlayerId) {
    const newIndex = (state.top1WinsTitleIndex + 1) % WIN_TITLES.length;
    state.top1WinsPlayerId = top1Wins.id;
    state.top1WinsTitleIndex = newIndex;
    await sb.from('config').update({ value: String(newIndex) }).eq('key', 'top1_wins_title_index');
    await sb.from('config').update({ value: top1Wins.id }).eq('key', 'top1_wins_player_id');
  }

  if (top1Losses && top1Losses.id !== state.top1LossesPlayerId) {
    const newIndex = (state.top1LossesTitleIndex + 1) % LOSS_TITLES.length;
    state.top1LossesPlayerId = top1Losses.id;
    state.top1LossesTitleIndex = newIndex;
    await sb.from('config').update({ value: String(newIndex) }).eq('key', 'top1_losses_title_index');
    await sb.from('config').update({ value: top1Losses.id }).eq('key', 'top1_losses_player_id');
  }
}

function save() {} // ya no se usa, cada operación llama a Supabase directamente

function genId() { return Math.random().toString(36).slice(2, 9); }

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' +
    (type === 'danger' ? ' toast-danger' : '') +
    (type === 'streak' ? ' toast-streak' : '') +
    (type === 'info'   ? ' toast-info'   : '');
  setTimeout(() => t.classList.remove('show'), type === 'streak' ? 3500 : type === 'info' ? 3000 : 2400);
}

const LABELS     = { w: 'Victoria', d: 'Empate', l: 'Derrota' };
const PILL_CLASS = { w: 'pill-w', d: 'pill-d', l: 'pill-l' };

function invertResult(r) {
  if (r === 'w') return 'l';
  if (r === 'l') return 'w';
  return 'd';
}

const MIRROR_LABEL = {
  w: '<span class="pill pill-l">💀 Derrota visitante</span>',
  d: '<span class="pill pill-d">🤝 Empate</span>',
  l: '<span class="pill pill-w">🏆 Victoria visitante</span>'
};

// ─── Avatar helpers ───────────────────────────────────────────────────────────

function playerColor(p) {
  return p.color || AVATAR_COLORS[0];
}

function avatarHTML(p, size = 42) {
  const color = playerColor(p);
  return `<div class="avatar" style="width:${size}px;height:${size}px;background:${color}20;color:${color};font-size:${Math.round(size*0.33)}px;border:2px solid ${color}40;">${getInitials(p.name)}</div>`;
}

// ─── Navegación ───────────────────────────────────────────────────────────────

function switchTab(tab) { 
  if (tab === 'registro' && !isAdmin) {
    showToast('Solo el admin puede registrar partidos', 'danger');
    return;
  }
  if (tab === 'historial' && !isAdmin) {
    showToast('Solo el admin puede ver el historial', 'danger');
    return;
  }
  ['registro','jugadores','historial','ranking','dashboard','player-detail'].forEach(t => {
    document.getElementById('tab-' + t).style.display = t === tab ? 'block' : 'none';
  });
  document.querySelectorAll('.tab').forEach((el, i) => {
    el.classList.toggle('active', ['registro','jugadores','historial','ranking','dashboard'][i] === tab);
  });
  updateSelects();
  if (tab === 'jugadores')  renderPlayersList();
  if (tab === 'historial')  renderHistory();
  if (tab === 'registro')   { renderTeamTags('local'); renderTeamTags('visit'); }
  if (tab === 'ranking')    renderRanking();
  if (tab === 'dashboard')  renderDashboard();
}

// ─── Selects ─────────────────────────────────────────────────────────────────

function updateSelects() {
  const opts = state.players.length
    ? state.players.map(p => `<option value="${p.id}">${p.name}</option>`).join('')
    : '<option value="">Sin jugadores aún</option>';

  ['local','visit'].forEach(team => {
    const el = document.getElementById('player-select-' + team);
    if (el) el.innerHTML = opts;
  });

  const fp = document.getElementById('filter-player');
  if (fp) fp.innerHTML = '<option value="">Todos los jugadores</option>' +
    state.players.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

  ['h2h-p1','h2h-p2','evo-player'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = state.players.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
  });
}

// ─── Jugadores ────────────────────────────────────────────────────────────────

async function addPlayer() {
  if (!isAdmin) return;
  const inp = document.getElementById('new-player-name');
  const err = document.getElementById('add-err');
  const name = inp.value.trim();
  if (!name) { err.textContent = 'Escribe un nombre.'; err.style.display = 'block'; return; }
  if (state.players.find(p => p.name.toLowerCase() === name.toLowerCase())) {
    err.textContent = 'Ese jugador ya existe.'; err.style.display = 'block'; return;
  }
  const color = AVATAR_COLORS[state.players.length % AVATAR_COLORS.length];
  const id = genId();
  const { error } = await sb.from('players').insert({ id, name, color });
  if (error) { showToast('Error al guardar', 'danger'); return; }
  state.players.push({ id, name, color });
  inp.value = ''; err.style.display = 'none';
  renderPlayersList(); updateSelects();
  showToast('Jugador agregado ✓');
}

async function removePlayer(id) {
  if (!isAdmin) { showToast('Solo el admin puede eliminar jugadores', 'danger'); return; }
  if (!confirm('¿Eliminar este jugador?')) return;
  await sb.from('players').delete().eq('id', id);
  state.players = state.players.filter(p => p.id !== id);
  renderPlayersList(); updateSelects();
}

function renderPlayersList() {
  const el = document.getElementById('players-list');
  if (!state.players.length) {
    el.innerHTML = '<div class="empty">Aún no hay jugadores.</div>';
    return;
  }
  el.innerHTML = state.players.map(p => {
    const ms = getFilteredMatches().filter(m =>
      (m.localPlayers||[]).includes(p.id)||(m.visitPlayers||[]).includes(p.id)||(m.players||[]).includes(p.id)
    );
    const w = ms.filter(m => getPlayerResult(m,p.id)==='w').length;
    const d = ms.filter(m => getPlayerResult(m,p.id)==='d').length;
    const l = ms.filter(m => getPlayerResult(m,p.id)==='l').length;
    const pct = ms.length ? Math.round((w/ms.length)*100) : 0;
    return `
      <div class="list-item player-row" onclick="showPlayerDetail('${p.id}')">
        <div style="display:flex;align-items:center;gap:10px;">
          ${avatarHTML(p, 36)}
          <div>
            <div class="match-name">${p.name}</div>
            <div style="display:flex;gap:5px;margin-top:4px;">
              <span class="pill pill-w">${w}V</span>
              <span class="pill pill-d">${d}E</span>
              <span class="pill pill-l">${l}D</span>
              <span style="font-size:11px;color:var(--blue);align-self:center;font-weight:600;">${pct}%</span>
              <span style="font-size:11px;color:var(--text2);align-self:center;">${ms.length} partidos</span>
            </div>
          </div>
        </div>
        <div style="display:flex;gap:6px;${isAdmin?'':'display:none!important;'}">
          <button class="btn" style="padding:5px 8px;" onclick="event.stopPropagation();openAvatarModal('${p.id}')">
            <i class="ti ti-palette"></i>
          </button>
          <button class="btn btn-danger" onclick="event.stopPropagation();removePlayer('${p.id}')">
            <i class="ti ti-trash"></i>
          </button>
        </div>
      </div>`;
  }).join('');
}

function getPlayerResult(match, playerId) {
  if (match.localPlayers) {
    if (match.localPlayers.includes(playerId)) return match.result;
    if (match.visitPlayers.includes(playerId)) return invertResult(match.result);
  }
  if (match.players && match.players.includes(playerId)) return match.result;
  return null;
}

// ─── Modal Avatar ─────────────────────────────────────────────────────────────

function openAvatarModal(playerId) {
  state.editingAvatarId = playerId;
  const p = state.players.find(x => x.id === playerId);
  const picker = document.getElementById('color-picker');
  picker.innerHTML = AVATAR_COLORS.map(c => `
    <div class="color-swatch ${p && p.color === c ? 'selected' : ''}"
      style="background:${c};"
      onclick="selectColor('${c}')"></div>`).join('');
  document.getElementById('avatar-modal').classList.add('open');
}

function selectColor(color) {
  document.querySelectorAll('.color-swatch').forEach(s => {
    s.classList.toggle('selected', s.style.background === color || s.style.backgroundColor === color);
  });
  const p = state.players.find(x => x.id === state.editingAvatarId);
  if (p) p._pendingColor = color;
}

async function saveAvatar() {
  const p = state.players.find(x => x.id === state.editingAvatarId);
  if (p && p._pendingColor) {
    await sb.from('players').update({ color: p._pendingColor }).eq('id', p.id);
    p.color = p._pendingColor; delete p._pendingColor;
  }
  renderPlayersList(); closeAvatarModal();
  showToast('Avatar actualizado ✓');
}
function closeAvatarModal(e) {
  if (e && e.target !== document.getElementById('avatar-modal')) return;
  const p = state.players.find(x => x.id === state.editingAvatarId);
  if (p) delete p._pendingColor;
  document.getElementById('avatar-modal').classList.remove('open');
}

// ─── Detalle jugador ──────────────────────────────────────────────────────────

function calcStreak(ms, id) {
  const ordered = [...ms].reverse();
  if (!ordered.length) return null;
  const first = getPlayerResult(ordered[0], id);
  let count = 1;
  for (let i = 1; i < ordered.length; i++) {
    if (getPlayerResult(ordered[i], id) === first) count++;
    else break;
  }
  return { result: first, count };
}

function streakHTML(streak) {
  if (!streak || streak.count < 2) return '';
  const icons  = { w:'🔥', d:'➡️', l:'❄️' };
  const labels = { w:'victorias seguidas', d:'empates seguidos', l:'derrotas seguidas' };
  const colors = { w:'var(--green)', d:'var(--amber)', l:'var(--red)' };
  return `<div class="streak-badge" style="color:${colors[streak.result]};">
    ${icons[streak.result]} Racha: <strong>${streak.count} ${labels[streak.result]}</strong>
  </div>`;
}

function formBarHTML(ms, id) {
  const last10 = [...ms].reverse().slice(0,10).reverse();
  if (!last10.length) return '';
  const dots = last10.map(m => {
    const r = getPlayerResult(m, id);
    const colors = { w:'var(--green)', d:'var(--amber)', l:'var(--red)' };
    const labels = { w:'V', d:'E', l:'D' };
    return `<div class="form-dot" style="background:${colors[r]};" title="${LABELS[r]}">${labels[r]}</div>`;
  }).join('');
  return `<div class="detail-section-title">📈 Forma reciente (últimos ${last10.length})</div>
    <div class="form-bar">${dots}</div>`;
}

function showPlayerDetail(id) {
  const p = state.players.find(x => x.id === id);
  if (!p) return;
  switchTab('player-detail');
  const matches = getFilteredMatches();

  const ms = matches.filter(m =>
    (m.localPlayers||[]).includes(id)||(m.visitPlayers||[]).includes(id)||(m.players||[]).includes(id)
  );
  const w = ms.filter(m => getPlayerResult(m,id)==='w').length;
  const d = ms.filter(m => getPlayerResult(m,id)==='d').length;
  const l = ms.filter(m => getPlayerResult(m,id)==='l').length;
  const total = ms.length;
  const winPct = total ? Math.round((w/total)*100) : 0;
  const streak = calcStreak(ms, id);

  // Goles
  let goalsFor=0, goalsAgainst=0, goalsIndividual=0, assistsIndividual=0, redsIndividual=0, matchesWithScore=0;
  ms.forEach(m => {
    if (m.goalsLocal===undefined) return;
    matchesWithScore++;
    const isLocal = (m.localPlayers||[]).includes(id);
    goalsFor     += isLocal ? m.goalsLocal : m.goalsVisit;
    goalsAgainst += isLocal ? m.goalsVisit : m.goalsLocal;
    if (m.scorers && m.scorers[id]) goalsIndividual += m.scorers[id];
    if (m.assists && m.assists[id]) assistsIndividual += m.assists[id];
    if (m.reds && m.reds[id]) redsIndividual += m.reds[id];
  });
  const avgIndividual = matchesWithScore ? (goalsIndividual/matchesWithScore).toFixed(1) : '—';
  const avgFor = matchesWithScore ? (goalsFor/matchesWithScore).toFixed(1) : '—';
  const goalsHTML = matchesWithScore ? `
    <div class="detail-section-title">⚽ Estadísticas de goles</div>
    <div class="goals-grid" style="grid-template-columns:repeat(3,1fr);">
      <div class="stat-box"><div class="stat-num" style="color:var(--green);">${goalsFor}</div><div class="stat-lbl">equipo a favor</div></div>
      <div class="stat-box"><div class="stat-num" style="color:var(--red);">${goalsAgainst}</div><div class="stat-lbl">equipo en contra</div></div>
      <div class="stat-box"><div class="stat-num" style="color:var(--blue);">${goalsIndividual}</div><div class="stat-lbl">goles propios</div></div>
      <div class="stat-box"><div class="stat-num" style="color:var(--amber);">${avgIndividual}</div><div class="stat-lbl">prom. propio</div></div>
      <div class="stat-box"><div class="stat-num" style="color:var(--blue);">🎯 ${assistsIndividual}</div><div class="stat-lbl">asistencias</div></div>
      <div class="stat-box"><div class="stat-num" style="color:var(--red);">🟥 ${redsIndividual}</div><div class="stat-lbl">tarjetas rojas</div></div>
    </div>` : '';

  // Compañeros
  const partnerMap = {};
  ms.forEach(m => {
    const myTeam = (m.localPlayers||[]).includes(id)?(m.localPlayers||[]):
                   (m.visitPlayers||[]).includes(id)?(m.visitPlayers||[]):(m.players||[]);
    const myResult = getPlayerResult(m,id);
    myTeam.filter(pid=>pid!==id).forEach(pid=>{
      if(!partnerMap[pid]) partnerMap[pid]={w:0,d:0,l:0};
      partnerMap[pid][myResult]++;
    });
  });

  const partnerEntries = Object.entries(partnerMap);
  let bestPartnerHTML = '';
  if (partnerEntries.length) {
    const best = partnerEntries.map(([pid,s])=>({pid,...s,total:s.w+s.d+s.l}))
      .sort((a,b)=>b.w-a.w||b.total-a.total)[0];
    if (best && best.w>0) {
      const bp = state.players.find(x=>x.id===best.pid);
      bestPartnerHTML = `<div class="highlight-box highlight-green">
        🤝 <strong>Mejor compañero:</strong> ${bp?bp.name:'?'}
        <span style="margin-left:6px;" class="pill pill-w">${best.w}V ${best.d}E ${best.l}D</span>
      </div>`;
    }
  }

const partnerRows = partnerEntries
  .map(([pid,s]) => ({ pid, ...s, total: s.w+s.d+s.l }))
  .sort((a,b) => b.total - a.total)
  .map(({pid,w,d,l,total}) => {
    const partner = state.players.find(x=>x.id===pid);
    const name = partner ? partner.name : 'Desconocido';
    const pct = total ? Math.round((w/total)*100) : 0;
    return `<div class="list-item" style="flex-direction:column;align-items:flex-start;gap:6px;">
      <div style="display:flex;align-items:center;gap:8px;width:100%;">
        ${partner ? avatarHTML(partner,28) : ''}
        <div style="flex:1;">
          <div style="font-size:14px;font-weight:500;">${name}</div>
          <div style="font-size:11px;color:var(--text2);">${total} partido${total!==1?'s':''} como compañeros · <span style="color:var(--blue);font-weight:600;">${pct}% victorias juntos</span></div>
        </div>
      </div>
      <div style="display:flex;gap:12px;font-size:13px;padding-left:36px;">
        <span style="color:var(--green);">🏆 ${w} ganado${w!==1?'s':''}</span>
        <span style="color:var(--amber);">🤝 ${d} empate${d!==1?'s':''}</span>
        <span style="color:var(--red);">💀 ${l} perdido${l!==1?'s':''}</span>
      </div>
    </div>`;
  }).join('');

  // Rivales
  const rivalMap = {};
  ms.forEach(m => {
    const isLocal=(m.localPlayers||[]).includes(id);
    const isVisit=(m.visitPlayers||[]).includes(id);
    if(!isLocal&&!isVisit) return;
    const rivalTeam=isLocal?(m.visitPlayers||[]):(m.localPlayers||[]);
    if(!rivalTeam.length) return;
    const key=[...rivalTeam].sort().join('|');
    if(!rivalMap[key]) rivalMap[key]={ids:rivalTeam,w:0,d:0,l:0};
    rivalMap[key][getPlayerResult(m,id)]++;
  });

  let rivalDiffHTML='', rivalEasyHTML='';
  const rivalEntries=Object.values(rivalMap).map(r=>({
    name:r.ids.map(rid=>{const pl=state.players.find(x=>x.id===rid);return pl?pl.name:'?';}).join(' & '),
    w:r.w,d:r.d,l:r.l,total:r.w+r.d+r.l
  }));
  if(rivalEntries.length){
    const hardest=[...rivalEntries].sort((a,b)=>b.l-a.l||b.total-a.total)[0];
    const easiest=[...rivalEntries].sort((a,b)=>b.w-a.w||b.total-a.total)[0];
    if(hardest&&hardest.l>0) rivalDiffHTML=`<div class="highlight-box highlight-red">
      💀 <strong>Rival difícil:</strong> ${hardest.name}
      <span style="margin-left:6px;" class="pill pill-l">${hardest.l} derrota${hardest.l!==1?'s':''}</span>
    </div>`;
    if(easiest&&easiest.w>0) rivalEasyHTML=`<div class="highlight-box highlight-green">
      🏆 <strong>Rival fácil:</strong> ${easiest.name}
      <span style="margin-left:6px;" class="pill pill-w">${easiest.w} victoria${easiest.w!==1?'s':''}</span>
    </div>`;
  }

  // Logros individuales
  const achievements = getPlayerAchievements(p, ms, w, d, l, streak);
  const achievementsHTML = achievements.length ? `
    <div class="detail-section-title">🏅 Logros</div>
    <div class="achievements-row">${achievements.map(a=>`
      <div class="achievement-badge" title="${a.desc}">
        <span class="achievement-icon">${a.icon}</span>
        <span class="achievement-name">${a.name}</span>
      </div>`).join('')}
    </div>` : '';

  // Últimos partidos
  function buildRecentMatchesHTML(ms, id) {
  const filter = state.profileFilter || '';
  let filtered = filter ? ms.filter(m => getPlayerResult(m,id) === filter) : ms;
  return [...filtered].reverse().map(m=>{
    const myResult=getPlayerResult(m,id);
    const localNames=(m.localPlayers||m.players||[])
      .map(pid=>{const pl=state.players.find(x=>x.id===pid);return pl?pl.name:'?';}).join(', ');
    const visitNames=(m.visitPlayers||[])
      .map(pid=>{const pl=state.players.find(x=>x.id===pid);return pl?pl.name:'?';}).join(', ');
    const teamsStr=visitNames
      ?`<strong>${localNames}</strong> vs <strong>${visitNames}</strong>`
      :`Con: <strong>${localNames}</strong>`;
    const scoreStr=(m.goalsLocal!==undefined)?`<span class="score-chip">${m.goalsLocal} – ${m.goalsVisit}</span> `:'';
    const seasonStr=m.season?` · 🏅 ${m.season}`:'';
    return `<div class="list-item">
      <div>
        <div class="match-name">${teamsStr}</div>
        <div class="match-meta">${scoreStr}${m.date}${seasonStr}</div>
      </div>
      <span class="pill ${PILL_CLASS[myResult]}">${LABELS[myResult]}</span>
    </div>`;
  }).join('') || '<div class="empty">No hay partidos con ese filtro.</div>';
}

  document.getElementById('player-detail-content').innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:0.75rem;">
      ${avatarHTML(p, 48)}
      <div>
        <div style="font-size:18px;font-weight:500;">${p.name}</div>
        <div style="font-size:13px;color:var(--text2);">${total} partidos registrados</div>
      </div>
      <button class="btn" style="margin-left:auto;padding:6px 10px;" onclick="openAvatarModal('${p.id}')">
        <i class="ti ti-palette"></i>
      </button>
    </div>
    ${streakHTML(streak)}
    <div class="stats-grid-4">
      <div class="stat-box"><div class="stat-num" style="color:var(--green);">${w}</div><div class="stat-lbl">victorias</div></div>
      <div class="stat-box"><div class="stat-num" style="color:var(--amber);">${d}</div><div class="stat-lbl">empates</div></div>
      <div class="stat-box"><div class="stat-num" style="color:var(--red);">${l}</div><div class="stat-lbl">derrotas</div></div>
      <div class="stat-box"><div class="stat-num" style="color:var(--blue);">${winPct}%</div><div class="stat-lbl">% victorias</div></div>
    </div>
    ${formBarHTML(ms, id)}
    ${goalsHTML}
    ${achievementsHTML}
    ${bestPartnerHTML||rivalDiffHTML||rivalEasyHTML?`
      <div class="detail-section-title">⚡ Destacados</div>
      ${bestPartnerHTML}${rivalEasyHTML}${rivalDiffHTML}`:''}
    ${partnerRows?`<div class="detail-section-title">🧑‍🤝‍🧑 Con quién ha jugado</div>${partnerRows}`:''}
    ${recordsHTML(p, ms)}
    ${total?`<div class="detail-section-title">🕒 Últimos partidos</div>
  <div class="row" style="gap:6px;margin-bottom:10px;">
    <button class="btn ${!state.profileFilter?'btn-primary':''}" style="padding:5px 12px;font-size:12px;" onclick="filterProfileMatches('${id}','')">Todos</button>
    <button class="btn" style="padding:5px 12px;font-size:12px;${state.profileFilter==='w'?'background:var(--green);color:#fff;border-color:var(--green);':''}" onclick="filterProfileMatches('${id}','w')">V</button>
    <button class="btn" style="padding:5px 12px;font-size:12px;${state.profileFilter==='d'?'background:var(--amber);color:#fff;border-color:var(--amber);':''}" onclick="filterProfileMatches('${id}','d')">E</button>
    <button class="btn" style="padding:5px 12px;font-size:12px;${state.profileFilter==='l'?'background:var(--red);color:#fff;border-color:var(--red);':''}" onclick="filterProfileMatches('${id}','l')">D</button>
  </div>
  ${buildRecentMatchesHTML(ms,id)}`:''}
  `;
}
// filtro //
function filterProfileMatches(id, result) {
  state.profileFilter = result;
  showPlayerDetail(id);
}
// ─── Logros ───────────────────────────────────────────────────────────────────

function getPlayerAchievements(p, ms, w, d, l, streak) {
  const total = ms.length;
  const winPct = total ? (w/total)*100 : 0;
  const achievements = [];

  // Por victorias
  if (w >= 1)  achievements.push({ icon:'🏆', name:'Primera victoria', desc:'Ganó su primer partido' });
  if (w >= 5)  achievements.push({ icon:'⭐', name:'5 victorias', desc:'Alcanzó 5 victorias' });
  if (w >= 10) achievements.push({ icon:'🌟', name:'10 victorias', desc:'Alcanzó 10 victorias' });
  if (w >= 25) achievements.push({ icon:'💫', name:'25 victorias', desc:'Alcanzó 25 victorias' });
  if (w >= 50) achievements.push({ icon:'👑', name:'Rey del campo', desc:'50 victorias' });

  // Por racha
  if (streak && streak.result==='w' && streak.count>=3) achievements.push({ icon:'🔥', name:'En llamas', desc:`${streak.count} victorias seguidas` });
  if (streak && streak.result==='w' && streak.count>=5) achievements.push({ icon:'🚀', name:'Imparable', desc:`${streak.count} victorias seguidas` });
  if (streak && streak.result==='w' && streak.count>=10) achievements.push({ icon:'⚡', name:'Legendario', desc:'10 victorias seguidas' });

  // Por porcentaje
  if (total >= 5 && winPct >= 80) achievements.push({ icon:'💎', name:'Élite', desc:'80%+ victorias (mín. 5 partidos)' });
  if (total >= 10 && winPct === 100) achievements.push({ icon:'🐐', name:'GOAT', desc:'Invicto (mín. 10 partidos)' });

  // Por partidos jugados
  if (total >= 10) achievements.push({ icon:'🎮', name:'Veterano', desc:'10 partidos jugados' });
  if (total >= 25) achievements.push({ icon:'🎯', name:'Experimentado', desc:'25 partidos jugados' });
  if (total >= 50) achievements.push({ icon:'🏟️', name:'Leyenda', desc:'50 partidos jugados' });

  // Especiales
  if (l === 0 && total >= 3) achievements.push({ icon:'🛡️', name:'Invicto', desc:'Sin derrotas aún' });
  if (d >= 5) achievements.push({ icon:'🤝', name:'Rey del empate', desc:'5 empates o más' });
  if (l >= 10) achievements.push({ icon:'💪', name:'Guerrero', desc:'Siguió jugando tras 10 derrotas' });

  // Goles
  let goalsFor = 0, matchesWithScore = 0;
  ms.forEach(m => {
    if (m.goalsLocal===undefined) return;
    matchesWithScore++;
    const isLocal=(m.localPlayers||[]).includes(p.id);
    goalsFor += isLocal ? m.goalsLocal : m.goalsVisit;
  });
  if (goalsFor >= 10) achievements.push({ icon:'⚽', name:'Goleador', desc:'10+ goles a favor' });
  if (goalsFor >= 30) achievements.push({ icon:'🎳', name:'Máquina', desc:'30+ goles a favor' });
  // Logro único top 1
  if (p.id === state.top1WinsPlayerId && state.players.length > 1) {
    const title = WIN_TITLES[state.top1WinsTitleIndex % WIN_TITLES.length];
    achievements.push({ icon: title.icon, name: title.name, desc: 'Top 1 en victorias' });
  }
  if (p.id === state.top1LossesPlayerId && state.players.length > 1) {
    const title = LOSS_TITLES[state.top1LossesTitleIndex % LOSS_TITLES.length];
    achievements.push({ icon: title.icon, name: title.name, desc: 'Top 1 en derrotas' });
  }

  return achievements;
}

// ─── Equipos en registro ──────────────────────────────────────────────────────

function addToTeam(team) {
  const sel = document.getElementById('player-select-' + team);
  if (!sel.value) return;
  const arr   = team==='local' ? state.localPlayers : state.visitPlayers;
  const other = team==='local' ? state.visitPlayers : state.localPlayers;
  if (arr.length >= 3) {
    showToast('Máximo 3 jugadores por equipo', 'danger');
    return;
  }
  if (arr.includes(sel.value)||other.includes(sel.value)) {
    showToast('Este jugador ya está en un equipo','danger'); return;
  }
  arr.push(sel.value);
  renderTeamTags(team);
  updateSaveBtn();
}

function removeFromTeam(team, id) {
  if (team==='local') state.localPlayers=state.localPlayers.filter(x=>x!==id);
  else state.visitPlayers=state.visitPlayers.filter(x=>x!==id);
  renderTeamTags(team);
  updateSaveBtn();
}

function renderTeamTags(team) {
  const arr = team==='local' ? state.localPlayers : state.visitPlayers;
  const container = document.getElementById('match-players-' + team);
  if (!arr.length) {
    container.innerHTML=`<div class="empty">Selecciona jugadores del equipo ${team==='local'?'local':'visitante'}</div>`;
    return;
  }
  container.innerHTML = arr.map(id=>{
    const p = state.players.find(x=>x.id===id);
    return p?`<span class="tag" style="border-color:${playerColor(p)}40;">
      <span style="width:8px;height:8px;border-radius:50%;background:${playerColor(p)};display:inline-block;margin-right:2px;"></span>
      ${p.name}<span class="tag-x" onclick="removeFromTeam('${team}','${id}')">&times;</span>
    </span>`:'';
  }).join('');
}

function selectResult(r) {
  if (state.localPlayers.length < 2 || state.visitPlayers.length < 2) {
    showToast('Agrega mínimo 2 jugadores a cada equipo primero', 'danger');
    return;
  }
  state.selectedResult = r;
  ['w','d','l'].forEach(x=>{
    document.getElementById('btn-'+x).className='result-btn '+(x===r?'sel-'+x:x);
  });
  const mirror = document.getElementById('result-mirror');
  if (mirror) mirror.innerHTML = r ? MIRROR_LABEL[r] : '';
  const scoreRow = document.getElementById('score-row');
  if (scoreRow) scoreRow.style.display = r ? 'flex' : 'none';
  updateSaveBtn();
  renderScorers();
  renderAssists();
  renderReds();
}

function changeScore(team, delta) {
  if (state.selectedResult === 'd') {
    const newVal = Math.max(0, state.scoreLocal + delta);
    state.scoreLocal = newVal;
    state.scoreVisit = newVal;
    document.getElementById('score-local').textContent = newVal;
    document.getElementById('score-visit').textContent = newVal;
    return;
  }

  if (team === 'local') {
    const newVal = Math.max(0, state.scoreLocal + delta);
    if (state.selectedResult === 'w' && newVal < state.scoreVisit) {
      showToast('El local debe tener más goles que el visitante', 'danger');
      return;
    }
    if (state.selectedResult === 'l' && newVal > state.scoreVisit) {
      showToast('El visitante debe tener más goles que el local', 'danger');
      return;
    }
    state.scoreLocal = newVal;
    document.getElementById('score-local').textContent = newVal;
  } else {
    const newVal = Math.max(0, state.scoreVisit + delta);
    if (state.selectedResult === 'w' && newVal >= state.scoreLocal) {
      showToast('El local debe tener más goles que el visitante', 'danger');
      return;
    }
    if (state.selectedResult === 'l' && newVal < state.scoreLocal) {
      showToast('El visitante debe tener más goles que el local', 'danger');
      return;
    }
    state.scoreVisit = newVal;
    document.getElementById('score-visit').textContent = newVal;
  }
  renderScorers();
}
function renderScorers() {
  const section = document.getElementById('scorers-section');
  const list = document.getElementById('scorers-list');
  if (!state.selectedResult || (state.scoreLocal === 0 && state.scoreVisit === 0)) {
    section.style.display = 'none';
    return;
  }
  section.style.display = 'block';

  const allPlayers = [
    ...state.localPlayers.map(id => ({ id, team: 'local' })),
    ...state.visitPlayers.map(id => ({ id, team: 'visit' }))
  ];

  list.innerHTML = allPlayers.map(({ id, team }) => {
    const p = state.players.find(x => x.id === id);
    const name = p ? p.name : '?';
    const current = state.scorers[id] || 0;
    const teamLabel = team === 'local' ? '🏠' : '✈️';
    return `<div class="list-item" style="padding:8px 0;">
      <div style="display:flex;align-items:center;gap:8px;">
        <span>${teamLabel}</span>
        ${avatarHTML(p, 28)}
        <span style="font-size:14px;">${name}</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <button class="score-btn" onclick="changeScorer('${id}',-1)">−</button>
        <span style="font-size:18px;font-weight:700;min-width:24px;text-align:center;">${current}</span>
        <button class="score-btn" onclick="changeScorer('${id}',+1)">+</button>
      </div>
    </div>`;
  }).join('');
}

function changeScorer(id, delta) {
  if (!state.scorers) state.scorers = {};
  const newVal = Math.max(0, (state.scorers[id] || 0) + delta);
  // Calcular total del equipo si se aplica el cambio
  const isLocal = state.localPlayers.includes(id);
  const teamPlayers = isLocal ? state.localPlayers : state.visitPlayers;
  const teamMax = isLocal ? state.scoreLocal : state.scoreVisit;

  const teamTotal = teamPlayers.reduce((sum, pid) => {
    return sum + (pid === id ? newVal : (state.scorers[pid] || 0));
  }, 0);
  
  if (teamTotal > teamMax) {
    showToast(`El equipo solo puede tener ${teamMax} goles`, 'danger');
    return;
  }
  state.scorers[id] = newVal;
  renderScorers();
  renderAssists();
  renderReds();
}
function renderAssists() {
  const section = document.getElementById('assists-section');
  const list = document.getElementById('assists-list');
  if (!state.selectedResult || (state.scoreLocal === 0 && state.scoreVisit === 0)) {
    section.style.display = 'none';
    return;
  }
  section.style.display = 'block';

  const allPlayers = [
    ...state.localPlayers.map(id => ({ id, team: 'local' })),
    ...state.visitPlayers.map(id => ({ id, team: 'visit' }))
  ];

  list.innerHTML = allPlayers.map(({ id, team }) => {
    const p = state.players.find(x => x.id === id);
    const name = p ? p.name : '?';
    const current = state.assists[id] || 0;
    const teamLabel = team === 'local' ? '🏠' : '✈️';
    return `<div class="list-item" style="padding:8px 0;">
      <div style="display:flex;align-items:center;gap:8px;">
        <span>${teamLabel}</span>
        ${avatarHTML(p, 28)}
        <span style="font-size:14px;">${name}</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <button class="score-btn" onclick="changeAssist('${id}',-1)">−</button>
        <span style="font-size:18px;font-weight:700;min-width:24px;text-align:center;">${current}</span>
        <button class="score-btn" onclick="changeAssist('${id}',+1)">+</button>
      </div>
    </div>`;
  }).join('');
}

function changeAssist(id, delta) {
  if (!state.assists) state.assists = {};
  const newVal = Math.max(0, (state.assists[id] || 0) + delta);

  // Total de asistencias del equipo no puede superar goles del equipo
  const isLocal = state.localPlayers.includes(id);
  const teamPlayers = isLocal ? state.localPlayers : state.visitPlayers;
  const teamMax = isLocal ? state.scoreLocal : state.scoreVisit;

  const teamTotal = teamPlayers.reduce((sum, pid) => {
    return sum + (pid === id ? newVal : (state.assists[pid] || 0));
  }, 0);

  if (teamTotal > teamMax) {
    showToast(`El equipo solo puede tener máximo ${teamMax} asistencias`, 'danger');
    return;
  }

  state.assists[id] = newVal;
  renderAssists();
}
function renderReds() {
  const section = document.getElementById('reds-section');
  const list = document.getElementById('reds-list');
  if (!state.selectedResult) {
    section.style.display = 'none';
    return;
  }
  section.style.display = 'block';

  const allPlayers = [
    ...state.localPlayers.map(id => ({ id, team: 'local' })),
    ...state.visitPlayers.map(id => ({ id, team: 'visit' }))
  ];

  list.innerHTML = allPlayers.map(({ id, team }) => {
    const p = state.players.find(x => x.id === id);
    const name = p ? p.name : '?';
    const current = state.reds[id] || 0;
    const teamLabel = team === 'local' ? '🏠' : '✈️';
    return `<div class="list-item" style="padding:8px 0;">
      <div style="display:flex;align-items:center;gap:8px;">
        <span>${teamLabel}</span>
        ${avatarHTML(p, 28)}
        <span style="font-size:14px;">${name}</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <button class="score-btn" onclick="changeRed('${id}',-1)">−</button>
        <span style="font-size:18px;font-weight:700;min-width:24px;text-align:center;">${current}</span>
        <button class="score-btn" onclick="changeRed('${id}',+1)">+</button>
      </div>
    </div>`;
  }).join('');
}

function changeRed(id, delta) {
  if (!state.reds) state.reds = {};
  const newVal = Math.max(0, (state.reds[id] || 0) + delta);

  // Total de rojas del equipo no puede superar 5
  const isLocal = state.localPlayers.includes(id);
  const teamPlayers = isLocal ? state.localPlayers : state.visitPlayers;

  const teamTotal = teamPlayers.reduce((sum, pid) => {
    return sum + (pid === id ? newVal : (state.reds[pid] || 0));
  }, 0);

  if (teamTotal > 5) {
    showToast('Un equipo no puede tener más de 5 rojas', 'danger');
    return;
  }

  state.reds[id] = newVal;
  renderReds();
}
function updateSaveBtn() {
  const btn = document.getElementById('save-btn');
  if (btn) btn.disabled=!(state.localPlayers.length>=2&&state.visitPlayers.length>=2&&state.selectedResult);
}

async function saveMatch() {
  if (!state.localPlayers.length || !state.visitPlayers.length || !state.selectedResult) return;
  // Validar goles coherentes con resultado
  if (state.selectedResult === 'w' && state.scoreLocal <= state.scoreVisit) {
    showToast('El local debe tener más goles que el visitante', 'danger');
    return;
  }
  if (state.selectedResult === 'l' && state.scoreVisit <= state.scoreLocal) {
    showToast('El visitante debe tener más goles que el local', 'danger');
    return;
  }
  if (state.selectedResult === 'd' && state.scoreLocal !== state.scoreVisit) {
    showToast('En empate los goles deben ser iguales', 'danger');
    return;
  }
  const now = new Date();
  const date = now.toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
  const id = genId();
  const match = {
    id, local_players: [...state.localPlayers], visit_players: [...state.visitPlayers],
    result: state.selectedResult, goals_local: state.scoreLocal, goals_visit: state.scoreVisit,
    season: state.season || '', date, scorers: state.scorers || {}, assists: state.assists || {}, reds: state.reds || {}

  };
  const { error } = await sb.from('matches').insert(match);
  if (error) { showToast('Error al guardar partido', 'danger'); return; }
  state.matches.push({
    id, localPlayers: match.local_players, visitPlayers: match.visit_players,
    result: match.result, goalsLocal: match.goals_local, goalsVisit: match.goals_visit,
    season: match.season, date, scorers: match.scorers, assists: match.assists, reds: match.reds
  });
  state.localPlayers = []; state.visitPlayers = []; state.selectedResult = null;
  state.scoreLocal = 0; state.scoreVisit = 0;
  ['w','d','l'].forEach(x => { document.getElementById('btn-'+x).className = 'result-btn '+x; });
  document.getElementById('score-row').style.display = 'none';
  document.getElementById('score-local').textContent = '0';
  document.getElementById('score-visit').textContent = '0';
  document.getElementById('result-mirror').innerHTML = '';
  renderTeamTags('local'); renderTeamTags('visit'); updateSaveBtn();
  checkStreakNotifications();
  state.scorers = {};
  renderScorers();
  state.assists = {};
  renderAssists();
  state.reds = {};
  renderReds();
  showToast('Partido guardado ✓');
}

// ─── Historial ────────────────────────────────────────────────────────────────

function renderHistory() {
  const fp = document.getElementById('filter-player').value;
  const fr = document.getElementById('filter-result').value;
  let ms = [...state.matches].reverse();
  if (fp) ms=ms.filter(m=>(m.localPlayers||[]).includes(fp)||(m.visitPlayers||[]).includes(fp)||(m.players||[]).includes(fp));
  if (fr) ms=ms.filter(m=>{ if(!fp) return m.result===fr||invertResult(m.result)===fr; return getPlayerResult(m,fp)===fr; });

  const el = document.getElementById('history-list');
  if (!ms.length) { el.innerHTML='<div class="empty">No hay partidos que mostrar.</div>'; return; }

  const todayStr = new Date().toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'});

  el.innerHTML = ms.map(m=>{
    const localNames=(m.localPlayers||m.players||[])
      .map(pid=>{const p=state.players.find(x=>x.id===pid);return p?p.name:'?';}).join(', ');
    const visitNames=(m.visitPlayers||[])
      .map(pid=>{const p=state.players.find(x=>x.id===pid);return p?p.name:'?';}).join(', ');
    const teamsStr=visitNames
      ?`<span class="team-local-txt">${localNames}</span> <span style="color:var(--text3);">vs</span> <span class="team-visit-txt">${visitNames}</span>`
      :localNames;
    const visitResult=invertResult(m.result);
    const isToday=m.date&&m.date.startsWith(todayStr);
    const todayChip=isToday?`<span class="chip-today">HOY</span>`:'';
    const seasonTag=m.season?`<span style="font-size:10px;color:var(--text3);margin-left:2px;">🏅 ${m.season}</span>`:'';
    const scoreTag=(m.goalsLocal!==undefined)?`<span class="score-chip">${m.goalsLocal} – ${m.goalsVisit}</span>`:'';
    return `<div class="list-item history-item">
      <div style="flex:1;">
        <div class="match-name">${teamsStr}${todayChip}</div>
        <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;align-items:center;">
          ${scoreTag}
          <span style="font-size:11px;color:var(--text2);">🏠</span>
          <span class="pill ${PILL_CLASS[m.result]}">${LABELS[m.result]}</span>
          <span style="font-size:11px;color:var(--text3);">·</span>
          <span style="font-size:11px;color:var(--text2);">✈️</span>
          <span class="pill ${PILL_CLASS[visitResult]}">${LABELS[visitResult]}</span>
        </div>
        <div class="match-meta">${m.date}${seasonTag}</div>
      </div>
    </div>`;
  }).join('');
}

async function clearHistory() {
  if (!state.matches.length) { showToast('No hay historial que borrar', 'danger'); return; }
  if (!confirm(`¿Borrar los ${state.matches.length} partidos?`)) return;
  await sb.from('matches').delete().neq('id', 'x');
  state.matches = [];
  renderHistory(); showToast('Historial borrado ✓');
}
// ─── Ranking ──────────────────────────────────────────────────────────────────

function renderRanking() {
  renderSeasonSelector('ranking-season-selector');
  const matches = getFilteredMatches();
  const medals = ['🥇','🥈','🥉'];

  function buildRankList(sorted, key, pillClass) {
    if (!sorted.some(s=>s[key]>0)) return '<div class="empty">Sin registros aún.</div>';
    return sorted.map((s,i)=>`
      <div class="rank-item">
        <span class="rank-pos">${medals[i]||(i+1)+'.'}</span>
        <div class="rank-name-wrap">
          <div class="rank-name">${s.name}</div>
          <div class="rank-games">${s.total} partido${s.total!==1?'s':''}</div>
        </div>
        <span class="pill ${pillClass} rank-pill">${s[key]}</span>
      </div>`).join('');
  }

  // Individual
  if (!state.players.length) {
    ['rank-wins','rank-draws','rank-losses'].forEach(id=>{
      document.getElementById(id).innerHTML='<div class="empty">Sin jugadores.</div>';
    });
  } else {
    const stats = state.players.map(p=>{
      const ms=matches.filter(m=>(m.localPlayers||[]).includes(p.id)||(m.visitPlayers||[]).includes(p.id)||(m.players||[]).includes(p.id));
      const w=ms.filter(m=>getPlayerResult(m,p.id)==='w').length;
      const d=ms.filter(m=>getPlayerResult(m,p.id)==='d').length;
      const l=ms.filter(m=>getPlayerResult(m,p.id)==='l').length;
      return {id:p.id,name:p.name,w,d,l,total:ms.length};
    });
    document.getElementById('rank-wins').innerHTML  =buildRankList([...stats].sort((a,b)=>b.w-a.w||b.total-a.total),'w','pill-w');
    document.getElementById('rank-draws').innerHTML =buildRankList([...stats].sort((a,b)=>b.d-a.d||b.total-a.total),'d','pill-d');
    document.getElementById('rank-losses').innerHTML=buildRankList([...stats].sort((a,b)=>b.l-a.l||b.total-a.total),'l','pill-l');
  }

  // Equipos
  function buildTeamRanking(localSize, visitSize, winId, drawId, lossId) {
    const teamMatches = matches;
    const teamMap={};
    teamMatches.forEach(m=>{
      const lc=(m.localPlayers||[]).length, vc=(m.visitPlayers||[]).length;
      if(!((lc===localSize&&vc===visitSize)||(lc===visitSize&&vc===localSize))) return;
      const lKey=[...m.localPlayers].sort().join('|');
      if(!teamMap[lKey]) teamMap[lKey]={ids:m.localPlayers,w:0,d:0,l:0,total:0};
      teamMap[lKey][m.result]++; teamMap[lKey].total++;
      const vKey=[...m.visitPlayers].sort().join('|');
      if(!teamMap[vKey]) teamMap[vKey]={ids:m.visitPlayers,w:0,d:0,l:0,total:0};
      teamMap[vKey][invertResult(m.result)]++; teamMap[vKey].total++;
    });
    const teams=Object.values(teamMap).map(t=>({
      name:t.ids.map(id=>{const p=state.players.find(x=>x.id===id);return p?p.name:'?';}).join(' & '),
      w:t.w,d:t.d,l:t.l,total:t.total
    }));
    if(!teams.length){[winId,drawId,lossId].forEach(id=>{document.getElementById(id).innerHTML='<div class="empty">Sin partidos aún.</div>';});return;}
    document.getElementById(winId).innerHTML =buildRankList([...teams].sort((a,b)=>b.w-a.w||b.total-a.total),'w','pill-w');
    document.getElementById(drawId).innerHTML=buildRankList([...teams].sort((a,b)=>b.d-a.d||b.total-a.total),'d','pill-d');
    document.getElementById(lossId).innerHTML=buildRankList([...teams].sort((a,b)=>b.l-a.l||b.total-a.total),'l','pill-l');
  }

  buildTeamRanking(2,2,'rank-2v2-wins','rank-2v2-draws','rank-2v2-losses');
  buildTeamRanking(2,3,'rank-2v3-wins','rank-2v3-draws','rank-2v3-losses');
  buildTeamRanking(3,3,'rank-3v3-wins','rank-3v3-draws','rank-3v3-losses');

  // Más activo
  const elA=document.getElementById('rank-most-active');
  if(!state.players.length){elA.innerHTML='<div class="empty">Sin jugadores.</div>';return;}
  const byActivity=state.players.map(p=>{
    const total=matches.filter(m=>(m.localPlayers||[]).includes(p.id)||(m.visitPlayers||[]).includes(p.id)||(m.players||[]).includes(p.id)).length;
    return {name:p.name,id:p.id,total,p};
  }).sort((a,b)=>b.total-a.total);
  const medals2=['🥇','🥈','🥉'];
  elA.innerHTML=byActivity.map((pl,i)=>`
    <div class="rank-item">
      <span class="rank-pos">${medals2[i]||(i+1)+'.'}</span>
      ${avatarHTML(pl.p,24)}
      <div class="rank-name-wrap"><div class="rank-name">${pl.name}</div></div>
      <span class="pill rank-pill" style="background:var(--blue-bg);color:var(--blue);">${pl.total} partido${pl.total!==1?'s':''}</span>
    </div>`).join('');
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function renderDashboard() {
  renderSeasonSelector('dashboard-season-selector');
  updateSelects();
  renderGlobal();
  renderLogros();
  renderEvolution();
  renderSeasonComparison();
}

function renderGlobal() {
  const el = document.getElementById('dashboard-global');
  const matches = getFilteredMatches();
  const total = matches.length;
  if (!total) { el.innerHTML='<div class="card"><div class="empty">Aún no hay partidos.</div></div>'; return; }

  const wins   = matches.filter(m=>m.result==='w').length;
  const draws  = matches.filter(m=>m.result==='d').length;
  const losses = matches.filter(m=>m.result==='l').length;

  // Partido más goleado
  let topMatch=null, topGoals=0;
  matches.forEach(m=>{
    if(m.goalsLocal===undefined) return;
    const g=m.goalsLocal+m.goalsVisit;
    if(g>topGoals){topGoals=g;topMatch=m;}
  });

  // Día más activo
const dayCount = {};
const dayNames = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
matches.forEach(m => {
  if (!m.date) return;
  try {
    const monthMap = {
      'ene':0,'feb':1,'mar':2,'abr':3,'may':4,'jun':5,
      'jul':6,'ago':7,'sep':8,'oct':9,'nov':10,'dic':11
    };
    const clean = m.date.toLowerCase().replace(/\./g,'').replace(/\s+/g,' ').trim();
    const parts = clean.split(' ');
    // formato: "01 de jun de 2026 12:20 a m" o similar
    const d = parseInt(parts[0]);
    const mo = monthMap[parts[2]] !== undefined ? monthMap[parts[2]] : monthMap[parts[1]];
    const yr = parseInt(parts[3]) || parseInt(parts[4]);
    if (!isNaN(d) && mo !== undefined && !isNaN(yr)) {
      const dayIdx = new Date(yr, mo, d).getDay();
      dayCount[dayIdx] = (dayCount[dayIdx] || 0) + 1;
    }
  } catch(e) {}
});
const topDay = Object.entries(dayCount).sort((a,b) => b[1] - a[1])[0];

  // Jugador más goleador
  let topScorer=null, topGoalsFor=0;
  state.players.forEach(p=>{
    let gf=0;
    matches.forEach(m=>{
      if(m.goalsLocal===undefined) return;
      const isLocal=(m.localPlayers||[]).includes(p.id);
      const isVisit=(m.visitPlayers||[]).includes(p.id);
      if(isLocal) gf+=m.goalsLocal;
      else if(isVisit) gf+=m.goalsVisit;
    });
    if(gf>topGoalsFor){topGoalsFor=gf;topScorer=p;}
  });
  // Top 3 goleadores  
const top3Scorers = state.players.map(p => {
  let gf = 0;
  matches.forEach(m => {
    if (m.scorers && m.scorers[p.id]) gf += m.scorers[p.id];
  });
  return { p, gf };
}).filter(x => x.gf > 0).sort((a,b) => b.gf - a.gf).slice(0,3);
const top3Medals = ['🥇','🥈','🥉'];
const top3HTML = top3Scorers.length ? top3Scorers.map((x,i) => `
  <div class="list-item">
    <div style="display:flex;align-items:center;gap:8px;">
      <span style="font-size:18px;">${top3Medals[i]}</span>
      ${avatarHTML(x.p, 28)}
      <div class="match-name">${x.p.name}</div>
    </div>
    <span class="pill pill-w">${x.gf} goles</span>
  </div>`).join('') : '<div class="empty">Sin goles individuales registrados.</div>';
  // Top 3 asistidores
const top3Assists = state.players.map(p => {
  let a = 0;
  matches.forEach(m => {
    if (m.assists && m.assists[p.id]) a += m.assists[p.id];
  });
  return { p, a };
}).filter(x => x.a > 0).sort((a,b) => b.a - a.a).slice(0,3);
const top3AssistsMedals = ['🥇','🥈','🥉'];
const top3AssistsHTML = top3Assists.length ? top3Assists.map((x,i) => `
  <div class="list-item">
    <div style="display:flex;align-items:center;gap:8px;">
      <span style="font-size:18px;">${top3AssistsMedals[i]}</span>
      ${avatarHTML(x.p, 28)}
      <div class="match-name">${x.p.name}</div>
    </div>
    <span class="pill pill-d">${x.a} asistencias</span>
  </div>`).join('') : '<div class="empty">Sin asistencias registradas.</div>';
  // Top 3 red cars
  const top3Reds = state.players.map(p => {
  let r = 0;
  matches.forEach(m => {
    if (m.reds && m.reds[p.id]) r += m.reds[p.id];
  });
  return { p, r };
}).filter(x => x.r > 0).sort((a,b) => b.r - a.r).slice(0,3);
const top3RedsMedals = ['🥇','🥈','🥉'];
const top3RedsHTML = top3Reds.length ? top3Reds.map((x,i) => `
  <div class="list-item">
    <div style="display:flex;align-items:center;gap:8px;">
      <span style="font-size:18px;">${top3RedsMedals[i]}</span>
      ${avatarHTML(x.p, 28)}
      <div class="match-name">${x.p.name}</div>
    </div>
    <span class="pill pill-l">${x.r} rojas</span>
  </div>`).join('') : '<div class="empty">Sin tarjetas rojas registradas.</div>';

  el.innerHTML=`
    <div class="global-grid">
      <div class="stat-box"><div class="stat-num">${total}</div><div class="stat-lbl">partidos totales</div></div>
      <div class="stat-box"><div class="stat-num" style="color:var(--green);">${wins}</div><div class="stat-lbl">victorias locales</div></div>
      <div class="stat-box"><div class="stat-num" style="color:var(--amber);">${draws}</div><div class="stat-lbl">empates</div></div>
      <div class="stat-box"><div class="stat-num" style="color:var(--red);">${losses}</div><div class="stat-lbl">derrotas locales</div></div>
    </div>
    <div class="card" style="margin-top:8px;">
      ${topMatch?`<div class="list-item"><div><div class="match-name">🔥 Partido más goleado</div>
        <div class="match-meta">${(topMatch.localPlayers||[]).map(id=>{const p=state.players.find(x=>x.id===id);return p?p.name:'?';}).join(', ')} vs ${(topMatch.visitPlayers||[]).map(id=>{const p=state.players.find(x=>x.id===id);return p?p.name:'?';}).join(', ')}</div>
      </div><span class="score-chip">${topMatch.goalsLocal} – ${topMatch.goalsVisit}</span></div>`:''}
      ${topDay?`<div class="list-item"><div class="match-name">📅 Día más activo</div><span style="font-weight:600;color:var(--blue);">${dayNames[parseInt(topDay[0])]} (${topDay[1]} partidos)</span></div>`:''}
      <div class="list-item" style="border-bottom:none;padding-bottom:4px;">
        <div class="match-name">⚽ Top 3 goleadores</div>
      </div>
      ${top3HTML}
      <div class="list-item" style="border-bottom:none;padding-bottom:4px;">
        <div class="match-name">🎯 Top 3 asistencias</div>
      </div>
      ${top3AssistsHTML}
      <div class="list-item" style="border-bottom:none;padding-bottom:4px;">
        <div class="match-name">🟥 Top 3 tarjetas rojas</div>
      </div>
      ${top3RedsHTML}
        </div>
        `;
}

function renderLogros() {
  const el = document.getElementById('dashboard-logros');
  const matches = getFilteredMatches();
  if (!state.players.length) { el.innerHTML='<div class="card"><div class="empty">Sin jugadores.</div></div>'; return; }

  el.innerHTML = state.players.map(p=>{
    const ms=matches.filter(m=>(m.localPlayers||[]).includes(p.id)||(m.visitPlayers||[]).includes(p.id)||(m.players||[]).includes(p.id));
    const w=ms.filter(m=>getPlayerResult(m,p.id)==='w').length;
    const d=ms.filter(m=>getPlayerResult(m,p.id)==='d').length;
    const l=ms.filter(m=>getPlayerResult(m,p.id)==='l').length;
    const streak=calcStreak(ms,p.id);
    const achievements=getPlayerAchievements(p,ms,w,d,l,streak);
    if(!achievements.length) return '';
    return `<div class="card" style="margin-bottom:8px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        ${avatarHTML(p,32)}
        <div style="font-size:14px;font-weight:500;">${p.name}</div>
      </div>
      <div class="achievements-row">${achievements.map(a=>`
        <div class="achievement-badge" title="${a.desc}">
          <span class="achievement-icon">${a.icon}</span>
          <span class="achievement-name">${a.name}</span>
        </div>`).join('')}
      </div>
    </div>`;
  }).join('') || '<div class="card"><div class="empty">Nadie tiene logros aún.</div></div>';
}

// ─── Head to Head ─────────────────────────────────────────────────────────────

function renderH2H() {
  const p1id = document.getElementById('h2h-p1').value;
  const p2id = document.getElementById('h2h-p2').value;
  const el   = document.getElementById('h2h-result');

  if (!p1id||!p2id||p1id===p2id) {
    el.innerHTML='<div class="empty">Selecciona dos jugadores distintos.</div>'; return;
  }
  const p1=state.players.find(x=>x.id===p1id);
  const p2=state.players.find(x=>x.id===p2id);

  // Partidos juntos (mismo equipo)
  const together = state.matches.filter(m=>{
    const lc=(m.localPlayers||[]), vc=(m.visitPlayers||[]), all=(m.players||[]);
    return (lc.includes(p1id)&&lc.includes(p2id))||(vc.includes(p1id)&&vc.includes(p2id))||(all.includes(p1id)&&all.includes(p2id));
  });
  const togW=together.filter(m=>getPlayerResult(m,p1id)==='w').length;
  const togD=together.filter(m=>getPlayerResult(m,p1id)==='d').length;
  const togL=together.filter(m=>getPlayerResult(m,p1id)==='l').length;

  // Partidos enfrentados (equipos contrarios)
  const versus = state.matches.filter(m=>{
    const lc=m.localPlayers||[], vc=m.visitPlayers||[];
    return (lc.includes(p1id)&&vc.includes(p2id))||(lc.includes(p2id)&&vc.includes(p1id));
  });
  // victorias de p1 en enfrentamientos directos
  const p1wins=versus.filter(m=>getPlayerResult(m,p1id)==='w').length;
  const p2wins=versus.filter(m=>getPlayerResult(m,p2id)==='w').length;
  const vDraws=versus.filter(m=>getPlayerResult(m,p1id)==='d').length;

  el.innerHTML=`
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;justify-content:center;">
      <div style="text-align:center;">${avatarHTML(p1,40)}<div style="font-size:12px;font-weight:500;margin-top:4px;">${p1.name}</div></div>
      <div style="font-size:18px;font-weight:700;color:var(--text3);">vs</div>
      <div style="text-align:center;">${avatarHTML(p2,40)}<div style="font-size:12px;font-weight:500;margin-top:4px;">${p2.name}</div></div>
    </div>

    ${versus.length?`
    <div class="h2h-section-title">⚔️ Enfrentados (${versus.length} partido${versus.length!==1?'s':''})</div>
    <div class="h2h-score-box">
      <div class="h2h-player-score">
        <div class="h2h-big-num" style="color:${p1wins>p2wins?'var(--green)':p1wins<p2wins?'var(--red)':'var(--amber)'};">${p1wins}</div>
        <div class="h2h-player-lbl">${p1.name}</div>
      </div>
      <div class="h2h-mid">
        <div class="h2h-draw">${vDraws} empate${vDraws!==1?'s':''}</div>
      </div>
      <div class="h2h-player-score">
        <div class="h2h-big-num" style="color:${p2wins>p1wins?'var(--green)':p2wins<p1wins?'var(--red)':'var(--amber)'};">${p2wins}</div>
        <div class="h2h-player-lbl">${p2.name}</div>
      </div>
    </div>`:'<div class="empty" style="margin-bottom:10px;">Nunca se han enfrentado.</div>'}

    ${together.length?`
    <div class="h2h-section-title">🤝 Juntos (${together.length} partido${together.length!==1?'s':''})</div>
    <div style="display:flex;gap:8px;justify-content:center;margin-top:6px;">
      <span class="pill pill-w">${togW}V</span>
      <span class="pill pill-d">${togD}E</span>
      <span class="pill pill-l">${togL}D</span>
      <span style="font-size:12px;color:var(--blue);align-self:center;font-weight:600;">${together.length?Math.round(togW/together.length*100):0}% victorias</span>
    </div>`:'<div class="empty">Nunca han jugado juntos.</div>'}
  `;
}

// ─── Evolución ────────────────────────────────────────────────────────────────

function renderEvolution() {
  const pid = document.getElementById('evo-player').value;
  const canvas = document.getElementById('evo-chart');
  const emptyEl = document.getElementById('evo-empty');
  if (!pid) return;
  const matches = getFilteredMatches();

  const ms = matches.filter(m=>(m.localPlayers||[]).includes(pid)||(m.visitPlayers||[]).includes(pid)||(m.players||[]).includes(pid));
  if (ms.length < 2) { canvas.style.display='none'; emptyEl.style.display='block'; return; }
  canvas.style.display='block'; emptyEl.style.display='none';

  // Calcular % acumulado de victorias por partido
  let wins=0;
  const data = ms.map((m,i)=>{
    if(getPlayerResult(m,pid)==='w') wins++;
    return Math.round((wins/(i+1))*100);
  });
  const labels = ms.map((_,i)=>`P${i+1}`);

  drawLineChart(canvas, labels, data);
}

function drawLineChart(canvas, labels, data) {
  const dpr = window.devicePixelRatio||1;
  const W = canvas.offsetWidth||canvas.parentElement.offsetWidth||300;
  const H = 180;
  canvas.width  = W*dpr;
  canvas.height = H*dpr;
  canvas.style.width  = W+'px';
  canvas.style.height = H+'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0,0,W,H);

  const pad={top:16,right:16,bottom:28,left:36};
  const cW=W-pad.left-pad.right;
  const cH=H-pad.top-pad.bottom;

  // Color desde CSS variable
  const isDark=window.matchMedia('(prefers-color-scheme: dark)').matches;
  const lineColor=isDark?'#85B7EB':'#185FA5';
  const gridColor=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)';
  const textColor=isDark?'#a8a69f':'#6b6a65';

  // Grid y ejes
  ctx.strokeStyle=gridColor; ctx.lineWidth=1;
  [0,25,50,75,100].forEach(v=>{
    const y=pad.top+cH*(1-v/100);
    ctx.beginPath(); ctx.moveTo(pad.left,y); ctx.lineTo(pad.left+cW,y); ctx.stroke();
    ctx.fillStyle=textColor; ctx.font='10px system-ui'; ctx.textAlign='right';
    ctx.fillText(v+'%',pad.left-4,y+3);
  });

  // Línea
  ctx.strokeStyle=lineColor; ctx.lineWidth=2.5; ctx.lineJoin='round'; ctx.lineCap='round';
  ctx.beginPath();
  data.forEach((v,i)=>{
    const x=pad.left+(i/(data.length-1))*cW;
    const y=pad.top+cH*(1-v/100);
    i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
  });
  ctx.stroke();

  // Área bajo la línea
  ctx.save();
  ctx.beginPath();
  data.forEach((v,i)=>{
    const x=pad.left+(i/(data.length-1))*cW;
    const y=pad.top+cH*(1-v/100);
    i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
  });
  ctx.lineTo(pad.left+cW, pad.top+cH);
  ctx.lineTo(pad.left, pad.top+cH);
  ctx.closePath();
  const grad=ctx.createLinearGradient(0,pad.top,0,pad.top+cH);
  grad.addColorStop(0,lineColor+'55');
  grad.addColorStop(1,lineColor+'00');
  ctx.fillStyle=grad; ctx.fill(); ctx.restore();

  // Puntos
  ctx.fillStyle=lineColor;
  data.forEach((v,i)=>{
    const x=pad.left+(i/(data.length-1))*cW;
    const y=pad.top+cH*(1-v/100);
    ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2); ctx.fill();
  });

  // Labels eje X (máximo 8)
  ctx.fillStyle=textColor; ctx.font='10px system-ui'; ctx.textAlign='center';
  const step=Math.ceil(labels.length/8);
  labels.forEach((lbl,i)=>{
    if(i%step!==0&&i!==labels.length-1) return;
    const x=pad.left+(i/(data.length-1))*cW;
    ctx.fillText(lbl,x,H-6);
  });
}

// ─── Temporada ────────────────────────────────────────────────────────────────

function renderSeasonBanner() {
  const display=document.getElementById('season-name-display');
  if(display) display.textContent=state.season||'Sin temporada activa';
}
function getFilteredMatches() {
  if (!state.selectedSeason) return state.matches;
  return state.matches.filter(m => (m.season || '') === state.selectedSeason)
}

function getSeasons() {
  const all = [...new Set(state.matches.map(m => m.season || '').filter(Boolean))];
  return all.sort((a, b) => {
    if (a === state.season) return -1;
    if (b === state.season) return 1;
    return 0;
  });
}

function renderSeasonSelector(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const seasons = getSeasons();
  if (!seasons.length) { el.innerHTML = ''; return; }
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
      <span style="font-size:13px;color:var(--text2);">🏅 Temporada:</span>
      <select style="flex:1;" onchange="changeSeason(this.value)">
        ${seasons.map(s => `<option value="${s}" ${s === state.selectedSeason ? 'selected' : ''}>${s}</option>`).join('')}
      </select>
    </div>`;
}

function changeSeason(season) {
  state.selectedSeason = season;
  const currentTab = document.querySelector('.tab.active')?.textContent?.toLowerCase().trim();
  if (currentTab === 'ranking') renderRanking();
  if (currentTab === 'dashboard') renderDashboard();
  if (currentTab === 'jugadores') renderPlayersList();
}
function openSeasonModal() {
  document.getElementById('season-input').value=state.season||'';
  document.getElementById('season-modal').classList.add('open');
  setTimeout(()=>document.getElementById('season-input').focus(),80);
}
function closeSeasonModal(e) {
  if(e&&e.target!==document.getElementById('season-modal')) return;
  document.getElementById('season-modal').classList.remove('open');
}
async function saveSeason() {
  const val = document.getElementById('season-input').value.trim();
  await sb.from('config').update({ value: val }).eq('key', 'season');
  state.season = val; renderSeasonBanner();
  document.getElementById('season-modal').classList.remove('open');
  showToast(val ? `Temporada "${val}" guardada ✓` : 'Temporada eliminada');
}

async function clearSeason() {
  await sb.from('config').update({ value: '' }).eq('key', 'season');
  state.season = ''; renderSeasonBanner();
  document.getElementById('season-modal').classList.remove('open');
  showToast('Temporada eliminada');
}

document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    document.getElementById('season-modal').classList.remove('open');
    document.getElementById('avatar-modal').classList.remove('open');
    document.getElementById('pin-modal').classList.remove('open');
  }
});

// ─── Récords personales ───────────────────────────────────────────────────────

function getPersonalRecords(p, ms) {
  if (!ms.length) return null;
  const id = p.id;

  // Racha máxima de victorias histórica
  let maxWinStreak = 0, maxLossStreak = 0, cur = 0;
  ms.forEach(m => {
    if (getPlayerResult(m,id)==='w') { cur++; maxWinStreak=Math.max(maxWinStreak,cur); }
    else cur=0;
  });
  cur=0;
  ms.forEach(m => {
    if (getPlayerResult(m,id)==='l') { cur++; maxLossStreak=Math.max(maxLossStreak,cur); }
    else cur=0;
  });

  // Mayor goleada a favor y mayor derrota
  let bestWin=null, bestWinDiff=-1, worstLoss=null, worstLossDiff=-1, closestWin=null, closestDiff=99;
  ms.forEach(m => {
    if (m.goalsLocal===undefined) return;
    const isLocal=(m.localPlayers||[]).includes(id);
    const gf=isLocal?m.goalsLocal:m.goalsVisit;
    const gc=isLocal?m.goalsVisit:m.goalsLocal;
    const r=getPlayerResult(m,id);
    if (r==='w') {
      if (gf-gc>bestWinDiff) { bestWinDiff=gf-gc; bestWin=m; }
      if (Math.abs(gf-gc)<closestDiff) { closestDiff=Math.abs(gf-gc); closestWin=m; }
    }
    if (r==='l' && gc-gf>worstLossDiff) { worstLossDiff=gc-gf; worstLoss=m; }
  });

  // Mejor temporada (mayor % victorias, mín. 2 partidos)
  const seasons=[...new Set(ms.map(m=>m.season||'').filter(Boolean))];
  let bestSeason=null, bestSeasonPct=-1;
  seasons.forEach(sn=>{
    const sms=ms.filter(m=>m.season===sn);
    if (sms.length<2) return;
    const pct=Math.round(sms.filter(m=>getPlayerResult(m,id)==='w').length/sms.length*100);
    if (pct>bestSeasonPct) { bestSeasonPct=pct; bestSeason=sn; }
  });

  return { maxWinStreak, maxLossStreak, bestWin, worstLoss, closestWin, bestSeason, bestSeasonPct };
}

function recordsHTML(p, ms) {
  const rec = getPersonalRecords(p, ms);
  if (!rec) return '';
  const id = p.id;
  const rows = [];

  if (rec.maxWinStreak >= 2) rows.push(`
    <div class="list-item">
      <div class="match-name">🔥 Mejor racha de victorias</div>
      <span class="pill pill-w">${rec.maxWinStreak} seguidas</span>
    </div>`);

  if (rec.maxLossStreak >= 3) rows.push(`
    <div class="list-item">
      <div class="match-name">❄️ Peor racha de derrotas</div>
      <span class="pill pill-l">${rec.maxLossStreak} seguidas</span>
    </div>`);

  if (rec.bestWin) {
    const isLocal=(rec.bestWin.localPlayers||[]).includes(id);
    const gf=isLocal?rec.bestWin.goalsLocal:rec.bestWin.goalsVisit;
    const gc=isLocal?rec.bestWin.goalsVisit:rec.bestWin.goalsLocal;
    rows.push(`
      <div class="list-item">
        <div><div class="match-name">⚽ Mayor goleada a favor</div><div class="match-meta">${rec.bestWin.date}</div></div>
        <span class="score-chip">${gf} – ${gc}</span>
      </div>`);
  }

  if (rec.worstLoss) {
    const isLocal=(rec.worstLoss.localPlayers||[]).includes(id);
    const gf=isLocal?rec.worstLoss.goalsLocal:rec.worstLoss.goalsVisit;
    const gc=isLocal?rec.worstLoss.goalsVisit:rec.worstLoss.goalsLocal;
    rows.push(`
      <div class="list-item">
        <div><div class="match-name">💀 Peor derrota</div><div class="match-meta">${rec.worstLoss.date}</div></div>
        <span class="score-chip">${gf} – ${gc}</span>
      </div>`);
  }

  if (rec.closestWin) {
    const isLocal=(rec.closestWin.localPlayers||[]).includes(id);
    const gf=isLocal?rec.closestWin.goalsLocal:rec.closestWin.goalsVisit;
    const gc=isLocal?rec.closestWin.goalsVisit:rec.closestWin.goalsLocal;
    rows.push(`
      <div class="list-item">
        <div><div class="match-name">🎯 Victoria más reñida</div><div class="match-meta">${rec.closestWin.date}</div></div>
        <span class="score-chip">${gf} – ${gc}</span>
      </div>`);
  }

  if (rec.bestSeason) rows.push(`
    <div class="list-item">
      <div class="match-name">🏅 Mejor temporada</div>
      <div style="text-align:right;">
        <div style="font-size:12px;font-weight:600;color:var(--blue);">${rec.bestSeasonPct}%</div>
        <div style="font-size:10px;color:var(--text2);">${rec.bestSeason}</div>
      </div>
    </div>`);

  if (!rows.length) return '';
  return `<div class="detail-section-title">🏆 Récords personales</div>${rows.join('')}`;
}

// ─── Notificaciones de racha ──────────────────────────────────────────────────

function checkStreakNotifications(matchResult) {
  // Para cada jugador del partido recién guardado, calcula su racha actual
  const lastMatch = state.matches[state.matches.length-1];
  if (!lastMatch) return;

  const allPlayers = [...(lastMatch.localPlayers||[]), ...(lastMatch.visitPlayers||[])];
  allPlayers.forEach(pid => {
    const p = state.players.find(x=>x.id===pid);
    if (!p) return;
    const ms = state.matches.filter(m=>(m.localPlayers||[]).includes(pid)||(m.visitPlayers||[]).includes(pid));
    const streak = calcStreak(ms, pid);
    if (!streak || streak.result !== 'w') return;

    const milestones = [3, 5, 10, 15, 20];
    if (milestones.includes(streak.count)) {
      const icons = { 3:'🔥', 5:'🚀', 10:'⚡', 15:'👑', 20:'🐐' };
      setTimeout(() => {
        showToast(`${icons[streak.count]} ${p.name}: ${streak.count} victorias seguidas!`, 'streak');
      }, 800);
    }
  });
}

// ─── Comparar temporadas ──────────────────────────────────────────────────────

function renderSeasonComparison() {
  const el = document.getElementById('season-comparison');
  if (!el) return;

  const seasons = [...new Set(state.matches.map(m=>m.season||'').filter(Boolean))];
  if (seasons.length < 2) {
    el.innerHTML = '<div class="empty">Necesitas al menos 2 temporadas para comparar.</div>';
    return;
  }

  // Para cada jugador que jugó en al menos 2 temporadas, mostrar comparativa
  const playerRows = state.players.map(p => {
    const seasonStats = seasons.map(sn => {
      const sms = state.matches.filter(m =>
        (m.season===sn) &&
        ((m.localPlayers||[]).includes(p.id)||(m.visitPlayers||[]).includes(p.id))
      );
      if (!sms.length) return null;
      const w=sms.filter(m=>getPlayerResult(m,p.id)==='w').length;
      const pct=Math.round(w/sms.length*100);
      return { sn, w, total:sms.length, pct };
    }).filter(Boolean);

    if (seasonStats.length < 2) return '';

    const bars = seasonStats.map(s => {
      const color = s.pct>=60?'var(--green)':s.pct>=40?'var(--amber)':'var(--red)';
      return `
        <div class="season-bar-wrap">
          <div class="season-bar-label">${s.sn}</div>
          <div class="season-bar-track">
            <div class="season-bar-fill" style="width:${s.pct}%;background:${color};"></div>
          </div>
          <div class="season-bar-pct" style="color:${color};">${s.pct}%</div>
          <div class="season-bar-sub">${s.w}V / ${s.total}P</div>
        </div>`;
    }).join('');

    // Tendencia: ¿mejoró o empeoró?
    const first=seasonStats[0].pct, last=seasonStats[seasonStats.length-1].pct;
    const trend = last>first ? `📈 +${last-first}%` : last<first ? `📉 ${last-first}%` : '➡️ igual';
    const trendColor = last>first?'var(--green)':last<first?'var(--red)':'var(--text2)';

    return `
      <div class="card" style="margin-bottom:8px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          ${avatarHTML(p,32)}
          <div style="font-size:14px;font-weight:500;flex:1;">${p.name}</div>
          <span style="font-size:12px;font-weight:600;color:${trendColor};">${trend}</span>
        </div>
        ${bars}
      </div>`;
  }).filter(Boolean).join('');

  el.innerHTML = playerRows || '<div class="empty">No hay jugadores con datos en múltiples temporadas.</div>';
}

// ─── Init ─────────────────────────────────────────────────────────────────────

(async () => {
  await loadFromSupabase();
  await checkTop1Changes();
  updateSelects();
  renderPlayersList();
  renderSeasonBanner();
  await initAdmin();
})();```
