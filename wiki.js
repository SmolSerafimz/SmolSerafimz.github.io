const testArticle = {
    title: "Test Article",

    intro: "This is a temporary test article used to build the Smol Serafimz Wiki engine.",

    infobox: {
        type: "Test",
        status: "Testing",
        firstAppearance: "N/A"
    },

    sections: [
        {
            title: "Description",
            content: "This section exists to test the article renderer."
        },
        {
            title: "History",
            content: "This is placeholder content. No actual Smol Serafimz lore has been entered yet."
        },
        {
            title: "Trivia",
            content: "The entire article is temporary and will eventually be replaced by real wiki data."
        }
    ]
};


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


renderArticle(testArticle);