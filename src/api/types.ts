/**
 * @license
 * Copyright © 2017-2018 OSIsoft, LLC. All rights reserved.
 * Use of this source code is governed by the terms in the accompanying LICENSE file.
 */
import { EventEmitter, OnChanges } from '@angular/core';
import { Observable } from 'rxjs/Observable';

export const DISPLAY_CATEGORY = 'display';

export interface ConfigComponent extends OnChanges {
  paramIndex: number;
  selectedSymbols: any[];
  changeLayout: EventEmitter<any>;
  changeParam: EventEmitter<any>;
}

// Can't make this const because we need to assign it to a local property in order to use it in component template
/**
 * Enumeration for different configuration property types
 * @enum
 */
export enum ConfigPropType {
  /**
   * Color configuration property
   */
  Color,

  /**
   * Number configuration property
   */
  Num,

  /**
   * String configuration property
   */
  Text,

  /**
   * Boolean configuration property
   */
  Flag,

  /**
   * Url configuration property
   */
  Url,

  /**
   * Document URL configuration property
   */
  DocumentUrl,

  /**
   * Modify Columns from configuration UI
   */
  Columns,

  /**
   * Data source input from configuration UI
   */
  Datasource,

  /**
   * Radio button style config options
   */
  RadioButtons,

  /**
   * Create a dropdown list with custom config options
   */
  Dropdown,

  /**
   * Create a list box with custom config options
   */
  Listbox,

  /**
   * Time input config UI. The input supports both
   * absolute time or PI Time
   */
  Time,

  /**
   * Custom config property
   */
  Custom
}

/**
 * Base property definition
 */
export interface BasePropDef {
  inputAlias?: string;
}

/**
 * Definition for a custom property
 */
export interface CustomPropDef extends BasePropDef {
  /**
   * name of the property
   */
  propName: string;
  /**
   * default values for the custom property
   */
  defaultVal?: any;
}

/**
 * The configuration property definition
 * @interface
 */
export interface ConfigPropDef extends CustomPropDef {
  /**
   * name to be displayed on configuration UI
   */
  displayName: string;

  /**
   * configuration property type
   */
  configType: ConfigPropType;

  /**
   * minimum value for the configuration property
   */
  min?: number;

  /**
   * maximum value for the configuration property
   */
  max?: number;

  /**
   * Set to true if the symbol is a multistate symbol
   */
  isMultiState?: boolean;

  /**
   * For multi-item configuration types (radio buttons, listbox and dropdown),
   * specify custom configuration items for the configuration property
   */
  configItems?: ConfigItemDef[];

  /**
   * Set to true if this is a required configuration property
   */
  required?: boolean;

  /**
   * A function that returns true hides the configuration property
   * in the configuration pane. If not specified, the configuration property
   * is always shown.
   * @param props A dictionary of configuration property-value pairs keyed
   * by property name
   */
  isHidden?: (props: { [propName: string]: any }) => boolean;

  /**
   * A function that returns true disables the configuration property
   * in the configuration pane. If not specified, the configuration property
   * is always enabled.
   * @param props A dictionary of configuration property-value pairs keyed
   * by property name
   */
  isDisabled?: (props: { [propName: string]: any }) => boolean;
}

/**
 * The configuration property group definition.
 * A collapsible section will be created for each
 * configuration property group that contains a list of
 * configuration properties
 */
export interface ConfigGroupDef {
  /**
   * The name for current group
   */
  name: string;

  /**
   * a boolean flag indicating whether
   * the config group is expanded
   * If not specified, the config group is
   * collapsed by default
   */
  isExpanded?: boolean;

  /**
   * A list of configuration properties for current configuration
   * property group. PI Vision will render UI for each configuration
   * properties and the values will be sent to symbol component as
   * @Input variables
   */
  configProps: ConfigPropDef[];
}

/**
 * Base class for extensible objects
 * @abstract
 */
export abstract class BaseType {
  /**
   * The internal name of the symbol.
   */
  public name: string;

  /**
   * The name of the symbol that will be displayed to the end user.
   */
  public displayName: string;

  /**
   * The thumbnail for the extensible symbol
   */
  public thumbnail: string;

  /**
   * Specifies the Angular component name of this symbol
   */
  public compCtor: any;

  /**
   * Categories that the symbol falls under
   */
  public categories?: string[];

  /**
   * A flag to indicate if implemented in Angular
   */
  public isAngular?: boolean;
}

/**
 * Definition for a custom configuration item
 * @interface
 */
export interface ConfigItemDef {
  text?: string;
  iconUrl?: string;
  icon?: string;
  value: any;
}

/**
 * Parameters to configure symbol data
 * @interface
 */
export interface DataParams {
  /**
   * The data shape of the symbol
   * E.g. 'single' means symbol takes just one data point or stream
   */
  shape?: string;

  /**
   * Specify the columns to show for summary data
   * E.g. ['Average', 'Total'] indicates the symbol needs average and total
   * of some data stream
   */
  columns?: string[];

  /**
   * The data mode. For example, 'snapshot' means the symbol will take
   * snapshot data as input
   */
  dataMode?: string;

  /**
   * The format type to use to format numeric values.
   */
}

/**
 * Configuration for adding custom items to system menus and toolbars
 */
export interface Command {
  name: string;
  displayName: string;
  iconName?: string;
  iconUrl?: string;
  isDisabled?: boolean;
  isHidden?: boolean;
  showInAllModes?: boolean;
}

export abstract class ContextMenuAPI {
  abstract onShow(commandName: string): Observable<Command>;
  abstract onSelect(commandName: string): Observable<Command>;
}
