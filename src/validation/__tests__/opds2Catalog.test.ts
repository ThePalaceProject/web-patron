import { beforeEach, describe, expect, test } from "@jest/globals";
import { type } from "arktype";
import {
  lenientValidate,
  Opds2FeedSchema,
  Opds2PublicationSchema,
  resetOpds2MismatchReports
} from "validation/opds2Catalog";
import * as fixtures from "test-utils/fixtures/opds2-catalog";
import { mockTrackError } from "test-utils";

beforeEach(() => {
  resetOpds2MismatchReports();
});

describe("OPDS 2 catalog schemas", () => {
  test.each([
    ["grouped feed", fixtures.groupedFeed],
    ["paginated feed", fixtures.paginatedFeed],
    ["navigation feed", fixtures.navigationFeed],
    ["loans feed", fixtures.loansFeed]
  ])("accepts a realistic CM %s", (_label, feed) => {
    expect(Opds2FeedSchema(feed)).not.toBeInstanceOf(type.errors);
  });

  test.each([
    ["borrowable", fixtures.borrowablePublication],
    ["reserved", fixtures.reservedPublication],
    ["loaned", fixtures.loanedPublication],
    ["audiobook", fixtures.audiobookPublication],
    ["no acquisition", fixtures.noAcquisitionPublication]
  ])("accepts a realistic CM %s publication", (_label, publication) => {
    expect(Opds2PublicationSchema(publication)).not.toBeInstanceOf(type.errors);
  });

  test("ignores unknown keys so CM extensions pass through", () => {
    const result = Opds2FeedSchema({
      metadata: { title: "Extended", "http://example.com/x-extension": 1 },
      links: [],
      publications: []
    });
    expect(result).not.toBeInstanceOf(type.errors);
  });
});

describe("lenientValidate", () => {
  const drifted = { metadata: { title: 42 } };

  test("returns validated data and does not report on success", () => {
    const result = lenientValidate(
      Opds2FeedSchema,
      fixtures.groupedFeed,
      "https://cm.example.com/catalog"
    );
    expect(result).toEqual(fixtures.groupedFeed);
    expect(mockTrackError).not.toHaveBeenCalled();
  });

  test("returns the raw data and reports a warning on mismatch", () => {
    const result = lenientValidate(
      Opds2FeedSchema,
      drifted,
      "https://cm.example.com/catalog"
    );
    expect(result).toBe(drifted);
    expect(mockTrackError).toHaveBeenCalledTimes(1);
    const [error, options] = mockTrackError.mock.calls[0];
    expect(error.message).toContain("OPDS 2 Schema Mismatch");
    expect(options.severity).toBe("warning");
    expect(options.metadata["OPDS 2 Validation"].url).toBe(
      "https://cm.example.com/catalog"
    );
    expect(options.metadata["OPDS 2 Validation"].summary).toContain("title");
  });

  test("dedupes repeat mismatches for the same url path", () => {
    lenientValidate(Opds2FeedSchema, drifted, "https://cm.example.com/a?p=1");
    lenientValidate(Opds2FeedSchema, drifted, "https://cm.example.com/a?p=2");
    expect(mockTrackError).toHaveBeenCalledTimes(1);

    lenientValidate(Opds2FeedSchema, drifted, "https://cm.example.com/b");
    expect(mockTrackError).toHaveBeenCalledTimes(2);
  });

  test("resetOpds2MismatchReports clears dedupe state", () => {
    lenientValidate(Opds2FeedSchema, drifted, "https://cm.example.com/a");
    resetOpds2MismatchReports();
    lenientValidate(Opds2FeedSchema, drifted, "https://cm.example.com/a");
    expect(mockTrackError).toHaveBeenCalledTimes(2);
  });

  test("dedupe state clears once the report window elapses", () => {
    const t0 = Date.now();
    const dateSpy = jest.spyOn(Date, "now").mockReturnValue(t0);

    lenientValidate(Opds2FeedSchema, drifted, "https://cm.example.com/a");
    expect(mockTrackError).toHaveBeenCalledTimes(1);

    dateSpy.mockReturnValue(t0 + 61 * 60 * 1000);
    lenientValidate(Opds2FeedSchema, drifted, "https://cm.example.com/a");
    expect(mockTrackError).toHaveBeenCalledTimes(2);
  });
});
