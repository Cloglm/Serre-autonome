// Configuration des graphiques
const chartConfig = {
    type: 'line',
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
};

// Données de test pour les graphiques
const generateData = (baseValue, variance) => {
    return Array.from({ length: 24 }, (_, i) => ({
        x: i,
        y: baseValue + (Math.random() * variance * 2 - variance)
    }));
};

// Initialisation des graphiques
const temperatureChart = new Chart(
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

const humidityChart = new Chart(
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

// Mise à jour des données toutes les 5 secondes
setInterval(() => {
    const updateChart = (chart, baseValue, variance) => {
        const newData = generateData(baseValue, variance);
        chart.data.datasets[0].data = newData;
        chart.update();
    };

    updateChart(temperatureChart, 24, 2);
    updateChart(humidityChart, 65, 5);
    updateChart(lightChart, 750, 100);
}, 5000);

// Gestion des données météo
async function updateWeatherData() {
    const lat = 48.8566;
    const lon = 2.3522;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&hourly=temperature_2m,weathercode,relative_humidity_2m,wind_speed_10m&timezone=Europe%2FParis`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        // Météo actuelle
        const current = data.current_weather;
        const temp = Math.round(current.temperature);
        const wind = Math.round(current.windspeed);
        const weatherCode = current.weathercode;
        const humidity = data.hourly.relative_humidity_2m[0];

        // Mapping des codes météo Open-Meteo vers icônes et descriptions
        const weatherMap = {
            0: {icon: 'fa-sun', desc: 'Ensoleillé'},
            1: {icon: 'fa-cloud-sun', desc: 'Principalement clair'},
            2: {icon: 'fa-cloud', desc: 'Partiellement nuageux'},
            3: {icon: 'fa-cloud', desc: 'Couvert'},
            45: {icon: 'fa-smog', desc: 'Brouillard'},
            48: {icon: 'fa-smog', desc: 'Brouillard givrant'},
            51: {icon: 'fa-cloud-rain', desc: 'Bruine légère'},
            53: {icon: 'fa-cloud-rain', desc: 'Bruine'},
            55: {icon: 'fa-cloud-rain', desc: 'Bruine forte'},
            61: {icon: 'fa-cloud-showers-heavy', desc: 'Pluie faible'},
            63: {icon: 'fa-cloud-showers-heavy', desc: 'Pluie modérée'},
            65: {icon: 'fa-cloud-showers-heavy', desc: 'Pluie forte'},
            80: {icon: 'fa-cloud-showers-heavy', desc: 'Averses'},
            95: {icon: 'fa-bolt', desc: 'Orage'},
            99: {icon: 'fa-bolt', desc: 'Orage violent'}
        };
        const weather = weatherMap[weatherCode] || {icon: 'fa-question', desc: 'Inconnu'};

        // Mise à jour du DOM
        document.querySelector('.weather-temp').textContent = `${temp}°C`;
        document.querySelector('.weather-icon').className = `fas ${weather.icon} weather-icon`;
        document.querySelector('.weather-details .weather-item:nth-child(1) span').textContent = `${wind} km/h`;
        document.querySelector('.weather-details .weather-item:nth-child(2) span').textContent = `${humidity}%`;
        document.querySelector('.weather-details .weather-item:nth-child(3) span').textContent = weather.desc;

        // Prévisions sur 5 jours avec jours dynamiques
        const forecastDays = document.querySelectorAll('.forecast-day');
        const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        let today = new Date();
        for (let i = 0; i < forecastDays.length; i++) {
            const dayTemp = Math.round(data.daily.temperature_2m_max[i]);
            const dayCode = data.daily.weathercode[i];
            const dayWeather = weatherMap[dayCode] || {icon: 'fa-question'};
            // Calcul du nom du jour à partir d'aujourd'hui
            let dayIndex = (today.getDay() + i) % 7;
            forecastDays[i].querySelector('.day').textContent = dayNames[dayIndex];
            forecastDays[i].querySelector('.temp').textContent = `${dayTemp}°C`;
            forecastDays[i].querySelector('i').className = `fas ${dayWeather.icon}`;
            // Met à jour l'attribut data-day pour la modal
            forecastDays[i].setAttribute('data-day', dayNames[dayIndex]);
        }

        // Stockage global pour la modal
        globalWeatherData = data;
        globalWeatherMap = weatherMap;
    } catch (e) {
        console.error('Erreur lors de la récupération météo', e);
    }
}

// Appel initial et périodique
updateWeatherData();
setInterval(updateWeatherData, 300000); // toutes les 5 minutes

// Gestion de la modal météo
const modal = document.getElementById('weatherModal');
const closeModal = document.querySelector('.close-modal');

// Fonction pour mettre à jour les détails de la modal avec les vraies données météo
function updateModalDetails(dayIndex, data, weatherMap) {
    // Récupération des données du jour sélectionné
    const tempMax = Math.round(data.daily.temperature_2m_max[dayIndex]);
    const tempMin = Math.round(data.daily.temperature_2m_min[dayIndex]);
    const dayCode = data.daily.weathercode[dayIndex];
    const dayWeather = weatherMap[dayCode] || {icon: 'fa-question', desc: 'Inconnu'};
    // Pour l'humidité, le vent, etc. on prend la valeur de midi (12:00)
    const noonHourIndex = data.hourly.time.findIndex(t => t.endsWith('12:00')) + 24 * dayIndex;
    const humidity = data.hourly.relative_humidity_2m[noonHourIndex] || data.hourly.relative_humidity_2m[0];
    const wind = data.hourly.wind_speed_10m[noonHourIndex] || data.hourly.wind_speed_10m[0];
    // UV index et précipitations : valeurs simulées ou à remplacer si disponibles dans l'API
    const uvIndex = ['Faible', 'Modéré', 'Élevé'][Math.floor(Math.random() * 3)];
    const precipitation = Math.round(Math.random() * 30);

    // Mise à jour du contenu de la modal
    document.getElementById('modalDay').textContent = document.querySelectorAll('.forecast-day')[dayIndex].querySelector('.day').textContent;
    document.querySelector('.modal-weather-temp').textContent = `${tempMax}°C`;
    document.querySelector('.modal-weather-icon').className = `fas ${dayWeather.icon} modal-weather-icon`;
    document.querySelector('.modal-detail-item:nth-child(1) .detail-value').textContent = `${tempMax}°C`;
    document.querySelector('.modal-detail-item:nth-child(2) .detail-value').textContent = `${tempMin}°C`;
    document.querySelector('.modal-detail-item:nth-child(3) .detail-value').textContent = `${wind} km/h`;
    document.querySelector('.modal-detail-item:nth-child(4) .detail-value').textContent = `${humidity}%`;
    document.querySelector('.modal-detail-item:nth-child(5) .detail-value').textContent = uvIndex;
    document.querySelector('.modal-detail-item:nth-child(6) .detail-value').textContent = `${precipitation}%`;

    // Prévisions horaires (toutes les 2h)
    const hourlyGrid = document.querySelector('.hourly-grid');
    hourlyGrid.innerHTML = '';
    for (let h = 0; h < 24; h += 2) {
        const hourIndex = dayIndex * 24 + h;
        const hourTemp = Math.round(data.hourly.temperature_2m ? data.hourly.temperature_2m[hourIndex] : tempMax);
        const hourCode = data.hourly.weathercode ? data.hourly.weathercode[hourIndex] : dayCode;
        const hourWeather = weatherMap[hourCode] || {icon: 'fa-question'};
        const hourlyItem = document.createElement('div');
        hourlyItem.className = 'hourly-item';
        hourlyItem.innerHTML = `
            <div class="hour">${h}:00</div>
            <i class="fas ${hourWeather.icon}"></i>
            <div class="temp">${hourTemp}°C</div>
        `;
        hourlyGrid.appendChild(hourlyItem);
    }
}

// Variables globales pour stocker les données météo et le mapping
let globalWeatherData = null;
let globalWeatherMap = null;

// Gestionnaire d'événements pour les jours de prévision
// Remplacement pour utiliser les vraies données
setTimeout(() => {
    document.querySelectorAll('.forecast-day').forEach((day, i) => {
        day.addEventListener('click', () => {
            if (globalWeatherData && globalWeatherMap) {
                updateModalDetails(i, globalWeatherData, globalWeatherMap);
                const modal = document.getElementById('weatherModal');
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        });
    });
}, 500);

// Fermeture de la modal
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

// Fermeture de la modal en cliquant en dehors
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}); 