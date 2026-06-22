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

let state = {
  players: [],
  matches: [],
  localPlayers: [],
  visitPlayers: [],
  selectedResult: null,
  season: '',
  scoreLocal: 0,
  scoreVisit: 0,
  editingAvatarId: null
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
    season: m.season, date: m.date
  }));
  const seasonRow = (config || []).find(r => r.key === 'season');
  state.season = seasonRow ? seasonRow.value : '';
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

function switchTab(tab) { if (tab === 'registro' && !isAdmin) {
    showToast('Solo el admin puede registrar partidos', 'danger');
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
    const ms = state.matches.filter(m =>
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

  const ms = state.matches.filter(m =>
    (m.localPlayers||[]).includes(id)||(m.visitPlayers||[]).includes(id)||(m.players||[]).includes(id)
  );
  const w = ms.filter(m => getPlayerResult(m,id)==='w').length;
  const d = ms.filter(m => getPlayerResult(m,id)==='d').length;
  const l = ms.filter(m => getPlayerResult(m,id)==='l').length;
  const total = ms.length;
  const winPct = total ? Math.round((w/total)*100) : 0;
  const streak = calcStreak(ms, id);

  // Goles
  let goalsFor=0, goalsAgainst=0, matchesWithScore=0;
  ms.forEach(m => {
    if (m.goalsLocal===undefined) return;
    matchesWithScore++;
    const isLocal = (m.localPlayers||[]).includes(id);
    goalsFor     += isLocal ? m.goalsLocal : m.goalsVisit;
    goalsAgainst += isLocal ? m.goalsVisit : m.goalsLocal;
  });
  const avgFor = matchesWithScore ? (goalsFor/matchesWithScore).toFixed(1) : '—';
  const goalsHTML = matchesWithScore ? `
    <div class="detail-section-title">⚽ Estadísticas de goles</div>
    <div class="goals-grid">
      <div class="stat-box"><div class="stat-num" style="color:var(--green);">${goalsFor}</div><div class="stat-lbl">a favor</div></div>
      <div class="stat-box"><div class="stat-num" style="color:var(--red);">${goalsAgainst}</div><div class="stat-lbl">en contra</div></div>
      <div class="stat-box"><div class="stat-num" style="color:var(--blue);">${avgFor}</div><div class="stat-lbl">prom./partido</div></div>
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
    return `<div class="list-item" style="flex-direction:column;align-items:flex-start;gap:6px;">
      <div style="display:flex;align-items:center;gap:8px;">
        ${partner ? avatarHTML(partner,28) : ''}
        <div>
          <div style="font-size:14px;font-weight:500;">${name}</div>
          <div style="font-size:11px;color:var(--text2);">${total} partido${total!==1?'s':''} como compañeros</div>
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
  const recentMatches = [...ms].reverse().slice(0,15).map(m=>{
    const myResult=getPlayerResult(m,id);
    const localNames=(m.localPlayers||m.players||[])
      .map(pid=>{const pl=state.players.find(x=>x.id===pid);return pl?pl.name:'?';}).join(', ');
    const visitNames=(m.visitPlayers||[])
      .map(pid=>{const pl=state.players.find(x=>x.id===pid);return pl?pl.name:'?';}).join(', ');
    const teamsStr=visitNames
      ?`<strong>${localNames}</strong> vs <strong>${visitNames}</strong>`
      :`Con: <strong>${localNames}</strong>`;
    const scoreStr=(m.goalsLocal!==undefined)?`<span class="score-chip">${m.goalsLocal} – ${m.goalsVisit}</span> `:'';
    return `<div class="list-item">
      <div>
        <div class="match-name">${teamsStr}</div>
        <div class="match-meta">${scoreStr}${m.date}</div>
      </div>
      <span class="pill ${PILL_CLASS[myResult]}">${LABELS[myResult]}</span>
    </div>`;
  }).join('');

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
    ${recentMatches?`<div class="detail-section-title">🕒 Últimos partidos</div>${recentMatches}`:''}
    ${!total?'<div class="empty">Sin partidos registrados.</div>':''}
  `;
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
  state.selectedResult = r;
  ['w','d','l'].forEach(x=>{
    document.getElementById('btn-'+x).className='result-btn '+(x===r?'sel-'+x:x);
  });
  const mirror = document.getElementById('result-mirror');
  if (mirror) mirror.innerHTML = r ? MIRROR_LABEL[r] : '';
  const scoreRow = document.getElementById('score-row');
  if (scoreRow) scoreRow.style.display = r ? 'flex' : 'none';
  updateSaveBtn();
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
    season: state.season || '', date
  };
  const { error } = await sb.from('matches').insert(match);
  if (error) { showToast('Error al guardar partido', 'danger'); return; }
  state.matches.push({
    id, localPlayers: match.local_players, visitPlayers: match.visit_players,
    result: match.result, goalsLocal: match.goals_local, goalsVisit: match.goals_visit,
    season: match.season, date
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
      const ms=state.matches.filter(m=>(m.localPlayers||[]).includes(p.id)||(m.visitPlayers||[]).includes(p.id)||(m.players||[]).includes(p.id));
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
    const teamMap={};
    state.matches.forEach(m=>{
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
    const total=state.matches.filter(m=>(m.localPlayers||[]).includes(p.id)||(m.visitPlayers||[]).includes(p.id)||(m.players||[]).includes(p.id)).length;
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
  updateSelects();
  renderGlobal();
  renderLogros();
  renderEvolution();
  renderSeasonComparison();
}

function renderGlobal() {
  const el = document.getElementById('dashboard-global');
  const total = state.matches.length;
  if (!total) { el.innerHTML='<div class="card"><div class="empty">Aún no hay partidos.</div></div>'; return; }

  const wins   = state.matches.filter(m=>m.result==='w').length;
  const draws  = state.matches.filter(m=>m.result==='d').length;
  const losses = state.matches.filter(m=>m.result==='l').length;

  // Partido más goleado
  let topMatch=null, topGoals=0;
  state.matches.forEach(m=>{
    if(m.goalsLocal===undefined) return;
    const g=m.goalsLocal+m.goalsVisit;
    if(g>topGoals){topGoals=g;topMatch=m;}
  });

  // Día más activo
  const dayCount={};
  const dayNames=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  state.matches.forEach(m=>{
    if(!m.date) return;
    // Aproximamos el día con el índice del día de la semana usando Date
    // La fecha viene como "21 may. 2026, 15:30"
    // Usamos un truco: parseamos solo la parte de fecha
    try {
      const parts=m.date.split(',')[0].trim().split(' ');
      const d=parseInt(parts[0]);
      const monthMap={ene:0,feb:1,mar:2,abr:3,may:4,jun:5,jul:6,ago:7,sep:8,oct:9,nov:10,dic:11};
      const mo=monthMap[parts[1].replace('.','').toLowerCase()];
      const yr=parseInt(parts[2]);
      if(!isNaN(d)&&mo!==undefined&&!isNaN(yr)){
        const dayIdx=new Date(yr,mo,d).getDay();
        dayCount[dayIdx]=(dayCount[dayIdx]||0)+1;
      }
    } catch(e){}
  });
  const topDay=Object.entries(dayCount).sort((a,b)=>b[1]-a[1])[0];

  // Jugador más goleador
  let topScorer=null, topGoalsFor=0;
  state.players.forEach(p=>{
    let gf=0;
    state.matches.forEach(m=>{
      if(m.goalsLocal===undefined) return;
      const isLocal=(m.localPlayers||[]).includes(p.id);
      const isVisit=(m.visitPlayers||[]).includes(p.id);
      if(isLocal) gf+=m.goalsLocal;
      else if(isVisit) gf+=m.goalsVisit;
    });
    if(gf>topGoalsFor){topGoalsFor=gf;topScorer=p;}
  });

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
      ${topScorer&&topGoalsFor>0?`<div class="list-item"><div style="display:flex;align-items:center;gap:8px;">${avatarHTML(topScorer,28)}<div class="match-name">⚽ Máximo goleador: ${topScorer.name}</div></div><span class="pill pill-w">${topGoalsFor} goles</span></div>`:''}
    </div>`;
}

function renderLogros() {
  const el = document.getElementById('dashboard-logros');
  if (!state.players.length) { el.innerHTML='<div class="card"><div class="empty">Sin jugadores.</div></div>'; return; }

  el.innerHTML = state.players.map(p=>{
    const ms=state.matches.filter(m=>(m.localPlayers||[]).includes(p.id)||(m.visitPlayers||[]).includes(p.id)||(m.players||[]).includes(p.id));
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

  const ms = state.matches.filter(m=>(m.localPlayers||[]).includes(pid)||(m.visitPlayers||[]).includes(pid)||(m.players||[]).includes(pid));
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
  updateSelects();
  renderPlayersList();
  renderSeasonBanner();
  await initAdmin();
})();