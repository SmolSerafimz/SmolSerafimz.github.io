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

    if (articleId && wikiData[articleId]) {

        renderArticle(wikiData[articleId]);

    } else {

        renderLandingPage();

    }

}


function renderLandingPage() {

    document.getElementById('article-title').innerText =
        'Smol Serafimz Official Wiki';


    document.getElementById('article-intro-text').innerHTML = `
        <p>
            Welcome to the Smol Serafimz Official Wiki.
        </p>

        <p>
            This is the temporary landing page for the wiki.
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

            <p>
                Character information will appear here.
            </p>
        </section>


        <section>
            <h2>Episodes</h2>

            <p>
                Season and episode information will appear here.
            </p>
        </section>


        <section>
            <h2>Explore the World</h2>

            <p>
                Locations and other world information will appear here.
            </p>
        </section>

    `;

}


function renderArticle(article) {

    document.getElementById('article-title').innerText = article.title;


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