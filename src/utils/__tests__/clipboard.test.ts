import { copyToClipboard } from "../clipboard";

describe("clipboard utility", () => {
  let originalNavigator: Navigator;

  beforeEach(() => {
    // Store original navigator for restoration
    originalNavigator = navigator;

    // Ensure isSecureContext is true for most tests
    Object.defineProperty(window, "isSecureContext", {
      writable: true,
      value: true,
      configurable: true
    });

    // Clear mocks between tests
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("modern Clipboard API", () => {
    it("returns true when clipboard.writeText succeeds", async () => {
      // Setup modern API with working clipboard
      const mockWriteText = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true
      });

      const result = await copyToClipboard("test text");

      expect(result).toBe(true);
      expect(mockWriteText).toHaveBeenCalledWith("test text");
    });

    it("falls back to legacy method when clipboard.writeText rejects", async () => {
      // Setup modern API that fails
      const mockWriteText = jest
        .fn()
        .mockRejectedValue(new Error("Clipboard API failed"));
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true
      });

      // Mock legacy fallback
      document.execCommand = jest.fn(() => true);

      const result = await copyToClipboard("test text");

      expect(result).toBe(true);
      expect(document.execCommand).toHaveBeenCalledWith("copy");
    });

    it("uses legacy fallback when isSecureContext is false", async () => {
      Object.defineProperty(window, "isSecureContext", {
        writable: true,
        value: false,
        configurable: true
      });

      const mockWriteText = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true
      });

      document.execCommand = jest.fn(() => true);

      const result = await copyToClipboard("test text");

      expect(result).toBe(true);
      expect(mockWriteText).not.toHaveBeenCalled();
      expect(document.execCommand).toHaveBeenCalledWith("copy");
    });

    it("uses legacy fallback when navigator.clipboard is undefined", async () => {
      // Remove clipboard from navigator
      Object.defineProperty(navigator, "clipboard", {
        value: undefined,
        writable: true,
        configurable: true
      });

      document.execCommand = jest.fn(() => true);

      const result = await copyToClipboard("test text");

      expect(result).toBe(true);
      expect(document.execCommand).toHaveBeenCalledWith("copy");
    });
  });

  describe("legacy fallback (execCommand)", () => {
    beforeEach(() => {
      // Remove modern clipboard API to force legacy path
      Object.defineProperty(navigator, "clipboard", {
        value: undefined,
        writable: true,
        configurable: true
      });
    });

    it("returns true when execCommand succeeds", async () => {
      document.execCommand = jest.fn(() => true);

      const result = await copyToClipboard("test text");

      expect(result).toBe(true);
      expect(document.execCommand).toHaveBeenCalledWith("copy");
    });

    it("returns false when execCommand returns false", async () => {
      document.execCommand = jest.fn(() => false);

      const result = await copyToClipboard("test text");

      expect(result).toBe(false);
    });

    it("returns false when execCommand throws error", async () => {
      document.execCommand = jest.fn(() => {
        throw new Error("execCommand not supported");
      });

      const result = await copyToClipboard("test text");

      expect(result).toBe(false);
    });

    it("creates a textarea, focuses it, and selects content", async () => {
      document.execCommand = jest.fn(() => true);

      const createElementSpy = jest.spyOn(document, "createElement");
      const appendSpy = jest.spyOn(document.body, "appendChild");

      await copyToClipboard("test text");

      expect(createElementSpy).toHaveBeenCalledWith("textarea");
      expect(appendSpy).toHaveBeenCalled();

      // Verify that a textarea element was created with the content
      const createdElement = appendSpy.mock.calls[0][0] as HTMLTextAreaElement;
      expect(createdElement.tagName).toBe("TEXTAREA");
      expect(createdElement.value).toBe("test text");
    });

    it("cleans up textarea after successful copy", async () => {
      document.execCommand = jest.fn(() => true);

      const mockTextarea = document.createElement("textarea");
      const removeSpy = jest.spyOn(document.body, "removeChild");

      jest.spyOn(document, "createElement").mockReturnValue(mockTextarea);

      await copyToClipboard("test text");

      expect(removeSpy).toHaveBeenCalledWith(mockTextarea);
    });

    it("cleans up textarea even when execCommand fails", async () => {
      document.execCommand = jest.fn(() => {
        throw new Error("execCommand failed");
      });

      const mockTextarea = document.createElement("textarea");
      const removeSpy = jest.spyOn(document.body, "removeChild");

      jest.spyOn(document, "createElement").mockReturnValue(mockTextarea);

      await copyToClipboard("test text");

      expect(removeSpy).toHaveBeenCalledWith(mockTextarea);
    });

    it("styles textarea to be invisible and off-screen", async () => {
      document.execCommand = jest.fn(() => true);

      const appendSpy = jest.spyOn(document.body, "appendChild");

      await copyToClipboard("test text");

      const textarea = appendSpy.mock.calls[0][0] as HTMLTextAreaElement;

      expect(textarea.style.position).toBe("fixed");
      // Browsers may convert "0" to "0px", so check for either
      expect(["0", "0px"]).toContain(textarea.style.top);
      expect(["0", "0px"]).toContain(textarea.style.left);
      expect(textarea.style.width).toBe("2em");
      expect(textarea.style.height).toBe("2em");
      expect(["0", "0px"]).toContain(textarea.style.padding);
      // Border, outline, and boxShadow might be "" or "none" depending on browser
      expect(["none", ""]).toContain(textarea.style.border);
      expect(["none", ""]).toContain(textarea.style.outline);
      expect(["none", ""]).toContain(textarea.style.boxShadow);
      expect(textarea.style.background).toBe("transparent");
    });
  });
});
