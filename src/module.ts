import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgLibrary, SymbolType, SymbolInputType, ConfigPropType } from './framework';
import { LibModuleNgFactory } from './module.ngfactory';

import { ThreedvisComponent } from './threedvis/threedvis.component';

@NgModule({
  declarations: [ ThreedvisComponent ],
  imports: [ CommonModule ] ,
  exports: [ ThreedvisComponent ],
  entryComponents: [ ThreedvisComponent ]
})
export class LibModule { }

export class ExtensionLibrary extends NgLibrary {
  module = LibModule;
  moduleFactory = LibModuleNgFactory;
  symbols: SymbolType[] = [
    {
      name: '3dvis-symbol',
      displayName: '3D Visualization Symbol',
      dataParams: { shape: 'single', dataMode: 'snapshot' },
      thumbnail: '^/assets/images/example.svg',
      compCtor: ThreedvisComponent,
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
      layoutWidth: 200,
      layoutHeight: 100
    }
  ];
}
