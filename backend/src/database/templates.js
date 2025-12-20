/**
 * Plantillas predefinidas de fuentes de noticias
 * Organizadas por categoría para fácil acceso
 */

const TEMPLATES = {
  trending: [
    {
      name: "Dev.to - JavaScript",
      url: "https://dev.to/t/javascript/latest",
      category: "Trending Topic",
      selectors: {
        articleList: ".crayons-story",
        title: "h2.crayons-story__title a, a[id^='article-link-']",
        image: "div.crayons-story__cover img, img",
        author: ".crayons-story__secondary a",
        content: ".crayons-article__main, #article-body",
      },
    },
    {
      name: "Medium - React",
      url: "https://medium.com/tag/react/latest",
      category: "Trending Topic",
      selectors: {
        articleList: "article, div.pw-home-feed-item",
        title: "h2, h3, a[href*='?source=topic_portal']",
        image: "img",
        author: ".pw-author-name, [data-testid='authorName']",
        content: "section, article",
      },
    },
    {
      name: "Hashnode - Node.js",
      url: "https://hashnode.com/n/nodejs",
      category: "Trending Topic",
      selectors: {
        articleList: "div[data-testid='post-card'], article",
        title: "h2 a, h1 a",
        image: "img",
        author: "a[data-testid='author-name']",
        content: ".prose, article",
      },
    },
    {
      name: "Dev.to - CSS",
      url: "https://dev.to/t/css",
      category: "Trending Topic",
      selectors: {
        articleList: ".crayons-story",
        title: "h2.crayons-story__title a",
        image: "img",
        author: ".crayons-story__secondary a",
        content: ".crayons-article__main",
      },
    },
    {
      name: "FreeCodeCamp - TypeScript",
      url: "https://www.freecodecamp.org/news/tag/typescript/",
      category: "Trending Topic",
      selectors: {
        articleList: "article.post-card",
        title: ".post-card-title a",
        image: ".post-card-image",
        author: ".author-name",
        content: ".post-content",
      },
    },
  ],
  releases: [
    {
      name: "Node.js Releases",
      url: "https://nodejs.org/en/blog/release",
      category: "Lanzamientos",
      selectors: {
        articleList: "ul > li",
        title: "a[href*='/release/']",
        image: "img",
        author: null,
        content: "article",
      },
    },
    {
      name: "Next.js Blog",
      url: "https://nextjs.org/blog",
      category: "Lanzamientos",
      selectors: {
        articleList: "div.grid > div",
        title: "a[href^='/blog/']",
        image: "img",
        author: null,
        content: "article",
      },
    },
    {
      name: "Tailwind CSS Blog",
      url: "https://blog.tailwindcss.com",
      category: "Lanzamientos",
      selectors: {
        articleList: "li, article",
        title: "a[href^='/blog/'], h2 a",
        image: "img",
        author: null,
        content: ".prose",
      },
    },
    {
      name: "GitHub Blog - Changelog",
      url: "https://github.blog/changelog/",
      category: "Lanzamientos",
      selectors: {
        articleList: ".TimelineItem, article",
        title: "h2 a, a.ChangelogItem-title",
        image: "img",
        author: null,
        content: ".markdown-body",
      },
    },
    {
      name: "V8 Engine Blog",
      url: "https://v8.dev/blog",
      category: "Lanzamientos",
      selectors: {
        articleList: "article, .post",
        title: "h2 a",
        image: "img",
        author: null,
        content: ".content",
      },
    },
  ],
  newsletters: [
    {
      name: "JavaScript Weekly",
      url: "https://javascriptweekly.com/issues/latest",
      category: "Newsletter Semanal",
      schedule: "0 9 * * 1",
      selectors: {
        articleList: ".issue-item",
        title: "h4 a",
        image: "img",
        author: null,
        content: ".description",
      },
    },
    {
      name: "React Status",
      url: "https://react.statuscode.com/issues/latest",
      category: "Newsletter Semanal",
      schedule: "0 9 * * 1",
      selectors: {
        articleList: ".issue-item",
        title: "h4 a",
        image: "img",
        author: null,
        content: ".description",
      },
    },
    {
      name: "Node Weekly",
      url: "https://nodeweekly.com/issues/latest",
      category: "Newsletter Semanal",
      schedule: "0 9 * * 1",
      selectors: {
        articleList: ".issue-item",
        title: "h4 a",
        image: "img",
        author: null,
        content: ".description",
      },
    },
  ],
  popular: [
    {
      name: "GitHub Trending - JavaScript",
      url: "https://github.com/trending/javascript?since=daily",
      category: "Por Relevancia",
      selectors: {
        articleList: "article.Box-row",
        title: "h2 a",
        image: "img",
        author: ".author",
        content: "p",
      },
    },
    {
      name: "Reddit - ReactJS Top",
      url: "https://www.reddit.com/r/reactjs/top/?t=week",
      category: "Por Relevancia",
      selectors: {
        articleList: "article, shreddit-post",
        title: "h3, a[slot='title']",
        image: "img",
        author: ".author",
        content: ".content, slot[name='text-body']",
      },
    },
    {
      name: "StackOverflow Blog",
      url: "https://stackoverflow.blog/",
      category: "Por Relevancia",
      selectors: {
        articleList: "article, .post",
        title: "h2 a, .post-title a",
        image: "img",
        author: ".author",
        content: ".entry-content, .post-content",
      },
    },
  ],
  spanish: [
    {
      name: "Xataka",
      url: "https://www.xataka.com",
      category: "Tecnología ES",
      selectors: {
        articleList: "article.recent-abstract",
        title: "h2 a",
        image: "img",
        author: ".author-name",
        content: ".article-content",
      },
    },
    {
      name: "Genbeta",
      url: "https://www.genbeta.com",
      category: "Desarrollo ES",
      selectors: {
        articleList: "article.recent-abstract",
        title: "h2 a",
        image: "img",
        author: ".author-name",
        content: ".article-content",
      },
    },
    {
      name: "MuyComputer",
      url: "https://www.muycomputer.com",
      category: "Tecnología ES",
      selectors: {
        articleList: "article.post",
        title: "h2 a",
        image: "img",
        author: ".author-name",
        content: ".entry-content",
      },
    },
    {
      name: "Wired en Español",
      url: "https://es.wired.com/",
      category: "Tecnología ES",
      selectors: {
        articleList: "div[class*='SummaryItemWrapper']",
        title: "h3, a[class*='SummaryItemHedLink']",
        image: "img",
        author: "span[class*='BylineName']",
        content: ".body__inner-container",
      },
    },
    {
      name: "Hipertextual",
      url: "https://hipertextual.com/tecnologia",
      category: "Tecnología ES",
      selectors: {
        articleList: "article.post",
        title: "h2 a",
        image: "img",
        author: ".author",
        content: ".entry-content",
      },
    },
    {
      name: "FayerWayer",
      url: "https://www.fayerwayer.com",
      category: "Tecnología ES",
      selectors: {
        articleList: "article, div.item",
        title: "h2 a, a.c-link",
        image: "img",
        author: ".author",
        content: ".article-content",
      },
    },
    {
      name: "El Hacker",
      url: "https://blog.elhacker.net/",
      category: "Ciberseguridad ES",
      selectors: {
        articleList: "div.post-outer, .date-outer",
        title: "h3 a, a > b",
        image: "img",
        author: "span.post-author",
        content: ".post-body",
      },
    },
  ],
};

// Función para obtener todas las plantillas en un array plano
function getAllTemplates() {
  return [
    ...TEMPLATES.trending,
    ...TEMPLATES.releases,
    ...TEMPLATES.newsletters,
    ...TEMPLATES.popular,
    ...TEMPLATES.spanish,
  ];
}

// Función para obtener plantillas por categoría
function getTemplatesByCategory(category) {
  return TEMPLATES[category] || [];
}

module.exports = {
  TEMPLATES,
  getAllTemplates,
  getTemplatesByCategory,
};
