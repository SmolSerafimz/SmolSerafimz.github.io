function createStars() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('star-container');
    
    // Match canvas to window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    container.appendChild(canvas);

    const stars = [];
    const starCount = window.innerWidth < 768 ? 50 : 150;

    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            opacity: Math.random(),
            speed: Math.random() * 0.02 + 0.005
        });
    }

    function draw() {
        if (getComputedStyle(container).visibility === 'hidden') {
            requestAnimationFrame(draw);
            return; // Don't draw if in Light Mode
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";

        stars.forEach(star => {
            star.opacity += star.speed;
            if (star.opacity > 1 || star.opacity < 0) star.speed *= -1;
            
            ctx.globalAlpha = Math.max(0, star.opacity);
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(draw);
    }
    draw();
}

// Fire the engines when the page loads
window.onload = createStars;

const themeCheckbox = document.getElementById('theme-checkbox');

function setTheme(isDark) {
    if (isDark) {
        document.body.classList.add('dark-mode');
        themeCheckbox.checked = true;
    } else {
        document.body.classList.remove('dark-mode');
        themeCheckbox.checked = false;
    }
}

const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    setTheme(true);
} else {
    setTheme(false);
}

themeCheckbox.addEventListener('change', () => {
    const isNowDark = themeCheckbox.checked;
    setTheme(isNowDark);
    localStorage.setItem('theme', isNowDark ? 'dark' : 'light');
});
