import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
    canonical: "https://marres.io/",
  },
  {
    path: "/contact",
    file: "dist/contact/index.html",
    canonical: "https://marres.io/contact",
  },
  {
    path: "/privacy",
    file: "dist/privacy/index.html",
    canonical: "https://marres.io/privacy",
  },
  {
    path: "/terms",
    file: "dist/terms/index.html",
    canonical: "https://marres.io/terms",
  },
  {
    path: "/security",
    file: "dist/security/index.html",
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

test("all public routes have metadata and social tags", () => {
  for (const route of routes) {
    const html = htmlByPath.get(route.path);
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    const description = attributeContent(html, "meta", "name", "description");
    const imageAlt = attributeContent(html, "meta", "property", "og:image:alt");

    assert.ok(title);
    assert.ok(description);
    assert.ok(imageAlt);
    assert.match(
      html,
      new RegExp(
        `<link[^>]*rel=["']canonical["'][^>]*href=["']${escaped(route.canonical)}["']`,
      ),
    );
    assert.equal(attributeContent(html, "meta", "property", "og:title"), title);
    assert.equal(
      attributeContent(html, "meta", "property", "og:description"),
      description,
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
      attributeContent(html, "meta", "name", "twitter:card"),
      "summary_large_image",
    );
    assert.equal(
      attributeContent(html, "meta", "name", "twitter:title"),
      title,
    );
    assert.equal(
      attributeContent(html, "meta", "name", "twitter:description"),
      description,
    );
    assert.equal(
      attributeContent(html, "meta", "name", "twitter:image"),
      "https://marres.io/images/marres-social.png",
    );
    assert.equal(
      attributeContent(html, "meta", "name", "twitter:image:alt"),
      imageAlt,
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
