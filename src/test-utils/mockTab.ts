export function makeMockTab() {
  return {
    opener: undefined as null | undefined,
    close: jest.fn(),
    document: {
      title: "",
      head: { appendChild: jest.fn() },
      body: { appendChild: jest.fn() },
      createElement: jest.fn().mockReturnValue({
        textContent: "",
        style: { cssText: "" },
        name: "",
        content: ""
      })
    },
    location: { href: "" }
  };
}
