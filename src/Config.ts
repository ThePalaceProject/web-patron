type FilePath = string;
type URL = string;

interface Config {
  theme?: FilePath;
  homeUrl?: URL;
  catalogBase?: URL;
  catalogName?: string;
  distDir?: FilePath;
  authPlugins?: {
    [key: string]: FilePath;
  };
}

export default Config;