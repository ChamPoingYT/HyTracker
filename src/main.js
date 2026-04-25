const { autoUpdater } = require('electron-updater');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const https = require('https');
const fs = require('fs');

const DB_PATH = path.join(app.getPath('userData'), 'hytracker_data.json');

function loadDB() {
  try { if (fs.existsSync(DB_PATH)) return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch (_) {}
  return { favorites: [], snapshots: {}, settings: { apiKey: '' } };
}
function saveDB(data) { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); }
let db = loadDB();

const cache = new Map();
function getCached(key, ttlMs) {
  const e = cache.get(key);
  return (e && Date.now() - e.ts < ttlMs) ? e.data : null;
}
function setCache(key, data) { cache.set(key, { data, ts: Date.now() }); }

const reqTimes = [];
function canRequest() {
  const now = Date.now();
  while (reqTimes.length && now - reqTimes[0] > 300000) reqTimes.shift();
  return reqTimes.length < 295;
}
function recordRequest() { reqTimes.push(Date.now()); }
function getRateStatus() {
  const now = Date.now();
  while (reqTimes.length && now - reqTimes[0] > 300000) reqTimes.shift();
  return { used: reqTimes.length, max: 300, remaining: 300 - reqTimes.length };
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'HyTracker/1.0' } }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => { try { resolve(JSON.parse(body)); } catch (e) { reject(new Error('JSON parse error')); } });
    }).on('error', reject);
  });
}

async function getUUID(username) {
  const cacheKey = 'uuid_' + username.toLowerCase();
  const cached = getCached(cacheKey, 86400000);
  if (cached) return cached;
  const data = await fetchJson('https://api.mojang.com/users/profiles/minecraft/' + username);
  if (data && data.id) { setCache(cacheKey, data.id); return data.id; }
  throw new Error('Joueur introuvable');
}

async function hypixelGet(endpoint, params, ttlMs = 300000) {
  const apiKey = db.settings.apiKey;
  if (!apiKey) throw new Error('Clé API manquante');
  if (!canRequest()) throw new Error('Rate limit atteint, patiente quelques secondes');
  const cacheKey = endpoint + '_' + params;
  const cached = getCached(cacheKey, ttlMs);
  if (cached) return cached;
  recordRequest();
  const data = await fetchJson('https://api.hypixel.net/v2/' + endpoint + '?' + params + '&key=' + apiKey);
  if (!data.success) throw new Error(data.cause || 'Erreur API Hypixel');
  setCache(cacheKey, data);
  return data;
}

// ── helpers ───────────────────────────────────────────────────────────────────
const ratio = (a, b) => b > 0 ? (a / b).toFixed(2) : (a > 0 ? a.toFixed(2) : '0.00');
function cleanName(s) { return s.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase()); }
function sumKeys(obj, pattern) {
  let t = 0;
  for (const k of Object.keys(obj)) { if (k.match(pattern)) t += obj[k] || 0; }
  return t;
}
function extractKitData(obj, pattern, labelFn, unit) {
  const result = [];
  for (const k of Object.keys(obj)) {
    const m = k.match(pattern);
    if (!m) continue;
    const raw = obj[k] || 0;
    if (raw <= 0) continue;
    const name = labelFn(m, k);
    if (!name) continue;
    const value = unit === 'seconds' ? parseFloat((raw/3600).toFixed(2)) : raw;
    result.push({ name, value, raw });
  }
  return result.sort((a,b) => b.value - a.value);
}

// ── BedWars star formula ───────────────────────────────────────────────────────
function calcBwStar(exp) {
  const EASY = [500,1000,2000,3500];
  let lvl = 0;
  let e = exp;
  for (const req of EASY) { if (e >= req) { e -= req; lvl++; } else return lvl; }
  return lvl + Math.floor(e / 5000);
}

// ── SkyWars level helpers ──────────────────────────────────────────────────────
function cleanSkywarsLevel(levelFormatted) {
  if (!levelFormatted) return null;
  // Remove Minecraft color codes (§X pattern)
  const cleaned = String(levelFormatted).replace(/§./g, '').trim();
  return cleaned || null;
}

function getSkywarsPrestigeColor(levelString) {
  const level = parseInt(levelString) || 0;
  const prestige = Math.floor(level / 5);
  
  const colorMap = {
    0: '#808080',   // Gray
    1: '#FFAA00',   // Gold
    2: '#00AA00',   // Green
    3: '#00AAAA',   // Aqua
    4: '#0055FF',   // Blue
    5: '#AA00AA',   // Purple
    6: '#FF5555',   // Red
    7: '#FF55FF',   // Pink
    8: '#55FF55',   // Light Green
    9: '#FFFFFF'    // White
  };
  
  return colorMap[Math.min(prestige, 9)] || '#808080';
}

// ── Main stats extraction ─────────────────────────────────────────────────────
function extractStats(player) {
  const bw = player.stats && player.stats.Bedwars   ? player.stats.Bedwars   : {};
  const sw = player.stats && player.stats.SkyWars   ? player.stats.SkyWars   : {};
  const d  = player.stats && player.stats.Duels     ? player.stats.Duels     : {};
  const pit= player.stats && player.stats.Pit       ? player.stats.Pit       : {};
  const murder = player.stats && player.stats.MurderMystery ? player.stats.MurderMystery : {};
  const build  = player.stats && player.stats.BuildBattle   ? player.stats.BuildBattle   : {};
  const tnt    = player.stats && player.stats.TNTGames      ? player.stats.TNTGames      : {};
  const bsg    = player.stats && player.stats.BSG           ? player.stats.BSG           : {};
  const arcade = player.stats && player.stats.Arcade        ? player.stats.Arcade        : {};

  // ── BedWars ──
  const bwModes = [
    { key:'eight_one',  label:'Solo'      },
    { key:'eight_two',  label:'Doubles'   },
    { key:'four_three', label:'3v3v3v3'   },
    { key:'four_four',  label:'4v4v4v4'   },
    { key:'two_four',   label:'4v4'       },
  ];
  const bedwars = {
    star:       calcBwStar(bw.Experience || 0),
    experience: bw.Experience || 0,
    finalKills:  bw.final_kills_bedwars  || 0,
    finalDeaths: bw.final_deaths_bedwars || 0,
    kills:       bw.kills_bedwars        || 0,
    deaths:      bw.deaths_bedwars       || 0,
    wins:        bw.wins_bedwars         || 0,
    losses:      bw.losses_bedwars       || 0,
    bedsBroken:  bw.beds_broken_bedwars  || 0,
    bedsLost:    bw.beds_lost_bedwars    || 0,
    winstreak:   bw.winstreak            || 0,
    bestWinstreak: bw.best_winstreak     || 0,
    gamesPlayed: bw.games_played_bedwars || 0,
    itemsPurchased: bw.items_purchased_bedwars || 0,
    iron:     bw.iron_resources_collected_bedwars    || 0,
    gold:     bw.gold_resources_collected_bedwars    || 0,
    diamonds: bw.diamond_resources_collected_bedwars || 0,
    emeralds: bw.emerald_resources_collected_bedwars || 0,
    coins:    bw.coins || 0,
    practice: {
      bridgeAttempts:  bw.practice_bridging_attempts  || 0,
      bridgeFails:     bw.practice_bridging_fails      || 0,
      bridgeSuccesses: bw.practice_bridging_successes  || 0,
    },
    modes: bwModes.map(function(m) {
      const k = m.key;
      return {
        name:        m.label,
        wins:        bw[k+'_wins_bedwars']         || 0,
        losses:      bw[k+'_losses_bedwars']       || 0,
        finalKills:  bw[k+'_final_kills_bedwars']  || 0,
        finalDeaths: bw[k+'_final_deaths_bedwars'] || 0,
        bedsBroken:  bw[k+'_beds_broken_bedwars']  || 0,
        bedsLost:    bw[k+'_beds_lost_bedwars']    || 0,
      };
    }).filter(function(m) { return m.wins+m.losses+m.finalKills > 0; }),
  };
  bedwars.fkdr = ratio(bedwars.finalKills, bedwars.finalDeaths);
  bedwars.kdr  = ratio(bedwars.kills, bedwars.deaths);
  bedwars.wlr  = ratio(bedwars.wins, bedwars.losses);
  bedwars.bblr = ratio(bedwars.bedsBroken, bedwars.bedsLost);
  bedwars.resourcesCollected = bedwars.iron + bedwars.gold + bedwars.diamonds + bedwars.emeralds;
  bedwars.modes.forEach(function(m) {
    m.fkdr = ratio(m.finalKills, m.finalDeaths);
    m.wlr  = ratio(m.wins, m.losses);
    m.bblr = ratio(m.bedsBroken, m.bedsLost);
  });

  // ── SkyWars ──
  const swTotalTimeSec  = sumKeys(sw, /^time_played_kit_/);
  const swDirectTime    = sw.time_played || 0;
  const swTotalTime     = Math.max(swTotalTimeSec, swDirectTime);
  const swKitTimeSolo   = extractKitData(sw, /^time_played_kit_(.+)_solo$/, function(m){ return cleanName(m[1]); }, 'seconds');
  const swKitTimeTeam   = extractKitData(sw, /^time_played_kit_(.+)_team$/, function(m){ return cleanName(m[1]); }, 'seconds');
  const swKitWinsSolo   = extractKitData(sw, /^wins_kit_(.+)_solo$/,        function(m){ return cleanName(m[1]); }, 'raw');
  const swKitWinsTeam   = extractKitData(sw, /^wins_kit_(.+)_team$/,        function(m){ return cleanName(m[1]); }, 'raw');
  const swSoloTime      = swKitTimeSolo.reduce((s, k) => s + k.value, 0);
  const swTeamTime      = swKitTimeTeam.reduce((s, k) => s + k.value, 0);

  // ── SkyWars packages array (newer API format) ──
  const swPackages = sw.packages || [];
  const swKitPackages = swPackages.map(p => {
    const m = p.match(/^skywars_kit_(.+?)_(basic|rookie|experienced|elite|champion)$/);
    if (!m) return null;
    const kitName = cleanName(m[1]);
    const tier = m[2];
    return { kitName, tier, raw: p };
  }).filter(Boolean);

  const swKitDetailMap = {};
  for (const k of Object.keys(sw)) {
    const m = k.match(/^skywars_kit_(.+?)_(solo|team)_(wins|kills|deaths|losses)$/);
    if (m) {
      const kitName = cleanName(m[1]);
      const mode = m[2];
      const stat = m[3];
      if (!swKitDetailMap[kitName]) swKitDetailMap[kitName] = {};
      if (!swKitDetailMap[kitName][mode]) swKitDetailMap[kitName][mode] = {};
      swKitDetailMap[kitName][mode][stat] = sw[k] || 0;
    }
    const m2 = k.match(/^skywars_kit_(.+?)_(wins|kills|deaths|losses)$/);
    if (m2 && !k.match(/_(solo|team)_/)) {
      const kitName = cleanName(m2[1]);
      const stat = m2[2];
      if (!swKitDetailMap[kitName]) swKitDetailMap[kitName] = {};
      if (!swKitDetailMap[kitName]['overall']) swKitDetailMap[kitName]['overall'] = {};
      swKitDetailMap[kitName]['overall'][stat] = sw[k] || 0;
    }
  }

  const swKitList = swKitPackages.length > 0 ? swKitPackages.map(pkg => {
    const d = swKitDetailMap[pkg.kitName] || {};
    const soloWins = (d.solo && d.solo.wins) || 0;
    const teamWins = (d.team && d.team.wins) || 0;
    const totalWins = soloWins + teamWins;
    const soloKills = (d.solo && d.solo.kills) || 0;
    const teamKills = (d.team && d.team.kills) || 0;
    return {
      name: pkg.kitName,
      tier: pkg.tier,
      wins: totalWins,
      soloWins, teamWins,
      kills: soloKills + teamKills,
    };
  }).filter(k => k.wins + k.kills > 0).sort((a, b) => b.wins - a.wins) : [];

  const swLevelCleaned = cleanSkywarsLevel(sw.levelFormatted);

  function calcSwLevel(xp) {
    const xps = [0,20,70,150,250,500,1000,2000,3500,6000,10000,15000];
    if (xp >= 15000) return (xp - 15000) / 10000 + 12;
    for (let i = 1; i < xps.length; i++) {
      if (xp < xps[i]) return i + (xp - xps[i-1]) / (xps[i] - xps[i-1]);
    }
    return 12;
  }
  const swXp = sw.experience || 0;
  const swPreciseLevel = parseFloat(calcSwLevel(swXp).toFixed(4));
  const swIntLevel = Math.floor(swPreciseLevel);

  const skywars = {
    level:        swLevelCleaned || String(swIntLevel),
    preciseLevel: swPreciseLevel,
    levelColor:   getSkywarsPrestigeColor(swLevelCleaned || String(swIntLevel)),
    experience:   swXp,
    prestige:     sw.selected_prestige || null,
    coins:        sw.coins || 0,
    kills:        sw.kills   || 0,
    deaths:       sw.deaths  || 0,
    assists:      sw.assists || 0,
    wins:         sw.wins    || 0,
    losses:       sw.losses  || 0,
    winstreak:    sw.win_streak      || 0,
    bestWinstreak:sw.highestWinstreak|| 0,
    soloKills:    sw.kills_solo  || 0,
    soloDeaths:   sw.deaths_solo || 0,
    soloWins:     sw.wins_solo   || 0,
    soloLosses:   sw.losses_solo || 0,
    soloNormalWins: sw.wins_solo_normal || 0,
    soloInsaneWins: sw.wins_solo_insane || 0,
    teamKills:    sw.kills_team  || 0,
    teamDeaths:   sw.deaths_team || 0,
    teamWins:     sw.wins_team   || 0,
    teamLosses:   sw.losses_team || 0,
    teamNormalWins: sw.wins_team_normal || 0,
    teamInsaneWins: sw.wins_team_insane || 0,
    miniWins:     sw.wins_mini  || 0,
    megaWins:     sw.wins_mega   || 0,
    megaKills:    sw.kills_mega  || 0,
    labWins:      sw.wins_lab    || 0,
    rankedWins:   sw.wins_ranked || 0,
    heads:        sw.heads || 0,
    totalPlaytimeHours: (swTotalTime / 3600).toFixed(1),
    soloPlaytimeHours: (swSoloTime / 3600).toFixed(1),
    teamPlaytimeHours: (swTeamTime / 3600).toFixed(1),
    totalPlaytimeSec: swTotalTime,
    kitTimeSolo:  swKitTimeSolo,
    kitTimeTeam:  swKitTimeTeam,
    kitWinsSolo:  swKitWinsSolo,
    kitWinsTeam:  swKitWinsTeam,
    kitList:      swKitList,
    chestsOpened: sw.chests_opened || sumKeys(sw, /^chests_opened/),
    arrows:       sw.arrows_shot || 0,
    arrowHits:    sw.arrows_hit  || 0,
    souls:        sw.souls || 0,
    soulWell:     sw.soul_well || 0,
    gamesPlayed:  sw.games_played_skywars || 0,
    currentKit:   sw.activeKit || sw.selected_kit || '—',
    quits:        sumKeys(sw, /^quits/),
  };
  skywars.kdr  = ratio(skywars.kills,  skywars.deaths);
  skywars.wlr  = ratio(skywars.wins,   skywars.losses);
  skywars.arrowAccuracy = ratio(skywars.arrowHits, skywars.arrows) + '%';
  skywars.soloKdr = ratio(skywars.soloKills, skywars.soloDeaths);
  skywars.soloWlr = ratio(skywars.soloWins,  skywars.soloLosses);
  skywars.teamKdr = ratio(skywars.teamKills, skywars.teamDeaths);
  skywars.teamWlr = ratio(skywars.teamWins,  skywars.teamLosses);

  // ── Duels ──
  const DUEL_MODES = [
    ['bridge_duel','Bridge 1v1'],['bridge_doubles','Bridge 2v2'],['bridge_four','Bridge 4v4'],
    ['bridge_2v2v2v2','Bridge 2v2v2v2'],['bridge_3v3v3v3','Bridge 3v3v3v3'],
    ['uhc_duel','UHC 1v1'],['uhc_doubles','UHC 2v2'],['uhc_four','UHC 4v4'],['uhc_meetup','UHC Meetup'],
    ['skywars_duel','SkyWars 1v1'],['skywars_doubles','SkyWars 2v2'],
    ['op_duel','OP 1v1'],['op_doubles','OP 2v2'],
    ['classic_duel','Classic'],['combo_duel','Combo'],['bowspleef_duel','BowSpleef'],
    ['bow_duel','Bow'],['boxing_duel','Boxing'],['sumo_duel','Sumo'],
    ['potion_duel','NoDebuff'],['mw_duel','MegaWalls 1v1'],['mw_doubles','MegaWalls 2v2'],
    ['blitz_duel','Blitz'],['tnt_duel','TNT'],['parkour_eight','Parkour'],
  ];
  const duels = {
    wins:    d.wins   || 0,
    losses:  d.losses || 0,
    kills:   d.kills  || 0,
    deaths:  d.deaths || 0,
    winstreak:     d.current_winstreak      || 0,
    bestWinstreak: d.best_overall_winstreak || 0,
    gamesPlayed:   d.games_played_duels     || 0,
    coins:         d.coins || 0,
    meleeHits:     d.melee_hits   || 0,
    meleeSwings:   d.melee_swings || 0,
    arrowsShot:    d.bow_shots || 0,
    arrowsHit:     d.bow_hits  || 0,
    goldenApples:  d.golden_apples_eaten || 0,
    breakdown: DUEL_MODES.map(function(pair) {
      const key = pair[0]; const label = pair[1];
      const w = d[key+'_wins']||0; const l = d[key+'_losses']||0;
      const k = d[key+'_kills']||0; const de = d[key+'_deaths']||0;
      return { name:label, wins:w, losses:l, kills:k, deaths:de,
        wlr: ratio(w,l), kdr: ratio(k,de) };
    }).filter(function(m){ return m.wins+m.losses+m.kills > 0; }),
  };
  duels.wlr  = ratio(duels.wins,   duels.losses);
  duels.kdr  = ratio(duels.kills,  duels.deaths);
  duels.meleeAccuracy  = ratio(duels.meleeHits,  duels.meleeSwings) + '%';
  duels.arrowAccuracy  = ratio(duels.arrowsHit,  duels.arrowsShot)  + '%';

  // ── Pit ──
  const pitProfile = (pit.profile && pit.profile.data) ? pit.profile.data : (pit.profile || {});
  const pitStats = {
    kills:         pitProfile.kills          || pit.kills           || 0,
    deaths:        pitProfile.deaths         || pit.deaths          || 0,
    assists:       pitProfile.assists        || pit.assists         || 0,
    joins:         pitProfile.joins          || pit.joins           || 0,
    xp:            pitProfile.xp             || pit.exp_earned      || 0,
    highestStreak: pitProfile.max_streak     || pit.max_streak      || 0,
    gold:          pitProfile.gold           || 0,
    playtime:      pitProfile.playtime_minutes || 0,
    chatMessages:  pitProfile.chat_messages  || 0,
    contractsCompleted: pitProfile.contracts_completed || 0,
    mysticDust:    pitProfile.items_enchanted || 0,
    kdr: ratio(pitProfile.kills || pit.kills || 0, pitProfile.deaths || pit.deaths || 1),
  };

  // ── Murder Mystery ──
  const mmStats = {
    coins:  murder.coins  || 0,
    kills:  murder.kills  || 0,
    deaths: murder.deaths || 0,
    wins:   murder.wins   || 0,
    games:  murder.games  || 0,
    murdererWins:  murder.murderer_wins  || 0,
    detectiveWins: murder.detective_wins || 0,
    knifeKills:    murder.knife_kills    || 0,
    bowKills:      murder.bow_kills      || 0,
    thrownKills:   murder.thrown_knife_kills || 0,
    heroes:        murder.was_hero || 0,
    kdr: ratio(murder.kills||0, murder.deaths||1),
    wlr: ratio(murder.wins||0, (murder.games||0)-(murder.wins||0)),
  };

  // ── Build Battle ──
  const bbStats = {
    coins:          build.coins          || 0,
    score:          build.score          || 0,
    wins:           build.wins           || 0,
    gamesPlayed:    build.games_played   || 0,
    totalVotes:     build.total_votes    || 0,
    correctGuesses: build.correct_guesses|| 0,
    superVotes:     build.super_votes    || 0,
  };

  // ── TNT Games ──
  const tntStats = {
    coins:        tnt.coins          || 0,
    winsRun:      tnt.wins_tntrun    || 0,
    winsPvp:      tnt.wins_pvprun    || 0,
    winsBow:      tnt.wins_bowspleef || 0,
    winsTag:      tnt.wins_tntag     || 0,
    recordRun:    tnt.record_tntrun  || 0,
    killsTag:     tnt.kills_tntag    || 0,
  };

  // ── Blitz SG ──
  const bsgStats = {
    coins:  bsg.coins  || 0,
    kills:  bsg.kills  || 0,
    deaths: bsg.deaths || 0,
    wins:   bsg.wins   || 0,
    kdr: ratio(bsg.kills||0, bsg.deaths||1),
    kits: extractKitData(bsg, /^kit_wins_(.+)$/, function(m){ return cleanName(m[1]); }, 'raw').slice(0,10),
  };

  return { bedwars, skywars, duels, pit:pitStats, murderMystery:mmStats, buildBattle:bbStats, tntGames:tntStats, blitzSG:bsgStats };
}

function getrank(player) {
  if (player.rank && player.rank !== 'NORMAL') return player.rank;
  if (player.monthlyPackageRank && player.monthlyPackageRank !== 'NONE') return 'MVP++';
  if (player.newPackageRank) return player.newPackageRank.replace(/_PLUS$/, '+').replace(/^MVP_PLUS$/, 'MVP+');
  if (player.packageRank) return player.packageRank.replace(/_PLUS$/, '+').replace(/^MVP_PLUS$/, 'MVP+');
  return 'Non-rang';
}
function getRankColor(rank) {
  const map = {
    'ADMIN':     '#ff5555',
    'MODERATOR': '#55ff55',
    'HELPER':    '#5555ff',
    'YT':        '#ff5555',
    'MVP++':     '#ffaa00',
    'MVP+':      '#55ffff',
    'MVP':       '#55ffff',
    'VIP+':      '#55ff55',
    'VIP':       '#55ff55',
    'Non-rang':  '#aaaaaa',
  };
  return map[rank] || '#aaaaaa';
}
function getNetworkLevel(player) {
  const exp = player.networkExp || 0;
  return Math.floor(1 + (-8750 + Math.sqrt(8750 * 8750 + 5000 * exp)) / 2500);
}
function getFirstLogin(player) {
  if (!player.firstLogin) return null;
  return new Date(player.firstLogin).toLocaleDateString('fr-FR');
}
function getLastLogin(player) {
  if (!player.lastLogin) return null;
  return new Date(player.lastLogin).toLocaleDateString('fr-FR');
}

// ── IPC handlers ──────────────────────────────────────────────────────────────
ipcMain.handle('get-api-key', () => db.settings.apiKey);
ipcMain.handle('set-api-key', (_, key) => { db.settings.apiKey = key.trim(); saveDB(db); return true; });
ipcMain.handle('get-rate-status', () => getRateStatus());

ipcMain.handle('search-player', async (_, username) => {
  const uuid = await getUUID(username);
  const [playerData, statusData] = await Promise.all([
    hypixelGet('player', 'uuid='+uuid, 300000),
    hypixelGet('status', 'uuid='+uuid, 30000).catch(() => null),
  ]);
  const player = playerData.player;
  if (!player) throw new Error('Joueur sans données Hypixel');
  const stats = extractStats(player);
  const status = statusData && statusData.session ? statusData.session : null;
  const snap = { ts: Date.now(), stats };
  if (!db.snapshots[uuid]) db.snapshots[uuid] = [];
  db.snapshots[uuid].push(snap);
  if (db.snapshots[uuid].length > 200) db.snapshots[uuid] = db.snapshots[uuid].slice(-200);
  saveDB(db);
  return {
    uuid,
    username:     player.displayname,
    rank:         getrank(player),
    rankColor:    getRankColor(getrank(player)),
    stats,
    status,
    networkLevel: getNetworkLevel(player),
    firstLogin:   getFirstLogin(player),
    lastLogin:    getLastLogin(player),
    karma:        player.karma || 0,
    achievementPoints: player.achievementPoints || 0,
    mostRecentGameType: player.mostRecentGameType || null,
    language:     player.userLanguage || 'ENGLISH',
  };
});

ipcMain.handle('get-recent-games', async (_, uuid) => {
  const data = await hypixelGet('recentgames', 'uuid='+uuid, 120000);
  return data.games || [];
});
ipcMain.handle('get-snapshots', (_, uuid) => db.snapshots[uuid] || []);
ipcMain.handle('get-favorites', () => db.favorites);
ipcMain.handle('add-favorite', (_, player) => {
  if (!db.favorites.find(f => f.uuid === player.uuid)) {
    db.favorites.unshift(player);
    if (db.favorites.length > 50) db.favorites.pop();
    saveDB(db);
  }
  return db.favorites;
});
ipcMain.handle('remove-favorite', (_, uuid) => {
  db.favorites = db.favorites.filter(f => f.uuid !== uuid);
  saveDB(db);
  return db.favorites;
});
ipcMain.handle('compare-players', async (_, usernames) => {
  const results = await Promise.all(usernames.map(async u => {
    try {
      const uuid = await getUUID(u);
      const data = await hypixelGet('player', 'uuid='+uuid, 300000);
      const p = data.player;
      return { uuid, username: p.displayname, rank: getrank(p), rankColor: getRankColor(getrank(p)), stats: extractStats(p), networkLevel: getNetworkLevel(p) };
    } catch (e) { return { error: e.message, username: u }; }
  }));
  return results;
});

// ── Window ────────────────────────────────────────────────────────────────────
function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 820, minWidth: 960, minHeight: 640,
    frame: false, titleBarStyle: 'hidden', backgroundColor: '#13111a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false,
    },
    show: false,
  });
  win.loadFile(path.join(__dirname, 'renderer/index.html'));
  win.once('ready-to-show', () => win.show());
  ipcMain.handle('window-minimize', () => win.minimize());
  ipcMain.handle('window-maximize', () => { win.isMaximized() ? win.unmaximize() : win.maximize(); });
  ipcMain.handle('window-close', () => win.close());
  ipcMain.handle('open-external', (_, url) => shell.openExternal(url));
}

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

// ── Auto-updater ──────────────────────────────────────────────────────────────
function sendToRenderer(channel, data) {
  BrowserWindow.getAllWindows()[0]?.webContents.send(channel, data);
}

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.on('checking-for-update', () => {
  console.log('[updater] Vérification des mises à jour...');
  sendToRenderer('update-status', { status: 'checking' });
});

autoUpdater.on('update-available', (info) => {
  console.log('[updater] Mise à jour disponible :', info.version);
  sendToRenderer('update-status', {
    status: 'available',
    version: info.version,
    releaseDate: info.releaseDate || null,
    releaseNotes: info.releaseNotes || null,
  });
});

autoUpdater.on('update-not-available', (info) => {
  console.log('[updater] Aucune mise à jour :', info.version);
  sendToRenderer('update-status', {
    status: 'not-available',
    version: info.version,
  });
});

autoUpdater.on('download-progress', (progress) => {
  console.log('[updater] Téléchargement :', Math.round(progress.percent) + '%');
  sendToRenderer('update-status', {
    status: 'downloading',
    percent:       Math.round(progress.percent),
    transferred:   progress.transferred,
    total:         progress.total,
    bytesPerSecond:progress.bytesPerSecond,
  });
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('[updater] Mise à jour téléchargée :', info.version);
  sendToRenderer('update-status', {
    status: 'downloaded',
    version: info.version,
  });
});

autoUpdater.on('error', (err) => {
  console.error('[updater] Erreur :', err.message);
  sendToRenderer('update-status', {
    status: 'error',
    message: err.message,
  });
});

// Déclenché par le renderer quand l'utilisateur clique "Redémarrer"
ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall();
});

// Permet au renderer de forcer une vérification manuelle
ipcMain.handle('check-for-updates', () => {
  autoUpdater.checkForUpdates();
});

// Expose la version actuelle de l'app au renderer
ipcMain.handle('get-app-version', () => app.getVersion());

app.whenReady().then(() => {
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 10 * 60 * 1000);
});

// ajout de gemini pour api-key
