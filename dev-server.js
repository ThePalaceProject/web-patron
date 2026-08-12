const { createServer } = require("https");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");

const dev = process.env.NODE_ENV !== "production";
// This project has a custom webpack config, so opt out of Turbopack (the
// Next.js 16 default bundler), matching the --webpack flag in package.json.
const app = next({ dev, webpack: true });
const handle = app.getRequestHandler();
const port = 3000;

const httpsOptions = {
  key: fs.readFileSync("./localhost.key"),
  cert: fs.readFileSync("./localhost.crt")
};

/**
 * To determine the user's IP address, we query the node.js networkInterfaces object and
 * ignore any non-IPv4 and internal (e.g. 127.0.0.1) addresses
 */
var ipAddr = Object.values(require("os").networkInterfaces()).reduce(
  (r, list) =>
    r.concat(
      list.reduce(
        (rr, i) =>
          rr.concat((i.family === "IPv4" && !i.internal && i.address) || []),
        []
      )
    ),
  []
);

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, "0.0.0.0", err => {
    if (err) throw err;
    console.log(
      `> Ready on https://localhost:${port} and https://${ipAddr}:${port}`
    );
  });
});
