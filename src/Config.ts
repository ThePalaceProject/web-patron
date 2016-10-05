type FilePath = string;
type URLString = string;

interface Config {
  theme?: FilePath;
  homeUrl?: URLString;
  catalogBase?: URLString;
  catalogName?: string;
  distDir?: FilePath;
  authPlugins?: {
    [key: string]: FilePath;
  };
}

export default Config;