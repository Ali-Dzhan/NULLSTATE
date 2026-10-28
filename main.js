/* === UI Audio Synthesizer & Sound Controls === */
let audioCtx = null;
let isAudioEnabled = localStorage.getItem('nullstate_sfx') !== 'muted';

function getAudioContext() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function toggleAudio() {
    isAudioEnabled = !isAudioEnabled;
    localStorage.setItem('nullstate_sfx', isAudioEnabled ? 'active' : 'muted');
    updateAudioUI();
    if (isAudioEnabled) playClickSound();
}

function updateAudioUI() {
    document.querySelectorAll('.sfx-toggle-btn').forEach(btn => {
        const label = btn.querySelector('.sfx-label');
        const eq = btn.querySelector('.eq-container');
        if (isAudioEnabled) {
            btn.classList.remove('border-white/10', 'text-gray-500');
            btn.classList.add('border-neon-cyan/40', 'text-neon-cyan');
            if (label) label.innerText = 'SFX: ON';
            if (eq) {
                eq.classList.remove('eq-muted');
                eq.classList.add('eq-active');
            }
        } else {
            btn.classList.remove('border-neon-cyan/40', 'text-neon-cyan');
            btn.classList.add('border-white/10', 'text-gray-500');
            if (label) label.innerText = 'SFX: MUTED';
            if (eq) {
                eq.classList.remove('eq-active');
                eq.classList.add('eq-muted');
            }
        }
    });
}

function playHoverSound() {
    if (!isAudioEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
    gainNode.gain.setValueAtTime(0.02, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
}

function playClickSound() {
    if (!isAudioEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
}

document.addEventListener('mouseover', (e) => {
    if (e.target.closest('.hover-sound')) playHoverSound();
});
document.addEventListener('click', (e) => {
    if (e.target.closest('.click-sound')) playClickSound();
});

// Initialize SFX UI on page load
setTimeout(updateAudioUI, 10);

/* === Interactive Cyber Toggle Component === */
function toggleCyberComponent(el) {
    el.classList.toggle('active');
    playClickSound();
    const statusText = document.getElementById('toggle-status-text');
    if (statusText) {
        statusText.innerText = el.classList.contains('active') ? 'STATE: ACTIVE [1]' : 'STATE: IDLE [0]';
        statusText.className = el.classList.contains('active') ? 'text-neon-cyan font-bold text-xs' : 'text-gray-400 font-normal text-xs';
    }
}

function selectDesignToken(btn) {
    playClickSound();
    const parent = btn.parentElement;
    if (!parent) return;
    parent.querySelectorAll('button').forEach(b => {
        b.className = 'flex-1 py-1 text-center rounded text-gray-400 hover:text-white transition-colors click-sound hover-target';
    });
    btn.className = 'flex-1 py-1 text-center rounded bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 click-sound hover-target font-bold';
}

/* === WebGL-style Particle Canvas === */
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let width, height;
let particles = [];
let mouse = { x: null, y: null };

function initCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles = [];
    const count = window.innerWidth < 768 ? 50 : 100;
    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2
        });
    }
}

function drawParticles() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';

    particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        for (let j = index + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 100) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }

        if (mouse.x) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                ctx.strokeStyle = `rgba(0, 240, 255, ${1 - dist/150})`;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
                ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
            }
        }
    });
    requestAnimationFrame(drawParticles);
}

window.addEventListener('resize', initCanvas);
window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });

initCanvas();
drawParticles();

/* === Custom Cursor === */
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;
    
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;
    
    setTimeout(() => {
        cursorOutline.style.left = `${posX}px`;
        cursorOutline.style.top = `${posY}px`;
    }, 50);
});

document.addEventListener('mouseover', (e) => {
    if (e.target.closest('.hover-target, a, button')) {
        cursorOutline.style.width = '50px';
        cursorOutline.style.height = '50px';
        cursorOutline.style.backgroundColor = 'rgba(0, 240, 255, 0.1)';
    }
});
document.addEventListener('mouseout', (e) => {
    if (e.target.closest('.hover-target, a, button')) {
        cursorOutline.style.width = '30px';
        cursorOutline.style.height = '30px';
        cursorOutline.style.backgroundColor = 'transparent';
    }
});

/* === Decoding Text Effect === */
const decodeElement = document.getElementById('decode-text');
const finalString = "> System.Boot();";
const chars = "!<>-_\\/[]{}—=+*^?#________";
let iteration = 0;

const decodeInterval = setInterval(() => {
    decodeElement.innerText = finalString.split("").map((letter, index) => {
        if (index < iteration) return finalString[index];
        return chars[Math.floor(Math.random() * chars.length)];
    }).join("");
    
    if (iteration >= finalString.length) clearInterval(decodeInterval);
    iteration += 1 / 3;
}, 30);

/* === Reading Progress & Header Glass === */
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    document.getElementById('progress-bar').style.width = scrolled + "%";

    const header = document.getElementById('header');
    if (winScroll > 50) {
        header.classList.add('bg-black/90', 'backdrop-blur-md', 'border-b', 'border-white/10', 'py-3', 'md:py-4');
        header.classList.remove('bg-void/0', 'py-4', 'md:py-6');
    } else {
        header.classList.remove('bg-black/90', 'backdrop-blur-md', 'border-b', 'border-white/10', 'py-3', 'md:py-4');
        header.classList.add('bg-void/0', 'py-4', 'md:py-6');
    }
});

/* === Live Clock (Varna) === */
function updateClock() {
    const now = new Date();
    const options = { timeZone: 'Europe/Sofia', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const timeStr = now.toLocaleTimeString('en-US', options);
    document.getElementById('live-clock').innerText = timeStr;
}
setInterval(updateClock, 1000);
updateClock();

/* === Wireframe-to-Reality Split Slider (Concept 2) === */
const splitSlider = document.getElementById('wireframe-slider');
const wireframePanel = document.getElementById('slider-wireframe-panel');
const wireframeInner = document.getElementById('slider-wireframe-inner');
const splitHandle = document.getElementById('slider-handle');

let isSplitDragging = false;

function updateWireframeDimensions() {
    if (!splitSlider || !wireframeInner) return;
    wireframeInner.style.width = `${splitSlider.offsetWidth}px`;
    wireframeInner.style.height = `${splitSlider.offsetHeight}px`;
}

function setSplitPosition(clientY) {
    if (!splitSlider || !wireframePanel || !splitHandle) return;
    const rect = splitSlider.getBoundingClientRect();
    let pos = clientY - rect.top;
    pos = Math.max(0, Math.min(pos, rect.height));
    const percentage = (pos / rect.height) * 100;

    wireframePanel.style.height = `${percentage}%`;
    splitHandle.style.top = `${percentage}%`;
}

function setSliderPercentage(percentage) {
    if (!splitSlider || !wireframePanel || !splitHandle) return;
    wireframePanel.style.transition = 'height 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
    splitHandle.style.transition = 'top 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
    
    wireframePanel.style.height = `${percentage}%`;
    splitHandle.style.top = `${percentage}%`;
    playClickSound();

    setTimeout(() => {
        if (wireframePanel && splitHandle) {
            wireframePanel.style.transition = '';
            splitHandle.style.transition = '';
        }
    }, 360);
}

if (splitSlider) {
    window.addEventListener('resize', updateWireframeDimensions);
    window.addEventListener('orientationchange', () => {
        setTimeout(updateWireframeDimensions, 150);
    });
    window.addEventListener('load', updateWireframeDimensions);
    setTimeout(updateWireframeDimensions, 50);

    splitSlider.addEventListener('mousedown', (e) => {
        isSplitDragging = true;
        if (wireframePanel) wireframePanel.style.transition = '';
        if (splitHandle) splitHandle.style.transition = '';
        playClickSound();
        setSplitPosition(e.clientY);
    });

    window.addEventListener('mouseup', () => {
        isSplitDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
        if (isSplitDragging) {
            setSplitPosition(e.clientY);
        }
    });

    splitSlider.addEventListener('touchstart', (e) => {
        isSplitDragging = true;
        if (wireframePanel) wireframePanel.style.transition = '';
        if (splitHandle) splitHandle.style.transition = '';
        playClickSound();
        setSplitPosition(e.touches[0].clientY);
    }, { passive: true });

    window.addEventListener('touchend', () => {
        isSplitDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
        if (isSplitDragging) {
            if (e.cancelable) e.preventDefault();
            setSplitPosition(e.touches[0].clientY);
        }
    }, { passive: false });
}

/* === Mobile Navigation Drawer === */
function toggleMobileNav() {
    const drawer = document.getElementById('mobile-drawer');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    playClickSound();

    if (drawer) {
        const isHidden = drawer.classList.contains('hidden');
        if (isHidden) {
            drawer.classList.remove('hidden');
            if (menuIcon) menuIcon.classList.add('hidden');
            if (closeIcon) closeIcon.classList.remove('hidden');
        } else {
            drawer.classList.add('hidden');
            if (menuIcon) menuIcon.classList.remove('hidden');
            if (closeIcon) closeIcon.classList.add('hidden');
        }
    }
}

/* === Terminal Modal Logic === */
const terminal = document.getElementById('terminal-modal');
const output = document.getElementById('terminal-output');

const terminalSequence = [
    "> Establishing secure connection...",
    "> Connection established: 104.21.34.12",
    "> INIT: Project_Scoping_Protocol",
    "",
    "<span class='text-white font-bold'>SYSTEM: Welcome to NULLSTATE interactive comms.</span>",
    "<span class='text-gray-400'>Please enter your command or type 'contact' to begin.</span>",
    "<span class='text-neon-cyan'>root@client:~$</span> <span class='blink'>_</span>"
];

function openTerminal() {
    terminal.style.display = 'flex';
    output.innerHTML = '';
    let delay = 0;
    
    terminalSequence.forEach((line, index) => {
        setTimeout(() => {
            const p = document.createElement('div');
            p.innerHTML = line;
            output.appendChild(p);
            terminal.scrollTop = terminal.scrollHeight;
            if(line.length > 0 && !line.includes('<span')) playClickSound(); 
        }, delay);
        delay += (index === 0 || index === 1) ? 600 : 300;
    });
}

function closeTerminal() {
    terminal.style.display = 'none';
}

/* === Flagship Project Switcher in #work === */
const projectData = [
    {
        title: "VAULT // Next-Gen Digital Banking & Asset OS",
        tech: "Next.js 15 • Stripe Core • WebSockets",
        prodUrl: "vault.finance/accounts",
        prodBadge: "ENCRYPTED & LIVE",
        wireUrl: "[CAD: FINTECH_CORE]"
    },
    {
        title: "KRONOS // Distributed Neural Pipeline & Real-Time Inference",
        tech: "Rust Core • PyTorch • Triton Edge • gRPC",
        prodUrl: "kronos.network/cluster-07",
        prodBadge: "NEURAL INFERENCE: 4.2ms",
        wireUrl: "[CAD: NEURAL_TENSOR_NPU]"
    },
    {
        title: "AETHER // Autonomous Spatial Commerce & WebGL Showroom",
        tech: "Three.js • WebGL 2.0 • WebGPU • Shopify Headless",
        prodUrl: "aether.studio/spatial-viewport",
        prodBadge: "WEBGL 60FPS: STREAMING",
        wireUrl: "[CAD: SPATIAL_MESH_PIPELINE]"
    }
];

let currentProjectIndex = 0;

function switchProject(index) {
    if (index === currentProjectIndex) return;
    currentProjectIndex = index;
    playClickSound();

    // Update Project Switcher tabs
    for (let i = 0; i < 3; i++) {
        const tab = document.getElementById(`proj-tab-${i}`);
        if (!tab) continue;
        const num = tab.querySelector('.tab-num');
        const title = tab.querySelector('.tab-title');
        if (i === index) {
            tab.classList.add('active');
            if (num) { num.classList.remove('text-gray-500'); num.classList.add('text-neon-cyan'); }
            if (title) { title.classList.remove('text-gray-400'); title.classList.add('text-white'); }
        } else {
            tab.classList.remove('active');
            if (num) { num.classList.remove('text-neon-cyan'); num.classList.add('text-gray-500'); }
            if (title) { title.classList.remove('text-white'); title.classList.add('text-gray-400'); }
        }
    }

    // Update Header metadata
    const proj = projectData[index];
    const subtitle = document.getElementById('project-subtitle');
    const badge = document.getElementById('project-tech-badge');
    if (subtitle) subtitle.innerText = proj.title;
    if (badge) badge.innerText = proj.tech;

    // Update Title bars in slider
    const prodUrl = document.getElementById('prod-title-url');
    const prodBadge = document.getElementById('prod-title-badge');
    const wireUrl = document.getElementById('wire-title-url');
    if (prodUrl) prodUrl.innerText = proj.prodUrl;
    if (prodBadge) prodBadge.innerHTML = `<span class="hidden sm:inline">${proj.prodBadge.split(':')[0]} </span>${proj.prodBadge.includes(':') ? proj.prodBadge.split(':')[1] : proj.prodBadge}`;
    if (wireUrl) wireUrl.innerText = proj.wireUrl;

    // Switch Views in Production and Wireframe layers
    for (let i = 0; i < 3; i++) {
        const prodView = document.getElementById(`proj-view-prod-${i}`);
        const wireView = document.getElementById(`proj-view-wire-${i}`);
        if (prodView) {
            if (i === index) {
                prodView.classList.add('active');
            } else {
                prodView.classList.remove('active');
            }
        }
        if (wireView) {
            if (i === index) {
                wireView.classList.add('active');
            } else {
                wireView.classList.remove('active');
            }
        }
    }

    // Recalculate slider dimensions
    setTimeout(updateWireframeDimensions, 30);
}
