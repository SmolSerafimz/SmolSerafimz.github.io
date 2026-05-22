const comicData = {
    "001": {
        title: "The Prologue",
        image: "assets/001_1.webp",
        panels: 4,
        about: "The official beginning of the Smol Serafimz story! In a cozy care free world where many beings live in harmony, a question arises among the gnomes if anything is amiss in their eternal journey. The Primordial was already aware of this so he sent his little agents to remedy the situation."
    },
        "002": {
        title: "The First Ever",
        image: "assets/002_1.webp",
        panels: 3,
        about: "The messengers of fun are finally here! The valley is about to be much more interesting from now on with this trio around. Lots of hijinks and play ahead. Join them in the following episodes as they discover the world around them and have fun everywhere!"
    },
        "003": {
        title: "Pillow Attac",
        image: "assets/003_1.webp",
        panels: 3,
        about: "It's a brand new day and Bun is up to something. Whatever mischievous things does she plot?"
    },
        "004": {
        title: "Pro-cat-ination",
        image: "assets/004_1.webp",
        panels: 4,
        about: "Fluff has decided that its important to study so she borrowed some cool sounding books from Scribes the librarian gnome. But Cake is not very keen on her academic endeavours at the moment."
    },
        "005": {
        title: "Cotton Candy",
        image: "assets/005_1.webp",
        panels: 3,
        about: "Cotton Candy season is here and Fluff already found one in the fields. But these are always troublesome to eat when you are fluffy. But fear not Bun is here to help!"
    },        
        "006": {
        title: "Fast Cake",
        image: "assets/006_1.webp",
        panels: 1,
        about: "Munching pretzels a moment ago and speeding by on a superbike the next. Cake is quite unpredictable. She must have found it in Tinkerhat's yard."
    },
        "007": {
        title: "Bun Appetite",
        image: "assets/007_1.webp",
        panels: 3,
        about: "When Bun is up to something she is a force to be reckoned with."
    }
};
function loadEpisode(epNumber) {
    const data = comicData[epNumber];
    if (!data) return;

    document.getElementById('episode-title').innerText = "Episode " + epNumber + ": " + data.title;
    document.getElementById('main-comic-display').src = data.image;
    document.getElementById('episode-about-text').innerHTML = `<p>${data.about}</p>`;

    const dotContainer = document.getElementById('panel-dots');
    dotContainer.innerHTML = ''; 
    
    for (let i = 0; i < data.panels; i++) {
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

const episodeKeys = Object.keys(comicData); 

if (document.getElementById('main-comic-display')) {
    const latestEp = Math.max(...episodeKeys.map(Number));
    const paddedEp = latestEp.toString().padStart(3, '0');
    loadEpisode(paddedEp);
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

window.addEventListener('load', () => {
    createStars();
    updateUniversalTicker();
    setDailyQuote();
    populateArchive();
});

