/**
 * @jest-environment node
 *
 * Tests for AuthDocumentSchema runtime validation.
 * Run under jest.config.node.js.
 */

import { type } from "arktype";
import { AuthDocumentSchema } from "validation/authDocument";

function minimal() {
  return { id: "urn:uuid:abc", title: "Test Library", authentication: [] };
}

describe("AuthDocumentSchema", () => {
  it("accepts a minimal valid auth document", () => {
    const result = AuthDocumentSchema(minimal());
    expect(result instanceof type.errors).toBe(false);
  });

  it("accepts an auth document with all optional fields", () => {
    const doc = {
      ...minimal(),
      description: "A test library",
      links: [
        { href: "/catalog", rel: "start" },
        { href: "/shelf", rel: "http://opds-spec.org/shelf" }
      ],
      announcements: [{ id: "ann-1", content: "Welcome!" }],
      web_color_scheme: { primary: "#000", secondary: "#fff" } // eslint-disable-line camelcase -- from external API
    };
    const result = AuthDocumentSchema(doc);
    expect(result instanceof type.errors).toBe(false);
  });

  it("accepts auth methods with extra fields (labels, inputs, etc.)", () => {
    const doc = {
      ...minimal(),
      authentication: [
        {
          type: "http://opds-spec.org/auth/basic",
          description: "Basic Auth",
          labels: { login: "Barcode", password: "PIN" },
          inputs: { login: { keyboard: "Default" } }
        },
        {
          type: "http://librarysimplified.org/authtype/SAML-2.0",
          links: [{ href: "https://idp.example.com/", rel: "authenticate" }]
        }
      ]
    };
    const result = AuthDocumentSchema(doc);
    expect(result instanceof type.errors).toBe(false);
  });

  it("preserves extra fields on the validated output", () => {
    const doc = {
      ...minimal(),
      authentication: [
        {
          type: "http://opds-spec.org/auth/basic",
          labels: { login: "Barcode", password: "PIN" }
        }
      ]
    };
    const result = AuthDocumentSchema(doc);
    expect(result instanceof type.errors).toBe(false);
    expect((result as any).authentication[0].labels).toEqual({
      login: "Barcode",
      password: "PIN"
    });
  });

  it("rejects when id is missing", () => {
    const result = AuthDocumentSchema({ title: "X", authentication: [] });
    expect(result instanceof type.errors).toBe(true);
    expect((result as any).summary).toContain("id");
  });

  it("rejects when title is missing", () => {
    const result = AuthDocumentSchema({ id: "x", authentication: [] });
    expect(result instanceof type.errors).toBe(true);
    expect((result as any).summary).toContain("title");
  });

  it("rejects when authentication is missing", () => {
    const result = AuthDocumentSchema({ id: "x", title: "X" });
    expect(result instanceof type.errors).toBe(true);
    expect((result as any).summary).toContain("authentication");
  });

  it("rejects when authentication is not an array", () => {
    const result = AuthDocumentSchema({
      id: "x",
      title: "X",
      authentication: "not-array"
    });
    expect(result instanceof type.errors).toBe(true);
  });

  it("rejects when an auth method is missing its type field", () => {
    const result = AuthDocumentSchema({
      ...minimal(),
      authentication: [{ description: "no type" }]
    });
    expect(result instanceof type.errors).toBe(true);
    expect((result as any).summary).toContain("type");
  });

  it("rejects when a link is missing its href", () => {
    const result = AuthDocumentSchema({
      ...minimal(),
      links: [{ rel: "start" }]
    });
    expect(result instanceof type.errors).toBe(true);
    expect((result as any).summary).toContain("href");
  });

  it("rejects a completely wrong response (e.g. HTML parsed as JSON)", () => {
    const result = AuthDocumentSchema("not an object");
    expect(result instanceof type.errors).toBe(true);
  });

  it("rejects null", () => {
    const result = AuthDocumentSchema(null);
    expect(result instanceof type.errors).toBe(true);
  });

  it("rejects an empty object", () => {
    const result = AuthDocumentSchema({});
    expect(result instanceof type.errors).toBe(true);
  });
});
