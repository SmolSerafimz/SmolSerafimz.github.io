function createStars() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('star-container');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    container.appendChild(canvas);

    const stars = [];
    const starCount = window.innerWidth < 768 ? 30 : 100; // Lowered for sanity

    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5 + 0.5, // Smaller stars are cheaper
            opacity: Math.random(),
            speed: Math.random() * 0.01 + 0.002 // Slower twinkle
        });
    }

let lastTime = 0;
function draw() {
        // 1. If Light Mode: Wipe, Wait, and Re-check
        if (!document.body.classList.contains('dark-mode')) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setTimeout(() => requestAnimationFrame(draw), 500); // Check every half-second
            return;
        }

        // 2. Clear and Draw Stars
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";

        for (let i = 0; i < stars.length; i++) {
            const star = stars[i];
            star.opacity += star.speed;
            
            // Reverse twinkle direction
            if (star.opacity > 1 || star.opacity < 0) {
                star.speed *= -1;
            }
            
            ctx.globalAlpha = Math.max(0, Math.min(1, star.opacity));
            ctx.fillRect(star.x, star.y, star.size, star.size);
        }

        // 3. Run at standard speed while in Dark Mode
        requestAnimationFrame(draw);
    }
    
    // Initial kickstart
    requestAnimationFrame(draw);

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
