# PI Vision Symbol Porting Guide

This document walks you through the process of porting an existing custom symbol from PI Vision 3 to PI Vision 4. You should have working knowledge of creating a PI Vision 3 symbol. It is strongly recommended that you follow the steps in [README](./README.md) to set up your environment before reading this document.

This document discusses converting a PI Vision 3 *Simple Value Symbol* from OSIsoft's GitHub [repository][SimpleValueSymbol] into a PI Vision 4 custom symbol. When you are done with this guide, the symbol will look like the symbol in `simple-value` repository. 

## Angular vs AngularJS
PI Vision 4 custom symbols are built on the Angular framework, while PI Vision 3 symbol is based on AngularJS. Although their names sound similar, there are some major differences when coding under the two platforms, such as:
* TypeScript is used for coding in Angular, while AngularJS uses JavaScript
* Components are used as the building blocks for Angular applications
* Angular uses module loader rather than loading files to HTML with `<script>` tags
* Syntax differences

## Getting started
You need to create a library project to port a PI Vision 3 custom symbol to PI Vision 4. As described in the [README](./README.md), the easiest way is to copy the extensions project folder to a new location and rename the folder. Please follow the [README](./README.md) document to set up the project, including verification and installation of dependencies.

## Symbol registration
In PI Vision 3, you register the `simple-value` symbol by defining an object with symbol metadata:

```javascript
var definition = {
  typeName: 'simplevalue',
  datasourceBehavior: CS.Extensibility.Enums.DatasourceBehaviors.Single,
  visObjectType: symbolVis,
  getDefaultConfig: function() {
    return {
        DataShape: 'Value',
        Height: 150,
        Width: 150,
        BackgroundColor: 'rgb(255,0,0)',
        TextColor: 'rgb(0,255,0)',
        ShowLabel: true,
        ShowTime: false
      };
  },
  configTitle: 'Format Symbol',
  StateVariables: [ 'MultistateColor' ]
};

CS.symbolCatalog.register(definition);
```

To port all the metadata to PI Vision 4, you need to add this information into an element of the `symbols` property in `ExtensionLibrary` class in the `module.ts` file.

```typescript
export class ExtensionLibrary extends NgExtensionLibrary {
  module = LibModule;
  moduleFactory = LibModuleNgFactory;
  symbols: SymbolType[] = [
    {
      name: 'simple-value',
      displayName: 'Simple Value Symbol',
      dataParams: { shape: 'single' },
      thumbnail: '^/assets/images/example.svg',
      compCtor: SimpleValueComponent,
      inputs: [
        SymbolInputType.Data
      ],
      generalConfig: [
        {
          name: 'Example Options',
          isExpanded: true,
          configProps: [
            { propName: 'bkColor', displayName: 'Background color', configType: ConfigPropType.Color, defaultVal: 'orange',
              isMultiState: true },
            { propName: 'txtColor', displayName: 'Text Color', configType: ConfigPropType.Color, defaultVal: 'black',
              isMultiState: true },
            { propName: 'showLabel', displayName: 'Show Label', configType: ConfigPropType.Flag, defaultVal: true },
            { propName: 'showTime', displayName: 'Show Time', configType: ConfigPropType.Flag, defaultVal: true }
          ]
      ],
      layoutWidth: 150,
      layoutHeight: 150
    }
  ];
}
```

The following sections examine the above sample code, and compare the differences between two platforms when registering `simple-value` The symbol:

* [Class vs object](#class-vs-object)
* [Data source](#data-source)
* [System inputs](#system-inputs)
* [Configuration properties](#configuration-properties)
* [Multistate](#multistate)

### Class vs object
Instead of creating a `definition` JavaScript object as symbol metadata, PI Vision 4 leverages TypeScript to strongly type metadata for a custom symbol. The metadata for the  `simple-value` symbol is define in a `SymbolType` object.

### Data source
In PI Vision 3, the `simple-value` symbol uses the `datasourceBehavior` and `DataShape` properties to describe the data source that the symbol needs. In PI Vision 4, the same information is specified with the `dataParams` property; the `simple-value` symbol uses the `single` shape for the data source. 

### System inputs
PI Vision 3 does not require you to specify the system inputs, but PI Vision 4 offers a list of system-level inputs that you can choose from. The `simple-value` symbol specifies ` SymbolInputType.Data` in the `inputs` array because the symbol needs real-time data from the PI System. 

### Configuration properties
In PI Vision 3, the `definition` object defines the `getDefaultConfig` callback to register the configuration properties. A separate configuration template file `sym-simplevalue-config.html` builds the UI and binds the configuration variables to the UI. 

```typescript
getDefaultConfig: function() {
  return {
      DataShape: 'Value',
      Height: 150,
      Width: 150,
      BackgroundColor: 'rgb(255,0,0)',
      TextColor: 'rgb(0,255,0)',
      ShowLabel: true,
      ShowTime: false
  };
}
```

In PI Vision 4, you specify the configuration options in the `generalConfig` array, and the configuration UI is automatically generated. The following example creates the `showLabel` configuration option by setting the `propName`, `displayName`, `configType`, and `defaultVal` properties:
* `propName` -- the variable name that matches the property name in the returned object in the `getDefaultConfig` callback
* `displayName` -- the human friendly name that appears in the configuration UI; you need not manually create the config UI template
* `configType`  -- set to `ConfigPropType.Flag` indicates that the field is a boolean flag and the configuration UI will generate a switch to allow users to turn it on or off
* `defaultValue` -- sets the default value for a configuration property, which is `true` in this case

```typescript
generalConfig: [
  {
    name: 'Example Options',
    isExpanded: true,
    configProps: [
      ...
      { propName: 'showLabel', displayName: 'Show Label', configType: ConfigPropType.Flag, defaultVal: true },
      ...
    ]
  }
]
```

### Multistate
To configure multistate in PI Vision 3 custom symbols, you added an array of strings to the `StateVariables` property in the `definition` object.  

```javascript
var definition = {
  ...
  StateVariables: [ 'MultistateColor' ]
};
```

In PI Vision 4, you set the `isMultiState` property to true for any configuration properties that need multistate functionality. The following example adds the multistate functionality to the `txtColor` configuration property. When the symbol loads, you can define multiple states for the text color of the symbol in the configuration pane. 

```typescript
export class ExtensionLibrary extends NgLibrary {
  ...
  symbols: SymbolType[] = [
    {
      ...
      generalConfig: [
        {
          name: 'Example Options',
          isExpanded: true,
          configProps: [
            ...
            { propName: 'txtColor', displayName: 'Text Color', configType: ConfigPropType.Color, defaultVal: 'black', isMultiState: true }
            ...
          ]
        }
      ],
      ...
    }
  ];
}
```

## Symbol implementation
In addition to defining the metadata for the symbol, you must implement the symbol. This section discusses the differences when implementing symbol logic in the two platforms:

* [Angular component vs IIFE](#angular-component-vs-IIFE)
* [System-level data updates](#system\-level-data-updates)
* [Data binding on configuration properties](#data-binding-on-configuration-properties)
* [HTML template and CSS](#html-template-and-css)


### Angular component vs IIFE
The PI Vision 3 symbol implementation in [`sym-simplevalue.js`][SimpleValueSymbol] is wrapped in an immediately-invoked function expression (IIFE):

```javascript
(function (CS) {
  function symbolVis() { }
  CS.deriveVisualizationFromBase(symbolVis);

  ...
})(window.PIVisualization);
```

PI Vision 4 stores the code logic for a symbol in an Angular component. You need to create a new folder, called `simple-value`, under the `src` directory, and create three files in the `simple-value` folder. Together, the three files compose an Angular component for the custom symbol:
* `simple-value.component.ts`: This file includes the class metadata, definition and code logic to handle interations between the symbol and PI Vision 4.
* `simple-value.component.html`: This file is the HTML template for the component. It defines the user interface for the custom symbol.
* `simple-value.component.css`: This file contains the CSS rules that apply to the current component.

For example, the skeleton for the `simple-value.component.ts` file specifies the class name `SimpleValueComponent`, its template file  `simple-value.component.html`, and its associated `css` file `simple-value.component.css`:

```typescript
@Component({
  templateUrl: 'simple-value.component.html',
  styleUrls: ['simple-value.component.css']
})
export class SimpleValueComponent implements OnChanges {
}
```

### System-level data updates
A PI Vision 3 custom symbol receives updated data by implementing the `onDataUpdate` callback in   [`sym-simplevalue.js`][SimpleValueSymbol].

```javascript
this.onDataUpdate = dataUpdate;
function dataUpdate(data) {
    if(data) {
        scope.value = data.Value;
        scope.time = data.Time;
        if(data.Label) {
            scope.label = data.Label;
        }
    }
}
```

To port the data-update code, you must specify `data` as an `@Input()` to the component. The name must match the name defined in the `inputs` in the symbol metadata in the `module.ts` file. In addition, the Angular component for the symbol must implement the `OnChanges` interface to make the component aware of data updates:

```typescript
export class SimpleValueComponent implements OnChanges {
  @Input() data: any;
  value: number;
  time: string;
  label: string;

  ngOnChanges(changes) {
    if (changes.data) {
      if (this.data && this.data.body && this.data.body[0]) {
        this.value = this.data.body[0].value;
        this.time = this.data.body[0].timestamp;
        this.label = this.data.body[0].path;
      }
    }
  }
}
```

Whenever data updates, the `ngOnChanges()` function is called, and if `changes.data` exists, which means the system-level data has updated, then the functon updates the class properties `value`, `time`, and `label`.

### Data binding on configuration properties

In PI Vision 3, you bind the configuration properties directly to the view. In PI Vision 4, each symbol component is self-contained. Therefore, you must explicitly define the inputs to the components, making them aware of the configuration properties defined in the symbol metadata object in the `module.ts` file.

Specifically, in the Angular component, define `txtColor`, `bkColor`, `showLabel`, and `showTime` as `@Input()` to the component. Later, you can use these inputs and bind them to the template. Since the `txtColor` property is configured as multistate color, the input will change based on the multistate settings

```typescript
export class SimpleValueComponent implements OnChanges {
  @Input() txtColor: string;
  @Input() bkColor: string;
  @Input() showLabel: boolean;
  @Input() showTime: boolean;
}
```

### HTML template and CSS
To port the PI Vision 3 symbol's HTML template and CSS files, you need to copy the content of the `sym-simplevalue-template.html` (see[SimpleValueSymbol]) into the `src/simple-value.component.html` file. There are syntax changes from AngularJS to Angular; therefore, you must make changes when copying the content.  

For example, consider the following PI Vision 3 custom symbol HTML:
```html
<div ng-style="{background: config.BackgroundColor, color: MultistateColor || config.TextColor}">
    <div ng-show="config.ShowLabel">{{label}}</div>
    <div>{{value}}</div>
    <div ng-show="config.ShowTime">{{time}}</div>
</div>
```
The following table shows required changes:

| PI Vision 3 | PI Vision 4|
|------------|-------|
|`ng-style="{background: config.BackgroundColor}"` | `[style.background]="bkColor"`|
|`ng-show="config.ShowLabel"` | `*ngIf="showLabel"`|

After applying the changes, you copy the following into the PI Vision 4 HTML: 
```html
<div [style.background]="bkColor"
     [style.color]="txtColor" 
     style="width:100%; height:100%">
  <div *ngIf="showLabel">{{label}}</div>
  <div>{{value}}</div>
  <div *ngIf="showTime">{{time}}</div>
</div>
```

For a list of common syntax changes, see the Angular article [AngularJS to Angular Quick Reference](https://angular.io/guide/ajs-quick-reference).

## Third-party frameworks
To use third-party frameworks for custom symbols in PI Vision 3, you put the library scripts in the `libraries` folder under the PI Vision 3 directory. 

In PI Vision 4, you can leverage `Node.js` and `npm` to install `npm` packages in the project, and then bundle the libraries with `Rollup.js` in the build process.

To install the third-party libraries, enter `npm install <your-library>` and then use the `import` syntax in your Angular component to import the library for use in the symbol. 

## Dependency injection
A PI Vision 3 custom symbol injects dependencies through input parameters in the `init` function. For example, the [`Time Series Chart`][TimeSeriesChart] symbol injects `scope` and `elem` into the symbol.
```javascript
symbolVis.prototype.init = function(scope, elem) {
}
```

In PI Vision 4, you inject dependencies through the Angular component constructor. For example, the following constructor allows an Angular component to access the element reference:
```typescript
export class SomeCustomSymbol {
  constructor(private elementRef: ElementRef) { }
}
```


[SimpleValueSymbol]: https://github.com/osisoft/PI-Vision-Custom-Symbols/tree/master/tutorials/simplevalue

[SimpleValueSymbolReadme]: https://github.com/osisoft/PI-Vision-Custom-Symbols/blob/master/tutorials/simplevalue/README.md

[TimeSeriesChart]:
https://github.com/osisoft/PI-Vision-Custom-Symbols/blob/master/tutorials/timeserieschart/sym-timeserieschart.js