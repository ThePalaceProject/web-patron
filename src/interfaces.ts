import { State } from "opds-web-client/lib/state";

export interface PathFor {
  (collectionUrl: string, bookUrl: string): string
}

export interface ComplaintData {
  type: string
  detail?: string
}

export interface Link {
  href: string
  rel?: string
  title?: string
  type?: string
}

export interface LibraryData {
  id: string
  onlyLibrary?: boolean
  catalogUrl: string
  catalogName: string
  logoUrl?: string
  colors?: {
    background?: string
    foreground?: string
  }
  headerLinks?: Link[]
  cssLinks?: Link[]
}

export interface PreloadedData {
  library: LibraryData
  shortenUrls: boolean
  initialState: State
}
declare global {
  interface Window {
    // Our custom global holding data loaded by the server
    __PRELOADED_DATA__: PreloadedData
  }
}

export interface WebpackAssets {
  CirculationPatronWeb: string[]
}