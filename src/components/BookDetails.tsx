import * as React from "react";
import DefaultBookDetails from "opds-web-client/lib/components/BookDetails";

export default class BookDetails extends DefaultBookDetails {
  fieldNames() {
    return ["Published", "Publisher", "Audience", "Categories"];
  }

  fields() {
    let fields = super.fields();
    fields["Categories"] = this.categories();
    fields["Audience"] = this.audience();
    return fields;
  }

  audience() {
    if (!this.props.book) {
      return null;
    }

    let categories = this.props.book.raw.category;

    if (!categories) {
      return null;
    }

    let audience = categories.find(category =>
      category["$"]["scheme"]["value"] === "http://schema.org/audience"
    );

    if (!audience) {
      return null;
    }

    let audienceStr = audience["$"]["label"]["value"];

    if (["Adult", "Adults Only"].indexOf(audienceStr) !== -1) {
      return audienceStr;
    }

    let targetAge = categories.find(category =>
      category["$"]["scheme"]["value"] === "http://schema.org/typicalAgeRange"
    );

    if (targetAge) {
      let targetAgeStr = targetAge["$"]["label"]["value"];
      audienceStr += " (age " + targetAgeStr + ")";
    }

    return audienceStr;
  }

  categories() {
    if (!this.props.book) {
      return null;
    }

    let audienceSchemas = [
      "http://schema.org/audience",
      "http://schema.org/typicalAgeRange"
    ];
    let fictionScheme = "http://librarysimplified.org/terms/fiction/";
    let rawCategories = this.props.book.raw.category;

    let categories = rawCategories.filter(category =>
      audienceSchemas.concat([fictionScheme])
        .indexOf(category["$"]["scheme"]["value"]) === -1
    ).map(category => category["$"]["label"]["value"]);

    if (!categories.length) {
      categories = rawCategories.filter(category =>
        category["$"]["scheme"]["value"] === fictionScheme
      ).map(category => category["$"]["label"]["value"]);
    }

    return categories.length > 0 ? categories.join(", ") : null;
  }
}