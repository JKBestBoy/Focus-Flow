const { loadSettings, saveSettings } = require('./settings');

function getTasks() {
  const settings = loadSettings();
  return settings.tasks;
}

function addTask(task) {
  const settings = loadSettings();
  settings.tasks.push(task);
  saveSettings(settings);
}

function deleteTask(taskIndex) {
  const settings = loadSettings();
  settings.tasks.splice(taskIndex, 1);
  saveSettings(settings);
}

module.exports = { getTasks, addTask, deleteTask };
