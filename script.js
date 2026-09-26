let comicData = {};
let updatesData = {};
let siteContentData = {};

let currentEpisode = null;

Promise.all([
    fetch('data/episodes.json').then(response => {
        if (!response.ok) {
            throw new Error(`Failed to load episodes.json: ${response.status}`);
        }

        return response.json();
    }),

    fetch('data/updates.json').then(response => {
        if (!response.ok) {
            throw new Error(`Failed to load updates.json: ${response.status}`);
        }

        return response.json();
    }),

    fetch('data/site-content.json').then(response => {
        if (!response.ok) {
            throw new Error(`Failed to load site-content.json: ${response.status}`);
        }

        return response.json();
    })
])

.then(([episodes, updates, siteContent]) => {

    comicData = episodes;
    updatesData = updates;
    siteContentData = siteContent;

    populateSeasonSelector();
    setupSeasonNavigation();
    setupDownloadsNavigation();

    initializeSite();

})

.catch(error => {

    console.error('Failed to load site data:', error);

});

function loadEpisode(epNumber, scrollToComic = false) {

    const data = comicData[epNumber];
    if (!data) return;

    currentEpisode = epNumber;

    document.getElementById('episode-title').innerText =
        "Episode " + epNumber + ": " + data.title;

    document.getElementById('main-comic-display').src = data.image;

    document.getElementById('episode-about-text').innerHTML =
        `<p>${data.intro}</p>`;

    const dotContainer = document.getElementById('panel-dots');
    dotContainer.innerHTML = '';

    for (let i = 0; i < data.info.panels; i++) {

        const dot = document.createElement('span');
        const panelNumber = i + 1;

        dot.className = (i === 0) ? 'dot active' : 'dot';

        dot.onclick = function() {

            document.getElementById('main-comic-display').src =
                `assets/${epNumber}_${panelNumber}.webp`;

            document.querySelectorAll('.dot').forEach(d =>
                d.classList.remove('active')
            );

            dot.classList.add('active');
        };

        dotContainer.appendChild(dot);
    }

    updateEpisodeNavigation(epNumber);

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

function populateSeasonSelector() {

    const seasonSelector =
        document.getElementById('season-selector');

    if (!seasonSelector) return;

    const seasons = [
        ...new Set(
            Object.values(comicData)
                .map(episode => episode.info.season)
                .filter(season => season !== undefined)
        )
    ].sort((a, b) => a - b);

    seasonSelector.innerHTML = '';

    seasons.forEach(season => {

        const option =
            document.createElement('option');

        option.value = season;
        option.innerText = `Season ${season}`;

        seasonSelector.appendChild(option);

    });

    // Always start on Season 1
    if (seasons.includes(1)) {
        seasonSelector.value = '1';
    }
}

function setupSeasonNavigation() {

    const seasonSelector =
        document.getElementById('season-selector');

    const readFromBeginningButton =
        document.getElementById('read-from-beginning');

    if (!seasonSelector || !readFromBeginningButton) return;

    readFromBeginningButton.onclick = function() {

        const selectedSeason =
            Number(seasonSelector.value);

        const firstEpisode =
            Object.keys(comicData)
                .filter(epNumber =>
                    comicData[epNumber].info.season === selectedSeason
                )
                .sort((a, b) => Number(a) - Number(b))[0];

        if (!firstEpisode) return;

        navigateToEpisode(firstEpisode);

    };
}

function navigateToEpisode(epNumber) {

    if (!comicData[epNumber]) return;

    const url = `comic.html?episode=${epNumber}`;

    history.pushState(
        { episode: epNumber },
        '',
        url
    );

    showComic();

    loadEpisode(epNumber, true);
}

function updateEpisodeNavigation(epNumber) {

    const data = comicData[epNumber];

    const previousButton =
        document.getElementById('previous-episode');

    const nextButton =
        document.getElementById('next-episode');

    if (!previousButton || !nextButton || !data) return;

    if (
        data.info.previous &&
        comicData[data.info.previous]
    ) {

        previousButton.disabled = false;

        previousButton.onclick = function() {
            navigateToEpisode(data.info.previous);
        };

    } else {

        previousButton.disabled = true;
        previousButton.onclick = null;

    }

    if (
        data.info.next &&
        comicData[data.info.next]
    ) {

        nextButton.disabled = false;

        nextButton.onclick = function() {
            navigateToEpisode(data.info.next);
        };

    } else {

        nextButton.disabled = true;
        nextButton.onclick = null;

    }
}

function setupDownloadsNavigation() {

    const downloadsLink =
        document.getElementById('downloads-link');

    const comicLink =
        document.getElementById('comic-link');

    if (!downloadsLink || !comicLink) return;

    downloadsLink.onclick = function(event) {

        event.preventDefault();

        history.pushState(
            { downloads: true },
            '',
            'comic.html?downloads'
        );

        showDownloads();

    };

    comicLink.onclick = function(event) {

        event.preventDefault();

        let episodeToLoad = currentEpisode;

        if (
            !episodeToLoad ||
            !comicData[episodeToLoad]
        ) {

            const latestEp =
                Math.max(
                    ...Object.keys(comicData).map(Number)
                );

            episodeToLoad =
                latestEp
                    .toString()
                    .padStart(3, '0');

        }

        history.pushState(
            { episode: episodeToLoad },
            '',
            `comic.html?episode=${episodeToLoad}`
        );

        showComic();

        loadEpisode(episodeToLoad);

    };

}

function showDownloads() {

    const siteWrapper =
        document.getElementById('site-wrapper');

    const comicBox =
        document.getElementById('comic-box');

    const latestUpdate =
        document.getElementById('latest-update');

    const rightColumn =
        document.getElementById('right-column');

    const downloadsBox =
        document.getElementById('downloads-box');

    const downloadsLink =
        document.getElementById('downloads-link');

    const comicLink =
        document.getElementById('comic-link');

    if (!downloadsBox) return;

    if (siteWrapper) {
        siteWrapper.classList.add('downloads-layout');
    }

    if (comicBox) {
        comicBox.style.display = 'none';
    }

    if (latestUpdate) {
        latestUpdate.style.display = 'none';
    }

    if (rightColumn) {
        rightColumn.style.display = 'none';
    }

    downloadsBox.style.display = 'block';

    if (downloadsLink) {
        downloadsLink.classList.add('active');
    }

    if (comicLink) {
        comicLink.classList.remove('active');
    }

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function showComic() {

    const siteWrapper =
        document.getElementById('site-wrapper');

    const comicBox =
        document.getElementById('comic-box');

    const latestUpdate =
        document.getElementById('latest-update');

    const rightColumn =
        document.getElementById('right-column');

    const downloadsBox =
        document.getElementById('downloads-box');

    const downloadsLink =
        document.getElementById('downloads-link');

    const comicLink =
        document.getElementById('comic-link');

    if (siteWrapper) {
        siteWrapper.classList.remove('downloads-layout');
    }

    if (downloadsBox) {
        downloadsBox.style.display = 'none';
    }

    if (comicBox) {
        comicBox.style.display = 'block';
    }

    if (latestUpdate) {
        latestUpdate.style.display = 'block';
    }

    if (rightColumn) {
        rightColumn.style.display = '';
    }

    if (downloadsLink) {
        downloadsLink.classList.remove('active');
    }

    if (comicLink) {
        comicLink.classList.add('active');
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

const themeCheckbox =
    document.getElementById('theme-checkbox');

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

const savedTheme =
    localStorage.getItem('theme');

const systemPrefersDark =
    window.matchMedia(
        '(prefers-color-scheme: dark)'
    ).matches;

if (savedTheme) {

    setTheme(savedTheme === 'dark');

} else {

    setTheme(systemPrefersDark);

}

if (themeCheckbox) {

    themeCheckbox.addEventListener(
        'change',
        () => {
            setTheme(themeCheckbox.checked);
        }
    );

}

function setDailyQuote() {

    const quoteElement =
        document.getElementById('daily-quote');

    const authorElement =
        document.querySelector('.quote-box small');

    if (
        !quoteElement ||
        !authorElement ||
        !siteContentData.quotes ||
        siteContentData.quotes.length === 0
    ) {
        return;
    }

    const today =
        new Date();

    const dateSeed =
        today.getFullYear() * 10000 +
        (today.getMonth() + 1) * 100 +
        today.getDate();

    const index =
        dateSeed % siteContentData.quotes.length;

    const selected =
        siteContentData.quotes[index];

    quoteElement.innerText =
        `"${selected.text}"`;

    authorElement.innerText =
        `— ${selected.author}`;
}

function populateArchive() {

    const archiveList =
        document.getElementById('archive-list');

    if (!archiveList) return;

    archiveList.innerHTML = '';

    const keys =
        Object.keys(comicData)
            .sort((a, b) => b.localeCompare(a));

    keys.forEach(epKey => {

        const li =
            document.createElement('li');

        const a =
            document.createElement('a');

        a.href =
            `comic.html?episode=${epKey}`;

        const epTitle =
            comicData[epKey].title;

        a.innerText =
            `${epKey}: ${epTitle}`;

        a.onclick = (e) => {

            e.preventDefault();

            navigateToEpisode(epKey);

        };

        li.appendChild(a);
        archiveList.appendChild(li);

    });
}

function updateUniversalTicker() {

    const ticker =
        document.querySelector('.ticker-text');

    if (
        !ticker ||
        !siteContentData.ticker ||
        siteContentData.ticker.length === 0
    ) {
        return;
    }

    const index =
        Math.floor(
            Math.random() *
            siteContentData.ticker.length
        );

    ticker.innerText =
        siteContentData.ticker[index];
}

function populateLatestUpdate() {

    const updateElement =
        document.getElementById('latest-update-content');

    if (
        !updateElement ||
        !updatesData.updates ||
        updatesData.updates.length === 0
    ) {
        return;
    }

    const latest =
        updatesData.updates[0];

    const paragraphs =
        latest.text
            .split('\n\n')
            .map(paragraph => `<p>${paragraph}</p>`)
            .join('');

    updateElement.innerHTML = `
        <h3>${latest.title}</h3>
        ${paragraphs}
        <small>${latest.date}</small>
    `;
}

function populateUpdatesArchive() {

    const mainColumn =
        document.querySelector('main.column');

    if (
        !mainColumn ||
        !updatesData.updates
    ) {
        return;
    }

    const updatesHTML =
        updatesData.updates
            .map(update => {

                const paragraphs =
                    update.text
                        .split('\n\n')
                        .map(paragraph => `<p>${paragraph}</p>`)
                        .join('');

                return `
                    <div class="box update-archive-item">
                        <h2>${update.title}</h2>
                        ${paragraphs}
                        <small>${update.date}</small>
                    </div>
                `;

            })
            .join('');

    mainColumn.innerHTML = `
        <div class="box">
            <h2>Past Updates</h2>
            ${updatesHTML}

            <div class="latest-update-link">
                <a href="index.html">Back to homepage</a>
            </div>
        </div>
    `;
}

function initializeSite() {

    const urlParams =
        new URLSearchParams(
            window.location.search
        );

    if (urlParams.has('updates')) {

        createStars();
        updateUniversalTicker();
        setDailyQuote();
        populateUpdatesArchive();

        return;
    }

    if (urlParams.has('downloads')) {

        showDownloads();

        createStars();
        updateUniversalTicker();
        setDailyQuote();

        return;
    }

    const episodeKeys =
        Object.keys(comicData);

    if (
        document.getElementById('main-comic-display')
    ) {

        const requestedEpisode =
            urlParams.get('episode');

        if (
            requestedEpisode &&
            comicData[requestedEpisode]
        ) {

            loadEpisode(requestedEpisode);

        } else {

            const latestEp =
                Math.max(
                    ...episodeKeys.map(Number)
                );

            const paddedEp =
                latestEp
                    .toString()
                    .padStart(3, '0');

            loadEpisode(paddedEp);

        }
    }

    createStars();
    updateUniversalTicker();
    setDailyQuote();
    populateArchive();
}

window.addEventListener('popstate', () => {

    const urlParams =
        new URLSearchParams(
            window.location.search
        );

    if (urlParams.has('downloads')) {

        showDownloads();

        return;
    }

    const episode =
        urlParams.get('episode');

    if (
        episode &&
        comicData[episode]
    ) {

        showComic();

        loadEpisode(
            episode,
            true
        );

        return;
    }

    showComic();

    const latestEp =
        Math.max(
            ...Object.keys(comicData).map(Number)
        );

    const paddedEp =
        latestEp
            .toString()
            .padStart(3, '0');

    loadEpisode(paddedEp);

});
