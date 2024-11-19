// Variables
let workTittle = document.getElementById('work');
let breakTittle = document.getElementById('break');
let timerMessage = document.getElementById('timer-message');
let totalWorkMinutesToday = 0; // Minutes de travail effectuées aujourd'hui
let totalWorkMinutes = 0; // Minutes de travail totales (historique)

let workTime = 25; // Durée par défaut en minutes
let breakTime = 5; // Durée par défaut en minutes
let cycles = 4; // Nombre de cycles par défaut

let seconds = "00";
let isRunning = false; // État pour vérifier si le timer est en cours
let timerInterval; // Variable pour stocker l'intervalle du timer

// Initialisation
window.onload = () => {
    // Mise à jour de l'interface utilisateur avec les temps de travail par défaut
  document.getElementById('minutes').innerHTML = workTime.toString().padStart(2, '0');
  document.getElementById('seconds').innerHTML = seconds;

  workTittle.classList.add('active');
  timerMessage.textContent = "Time to Focus!";
  if (fs && path) {
    // Charger les données depuis workStats.json au démarrage
    loadWorkStats();

    // Surveiller les modifications du fichier JSON
    const filePath = path.join(__dirname, 'workStats.json');
    fs.watch(filePath, (eventType, filename) => {
      if (eventType === 'change') {
        console.log(`Le fichier ${filename} a été modifié. Rechargement des données...`);
        loadWorkStats(); // Recharge les données
      }
    });
  }
};

// Charger les statistiques depuis workStats.json
function loadWorkStats() {
  if (!fs || !path) return;

  const filePath = path.join(__dirname, 'workStats.json');

  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    try {
      const stats = JSON.parse(data);
      totalWorkMinutesToday = stats.daily
        ? stats.daily[new Date().toISOString().split('T')[0]] || 0
        : 0;
      totalWorkMinutes = stats.allTime || 0;
      console.log("Données chargées :", stats);
      updateUI(); // Mettre à jour l'interface utilisateur
    } catch (err) {
      console.error("Erreur lors de la lecture de workStats.json :", err);
    }
  }
}



// Sauvegarder les statistiques dans workStats.json
function saveWorkStats() {
  if (!fs || !path) return; // Ignorer si Node.js n'est pas disponible

  const filePath = path.join(__dirname, 'workStats.json');

  // Charger le fichier existant, s'il existe
  let workStats = {
    daily: {},
    weekly: {},
    monthly: {},
    allTime: 0,
  };

  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    workStats = JSON.parse(data);
  }

  // Mettre à jour les statistiques
  const today = new Date().toISOString().split('T')[0]; // Date du jour au format AAAA-MM-JJ
  workStats.daily[today] = (workStats.daily[today] || 0) + totalWorkMinutesToday;
  workStats.weekly[today] = (workStats.weekly[today] || 0) + totalWorkMinutesToday; // Vous pouvez adapter pour une vraie semaine
  workStats.monthly[today] = (workStats.monthly[today] || 0) + totalWorkMinutesToday; // Vous pouvez adapter pour un vrai mois
  workStats.allTime = totalWorkMinutes;

  // Sauvegarder dans le fichier
  fs.writeFile(filePath, JSON.stringify(workStats, null, 2), (err) => {
    if (err) {
      console.error("Erreur lors de la sauvegarde des statistiques de travail :", err);
    } else {
      console.log("Statistiques de travail enregistrées avec succès !");
    }
  });
}


// Fonction pour afficher le rapport
function showReport() {
  const reportContent = document.getElementById('report-content');
  const reportPopup = document.getElementById('report-popup');

  // Mettre à jour le contenu du rapport
  reportContent.textContent = `Work Report:
  - Total work minutes today: ${totalWorkMinutesToday}
  - Total work minutes (all time): ${totalWorkMinutes}`;

  // Afficher le popup
  reportPopup.classList.remove('hidden');
}

function closeReport() {
  const reportPopup = document.getElementById('report-popup');
  reportPopup.classList.add('hidden');
}


// Enregistrer un journal de session
function logSession(message) {
  if (!fs || !path) return; // Ignorer si Node.js n'est pas disponible

  const filePath = path.join(__dirname, 'sessionLog.txt');
  const logMessage = `${message} - ${new Date().toLocaleString()}\n`;

  fs.appendFile(filePath, logMessage, (err) => {
    if (err) console.error("Erreur lors de la journalisation :", err);
  });
}

// Afficher/Masquer les paramètres
function toggleSettings() {
  const settingsPopup = document.getElementById('settings-popup');
  if (settingsPopup) {
    settingsPopup.classList.toggle('hidden'); // Basculer entre "affiché" et "masqué"
  } else {
    console.error("Settings popup not found in the DOM.");
  }
}


// Appliquer les nouvelles valeurs des paramètres
function applySettings() {
  const workDurationInput = document.getElementById('work-duration').value;
  const breakDurationInput = document.getElementById('break-duration').value;
  const cyclesInput = document.getElementById('cycles-count').value;

  // Mettre à jour les paramètres
  workTime = parseInt(workDurationInput) || workTime;
  breakTime = parseInt(breakDurationInput) || breakTime;
  cycles = parseInt(cyclesInput) || cycles;

  // Mettre à jour l'affichage du timer
  document.getElementById('minutes').innerHTML = workTime.toString().padStart(2, '0');
  document.getElementById('seconds').innerHTML = "00";

  // Sauvegarder les réglages (si persistance activée)
  saveSettings();

  // Fermer la fenêtre des paramètres
  const settingsPopup = document.getElementById('settings-popup');
  if (settingsPopup) {
    settingsPopup.classList.add('hidden'); // Masquer l'élément
  } else {
    console.error("Settings popup not found in the DOM.");
  }

  // Message de confirmation
  alert("Settings applied!");
}


// Fonction pour démarrer ou arrêter le timer 
function toggleTimer() {
  const startButton = document.getElementById('start');

  if (!isRunning) {
    // Démarrer le timer
    isRunning = true;
    startButton.textContent = "Stop";

    // Initialise les variables pour le timer
    seconds = seconds === "00" ? 59 : parseInt(seconds);
    let workMinutes = workTime - 1;
    let breakMinutes = breakTime - 1;
    let breakCount = 0;

    // Fonction de compte à rebours
    let timerFunction = () => {
      if (isRunning) {
        // Met à jour l'affichage
        document.getElementById('minutes').innerHTML = workMinutes.toString().padStart(2, '0');
        document.getElementById('seconds').innerHTML = seconds.toString().padStart(2, '0');
        seconds--;

        if (seconds === -1) {
          seconds = 59;
          workMinutes--;

          // Si les minutes sont épuisées
          if (workMinutes === -1) {
            clearInterval(timerInterval); // Arrête le timer
            isRunning = false;
            startButton.textContent = "Start";

            if (breakCount % 2 === 0) {
              // Passe à la pause
              totalWorkMinutesToday += workTime;
              totalWorkMinutes += workTime;
              saveWorkStats(); // Sauvegarder les statistiques
              logSession("Cycle de travail terminé");
              timerMessage.textContent = "Good job! Time to rest!";
              workTittle.classList.remove('active');
              breakTittle.classList.add('active');
              workMinutes = breakTime;

            } else {
              // Retourne au travail
              logSession("Pause terminée");
              timerMessage.textContent = "Time to Focus!";
              breakTittle.classList.remove('active');
              workTittle.classList.add('active');
              workMinutes = workTime;
            }

            breakCount++;

            // Vérifier si le cycle est terminé
            if (breakCount / 2 >= cycles) {
              timerMessage.textContent = "Pomodoro completed!";
              alert("You’ve completed all cycles! Great job!");
              startButton.disabled = true; // Désactiver le bouton si tous les cycles sont terminés
              logSession("Pomodoro terminé");
              return; // Arrêter la fonction
            }
          }
        }
      }
    };

    // Lance le compte à rebours
    timerInterval = setInterval(timerFunction, 1000);
  } else {
    // Arrêter le timer
    isRunning = false;
    startButton.textContent = "Start";
    clearInterval(timerInterval);
  }
}

// Initialisation de la liste des tâches
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

// Gestionnaire d'événement pour ajouter une tâche
taskForm.addEventListener('submit', (e) => {
  e.preventDefault(); // Empêche le rechargement de la page

  const taskText = taskInput.value.trim();
  if (taskText === "") {
    alert("Please enter a task.");
    return;
  }

  // Création de l'élément de liste
  const taskItem = document.createElement('li');
  taskItem.textContent = taskText;

  // Bouton pour supprimer la tâche
  const removeButton = document.createElement('button');
  removeButton.textContent = "×";
  removeButton.classList.add('task-remove-button');
  removeButton.addEventListener('click', () => {
    taskList.removeChild(taskItem);
  });

  // Ajout du bouton à la tâche
  taskItem.appendChild(removeButton);

  // Ajout de la tâche à la liste
  taskList.appendChild(taskItem);

  // Réinitialisation de l'entrée
  taskInput.value = "";
});