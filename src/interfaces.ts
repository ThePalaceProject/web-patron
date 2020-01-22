import { State } from "opds-web-client/lib/state";
import { CollectionState } from "opds-web-client/lib/reducers/collection";
import { CollectionData, BookData } from "opds-web-client/lib/interfaces";

export interface PathFor {
  (collectionUrl: string, bookUrl: string): string;
}

export interface ComplaintData {
  type: string;
  detail?: string;
}

export interface Link {
  href: string;
  rel?: string;
  title?: string;
  type?: string;
}

export interface LibraryData {
  id?: string;
  onlyLibrary?: boolean;
  catalogUrl: string;
  catalogName: string;
  logoUrl?: string;
  colors?: {
    background?: string;
    foreground?: string;
  };
  headerLinks?: Link[];
  cssLinks?: Link[];
}

export interface PreloadedData {
  library: LibraryData;
  shortenUrls: boolean;
  initialState: State;
}
declare global {
  interface Window {
    // Our custom global holding data loaded by the server
    __PRELOADED_DATA__: PreloadedData;
  }
}

export interface WebpackAssets {
  CirculationPatronWeb: string[];
}

// our CPW useReducer states
export type RecommendationsState = CollectionState;
export { ComplaintsState } from "./reducers/complaints";

export { Theme, ButtonVariants, TextVariants } from "./theme";
// helper for theme variant prop types
export type VariantProp<VType> = Exclude<keyof VType, keyof {}>;

export type SetCollectionAndBook = (
  collectionUrl: string,
  bookUrl: string
) => Promise<{
  collectionData: CollectionData;
  bookData: BookData;
}>;
