import { ServerResponse } from "http";

export default (res: ServerResponse) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  if (res) {
    res.writeHead(301, {
      Location:
        /* TODO: update this hard-coded re-direct to Alice e-book in Research Now*/
        "https://researchnow-reader.nypl.org/readerNYPL/?url=https%3A%2F%2Fresearchnow-reader.nypl.org%2Fpub%2FaHR0cHM6Ly9jb250ZW50c2VydmVyLmFkb2JlLmNvbS9zdG9yZS9ib29rcy9hbGljZUR5bmFtaWMuZXB1Yg%3D%3D%2Fmanifest.json"
    });
    res.end();
  }
};
