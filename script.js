let activeModule = 'mechanics';

function switchModule(id) {
    document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.getElementById('btn-' + id).classList.add('active');
    
    activeModule = id;

    if (id === 'mechanics') initMechanics();
    if (id === 'thermo') initThermo();
    if (id === 'electro') initOptics();
    if (id === 'waves') initWaves();
    if (id === 'modern') initModern();
}

let mechCanvas, mechCtx, projectileAnim;
let pPos = { x: 0, y: 0 }, pVel = { x: 0, y: 0 }, t = 0;
let isSimulating = false;

function initMechanics() {
    mechCanvas = document.getElementById('mechanicsCanvas');
    mechCtx = mechCanvas.getContext('2d');
    updateMechanics();
}

function updateMechanics() {
    const angle = parseFloat(document.getElementById('angle').value);
    const speed = parseFloat(document.getElementById('speed').value);
    const g = parseFloat(document.getElementById('gravity').value);

    document.getElementById('vAngle').innerText = angle;
    document.getElementById('vSpeed').innerText = speed;

    const rad = angle * (Math.PI / 180);
    const height = (Math.pow(speed * Math.sin(rad), 2)) / (2 * g);
    const range = (Math.pow(speed, 2) * Math.sin(2 * rad)) / g;
    const flightTime = (2 * speed * Math.sin(rad)) / g;

    document.getElementById('resRange').innerText = range.toFixed(2) + ' m';
    document.getElementById('resHeight').innerText = height.toFixed(2) + ' m';
    document.getElementById('resTime').innerText = flightTime.toFixed(2) + ' s';

    if (!isSimulating) drawStaticTrajectory(angle, speed, g);
}

function drawStaticTrajectory(angle, speed, g) {
    const w = mechCanvas.width = mechCanvas.parentElement.clientWidth;
    const h = mechCanvas.height = 350;
    mechCtx.clearRect(0, 0, w, h);

    const rad = angle * (Math.PI / 180);
    const vx = speed * Math.cos(rad);
    const vy = speed * Math.sin(rad);
    const totalT = (2 * vy) / g;

    mechCtx.beginPath();
    mechCtx.strokeStyle = '#3b82f6';
    mechCtx.setLineDash([5, 5]);

    const scaleX = (w - 60) / ((Math.pow(speed, 2) * Math.sin(2 * rad)) / g || 1);
    const scaleY = (h - 60) / (((vy * vy) / (2 * g)) || 1);
    const scale = Math.min(scaleX, scaleY, 4);

    for (let time = 0; time <= totalT; time += totalT / 100) {
        const x = 30 + (vx * time) * scale;
        const y = (h - 30) - ((vy * time) - (0.5 * g * time * time)) * scale;
        if (time === 0) mechCtx.moveTo(x, y);
        else mechCtx.lineTo(x, y);
    }
    mechCtx.stroke();
    mechCtx.setLineDash([]);
    mechCtx.fillStyle = '#1e293b';
    mechCtx.fillRect(0, h - 30, w, 30);
}

function startProjectileSim() {
    const angle = parseFloat(document.getElementById('angle').value);
    const speed = parseFloat(document.getElementById('speed').value);
    const g = parseFloat(document.getElementById('gravity').value);

    const rad = angle * (Math.PI / 180);
    pVel.x = speed * Math.cos(rad);
    pVel.y = speed * Math.sin(rad);
    t = 0;
    isSimulating = true;

    const w = mechCanvas.width = mechCanvas.parentElement.clientWidth;
    const h = mechCanvas.height = 350;

    const scale = Math.min((w - 60) / ((Math.pow(speed, 2) * Math.sin(2 * rad)) / g || 1), (h - 60) / (((pVel.y * pVel.y) / (2 * g)) || 1), 4);

    function animate() {
        if (!isSimulating || activeModule !== 'mechanics') return;
        t += 0.05;

        const currX = 30 + (pVel.x * t) * scale;
        const currY = (h - 30) - ((pVel.y * t) - (0.5 * g * t * t)) * scale;

        drawStaticTrajectory(angle, speed, g);

        mechCtx.beginPath();
        mechCtx.arc(currX, currY, 8, 0, Math.PI * 2);
        mechCtx.fillStyle = '#60a5fa';
        mechCtx.fill();

        if (currY < h - 30) {
            projectileAnim = requestAnimationFrame(animate);
        } else {
            isSimulating = false;
        }
    }
    cancelAnimationFrame(projectileAnim);
    animate();
}

let thermoCanvas, thermoCtx, thermoAnim;
let particles = [];

function initThermo() {
    thermoCanvas = document.getElementById('thermoCanvas');
    thermoCtx = thermoCanvas.getContext('2d');
    
    particles = [];
    for(let i = 0; i < 60; i++) {
        particles.push({
            x: Math.random() * 200 + 20,
            y: Math.random() * 200 + 20,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2
        });
    }
    updateThermoParams();
    animateThermo();
}

function updateThermoParams() {
    const temp = parseFloat(document.getElementById('temp').value);
    const vol = parseFloat(document.getElementById('vol').value);

    document.getElementById('vTemp').innerText = temp;
    document.getElementById('vVol').innerText = vol;

    const p = (0.082 * temp) / vol;
    const kinetic = 1.5 * 1.38e-23 * temp;

    document.getElementById('resPressure').innerText = p.toFixed(2) + ' atm';
    document.getElementById('resKinetic').innerText = kinetic.toExponential(2) + ' J';
}

function animateThermo() {
    if (activeModule !== 'thermo') return;
    const w = thermoCanvas.width = thermoCanvas.parentElement.clientWidth;
    const h = thermoCanvas.height = 350;

    const temp = parseFloat(document.getElementById('temp').value);
    const vol = parseFloat(document.getElementById('vol').value);

    const boxWidth = (vol / 100) * (w - 100) + 50;

    thermoCtx.clearRect(0, 0, w, h);
    thermoCtx.strokeStyle = '#3b82f6';
    thermoCtx.lineWidth = 3;
    thermoCtx.strokeRect(20, 20, boxWidth, h - 40);

    const speedFactor = Math.sqrt(temp / 300);

    particles.forEach(p => {
        p.x += p.vx * speedFactor;
        p.y += p.vy * speedFactor;

        if (p.x <= 25 || p.x >= boxWidth + 15) p.vx *= -1;
        if (p.y <= 25 || p.y >= h - 25) p.vy *= -1;

        thermoCtx.beginPath();
        thermoCtx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        thermoCtx.fillStyle = '#ef4444';
        thermoCtx.fill();
    });

    thermoAnim = requestAnimationFrame(animateThermo);
}

let opticsCanvas, opticsCtx;

function initOptics() {
    opticsCanvas = document.getElementById('opticsCanvas');
    opticsCtx = opticsCanvas.getContext('2d');
    updateOptics();
}

function updateOptics() {
    const incAngle = parseFloat(document.getElementById('incAngle').value);
    const n1 = parseFloat(document.getElementById('n1').value);
    const n2 = parseFloat(document.getElementById('n2').value);

    document.getElementById('vIncAngle').innerText = incAngle;

    const radInc = incAngle * (Math.PI / 180);
    const sinRef = (n1 * Math.sin(radInc)) / n2;

    let refAngle = 0;
    if (sinRef <= 1) {
        refAngle = Math.asin(sinRef) * (180 / Math.PI);
        document.getElementById('resRefAngle').innerText = refAngle.toFixed(2) + '°';
    } else {
        document.getElementById('resRefAngle').innerText = 'Reflexão Total';
    }

    const c = 300000; 
    document.getElementById('resLightSpeed').innerText = Math.round(c / n2).toLocaleString() + ' km/s';

    drawOpticsCanvas(incAngle, refAngle, sinRef > 1);
}

function drawOpticsCanvas(incAngle, refAngle, totalReflection) {
    const w = opticsCanvas.width = opticsCanvas.parentElement.clientWidth;
    const h = opticsCanvas.height = 350;

    opticsCtx.clearRect(0, 0, w, h);
    opticsCtx.fillStyle = '#0b0f19';
    opticsCtx.fillRect(0, 0, w, h / 2);
    opticsCtx.fillStyle = '#1e293b';
    opticsCtx.fillRect(0, h / 2, w, h / 2);
    opticsCtx.setLineDash([5, 5]);
    opticsCtx.strokeStyle = '#94a3b8';
    opticsCtx.beginPath();
    opticsCtx.moveTo(w / 2, 20);
    opticsCtx.lineTo(w / 2, h - 20);
    opticsCtx.stroke();
    opticsCtx.setLineDash([]);

    const len = 140;
    const radInc = incAngle * (Math.PI / 180);
    const x1 = w / 2 - len * Math.sin(radInc);
    const y1 = h / 2 - len * Math.cos(radInc);

    opticsCtx.lineWidth = 3;
    opticsCtx.strokeStyle = '#f59e0b';
    opticsCtx.beginPath();
    opticsCtx.moveTo(x1, y1);
    opticsCtx.lineTo(w / 2, h / 2);
    opticsCtx.stroke();
    opticsCtx.strokeStyle = '#38bdf8';
    opticsCtx.beginPath();
    opticsCtx.moveTo(w / 2, h / 2);

    if (totalReflection) {
        const x2 = w / 2 + len * Math.sin(radInc);
        const y2 = h / 2 - len * Math.cos(radInc);
        opticsCtx.lineTo(x2, y2);
    } else {
        const radRef = refAngle * (Math.PI / 180);
        const x2 = w / 2 + len * Math.sin(radRef);
        const y2 = h / 2 + len * Math.cos(radRef);
        opticsCtx.lineTo(x2, y2);
    }
    opticsCtx.stroke();
}

let wavesCanvas, wavesCtx, waveStep = 0, waveAnim;

function initWaves() {
    wavesCanvas = document.getElementById('wavesCanvas');
    wavesCtx = wavesCanvas.getContext('2d');
    updateWaveParams();
    animateWaves();
}

function updateWaveParams() {
    const freq = parseFloat(document.getElementById('freq').value);
    const amp = parseFloat(document.getElementById('amp').value);

    document.getElementById('vFreq').innerText = freq;
    document.getElementById('vAmp').innerText = amp;

    const period = 1 / freq;
    const lambda = 200 / freq;

    document.getElementById('resLambda').innerText = Math.round(lambda) + ' px';
    document.getElementById('resPeriod').innerText = period.toFixed(2) + ' s';
}

function animateWaves() {
    if (activeModule !== 'waves') return;
    const w = wavesCanvas.width = wavesCanvas.parentElement.clientWidth;
    const h = wavesCanvas.height = 350;

    const freq = parseFloat(document.getElementById('freq').value);
    const amp = parseFloat(document.getElementById('amp').value);

    wavesCtx.clearRect(0, 0, w, h);
    wavesCtx.beginPath();
    wavesCtx.strokeStyle = '#60a5fa';
    wavesCtx.lineWidth = 3;

    waveStep += 0.05 * freq;

    for (let x = 0; x < w; x++) {
        const y = h / 2 + Math.sin(x * 0.02 * freq - waveStep) * amp;
        if (x === 0) wavesCtx.moveTo(x, y);
        else wavesCtx.lineTo(x, y);
    }
    wavesCtx.stroke();

    waveAnim = requestAnimationFrame(animateWaves);
}

let earthSeconds = 0, modernTimer;

function initModern() {
    updateModernParams();
    if (!modernTimer) {
        modernTimer = setInterval(() => {
            if (activeModule === 'modern') {
                earthSeconds++;
                const vel = parseFloat(document.getElementById('velocity').value) / 100;
                const lorentz = 1 / Math.sqrt(1 - Math.pow(vel, 2));
                const shipSeconds = earthSeconds / lorentz;

                document.getElementById('earthClock').innerText = formatTime(earthSeconds);
                document.getElementById('shipClock').innerText = formatTime(Math.floor(shipSeconds));
            }
        }, 1000);
    }
}

function updateModernParams() {
    const velPct = parseFloat(document.getElementById('velocity').value);
    document.getElementById('vVelocity').innerText = velPct;

    const v = velPct / 100;
    const lorentz = v >= 1 ? Infinity : 1 / Math.sqrt(1 - Math.pow(v, 2));

    document.getElementById('resLorentz').innerText = lorentz === Infinity ? '∞' : lorentz.toFixed(3);

    const h = 4.1357e-15; 
    const energy = h * 6e14;
    document.getElementById('resPhoton').innerText = energy.toFixed(2) + ' eV';
}

function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

window.onload = function() {
    initMechanics();
};

window.addEventListener('resize', () => {
    if (activeModule === 'mechanics') initMechanics();
    if (activeModule === 'thermo') initThermo();
    if (activeModule === 'electro') initOptics();
    if (activeModule === 'waves') initWaves();
});
