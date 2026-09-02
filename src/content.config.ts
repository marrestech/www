import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const text = z.string().min(1);
const optionalText = z.string();
const link = z.object({ label: text, href: text }).strict();
const splitHeading = z
  .object({
    tag: text,
    heading: text,
    fadedHeading: text,
    description: text,
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
          canonicalUrl: z.url(),
          socialImage: text,
          socialImageAlt: text,
        })
        .strict(),
      brand: z
        .object({ name: text, href: text, logo: text, logoAlt: optionalText })
        .strict(),
      navigation: z
        .object({
          ariaLabel: text,
          items: z.array(link),
          signIn: link,
          action: link,
        })
        .strict(),
      hero: z
        .object({
          tag: text,
          heading: text,
          fadedHeading: text,
          description: text,
          ariaLabel: text,
          backgroundImage: text,
          coreLabel: text,
          orbitLabels: z.array(text).length(4),
        })
        .strict(),
      readout: splitHeading
        .extend({
          image: text,
          imageAlt: text,
          imageLabel: text,
          metrics: z
            .array(
              z
                .object({
                  label: text,
                  value: text,
                  suffix: optionalText,
                  note: text,
                  tone: z.enum(["mint", "blue", "violet"]),
                  side: z.enum(["left", "right"]),
                })
                .strict(),
            )
            .length(4)
            .refine(
              (metrics) =>
                metrics.filter((metric) => metric.side === "left").length === 2,
              "Readout must have two left metrics",
            ),
        })
        .strict(),
      method: z
        .object({
          tag: text,
          heading: text,
          description: text,
          action: link,
          steps: z
            .array(
              z
                .object({
                  number: text,
                  title: text,
                  description: text,
                  variant: z.enum(["decision", "system", "brief"]),
                })
                .strict(),
            )
            .length(3)
            .refine(
              (steps) => new Set(steps.map((step) => step.variant)).size === 3,
              "Method must use each demo variant once",
            ),
          decisionDemo: z
            .object({
              header: text,
              status: text,
              label: text,
              question: text,
              detail: text,
            })
            .strict(),
          systemDemo: z
            .object({
              header: text,
              status: text,
              rows: z
                .array(
                  z
                    .object({
                      label: text,
                      tone: z.enum(["mint", "blue", "orange", "violet"]),
                    })
                    .strict(),
                )
                .length(4),
            })
            .strict(),
          briefDemo: z
            .object({
              header: text,
              status: text,
              image: text,
              grade: text,
              gradeLabel: text,
              recommendation: text,
            })
            .strict(),
        })
        .strict(),
      trace: splitHeading
        .extend({
          records: z
            .array(
              z
                .object({
                  label: text,
                  tone: z.enum(["mint", "blue"]),
                  lines: z
                    .array(z.object({ key: text, value: text }).strict())
                    .length(3),
                })
                .strict(),
            )
            .length(3),
          benefits: z
            .array(z.object({ title: text, description: text }).strict())
            .length(3),
        })
        .strict(),
      pricing: splitHeading
        .extend({
          plans: z
            .array(
              z
                .object({
                  badge: text,
                  name: text,
                  price: text,
                  period: text,
                  actionLabel: text.optional(),
                  href: text.optional(),
                  featured: z.boolean(),
                  features: z.array(text).min(1),
                })
                .strict()
                .refine(
                  (plan) => Boolean(plan.actionLabel) === Boolean(plan.href),
                  "A pricing action needs both a label and a destination",
                ),
            )
            .length(3)
            .refine(
              (plans) => plans.filter((plan) => plan.featured).length === 1,
              "Pricing must have one featured plan",
            ),
          assurances: z.array(text).length(3),
        })
        .strict(),
      continuity: splitHeading
        .extend({
          cards: z
            .array(
              z
                .object({
                  label: text,
                  status: text,
                  title: text,
                  description: text,
                })
                .strict(),
            )
            .length(3),
        })
        .strict(),
      footer: z
        .object({
          heading: text,
          description: text,
          columns: z
            .array(z.object({ heading: text, links: z.array(link) }).strict())
            .length(1),
        })
        .strict(),
    })
    .strict(),
});

export const collections = { home };
