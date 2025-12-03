import * as React from "react";
import { render, screen } from "test-utils";
import MultiLibraryHome from "../MultiLibraryHome";
import * as envModule from "utils/env";

// Mock the entire module
jest.mock("utils/env");

describe("MultiLibraryHome", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("displays libraries sorted by title in ascending order", () => {
    (envModule.APP_CONFIG as any) = {
      instanceName: "Test Instance",
      libraries: {
        zebra: {
          title: "Zebra Library",
          authDocUrl: "https://example.com/zebra/auth"
        },
        alpha: {
          title: "Alpha Library",
          authDocUrl: "https://example.com/alpha/auth"
        },
        middle: {
          title: "Middle Library",
          authDocUrl: "https://example.com/middle/auth"
        }
      },
      mediaSupport: {},
      bugsnagApiKey: null,
      gtmId: null,
      companionApp: "simplye",
      showMedium: true,
      openebooks: null,
      registries: []
    };

    render(<MultiLibraryHome />);

    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveTextContent("Alpha Library");
    expect(links[1]).toHaveTextContent("Middle Library");
    expect(links[2]).toHaveTextContent("Zebra Library");
  });

  it("displays libraries sorted by slug when no title is provided", () => {
    (envModule.APP_CONFIG as any) = {
      instanceName: "Test Instance",
      libraries: {
        zebra: {
          authDocUrl: "https://example.com/zebra/auth"
        },
        alpha: {
          authDocUrl: "https://example.com/alpha/auth"
        },
        middle: {
          title: "middle",
          authDocUrl: "https://example.com/middle/auth"
        }
      },
      mediaSupport: {},
      bugsnagApiKey: null,
      gtmId: null,
      companionApp: "simplye",
      showMedium: true,
      openebooks: null,
      registries: []
    };

    render(<MultiLibraryHome />);

    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveTextContent("alpha");
    expect(links[1]).toHaveTextContent("middle");
    expect(links[2]).toHaveTextContent("zebra");
  });

  it("displays libraries sorted by effective title (mix of custom titles and slugs)", () => {
    (envModule.APP_CONFIG as any) = {
      instanceName: "Test Instance",
      libraries: {
        "003": {
          authDocUrl: "https://example.com/003/auth"
        },
        beta: {
          title: "Charlie Library",
          authDocUrl: "https://example.com/beta/auth"
        },
        alpha: {
          title: "Bravo Library",
          authDocUrl: "https://example.com/alpha/auth"
        },
        "001": {
          authDocUrl: "https://example.com/001/auth"
        }
      },
      mediaSupport: {},
      bugsnagApiKey: null,
      gtmId: null,
      companionApp: "simplye",
      showMedium: true,
      openebooks: null,
      registries: []
    };

    render(<MultiLibraryHome />);

    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveTextContent("001");
    expect(links[1]).toHaveTextContent("003");
    expect(links[2]).toHaveTextContent("Bravo Library");
    expect(links[3]).toHaveTextContent("Charlie Library");
  });

  it("handles quoted numeric slugs with leading zeros correctly", () => {
    (envModule.APP_CONFIG as any) = {
      instanceName: "Test Instance",
      libraries: {
        "020": {
          title: "020",
          authDocUrl: "https://example.com/020/auth"
        },
        "003": {
          title: "003",
          authDocUrl: "https://example.com/003/auth"
        },
        "001": {
          title: "001",
          authDocUrl: "https://example.com/001/auth"
        },
        "100": {
          title: "100",
          authDocUrl: "https://example.com/100/auth"
        }
      },
      mediaSupport: {},
      bugsnagApiKey: null,
      gtmId: null,
      companionApp: "simplye",
      showMedium: true,
      openebooks: null,
      registries: []
    };

    render(<MultiLibraryHome />);

    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveTextContent("001");
    expect(links[1]).toHaveTextContent("003");
    expect(links[2]).toHaveTextContent("020");
    expect(links[3]).toHaveTextContent("100");
  });

  it("returns null when there are no libraries", () => {
    (envModule.APP_CONFIG as any) = {
      instanceName: "Test Instance",
      libraries: {},
      mediaSupport: {},
      bugsnagApiKey: null,
      gtmId: null,
      companionApp: "simplye",
      showMedium: true,
      openebooks: null,
      registries: []
    };

    const { container } = render(<MultiLibraryHome />);
    expect(container.firstChild).toBeNull();
  });

  it("displays instance name in heading", () => {
    (envModule.APP_CONFIG as any) = {
      instanceName: "My Custom Instance",
      libraries: {
        test: {
          title: "Test Library",
          authDocUrl: "https://example.com/test/auth"
        }
      },
      mediaSupport: {},
      bugsnagApiKey: null,
      gtmId: null,
      companionApp: "simplye",
      showMedium: true,
      openebooks: null,
      registries: []
    };

    render(<MultiLibraryHome />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "My Custom Instance Home"
    );
  });
});
