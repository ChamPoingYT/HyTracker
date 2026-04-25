'use strict';

const state = { currentPlayer: null, compareQueue: [], favorites: [], language: 'fr', leaderboard: {} };
const $ = id => document.getElementById(id);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
const fmt = n => (n == null || isNaN(n)) ? '—' : Number(n).toLocaleString('fr-FR');
const fmtH = h => h > 0 ? h + ' h' : '< 0.1 h';

// ── Translations ────────────────────────────────────────────────────────────
const t = {
  fr: {
    level: 'Niveau',
    kd: 'K/D',
    wl: 'W/L',
    kills: 'kills',
    deaths: 'morts',
    wins: 'wins',
    losses: 'défaites',
    winstreak: 'Winstreak',
    best: 'Meilleur',
    games: 'Parties',
    assists: 'Assists',
    quits: 'Quitte',
    chests: 'Coffres ouverts',
    totalPlaytime: 'Temps total',
    calculated: 'Calculé depuis tous les kits',
    solo: 'Solo',
    team: 'Équipe',
    arrows: 'Flèches',
    arrowsShot: 'Flèches tirées',
    arrowsHit: 'Flèches touchées',
    accuracy: 'Précision',
    souls: 'Âmes',
    soulWell: 'Soul Well',
    soloMode: 'Mode Solo',
    teamMode: 'Mode Équipe',
    otherModes: 'Autres modes',
    mega: 'Mega Wins',
    lab: 'Lab Wins',
    ranked: 'Ranked Wins',
    kitPlaytime: 'Temps de jeu par kit',
    kitWins: 'Victoires par kit',
    hoursUnit: 'h',
    noKitData: 'Aucune donnée de kit disponible.',
    star: 'Étoile ✦',
    fkdr: 'FKDR',
    finalKills: 'FK',
    finalDeaths: 'FD',
    bblr: 'BBLR',
    bedsBroken: 'brisés',
    bedsLost: 'perdus',
    kdGlobal: 'K/D global',
    itemsPurchased: 'Items achetés',
    resourcesCollected: 'Ressources collectées',
    iron: 'Fer',
    gold: 'Or',
    diamonds: 'Diamants',
    emeralds: 'Émeraudes',
    total: 'Total',
    sessionComparison: 'Comparaison de session',
    comparisonNote: 'Besoin de plusieurs snapshots pour comparer.',
    gradeAnalysis: 'Analyse des grades',
    gradeRank: 'Rang',
    networkLevel: 'Niv. Hypixel',
    gameProgression: 'Progression par jeu',
    prestige: 'Prestige',
    experienceLabel: 'Expérience',
    kitMastery: 'Analyse de la maîtrise des kits',
    topKits: 'Meilleurs kits par temps de jeu',
    rank: 'Rang',
    search: 'Recherche',
    compare: 'Comparaison',
    favorites: 'Favoris',
    settings: 'Paramètres',
    recentGames: 'Parties récentes',
    trends: 'Tendances',
    leaderboard: 'Classements',
    duels: 'Duels',
    duelMode: 'Mode Duel',
    allModes: 'Tous les modes',
    topPlayers: 'Meilleurs joueurs',
    globalStats: 'Statistiques globales',
    searchPlayer: 'Rechercher un joueur',
    apiKey: 'Clé API Hypixel',
  },
  en: {
    level: 'Level',
    kd: 'K/D',
    wl: 'W/L',
    kills: 'kills',
    deaths: 'deaths',
    wins: 'wins',
    losses: 'losses',
    winstreak: 'Winstreak',
    best: 'Best',
    games: 'Games Played',
    assists: 'Assists',
    quits: 'Quits',
    chests: 'Chests Opened',
    totalPlaytime: 'Total Playtime',
    calculated: 'Calculated from all kits',
    solo: 'Solo',
    team: 'Team',
    arrows: 'Arrows',
    arrowsShot: 'Arrows Shot',
    arrowsHit: 'Arrows Hit',
    accuracy: 'Accuracy',
    souls: 'Souls',
    soulWell: 'Soul Well',
    soloMode: 'Solo Mode',
    teamMode: 'Team Mode',
    otherModes: 'Other Modes',
    mega: 'Mega Wins',
    lab: 'Lab Wins',
    ranked: 'Ranked Wins',
    kitPlaytime: 'Playtime per Kit',
    kitWins: 'Wins per Kit',
    hoursUnit: 'h',
    noKitData: 'No kit data available.',
    star: 'Star ✦',
    fkdr: 'FKDR',
    finalKills: 'FK',
    finalDeaths: 'FD',
    bblr: 'BBLR',
    bedsBroken: 'broken',
    bedsLost: 'lost',
    kdGlobal: 'Global K/D',
    itemsPurchased: 'Items Purchased',
    resourcesCollected: 'Resources Collected',
    iron: 'Iron',
    gold: 'Gold',
    diamonds: 'Diamonds',
    emeralds: 'Emeralds',
    total: 'Total',
    sessionComparison: 'Session Comparison',
    comparisonNote: 'Need multiple snapshots to compare.',
    gradeAnalysis: 'Grade & Rank Analysis',
    gradeRank: 'Rank',
    networkLevel: 'Network Level',
    gameProgression: 'Game Progression',
    prestige: 'Prestige',
    experienceLabel: 'Experience',
    kitMastery: 'Kit Mastery Analysis',
    topKits: 'Top Kits by Playtime',
    rank: 'Rank',
    search: 'Search',
    compare: 'Compare',
    favorites: 'Favorites',
    settings: 'Settings',
    recentGames: 'Recent Games',
    trends: 'Trends',
    leaderboard: 'Leaderboards',
    duels: 'Duels',
    duelMode: 'Duel Mode',
    allModes: 'All Modes',
    topPlayers: 'Top Players',
    globalStats: 'Global Stats',
    searchPlayer: 'Search Player',
    apiKey: 'Hypixel API Key',
  }
};

function tr(key) { return (t[state.language] && t[state.language][key]) || t.fr[key] || key; }

function timeAgo(ts) {
  const d = Date.now() - ts;
  if (state.language === 'en') {
    if (d < 60000) return 'just now';
    if (d < 3600000) return Math.floor(d/60000) + ' min ago';
    if (d < 86400000) return Math.floor(d/3600000) + ' h ago';
    return Math.floor(d/86400000) + ' d ago';
  } else {
    if (d < 60000) return 'à l\'instant';
    if (d < 3600000) return 'il y a ' + Math.floor(d/60000) + ' min';
    if (d < 86400000) return 'il y a ' + Math.floor(d/3600000) + ' h';
    return 'il y a ' + Math.floor(d/86400000) + ' j';
  }
}
function pct(a, b) { return b > 0 ? Math.round((a/b)*100) : 0; }

// ── Init ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Load language from localStorage
  const savedLang = localStorage.getItem('hytracker_lang');
  if (savedLang) state.language = savedLang;
  
  const key = await window.hytracker.getApiKey();
  if (key) { $('api-key-input').value = key; } else showNoBanner();
  state.favorites = await window.hytracker.getFavorites();
  renderFavorites(); renderSidebarFavs();
  setupNavigation(); setupSearch(); setupTabs(); setupCompare(); setupLeaderboard(); startRatePoll();
  $('link-dev').addEventListener('click', e => { e.preventDefault(); window.hytracker.openExternal('https://developer.hypixel.net'); });

  $('btn-save-key').addEventListener('click', async () => {
    const newKey = $('api-key-input').value.trim();
    if (newKey) {
      await window.hytracker.setApiKey(newKey);
      alert('Clé API sauvegardée !');
      // Optionnel : masquer la bannière d'avertissement si elle existe
      if ($('no-key-banner')) $('no-key-banner').remove();
    }
  });
});

function showNoBanner() {
  if ($('no-key-banner')) return;
  const b = el('div'); b.id = 'no-key-banner';
  b.innerHTML = '<span>⚠ Clé API manquante — configure-la dans Paramètres.</span><button class="pill-btn" onclick="switchPage(\'settings\')">Configurer</button>';
  $('search-hero').insertAdjacentElement('afterend', b);
}

// ── Navigation ──────────────────────────────────────────────────────────────
function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(btn => btn.addEventListener('click', () => switchPage(btn.dataset.page)));
}
function switchPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  const page = $('page-'+name); if (page) page.classList.add('active');
  const btn = document.querySelector('[data-page="'+name+'"]'); if (btn) btn.classList.add('active');
  if (name === 'settings') updateRateDetail();
}

// ── Search ──────────────────────────────────────────────────────────────────
function setupSearch() {
  $('search-btn').addEventListener('click', () => doSearch());
  $('search-input').addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
}
async function doSearch(username) {
  const q = username || $('search-input').value.trim();
  if (!q) return;
  $('search-error').classList.add('hidden');
  $('player-card').classList.add('hidden');
  if ($('search-empty-hint')) $('search-empty-hint').classList.add('hidden');
  $('search-btn').innerHTML = '<div style="width:14px;height:14px;border:2px solid rgba(255,255,255,0.2);border-top-color:#c4b5fd;border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block"></div>';
  $('search-btn').disabled = true;
  try {
    const p = await window.hytracker.searchPlayer(q);
    state.currentPlayer = p;
    renderPlayerCard(p);
    $('player-card').classList.remove('hidden');
    $('search-input').value = '';
  } catch (e) {
    const err = $('search-error');
    err.textContent = e.message || 'Erreur inconnue';
    err.classList.remove('hidden');
    if ($('search-empty-hint')) $('search-empty-hint').classList.remove('hidden');
  } finally {
    $('search-btn').innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    $('search-btn').disabled = false;
  }
}

// ── Player card ─────────────────────────────────────────────────────────────
function renderPlayerCard(p) {
  // 3D skin via visage.surgeplay.com — bust = head + shoulders
  const skin = $('player-skin-3d');
  skin.src = 'https://visage.surgeplay.com/bust/256/' + p.uuid;
  skin.onerror = () => { skin.src = 'https://crafatar.com/avatars/' + p.uuid + '?size=90&overlay=true'; };

  $('player-name').textContent = p.username;
  const rb = $('player-rank-badge');
  rb.textContent = p.rank || 'Non-rang';
  // Hypixel accurate rank colors
  const rankBg = {
    'MVP++': '#ffaa00', 'MVP+': '#55ffff', 'MVP': '#55ffff',
    'VIP+': '#55ff55', 'VIP': '#55ff55', 'ADMIN': '#ff5555',
    'MODERATOR': '#55ff55', 'HELPER': '#5555ff', 'YT': '#ff5555',
  };
  const rc = rankBg[p.rank] || '#aaaaaa';
  rb.style.color = rc;
  rb.style.background = rc + '22';
  rb.style.borderColor = rc + '66';
  $('player-level-badge').textContent = 'Niv. Hypixel ' + p.networkLevel;

  const dot = $('player-online-dot'); const st = $('player-status-text');
  if (p.status && p.status.online) {
    dot.className = 'online'; st.textContent = 'En ligne · ' + (p.status.gameType || '');
  } else { dot.className = 'offline'; st.textContent = 'Hors ligne'; }

  // Details chips
  const dr = $('player-details-row');
  const chips = [
    p.firstLogin ? ['Inscription', p.firstLogin] : null,
    p.lastLogin  ? ['Dernière co.', p.lastLogin]  : null,
    p.karma      ? ['Karma', fmt(p.karma)]         : null,
    p.achievementPoints ? ['Succès', fmt(p.achievementPoints) + ' pts'] : null,
    p.mostRecentGameType ? ['Dernier jeu', p.mostRecentGameType] : null,
  ].filter(Boolean);
  dr.innerHTML = chips.map(([k,v]) => `<div class="detail-chip">${k} <span>${v}</span></div>`).join('');

  $('btn-add-fav').onclick = async () => {
    state.favorites = await window.hytracker.addFavorite({ uuid:p.uuid, username:p.username, rank:p.rank, networkLevel:p.networkLevel, stats:p.stats });
    renderFavorites(); renderSidebarFavs();
    $('btn-add-fav').textContent = '✓ Ajouté';
    setTimeout(() => { $('btn-add-fav').innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5l1.4 3.1H12l-2.7 2 1 3.1L7 8 3.7 9.7l1-3.1L2 4.6h3.6L7 1.5z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg> Favori'; }, 1500);
  };
  $('btn-add-compare').onclick = () => {
    if (!state.compareQueue.includes(p.username)) state.compareQueue.push(p.username);
    switchPage('compare'); rebuildCompareInputs();
  };

  renderBedwarsPanel(p.stats.bedwars);
  renderSkywarsPanel(p.stats.skywars);
  renderDuelsPanel(p.stats.duels);
  renderMurderPanel(p.stats.murderMystery);
  renderBuildPanel(p.stats.buildBattle);
  renderPitPanel(p.stats.pit);
  renderBlitzPanel(p.stats.blitzSG);
  renderTntPanel(p.stats.tntGames);
  loadRecentGames(p.uuid);
  renderProgressionPanel(p.uuid, p.stats);
  renderComparisonPanel(p.uuid, p.stats);
  renderGradeAnalysisPanel(p);

  // Reset to first tab
  document.querySelectorAll('.stats-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(t => t.classList.remove('active'));
  document.querySelector('[data-tab="bedwars"]').classList.add('active');
  $('tab-bedwars').classList.add('active');
  
  // Refresh leaderboard
  refreshLeaderboard();
}

// ── Tab setup ────────────────────────────────────────────────────────────────
function setupTabs() {
  document.querySelectorAll('.stats-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.stats-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active'); $('tab-' + tab.dataset.tab).classList.add('active');
    });
  });
}

// ── Inner sub-tab setup (called after rendering) ──────────────────────────────
function setupInnerTabs(container) {
  container.querySelectorAll('.inner-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.inner-tab').forEach(t => t.classList.remove('active'));
      container.querySelectorAll('.inner-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = container.querySelector('#' + tab.dataset.inner);
      if (panel) panel.classList.add('active');
    });
  });
}

// ── Stat helpers ─────────────────────────────────────────────────────────────
function sc(label, value, cls, sub) {
  return '<div class="stat-card"><div class="stat-label">' + label + '</div>' +
    '<div class="stat-value' + (cls ? ' ' + cls : '') + '">' + value + '</div>' +
    (sub ? '<div class="stat-sub">' + sub + '</div>' : '') + '</div>';
}
function scColor(label, value, color, sub) {
  return '<div class="stat-card"><div class="stat-label">' + label + '</div>' +
    '<div class="stat-value" style="color:' + color + ';text-shadow:0 0 12px ' + color + '44">' + value + '</div>' +
    (sub ? '<div class="stat-sub">' + sub + '</div>' : '') + '</div>';
}
function ratioBar(label, a, b, color) {
  const w = pct(a, a + b);
  return '<div class="ratio-bar-wrap">' +
    '<div class="ratio-label"><span>' + label + '</span><span>' + w + '%</span></div>' +
    '<div class="ratio-bar-track"><div class="ratio-bar-fill" style="width:' + w + '%;background:' + (color || 'linear-gradient(90deg,var(--mint),var(--lavender))') + '"></div></div>' +
    '</div>';
}
function kitTable(rows, cols, maxVal, barColor) {
  if (!rows || !rows.length) return '<p style="color:var(--text-muted);font-size:13px;padding:8px 0">Aucune donnée de kit disponible.</p>';
  const header = '<tr>' + cols.map(c => '<th>' + c.label + '</th>').join('') + '</tr>';
  const body = rows.map(function(r) {
    return '<tr>' + cols.map(function(c, i) {
      if (i === 0) return '<td>' + r.name + '</td>';
      if (c.bar && maxVal > 0) {
        const w = Math.round((r.value / maxVal) * 120);
        return '<td><div class="kit-bar-wrap"><span>' + r.value + (c.unit||'') + '</span><div class="kit-bar" style="width:' + w + 'px;background:' + (barColor||'var(--lavender)') + '"></div></div></td>';
      }
      return '<td>' + (c.fn ? c.fn(r) : r[c.key]) + (c.unit||'') + '</td>';
    }).join('') + '</tr>';
  }).join('');
  return '<table class="kit-table"><thead>' + header + '</thead><tbody>' + body + '</tbody></table>';
}
function modeTable(modes, cols) {
  if (!modes || !modes.length) return '<p style="color:var(--text-muted);font-size:13px">Aucune donnée par mode.</p>';
  return '<table class="kit-table"><thead><tr>' + cols.map(c => '<th>' + c + '</th>').join('') + '</tr></thead><tbody>' +
    modes.map(m => '<tr>' + cols.map((c,i) => '<td>' + (i===0 ? m.name : Object.values(m)[i]) + '</td>').join('') + '</tr>').join('') +
    '</tbody></table>';
}

// ── BedWars ──────────────────────────────────────────────────────────────────
function renderBedwarsPanel(bw) {
  let statsHtml = '<div class="stat-grid">';
  statsHtml += sc(tr('star'), '★ ' + bw.star, 'highlight-bw');
  statsHtml += sc(tr('fkdr'), bw.fkdr, 'highlight-bw', fmt(bw.finalKills) + ' ' + tr('finalKills') + ' · ' + fmt(bw.finalDeaths) + ' ' + tr('finalDeaths'));
  statsHtml += sc(tr('wl'), bw.wlr, 'highlight-bw', fmt(bw.wins) + ' ' + tr('wins') + ' · ' + fmt(bw.losses) + ' ' + tr('losses'));
  statsHtml += sc(tr('bblr'), bw.bblr, 'highlight-bw', fmt(bw.bedsBroken) + ' ' + tr('bedsBroken') + ' · ' + fmt(bw.bedsLost) + ' ' + tr('bedsLost'));
  statsHtml += sc(tr('kdGlobal'), bw.kdr, '', fmt(bw.kills) + ' ' + tr('kills') + ' · ' + fmt(bw.deaths) + ' ' + tr('deaths'));
  statsHtml += sc(tr('winstreak'), fmt(bw.winstreak), '', tr('best') + ': ' + fmt(bw.bestWinstreak));
  statsHtml += sc(tr('games'), fmt(bw.gamesPlayed), '');
  statsHtml += sc(tr('itemsPurchased'), fmt(bw.itemsPurchased), '');
  statsHtml += '</div>';
  statsHtml += '<div class="section-title">' + tr('resourcesCollected') + '</div><div class="stat-grid">';
  statsHtml += sc(tr('iron'), fmt(bw.iron), '') + sc(tr('gold'), fmt(bw.gold), '') + sc(tr('diamonds'), fmt(bw.diamonds), '') + sc(tr('emeralds'), fmt(bw.emeralds), '') + sc(tr('total'), fmt(bw.resourcesCollected), '');
  statsHtml += '</div>';
  statsHtml += ratioBar('Victoires vs Défaites', bw.wins, bw.losses);
  if (bw.modes && bw.modes.length) {
    statsHtml += '<div class="section-title" style="margin-top:20px">Par mode</div><div class="section-box">';
    statsHtml += kitTable(
      bw.modes.map(m => ({ name: m.name, value: parseFloat(m.fkdr), fkdr: m.fkdr, wlr: m.wlr, bblr: m.bblr, wins: fmt(m.wins), finalKills: fmt(m.finalKills) })),
      [{ label: 'Mode' }, { label: 'FKDR', key: 'fkdr' }, { label: 'W/L', key: 'wlr' }, { label: 'BBLR', key: 'bblr' }, { label: 'Wins', key: 'wins' }, { label: 'FK', key: 'finalKills' }],
      0, ''
    );
    statsHtml += '</div>';
  }
  if (bw.practice && bw.practice.bridgeAttempts > 0) {
    statsHtml += '<div class="section-title">BedWars Practice</div><div class="stat-grid">';
    statsHtml += sc('Tentatives bridge', fmt(bw.practice.bridgeAttempts), '');
    statsHtml += sc('Succès bridge', fmt(bw.practice.bridgeSuccesses), '');
    statsHtml += sc('Echecs bridge', fmt(bw.practice.bridgeFails), '');
    statsHtml += sc('Taux succès', pct(bw.practice.bridgeSuccesses, bw.practice.bridgeAttempts) + '%', '');
    statsHtml += '</div>';
  }

  const html = `
    <div class="inner-tabs">
      <button class="inner-tab active" data-inner="bw-stats">Stats</button>
      <button class="inner-tab" data-inner="bw-trends">Tendances</button>
    </div>
    <div class="inner-panel active" id="bw-stats">${statsHtml}</div>
    <div class="inner-panel" id="bw-trends"><div class="empty-state"><p>Recherche ce joueur plusieurs fois pour voir les tendances.</p></div></div>
  `;
  $('tab-bedwars').innerHTML = html;
  setupInnerTabs($('tab-bedwars'));
}

// ── SkyWars ──────────────────────────────────────────────────────────────────
function renderSkywarsPanel(sw) {
  const totalSoloH = (sw.kitTimeSolo||[]).reduce((s, k) => s + k.value, 0).toFixed(1);
  const totalTeamH = (sw.kitTimeTeam||[]).reduce((s, k) => s + k.value, 0).toFixed(1);

  // ── sub-tab: Stats ──
  let statsHtml = '<div class="stat-grid">';
  if (sw.level) {
    statsHtml += scColor(tr('level'), sw.level || 'N/A', sw.levelColor || '#c4b5fd', '');
  } else {
    statsHtml += sc(tr('level'), sw.level || '?', 'highlight-sw');
  }
  statsHtml += sc(tr('kd'), sw.kdr, 'highlight-sw', fmt(sw.kills) + ' ' + tr('kills') + ' · ' + fmt(sw.deaths) + ' ' + tr('deaths'));
  statsHtml += sc(tr('wl'), sw.wlr, 'highlight-sw', fmt(sw.wins) + ' ' + tr('wins') + ' · ' + fmt(sw.losses) + ' ' + tr('losses'));
  statsHtml += sc(tr('winstreak'), fmt(sw.winstreak), '', tr('best') + ': ' + fmt(sw.bestWinstreak));
  statsHtml += sc(tr('games'), fmt(sw.gamesPlayed), '');
  statsHtml += sc(tr('assists'), fmt(sw.assists), '');
  statsHtml += sc(tr('quits'), fmt(sw.quits), '');
  statsHtml += sc(tr('chests'), fmt(sw.chestsOpened), '');
  statsHtml += '</div>';
  statsHtml += '<div class="section-title">' + tr('totalPlaytime') + '</div><div class="stat-grid">';
  statsHtml += sc(tr('totalPlaytime'), sw.totalPlaytimeHours + ' h', 'highlight-sw', tr('calculated'));
  statsHtml += sc(tr('solo'), totalSoloH + ' h', '');
  statsHtml += sc(tr('team'), totalTeamH + ' h', '');
  statsHtml += '</div>';
  statsHtml += '<div class="section-title">' + tr('arrows') + '</div><div class="stat-grid">';
  statsHtml += sc(tr('arrowsShot'), fmt(sw.arrows), '');
  statsHtml += sc(tr('arrowsHit'), fmt(sw.arrowHits), '');
  statsHtml += sc(tr('accuracy'), sw.arrowAccuracy, '');
  statsHtml += sc(tr('souls'), fmt(sw.souls), '');
  statsHtml += sc(tr('soulWell'), fmt(sw.soulWell), '');
  statsHtml += '</div>';
  statsHtml += '<div class="two-col">';
  statsHtml += '<div><div class="section-title">' + tr('soloMode') + '</div><div class="stat-grid">';
  statsHtml += sc('K/D', sw.soloKdr, '') + sc('W/L', sw.soloWlr, '') + sc(tr('wins'), fmt(sw.soloWins), '') + sc(tr('totalPlaytime'), sw.soloPlaytimeHours + ' h', '');
  statsHtml += '</div></div>';
  statsHtml += '<div><div class="section-title">' + tr('teamMode') + '</div><div class="stat-grid">';
  statsHtml += sc('K/D', sw.teamKdr, '') + sc('W/L', sw.teamWlr, '') + sc(tr('wins'), fmt(sw.teamWins), '') + sc(tr('totalPlaytime'), sw.teamPlaytimeHours + ' h', '');
  statsHtml += '</div></div></div>';
  if ((sw.megaWins||0) + (sw.labWins||0) + (sw.rankedWins||0) > 0) {
    statsHtml += '<div class="section-title">' + tr('otherModes') + '</div><div class="stat-grid">';
    if (sw.megaWins > 0) statsHtml += sc(tr('mega'), fmt(sw.megaWins), '');
    if (sw.labWins > 0)  statsHtml += sc(tr('lab'),  fmt(sw.labWins),  '');
    if (sw.rankedWins > 0) statsHtml += sc(tr('ranked'), fmt(sw.rankedWins), '');
    statsHtml += '</div>';
  }

  // ── sub-tab: Kit Mastery ──
  let kitsHtml = '';
  const hasTimedKits = (sw.kitTimeSolo && sw.kitTimeSolo.length) || (sw.kitTimeTeam && sw.kitTimeTeam.length) || (sw.kitWinsSolo && sw.kitWinsSolo.length);
  const hasPackageKits = sw.kitList && sw.kitList.length;

  if (!hasTimedKits && !hasPackageKits) {
    kitsHtml = '<div class="empty-state"><p>' + tr('noKitData') + '</p></div>';
  } else {
    // ─ Package-based kits (most players — newer API format) ─
    if (hasPackageKits) {
      const maxWins = sw.kitList[0] ? sw.kitList[0].wins : 1;
      kitsHtml += '<div class="section-title">Kits débloqués (' + sw.kitList.length + ')</div>';
      kitsHtml += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;margin-bottom:20px">';
      sw.kitList.slice(0, 12).forEach((kit, i) => {
        const pctVal = maxWins > 0 ? Math.round((kit.wins / maxWins) * 100) : 0;
        const tierColors = { basic: '#aaa', rookie: '#86efac', experienced: '#93c5fd', elite: '#c4b5fd', champion: '#fde68a' };
        const tierColor = tierColors[kit.tier] || '#aaa';
        kitsHtml += `<div style="padding:12px;background:rgba(147,197,253,0.07);border-radius:12px;border:1px solid rgba(147,197,253,0.15)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <span style="font-size:11px;color:var(--sky);font-weight:700">#${i+1}</span>
            <span style="font-size:10px;color:${tierColor};font-weight:600;text-transform:uppercase">${kit.tier}</span>
          </div>
          <div style="font-weight:600;font-size:13px;margin-bottom:5px">${kit.name}</div>
          <div style="font-size:11px;color:var(--text-secondary);margin-bottom:6px">
            ${kit.wins} wins · ${kit.kills} kills
            ${kit.soloWins || kit.teamWins ? '<br><span style="color:var(--sky)">Solo: '+kit.soloWins+'</span> · <span style="color:var(--mint)">Équipe: '+kit.teamWins+'</span>' : ''}
          </div>
          <div style="height:3px;background:rgba(255,255,255,0.08);border-radius:2px"><div style="width:${pctVal}%;height:100%;background:linear-gradient(90deg,var(--sky),var(--mint));border-radius:2px"></div></div>
        </div>`;
      });
      kitsHtml += '</div>';

      if (sw.kitList.length > 12) {
        kitsHtml += '<div class="section-title">Tous les kits débloqués</div><div class="section-box">';
        kitsHtml += kitTable(
          sw.kitList.map(k => ({ name: k.name, value: k.wins, tier: k.tier, soloWins: k.soloWins, teamWins: k.teamWins, kills: k.kills })),
          [
            { label: 'Kit' },
            { label: 'Tier', key: 'tier' },
            { label: tr('wins'), bar: true },
            { label: 'Solo', key: 'soloWins' },
            { label: 'Équipe', key: 'teamWins' },
            { label: tr('kills'), key: 'kills' },
          ],
          maxWins, 'var(--sky)'
        );
        kitsHtml += '</div>';
      }
    }

    // ─ Time-played kit tables (older players with time_played_kit_ data) ─
    if (hasTimedKits) {
      const topKits = [...(sw.kitTimeSolo||[])].slice(0,6);
      if (topKits.length) {
        kitsHtml += '<div class="section-title">' + tr('topKits') + ' (' + tr('solo') + ')</div>';
        kitsHtml += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin-bottom:20px">';
        topKits.forEach((kit, i) => {
          const pctVal = Math.round((kit.value / (topKits[0].value || 1)) * 100);
          const wins = (sw.kitWinsSolo||[]).find(k => k.name === kit.name);
          kitsHtml += `<div style="padding:12px;background:rgba(147,197,253,0.08);border-radius:12px;border:1px solid rgba(147,197,253,0.2)">
            <div style="font-size:11px;color:var(--sky);font-weight:700;margin-bottom:2px">#${i+1}</div>
            <div style="font-weight:600;font-size:13px;margin-bottom:4px">${kit.name}</div>
            <div style="font-size:11px;color:var(--text-secondary)">${kit.value}h${wins ? ' · '+wins.value+' wins' : ''}</div>
            <div style="height:3px;background:rgba(255,255,255,0.08);border-radius:2px;margin-top:8px"><div style="width:${pctVal}%;height:100%;background:linear-gradient(90deg,var(--sky),var(--mint))"></div></div>
          </div>`;
        });
        kitsHtml += '</div>';
      }
      if (sw.kitTimeSolo && sw.kitTimeSolo.length) {
        kitsHtml += '<div class="section-title">' + tr('kitPlaytime') + ' — ' + tr('solo') + '</div><div class="section-box">';
        kitsHtml += kitTable(sw.kitTimeSolo.slice(0,20), [{ label: 'Kit' }, { label: 'h', bar: true, unit: ' h' }], sw.kitTimeSolo[0].value, 'var(--sky)');
        kitsHtml += '</div>';
      }
      if (sw.kitTimeTeam && sw.kitTimeTeam.length) {
        kitsHtml += '<div class="section-title">' + tr('kitPlaytime') + ' — ' + tr('team') + '</div><div class="section-box">';
        kitsHtml += kitTable(sw.kitTimeTeam.slice(0,20), [{ label: 'Kit' }, { label: 'h', bar: true, unit: ' h' }], sw.kitTimeTeam[0].value, 'var(--mint)');
        kitsHtml += '</div>';
      }
      if (sw.kitWinsSolo && sw.kitWinsSolo.length) {
        kitsHtml += '<div class="section-title">' + tr('kitWins') + ' — ' + tr('solo') + '</div><div class="section-box">';
        kitsHtml += kitTable(sw.kitWinsSolo.slice(0,20), [{ label: 'Kit' }, { label: tr('wins'), bar: true }], sw.kitWinsSolo[0].value, 'var(--lavender)');
        kitsHtml += '</div>';
      }
      if (sw.kitWinsTeam && sw.kitWinsTeam.length) {
        kitsHtml += '<div class="section-title">' + tr('kitWins') + ' — ' + tr('team') + '</div><div class="section-box">';
        kitsHtml += kitTable(sw.kitWinsTeam.slice(0,20), [{ label: 'Kit' }, { label: tr('wins'), bar: true }], sw.kitWinsTeam[0].value, 'var(--peach)');
        kitsHtml += '</div>';
      }
    }
  }

  // ── Assemble sub-tabs ──
  const html = `
    <div class="inner-tabs">
      <button class="inner-tab active" data-inner="sw-stats">Stats</button>
      <button class="inner-tab" data-inner="sw-kits">Kit Mastery</button>
      <button class="inner-tab" data-inner="sw-trends">Tendances</button>
    </div>
    <div class="inner-panel active" id="sw-stats">${statsHtml}</div>
    <div class="inner-panel" id="sw-kits">${kitsHtml}</div>
    <div class="inner-panel" id="sw-trends"><div class="empty-state"><p>Recherche ce joueur plusieurs fois pour voir les tendances.</p></div></div>
  `;
  $('tab-skywars').innerHTML = html;
  setupInnerTabs($('tab-skywars'));

  // Store sw data for async trends rendering
  $('tab-skywars').dataset.pendingTrends = 'sw';
}

// ── Duels ────────────────────────────────────────────────────────────────────
function renderDuelsPanel(du) {
  let statsHtml = '<div class="stat-grid">';
  statsHtml += sc(tr('wl'), du.wlr, 'highlight-du', fmt(du.wins) + ' ' + tr('wins') + ' · ' + fmt(du.losses) + ' ' + tr('losses'));
  statsHtml += sc(tr('kd'), du.kdr, 'highlight-du', fmt(du.kills) + ' ' + tr('kills') + ' · ' + fmt(du.deaths) + ' ' + tr('deaths'));
  statsHtml += sc(tr('winstreak'), fmt(du.winstreak), '', tr('best') + ': ' + fmt(du.bestWinstreak));
  statsHtml += sc(tr('games'), fmt(du.gamesPlayed), '');
  statsHtml += sc('Golden Apples', fmt(du.goldenApples), '');
  statsHtml += '</div>';
  statsHtml += '<div class="two-col">';
  statsHtml += '<div><div class="section-title">Melee</div><div class="stat-grid">';
  statsHtml += sc(tr('accuracy'), du.meleeAccuracy, '') + sc('Hits', fmt(du.meleeHits), '') + sc('Swings', fmt(du.meleeSwings), '');
  statsHtml += '</div></div>';
  statsHtml += '<div><div class="section-title">' + tr('arrows') + '</div><div class="stat-grid">';
  statsHtml += sc(tr('accuracy'), du.arrowAccuracy, '') + sc(tr('arrowsHit'), fmt(du.arrowsHit), '') + sc(tr('arrowsShot'), fmt(du.arrowsShot), '');
  statsHtml += '</div></div></div>';
  if (du.breakdown && du.breakdown.length) {
    statsHtml += '<div class="section-title" style="margin-top:16px">' + tr('allModes') + '</div><div class="section-box">';
    const maxW = du.breakdown.reduce((m, x) => Math.max(m, x.wins), 0);
    statsHtml += kitTable(
      du.breakdown.map(m => ({ name: m.name, value: m.wins, wlr: m.wlr, kdr: m.kdr, wins: fmt(m.wins), kills: fmt(m.kills) })),
      [{ label: tr('duelMode') }, { label: tr('wins'), bar: true }, { label: tr('wl'), key: 'wlr' }, { label: tr('kd'), key: 'kdr' }, { label: tr('kills'), key: 'kills' }],
      maxW, 'var(--rose)'
    );
    statsHtml += '</div>';
  }

  const html = `
    <div class="inner-tabs">
      <button class="inner-tab active" data-inner="du-stats">Stats</button>
      <button class="inner-tab" data-inner="du-trends">Tendances</button>
    </div>
    <div class="inner-panel active" id="du-stats">${statsHtml}</div>
    <div class="inner-panel" id="du-trends"><div class="empty-state"><p>Recherche ce joueur plusieurs fois pour voir les tendances.</p></div></div>
  `;
  $('tab-duels').innerHTML = html;
  setupInnerTabs($('tab-duels'));
}

// ── Murder Mystery ───────────────────────────────────────────────────────────
function renderMurderPanel(mm) {
  let html = '<div class="stat-grid">';
  html += sc(tr('wins'), fmt(mm.wins), 'highlight-bw', mm.games + ' ' + tr('games'));
  html += sc(tr('kd'), mm.kdr, '');
  html += sc(tr('wl'), mm.wlr, '');
  html += sc('Murderer ' + tr('wins'), fmt(mm.murdererWins), '');
  html += sc('Detective ' + tr('wins'), fmt(mm.detectiveWins), '');
  html += sc('Heroes', fmt(mm.heroes), '');
  html += '</div>';
  html += '<div class="section-title">Kill Types</div>';
  html += '<div class="stat-grid">';
  html += sc('Knife', fmt(mm.knifeKills), '');
  html += sc('Bow', fmt(mm.bowKills), '');
  html += sc('Thrown', fmt(mm.thrownKills), '');
  html += '</div>';
  $('tab-murder').innerHTML = html;
}

// ── Build Battle ─────────────────────────────────────────────────────────────
function renderBuildPanel(bb) {
  let html = '<div class="stat-grid">';
  html += sc(tr('wins'), fmt(bb.wins), 'highlight-bw', bb.gamesPlayed + ' ' + tr('games'));
  html += sc('Score', fmt(bb.score), '');
  html += sc('Votes', fmt(bb.totalVotes), '');
  html += sc('Super Votes', fmt(bb.superVotes), '');
  html += sc('Correct Guesses', fmt(bb.correctGuesses), '');
  html += '</div>';
  $('tab-build').innerHTML = html;
}

// ── Pit ──────────────────────────────────────────────────────────────────────
function renderPitPanel(pit) {
  if (!pit || (pit.kills === 0 && pit.deaths === 0 && pit.xp === 0 && pit.assists === 0)) {
    $('tab-pit').innerHTML = '<div class="empty-state"><p>Aucune donnée Pit disponible pour ce joueur.</p></div>';
    return;
  }
  let html = '<div class="stat-grid">';
  html += sc(tr('kd'), pit.kdr, 'highlight-rc', fmt(pit.kills) + ' ' + tr('kills') + ' · ' + fmt(pit.deaths) + ' ' + tr('deaths'));
  html += sc(tr('assists'), fmt(pit.assists), '');
  html += sc('Best Streak', fmt(pit.highestStreak), '');
  html += sc(tr('games'), fmt(pit.joins), '');
  html += sc('XP', fmt(pit.xp), '');
  if (pit.gold > 0) html += sc('Or (Gold)', fmt(pit.gold), '');
  if (pit.playtime > 0) html += sc('Temps (min)', fmt(pit.playtime), '');
  if (pit.contractsCompleted > 0) html += sc('Contrats', fmt(pit.contractsCompleted), '');
  if (pit.chatMessages > 0) html += sc('Messages', fmt(pit.chatMessages), '');
  html += '</div>';
  $('tab-pit').innerHTML = html;
}

// ── Blitz SG ─────────────────────────────────────────────────────────────────
function renderBlitzPanel(bsg) {
  let html = '<div class="stat-grid">';
  html += sc(tr('wins'), fmt(bsg.wins), 'highlight-bw');
  html += sc(tr('kd'), bsg.kdr, '', fmt(bsg.kills) + ' ' + tr('kills') + ' · ' + fmt(bsg.deaths) + ' ' + tr('deaths'));
  html += '</div>';
  if (bsg.kits && bsg.kits.length) {
    html += '<div class="section-title">Wins per Kit</div><div class="section-box">';
    const maxK = bsg.kits[0] ? bsg.kits[0].value : 1;
    html += kitTable(bsg.kits, [{ label: 'Kit' }, { label: tr('wins'), bar: true }], maxK, 'var(--peach)');
    html += '</div>';
  }
  $('tab-blitz').innerHTML = html;
}

// ── TNT Games ────────────────────────────────────────────────────────────────
function renderTntPanel(tnt) {
  let html = '<div class="stat-grid">';
  html += sc('TNT Run ' + tr('wins'), fmt(tnt.winsRun), '');
  html += sc('PvP Run ' + tr('wins'), fmt(tnt.winsPvp), '');
  html += sc('Bow Spleef ' + tr('wins'), fmt(tnt.winsBow), '');
  html += sc('TNT Tag ' + tr('wins'), fmt(tnt.winsTag), '');
  html += sc('TNT Tag ' + tr('kills'), fmt(tnt.killsTag), '');
  if (tnt.recordRun) html += sc('Record TNT Run', tnt.recordRun + 's', '');
  html += '</div>';
  $('tab-tnt').innerHTML = html;
}

// ── Recent games ─────────────────────────────────────────────────────────────
async function loadRecentGames(uuid) {
  const panel = $('tab-recent');
  try {
    const games = await window.hytracker.getRecentGames(uuid);
    if (!games.length) { panel.innerHTML = '<div class="empty-state"><p>Aucune partie récente.</p></div>'; return; }
    const modeMap = { BEDWARS:'bw', SKYWARS:'sw', DUELS:'du', MURDERMYSTERY:'mu', BUILDBATTLE:'bb', PIT:'pt', BLITZ:'bz', TNTGAMES:'tn' };
    panel.innerHTML = '<div class="recent-list">' + games.slice(0,25).map(g => {
      const cls = modeMap[g.gameType] || 'oth';
      const mode = g.gameType ? (g.gameType.charAt(0) + g.gameType.slice(1).toLowerCase().replace(/_/g,' ')) : 'Inconnu';
      const sub = g.mode ? ' · ' + g.mode : '';
      const ago = g.date ? timeAgo(g.date) : '';
      return '<div class="recent-item"><span class="recent-mode ' + cls + '">' + mode + '</span><span style="color:var(--text-secondary)">' + sub + '</span><span class="recent-time">' + ago + '</span></div>';
    }).join('') + '</div>';
  } catch (_) { panel.innerHTML = '<div class="empty-state"><p>Impossible de charger les parties récentes.</p></div>'; }
}

// ── Progression / Trends (injected per-game) ─────────────────────────────────
// Store pending chart draws globally so inner-tab clicks can trigger them
const pendingCharts = {};

async function renderProgressionPanel(uuid, currentStats) {
  const snaps = await window.hytracker.getSnapshots(uuid);

  // Deduplicate snapshots that are too close (keep one per 30-min window)
  const deduped = [];
  snaps.forEach(s => {
    const last = deduped[deduped.length - 1];
    if (!last || s.ts - last.ts > 30 * 60 * 1000) deduped.push(s);
  });

  // Labels: show time if multiple snapshots same day
  function makeLabels(snaps) {
    return snaps.map(s => {
      const d = new Date(s.ts);
      const dateStr = d.toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit' });
      const timeStr = d.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });
      return dateStr + '\n' + timeStr;
    });
  }

  function registerCharts(containerId, chartDefs, snaps) {
    if (!snaps || snaps.length < 2) return;
    pendingCharts[containerId] = { chartDefs, snaps, labels: makeLabels(snaps), drawn: false };
  }

  function buildTrendHtml(chartDefs, snaps, game) {
    if (!snaps || snaps.length < 2) {
      return buildTrendsEmptyState() + buildCustomChartBuilder(game, snaps, currentStats);
    }
    const charts = chartDefs.map(c =>
      `<div class="prog-chart-wrap"><div class="prog-label">${c.label}</div><canvas id="${c.id}" height="90"></canvas></div>`
    ).join('');
    return charts + buildCustomChartBuilder(game, snaps, currentStats);
  }

  const bwDefs = [
    { id: 'chart-bw-fkdr', label: 'FKDR',        fn: s => parseFloat((s.stats.bedwars||{}).fkdr||0),        color: '#c4b5fd' },
    { id: 'chart-bw-wlr',  label: 'W/L',          fn: s => parseFloat((s.stats.bedwars||{}).wlr||0),         color: '#a78bfa' },
    { id: 'chart-bw-wins', label: 'Wins',          fn: s => (s.stats.bedwars||{}).wins||0,                    color: '#e9d5ff' },
    { id: 'chart-bw-fk',   label: 'Final Kills',   fn: s => (s.stats.bedwars||{}).finalKills||0,              color: '#c4b5fd' },
  ];
  const swDefs = [
    { id: 'chart-sw-kdr',  label: 'K/D',           fn: s => parseFloat((s.stats.skywars||{}).kdr||0),         color: '#93c5fd' },
    { id: 'chart-sw-wlr',  label: 'W/L',           fn: s => parseFloat((s.stats.skywars||{}).wlr||0),         color: '#60a5fa' },
    { id: 'chart-sw-time', label: 'Temps (h)',      fn: s => parseFloat((s.stats.skywars||{}).totalPlaytimeHours||0), color: '#38bdf8' },
    { id: 'chart-sw-wins', label: 'Wins',           fn: s => (s.stats.skywars||{}).wins||0,                   color: '#93c5fd' },
  ];
  const duDefs = [
    { id: 'chart-du-wlr',   label: 'W/L',          fn: s => parseFloat((s.stats.duels||{}).wlr||0),           color: '#f9a8d4' },
    { id: 'chart-du-kdr',   label: 'K/D',           fn: s => parseFloat((s.stats.duels||{}).kdr||0),           color: '#f472b6' },
    { id: 'chart-du-games', label: 'Parties',       fn: s => (s.stats.duels||{}).gamesPlayed||0,               color: '#ec4899' },
    { id: 'chart-du-wins',  label: 'Wins',          fn: s => (s.stats.duels||{}).wins||0,                      color: '#f9a8d4' },
  ];

  const bwTrend = $('bw-trends');
  if (bwTrend) {
    bwTrend.innerHTML = buildTrendHtml(bwDefs, deduped, 'bw');
    registerCharts('bw-trends', bwDefs, deduped);
    drawPendingCharts('bw-trends');
  }

  const swTrend = $('sw-trends');
  if (swTrend) {
    swTrend.innerHTML = buildTrendHtml(swDefs, deduped, 'sw');
    registerCharts('sw-trends', swDefs, deduped);
    // sw-trends is hidden by default (inner-panel not active) — draw when shown
  }

  const duTrend = $('du-trends');
  if (duTrend) {
    duTrend.innerHTML = buildTrendHtml(duDefs, deduped, 'du');
    registerCharts('du-trends', duDefs, deduped);
  }
}

function drawPendingCharts(containerId) {
  const pending = pendingCharts[containerId];
  if (!pending || pending.drawn) return;
  pending.chartDefs.forEach(c => {
    const data = pending.snaps.map(c.fn);
    drawChart(c.id, pending.labels, data, c.color);
  });
  pending.drawn = true;
}

function buildTrendsEmptyState() {
  return '<div class="empty-state" style="margin-bottom:16px"><p>Recherche ce joueur plusieurs fois pour voir les tendances.</p></div>';
}

const CUSTOM_CHART_METRICS = {
  bw: [
    { key: 'fkdr', label: 'FKDR', fn: s => parseFloat((s.stats.bedwars||{}).fkdr||0) },
    { key: 'wlr', label: 'W/L', fn: s => parseFloat((s.stats.bedwars||{}).wlr||0) },
    { key: 'wins', label: 'Wins', fn: s => (s.stats.bedwars||{}).wins||0 },
    { key: 'finalKills', label: 'Final Kills', fn: s => (s.stats.bedwars||{}).finalKills||0 },
    { key: 'kdr', label: 'K/D', fn: s => parseFloat((s.stats.bedwars||{}).kdr||0) },
    { key: 'star', label: '★ Star', fn: s => (s.stats.bedwars||{}).star||0 },
    { key: 'bblr', label: 'BBLR', fn: s => parseFloat((s.stats.bedwars||{}).bblr||0) },
  ],
  sw: [
    { key: 'kdr', label: 'K/D', fn: s => parseFloat((s.stats.skywars||{}).kdr||0) },
    { key: 'wlr', label: 'W/L', fn: s => parseFloat((s.stats.skywars||{}).wlr||0) },
    { key: 'wins', label: 'Wins', fn: s => (s.stats.skywars||{}).wins||0 },
    { key: 'playtime', label: 'Temps (h)', fn: s => parseFloat((s.stats.skywars||{}).totalPlaytimeHours||0) },
    { key: 'kills', label: 'Kills', fn: s => (s.stats.skywars||{}).kills||0 },
  ],
  du: [
    { key: 'wlr', label: 'W/L', fn: s => parseFloat((s.stats.duels||{}).wlr||0) },
    { key: 'kdr', label: 'K/D', fn: s => parseFloat((s.stats.duels||{}).kdr||0) },
    { key: 'wins', label: 'Wins', fn: s => (s.stats.duels||{}).wins||0 },
    { key: 'games', label: 'Parties', fn: s => (s.stats.duels||{}).gamesPlayed||0 },
    { key: 'kills', label: 'Kills', fn: s => (s.stats.duels||{}).kills||0 },
  ],
};

function buildCustomChartBuilder(game, snaps, currentStats) {
  if (!snaps || snaps.length < 2) return '';
  const metrics = CUSTOM_CHART_METRICS[game] || [];
  const options = metrics.map(m => `<option value="${m.key}">${m.label}</option>`).join('');
  const colors = { bw: '#c4b5fd', sw: '#93c5fd', du: '#f9a8d4' };
  return `
    <div class="custom-chart-builder">
      <div class="section-title" style="margin-top:20px">🔧 Graphique personnalisé</div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
        <select id="custom-metric-${game}" class="custom-select">
          ${options}
        </select>
        <button class="pill-btn" onclick="renderCustomChart('${game}')">Afficher</button>
      </div>
      <div class="prog-chart-wrap" id="custom-chart-wrap-${game}" style="display:none">
        <div class="prog-label" id="custom-chart-label-${game}"></div>
        <canvas id="custom-chart-${game}" height="90"></canvas>
      </div>
    </div>
  `;
}

function renderCustomChart(game) {
  const sel = document.getElementById('custom-metric-' + game);
  if (!sel) return;
  const key = sel.value;
  const metrics = CUSTOM_CHART_METRICS[game] || [];
  const metric = metrics.find(m => m.key === key);
  if (!metric) return;
  // We need snapshots — fetch from state
  window.hytracker.getSnapshots(state.currentPlayer && state.currentPlayer.uuid).then(snaps => {
    if (snaps.length < 2) return;
    const labels = snaps.map(s => new Date(s.ts).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit' }));
    const data = snaps.map(metric.fn);
    const colors = { bw: '#c4b5fd', sw: '#93c5fd', du: '#f9a8d4' };
    const wrap = document.getElementById('custom-chart-wrap-' + game);
    const lbl = document.getElementById('custom-chart-label-' + game);
    if (wrap) wrap.style.display = '';
    if (lbl) lbl.textContent = metric.label;
    setTimeout(() => drawChart('custom-chart-' + game, labels, data, colors[game] || '#c4b5fd'), 30);
  });
}
function drawChart(id, labels, data, color) {
  const canvas = $(id); if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 600; const H = 90;
  canvas.width = W; canvas.height = H;
  const pL=44,pR=12,pT=8,pB=22;
  const w=W-pL-pR; const h=H-pT-pB;
  const mn=Math.min(...data)*0.95; const mx=Math.max(...data)*1.05||1;
  ctx.clearRect(0,0,W,H);
  [0,0.5,1].forEach(t => {
    const y=pT+h*(1-t);
    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(pL,y); ctx.lineTo(pL+w,y); ctx.stroke();
    ctx.fillStyle='rgba(157,150,184,0.6)'; ctx.font='10px JetBrains Mono,monospace'; ctx.textAlign='right';
    ctx.fillText((mn+t*(mx-mn)).toFixed(2),pL-4,y+4);
  });
  if (data.length < 2) return;
  const pts=data.map((v,i)=>({ x:pL+(i/(data.length-1))*w, y:pT+h*(1-(v-mn)/(mx-mn)) }));
  const grad=ctx.createLinearGradient(0,pT,0,pT+h);
  grad.addColorStop(0,color+'44'); grad.addColorStop(1,color+'00');
  ctx.beginPath(); ctx.moveTo(pts[0].x,pT+h);
  pts.forEach(p=>ctx.lineTo(p.x,p.y));
  ctx.lineTo(pts[pts.length-1].x,pT+h); ctx.closePath();
  ctx.fillStyle=grad; ctx.fill();
  ctx.beginPath(); ctx.strokeStyle=color; ctx.lineWidth=2; ctx.lineJoin='round'; ctx.lineCap='round';
  pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y)); ctx.stroke();
  pts.forEach(p=>{ ctx.beginPath(); ctx.arc(p.x,p.y,3,0,Math.PI*2); ctx.fillStyle=color; ctx.fill(); });
  const step=Math.ceil(labels.length/8);
  ctx.fillStyle='rgba(157,150,184,0.7)'; ctx.font='10px Outfit,sans-serif'; ctx.textAlign='center';
  labels.forEach((l,i)=>{ if(i%step===0) ctx.fillText(l,pts[i].x,H-4); });
}

// ── Comparison Panel (Session Stats) ───────────────────────────────────────
async function renderComparisonPanel(uuid, currentStats) {
  const panel = $('tab-comparison');
  const snaps = await window.hytracker.getSnapshots(uuid);
  if (snaps.length < 2) {
    panel.innerHTML = '<div class="empty-state"><p>' + (state.language === 'en' ? 'Need multiple snapshots to compare.' : 'Besoin de plusieurs snapshots pour comparer.') + '</p></div>';
    return;
  }
  
  const prev = snaps[snaps.length - 2];
  const prevStats = prev.stats;
  
  let html = '<div class="section-title">' + (state.language === 'en' ? 'Session Comparison' : 'Comparaison de session') + '</div>';
  html += '<div class="stat-grid">';
  
  const modes = ['bedwars', 'skywars', 'duels'];
  modes.forEach(mode => {
    const curr = currentStats[mode];
    const p = prevStats[mode];
    if (!curr || !p) return;
    
    const winDiff = curr.wins - p.wins;
    const killDiff = curr.kills - p.kills;
    const kdCurr = parseFloat(curr.kdr);
    const kdPrev = parseFloat(p.kdr);
    const kdDiff = (kdCurr - kdPrev).toFixed(2);
    
    const modeName = mode.charAt(0).toUpperCase() + mode.slice(1);
    html += '<div class="compare-stat-block">';
    html += '<div style="font-weight:600;color:var(--lavender);margin-bottom:6px">' + modeName + '</div>';
    html += '<div style="font-size:12px;color:var(--text-secondary)">';
    html += (state.language === 'en' ? 'Wins: ' : 'Wins: ') + '<span style="color:' + (winDiff > 0 ? '#86efac' : '#ff6b6b') + '">' + (winDiff >= 0 ? '+' : '') + winDiff + '</span><br>';
    html += (state.language === 'en' ? 'Kills: ' : 'Kills: ') + '<span style="color:' + (killDiff > 0 ? '#86efac' : '#ff6b6b') + '">' + (killDiff >= 0 ? '+' : '') + killDiff + '</span><br>';
    html += 'K/D: <span style="color:' + (kdDiff > 0 ? '#86efac' : '#ff6b6b') + '">' + (kdDiff >= 0 ? '+' : '') + kdDiff + '</span>';
    html += '</div></div>';
  });
  
  html += '</div>';
  panel.innerHTML = html;
}

// ── Grade Analysis Panel ───────────────────────────────────────────────────
function renderGradeAnalysisPanel(player) {
  const panel = $('tab-gradeanalysis');
  let html = '<div class="section-title">' + (state.language === 'en' ? 'Grade & Rank Analysis' : 'Analyse des grades') + '</div>';
  html += '<div class="stat-grid">';
  
  html += '<div class="stat-card">';
  html += '<div class="stat-label">' + (state.language === 'en' ? 'Rank' : 'Rang') + '</div>';
  html += '<div class="stat-value" style="color:' + (player.rankColor || '#aaa') + '">' + (player.rank || 'Non-rang') + '</div>';
  html += '</div>';
  
  html += '<div class="stat-card">';
  html += '<div class="stat-label">' + (state.language === 'en' ? 'Hypixel Level' : 'Niv. Hypixel') + '</div>';
  html += '<div class="stat-value">' + player.networkLevel + '</div>';
  html += '</div>';
  
  const bw = player.stats.bedwars;
  const sw = player.stats.skywars;
  const du = player.stats.duels;
  
  html += '</div><div class="section-title">' + (state.language === 'en' ? 'Game Progression' : 'Progression par jeu') + '</div>';
  html += '<div class="stat-grid">';
  
  html += sc('BedWars ★', bw.star, 'highlight-bw', (state.language === 'en' ? 'Experience: ' : 'Expérience: ') + fmt(bw.experience));
  html += sc('SkyWars ' + (sw.level || '?'), sw.level || '?', 'highlight-sw', (state.language === 'en' ? 'Prestige: ' : 'Prestige: ') + (sw.prestige || '0'));
  html += sc(state.language === 'en' ? 'Best Winstreak' : 'Meilleur Winstreak', '<div style="display:flex;gap:12px">' + fmt(bw.bestWinstreak) + '<small>BW</small> ' + fmt(du.bestWinstreak) + '<small>DU</small></div>', '');
  
  html += '</div>';
  panel.innerHTML = html;
}

// ── Compare ──────────────────────────────────────────────────────────────────
function setupCompare() {
  $('compare-add-btn').addEventListener('click', () => { if (state.compareQueue.length < 4) state.compareQueue.push(''); rebuildCompareInputs(); });
  $('compare-go-btn').addEventListener('click', doCompare);
  rebuildCompareInputs();
}
function rebuildCompareInputs() {
  if (!state.compareQueue.length) state.compareQueue = ['',''];
  const row = $('compare-input-row'); row.innerHTML = '';
  state.compareQueue.forEach((val, i) => {
    const wrap = el('div','compare-input-wrap');
    const inp = el('input'); inp.type='text'; inp.placeholder='Joueur '+(i+1); inp.value=val;
    inp.addEventListener('input', () => { state.compareQueue[i]=inp.value; });
    wrap.appendChild(inp);
    if (state.compareQueue.length > 2) {
      const rm=el('button','compare-remove','×');
      rm.addEventListener('click', () => { state.compareQueue.splice(i,1); rebuildCompareInputs(); });
      wrap.appendChild(rm);
    }
    row.appendChild(wrap);
  });
  $('compare-add-btn').style.display = state.compareQueue.length >= 4 ? 'none' : '';
}
async function doCompare() {
  const names = state.compareQueue.map(n => n.trim()).filter(Boolean);
  if (names.length < 2) return;
  const results = $('compare-results'); results.innerHTML = '<div class="loading-spin">Chargement…</div>';
  try {
    const players = await window.hytracker.comparePlayers(names);
    results.innerHTML = '';
    const bests = {};
    const metrics = [['bw_fkdr',p=>parseFloat(p.stats&&p.stats.bedwars&&p.stats.bedwars.fkdr||0)],['bw_wins',p=>p.stats&&p.stats.bedwars&&p.stats.bedwars.wins||0],['sw_kdr',p=>parseFloat(p.stats&&p.stats.skywars&&p.stats.skywars.kdr||0)],['du_wlr',p=>parseFloat(p.stats&&p.stats.duels&&p.stats.duels.wlr||0)]];
    metrics.forEach(([k,fn]) => { const vs=players.filter(p=>!p.error).map(fn); bests[k]=Math.max(...vs); });
    players.forEach(p => {
      if (p.error) {
        const c=el('div','compare-card'); c.innerHTML='<div class="compare-card-head"><div class="compare-player-name">'+p.username+'</div></div><div class="compare-error">'+p.error+'</div>';
        results.appendChild(c); return;
      }
      const bw=p.stats.bedwars; const sw=p.stats.skywars; const du=p.stats.duels;
      const c=el('div','compare-card');
      c.innerHTML=`<div class="compare-card-head">
        <img src="https://visage.surgeplay.com/face/40/${p.uuid}" width="40" height="40" style="border-radius:10px;image-rendering:pixelated" onerror="this.src='https://crafatar.com/avatars/${p.uuid}?size=40&overlay=true'">
        <div><div class="compare-player-name">${p.username}</div><div class="compare-player-rank" style="color:${p.rankColor||'#aaa'}">${p.rank||'—'} · Niv. ${p.networkLevel}</div></div></div>
        <div class="compare-mode-label">BedWars</div>
        <div class="compare-stat-row"><span class="compare-stat-key">FKDR</span><span class="compare-stat-val ${parseFloat(bw.fkdr)>=bests.bw_fkdr?'best':''}">${bw.fkdr}</span></div>
        <div class="compare-stat-row"><span class="compare-stat-key">Wins</span><span class="compare-stat-val ${bw.wins>=bests.bw_wins?'best':''}">${fmt(bw.wins)}</span></div>
        <div class="compare-stat-row"><span class="compare-stat-key">BBLR</span><span class="compare-stat-val">${bw.bblr}</span></div>
        <div class="compare-mode-label">SkyWars</div>
        <div class="compare-stat-row"><span class="compare-stat-key">K/D</span><span class="compare-stat-val ${parseFloat(sw.kdr)>=bests.sw_kdr?'best':''}">${sw.kdr}</span></div>
        <div class="compare-stat-row"><span class="compare-stat-key">Wins</span><span class="compare-stat-val">${fmt(sw.wins)}</span></div>
        <div class="compare-stat-row"><span class="compare-stat-key">Temps SW</span><span class="compare-stat-val">${sw.totalPlaytimeHours} h</span></div>
        <div class="compare-mode-label">Duels</div>
        <div class="compare-stat-row"><span class="compare-stat-key">W/L</span><span class="compare-stat-val ${parseFloat(du.wlr)>=bests.du_wlr?'best':''}">${du.wlr}</span></div>
        <div class="compare-stat-row"><span class="compare-stat-key">Best WS</span><span class="compare-stat-val">${fmt(du.bestWinstreak)}</span></div>`;
      results.appendChild(c);
    });
  } catch(e) { results.innerHTML='<div class="compare-error">'+e.message+'</div>'; }
}

// ── Favorites ────────────────────────────────────────────────────────────────
function renderFavorites() {
  const grid = $('favorites-grid');
  if (!state.favorites.length) { grid.innerHTML='<div class="empty-state"><p>Aucun favori. Ajoute des joueurs depuis la recherche.</p></div>'; return; }
  grid.innerHTML='';
  state.favorites.forEach(p => {
    const c=el('div','fav-card');
    const bw=p.stats&&p.stats.bedwars; const sw=p.stats&&p.stats.skywars; const du=p.stats&&p.stats.duels;
    c.innerHTML=`<div class="fav-card-top">
      <img src="https://visage.surgeplay.com/face/40/${p.uuid}" width="40" height="40" onerror="this.src='https://crafatar.com/avatars/${p.uuid}?size=40&overlay=true'">
      <div><div class="fav-name">${p.username}</div><div class="fav-rank">${p.rank||'—'} · Niv. ${p.networkLevel||'?'}</div></div></div>
      <div class="fav-stat">BW FKDR : ${bw?bw.fkdr:'—'}</div>
      <div class="fav-stat">SW K/D : ${sw?sw.kdr:'—'}</div>
      <div class="fav-stat">SW temps : ${sw?sw.totalPlaytimeHours+' h':'—'}</div>
      <div class="fav-stat">Duels W/L : ${du?du.wlr:'—'}</div>
      <button class="fav-remove" data-uuid="${p.uuid}">Retirer des favoris</button>`;
    c.querySelector('.fav-card-top').addEventListener('click', () => { switchPage('search'); doSearch(p.username); });
    c.querySelector('.fav-remove').addEventListener('click', async e => { e.stopPropagation(); state.favorites=await window.hytracker.removeFavorite(p.uuid); renderFavorites(); renderSidebarFavs(); });
    grid.appendChild(c);
  });
}
function renderSidebarFavs() {
  const list=$('sidebar-fav-list'); const section=$('sidebar-favs');
  if (!state.favorites.length) { section.classList.add('hidden'); return; }
  section.classList.remove('hidden'); list.innerHTML='';
  state.favorites.slice(0,6).forEach(p => {
    const item=el('div','sidebar-fav-item');
    item.innerHTML=`<img src="https://visage.surgeplay.com/face/16/${p.uuid}" width="16" height="16" style="border-radius:3px;image-rendering:pixelated" onerror="this.src='https://crafatar.com/avatars/${p.uuid}?size=16&overlay=true'"><span>${p.username}</span>`;
    item.addEventListener('click', () => { switchPage('search'); doSearch(p.username); });
    list.appendChild(item);
  });
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
function setupLeaderboard() {
  const gameButtons = document.querySelectorAll('.leaderboard-filter');
  const metricButtons = document.querySelectorAll('.leaderboard-metric');
  
  gameButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      gameButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      refreshLeaderboard();
    });
  });
  
  metricButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      metricButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      refreshLeaderboard();
    });
  });
}

function refreshLeaderboard() {
  const gameFilter = document.querySelector('.leaderboard-filter.active')?.dataset.game || 'bedwars';
  const metricFilter = document.querySelector('.leaderboard-metric.active')?.dataset.metric || 'fkdr';
  
  const list = $('leaderboard-list');
  list.innerHTML = '';
  
  // Collect leaderboard data from current favorites and searched players
  const players = [...state.favorites];
  if (state.currentPlayer) players.unshift(state.currentPlayer);
  
  if (!players.length) {
    list.innerHTML = '<div style="text-align:center;color:#999;padding:40px">Aucun joueur. Cherche des joueurs d\'abord.</div>';
    return;
  }
  
  // Build leaderboard entries
  const entries = [];
  players.forEach((p, i) => {
    let value = 0;
    let game = null;
    
    if (gameFilter === 'bedwars' && p.bedwars) {
      game = p.bedwars;
      if (metricFilter === 'fkdr') value = parseFloat(p.bedwars.fkdr) || 0;
      else if (metricFilter === 'wl') value = parseFloat(p.bedwars.wlr) || 0;
      else if (metricFilter === 'kd') value = parseFloat(p.bedwars.kdGlobal) || 0;
      else if (metricFilter === 'wins') value = p.bedwars.wins || 0;
    } else if (gameFilter === 'skywars' && p.skywars) {
      game = p.skywars;
      if (metricFilter === 'fkdr') value = parseFloat(p.skywars.kdTotal) || 0;
      else if (metricFilter === 'wl') value = parseFloat(p.skywars.wlr) || 0;
      else if (metricFilter === 'kd') value = parseFloat(p.skywars.kdTotal) || 0;
      else if (metricFilter === 'wins') value = p.skywars.wins || 0;
    } else if (gameFilter === 'duels' && p.duels) {
      game = p.duels;
      if (metricFilter === 'fkdr') value = parseFloat(p.duels.kdr) || 0;
      else if (metricFilter === 'wl') value = parseFloat(p.duels.wlr) || 0;
      else if (metricFilter === 'kd') value = parseFloat(p.duels.kdr) || 0;
      else if (metricFilter === 'wins') value = p.duels.wins || 0;
    } else if (gameFilter === 'overall') {
      if (metricFilter === 'wins') {
        const bw = p.bedwars?.wins || 0;
        const sw = p.skywars?.wins || 0;
        const du = p.duels?.wins || 0;
        value = bw + sw + du;
      } else if (metricFilter === 'kd') {
        const bw = parseFloat(p.bedwars?.kdGlobal) || 0;
        const sw = parseFloat(p.skywars?.kdTotal) || 0;
        const du = parseFloat(p.duels?.kdr) || 0;
        value = (bw + sw + du) / 3;
      }
    }
    
    if (game || gameFilter === 'overall') {
      entries.push({ player: p, value, rank: 0 });
    }
  });
  
  // Sort and assign ranks
  entries.sort((a, b) => b.value - a.value);
  entries.forEach((e, i) => e.rank = i + 1);
  
  // Render leaderboard
  entries.slice(0, 20).forEach(e => {
    const entry = el('div', 'leaderboard-entry');
    const rankClass = e.rank <= 3 ? `rank-${e.rank}` : '';
    entry.innerHTML = `
      <div class="leaderboard-rank ${rankClass}">${e.rank}</div>
      <div class="leaderboard-player">
        <img src="https://visage.surgeplay.com/face/24/${e.player.uuid}" width="24" height="24" style="border-radius:4px;image-rendering:pixelated;vertical-align:middle" onerror="this.src='https://crafatar.com/avatars/${e.player.uuid}?size=24&overlay=true'">
        <div style="display:inline-block;margin-left:8px">
          <div class="leaderboard-player-name">${e.player.username}</div>
          <div class="leaderboard-player-sub">${gameFilter.toUpperCase()} · ${metricFilter.toUpperCase()}</div>
        </div>
      </div>
      <div class="leaderboard-stat">
        <div class="leaderboard-stat-label">${metricFilter.toUpperCase()}</div>
        <div class="leaderboard-stat-value">${e.value.toFixed(2)}</div>
      </div>
    `;
    entry.addEventListener('click', () => { switchPage('search'); doSearch(e.player.username); });
    list.appendChild(entry);
  });
}

function getMsLogoSvg() {
  return '<svg width="16" height="16" viewBox="0 0 16 16" fill="white" style="display:inline;margin-right:8px"><rect x="1" y="1" width="6" height="6" fill="white"/><rect x="9" y="1" width="6" height="6" fill="white"/><rect x="1" y="9" width="6" height="6" fill="white"/><rect x="9" y="9" width="6" height="6" fill="white"/></svg>';
}

function setLanguage(lang) {
  state.language = lang;
  localStorage.setItem('hytracker_lang', lang);
  updateLanguageUI();
  // Refresh current player card if visible
  if (state.currentPlayer) renderPlayerCard(state.currentPlayer);
}

function updateLanguageUI() {
  $('btn-lang-fr').classList.toggle('active', state.language === 'fr');
  $('btn-lang-en').classList.toggle('active', state.language === 'en');
  
  const isEn = state.language === 'en';

  // Sidebar nav labels
  const navLabels = {
    search:      isEn ? 'Search'      : 'Recherche',
    compare:     isEn ? 'Compare'     : 'Comparaison',
    favorites:   isEn ? 'Favorites'   : 'Favoris',
    leaderboard: isEn ? 'Leaderboard' : 'Classement',
    settings:    isEn ? 'Settings'    : 'Paramètres',
  };
  document.querySelectorAll('.nav-item [data-label]').forEach(span => {
    const key = span.dataset.label;
    if (navLabels[key]) span.textContent = navLabels[key];
  });

  // Settings page labels
  if ($('label-api')) $('label-api').textContent = isEn ? 'Hypixel API Key' : 'Clé API Hypixel';
  if ($('desc-api')) $('desc-api').innerHTML = isEn ? 'Get your key at <a href="#" id="link-dev" class="hy-link">developer.hypixel.net</a>' : 'Obtiens ta clé sur <a href="#" id="link-dev" class="hy-link">developer.hypixel.net</a>';
  if ($('label-rate')) $('label-rate').textContent = isEn ? 'API Usage' : 'Utilisation de l\'API';
  if ($('desc-rate')) $('desc-rate').textContent = isEn ? '300 requests per 5-minute window' : '300 requêtes par fenêtre de 5 minutes';
  
  // Re-bind dev link (recreated by innerHTML)
  const linkDev = $('link-dev');
  if (linkDev) linkDev.addEventListener('click', e => { e.preventDefault(); window.hytracker.openExternal('https://developer.hypixel.net'); });
}

// ── Rate ──────────────────────────────────────────────────────────────────────
function startRatePoll() { updateRate(); setInterval(updateRate,5000); }
async function updateRate() {
  try {
    const r=await window.hytracker.getRateStatus();
    const p=Math.round((r.used/r.max)*100);
    $('rate-bar-fill').style.width=p+'%';
    $('rate-bar-fill').style.background=p>75?'linear-gradient(90deg,#fde68a,#fdba74)':p>50?'linear-gradient(90deg,#86efac,#fde68a)':'linear-gradient(90deg,#86efac,#c4b5fd)';
    $('rate-text').textContent=r.used+'/300';
  } catch(_) {}
}
function updateRateDetail() {
  window.hytracker.getRateStatus().then(r => {
    const p=Math.round((r.used/r.max)*100);
    $('rate-detail-fill').style.width=p+'%';
    $('rate-detail-text').textContent=r.used+' requêtes utilisées · '+r.remaining+' disponibles · fenêtre 5 min';
  }).catch(()=>{});
}