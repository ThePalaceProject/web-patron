# circulation-patron-web
A Circulation Manager web interface for library patrons.

## Running the application
There are three ways to run this application:
* with a [library registry](https://github.com/NYPL-Simplified/library_registry)
* with a single library on a [circulation manager](https://github.com/NYPL-Simplified/circulation)
* with a configuration file for multiple circulation manager URLs

By default, it expects a library registry to be running at http://localhost:7000.

Any circulation manager you'll be using with the app also needs a configuration setting to turn on CORS headers. In the admin interface, go to the Sitewide Settings section under System Configuration and add a setting for "URL of the web catalog for patrons". For development, you can set this to "*", but for production it should be the real URL where you will run the catalog. If you are using a library registry, this configuration will automatically be created when you register libraries with the registry, but you need to configure the URL in the registry by running `bin/configuration/configure_site_setting --setting="web_client_url=http://library.org/{uuid}"` (replace the URL with your web client URL). Otherwise, you'll need to create a sitewide setting for it in the circulation manager.

Once you have a library registry or circulation manager, run `npm install` in this repository to set up dependencies.

Then you can run either `npm run dev` or `npm run prod` to start the application. `npm run dev` will watch the code for changes and rebuild the front-end code, but won't reload the server code.

Set one of the following environment variables when running the application:
* To configure a library registry url, set the environment variable `REGISTRY_BASE`.
   * This is the default setting which will point to the Library Registry located at `localhost:7000`. The libraries can be viewed in the app (running locally) by going to `localhost:3000/{uuid}` where `uuid` is the `uuid` of the library.
* To use a circulation manager, set `SIMPLIFIED_CATALOG_BASE`.
   * Point this environment variable to the url of the Circulation Manager, for example `SIMPLIFIED_CATALOG_BASE=http://localhost:6500 npm run prod`. This will load the main library in the Circulation Manager in the app (running locally) by going to `localhost:3000`.
* To use a configuration file, set `CONFIG_FILE` to point to a local file or a remote URL. Each line in the file should be a library's desired URL path in the web catalog and the library's circ manager URL, separated by a pipe character. For example:
   * ```
      library1|http://circulationmanager.org/L1
      library2|http://circulationmanager.org/L2
      ```
   * An example command: `CONFIG_FILE=config_file.txt npm run prod`. From the example above, when running the command you can visit the app (running locally) at `localhost:3000/library1` and `localhost:3000/library2` for each library.

Set `SHORTEN_URLS=false` to stop the app from removing common parts of the circulation manager URLs from the web app's URLs.

Set `CACHE_EXPIRATION_SECONDS` to control how often the app will check for changes to registry entries and circ manager authentication documents.



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
