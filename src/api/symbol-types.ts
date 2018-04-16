/**
 * @license
 * Copyright © 2017-2018 OSIsoft, LLC. All rights reserved.
 * Use of this source code is governed by the terms in the accompanying LICENSE file.
 */
import { EventEmitter, OnChanges } from '@angular/core';
import {
  BasePropDef, CustomPropDef, ConfigPropDef, ConfigComponent, ConfigGroupDef,
  BaseType, DataParams, DISPLAY_CATEGORY, Command
} from './types';

/**
 * Interface for the Symbol API
 * This interface defines the possible inputs and outputs to the symbol
 */
export interface SymbolAPI {
  // INPUTS

  /**
   * Type of the symbol
   * @input
  */
  type: string;

  /**
   * Real time data stream from PI
   */
  data: any;
  layout: any;
  params: any;
  props: any;
  msconfig: any;
  mobile: boolean;
  editMode: boolean;

  /**
   * zoom value
   */
  zoom: number;

  /**
   * the Date object for current cursor time
   */
  cursorTime: Date;

  /**
   * true if current symbol is selected
   */
  selected: boolean;

  /**
   * A list of items that are highlighted
   */
  highlightItems: string[];

  /**
   * A list of AF Elements
   */
  elements: string[];

  /**
   * Currently selected zone index (if any)
   */
  zoneIndex: number;

  /**
   * True if zone is highlighted
   */
  highlightZone: boolean;

  /**
   * Trace indices that are highlighted
   */
  highlightIndices: number[];

  // OUTPUTS

  /**
   * The resizing event
   * @output
   */
  resizing: EventEmitter<any>;

  /**
   * Emit the event if symbol needs to be refreshed
   */
  refresh: EventEmitter<boolean>;

  /**
   * Emit the event if cursor needs to be updated
   */
  updateCursor: EventEmitter<any>;

  /**
   * Event to select current symbol
   */
  select: EventEmitter<any>;

  /**
   * Event to update the span
   */
  updateSpan: EventEmitter<any>;

  /**
   * Event to update the zones
   */
  updateZones: EventEmitter<any>;

  /**
   * Event to add zones
   */
  addZones: EventEmitter<any>;

  /**
   * Fire an embed action such as
   * Initializing a symbol, changing time range,
   * toggling ER Element, refresh symbol, or refresh the display
   */
  embedAction: EventEmitter<any>;
}

export interface JSSymbol {
  onChanges(changes: any);
}

/**
 * Default settings when initializing an Angular symbol extension.
 */
export const NgSymbolTypeDefaults: any = {
  /**
   * Defaults to having a card style layout
   */
  hasCardLayout: true,

  /**
   * Defaults to have only one layout
   */
  multipleLayout: false,

  /**
   * Defaults to using PI Vision display time
   */
  setDefaultTime: true,

  /**
   * Defaults to having a configuration UI
   */
  noConfigUI: false,

  /**
   * By default the symbol is implemented in Angular
   */
  isAngular: true,

  /**
   * By default the symbol falls into the display category
   */
  categories: [DISPLAY_CATEGORY],
  inputs: [],
  customProps: [],
  generalConfig: [],
  dataItemsConfig: [],
  columnsConfig: []
};

export const JsSymbolTypeDefaults: any = {
  hasCardLayout: true,
  multipleLayout: false,
  setDefaultTime: true,
  noConfigUI: false,
  isAngular: false,
  categories: [ DISPLAY_CATEGORY ],
  inputs: [],
  customProps: [],
  generalConfig: [],
  dataItemsConfig: [],
  columnsConfig: []
};

/**
 * System level property enumeration type.
 * Each system property maps to a system level input in SymbolAPI
 * E.g. SymbolInputType.CursorTime maps to cursorTime @Input in your component
 */
export const enum SymbolInputType {
  /**
   * Adding this property indicates the symbol requested certain columns for data summary
   */
  Columns,

  /**
   * This property let's PI Vision know the symbol needs the Date object
   * when dropping a cursor on the symbol
   */
  CursorTime,

  /**
   * Real time data from PI
   */
  Data,

  /**
   * The data mode (e.g. snapshot)
   */
  DataMode,

  /**
   * Add this property if symbol needs to know if display is
   * in edit mode
   */
  EditMode,

  /**
   * This selected zone in the config UI
   */
  ZoneIndex,

  /**
   * This allows symbol to know indices of highlighted data items
   */
  HighlightIndices,

  /**
  * The markup text of a graphic-style symbol
  */
  Markup,

  /**
   * The path prefix. This is useful if you need to add
   * images to your symbol
   */
  PathPrefix,

  /**
   * Data shape of the symbol
   */
  Shape,

  /**
   * Add this if you are interested in the type of the symbol
   */
  Type,

  /**
   * An object with the collection of dynamic zone properties
   * set to their configured values before multi-state values are set
   */
  Zones,

  /**
   * A flag indicating whether there is currently a highlighted zone.
   */
  HighlightZone,

  /**
   * Add this to inputs if symbol needs to know whether
   * it is selected
   */
  Selected,

  /**
   * An object with the collection of all multi-state enabled properties
   * set to their current values, useful when using dynmic properties (zones)
   */
  MSData,

  /**
   * An array of zone properties grouped by zone indices. Each group contains
   * all the properties configurations for a given zone.
   */
  ZonePropConfigs
}

/**
 * Definition for a system level property
 * @interface
 */
export interface SymbolInputDef extends BasePropDef {
  /**
   * the system level property type
   */
  sysType: SymbolInputType;
}

/**
 * Each symbol must be declared by creating an object of this type.
 * This object lets PI Vision know that this symbol exists, what to call it,
 * which component to create, what configuration properties does the symbol require,
 * how to query for PI data, and how it interacts with the rest of the application.
 * @class
 */
export class SymbolType extends BaseType {
  /**
   * Parameters to configure symbol data
   */
  dataParams?: DataParams;

  /**
   * The outputs for the symbol
   * Outputs can be one or more of these strings:
   * 'updateSpan', 'zoomIn', 'updateCursor', 'addZones', 'action', 'updateZones', 'changeSymbol', 'navigate'
   */
  autoEventBindings?: string[];

  /**
   * Set to true if the symbol has card layout
   */
  hasCardLayout?: boolean;

  /**
   * Set to true if the symbol has multiple layout
   */
  multipleLayout?: boolean;

  /**
   * Set to true if using default time. The default time is usually
   * a global time for a given display or document
   */
  setDefaultTime?: boolean;

  /**
   * Set the default layout (width, height etc.)
   */
  defaultLayout?: any;

  /**
   * A function which will be called when creating a brand new symbol
   * or when changing symbol from one type to another to do the clean up
   */
  onSetDefaults?: (model: any) => boolean;

  /**
   * A function that will be called when layout should be updated
   */
  onLayout?: (model: any, initial: boolean, numVertical: number, numHorizontal: number, snap: (num: number) => number) => any;

  configCtors?: any[];

  /**
   * Set to true if the symbol doesn't need a configuration UI
   */
  noConfigUI?: boolean;

  /**
   * Initial width of the symbol
   */
  layoutWidth: number;

  /**
   * Initial height of the symbol
   */
  layoutHeight: number;

  /**
   * An array of system level properties to be used in the symbol.
   * These properties can then be sent to your symbol component as multiple
   * @Input variables.
   * See SymbolInputType for definition of each system property
   */
  inputs?: Array<SymbolInputDef | SymbolInputType>;

  /**
   * An array of custom properties
   */
  customProps?: CustomPropDef[];

  /**
   * A list of configuration property groups for general configuration items.
   */
  generalConfig?: ConfigGroupDef[];

  /**
   * A list of configuration property groups that are applied to each data item.
   */
  dataItemsConfig?: ConfigGroupDef[];

  /**
   * A list of configuration property groups that are applied to each data column.
   */
  columnsConfig?: ConfigGroupDef[];

  /**
   * A list of commands to be added to a symbols context menu
   */
  menuCommands?: Command[];

  /**
   * Creates the extensible symbol object
   */
  constructor() {
    super();
    Object.assign(this, NgSymbolTypeDefaults);
  }
}
