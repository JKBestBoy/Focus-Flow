const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '..', 'settings.json');

function loadSettings() {
  if (fs.existsSync(settingsPath)) {
    return JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
  }
  return {
    work_duration: 1500,
    break_duration: 300,
    pomodoro_cycles: 4,
    tasks: []
  };
}

function saveSettings(settings) {
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

module.exports = { loadSettings, saveSettings };
