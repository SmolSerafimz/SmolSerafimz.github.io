// ==========================================
// GLOBAL DATA
// ==========================================

let comicData = {};
let updatesData = {};
let siteContentData = {};
let mapLocationsData = {};
let spinOffData = {};

let currentEpisode = null;
let currentSpinOff = null;
let worldMap = null;

const MAP_SIZE = 8192;


// ==========================================
// DATA LOADING
// ==========================================

function fetchJSON(path, optional = false) {
    return fetch(path).then(response => {
        if (!response.ok) {
            if (optional && response.status === 404) {
                console.warn(`${path} was not found. Continuing without it.`);
                return {};
            }

            throw new Error(`Failed to load ${path}: ${response.status}`);
        }

        return response.json();
    });
}

Promise.all([
    fetchJSON('data/episodes.json'),
    fetchJSON('data/updates.json'),
    fetchJSON('data/site-content.json'),
    fetchJSON('data/locations.json'),
    fetchJSON('data/spinoffs.json', true)
])

.then(([episodes, updates, siteContent, locations, spinoffs]) => {

    comicData = episodes || {};
    updatesData = updates || {};
    siteContentData = siteContent || {};
    mapLocationsData = locations || {};
    spinOffData = spinoffs || {};

    populateSeasonSelector();
    setupSeasonNavigation();

    setupDownloadsNavigation();
    setupMapNavigation();
    setupAdditionalNavigation();

    initializeSite();

})

.catch(error => {

    console.error('Failed to load site data:', error);

});


// ==========================================
// GENERAL HELPERS
// ==========================================

function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => {
        const entities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };

        return entities[character];
    });
}


function formatTextBlocks(text) {
    if (typeof text !== 'string' || !text.trim()) {
        return '';
    }

    return text
        .split(/\n\s*\n/)
        .map(block => {

            const lines = block.split('\n');

            if (lines.every(line => line.trim().startsWith('- '))) {

                const items = lines
                    .map(line => {
                        return `<li>${escapeHTML(line.trim().substring(2))}</li>`;
                    })
                    .join('');

                return `<ul>${items}</ul>`;
            }

            return `<p>${lines
                .map(line => escapeHTML(line))
                .join('<br>')}</p>`;

        })
        .join('');
}


function getLatestEpisode() {
    const episodeNumbers = Object.keys(comicData)
        .map(Number)
        .filter(number => Number.isFinite(number));

    if (!episodeNumbers.length) return null;

    return String(Math.max(...episodeNumbers)).padStart(3, '0');
}


function getSortedSpinOffIds() {
    return Object.keys(spinOffData).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
    );
}


// ==========================================
// EPISODE LOADING
// ==========================================

function loadEpisode(epNumber, scrollToComic = false) {

    const data = comicData[epNumber];
    if (!data) return;

    currentEpisode = epNumber;

    const episodeTitle = document.getElementById('episode-title');
    const comicImage = document.getElementById('main-comic-display');
    const aboutText = document.getElementById('episode-about-text');
    const dotContainer = document.getElementById('panel-dots');

    if (episodeTitle) {
        episodeTitle.textContent =
            `Episode ${epNumber}: ${data.title || ''}`;
    }

    if (comicImage) {
        comicImage.src = data.image || '';
        comicImage.alt = `Episode ${epNumber}: ${data.title || 'Comic'}`;
    }

    if (aboutText) {
        aboutText.innerHTML = formatTextBlocks(data.intro || '');
    }

    if (dotContainer) {

        dotContainer.replaceChildren();

        const panelCount = Number(data.info?.panels) || 0;

        for (let i = 0; i < panelCount; i++) {

            const dot = document.createElement('span');
            const panelNumber = i + 1;

            dot.className = i === 0 ? 'dot active' : 'dot';
            dot.setAttribute('role', 'button');
            dot.setAttribute('tabindex', '0');
            dot.setAttribute('aria-label', `Show panel ${panelNumber}`);

            const changePanel = () => {

                if (comicImage) {
                    comicImage.src = `assets/${epNumber}_${panelNumber}.webp`;
                }

                dotContainer.querySelectorAll('.dot').forEach(existingDot => {
                    existingDot.classList.remove('active');
                });

                dot.classList.add('active');
            };

            dot.addEventListener('click', changePanel);

            dot.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    changePanel();
                }
            });

            dotContainer.appendChild(dot);
        }
    }

    updateEpisodeNavigation(epNumber);

    const seasonSelector = document.getElementById('season-selector');

    if (seasonSelector && data.info?.season !== undefined) {
        seasonSelector.value = String(data.info.season);
    }

    if (scrollToComic) {
        const comicBox = document.getElementById('comic-box');

        if (comicBox) {
            comicBox.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}


// ==========================================
// SEASON NAVIGATION
// ==========================================

function populateSeasonSelector() {

    const seasonSelector = document.getElementById('season-selector');

    if (!seasonSelector) return;

    const seasons = [
        ...new Set(
            Object.values(comicData)
                .map(episode => episode.info?.season)
                .filter(season => season !== undefined)
        )
    ].sort((a, b) => a - b);

    seasonSelector.replaceChildren();

    seasons.forEach(season => {

        const option = document.createElement('option');

        option.value = season;
        option.textContent = `Season ${season}`;

        seasonSelector.appendChild(option);
    });

    if (seasons.includes(1)) {
        seasonSelector.value = '1';
    }
}


function setupSeasonNavigation() {

    const seasonSelector = document.getElementById('season-selector');
    const readFromBeginningButton = document.getElementById('read-from-beginning');

    if (!seasonSelector || !readFromBeginningButton) return;

    readFromBeginningButton.onclick = function() {

        const selectedSeason = Number(seasonSelector.value);

        const firstEpisode = Object.keys(comicData)
            .filter(epNumber =>
                Number(comicData[epNumber].info?.season) === selectedSeason
            )
            .sort((a, b) => Number(a) - Number(b))[0];

        if (!firstEpisode) return;

        navigateToEpisode(firstEpisode);
    };
}


// ==========================================
// EPISODE HISTORY AND NAVIGATION
// ==========================================

function navigateToEpisode(epNumber) {

    if (!comicData[epNumber]) return;

    history.pushState(
        { episode: epNumber },
        '',
        `comic.html?episode=${encodeURIComponent(epNumber)}`
    );

    showComic();
    loadEpisode(epNumber, true);
}


function updateEpisodeNavigation(epNumber) {

    const data = comicData[epNumber];

    const previousButton = document.getElementById('previous-episode');
    const nextButton = document.getElementById('next-episode');

    if (!data) return;

    if (previousButton) {

        const previous = data.info?.previous;

        previousButton.disabled = !previous || !comicData[previous];

        previousButton.onclick = previous && comicData[previous]
            ? () => navigateToEpisode(previous)
            : null;
    }

    if (nextButton) {

        const next = data.info?.next;

        nextButton.disabled = !next || !comicData[next];

        nextButton.onclick = next && comicData[next]
            ? () => navigateToEpisode(next)
            : null;
    }
}


// ==========================================
// NAVIGATION SETUP
// ==========================================

function setupDownloadsNavigation() {

    const downloadsLink = document.getElementById('downloads-link');
    const comicLink = document.getElementById('comic-link');

    if (downloadsLink) {
        downloadsLink.addEventListener('click', event => {
            event.preventDefault();
            navigateToPage('downloads');
        });
    }

    if (comicLink) {
        comicLink.addEventListener('click', event => {
            event.preventDefault();

            const episode = currentEpisode && comicData[currentEpisode]
                ? currentEpisode
                : getLatestEpisode();

            if (!episode) {
                navigateToPage('comic');
                return;
            }

            navigateToEpisode(episode);
        });
    }
}


function setupMapNavigation() {

    const mapLink = document.getElementById('map-link');

    if (!mapLink) return;

    mapLink.addEventListener('click', event => {
        event.preventDefault();
        navigateToPage('map');
    });
}


function setupAdditionalNavigation() {

    const navigation = [
        { id: 'about-link', page: 'about' },
        { id: 'spin-offs-link', page: 'spin-offs' },
        { id: 'updates-link', page: 'updates' }
    ];

    navigation.forEach(({ id, page }) => {

        const link = document.getElementById(id);

        if (!link) return;

        link.addEventListener('click', event => {
            event.preventDefault();
            navigateToPage(page);
        });
    });

    // Also support links to Past Updates that do not have an ID.
    document.querySelectorAll('a[href*="?updates"]').forEach(link => {

        if (link.id === 'updates-link') return;

        link.addEventListener('click', event => {
            event.preventDefault();
            navigateToPage('updates');
        });
    });
}


function navigateToPage(page) {

    const routes = {
        comic: 'comic.html',
        downloads: 'comic.html?downloads',
        map: 'comic.html?map',
        about: 'comic.html?about',
        'spin-offs': 'comic.html?spin-offs',
        updates: 'comic.html?updates'
    };

    if (!routes[page]) return;

    history.pushState(
        { page },
        '',
        routes[page]
    );

    switch (page) {
        case 'downloads':
            showDownloads();
            break;

        case 'map':
            showMap();
            break;

        case 'about':
            showAbout();
            break;

        case 'spin-offs':
            showSpinOffs();
            break;

        case 'updates':
            showUpdates();
            break;

        default: {
            const episode = currentEpisode && comicData[currentEpisode]
                ? currentEpisode
                : getLatestEpisode();

            showComic();

            if (episode) loadEpisode(episode);
        }
    }
}


// ==========================================
// PAGE VISIBILITY AND ACTIVE NAVIGATION
// ==========================================

function hidePageSections() {

    const sections = [
        'comic-box',
        'downloads-box',
        'about-box',
        'spin-offs-box',
        'updates-box',
        'map-box',
        'latest-update'
    ];

    sections.forEach(id => {

        const element = document.getElementById(id);

        if (element) {
            element.style.display = 'none';
        }
    });

    const rightColumn = document.getElementById('right-column');

    if (rightColumn) {
        rightColumn.style.display = 'none';
    }

    const wrapper = document.getElementById('site-wrapper');

    if (wrapper) {
        wrapper.classList.remove(
            'downloads-layout',
            'about-layout',
            'spin-offs-layout',
            'updates-layout'
        );
    }

    document.querySelectorAll('.sidebar a, nav a, .navigation a, .nav-links a').forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
    });
}


function setActiveLink(id) {

    const link = document.getElementById(id);

    if (!link) return;

    link.classList.add('active');
    link.setAttribute('aria-current', 'page');
}

// ==========================================
// DOWNLOADS PAGE
// ==========================================

function showDownloads() {

    hidePageSections();

    const wrapper = document.getElementById('site-wrapper');
    const box = document.getElementById('downloads-box');

    if (wrapper) {
        wrapper.classList.add('downloads-layout');
    }

    if (box) {
        box.style.display = 'block';
    }

    setActiveLink('downloads-link');

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}


// ==========================================
// MAP PAGE
// ==========================================

function showMap() {

    hidePageSections();

    const wrapper = document.getElementById('site-wrapper');
    const box = document.getElementById('map-box');

    if (wrapper) {
        wrapper.classList.add('downloads-layout');
    }

    if (box) {
        box.style.display = 'block';
    }

    setActiveLink('map-link');

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    initializeWorldMap();
}


function initializeWorldMap() {

    const mapElement = document.getElementById('world-map');

    if (!mapElement) return;

    if (typeof L === 'undefined') {
        console.error('Leaflet is unavailable. The map cannot be initialized.');
        return;
    }

    if (worldMap) {

        requestAnimationFrame(() => {
            worldMap.invalidateSize();
        });

        return;
    }

    const mapBounds = [
        [0, 0],
        [MAP_SIZE, MAP_SIZE]
    ];

    worldMap = L.map(mapElement, {
        crs: L.CRS.Simple,
        minZoom: -5,
        maxBounds: mapBounds,
        maxBoundsViscosity: 1.0
    });

    L.imageOverlay(
        'assets/Cozy Realm - Living Map.webp',
        mapBounds
    ).addTo(worldMap);

    worldMap.fitBounds(mapBounds);

    Object.entries(mapLocationsData).forEach(([id, location]) => {

        const coordinates = location?.map;

        if (
            !coordinates ||
            typeof coordinates.x !== 'number' ||
            typeof coordinates.y !== 'number' ||
            typeof coordinates.radius !== 'number'
        ) {
            return;
        }

        const marker = L.circle(
            [
                MAP_SIZE - coordinates.y,
                coordinates.x
            ],
            {
                radius: coordinates.radius,
                opacity: 0,
                fillOpacity: 0
            }
        ).addTo(worldMap);

        const popup = document.createElement('div');

        const heading = document.createElement('strong');
        heading.textContent = location.title || 'Unknown location';

        const description = document.createElement('p');
        description.textContent = location.intro || '';

        const link = document.createElement('a');

        link.href =
            `wiki.html?type=location&id=${encodeURIComponent(id)}`;

        link.textContent = 'Open Wiki';

        popup.append(heading, description, link);

        marker.bindPopup(popup);
    });

    requestAnimationFrame(() => {
        worldMap.invalidateSize();
    });
}


// ==========================================
// ABOUT PAGE
// ==========================================

function showAbout() {

    hidePageSections();

    const wrapper = document.getElementById('site-wrapper');
    const box = document.getElementById('about-box');

    if (wrapper) {
        wrapper.classList.add('about-layout');
    }

    if (box) {
        box.style.display = 'block';
    }

    setActiveLink('about-link');

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}


// ==========================================
// SPIN-OFFS PAGE
// ==========================================

function showSpinOffs() {

    hidePageSections();

    const wrapper = document.getElementById('site-wrapper');
    const box = document.getElementById('spin-offs-box');
    const rightColumn = document.getElementById('right-column');

    const comicArchive = document.getElementById('comic-archive-box');
    const spinOffArchive = document.getElementById('spin-offs-archive-box');

    if (wrapper) {
        wrapper.classList.add('spin-offs-layout');
    }

    if (box) {
        box.style.display = 'block';
    }

    if (rightColumn) {
        rightColumn.style.display = '';
    }

    if (comicArchive) {
        comicArchive.style.display = 'none';
    }

    if (spinOffArchive) {
        spinOffArchive.style.display = 'block';
    }

    setActiveLink('spin-offs-link');

    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get('id');

    const ids = getSortedSpinOffIds();

    const id = requestedId && spinOffData[requestedId]
        ? requestedId
        : ids[0];

    if (id) {
        loadSpinOff(id, false);
    } else {
        currentSpinOff = null;

        const content = document.getElementById('spin-offs-content');

        if (content) {
            content.textContent = 'No spin-offs have been added yet.';
        }
    }

    populateSpinOffArchive();

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}


function populateSpinOffArchive() {

    const archive = document.getElementById('spin-offs-archive');

    if (!archive) return;

    archive.replaceChildren();

    const ids = getSortedSpinOffIds();

    if (!ids.length) {

        const message = document.createElement('li');

        message.textContent = 'No spin-offs available yet.';

        archive.appendChild(message);

        return;
    }

    ids.forEach(id => {

        const item = document.createElement('li');

        const link = document.createElement('a');

        link.href = `comic.html?spin-offs&id=${encodeURIComponent(id)}`;

        link.textContent = `${id}: ${spinOffData[id].title || id}`;

        if (id === currentSpinOff) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }

        link.addEventListener('click', event => {

            event.preventDefault();

            loadSpinOff(id);

        });

        item.appendChild(link);

        archive.appendChild(item);

    });
}


function loadSpinOff(id, updateUrl = true) {

    const entry = spinOffData[id];

    const content = document.getElementById('spin-offs-content');

    if (!entry || !content) return;

    currentSpinOff = id;

    if (updateUrl) {

        history.pushState(
            { page: 'spin-offs', id },
            '',
            `comic.html?spin-offs&id=${encodeURIComponent(id)}`
        );
    }

    content.replaceChildren();

    // Title

    const title = document.createElement('h2');

    title.textContent = entry.title || id;

    content.appendChild(title);

    // Artwork

    if (entry.image) {

        const image = document.createElement('img');

        image.src = entry.image;
        image.alt = entry.title || 'Spin-off artwork';
        image.loading = 'lazy';

        content.appendChild(image);
    }

    // Introduction box

    if (entry.intro) {

        const introBox = document.createElement('div');

        introBox.className = 'box spinoff-intro-box';

        const intro = document.createElement('p');

        intro.textContent = entry.intro;

        introBox.appendChild(intro);

        content.appendChild(introBox);
    }

    // Previous and Next navigation

    const ids = getSortedSpinOffIds();
    const index = ids.indexOf(id);

    const navigation = document.createElement('div');

    navigation.className = 'spin-off-navigation';

    const previousButton = document.createElement('button');

    previousButton.type = 'button';
    previousButton.textContent = 'Previous';
    previousButton.disabled = index <= 0;

    previousButton.addEventListener('click', () => {

        if (index > 0) {
            loadSpinOff(ids[index - 1]);
        }
    });

    const nextButton = document.createElement('button');

    nextButton.type = 'button';
    nextButton.textContent = 'Next';
    nextButton.disabled = index < 0 || index >= ids.length - 1;

    nextButton.addEventListener('click', () => {

        if (index >= 0 && index < ids.length - 1) {
            loadSpinOff(ids[index + 1]);
        }
    });

    navigation.append(previousButton, nextButton);

    content.appendChild(navigation);

    // Refresh archive selection

    populateSpinOffArchive();
}

// ==========================================
// UPDATES PAGE
// ==========================================

function showUpdates() {

    hidePageSections();

    const wrapper = document.getElementById('site-wrapper');
    const box = document.getElementById('updates-box');

    if (wrapper) {
        wrapper.classList.add('updates-layout');
    }

    if (box) {
        box.style.display = 'block';
    }

    populateUpdatesArchive();

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}


function populateUpdatesArchive() {

    const archive = document.getElementById('updates-archive-content');

    if (!archive) return;

    archive.replaceChildren();

    const updates = Array.isArray(updatesData.updates)
        ? updatesData.updates
        : [];

    if (!updates.length) {

        const emptyMessage = document.createElement('p');

        emptyMessage.textContent = 'There are no updates to display yet.';

        archive.appendChild(emptyMessage);

        return;
    }

    updates.forEach(update => {

        const item = document.createElement('article');

        item.className = 'box update-archive-item';

        const heading = document.createElement('h2');

        heading.textContent = update.title || 'Site update';

        const body = document.createElement('div');

        body.innerHTML = formatTextBlocks(update.text || '');

        const date = document.createElement('small');

        date.textContent = update.date || '';

        item.append(heading, body, date);

        archive.appendChild(item);
    });
}


// ==========================================
// LATEST UPDATE
// ==========================================

function populateLatestUpdate() {

    const updateElement = document.getElementById('latest-update-content');
    const toggleButton = document.getElementById('latest-update-toggle');

    const latest = updatesData.updates?.[0];

    if (!updateElement || !latest) return;

    updateElement.innerHTML = `
        <h3>${escapeHTML(latest.title || '')}</h3>
        ${formatTextBlocks(latest.text || '')}
        <small>${escapeHTML(latest.date || '')}</small>
    `;

    updateElement.style.maxHeight = '180px';
    updateElement.style.overflow = 'hidden';
    updateElement.dataset.expanded = 'false';

    if (!toggleButton) return;

    toggleButton.textContent = 'Show more';
    toggleButton.style.display = 'none';
    toggleButton.onclick = null;

    requestAnimationFrame(() => {

        const contentHeight = updateElement.scrollHeight;

        if (contentHeight <= 185) return;

        toggleButton.style.display = 'inline-block';

        toggleButton.onclick = () => {

            const expanded =
                updateElement.dataset.expanded === 'true';

            updateElement.dataset.expanded = String(!expanded);

            updateElement.style.maxHeight = expanded
                ? '180px'
                : `${contentHeight}px`;

            toggleButton.textContent = expanded
                ? 'Show more'
                : 'Show less';
        };
    });
}


// ==========================================
// COMIC PAGE
// ==========================================

function showComic() {

    hidePageSections();

    const comicBox = document.getElementById('comic-box');
    const latestUpdate = document.getElementById('latest-update');
    const rightColumn = document.getElementById('right-column');

    const comicArchive = document.getElementById('comic-archive-box');
    const spinOffArchive = document.getElementById('spin-offs-archive-box');

    if (comicBox) {
        comicBox.style.display = 'block';
    }

    if (latestUpdate) {
        latestUpdate.style.display = 'block';
    }

    if (rightColumn) {
        rightColumn.style.display = '';
    }

    if (comicArchive) {
        comicArchive.style.display = 'block';
    }

    if (spinOffArchive) {
        spinOffArchive.style.display = 'none';
    }

    setActiveLink('comic-link');

    populateLatestUpdate();
}


// ==========================================
// COMIC ARCHIVE
// ==========================================

function populateArchive() {

    const archiveList = document.getElementById('archive-list');

    if (!archiveList) return;

    archiveList.replaceChildren();

    Object.keys(comicData)
        .sort((a, b) => Number(b) - Number(a))
        .forEach(epKey => {

            const item = document.createElement('li');

            const link = document.createElement('a');

            link.href =
                `comic.html?episode=${encodeURIComponent(epKey)}`;

            link.textContent =
                `${epKey}: ${comicData[epKey].title || ''}`;

            link.addEventListener('click', event => {

                event.preventDefault();

                navigateToEpisode(epKey);
            });

            item.appendChild(link);

            archiveList.appendChild(item);
        });
}


// ==========================================
// TICKER
// ==========================================

function updateUniversalTicker() {

    const ticker = document.querySelector('.ticker-text');

    const messages = siteContentData.ticker;

    if (!ticker || !Array.isArray(messages) || !messages.length) {
        return;
    }

    ticker.textContent =
        messages[Math.floor(Math.random() * messages.length)];
}


// ==========================================
// DAILY QUOTE
// ==========================================

function setDailyQuote() {

    const quoteElement = document.getElementById('daily-quote');

    const authorElement = document.querySelector('.quote-box small');

    const quotes = siteContentData.quotes;

    if (
        !quoteElement ||
        !authorElement ||
        !Array.isArray(quotes) ||
        !quotes.length
    ) {
        return;
    }

    const today = new Date();

    const dateSeed =
        today.getFullYear() * 10000 +
        (today.getMonth() + 1) * 100 +
        today.getDate();

    const selected = quotes[dateSeed % quotes.length];

    quoteElement.textContent = `"${selected.text || ''}"`;

    authorElement.textContent = `— ${selected.author || ''}`;
}


// ==========================================
// SITE INITIALIZATION
// ==========================================

function initializeSite() {

    createStars();

    updateUniversalTicker();
    setDailyQuote();

    populateArchive();
    populateLatestUpdate();

    const params = new URLSearchParams(window.location.search);

    if (params.has('map')) {

        showMap();

    } else if (params.has('updates')) {

        showUpdates();

    } else if (params.has('downloads')) {

        showDownloads();

    } else if (params.has('about')) {

        showAbout();

    } else if (params.has('spin-offs')) {

        showSpinOffs();

    } else {

        const requestedEpisode = params.get('episode');

        const episode = requestedEpisode && comicData[requestedEpisode]
            ? requestedEpisode
            : getLatestEpisode();

        if (episode) {

            showComic();

            loadEpisode(episode);

            if (!requestedEpisode || !comicData[requestedEpisode]) {

                history.replaceState(
                    { episode },
                    '',
                    `comic.html?episode=${encodeURIComponent(episode)}`
                );
            }
        }
    }
}


// ==========================================
// BROWSER BACK / FORWARD NAVIGATION
// ==========================================

window.addEventListener('popstate', () => {

    const params = new URLSearchParams(window.location.search);

    if (params.has('map')) {

        showMap();

    } else if (params.has('updates')) {

        showUpdates();

    } else if (params.has('downloads')) {

        showDownloads();

    } else if (params.has('about')) {

        showAbout();

    } else if (params.has('spin-offs')) {

        showSpinOffs();

    } else {

        const requestedEpisode = params.get('episode');

        const episode = requestedEpisode && comicData[requestedEpisode]
            ? requestedEpisode
            : getLatestEpisode();

        if (episode) {

            showComic();

            loadEpisode(episode);
        }
    }
});


// ==========================================
// STAR GENERATION
// ORIGINAL FUNCTION - LEFT UNCHANGED
// ==========================================

function createStars() {

    const container = document.getElementById('star-container');
    if (!container) return;

    if (container.querySelector('canvas')) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    container.appendChild(canvas);

    let stars = [];

    function generateStars() {

        stars = [];

        const starCount =
            window.innerWidth < 768 ? 30 : 100;

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

        generateStars();

    });

    function draw() {

        if (!document.body.classList.contains('dark-mode')) {

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            setTimeout(
                () => requestAnimationFrame(draw),
                500
            );

            return;
        }

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle = "white";

        for (let i = 0; i < stars.length; i++) {

            const star = stars[i];

            star.opacity += star.speed;

            if (
                star.opacity > 1 ||
                star.opacity < 0
            ) {
                star.speed *= -1;
            }

            ctx.globalAlpha =
                Math.max(
                    0,
                    Math.min(1, star.opacity)
                );

            ctx.fillRect(
                star.x,
                star.y,
                star.size,
                star.size
            );
        }

        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
}


// ==========================================
// THEME
// ==========================================

const themeCheckbox =
    document.getElementById('theme-checkbox');


function setTheme(isDark) {

    document.body.classList.toggle('dark-mode', Boolean(isDark));

    if (themeCheckbox) {
        themeCheckbox.checked = Boolean(isDark);
    }

    try {

        localStorage.setItem(
            'theme',
            isDark ? 'dark' : 'light'
        );

    } catch (error) {

        console.warn('Theme preference could not be saved:', error);
    }
}


let savedTheme = null;

try {

    savedTheme = localStorage.getItem('theme');

} catch (error) {

    console.warn('Theme preference could not be read:', error);
}


const systemPrefersDark =
    window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;


setTheme(
    savedTheme !== null
        ? savedTheme === 'dark'
        : systemPrefersDark
);


themeCheckbox?.addEventListener('change', () => {

    setTheme(themeCheckbox.checked);

});
