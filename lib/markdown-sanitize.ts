import { defaultSchema } from "rehype-sanitize";

/** Sanitize schema that keeps highlight.js class names on code blocks. */
export const markdownSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [
      ...(defaultSchema.attributes?.code ?? []),
      ["className", /^language-[\w-]+$/],
      ["className", "hljs"],
    ],
    span: [...(defaultSchema.attributes?.span ?? []), ["className"]],
    pre: [...(defaultSchema.attributes?.pre ?? []), ["className"]],
    th: [
      ...(defaultSchema.attributes?.th ?? []),
      ["align", "left", "center", "right", "justify", "char"],
      ["colSpan", "rowSpan"],
    ],
    td: [
      ...(defaultSchema.attributes?.td ?? []),
      ["align", "left", "center", "right", "justify", "char"],
      ["colSpan", "rowSpan"],
    ],
    img: [
      ...(defaultSchema.attributes?.img ?? []),
      ["src"],
      ["alt"],
      ["title"],
      ["width"],
      ["height"],
      ["loading"],
    ],
  },
} as const;
