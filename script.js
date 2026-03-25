const comicData = {
    "001": {
        title: "Episode 1 Name",
        image: "assets/001_1.webp",
        panels: 4,
        about: "Info about this episode."
    },
    "002": {
        title: "Episode 2 Name",
        image: "assets/002_1.webp",
        panels: 3,
        about: "Info about this episode too."
    },
    "003": {
        title: "Episode 3 Name",
        image: "assets/003_1.webp",
        panels: 3,
        about: "Info about this episode as well",
    }
};

function loadEpisode(epNumber) {
    // Ensure epNumber is a string to match keys like "001"
    const data = comicData[epNumber];
    if (!data) return;

    document.querySelector('.ticker-text').innerText = "Welcome to the official home of Smol Serafimz! Plenty of hijinks and adventures to come!";

    // Reset view to first panel when an episode loads
    document.getElementById('episode-title').innerText = "Episode " + epNumber + ": " + data.title;
    document.getElementById('main-comic-display').src = data.image; // Loads the default image from DNA
    document.getElementById('episode-about-text').innerHTML = `<p>${data.about}</p>`;

    const dotContainer = document.getElementById('panel-dots');
    dotContainer.innerHTML = ''; 
    
    for (let i = 0; i < data.panels; i++) {
        const dot = document.createElement('span');
        const panelNumber = i + 1; // Creates 1, 2, 3...
        dot.className = (i === 0) ? 'dot active' : 'dot';
        
        dot.onclick = function() {
            // THE WELD: This now actually swaps the image!
            document.getElementById('main-comic-display').src = `assets/${epNumber}_${panelNumber}.webp`;
            
            // Visual feedback: Move the 'active' class
            document.querySelectorAll('.dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
        };

        dotContainer.appendChild(dot);
    }
}

function createStars() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('star-container');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    container.appendChild(canvas);

    window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    });

    const stars = [];
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

window.addEventListener('load', createStars);

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

const episodeKeys = Object.keys(comicData); 

const latestEp = Math.max(...episodeKeys.map(Number));

const paddedEp = latestEp.toString().padStart(3, '0');

loadEpisode(paddedEp);

const worldQuotes = [
    { text: "Test quote 3.", author: "Heh" },
    { text: "Test quote 4", author: "Haha" },
    { text: "Test quote 2.", author: "Giggle" },
    { text: "Test quote 1.", author: "Funny" }
];

function setDailyQuote() {
    const quoteElement = document.getElementById('daily-quote');
    const authorElement = document.querySelector('.quote-box small');
    
    // Pick a random index from the Quote DNA
    const randomIndex = Math.floor(Math.random() * worldQuotes.length);
    const selected = worldQuotes[randomIndex];

    quoteElement.innerText = `"${selected.text}"`;
    authorElement.innerText = `— ${selected.author}`;
}

// Add this to your window.addEventListener('load', ...) or just call it:
setDailyQuote();

function populateArchive() {
    const archiveList = document.getElementById('archive-list');
    if (!archiveList) return;

    // Clear any existing "Scrap"
    archiveList.innerHTML = '';

    // Get all keys ("001", "002", etc.), sort them descending (Newest first)
    const keys = Object.keys(comicData).sort((a, b) => b.localeCompare(a));

    keys.forEach(epKey => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        
        a.href = "#";
        const epTitle = comicData[epKey].title;
        a.innerText = `${epKey}: ${epTitle}`;
        
        // When clicked, load that episode
        a.onclick = (e) => {
            e.preventDefault();
            loadEpisode(epKey);
        };

        li.appendChild(a);
        archiveList.appendChild(li);
    });
}

populateArchive();
