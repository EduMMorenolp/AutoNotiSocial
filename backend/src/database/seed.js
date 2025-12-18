const { db } = require("./init");
const { getAllTemplates } = require("./templates");

/**
 * Seed database with high-quality developer news sources
 */
function seedSources() {
  const sources = [
    {
      name: "Node.js Blog",
      url: "https://nodejs.org/en/blog",
      selectors: {
        articleList: "ul.blog-index li",
        title: "h3 a",
        image: "img",
        author: ".blog-post-meta", // Node.js blog no siempre tiene autor claro por post en la lista
        content: ".blog-post",
      },
    },
    {
      name: "React Blog",
      url: "https://react.dev/blog",
      selectors: {
        articleList: "article",
        title: "h2",
        image: "img",
        author: "span",
        content: ".prose",
      },
    },
    {
      name: "Dev.to (JavaScript)",
      url: "https://dev.to/t/javascript",
      selectors: {
        articleList: ".crayons-story",
        title: ".crayons-story__title a",
        image: ".crayons-story__cover-image img",
        author: ".crayons-story__secondary",
        content: "#article-body",
      },
    },
    {
      name: "Web.dev (Google)",
      url: "https://web.dev/blog",
      selectors: {
        articleList: ".card",
        title: ".card__heading a",
        image: ".card__image",
        author: ".author__name",
        content: ".main",
      },
    },
    {
      name: "Smashing Magazine (Frontend)",
      url: "https://www.smashingmagazine.com/articles/",
      selectors: {
        articleList: ".article--post",
        title: ".article--post__title a",
        image: ".article--post__image img",
        author: ".article--post__author-name",
        content: ".article__content",
      },
    },
    {
      name: "FreeCodeCamp News",
      url: "https://www.freecodecamp.org/news/",
      selectors: {
        articleList: "article.post-card",
        title: "h2.post-card-title a",
        image: "img.post-card-image",
        author: ".post-card-author",
        content: ".post-full-content",
      },
    },
    {
      name: "Josh W. Comeau (CSS/React)",
      url: "https://www.joshwcomeau.com/",
      selectors: {
        articleList: "article",
        title: "h3",
        image: "img",
        author: "span",
        content: "main",
      },
    },
    {
      name: "Hacker News (Show HN)",
      url: "https://news.ycombinator.com/show",
      selectors: {
        articleList: ".athing",
        title: ".titleline > a",
        image: "img", // HN no suele tener imágenes
        author: ".hnuser",
        content: ".comment",
      },
    },
  ];

  const insert = db.prepare(`
        INSERT OR IGNORE INTO sources (name, url, selectors_json, schedule, enabled)
        VALUES (?, ?, ?, ?, ?)
    `);

  let inserted = 0;
  for (const source of sources) {
    try {
      const result = insert.run(
        source.name,
        source.url,
        JSON.stringify(source.selectors),
        "0 */6 * * *", // Cada 6 horas
        1
      );
      if (result.changes > 0) inserted++;
    } catch (error) {
      console.error(`Error insertando ${source.name}:`, error.message);
    }
  }

  console.log(`✅ Seeded ${inserted} developer focus sources`);
  return inserted;
}

/**
 * Seed database inserting ALL templates as sources
 */
function seedTemplatesAsSources() {
  const templates = getAllTemplates();

  const insert = db.prepare(`
        INSERT OR IGNORE INTO sources (name, url, selectors_json, schedule, enabled)
        VALUES (?, ?, ?, ?, ?)
    `);

  let inserted = 0;
  for (const tpl of templates) {
    try {
      const result = insert.run(
        tpl.name,
        tpl.url,
        JSON.stringify(tpl.selectors),
        tpl.schedule || "0 */6 * * *",
        1
      );
      if (result.changes > 0) inserted++;
    } catch (error) {
      console.error(`Error insertando plantilla ${tpl.name}:`, error.message);
    }
  }

  console.log(`✅ Seeded ${inserted} sources from templates`);
  return inserted;
}

// Ejecutar el seed si se llama directamente
if (require.main === module) {
  try {
    const useTemplates = process.argv.includes("--templates");
    console.log(
      "🌱 Iniciando seeder...",
      useTemplates ? "(desde plantillas)" : "(curadas)"
    );
    if (useTemplates) {
      seedTemplatesAsSources();
    } else {
      seedSources();
    }
    console.log("✅ Seeder completado exitosamente");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error en seeder:", error);
    process.exit(1);
  }
}

module.exports = { seedSources, seedTemplatesAsSources };
