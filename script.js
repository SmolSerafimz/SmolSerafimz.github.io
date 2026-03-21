function createStars() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('star-container');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    container.appendChild(canvas);

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
} // <--- THIS WAS THE MISSING BRACKET THAT KILLED THE THEME

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

// 1. Check for saved preference, otherwise check system setting
const savedTheme = localStorage.getItem('theme');
const systemQuery = window.matchMedia('(prefers-color-scheme: dark)');

if (savedTheme) {
    setTheme(savedTheme === 'dark');
} else {
    setTheme(systemQuery.matches);
}

// 2. LISTEN for manual toggle
themeCheckbox.addEventListener('change', () => {
    const isNowDark = themeCheckbox.checked;
    setTheme(isNowDark);
    localStorage.setItem('theme', isNowDark ? 'dark' : 'light');
});

// 3. LISTEN for system-level changes (e.g., sunset/sunrise mode)
systemQuery.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) { // Only auto-switch if user hasn't picked a side
        setTheme(e.matches);
    }
});
