document.addEventListener('DOMContentLoaded', () => {
    const motorToggleButton = document.getElementById('motorToggleButton');
    const motorIcon = document.getElementById('motorIcon');
    const motorStatusText = document.getElementById('motorStatusText');
    const motorSpeedSlider = document.getElementById('motorSpeedSlider');
    const motorSpeedValue = document.getElementById('motorSpeedValue');
    const lastActivationSpan = document.getElementById('lastActivation');
    const logEntriesDiv = document.querySelector('.log-entries');

    let isMotorOn = false;

    function updateMotorStatus() {
        if (isMotorOn) {
            motorToggleButton.textContent = 'Éteindre';
            motorToggleButton.classList.remove('off');
            motorToggleButton.classList.add('on');
            motorToggleButton.querySelector('i').className = 'fas fa-toggle-on';

            motorIcon.classList.remove('off');
            motorIcon.classList.add('on');
            motorStatusText.textContent = 'ON';
            motorStatusText.classList.remove('off');
            motorStatusText.classList.add('on');

            motorSpeedSlider.disabled = false;
            updateLastActivation();
            addLogEntry('ALLUMÉ', motorSpeedSlider.value);

        } else {
            motorToggleButton.textContent = 'Allumer';
            motorToggleButton.classList.remove('on');
            motorToggleButton.classList.add('off');
            motorToggleButton.querySelector('i').className = 'fas fa-toggle-off';

            motorIcon.classList.remove('on');
            motorIcon.classList.add('off');
            motorStatusText.textContent = 'OFF';
            motorStatusText.classList.remove('on');
            motorStatusText.classList.add('off');

            motorSpeedSlider.value = 0;
            motorSpeedValue.textContent = 0;
            motorSpeedSlider.disabled = true;
            addLogEntry('ÉTEINT');
        }
    }

    function updateLastActivation() {
        const now = new Date();
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
        lastActivationSpan.textContent = now.toLocaleDateString('fr-FR', options).replace(',', ' -');
    }

    function addLogEntry(action, speed = null) {
        const now = new Date();
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
        const timeString = now.toLocaleDateString('fr-FR', options).replace(',', '');
        
        const logItem = document.createElement('div');
        logItem.className = 'log-item';
        let logText = `<span class="log-time">${timeString}</span> - Moteur ${action}`;
        if (speed !== null && action === 'ALLUMÉ') {
            logText += ` (${speed}%)`;
        }
        logItem.innerHTML = logText;
        
        if (logEntriesDiv.firstChild) {
            logEntriesDiv.insertBefore(logItem, logEntriesDiv.firstChild);
        } else {
            logEntriesDiv.appendChild(logItem);
        }
        while (logEntriesDiv.children.length > 10) {
            logEntriesDiv.removeChild(logEntriesDiv.lastChild);
        }
    }

    motorToggleButton.addEventListener('click', () => {
        isMotorOn = !isMotorOn;
        updateMotorStatus();
    });

    motorSpeedSlider.addEventListener('input', () => {
        motorSpeedValue.textContent = motorSpeedSlider.value;
    });

    updateMotorStatus();
});