const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('hytracker', {
  getApiKey:      () => ipcRenderer.invoke('get-api-key'),
  setApiKey:      (key) => ipcRenderer.invoke('set-api-key', key),
  getRateStatus:  () => ipcRenderer.invoke('get-rate-status'),
  searchPlayer:   (username) => ipcRenderer.invoke('search-player', username),
  getRecentGames: (uuid) => ipcRenderer.invoke('get-recent-games', uuid),
  getSnapshots:   (uuid) => ipcRenderer.invoke('get-snapshots', uuid),
  getFavorites:   () => ipcRenderer.invoke('get-favorites'),
  addFavorite:    (player) => ipcRenderer.invoke('add-favorite', player),
  removeFavorite: (uuid) => ipcRenderer.invoke('remove-favorite', uuid),
  comparePlayers: (usernames) => ipcRenderer.invoke('compare-players', usernames),
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose:    () => ipcRenderer.invoke('window-close'),
  openExternal:   (url) => ipcRenderer.invoke('open-external', url),
  searchSelf:     () => ipcRenderer.invoke('search-self'),

  // ── Auto-updater ──
  getAppVersion:    () => ipcRenderer.invoke('get-app-version'),
  checkForUpdates:  () => ipcRenderer.invoke('check-for-updates'),
  installUpdate:    () => ipcRenderer.invoke('install-update'),
  onUpdateStatus:   (cb) => {
    const handler = (_event, data) => cb(data);
    ipcRenderer.on('update-status', handler);
    return () => ipcRenderer.removeListener('update-status', handler);
  },
});