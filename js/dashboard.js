// js/dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    // ─── 0) Injection dynamique du header et du footer ────────────────────────
    fetch('PHP/header.php')
      .then(r => r.text())
      .then(html => document.body.insertAdjacentHTML('afterbegin', html))
      .catch(e => console.error('Erreur chargement header:', e));
  
    fetch('PHP/footer.php')
      .then(r => r.text())
      .then(html => document.body.insertAdjacentHTML('beforeend', html))
      .catch(e => console.error('Erreur chargement footer:', e));
  
    ['css/header.css', 'css/footer.css', 'css/header-footer-style.css']
      .forEach(href => {
        const link = document.createElement('link');
        link.rel  = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
      });
  
    // ─── Configuration des seuils d'alerte ───────────────────────────────────
    const SEUILS = {
        temperature: { min: 15, max: 30 },
        humidity: { min: 40, max: 80 },
        brightness: { min: 200, max: 1000 }
    };
  
    // ─── Système de notification ────────────────────────────────────────────
    let activeAlerts = new Set();
    let alertHistory = [];
  
    function createNotificationContainer() {
        const container = document.createElement('div');
        container.className = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 300px;
        `;
        document.body.appendChild(container);
        return container;
    }
  
    function createAlertHistoryContainer() {
        const container = document.createElement('div');
        container.className = 'alert-history-container';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-height: 300px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
        `;
        
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #eee;
        `;
        
        const title = document.createElement('h3');
        title.textContent = 'Historique des Alertes';
        title.style.margin = '0';
        
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            padding: 0 5px;
        `;
        closeBtn.onclick = () => container.style.display = 'none';
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        container.appendChild(header);
        
        const historyList = document.createElement('div');
        historyList.className = 'alert-history-list';
        container.appendChild(historyList);
        
        document.body.appendChild(container);
        return container;
    }
  
    const notificationContainer = createNotificationContainer();
    const alertHistoryContainer = createAlertHistoryContainer();
    const historyList = alertHistoryContainer.querySelector('.alert-history-list');
  
    function showNotification(message, type = 'warning', alertId) {
        if (activeAlerts.has(alertId)) return;
  
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            padding: 15px;
            border-radius: 5px;
            background-color: ${type === 'warning' ? '#fff3cd' : '#d4edda'};
            border-left: 4px solid ${type === 'warning' ? '#ffc107' : '#28a745'};
            animation: slideIn 0.5s ease-out;
            position: relative;
        `;
  
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = `
            position: absolute;
            top: 5px;
            right: 5px;
            background: none;
            border: none;
            font-size: 16px;
            cursor: pointer;
            padding: 0 5px;
        `;
        closeBtn.onclick = () => {
            notification.remove();
            activeAlerts.delete(alertId);
        };
  
        notification.textContent = message;
        notification.appendChild(closeBtn);
        notificationContainer.appendChild(notification);
        activeAlerts.add(alertId);
  
        // Ajouter à l'historique
        const timestamp = new Date().toLocaleString('fr-FR');
        alertHistory.unshift({ message, type, timestamp });
        updateAlertHistory();
    }
  
    function updateAlertHistory() {
        historyList.innerHTML = '';
        alertHistory.slice(0, 10).forEach(alert => {
            const alertItem = document.createElement('div');
            alertItem.style.cssText = `
                padding: 8px;
                margin-bottom: 5px;
                border-radius: 3px;
                background-color: ${alert.type === 'warning' ? '#fff3cd' : '#d4edda'};
                border-left: 3px solid ${alert.type === 'warning' ? '#ffc107' : '#28a745'};
                font-size: 12px;
            `;
            alertItem.innerHTML = `
                <div style="font-weight: bold;">${alert.message}</div>
                <div style="color: #666; font-size: 10px;">${alert.timestamp}</div>
            `;
            historyList.appendChild(alertItem);
        });
    }
  
    function checkThresholds(stats) {
        // Vérification de la température
        if (stats.temperature.avg < SEUILS.temperature.min) {
            showNotification(`Température trop basse: ${stats.temperature.avg}°C`, 'warning', 'temp_low');
        } else if (stats.temperature.avg > SEUILS.temperature.max) {
            showNotification(`Température trop élevée: ${stats.temperature.avg}°C`, 'warning', 'temp_high');
        }
  
        // Vérification de l'humidité
        if (stats.humidity.avg < SEUILS.humidity.min) {
            showNotification(`Humidité trop basse: ${stats.humidity.avg}%`, 'warning', 'hum_low');
        } else if (stats.humidity.avg > SEUILS.humidity.max) {
            showNotification(`Humidité trop élevée: ${stats.humidity.avg}%`, 'warning', 'hum_high');
        }
  
        // Vérification de la luminosité
        if (stats.brightness.avg < SEUILS.brightness.min) {
            showNotification(`Luminosité trop basse: ${stats.brightness.avg} lux`, 'warning', 'light_low');
        } else if (stats.brightness.avg > SEUILS.brightness.max) {
            showNotification(`Luminosité trop élevée: ${stats.brightness.avg} lux`, 'warning', 'light_high');
        }
    }
  
    // ─── 1) Bloc de mock-chart (permet de vérifier le rendu avant BDD) ─────────
    const chartConfig = {
  type: 'line',
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      // ** Axe X en "time" pour interpréter vos timestamps **
      x: {
        type: 'time',
        time: {
          unit: 'hour',
          tooltipFormat: 'HH:mm',
          displayFormats: {
            hour: 'HH:mm'
          }
        },
        title: {
          display: true,
          text: 'Heure'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Valeur'
        }
      }
    }
  }
};

  
    const generateData = (base, variance) =>
      Array.from({ length: 24 }, (_, i) => ({
        x: i,
        y: base + (Math.random() * variance * 2 - variance)
      }));
  
    const tempChart = new Chart(
      document.getElementById('temperatureChart'),
      {
        ...chartConfig,
        data: {
          datasets: [{
            label: 'Température',
            data: generateData(24, 2),
            borderColor: '#e74c3c',
            tension: 0.4
          }]
        }
      }
    );
  
    const humChart = new Chart(
      document.getElementById('humidityChart'),
      {
        ...chartConfig,
        data: {
          datasets: [{
            label: 'Humidité',
            data: generateData(65, 5),
            borderColor: '#3498db',
            tension: 0.4
          }]
        }
      }
    );
  
    const lightChart = new Chart(
      document.getElementById('lightChart'),
      {
        ...chartConfig,
        data: {
          datasets: [{
            label: 'Luminosité',
            data: generateData(750, 100),
            borderColor: '#f1c40f',
            tension: 0.4
          }]
        }
      }
    );
  
    // Mise à jour des mocks toutes les 5s
    //setInterval(() => {
     // [[tempChart,24,2],[humChart,65,5],[lightChart,750,100]].forEach(([c,b,v])=>{
        //c.data.datasets[0].data = generateData(b, v);
        //c.update();
      //});
    //}, 5000);
  
    // ─── 2) Récupération des vraies données + stats ──────────────────────────
    async function fetchData() {
      try {
        // données temps réel
        const resData = await fetch('PHP/get_data_local.php');
        const series  = await resData.json();
        tempChart.data.datasets[0].data  = series.temperature;
        humChart.data.datasets[0].data   = series.humidity;
        lightChart.data.datasets[0].data = series.brightness;
        tempChart.update(); humChart.update(); lightChart.update();
  
        // statistiques globales
        const resStats = await fetch('PHP/get_stats_local.php');
        const stats    = await resStats.json();
        const statEls  = document.querySelectorAll('.stat-value');
        statEls[0].textContent = stats.temperature.avg + '°C';
        statEls[1].textContent = stats.humidity.avg    + '%';
        statEls[2].textContent = stats.brightness.avg  + ' lux';
        // si vous avez une mesure eau, ajoutez ici statEls[3]…
        checkThresholds(stats);
      } catch (err) {
        console.error('fetchData error:', err);
      }
    }
  
    // ─── 3) Récupération et affichage météo ─────────────────────────────────
    let globalWeatherData = null, globalWeatherMap = null;
  
    async function updateWeatherData() {
      const lat = 48.8566, lon = 2.3522;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
                + `&current_weather=true`
                + `&daily=temperature_2m_max,temperature_2m_min,weathercode`
                + `&hourly=temperature_2m,weathercode,relative_humidity_2m,wind_speed_10m`
                + `&timezone=Europe%2FParis`;
      try {
        const data = await (await fetch(url)).json();
        const cur  = data.current_weather;
        const map  = {
          0:{icon:'fa-sun',desc:'Ensoleillé'},1:{icon:'fa-cloud-sun',desc:'Principalement clair'},
          2:{icon:'fa-cloud',desc:'Partiellement nuageux'},3:{icon:'fa-cloud',desc:'Couvert'},
          45:{icon:'fa-smog',desc:'Brouillard'},48:{icon:'fa-smog',desc:'Brouillard givrant'},
          51:{icon:'fa-cloud-rain',desc:'Bruine légère'},53:{icon:'fa-cloud-rain',desc:'Bruine'},
          55:{icon:'fa-cloud-rain',desc:'Bruine forte'},61:{icon:'fa-cloud-showers-heavy',desc:'Pluie faible'},
          63:{icon:'fa-cloud-showers-heavy',desc:'Pluie modérée'},65:{icon:'fa-cloud-showers-heavy',desc:'Pluie forte'},
          80:{icon:'fa-cloud-showers-heavy',desc:'Averses'},95:{icon:'fa-bolt',desc:'Orage'},
          99:{icon:'fa-bolt',desc:'Orage violent'}
        };
        const w = map[cur.weathercode] || {icon:'fa-question',desc:'Inconnu'};
  
        document.querySelector('.weather-temp').textContent       = Math.round(cur.temperature) + '°C';
        document.querySelector('.weather-icon').className         = `fas ${w.icon} weather-icon`;
        const details = document.querySelectorAll('.weather-details .weather-item span');
        details[0].textContent = Math.round(cur.windspeed) + ' km/h';
        details[1].textContent = data.hourly.relative_humidity_2m[0] + '%';
        details[2].textContent = w.desc;
  
        // prévisions 5 jours
        document.querySelectorAll('.forecast-day').forEach((el,i)=>{
          const temp = Math.round(data.daily.temperature_2m_max[i]);
          const code = data.daily.weathercode[i];
          const icd  = map[code] || {icon:'fa-question'};
          const names = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
          const dayName = names[(new Date().getDay()+i)%7];
          el.querySelector('.day').textContent  = dayName;
          el.querySelector('.temp').textContent = temp + '°C';
          el.querySelector('i').className       = `fas ${icd.icon}`;
          el.setAttribute('data-day', dayName);
        });
  
        globalWeatherData = data;
        globalWeatherMap  = map;
      } catch (err) {
        console.error('Météo error:', err);
      }
    }
  
    // ─── 4) Lancement initial + setInterval ────────────────────────────────
    fetchData();
    setInterval(fetchData, 30000);
    updateWeatherData();
    setInterval(updateWeatherData, 300000);
  
    // ─── 5) Gestion de la modal météo ───────────────────────────────────────
    const modal = document.getElementById('weatherModal');
    const btnClose = document.querySelector('.close-modal');
  
    // cliquer sur une journée
    setTimeout(() => {
      document.querySelectorAll('.forecast-day').forEach((dayEl, idx) => {
        dayEl.addEventListener('click', () => {
          if (!globalWeatherData) return;
          updateModalDetails(idx, globalWeatherData, globalWeatherMap);
          modal.style.display = 'block';
          document.body.style.overflow = 'hidden';
        });
      });
    }, 500);
  
    btnClose.addEventListener('click', () => {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    });
  
    window.addEventListener('click', e => {
      if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
      }
    });
  
    // unique définition de la fonction modal
    function updateModalDetails(dayIndex, data, weatherMap) {
      const max = Math.round(data.daily.temperature_2m_max[dayIndex]);
      const min = Math.round(data.daily.temperature_2m_min[dayIndex]);
      const code = data.daily.weathercode[dayIndex];
      const icd  = weatherMap[code] || {icon:'fa-question',desc:'Inconnu'};
      // position index midi
      const noonIdx = data.hourly.time.findIndex(t => t.endsWith('12:00')) + 24*dayIndex;
      const hum     = data.hourly.relative_humidity_2m[noonIdx] || data.hourly.relative_humidity_2m[0];
      const wnd     = data.hourly.wind_speed_10m[noonIdx]       || data.hourly.wind_speed_10m[0];
      const uv      = ['Faible','Modéré','Élevé'][Math.floor(Math.random()*3)];
      const precip  = Math.round(Math.random()*30);
  
      document.getElementById('modalDay').textContent              = document.querySelectorAll('.forecast-day')[dayIndex].querySelector('.day').textContent;
      document.querySelector('.modal-weather-temp').textContent    = `${max}°C`;
      document.querySelector('.modal-weather-icon').className      = `fas ${icd.icon} modal-weather-icon`;
      const detailsItems = document.querySelectorAll('.modal-detail-item .detail-value');
      detailsItems[0].textContent = `${max}°C`;
      detailsItems[1].textContent = `${min}°C`;
      detailsItems[2].textContent = `${wnd} km/h`;
      detailsItems[3].textContent = `${hum}%`;
      detailsItems[4].textContent = uv;
      detailsItems[5].textContent = `${precip}%`;
  
      const grid = document.querySelector('.hourly-grid');
      grid.innerHTML = '';
      for (let h = 0; h < 24; h += 2) {
        const idxH = dayIndex*24 + h;
        const tH   = Math.round(data.hourly.temperature_2m[idxH] || max);
        const cH   = data.hourly.weathercode[idxH] || code;
        const icH  = weatherMap[cH] || {icon:'fa-question'};
        const div  = document.createElement('div');
        div.className = 'hourly-item';
        div.innerHTML = `
          <div class="hour">${h}:00</div>
          <i class="fas ${icH.icon}"></i>
          <div class="temp">${tH}°C</div>
        `;
        grid.appendChild(div);
      }
    }
  
    // Ajouter un bouton pour afficher l'historique
    const historyButton = document.createElement('button');
    historyButton.textContent = 'Historique des Alertes';
    historyButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 10px 15px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        z-index: 999;
    `;
    historyButton.onclick = () => {
        alertHistoryContainer.style.display = alertHistoryContainer.style.display === 'none' ? 'block' : 'none';
    };
    document.body.appendChild(historyButton);
  });
  