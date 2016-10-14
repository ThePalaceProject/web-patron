type FilePath = string;
type URLString = string;

export interface HeaderLink {
  title: string;
  url: URLString;
}

interface Config {
  theme?: FilePath;
  homeUrl?: URLString;
  catalogBase?: URLString;
  catalogName?: string;
  appName?: string;
  authPlugins?: {
    [key: string]: FilePath;
  };
  headerLinks?: HeaderLink[];
  logoLink?: URLString;
}

export default Config;