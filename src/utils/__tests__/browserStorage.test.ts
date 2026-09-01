import { describe, expect, jest, test } from "@jest/globals";
import {
  getStoredItem,
  setStoredItem,
  removeStoredItem
} from "utils/browserStorage";

describe("browserStorage", () => {
  test("set, get, and remove round-trip", () => {
    expect(getStoredItem("key")).toBeNull();
    expect(setStoredItem("key", "value")).toBe(true);
    expect(getStoredItem("key")).toBe("value");
    expect(removeStoredItem("key")).toBe(true);
    expect(getStoredItem("key")).toBeNull();
  });

  test("setStoredItem returns false when storage throws (quota exceeded)", () => {
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("quota exceeded", "QuotaExceededError");
    });
    expect(setStoredItem("key", "value")).toBe(false);
  });

  test("getStoredItem returns null when storage throws", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });
    expect(getStoredItem("key")).toBeNull();
  });

  test("removeStoredItem returns false when storage throws", () => {
    jest.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });
    expect(removeStoredItem("key")).toBe(false);
  });
});
