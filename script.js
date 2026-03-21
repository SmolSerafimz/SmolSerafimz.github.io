function createStars() {
    const container = document.getElementById('star-container');
    const starCount = 150; // Adjust for density

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Randomize position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        // Randomize size (1px to 3px)
        const size = Math.random() * 2 + 1;
        
        // Randomize twinkle speed
        const duration = Math.random() * 3 + 2;

        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.setProperty('--duration', `${duration}s`);

        container.appendChild(star);
    }
}

// Fire the engines when the page loads
window.onload = createStars;

const themeCheckbox = document.getElementById('theme-checkbox');

themeCheckbox.addEventListener('change', () => {
    if (themeCheckbox.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
});

// Check for saved preference on load
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeCheckbox.checked = true; // Make sure the toggle is on the right
}
