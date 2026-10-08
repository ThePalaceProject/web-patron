import { describe, expect, jest, test } from "@jest/globals";
import { act, renderHook } from "@testing-library/react";
import {
  ANNOUNCE_DELAY_MS,
  ANNOUNCEMENT_TTL_MS,
  AnnouncerProvider,
  useAnnounce
} from "../AnnouncerContext";

const status = () => document.querySelector("[role='status']")!;

const renderAnnounce = () =>
  renderHook(() => useAnnounce(), { wrapper: AnnouncerProvider });

describe("useAnnounce", () => {
  test("throws when used outside the provider", () => {
    expect(() => renderHook(() => useAnnounce())).toThrow(
      "useAnnounce must be used within an AnnouncerProvider"
    );
  });

  test("writes the message after a delay and clears it later", () => {
    const { result } = renderAnnounce();

    act(() => result.current("Pinned."));
    expect(status().textContent).toBe("");

    act(() => {
      jest.advanceTimersByTime(ANNOUNCE_DELAY_MS);
    });
    expect(status().textContent).toBe("Pinned.");

    act(() => {
      jest.advanceTimersByTime(ANNOUNCEMENT_TTL_MS);
    });
    expect(status().textContent).toBe("");
  });

  test("puts a repeated message in a new node, so it is read again", () => {
    const { result } = renderAnnounce();

    act(() => result.current("Pinned."));
    act(() => {
      jest.advanceTimersByTime(ANNOUNCE_DELAY_MS);
    });
    const first = status().firstElementChild;

    act(() => result.current("Pinned."));
    act(() => {
      jest.advanceTimersByTime(ANNOUNCE_DELAY_MS);
    });

    expect(status().firstElementChild).not.toBe(first);
    expect(status().textContent).toBe("Pinned.");
  });

  test("a new message cancels the pending clear", () => {
    const { result } = renderAnnounce();

    act(() => result.current("Pinned."));
    act(() => {
      jest.advanceTimersByTime(ANNOUNCE_DELAY_MS + 1000);
    });
    act(() => result.current("Unpinned."));
    act(() => {
      jest.advanceTimersByTime(ANNOUNCEMENT_TTL_MS - 1000);
    });

    expect(status().textContent).toBe("Unpinned.");
  });

  test("a rapid second message replaces the pending one", () => {
    const { result } = renderAnnounce();

    act(() => result.current("Pinned."));
    act(() => result.current("Unpinned."));
    act(() => {
      jest.advanceTimersByTime(ANNOUNCE_DELAY_MS);
    });

    expect(status().textContent).toBe("Unpinned.");
  });
});
