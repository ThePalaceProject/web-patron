# circulation-patron-web
A Circulation Manager web interface for library patrons.

## Running the application
This application requires either a [library registry](https://github.com/NYPL-Simplified/library_registry) or a [circulation manager](https://github.com/NYPL-Simplified/circulation) to run. By default, it expects a library registry to be running at http://localhost:7000.

Once you have a library registry or circulation manager, run `npm install` in this repository to set up dependencies.

Then run either `npm run dev` or `npm run prod` to start the application. `npm run dev` will watch the code for changes and rebuild the front-end code, but won't reload the server code.

To configure a library registry url, set the environment variable `REGISTRY_BASE`. To use a circulation manager, set `SIMPLIFIED_CATALOG_BASE` and `SIMPLIFIED_CATALOG_NAME`.

Set `SHORTEN_URLS=true` to make the app remove common parts of the circulation manager URLs from the web app's URLs.

Set `REGISTRY_EXPIRATION_SECONDS` to control how often the app will check for changes to registry entries and circ manager authentication documents.



## License

```
Copyright © 2015 The New York Public Library, Astor, Lenox, and Tilden Foundations

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
