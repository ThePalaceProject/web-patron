import * as React from "react";
import { render, screen } from "test-utils";
import PalaceWebCatalogLogo from "components/PalaceWebCatalogLogo";

describe("PalaceWebCatalogLogo", () => {
  it("is sized to the logo image's 1027x323 aspect ratio", () => {
    render(<PalaceWebCatalogLogo />);
    const logo = screen.getByRole("img", { name: "Palace Web Catalog" });

    expect(logo).toHaveAttribute("width", "223");
    expect(logo).toHaveAttribute("height", "70");
  });
});
