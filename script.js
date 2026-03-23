const comicData = {
    "001": {
        title: "Episode 1 Name",
        image: "assets/ep001_web.webp",
        panels: 4,
        about: "Info about this episode.",
        stats: { like: 12, love: 45, laugh: 5, shock: 2, sad: 0, fire: 28 }
    },
    "002": {
        title: "Episode 2 Name",
        image: "assets/ep002_web.webp",
        panels: 3,
        about: "Info about this episode too.",
        stats: { like: 8, love: 20, laugh: 2, shock: 0, sad: 1, fire: 15 }
    }
};

function loadEpisode(epNumber) {
    const data = comicData[epNumber];
    
    // 1. Safety Check: If data doesn't exist, don't stall the rig
    if (!data) {
        console.error("Episode " + epNumber + " not found in the Archive DNA.");
        return;
    }

    // 2. Update the Title & Image
    document.getElementById('episode-title').innerText = "Episode " + epNumber + ": " + data.title;
    document.getElementById('main-comic-display').src = data.image;

    // 3. Update the 'About' text
    document.getElementById('episode-about-text').innerHTML = `<p>${data.about}</p>`;

    // 4. Regenerate the Panel Dots
    const dotContainer = document.getElementById('panel-dots');
    dotContainer.innerHTML = ''; // Clear old dots
    
    for (let i = 0; i < data.panels; i++) {
        const dot = document.createElement('span');
        dot.className = i === 0 ? 'dot active' : 'dot'; // First dot is active
        dotContainer.appendChild(dot);
    }

    // 5. Update Reaction Counts (If we decide to show them)
    // We'll wire the actual 'Number' display once the UI for counts is 100% sealed
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

const reactionBtns = document.querySelectorAll('.reaction-btn');

reactionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove 'selected' from all other buttons in the bar
        reactionBtns.forEach(b => b.classList.remove('selected'));
        
        // Add 'selected' to the one you just clicked
        btn.classList.add('selected');
        
        // Add a small 'thump' animation effect
        btn.style.transform = "scale(1.3)";
        setTimeout(() => {
            btn.style.transform = "";
        }, 150);
    });
});
