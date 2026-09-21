let wikiData = {};
let charactersData = {};
let episodesData = {};
let locationsData = {};
let objectsData = {};

Promise.all([
    fetch('data/wiki-test.json').then(response => response.json()),
    fetch('data/characters.json').then(response => response.json()),
    fetch('data/episodes.json').then(response => response.json()),
    fetch('data/locations.json').then(response => response.json()),
    fetch('data/objects.json').then(response => response.json())
])
    .then(([wiki, characters, episodes, locations, objects]) => {

        wikiData = wiki;
        charactersData = characters;
        episodesData = episodes;
        locationsData = locations;
        objectsData = objects;

        initializeWiki();

    })
    .catch(error => {
        console.error('Failed to load wiki data:', error);
    });


function initializeWiki() {

    const urlParams = new URLSearchParams(window.location.search);

    const articleId = urlParams.get('article');
    const type = urlParams.get('type');
    const id = urlParams.get('id');


    // Temporary test article
    if (articleId && wikiData[articleId]) {

        renderArticle(wikiData[articleId]);

        return;

    }


    // Character article
    if (type === 'character' && id && charactersData[id]) {

        renderCharacterArticle(charactersData[id]);

        return;

    }


    // Episode article
    if (type === 'episode' && id && episodesData[id]) {

        renderEpisodeArticle(id, episodesData[id]);

        return;

    }


    // Season article
    if (type === 'season' && id) {

        renderSeasonArticle(id);

        return;

    }


    // Location article
    if (type === 'location' && id && locationsData[id]) {

        renderLocationArticle(locationsData[id]);

        return;

    }


    // Object article
    if (type === 'object' && id && objectsData[id]) {

        renderObjectArticle(objectsData[id]);

        return;

    }


    // Default: wiki landing page
    renderLandingPage();

}


/* =========================================================
   LANDING PAGE
   ========================================================= */

function renderLandingPage() {

    document.getElementById('article-title').innerText =
        'Smol Serafimz Official Wiki';


    document.getElementById('article-intro-text').innerHTML = `
        <p>
            Welcome to the Smol Serafimz Official Wiki.
        </p>

        <p>
            This wiki contains information about the characters,
            episodes, and world of Smol Serafimz.
        </p>
    `;


    document.getElementById('article-infobox').innerHTML = `
        <div class="wiki-infobox">

            <div class="wiki-infobox-title">
                Smol Serafimz
            </div>

            <div class="wiki-infobox-row">
                <strong>Type</strong>
                <span>Webcomic</span>
            </div>

            <div class="wiki-infobox-row">
                <strong>Creator</strong>
                <span>Smol Serafimz</span>
            </div>

            <div class="wiki-infobox-row">
                <strong>Started</strong>
                <span>2026</span>
            </div>

            <div class="wiki-infobox-row">
                <strong>Status</strong>
                <span>Ongoing</span>
            </div>

        </div>
    `;


    document.getElementById('article-sections').innerHTML = `

        <section>
            <h2>Meet the Cast</h2>

            <div id="wiki-cast"></div>
        </section>


        <section>
            <h2>Episodes</h2>

            <div id="wiki-episode-table"></div>
        </section>


        <section>
            <h2>Explore the World</h2>

            <div id="wiki-locations"></div>
        </section>


        <section>
            <h2>Objects</h2>

            <div id="wiki-objects"></div>
        </section>

    `;


    renderCast();
    renderEpisodeTable();
    renderLocations();
    renderObjects();

}


/* =========================================================
   CHARACTER LIST
   ========================================================= */

function renderCast() {

    const container = document.getElementById('wiki-cast');

    const characters = Object.entries(charactersData);


    if (characters.length === 0) {

        container.innerHTML = '<p>No characters have been added yet.</p>';

        return;

    }


    const categories = {
        "Celestimals": [],
        "Gnomes": [],
        "Others": []
    };


    characters.forEach(([id, character]) => {

        const category = character.category;

        if (categories[category]) {

            categories[category].push({
                id,
                ...character
            });

        } else {

            categories["Others"].push({
                id,
                ...character
            });

        }

    });


    let html = '';


    Object.entries(categories).forEach(([category, characters]) => {

        if (characters.length === 0) {
            return;
        }


        html += `
            <h3>${category}</h3>

            <div class="wiki-character-grid">

                ${characters.map(character => `

                    <a
                        class="wiki-character-card"
                        href="wiki.html?type=character&id=${character.id}"
                    >

                        ${character.infobox.image
                            ? `<img src="${character.infobox.image}" alt="${character.title}">`
                            : ''
                        }

                        <span>${character.title}</span>

                    </a>

                `).join('')}

            </div>
        `;

    });


    container.innerHTML = html;

}


/* =========================================================
   EPISODE TABLE
   ========================================================= */

function renderEpisodeTable() {

    const container = document.getElementById('wiki-episode-table');

    const episodes = Object.entries(episodesData);


    if (episodes.length === 0) {

        container.innerHTML = '<p>No episodes have been added yet.</p>';

        return;

    }


    const seasons = {};


    episodes.forEach(([id, episode]) => {

        const season = episode.info?.season || 1;

        if (!seasons[season]) {
            seasons[season] = [];
        }

        seasons[season].push({
            id,
            ...episode
        });

    });


    const sortedSeasons = Object.keys(seasons)
        .sort((a, b) => Number(a) - Number(b));


    container.innerHTML = `

        <table class="wiki-season-table">

            <thead>

                <tr>
                    <th>Season</th>
                    <th>Episodes</th>
                    <th>Originally released</th>
                </tr>

            </thead>

            <tbody>

                ${sortedSeasons.map(season => {

                    const seasonEpisodes = seasons[season];

                    return `
                        <tr>

                            <td>
                                <a href="wiki.html?type=season&id=${season}">
                                    Season ${season}
                                </a>
                            </td>

                            <td>
                                <a href="wiki.html?type=season&id=${season}#episodes">
                                    ${seasonEpisodes.length}
                                </a>
                            </td>

                            <td>
                                —
                            </td>

                        </tr>
                    `;

                }).join('')}

            </tbody>

        </table>

    `;

}


/* =========================================================
   LOCATION LIST
   ========================================================= */

function renderLocations() {

    const container = document.getElementById('wiki-locations');

    const locations = Object.entries(locationsData);


    if (locations.length === 0) {

        container.innerHTML =
            '<p>No locations have been added yet.</p>';

        return;

    }


    container.innerHTML = `

        <div class="wiki-location-list">

            ${locations.map(([id, location]) => `

                <a
                    class="wiki-location-card"
                    href="wiki.html?type=location&id=${id}"
                >

                    <span>${location.title}</span>

                </a>

            `).join('')}

        </div>

    `;

}


/* =========================================================
   OBJECT LIST
   ========================================================= */

function renderObjects() {

    const container = document.getElementById('wiki-objects');

    const objects = Object.entries(objectsData);


    if (objects.length === 0) {

        container.innerHTML =
            '<p>No objects have been added yet.</p>';

        return;

    }


    container.innerHTML = `

        <div class="wiki-object-list">

            ${objects.map(([id, object]) => `

                <a
                    class="wiki-object-card"
                    href="wiki.html?type=object&id=${id}"
                >

                    <span>${object.title}</span>

                </a>

            `).join('')}

        </div>

    `;

}


/* =========================================================
   CHARACTER ARTICLE
   ========================================================= */

function renderCharacterArticle(character) {

    document.getElementById('article-title').innerText =
        character.title;


    document.getElementById('article-intro-text').innerHTML =
        `<p>${character.intro}</p>`;


    const infobox = document.getElementById('article-infobox');

    const firstAppearance = character.infobox.firstAppearance;


    infobox.innerHTML = `

        <div class="wiki-infobox">

            ${character.infobox.image
                ? `
                    <div class="wiki-infobox-image">
                        <img
                            src="${character.infobox.image}"
                            alt="${character.title}"
                        >
                    </div>
                `
                : ''
            }

            <div class="wiki-infobox-title">
                ${character.title}
            </div>


            <div class="wiki-infobox-row">
                <strong>Species</strong>
                <span>${character.infobox.species}</span>
            </div>


            <div class="wiki-infobox-row">
                <strong>First appearance</strong>
                <span>
                    <a href="wiki.html?type=episode&id=${firstAppearance}">
                        Episode ${firstAppearance}
                    </a>
                </span>
            </div>

        </div>

    `;


    const sections = document.getElementById('article-sections');

    sections.innerHTML = '';


    addCharacterSection(
        sections,
        'Personality',
        character.personality
    );


    addCharacterSection(
        sections,
        'Appearance',
        character.appearance
    );


    addCharacterSection(
        sections,
        'History',
        character.history
    );


    addCharacterSection(
        sections,
        'Trivia',
        character.trivia
    );


    addCharacterSection(
        sections,
        'Behind the scenes',
        character.behindTheScenes
    );

}


function addCharacterSection(container, title, content) {

    if (!content || content.trim() === '') {
        return;
    }


    const section = document.createElement('section');


    section.innerHTML = `
        <h2>${title}</h2>
        <p>${content}</p>
    `;


    container.appendChild(section);

}


/* =========================================================
   EPISODE ARTICLE
   ========================================================= */

function renderEpisodeArticle(id, episode) {

    const info = episode.info || {};


    document.getElementById('article-title').innerText =
        episode.title;


    document.getElementById('article-intro-text').innerHTML =
        episode.intro
            ? `<p>${episode.intro}</p>`
            : '';


    const infobox = document.getElementById('article-infobox');


    infobox.innerHTML = `

        <div class="wiki-infobox">

            <div class="wiki-infobox-title">
                ${episode.title}
            </div>


            <div class="wiki-infobox-row">
                <strong>Season</strong>
                <span>
                    <a href="wiki.html?type=season&id=${info.season}">
                        ${info.season}
                    </a>
                </span>
            </div>


            <div class="wiki-infobox-row">
                <strong>Number</strong>
                <span>${id}</span>
            </div>


            <div class="wiki-infobox-row">
                <strong>Name</strong>
                <span>${episode.title}</span>
            </div>


            <div class="wiki-infobox-row">
                <strong>Panels</strong>
                <span>${info.panels ?? '—'}</span>
            </div>


            ${info.location
                ? `
                    <div class="wiki-infobox-row">
                        <strong>Location</strong>
                        <span>${info.location}</span>
                    </div>
                `
                : ''
            }


            ${info.previous
                ? `
                    <div class="wiki-infobox-row">
                        <strong>Previous</strong>
                        <span>
                            <a href="wiki.html?type=episode&id=${info.previous}">
                                Episode ${info.previous}
                            </a>
                        </span>
                    </div>
                `
                : ''
            }


            ${info.next
                ? `
                    <div class="wiki-infobox-row">
                        <strong>Next</strong>
                        <span>
                            <a href="wiki.html?type=episode&id=${info.next}">
                                Episode ${info.next}
                            </a>
                        </span>
                    </div>
                `
                : ''
            }

        </div>

    `;


    const sections = document.getElementById('article-sections');

    sections.innerHTML = '';


    addEpisodeSection(
        sections,
        'Characters',
        episode.characters
    );


    addEpisodeSection(
        sections,
        'Plot',
        episode.plot
    );


    addEpisodeSection(
        sections,
        'Notable objects',
        episode.notableObjects
    );


    addEpisodeSection(
        sections,
        'Behind the scenes',
        episode.behindTheScenes
    );


    addEpisodeNavigation(
        sections,
        info.previous,
        info.next
    );

}


function addEpisodeSection(container, title, content) {

    if (!content) {
        return;
    }


    if (Array.isArray(content) && content.length === 0) {
        return;
    }


    if (typeof content === 'string' && content.trim() === '') {
        return;
    }


    const section = document.createElement('section');


    let html = '';


    if (Array.isArray(content)) {

        html = `
            <ul>
                ${content.map(item => {

                    const characterId = findCharacterId(item);

                    if (characterId) {

                        return `
                            <li>
                                <a href="wiki.html?type=character&id=${characterId}">
                                    ${item}
                                </a>
                            </li>
                        `;

                    }


                    const objectId = findObjectId(item);

                    if (objectId) {

                        return `
                            <li>
                                <a href="wiki.html?type=object&id=${objectId}">
                                    ${item}
                                </a>
                            </li>
                        `;

                    }


                    return `<li>${item}</li>`;

                }).join('')}
            </ul>
        `;

    } else {

        html = `<p>${content}</p>`;

    }


    section.innerHTML = `
        <h2>${title}</h2>
        ${html}
    `;


    container.appendChild(section);

}


function findCharacterId(name) {

    const entry = Object.entries(charactersData).find(
        ([id, character]) =>
            character.title.toLowerCase() === String(name).toLowerCase()
    );


    return entry ? entry[0] : null;

}


function findObjectId(name) {

    const entry = Object.entries(objectsData).find(
        ([id, object]) =>
            object.title.toLowerCase() === String(name).toLowerCase()
    );


    return entry ? entry[0] : null;

}


function addEpisodeNavigation(container, previous, next) {

    if (!previous && !next) {
        return;
    }


    const section = document.createElement('section');

    section.className = 'wiki-episode-navigation';


    section.innerHTML = `

        <div class="wiki-episode-nav">

            ${previous
                ? `
                    <a href="wiki.html?type=episode&id=${previous}">
                        ← Episode ${previous}
                    </a>
                `
                : '<span></span>'
            }


            ${next
                ? `
                    <a href="wiki.html?type=episode&id=${next}">
                        Episode ${next} →
                    </a>
                `
                : '<span></span>'
            }

        </div>

    `;


    container.appendChild(section);

}


/* =========================================================
   SEASON ARTICLE
   ========================================================= */

function renderSeasonArticle(seasonId) {

    const seasonEpisodes = Object.entries(episodesData)
        .filter(([id, episode]) =>
            String(episode.info?.season || 1) === String(seasonId)
        )
        .map(([id, episode]) => ({
            id,
            ...episode
        }))
        .sort((a, b) => Number(a.id) - Number(b.id));


    document.getElementById('article-title').innerText =
        `Season ${seasonId}`;


    document.getElementById('article-intro-text').innerHTML = `

        <p>
            Season ${seasonId} of <em>Smol Serafimz</em>.
        </p>

    `;


    document.getElementById('article-infobox').innerHTML = `

        <div class="wiki-infobox">

            <div class="wiki-infobox-title">
                Season ${seasonId}
            </div>

            <div class="wiki-infobox-row">
                <strong>Series</strong>
                <span>
                    <a href="wiki.html">
                        Smol Serafimz
                    </a>
                </span>
            </div>

            <div class="wiki-infobox-row">
                <strong>Season</strong>
                <span>${seasonId}</span>
            </div>

            <div class="wiki-infobox-row">
                <strong>Episodes</strong>
                <span>${seasonEpisodes.length}</span>
            </div>

        </div>

    `;


    const sections = document.getElementById('article-sections');

    sections.innerHTML = `

        <section id="episodes">

            <h2>Episodes</h2>

            <table class="wiki-episode-list">

                <thead>

                    <tr>
                        <th>No.</th>
                        <th>Title</th>
                        <th>Panels</th>
                    </tr>

                </thead>

                <tbody>

                    ${seasonEpisodes.map(episode => `

                        <tr>

                            <td>
                                <a href="wiki.html?type=episode&id=${episode.id}">
                                    ${episode.id}
                                </a>
                            </td>

                            <td>
                                <a href="wiki.html?type=episode&id=${episode.id}">
                                    ${episode.title}
                                </a>
                            </td>

                            <td>
                                ${episode.info?.panels ?? '—'}
                            </td>

                        </tr>

                    `).join('')}

                </tbody>

            </table>

        </section>

    `;

}


/* =========================================================
   LOCATION ARTICLE
   ========================================================= */

function renderLocationArticle(location) {

    document.getElementById('article-title').innerText =
        location.title;


    document.getElementById('article-intro-text').innerHTML =
        location.intro
            ? `<p>${location.intro}</p>`
            : '';


    const infobox = document.getElementById('article-infobox');


    const firstAppearance = location.infobox?.firstAppearance;


    infobox.innerHTML = `

        <div class="wiki-infobox">

            <div class="wiki-infobox-title">
                ${location.title}
            </div>


            ${location.infobox?.type
                ? `
                    <div class="wiki-infobox-row">
                        <strong>Type</strong>
                        <span>${location.infobox.type}</span>
                    </div>
                `
                : ''
            }


            ${firstAppearance
                ? `
                    <div class="wiki-infobox-row">
                        <strong>First appearance</strong>
                        <span>
                            <a href="wiki.html?type=episode&id=${firstAppearance}">
                                Episode ${firstAppearance}
                            </a>
                        </span>
                    </div>
                `
                : ''
            }

        </div>

    `;


    const sections = document.getElementById('article-sections');

    sections.innerHTML = '';


    addLocationSection(
        sections,
        'Description',
        location.description
    );


    addLocationSection(
        sections,
        'History',
        location.history
    );


    addLocationAppearances(
        sections,
        location.appearances
    );


    addLocationSection(
        sections,
        'Trivia',
        location.trivia
    );


    addLocationSection(
        sections,
        'Behind the scenes',
        location.behindTheScenes
    );

}


function addLocationSection(container, title, content) {

    if (!content || content.trim() === '') {
        return;
    }


    const section = document.createElement('section');


    section.innerHTML = `
        <h2>${title}</h2>
        <p>${content}</p>
    `;


    container.appendChild(section);

}


function addLocationAppearances(container, appearances) {

    if (!appearances || appearances.length === 0) {
        return;
    }


    const section = document.createElement('section');


    section.innerHTML = `

        <h2>Appearances</h2>

        <ul>

            ${appearances.map(episodeId => `

                <li>
                    <a href="wiki.html?type=episode&id=${episodeId}">
                        Episode ${episodeId}
                    </a>
                </li>

            `).join('')}

        </ul>

    `;


    container.appendChild(section);

}


/* =========================================================
   OBJECT ARTICLE
   ========================================================= */

function renderObjectArticle(object) {

    document.getElementById('article-title').innerText =
        object.title;


    document.getElementById('article-intro-text').innerHTML =
        object.intro
            ? `<p>${object.intro}</p>`
            : '';


    const infobox = document.getElementById('article-infobox');


    const firstAppearance = object.infobox?.firstAppearance;


    infobox.innerHTML = `

        <div class="wiki-infobox">

            <div class="wiki-infobox-title">
                ${object.title}
            </div>


            ${object.infobox?.type
                ? `
                    <div class="wiki-infobox-row">
                        <strong>Type</strong>
                        <span>${object.infobox.type}</span>
                    </div>
                `
                : ''
            }


            ${firstAppearance
                ? `
                    <div class="wiki-infobox-row">
                        <strong>First appearance</strong>
                        <span>
                            <a href="wiki.html?type=episode&id=${firstAppearance}">
                                Episode ${firstAppearance}
                            </a>
                        </span>
                    </div>
                `
                : ''
            }

        </div>

    `;


    const sections = document.getElementById('article-sections');

    sections.innerHTML = '';


    addObjectSection(
        sections,
        'Description',
        object.description
    );


    addObjectSection(
        sections,
        'History',
        object.history
    );


    addObjectAppearances(
        sections,
        object.appearances
    );


    addObjectSection(
        sections,
        'Trivia',
        object.trivia
    );


    addObjectSection(
        sections,
        'Behind the scenes',
        object.behindTheScenes
    );

}


function addObjectSection(container, title, content) {

    if (!content || content.trim() === '') {
        return;
    }


    const section = document.createElement('section');


    section.innerHTML = `
        <h2>${title}</h2>
        <p>${content}</p>
    `;


    container.appendChild(section);

}


function addObjectAppearances(container, appearances) {

    if (!appearances || appearances.length === 0) {
        return;
    }


    const section = document.createElement('section');


    section.innerHTML = `

        <h2>Appearances</h2>

        <ul>

            ${appearances.map(episodeId => `

                <li>
                    <a href="wiki.html?type=episode&id=${episodeId}">
                        Episode ${episodeId}
                    </a>
                </li>

            `).join('')}

        </ul>

    `;


    container.appendChild(section);

}


/* =========================================================
   TEST ARTICLE
   ========================================================= */

function renderArticle(article) {

    document.getElementById('article-title').innerText =
        article.title;


    document.getElementById('article-intro-text').innerHTML =
        `<p>${article.intro}</p>`;


    const infobox = document.getElementById('article-infobox');


    infobox.innerHTML = `

        <div class="wiki-infobox">

            <div class="wiki-infobox-title">
                ${article.title}
            </div>

            ${Object.entries(article.infobox).map(([key, value]) => `

                <div class="wiki-infobox-row">
                    <strong>${key}</strong>
                    <span>${value}</span>
                </div>

            `).join('')}

        </div>

    `;


    const sections = document.getElementById('article-sections');

    sections.innerHTML = '';


    article.sections.forEach(section => {

        const sectionElement = document.createElement('section');


        sectionElement.innerHTML = `
            <h2>${section.title}</h2>
            <p>${section.content}</p>
        `;


        sections.appendChild(sectionElement);

    });

}