import { BookData } from "opds-web-client/lib/interfaces";

export const bookFixture: BookData = {
  id: "urn:librarysimplified.org/terms/id/3M%20ID/crrmnr9",
  url: "http://circulation.librarysimplified.org/works/3M/crrmnr9",
  title: "The Mayan Secrets",
  authors: ["Clive Cussler", "Thomas Perry"],
  contributors: ["contributor 1"],
  summary:
    "&lt;b&gt;Sam and Remi Fargo race for treasure&#8212;and survival&#8212;in this lightning-paced new adventure from #1&lt;i&gt; New York Times&lt;/i&gt; bestselling author Clive Cussler.&lt;/b&gt;&lt;br /&gt;&lt;br /&gt;Husband-and-wife team Sam and Remi Fargo are in Mexico when they come upon a remarkable discovery&#8212;the mummified remainsof a man clutching an ancient sealed pot. Within the pot is a Mayan book larger than any known before.&lt;br /&gt;&lt;br /&gt;The book contains astonishing information about the Mayans, their cities, and about mankind itself. The secrets are so powerful that some people would do anything to possess them&#8212;as the Fargos are about to find out. Many men and women are going to die for that book.",
  imageUrl: "https://dlotdqc6pnwqb.cloudfront.net/3M/crrmnr9/cover.jpg",
  borrowUrl: "borrow url",
  openAccessLinks: [{ url: "secrets.epub", type: "application/epub+zip" }],
  publisher: "Penguin Publishing Group",
  published: "February 29, 2016",
  categories: ["Children", "10-12", "Fiction", "Adventure", "Fantasy"],
  raw: {
    category: [
      {
        $: {
          scheme: { value: "http://schema.org/audience" },
          label: { value: "Children" }
        }
      },
      {
        $: {
          scheme: { value: "http://schema.org/typicalAgeRange" },
          label: { value: "10-12" }
        }
      },
      {
        $: {
          scheme: { value: "http://librarysimplified.org/terms/fiction/" },
          label: { value: "Fiction" }
        }
      },
      {
        $: {
          scheme: {
            value: "http://librarysimplified.org/terms/genres/Simplified/"
          },
          label: { value: "Adventure" }
        }
      },
      {
        $: {
          scheme: {
            value: "http://librarysimplified.org/terms/genres/Simplified/"
          },
          label: { value: "Fantasy" }
        }
      }
    ],
    "bibframe:distribution": [
      {
        $: {
          "bibframe:ProviderName": {
            value: "Overdrive"
          }
        }
      }
    ],
    link: [
      {
        $: {
          rel: { value: "issues" },
          href: { value: "http://example.com/report" }
        }
      },
      {
        $: {
          rel: { value: "http://librarysimplified.org/terms/rel/revoke" },
          href: { value: "http://example.com/revoke" }
        }
      }
    ]
  }
};
