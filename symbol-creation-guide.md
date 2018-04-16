# PI Vision Symbol Creation Guide

This document assumes that you have read the [README](./README.md) documentation in this repository and are familiar with [Angular][angular] and [JavaScript][javascript]. This document describes the files you must edit to create a custom symbol.

A single PI Vision symbol consists of two classes:
* An Angular component, which provides the visualization for the symbol
* A `SymbolType` object, which defines the metadata for the symbol

To create a custom symbol:
1. Create an Angular component for the symbol.
2. Register the Angular component in the module file.
3. Define the metadata for the symbol in the module file.

## Angular component
Components are UI building blocks in Angular. The easiest way to create a new component is to copy and modify the `ExampleComponent` in the extension project. For example, you can create a `RadarChartComponent` from the `ExampleComponent`.  

### Component metadata
```typescript
@Component({
  selector: 'radar-chart',
  templateUrl: './radar-chart.html',
  styleUrls: ['./radar-chart.css']
})
```



Use the `@Component()` decorator to define metadata for the component. The above code snippet includes some of the most common metadata fields:
* `selector`: The HTML tag name shown in the DOM
* `templateUrl`: The path to the component template file
* `styleUrls`: A list of `css` files for the component

### Inputs
```typescript
export class RadarChartComponent implements OnInit, OnChanges {
  @Input() fgColor: string;
  @Input() bkColor: string;
  @Input() data: any;
  @Input() pathPrefix: string;
}
```
The component class must specify all inputs the component expects. This sample shows two types of inputs:
* Configuration property inputs

    The `fgColor` and `bkColor` inputs are associated with the configuration properties defined in the `generalConfig` property of the `ExtensionLibrary` class in the [`module.ts`](src/module.ts) file. When a user changes a configuration option from the configuration pane, the value of the associated input variable changes accordingly.  
   >Note: The input variable name should match the string defined in the `propName` property of the `configProps` property and both should use camel case.

* System property inputs

    The `data` and `pathPrefix` inputs are system-level inputs associated with the `inputs` property of the `ExtensionLibrary` class in the [`module.ts`](src/module.ts) file: 

    * `data` is a special input name that the application binds to the real-time PI System data. When you register the symbol with PI Vision, you must provide additional metadata to configure how this symbol interacts with PI Vision.  Whenever PI Vision receives real-time data updates, a slice of data will flow into the component through the `data` input. The input data is "shaped" to help visualize the data in the component. The data shape, together with other data parameters, are defined in the `dataParams` property in the symbol description in the `ExtensionLibrary` class. 

    * `pathPrefix` is a system input that contains a URL prefix. You can use the `pathPrefix` input to locate static files, such as images, when building a custom symbol.

### Constructor
```typescript
constructor( @Inject(PIWEBAPI_TOKEN) private piWebApiService: PiWebApiService) {
  // Put bare minimum initialization logic here
}
```
By definition, the constructor is invoked when the component class is instantiated. You can include bare minimum initialization logic in the constructor, but avoid including asynchronous calls like HTTP requests in the constructor to ensure that the component can be created in the DOM. In Angular, you also specify injected dependencies as input parameters to the constructor.

### Lifecycle hooks
Angular provides lifecycle hooks to components so that when these events occur, components have the ability to respond. You can leverage the lifecycle hooks to build a custom symbol.

```typescript
export class RadarChartComponent implements OnInit, OnChanges {
  ...
  ngOnInit(): void {
    ...
  }
  ...
  ngOnChanges(changes) {
    ...
  }
  ...
```

This class implements the `OnInit` and `OnChanges` interfaces to be notified when Angular creates and updates the component.
* `ngOnInit()`: The method is called when Angular creates the symbol component. Include initialization logic in this method, for example logic that creates a chart using third-party library.
* `ngOnChanges()`: This method is called whenever any `@input` parameters change. The `changes` object contains all the changed properties, such as any new data for the symbol. Use this method when you want to update the UI or change internal state based on an input change. 

## Module file
The module file [`module.ts`](src/module.ts) is the single entry point of the library and brings all parts of the extension library into one single unit ready to use in PI Vision. 

>Note: Do not change this file's name, as this would require changes to the project's build system.

For example, here is the `module.ts` file, edited to include the  `RadarChartComponent`:

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgLibrary, SymbolType, SymbolInputType, ConfigPropType } from './framework';
import { LibModuleNgFactory } from './module.ngfactory';

import { ExampleComponent } from './example/example.component';
import { RadarChartComponent } from "./radar-chart/radar-chart.component";

@NgModule({
  declarations: [
    ExampleComponent,
    RadarChartComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ExampleComponent,
    RadarChartComponent
  ],
  entryComponents: [
    ExampleComponent,
    RadarChartComponent
  ]
})
export class LibModule { }

export class ExtensionLibrary extends NgLibrary {
  module = LibModule;
  moduleFactory = LibModuleNgFactory;
  symbols: SymbolType[] = [
    {
      name: 'radar-chart-symbol',
      displayName: 'Radar Chart Symbol',
      dataParams: { shape: 'crosstab', dataMode: 'snapshot' },
      thumbnail: '^/assets/images/chart.svg',
      compCtor: RadarChartComponent,
      inputs: [
        SymbolInputType.Data,
        SymbolInputType.PathPrefix
      ],
      generalConfig: [
        {
          name: 'Example Options',
          isExpanded: true,
          configProps: [
            { propName: 'bkColor', displayName: 'Background color', configType: ConfigPropType.Color, defaultVal: 'white' },
            { propName: 'fgColor', displayName: 'Color', configType: ConfigPropType.Color, defaultVal: 'black' }
          ]
        }
      ],
      layoutWidth: 600,
      layoutHeight: 400
    },
    {
      // some other symbol components..
    }
  ];
}
```

The module file serves two purposes:
* [Component registration](#component-registration)
* [Symbol metadata definition](#symbol-metadata-definition)

### Component registration
```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgLibrary, SymbolType, SymbolInputType, ConfigPropType } from './framework';
import { LibModuleNgFactory } from './module.ngfactory';

import { ExampleComponent } from './example/example.component';
import { RadarChartComponent } from "./radar-chart/radar-chart.component";

@NgModule({
 declarations: [
    ExampleComponent,
    RadarChartComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ExampleComponent,
    RadarChartComponent
  ],
  entryComponents: [
    ExampleComponent,
    RadarChartComponent
  ]
})
export class LibModule { }
```
This section is a standard Angular module declaration, which contains all the components and services that your symbols use.

For each symbol in your library, you must import its component and add it to the `declarations`, `exports`, and `entryComponents` sections of the `@NgModule` decorator. This example declares two symbols, the basic `RadarChartComponent` symbol, created as a component above, and the `ExampleComponent` symbol.   

OSIsoft recommends naming this module `LibModule`; using another name would require additional changes to the extensions project's boiler-plate code.

###  Symbol metadata definition

```typescript
export class ExtensionLibrary extends NgLibrary {
  module = LibModule;
  moduleFactory = LibModuleNgFactory;
  symbols: SymbolType[] = [
    {
      name: 'radar-chart-symbol',
      displayName: 'Radar Chart Symbol',
      dataParams: { shape: 'crosstab', dataMode: 'snapshot' },
      thumbnail: '^/assets/images/chart.svg',
      compCtor: RadarChartComponent,
      inputs: [
        SymbolInputType.Data,
        SymbolInputType.PathPrefix
      ],
      generalConfig: [
        {
          name: 'Example Options',
          isExpanded: true,
          configProps: [
            { propName: 'bkColor', displayName: 'Background color', configType: ConfigPropType.Color, defaultVal: 'white' },
            { propName: 'fgColor', displayName: 'Color', configType: ConfigPropType.Color, defaultVal: 'black' }
          ]
        }
      ],
      layoutWidth: 600,
      layoutHeight: 400
    },
    {
        // some other symbol components..
    }
  ];
}
```
This class is similar to the Angular `NgModule`, but contains the metadata specific to PI Vision symbols. The name of the `NgLibrary` derived class must be  `ExtensionLibrary`,  as the PI Vision application expects the extension library to export a class with this name. The class requires the following settings:

* `module` -- Must be set to the Angular module `LibModule`.
* `moduleFactory` -- Must be set to `LibModuleNgFactory`, which is created when the library is built and imported in the module declaration.
* `symbols` -- An array of `SymbolType` objects (using the inline object syntax) declares each symbol in the library. This object lets PI Vision know that a symbol exists, what to call the symbol, which component to create, what configuration properties the symbol requires, how to query for PI System data, and how the symbol interacts with the rest of the application.

    Each symbol can have the following properties:

    * `name` -- Required.  A unique name within the library to identify the symbol. The name should contain only standard lowercase English characters, numbers, and hyphens, such as `much-like-this`.
    * `displayName` -- A human-readable name for this symbol. The UI will show this name in various places, such as the toolbox. 
    * `dataParams` -- The types of data that the symbol visualizes. The radar-chart symbol creates a radar chart that shows the snapshot value of multiple data sources. Therefore, this symbol specifies `crosstab` as the data shape and `snapshot` as the data mode. See [Data shapes](#data-shapes).
    * `thumbnail` -- A URL to an SVG image file that contains a small icon for the symbol. PI Vision shows this icon in a display's symbol-creation toolbox. Store the file in the assets folder and prefix the filename with `^/assets/images/`. At runtime, the `^` will be replaced with the URL to the installed asset files. See [Images and other asset files](#imagess-and-other-asset-files) for more information.
    * `compCtor` -- The class of the symbol's Angular component. The class connects this metadata with the visual Angular component.
    * `inputs` -- An array of enum values that match the `@Input` property names of the symbol's component. Every system-level input must be listed here. You cannot simply declare the inputs in the component.    
    PI Vision supports the following system properties:
      * `SymbolInputType.Columns`: Indicates that the symbol requested certain columns for data summary
      * `SymbolInputType.CursorTime`:  Indicates that the symbol needs the `Date` object when dropping a cursor on the symbol
      * `SymbolInputType.Data`: Indicates that the symbol needs real-time data from the PI System
      * `SymbolInputType.EditMode`: Indicates that the symbol needs to know if display is in edit mode
      * `SymbolInputType.PathPrefix`: Useful if you need to add images to your symbol
      * `SymbolInputType.Shape`: Indicates that the symbol needs to know its data shape
      * `SymbolInputType.Type`: Add this if you are interested in the type of the symbol
      * `SymbolInputType.Selected`: Indicates that symbol needs to know whether it is selected

       The example defines `SymbolInputType.Data`, which lets PI Vision know that this symbol needs real-time data from the PI System. In this case, the `@Input` parameter is named `data`.
    * `generalConfig` -- An array of configuration property groups. Each group has a name, a flag indicating whether the group is initially expanded or not in the UI, and an array of configuration properties (symbol properties that can be configured through user input).  Each configuration group has the following properties:
        * `name` -- The name of the configuration group. Appears as an expandible or collapsible list.
        * `isExpanded` -- Boolean flag that indicates whether the group is initially expanded when users open the configuration pane.
        * `configProps` -- An array of configuration properties that users can set through the configuration pane.  You specify the following configuration properties:
            * `propname` -- The name of the property.
            * `displayName` -- The property name that appears in the configuration pane.
            * `configType` -- The type of configuration available to the user for this property in the configuration pane. You can use the following predefined configuration options: 
                * `ConfigPropType.Color`: Select a color from a color picker
                * `ConfigPropType.Columns`: Modify data columns in the symbol
                * `ConfigPropType.Custom`: Custom configuration property
                * `ConfigPropType.Datasource`: Select a data item from those associated with the symbol
                * `ConfigPropType.DocumentUrl`: Enter a URL to a PI Vision document
                * `ConfigPropType.Dropdown`: Select from a list of items, defined in the `configItems` property. 
                * `ConfigPropType.Flag`: Toggle an on or off switch
                * `ConfigPropType.Listbox`: Select from a list of items, defined in the `configItems` property. 
                * `ConfigPropType.Num`: Enter numbers
                * `ConfigPropType.RadioButtons`: Select from a list of items, defined in the `configItems` property. 
                * `ConfigPropType.Text`: Enter text 
                * `ConfigPropType.TextAlign`: Set the text alignment
                * `ConfigPropType.Time`: Set the date and time (supports PI time syntax)
                * `ConfigPropType.Url`: Enter a URL
            * `configItems` -- Required only if ConfigPropType is RadioButton, Listbox, or Dropdown. Specifies an array of items that the user can choose from.
              The configItems array has the following properties:

              * `text` - Optional. Label that describes the value. For radio buttons, this text appears as a tooltip to the icon, if an icon also specified.
              * `iconURL` -- Optional. Location of an icon to present for this value.
              * `value` -- The value set when users select the item.
            * `defaultVal` -- Optional. The default value for the property.
            * `isMultiState` -- Optional. Boolean that enables configuring multistate on the property. If not specified, the default value is false.

            For example, consider the following example configuration property:
            ```typescript
            { propName: 'bkColor', displayName: 'Background color', configType: ConfigPropType.Color, defaultVal: 'white' }
            ```
            This code block defines the background color property for the symbol. The configuration pane will show an option called `Background color` with the default color set to `white`. If you add `bkColor` as an `@Input` to the component, you can use the selected background color in your code and template.   

            Another example:

            ```typescript
            { propName: 'alignment', displayName: 'Text alignment', configType: ConfigPropType.RadioButtons, defaultVal: 'align-left', isMultiState: false, configItems: [
              { text: 'Left justified', iconUrl: './left.svg', value: 'align-left'},
              { text: 'Right justified', iconUrl: './right.svg', value: 'align-right'}
            ]}
            ```
            This code block shows the definition of the alignment property for a symbol. The configuration pane will show a group box labeled "Text alignment" with two radio buttons, indicated with icons that have tooltips saying "Left justified" and "Right justified."
    * `layoutHeight` -- Default height of symbol, in pixels.
    * `layoutWidth` -- Default width of symbol, in pixels.
    
#### Multistate
You can easily add multistate capability to a property by including the `isMultiState` configuration property and setting to `true`:
```typescript
{ propName: 'bkColor', displayName: 'Background color', configType: ConfigPropType.Color, defaultVal: 'white', isMultiState: true }
``` 

When you include this property, PI Vision includes the multistate configuration pane with the symbol, allowing users to configure the data source and multistate conditions that control the background color of the symbol. 

***Please note that multistate only works with symbols configured to use the `'single'` data shape currently.***

## Images and other asset files
All files within the `/assets` folder will be deployed with the library. This provides a way to use external files, like images, in your component templates. To form URLs to these files, your component must declare an input named `pathPrefix` and  the module file `module.ts` must include the system input `SymbolInputType.PathPrefix` in the `inputs` array. This input contains a URL prefix that is appended to the file name to form an absolute path to the file.
For example:
```html
<img [src]="pathPrefix + '/assets/my-image.png" />
```
When defining the thumbnail image for a symbol in the `SymbolType` object, prefix the name of the thumbnail with a `^` for this prefix. See [Symbol metadata definition](#symbol-metadata-definition) for an example of this.




## Data parameters
The module file `module.ts` defines symbol metadata in the `ExtensionLibrary` class. The `symbols` array contains a `dataParams` property for each symbol. When the  `dataParams` property is present, PI Vision sends real-time data to the symbol in the specified format, which lets you visualize the data in the symbol. This section discusses the data shapes and data modes that PI Vision supports.

### Data shapes
PI Vision supports the following data shapes:
* [Single shape](#single-shape)
* [Trend shape](#trend-shape)
* [Crosstab shape](#crosstab-shape)
* [XY shape](#xy-shape)

#### Single shape
Use the `single` data shape if the symbol needs to access the recorded value at the current display's end time. Set the `dataParams` property in the `module.ts` file to  `{ shape: 'single' }` to make the component's `data` input look like this:

```typescript
{
  body: [{
      color: '#1f77b4',
      good: true
      path: '\\Asset1|Attr1',
      timestamp: '2017-10-09T15:10:32Z',
      type: 'Double',
      value: 12.558101654052734
    }]
}
```

#### Trend shape
Use the `trend` shape if the symbol needs to access plot values during a given time range, such as to visualize a trend. Set the `dataParams` property in the `module.ts` file to `{ shape: 'trend' }` to make the component's `data` input look like this:

```typescript
{
  body: [{
    color: '#1f77b4',
    events: [{
      timestamp: '2017-10-09T15:39:19.2399749Z',
      value: 29.004425048828125
    }, {
      timestamp: '2017-10-09T15:44:32Z',
      value: 34.353511810302734
    }, {
      timestamp: '2017-10-09T15:46:32Z',
      value: 37.163482666015625
    }],
    path: '\\Asset1|Attr1',
    step: 0
  }, {
    color: '#aec7e8',
    events: [
      timestamp: '2017-10-09T15:39:19.2399749Z',
      value: {
        IsSystem: false,
        Name: 'Above Normal',
        Value: 3
      }, {
        timestamp: '2017-10-09T15:42:02Z',
        value: {
          IsSystem: false,
          Name: 'Below Normal',
          Value: 1
        }
      }],
    path: '\\Asset2|Attr2',
    step: 1
  }],
  starttime: '2017-10-09T15:47:19.094Z',
  endtime: '2017-10-09T15:39:19.094Z'
}
``` 

#### Crosstab shape
Use the `crosstab` shape when the symbol compares the real-time data for attributes across multiple data assets. The crosstab shape requires that you also specify `dataMode` in the `dataParams` property. (For available data modes, see [Data modes](#data-modes).) Set the `dataParams` property in the `module.ts` file to  `{ shape: 'crosstab', dataMode: 'snapshot' }` to make the component's `data` input look like this:

> Note: The attribute data is grouped by assets in `events` property.

```typescript
{
  body: {
    events: [[
      '\\Asset1',
      91.67820739746094,
      92.09439849853516
    ], [
      '\\Asset2',
      46.39336013793945,
      ''
    ]],
    headers: [
      'Element',
      'Attr1',
      'Attr2'
    ], 
    items: [{
      color: '1f77b4',
      id: 'Web ID for \\Asset1|Attr1',
      path: '\\Asset1|Attr1'
    }, {
      color: 'aec7e8',
      id: 'Web ID for \\Asset1|Attr2',
      path: '\\Asset1|Attr2'
    }, {
      color: 'ffbb78',
      id: 'Web ID for \\Asset2|Attr1',
      path: '\\Asset2|Attr1'
    }]
  },
  endTime: '2017-10-09T16:17:19.669Z',
  startTime: '2017-10-09T08:17:19.668Z'
}
```

#### XY shape
Use the `xy` shape when the symbol creates a scatter plot chart, with one base item on the x-axis, and one or more data items on the y-axis. Set the `dataParams` property in the `module.ts` file to `{ shape: 'xy' }` to make the component's `data` input look like this:

> Note: `\\Asset1|Attr1` is the data item on x-axis, and `\\Asset2|Attr1` is the data item on y-axis.
```typescript
{
  basePath: '\\Asset1|Attr1',
  body: [[
    color: '1f77b4',
    events: [],
    path: '\\Asset1|Attr1'
  ], [
    color: 'aec7e8',
    events: [{
      timestamp: '2017-10-09T15:37:12.5424664Z',
      value: [{
        Good: true,
        Timestamp: '2017-10-09T15:37:12.5424664Z',
        Value: 26.83753776550293
      },
      100.74958038330078
      ]
    }, {
      timestamp: '2017-10-09T16:37:12.5424664Z',
      value: [{
        Good: true, 
        TimeStamp: '2017-10-09T16:37:12.5424664Z'
        Value: 101.510986328125
      },
      87.94261932373047
      ]
    }],
    path: 'Asset2|Attr1'
  ]],
  starttime: '2017-10-09T15:37:12.407Z',
  endtime: '2017-10-09T16:37:12.407Z'
}
``` 

### Data modes
The `dataParams` property can also set the `dataMode` property, which refines the type of the data entering the symbol. The `dataMode` property is required for the [`crossTab`](#crosstab-shape) data shape. PI Vision currently supports the following data modes:
* `snapshot`: PI Vision sends snapshot values, the latest available values sent from the data sources
* `interpolatedValues`: PI Vision sends interpolated values, the values evaluated at the end of the time range
* `recordedvalues`: PI Vision sends recorded values, the values from PI Data Archive for the time period 

### Value types
Supported value types match [the list of value types supported by PI Web API](https://techsupport.osisoft.com/Documentation/PI-Web-API/help/topics/value-types.html). Below are some examples of `value` in the component's `data` input.
#### Double, Float16, Float32, Float64, <br/> Int16, Int32, Int64, Byte, Single
Number
```typescript
value: 12
```
#### DateTime
ISO8601 UTC formatted string
```typescript
value: '1970-01-01T00:00:00Z'
```
#### String
String
```typescript
value: 'C is for cookie'
```
#### Boolean
Boolean
```typescript
value: true
```
#### GUID
Hyphenated hexadecimal digits as a string
```typescript
value: '00000000-0000-0000-0000-000000000000'
```
#### Array
Array of any of the above types. Example:
```typescript
value: [ 0, 1, 2.5, 3 ]
```
#### Enumeration type
Object with 3 properties: `IsSystem` (boolean), `Name` (string), `Value` (number)
```typescript
value: {
          IsSystem: false,
          Name: 'Off',
          Value: 0
       }
```
### Bad and error values
The `good` property is set to false for bad and error values. An error value indicates that PI Vision cannot obtain a value, such as due to a connection error. A bad value indicates the quality is bad. Examples: 
#### Bad value
```typescript
{
  body: [{
      ...
      good: false,
      value: {
          IsSystem: true,
          Name: 'Calc Failed',
          Value: 249
       }
    }]
}
```
#### Error value
```typescript
{
  body: [{
      ...
      good: false,
      value: null
    }]
}
```

[angular]: https://angular.io/
[javascript]: https://developer.mozilla.org/en-US/docs/Web/JavaScript
