let comicData = {};

fetch('data/episodes.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to load episodes.json: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        comicData = data;

        initializeSite();
    })
    .catch(error => {
        console.error('Failed to load episode data:', error);
    });

function loadEpisode(epNumber) {
    const data = comicData[epNumber];
    if (!data) return;

    document.getElementById('episode-title').innerText = "Episode " + epNumber + ": " + data.title;
    document.getElementById('main-comic-display').src = data.image;
    document.getElementById('episode-about-text').innerHTML = `<p>${data.intro}</p>`;

    const dotContainer = document.getElementById('panel-dots');
    dotContainer.innerHTML = ''; 
    
    for (let i = 0; i < data.info.panels; i++) {
        const dot = document.createElement('span');
        const panelNumber = i + 1;
        dot.className = (i === 0) ? 'dot active' : 'dot';
        
        dot.onclick = function() {
            document.getElementById('main-comic-display').src = `assets/${epNumber}_${panelNumber}.webp`;
            
            document.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
        };

        dotContainer.appendChild(dot);
    }
}

function createStars() {
    
    const container = document.getElementById('star-container');
    if (!container) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    container.appendChild(canvas);

    let stars = [];

    function generateStars() {
        stars = [];
        const starCount = window.innerWidth < 768 ? 30 : 100;

        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 1.5 + 0.5,
                opacity: Math.random(),
                speed: Math.random() * 0.01 + 0.002
            });
        }
    }

    generateStars();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        generateStars(); // Re-calculates coordinates for the new screen size
    });
    
    function draw() {
        if (!document.body.classList.contains('dark-mode')) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setTimeout(() => requestAnimationFrame(draw), 500);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";

        for (let i = 0; i < stars.length; i++) {
            const star = stars[i];
            star.opacity += star.speed;
            if (star.opacity > 1 || star.opacity < 0) {
                star.speed *= -1;
            }
            ctx.globalAlpha = Math.max(0, Math.min(1, star.opacity));
            ctx.fillRect(star.x, star.y, star.size, star.size);
        }
        requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
}

const themeCheckbox = document.getElementById('theme-checkbox');

function setTheme(isDark) {
    if (isDark) {
        document.body.classList.add('dark-mode');
        themeCheckbox.checked = true;
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        themeCheckbox.checked = false;
        localStorage.setItem('theme', 'light');
    }
}

const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme) {
    setTheme(savedTheme === 'dark');
} else {
    setTheme(systemPrefersDark);
}

if (themeCheckbox) {
    themeCheckbox.addEventListener('change', () => {
        setTheme(themeCheckbox.checked);
    });
}

const worldQuotes = [
    { text: "I'm smol and fun my name is Bun!", author: "Bun" },
    { text: "I'm serious and tough my name is Fluff!", author: "Fluff" },
    { text: "Much yumminess!", author: "Cake" }
];

function setDailyQuote() {
    const quoteElement = document.getElementById('daily-quote');
    const authorElement = document.querySelector('.quote-box small');
    
    if (!quoteElement || !authorElement) return;
    const today = new Date();
    const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

    const index = dateSeed % worldQuotes.length;
    const selected = worldQuotes[index];

    quoteElement.innerText = `"${selected.text}"`;
    authorElement.innerText = `— ${selected.author}`;
}

function populateArchive() {
    const archiveList = document.getElementById('archive-list');
    if (!archiveList) return;


    archiveList.innerHTML = '';

    const keys = Object.keys(comicData).sort((a, b) => b.localeCompare(a));

    keys.forEach(epKey => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        
        a.href = "#";
        const epTitle = comicData[epKey].title;
        a.innerText = `${epKey}: ${epTitle}`;
        
        a.onclick = (e) => {
            e.preventDefault();
            loadEpisode(epKey);
        };

        li.appendChild(a);
        archiveList.appendChild(li);
    });
}

function updateUniversalTicker() {
    const ticker = document.querySelector('.ticker-text');
    if (ticker) {
        ticker.innerText = "Welcome to the official home of Smol Serafimz! Plenty of hijinks and adventures to come!";
    }
}

function initializeSite() {
    const episodeKeys = Object.keys(comicData);

    if (document.getElementById('main-comic-display')) {
        const latestEp = Math.max(...episodeKeys.map(Number));
        const paddedEp = latestEp.toString().padStart(3, '0');
        loadEpisode(paddedEp);
    }

    createStars();
    updateUniversalTicker();
    setDailyQuote();
    populateArchive();
}

