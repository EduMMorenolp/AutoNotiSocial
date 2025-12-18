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
        articleList: "article.crayons-story",
        title: "h2 a",
        image: "img",
        author: ".crayons-story__secondary a",
        content: ".crayons-story__body",
      },
    },
    {
      name: "Medium - React",
      url: "https://medium.com/tag/react/latest",
      category: "Trending Topic",
      selectors: {
        articleList: "article",
        title: "h2",
        image: "img",
        author: ".pw-author-name",
        content: "section",
      },
    },
    {
      name: "Hashnode - Node.js",
      url: "https://hashnode.com/n/nodejs",
      category: "Trending Topic",
      selectors: {
        articleList: "article",
        title: "h1 a, h2 a",
        image: "img",
        author: ".author-name",
        content: ".article-content",
      },
    },
    {
      name: "Dev.to - CSS",
      url: "https://dev.to/t/css",
      category: "Trending Topic",
      selectors: {
        articleList: "article.crayons-story",
        title: "h2 a",
        image: "img",
        author: ".crayons-story__secondary a",
        content: ".crayons-story__body",
      },
    },
    {
      name: "FreeCodeCamp - TypeScript",
      url: "https://www.freecodecamp.org/news/tag/typescript/",
      category: "Trending Topic",
      selectors: {
        articleList: "article.post-card",
        title: ".post-card-title",
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
        articleList: "article, .blog-post",
        title: "h2 a, .title",
        image: "img",
        author: ".author",
        content: ".blog-post-body",
      },
    },
    {
      name: "Next.js Blog",
      url: "https://nextjs.org/blog",
      category: "Lanzamientos",
      selectors: {
        articleList: "article",
        title: "h2 a",
        image: "img",
        author: ".author",
        content: ".post-content",
      },
    },
    {
      name: "Tailwind CSS Blog",
      url: "https://blog.tailwindcss.com",
      category: "Lanzamientos",
      selectors: {
        articleList: "article",
        title: "h2 a",
        image: "img",
        author: ".author",
        content: ".prose",
      },
    },
    {
      name: "GitHub Blog - Changelog",
      url: "https://github.blog/changelog/",
      category: "Lanzamientos",
      selectors: {
        articleList: "article",
        title: "h2 a, h3 a",
        image: "img",
        author: ".author",
        content: ".markdown-body",
      },
    },
    {
      name: "V8 Engine Blog",
      url: "https://v8.dev/blog",
      category: "Lanzamientos",
      selectors: {
        articleList: "article",
        title: "h2 a",
        image: "img",
        author: ".author",
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
        author: ".author",
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
        author: ".author",
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
        author: ".author",
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
        articleList: "article",
        title: "h3",
        image: "img",
        author: ".author",
        content: ".content",
      },
    },
    {
      name: "StackOverflow Blog",
      url: "https://stackoverflow.blog/",
      category: "Por Relevancia",
      selectors: {
        articleList: "article",
        title: "h2 a",
        image: "img",
        author: ".author",
        content: ".entry-content",
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
        articleList: "article.article-card",
        title: "h2 a",
        image: "img",
        author: ".author",
        content: ".article-content",
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
