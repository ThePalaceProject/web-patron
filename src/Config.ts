interface Config {
  theme?: string;
  homeUrl?: string;
  catalogBase?: string;
  catalogName?: string;
  distDir?: string;
  authPlugins?: {
    [key: string]: string;
  };
}

export default Config;