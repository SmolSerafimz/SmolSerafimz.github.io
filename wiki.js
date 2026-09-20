let wikiData = {};

fetch('data/wiki-test.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to load wiki-test.json: ${response.status}`);
        }

        return response.json();
    })
    .then(data => {
        wikiData = data;

        initializeWiki();
    })
    .catch(error => {
        console.error('Failed to load wiki data:', error);
    });


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


function initializeWiki() {

    const urlParams = new URLSearchParams(window.location.search);

    const articleId = urlParams.get('article');


    if (articleId && wikiData[articleId]) {

        renderArticle(wikiData[articleId]);

    } else {

        renderArticle(wikiData['test-article']);

    }

}