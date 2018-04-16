# PI Vision Extension for 3D Boiler Visualization

The motivation for our PI Vision Extension extends from the request of a Power Generation Company. This company has many fossil fuel-fired boilers that sometimes develop hotspots from combustion irregularities. Having a 3D visualization of the boiler wall thermocouple readings would enable easier identification of hot spots in the boiler walls. The boilers have thermocouple readings on three walls, the back wall, and two sides.

Since our visualization requires a more complex arrangement of data, we must bind it to a correctly formatted AF Element. This element contains the wall thermocouple readings in an array of PI Points, one array for each wall. Sub Attributes of the readings describe the array shape. For our example, we configured nine readings for each wall arranged in a three by three matrix.

The resulting PI Vision Extension shows live heatmaps of the thermocouple readings on the three boiler sides. We rotate the boiler by dragging with the left mouse button, translate the display by dragging with the right mouse button, and zoom in and out using the mouse wheel.







## Getting Started

The following directions come from the PI Vision 4 Example Extension

1. Install prerequisites
    
    The following software is required:
    * [Node.js][node] -- install the current version
    * Source code for `pi-vision-extensions` 
    * Editor of your choice -- OSIsoft recommends [Visual Studio Code][vscode]
    * PI Vision 4

1. Install dependencies. 

   The project dependencies must be in sync with PI Vision dependencies for symbols to load. 
   
   Install all dependencies specified in the `package.json` file by typing: 
    ```bash
    npm install
    ```
    >Note: This can take several minutes.
    This command creates a new folder in the project named `node_modules`.

1. Build the project as a single-file JavaScript library.
    Type the following command: 
    ```bash
    npm run build
    ```
    This command creates two new folders in your project:

    * `dist` - contains both a compressed (minified) as well an uncompressed extension JavaScript library
        * ***library-name***.js
        * ***library-name***.js.map
        * ***library-name***.min.js
        * ***library-name***.min.js.map
    * `out-tsc` - contains temporary files used to compile the library


## Load extension library in development mode
With PI Vision, you can live-debug and fine-tune extension-library code in development mode before deploying the library. This section describes the steps to run a local Node.js server to debug custom symbols:

1. Create and install an SSL certificate for the Node.js server. 

    OSIsoft recommends using a trusted CA signed certificate for the development server. If that is not an option, you can use a self-signed certificate. 

    * Trusted CA signed SSL certificate
        * Open `server-conf.json` and find the property called `ssl`. This is the object passed into the `Express` framework to configure the private key location and the certificate location for the HTTPS server. 
        * Change the `key` property to the path of your private key and the `cert` property to your certificate path.
        * Optionally, change the host name and port number before running the Node.js server. By default the host name is set to `localhost` and the port number is `3001`. You can change these parameters by modifying the `hostname` and `port `properties in the`server-conf.json` file.
    
    * Self-signed SSL certificate

        >Note: The `certgen` command in this step requires the `OpenSSL` utility installed on your machine. In Windows, you can use `Git Bash` to run the command because the command-line shell has `OpenSSL` preinstalled. You can install `Git Bash` by downloading `git` from the [Git Download page](https://git-scm.com/downloads). Otherwise, you need to download the `OpenSSL` executable manually and add the path to environment variable. `OpenSSL` is not the only option. You can also generate self-signed an SSL certificate using other approaches, such as the `KeyChain` tool on a Mac. 

        * From a command line, go to the project root directory, and enter `npm run certgen` to generate a certificate for localhost.

          This command generates a few files in the `./ssl` folder:
          * `localhost.crt` is the certificate 
          * `localhost.key` is the private key
        
        * As an administrator, enter `npm run certinstall` to install the certificate into the Trusted Root Certification Authorities certificate store. 
        
          In Windows, you can use `certlm.msc` to verify a `localhost` certificate is installed. 

        >Note: When you complete the debugging process and you are ready to deploy the extension library, remove this self-signed SSL certificate from the Trusted Root Certification Authorities certificate store. You can use `certlm.msc` or enter the command `npm run certuninstall`. Note that running the `certuninstall` command will also remove any other certificates named `localhost` from Root Certification Authorities certificate store. 

1. Configure cross-origin resource sharing (CORS) to support cross-site requests from the development server to the debugging server.
    * Open the 'server-config.json' file.
    * Under 'cors', set 'origin' to the PI Vision server that you are using for debugging.
1. Run the Node.js development server.

    The server serves the extension library content that you developed to the PI Vision site. 
      
    * In the console, enter `npm run start` to start the Node.js server. By default the server is running at port `3001`.

    * In your web browser, navigate to  `https://localhost:3001/manifest` to verify that your development server is running properly. 
    
        You should receive a `JSON` object with the `path` and `name` of your extension library. 

     >Note: This is for live debugging only and is not a deployment process for custom symbols. 


1. Enable development mode in PI Vision.

    * Launch the PI Vision website from your browser. 
    * On the home page, click the `Menu` icon in the upperleft, and then click `Options`. 
    * Set  `Developer mode` to `On`. 
        This is a temporary setting for current browser tab; you will lose the setting when you close the browser tab or clear the browser cache.
    * In the `Extension manifest URL` field, enter the URL for your extension library server:  `https://localhost:3001/manifest` 
    * Click `OK`, and then at the prompt to refresh your browser click `OK`.

        This instance of PI Vision loads your extension library code. You can create a new display with your custom symbol(s) and debug your code. 

1. Make code changes.
    
    Any code changes that you make in your extension library under `./src` will automatically trigger a rebuild of the extension library and a restart of the Node.js server. Refresh the page on your browser to have PI Vision run with your latest code.  

### Deployment to a PI Vision installation (PI Web API)

Follow these steps to deploy to a PI Vision site that is hosted on premises. Cloud deployments currently can only be used for developing widgets by enabling developer mode. 

>Note: This temporary deployment process is subject to change.

1. Build using the command:

    ```bash
    npm run build
    ```

1. Copy the contents of the dist folder (choose whether you want to use the minified versions or not) to its own folder underneath the assets/extensions folder of the deployed PI Vision site.

1. Update the manifest.json file at the root of the assets/extensions folder to include your new extensions. The format is: 

    ```typescript
    {
      "extensions": [
        { "name": "ExampleSymbols", 
          "path": "/assets/extensions/example-symbol-library/example-symbol-library.js" }]
    }
    ```

## Development
This section describes the structure of the source code. For more details on creating an Angular component as a PI Vision symbol, see [PI Vision Symbol Creation Guide](./symbol-creation-guide.md).


### Module
The module file [`module.ts`](src/module.ts) is the single entry point of the library. This file brings all parts of the extension library into one single unit ready for use in PI Vision. You can build one or more custom symbols and put them all in one module. 

### Components
Components are UI building blocks for your custom symbol. A component is a self-contained unit that includes the view and logic for a symbol. In this seed project, we created a component called `ExampleComponent`, which includes the code `example.component.ts`, Angular HTML template `example.component.html`, and css styles `example.component.css`. The unit test file `example.component.spec.ts` is not part of `ExampleComponent`, but as a best practice, we put the unit test file next to the code.

### Dependencies
The dependencies and devDependencies sections in [package.json](./package.json) show lists of dependencies required to run and develop the extension library. All dependency versions **MUST** be in sync with the dependency versions in PI Vision. The `npm install` command installs the packages and versions specified in the `package.json` file into the `node_modules` directory. 

#### Using external libraries
You can use external libraries in addition to the ones listed in [package.json](./package.json). For example, you might want to send PI System data into a charting library and build your own chart symbol. To use an external library:
1. Install the external library with the npm command:
    ```bash
    npm install <your-package-name> --save
    ```
    The command downloads the package into the `node_modules` directory and adds a new entry to the `package.json` file.

1. Import the library with one of the following `import` forms: 
    ```typescript
    import SomeChartLibrary from 'someChartLibrary';
    
    import { Observable } from 'rxjs/Observable';
    
    import 'rxjs/add/operator/switchMap';
    ```
1. Use the external library in your symbol component.

#### Dependency injection
To inject dependencies,  define them as input parameters in the component constructor. To make dependency injection work in your custom symbol, follow these guidelines:
* Install the package that contains the dependency first with the npm command:
    ```bash
    npm install <your-package-name> --save
    ```

* If you would like to use your own instance of the provider, import the module for that dependency when describing the metadata of the module(`@NgModule()`) in [`module.ts`](src/module.ts).

* Add the provider as an input to your constructor. To use the same provider instance used in PI Vision, insert `@Inject()` decorator before your input parameter with one of the injection tokens provided in [`tokens.ts`](src/framework/tokens.ts). For example, you may want to use `PiWebApiService` provider in `@osisoft/piwebapi` and use the same provider instance PI Vision so the `piWebApiService` knows the base URL to access the PI Web API server. In this case, you can pass `PIWEBAPI_TOKEN` into the `@Inject()` decorator. You don't need to import `PiWebApiModule` into your extension library because the Angular compiler only looks up the provider by injection key at runtime; it does not complain at compile time.

### Angular namespaces

Angular components in an extension library support importing *only* from the following Angular modules:

 - @angular/core
 - @angular/common
 - @angular/forms

## Unit testing

This project comes preconfigured with unit tests. These are written in [Jasmine][jasmine], which OSIsoft runs with the [Karma][karma] test runner. OSIsoft provides a Karma configuration file to run them.

* The configuration is found at `karma.conf.js`.
* The unit tests are found next to the code they are testing and have an `.spec.ts` suffix (e.g.,
  `example.component.spec.ts`).

The easiest way to run the unit tests is to use the supplied npm script:
```bash
npm test
```

This script will start the Karma test runner to execute the unit tests. Moreover, Karma will start watching the source and test files for changes and then re-run the tests whenever any of them changes.

This is the recommended strategy; if your unit tests are being run every time you save a file then you receive instant feedback on any changes that break the expected code functionality.

You can also ask Karma to do a single run of the tests and then exit. This is useful if you want to check that a particular version of the code is operating as expected. The project contains a predefined script to do this:
```bash
npm run test:once
```

## Linting
[TSLint][tslint] is an extensible static analysis tool that checks TypeScript code for readability, maintainability, and functionality errors. You can run TSLint  with the following command:
```bash
npm run lint
```
Popular editors can integrate with TSLint to provide analysis as you type. OSIsoft recommends the [TSLint by egamma](https://marketplace.visualstudio.com/items?itemName=eg2.tslint) extension for [Visual Studio Code][vscode].


## Licensing
Copyright 2017-2018 OSIsoft, LLC.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

Please see the file named [LICENSE](./LICENSE).


[angular]: https://angular.io/
[jasmine]: https://jasmine.github.io/
[karma]: https://karma-runner.github.io/
[node]: https://nodejs.org/
[vscode]: https://code.visualstudio.com/
[tslint]: https://github.com/palantir/tslint
[piworld]: https://piworld.osisoft.com/US2018
