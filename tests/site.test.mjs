import assert from "node:assert/strict";
import { glob, readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { after, before, test } from "node:test";

let previewOrigin;
let previewServer;

before(async () => {
  previewServer = createServer(async (request, response) => {
    const path = new URL(request.url, "http://localhost").pathname;
    const route = routes.find((candidate) => candidate.path === path);
    const file =
      route?.file ??
      (path === "/robots.txt"
        ? "dist/robots.txt"
        : path === "/sitemap.xml"
          ? "dist/sitemap.xml"
          : undefined);
    if (!file) {
      response.writeHead(404).end();
      return;
    }

    const body = await readFile(file);
    const contentType = file.endsWith(".html")
      ? "text/html"
      : file.endsWith(".xml")
        ? "text/xml"
        : "text/plain";
    response.writeHead(200, { "Content-Type": contentType }).end(body);
  });
  await new Promise((resolve) => previewServer.listen(0, "127.0.0.1", resolve));
  const address = previewServer.address();
  assert.ok(address && typeof address === "object");
  previewOrigin = `http://127.0.0.1:${address.port}`;
});

after(
  () =>
    new Promise((resolve, reject) => {
      previewServer.close((error) => (error ? reject(error) : resolve()));
    }),
);

const routes = [
  {
    path: "/",
    file: "dist/index.html",
    title: "Marres — Test the decision before you commit",
    description:
      "Marres maps the business, market, and competitors around a decision so growing businesses can test a move before committing capital.",
    canonical: "https://marres.io/",
  },
  {
    path: "/contact",
    file: "dist/contact/index.html",
    title: "Contact Marres | Marres",
    description:
      "Contact Marres Insights Pte Ltd in Singapore about the Marres service, account access, privacy, terms, or security.",
    canonical: "https://marres.io/contact",
  },
  {
    path: "/privacy",
    file: "dist/privacy/index.html",
    title: "Privacy Policy | Marres",
    description:
      "Read how Marres handles account, billing, company, Google review, analysis, and provider data for its launch service.",
    canonical: "https://marres.io/privacy",
  },
  {
    path: "/terms",
    file: "dist/terms/index.html",
    title: "Terms of Service | Marres",
    description:
      "Read the terms that govern accounts, subscriptions, submitted data, outputs, payments, and use of the Marres service.",
    canonical: "https://marres.io/terms",
  },
  {
    path: "/security",
    file: "dist/security/index.html",
    title: "Security at Marres | Marres",
    description:
      "Read the verified application and hosting controls that protect Marres accounts, tenant data, provider calls, and secrets.",
    canonical: "https://marres.io/security",
  },
];

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Marres Insights Pte Ltd",
  url: "https://marres.io/",
  logo: "https://marres.io/images/marres-mark-square.svg",
  email: "founders@marres.io",
  identifier: "UEN 202604012K",
};

const htmlByPath = new Map();

for (const route of routes) {
  htmlByPath.set(route.path, await readFile(route.file, "utf8"));
}

const sourceFiles = [];
for (const pattern of ["src/**/*.*", "tests/**/*.*"]) {
  for await (const file of glob(pattern)) {
    sourceFiles.push(file);
  }
}
const sourceText = (
  await Promise.all(sourceFiles.map((file) => readFile(file, "utf8")))
).join("\n");
const builtHtml = [...htmlByPath.values()].join("\n");

function escaped(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function attributeContent(html, element, attribute, value) {
  const pattern = new RegExp(
    `<${element}[^>]*${attribute}=["']${escaped(value)}["'][^>]*content=["']([^"']*)["'][^>]*>`,
    "i",
  );
  const reversePattern = new RegExp(
    `<${element}[^>]*content=["']([^"']*)["'][^>]*${attribute}=["']${escaped(value)}["'][^>]*>`,
    "i",
  );
  return html.match(pattern)?.[1] ?? html.match(reversePattern)?.[1];
}

test("all public routes have exact metadata and social tags", () => {
  assert.equal(new Set(routes.map((route) => route.title)).size, routes.length);
  assert.equal(
    new Set(routes.map((route) => route.description)).size,
    routes.length,
  );

  for (const route of routes) {
    const html = htmlByPath.get(route.path);
    assert.match(html, new RegExp(`<title>${escaped(route.title)}</title>`));
    assert.equal(
      attributeContent(html, "meta", "name", "description"),
      route.description,
    );
    assert.match(
      html,
      new RegExp(
        `<link[^>]*rel=["']canonical["'][^>]*href=["']${escaped(route.canonical)}["']`,
      ),
    );
    assert.equal(
      attributeContent(html, "meta", "property", "og:title"),
      route.title,
    );
    assert.equal(
      attributeContent(html, "meta", "property", "og:description"),
      route.description,
    );
    assert.equal(
      attributeContent(html, "meta", "property", "og:type"),
      "website",
    );
    assert.equal(
      attributeContent(html, "meta", "property", "og:site_name"),
      "Marres",
    );
    assert.equal(
      attributeContent(html, "meta", "property", "og:url"),
      route.canonical,
    );
    assert.equal(
      attributeContent(html, "meta", "property", "og:image"),
      "https://marres.io/images/marres-social.png",
    );
    assert.equal(
      attributeContent(html, "meta", "property", "og:image:alt"),
      "The Marres mark on a black background",
    );
    assert.equal(
      attributeContent(html, "meta", "name", "twitter:card"),
      "summary_large_image",
    );
    assert.equal(
      attributeContent(html, "meta", "name", "twitter:title"),
      route.title,
    );
    assert.equal(
      attributeContent(html, "meta", "name", "twitter:description"),
      route.description,
    );
    assert.equal(
      attributeContent(html, "meta", "name", "twitter:image"),
      "https://marres.io/images/marres-social.png",
    );
    assert.equal(
      attributeContent(html, "meta", "name", "twitter:image:alt"),
      "The Marres mark on a black background",
    );
  }
});

test("every page has one main landmark, a skip target, and the shared footer", () => {
  for (const route of routes) {
    const html = htmlByPath.get(route.path);
    assert.equal(
      html.match(/<main\b/gi)?.length,
      1,
      `${route.path} main count`,
    );
    assert.match(html, /<main[^>]*id=["']main-content["']/i);
    assert.match(
      html,
      /<a[^>]*class=["']skip-link["'][^>]*href=["']#main-content["']/i,
    );
    assert.match(
      html,
      /Decision intelligence for small and growing businesses\./,
    );
    assert.match(html, /Marres Insights Pte Ltd/);
    assert.match(html, /UEN 202604012K/);
    assert.match(html, />Singapore</);
    assert.match(html, /mailto:founders@marres\.io/);
    for (const link of ["/contact", "/privacy", "/terms", "/security"]) {
      assert.match(html, new RegExp(`href=["']${escaped(link)}["']`));
    }
  }
});

test("pages keep one heading and no executable client script", () => {
  for (const route of routes) {
    const html = htmlByPath.get(route.path);
    assert.equal(html.match(/<h1\b/gi)?.length, 1, `${route.path} h1 count`);
    const scriptTypes = [...html.matchAll(/<script\b([^>]*)>/gi)].map(
      ([, attributes]) =>
        attributes.match(/type=["']([^"']+)["']/i)?.[1] ?? "javascript",
    );
    assert.deepEqual(scriptTypes, ["application/ld+json"]);
  }

  const home = htmlByPath.get("/");
  for (const target of ["top", "solutions", "method", "pricing"]) {
    assert.match(home, new RegExp(`id=["']${target}["']`));
  }
  for (const page of ["/contact", "/privacy", "/terms", "/security"]) {
    assert.match(htmlByPath.get(page), /href=["']\/#solutions["']/);
    assert.match(htmlByPath.get(page), /href=["']\/#method["']/);
  }
});

test("contact page provides the approved business facts and mail action", () => {
  const html = htmlByPath.get("/contact");
  assert.match(html, /<h1[^>]*>Contact<\/h1>/);
  assert.match(html, /Marres Insights Pte Ltd/);
  assert.match(html, /UEN 202604012K/);
  assert.match(html, />Singapore</);
  assert.match(html, /href=["']mailto:founders@marres\.io["']/);
});

test("public email is current in source, links, and built output", () => {
  const retiredEmail = ["marresinsights", "gmail.com"].join("@");

  assert.ok(!sourceText.includes(retiredEmail));
  assert.ok(!builtHtml.includes(retiredEmail));
  for (const route of routes) {
    const html = htmlByPath.get(route.path);
    assert.match(html, /mailto:founders@marres\.io/);
    assert.match(html, />founders@marres\.io</);
  }
});

test("pricing has one exact launch tier and marks the Brief unavailable", () => {
  const home = htmlByPath.get("/");
  const plans = [
    ...home.matchAll(/<article[^>]*class=["'][^"']*\bplan\b[^"']*["']/gi),
  ];
  assert.equal(plans.length, 1);
  assert.match(home, /<h3>LAUNCH<\/h3>/);
  assert.equal(home.match(/S\$99/g)?.length, 1);
  assert.match(
    home,
    /<div class=["']price["']>\s*S\$99\s*<small>\/ month<\/small>\s*<\/div>/,
  );
  assert.match(
    home,
    /Up to 5,000 sources per company for one target and six competitors/,
  );
  assert.match(home, /Four Decision Panel decisions per month/);

  const briefFeature = home.match(
    /<li[^>]*class=["'][^"']*coming-soon-feature[^"']*["'][^>]*>([\s\S]*?)<\/li>/i,
  )?.[1];
  assert.ok(briefFeature, "coming-soon Brief feature exists");
  assert.match(briefFeature, /<span>Weekly Marres Brief<\/span>/);
  assert.match(
    briefFeature,
    /<span class=["']coming-soon["']>Coming soon!<\/span>/,
  );
  assert.equal(home.match(/Coming soon!/g)?.length, 1);

  assert.doesNotMatch(home, /S\$(?:20|499)\s*<small>\/ month<\/small>/);
  for (const retiredCopy of [
    ">CORE<",
    ">BUSINESS<",
    ">PRO<",
    "Up to 3 projects",
    "Monitor up to 3 competitors",
    "Up to 15 projects",
    "Monitor up to 15 competitors",
    "Up to 5 accounts",
  ]) {
    assert.ok(
      !home.includes(retiredCopy),
      `retired pricing copy: ${retiredCopy}`,
    );
  }
});

test("organization JSON-LD parses and contains only approved fields", () => {
  for (const route of routes) {
    const html = htmlByPath.get(route.path);
    const source = html.match(
      /<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/,
    )?.[1];
    assert.ok(source, `${route.path} JSON-LD exists`);
    assert.deepEqual(JSON.parse(source), organization);
  }
});

test("new public copy contains no em dash or obsolete claims", () => {
  const policyHtml = ["/contact", "/privacy", "/terms", "/security"]
    .map((path) => htmlByPath.get(path))
    .join("\n");
  assert.ok(!policyHtml.includes("—"), "new route copy contains an em dash");

  const obsoleteClaims = [
    "Groq",
    "RunPod",
    "Neon",
    "Replit",
    "Google Calendar",
    "Instagram",
    "bcrypt",
    "reCAPTCHA",
    "account lockout",
    "AES",
    "append-only",
    "seven-day input retention",
    "365-day output retention",
    "two-year audit retention",
  ];
  for (const claim of obsoleteClaims) {
    assert.ok(!policyHtml.includes(claim), `obsolete claim found: ${claim}`);
  }
});

test("production output serves every route, robots, and sitemap", async () => {
  for (const path of [
    "/",
    "/contact",
    "/privacy",
    "/terms",
    "/security",
    "/robots.txt",
    "/sitemap.xml",
  ]) {
    const response = await fetch(`${previewOrigin}${path}`);
    assert.equal(response.status, 200, `${path} status`);
  }

  const robotsResponse = await fetch(`${previewOrigin}/robots.txt`);
  const robots = await robotsResponse.text();
  assert.equal(
    robots,
    "User-agent: *\nAllow: /\n\nSitemap: https://marres.io/sitemap.xml\n",
  );

  const sitemapResponse = await fetch(`${previewOrigin}/sitemap.xml`);
  const sitemap = await sitemapResponse.text();
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    ([, location]) => location,
  );
  assert.deepEqual(
    locations,
    routes.map((route) => route.canonical),
  );
  assert.equal(new Set(locations).size, routes.length);
  assert.ok(!sitemap.includes("app.marres.io"));
  assert.ok(!sitemap.includes("marresinsights.com"));
});
