/**
 * @license
 * Copyright © 2017-2018 OSIsoft, LLC. All rights reserved.
 * Use of this source code is governed by the terms in the accompanying LICENSE file.
 */
// A custom symbol can use Injection Tokens defined in this file to
// access dependencies from hosted application

/**
 * This token is for PiWebApiService in '@osisoft/piwebapi'
 */
export const PIWEBAPI_TOKEN = 'PiWebApi';

/**
 * This token is for HttpClient in '@angular/common/http'
 */
export const HTTPCLIENT_TOKEN = 'HttpClient';

/**
 * This token is for the context menu service
 */
export const CONTEXT_MENU_TOKEN = 'ContextMenuService';
