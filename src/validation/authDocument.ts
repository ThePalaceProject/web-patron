import { type } from "arktype";

const AuthDocLinkSchema = type({
  href: "string",
  "rel?": "string",
  "title?": "string",
  "type?": "string",
  "role?": "string"
});

const AuthMethodSchema = type({
  type: "string",
  "description?": "string"
});

export const AuthDocumentSchema = type({
  id: "string",
  title: "string",
  "description?": "string",
  "links?": AuthDocLinkSchema.array(),
  authentication: AuthMethodSchema.array(),
  "announcements?": type({ id: "string", content: "string" }).array(),
  "web_color_scheme?": type({
    "primary?": "string",
    "secondary?": "string"
  })
});
