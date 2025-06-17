// control.js — Volet & Pompe : même moteur, UI indépendantes
document.addEventListener('DOMContentLoaded', () => {
    /*─────────────────────────────────────────────────────────────
      0) Header / footer dynamiques
    ─────────────────────────────────────────────────────────────*/
    fetch('PHP/header.php')
      .then(r => r.text())
      .then(html => document.body.insertAdjacentHTML('afterbegin', html))
      .catch(e => console.error('Header KO :', e));

    fetch('PHP/footer.php')
      .then(r => r.text())
      .then(html => document.body.insertAdjacentHTML('beforeend', html))
      .catch(e => console.error('Footer KO :', e));

    ['css/header.css', 'css/footer.css', 'css/header-footer-style.css']
      .forEach(href => {
        const l = document.createElement('link');
        l.rel  = 'stylesheet';
        l.href = href;
        document.head.appendChild(l);
      });

    /*─────────────────────────────────────────────────────────────
      1) Sélecteurs DOM – Pompe
    ─────────────────────────────────────────────────────────────*/
    const motorBtn   = document.getElementById('motorToggleButton');
    const motorIcon  = document.getElementById('motorIcon');
    const motorTxt   = document.getElementById('motorStatusText');
    const speedSlide = document.getElementById('motorSpeedSlider');
    const speedVal   = document.getElementById('motorSpeedValue');
    const lastSpan   = document.getElementById('lastActivation');
    const logDiv     = document.querySelector('.log-entries');

    /*─────────────────────────────────────────────────────────────
      2) Sélecteurs DOM – Volet
    ─────────────────────────────────────────────────────────────*/
    const shutBtn  = document.getElementById('shutterToggleButton');
    const shutIcon = document.getElementById('shutterIcon');
    const shutTxt  = document.getElementById('shutterStatusText');

    /*─────────────────────────────────────────────────────────────
      3) États
    ─────────────────────────────────────────────────────────────*/
    let isMotorOn     = false;   // pompe
    let isShutterOpen = false;   // volet

    /*─────────────────────────────────────────────────────────────
      4) API physiques – même relais
    ─────────────────────────────────────────────────────────────*/
    function callMotorEndpoint(stateBool) {
      // même host, port 5000
      const url = `${location.protocol}//${location.hostname}:5000/motor?state=${stateBool ? 'on' : 'off'}`;
      fetch(url)
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); })
        .catch(e => console.error('API /motor KO :', e));
    }

    /*─────────────────────────────────────────────────────────────
      5) UI helpers
    ─────────────────────────────────────────────────────────────*/
    function log(msg, speed = null) {
      const now = new Date().toLocaleString('fr-FR', { hour12:false })
                 .replace(',', '');
      const div = document.createElement('div');
      div.className = 'log-item';
      div.innerHTML = `<span class="log-time">${now}</span> – ${msg}`
                    + (speed != null ? ` (${speed}%)` : '');
      logDiv.prepend(div);
      while (logDiv.children.length > 10) logDiv.lastChild.remove();
    }

    function updateLast() {
      lastSpan.textContent = new Date()
        .toLocaleString('fr-FR', { hour12:false })
        .replace(',', ' –');
    }

    /*─────────────────────────────────────────────────────────────
      6) Rendu UI – Pompe
    ─────────────────────────────────────────────────────────────*/
    function renderMotor() {
      if (isMotorOn) {
        motorBtn.textContent          = 'Éteindre';
        motorBtn.classList.add('on');   motorBtn.classList.remove('off');
        motorIcon.classList.add('on');  motorIcon.classList.remove('off');
        motorBtn.querySelector('i').className = 'fas fa-toggle-on';
        motorTxt.textContent           = 'ON';
        motorTxt.classList.add('on');   motorTxt.classList.remove('off');

        speedSlide.disabled = false;
        updateLast();
        log('Moteur ALLUMÉ', speedSlide.value);
      } else {
        motorBtn.textContent          = 'Allumer';
        motorBtn.classList.add('off');  motorBtn.classList.remove('on');
        motorIcon.classList.add('off'); motorIcon.classList.remove('on');
        motorBtn.querySelector('i').className = 'fas fa-toggle-off';
        motorTxt.textContent           = 'OFF';
        motorTxt.classList.add('off');  motorTxt.classList.remove('on');

        speedSlide.value      = 0;
        speedVal.textContent  = 0;
        speedSlide.disabled   = true;
        log('Moteur ÉTEINT');
      }
    }

    /*─────────────────────────────────────────────────────────────
      7) Rendu UI – Volet
    ─────────────────────────────────────────────────────────────*/
    function renderShutter() {
      if (isShutterOpen) {
        shutBtn.textContent          = 'Fermer';
        shutBtn.classList.add('on');   shutBtn.classList.remove('off');
        shutIcon.classList.add('on');  shutIcon.classList.remove('off');
        shutBtn.querySelector('i').className = 'fas fa-toggle-on';
        shutTxt.textContent           = 'OUVERT';
        shutTxt.classList.add('on');   shutTxt.classList.remove('off');

        log('Volet OUVERT');
      } else {
        shutBtn.textContent          = 'Ouvrir';
        shutBtn.classList.add('off');  shutBtn.classList.remove('on');
        shutIcon.classList.add('off'); shutIcon.classList.remove('on');
        shutBtn.querySelector('i').className = 'fas fa-toggle-off';
        shutTxt.textContent           = 'FERMÉ';
        shutTxt.classList.add('off');  shutTxt.classList.remove('on');

        log('Volet FERMÉ');
      }
    }

    /*─────────────────────────────────────────────────────────────
      8) Handlers
    ─────────────────────────────────────────────────────────────*/
    motorBtn.addEventListener('click', () => {
      isMotorOn = !isMotorOn;
      callMotorEndpoint(isMotorOn);
      renderMotor();          // met à jour SEULE la carte pompe
      // le volet reste visuellement inchangé
    });

    shutBtn.addEventListener('click', () => {
      isShutterOpen = !isShutterOpen;
      callMotorEndpoint(isShutterOpen); // même moteur physique
      renderShutter();       // met à jour SEULE la carte volet
      // la pompe reste visuelle­ment inchangée
    });

    speedSlide.addEventListener('input', () => {
      speedVal.textContent = speedSlide.value;
    });

    /*─────────────────────────────────────────────────────────────
      9) Init
    ─────────────────────────────────────────────────────────────*/
    renderMotor();
    renderShutter();
});
