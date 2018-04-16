/**
 * @license
 * Copyright © 2017-2018 OSIsoft, LLC. All rights reserved.
 * Use of this source code is governed by the terms in the accompanying LICENSE file.
 */
import { SymbolType } from './symbol-types';

/**
 * The extensibility version number for this file.
 */
export const EXT_VERSION_NUM = 1;

/**
 * Base class for the extensibile plug in library
 * @abstract
 */
export abstract class ExtensionLibrary {
  /**
   * Array of extensible symbols
   * @abstract
   */
  abstract symbols: SymbolType[];

  /**
   * Extensibility version number
   * @readonly
   */
  readonly version = EXT_VERSION_NUM;
}

/**
 * Angular class for extensible library
 * @abstract
 */
export abstract class NgLibrary extends ExtensionLibrary {
  abstract module: any;
  abstract moduleFactory: any;
}
