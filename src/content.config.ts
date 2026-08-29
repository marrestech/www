import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const text = z.string().min(1);
const heading = z.array(text).min(1);
const link = z.object({ label: text, href: text }).strict();
const action = link
  .extend({ style: z.enum(["plain", "dark", "quiet"]) })
  .strict();
const copyBlock = z
  .object({
    eyebrow: text,
    heading: text,
    description: text,
    points: z.array(text).min(1),
  })
  .strict();

const home = defineCollection({
  loader: glob({ pattern: "**/*.{yaml,yml}", base: "./src/content/home" }),
  schema: z
    .object({
      meta: z
        .object({
          language: text,
          description: text,
          title: text,
        })
        .strict(),
      brand: z
        .object({
          name: text,
          suffix: text,
          href: text,
        })
        .strict(),
      navigation: z
        .object({
          ariaLabel: text,
          items: z.array(link).min(1),
          actions: z.array(action).min(1),
        })
        .strict(),
      hero: z
        .object({
          eyebrow: text,
          heading,
          description: text,
          actions: z.array(action).min(1),
        })
        .strict(),
      capabilities: z
        .array(
          z
            .object({
              number: text,
              hint: text,
              image: text,
              alt: text,
              title: text,
              description: text,
            })
            .strict(),
        )
        .length(4),
      decisionSystem: z
        .object({
          eyebrow: text,
          heading,
          description: text,
          action: link,
          brief: z
            .object({
              reference: text,
              status: text,
              category: text,
              question: text,
              indicators: z
                .array(z.object({ label: text, value: text }).strict())
                .length(3),
              answerLabel: text,
              answer: text,
            })
            .strict(),
        })
        .strict(),
      understand: z
        .object({
          panel: z
            .object({
              reference: text,
              status: text,
              headers: z.array(text).length(4),
              peerLabel: text,
              rows: z
                .array(
                  z
                    .object({
                      name: text,
                      elasticity: text,
                      gapAriaLabel: text,
                      gapWidth: z.number().int().min(0).max(100),
                      opportunityAriaLabel: text,
                      directWidth: z.number().int().min(0).max(100),
                      indirectWidth: z.number().int().min(0).max(100),
                      uplift: text,
                      upliftPeriod: text,
                      focus: z.boolean(),
                    })
                    .strict(),
                )
                .length(4)
                .refine(
                  (rows) => rows.filter((row) => row.focus).length === 1,
                  "Exactly one decision row must be focused",
                )
                .refine(
                  (rows) =>
                    rows.every(
                      (row) => row.directWidth + row.indirectWidth === 100,
                    ),
                  "Each opportunity width pair must total 100",
                ),
              key: z.object({ direct: text, indirect: text }).strict(),
              calloutLabel: text,
              callout: text,
              note: text,
            })
            .strict(),
          copy: copyBlock,
        })
        .strict(),
      explain: z
        .object({
          copy: copyBlock,
          mechanism: z
            .object({
              nodes: z
                .array(z.object({ label: text, value: text }).strict())
                .length(3),
              connector: text,
              assumptionLabel: text,
              assumption: text,
            })
            .strict(),
        })
        .strict(),
      simulate: z
        .object({
          panel: z
            .object({
              reference: text,
              status: text,
              options: z
                .array(
                  z
                    .object({
                      label: text,
                      score: text,
                      selected: z.boolean(),
                    })
                    .strict(),
                )
                .length(3)
                .refine(
                  (options) =>
                    options.filter((option) => option.selected).length === 1,
                  "Exactly one strategy option must be selected",
                ),
            })
            .strict(),
          copy: copyBlock,
        })
        .strict(),
      workflow: z
        .object({
          eyebrow: text,
          heading: text,
          steps: z
            .array(z.object({ number: text, label: text }).strict())
            .length(4),
        })
        .strict(),
      questions: z
        .object({
          eyebrow: text,
          heading,
          items: z
            .array(
              z
                .object({
                  category: text,
                  question: text,
                  actionLabel: text,
                  href: text,
                })
                .strict(),
            )
            .length(3),
        })
        .strict(),
      industries: z
        .object({
          intro: z
            .object({
              eyebrow: text,
              heading: text,
              description: text,
              actionLabel: text,
              href: text,
            })
            .strict(),
          cases: z
            .array(
              z
                .object({
                  category: text,
                  heading: text,
                  description: text,
                  tone: z.enum(["violet", "orange"]),
                })
                .strict(),
            )
            .length(2),
        })
        .strict(),
      pricing: z
        .object({
          eyebrow: text,
          heading,
          description: text,
          plan: z
            .object({
              name: text,
              price: text,
              period: text,
              features: z.array(text).min(1),
              actionLabel: text,
              href: text,
            })
            .strict(),
        })
        .strict(),
      finalCallToAction: z
        .object({
          eyebrow: text,
          heading,
          actions: z.array(action).min(1),
        })
        .strict(),
      footer: z
        .object({
          tagline: text,
          links: z.array(link).min(1),
        })
        .strict(),
    })
    .strict(),
});

export const collections = { home };
