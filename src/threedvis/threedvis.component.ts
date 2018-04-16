import { Component, Input, Inject, OnInit, OnChanges, ElementRef, ViewChild, AfterViewInit, HostListener} from '@angular/core';
import { PiWebApiService } from '@osisoft/piwebapi';
import { PIWEBAPI_TOKEN } from '../api/tokens';
import * as THREE from 'three';
import Simpleheat from '../simpleheat/simpleheat';
import OrbitControls from '../three-orbitcontrols/three-orbitcontrols';

@Component({
  selector: 'threedvis',
  templateUrl: 'threedvis.component.html',
  styleUrls: ['threedvis.component.css']
})
export class ThreedvisComponent implements OnChanges, OnInit, AfterViewInit {
    @Input() fgColor: string;
    @Input() bkColor: string;
    @Input() data: any;
    @Input() pathPrefix: string;
    values: any[];

  @ViewChild('container') elementRef: ElementRef;
  private container: HTMLElement;

  @ViewChild('heatMapCanvasS1') canvasRef1: ElementRef;
  private heatMapCanvasS1: HTMLCanvasElement;

  @ViewChild('heatMapCanvasS2') canvasRef2: ElementRef;
  private heatMapCanvasS2: HTMLCanvasElement;

  @ViewChild('heatMapCanvasS3') canvasRef3: ElementRef;
  private heatMapCanvasS3: HTMLCanvasElement;

  private containerWidth: number;
  private containerHeight: number;

  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: THREE.TrackballControls;
  private heatmap: any;
  private cubeSide: number;
  private canvases: any[];
  private sideMaterials: any[];
  private sceneInitialized = false;

  private cube: THREE.Mesh;

  constructor( @Inject(PIWEBAPI_TOKEN) private piWebApiService: PiWebApiService) {}

  ngOnChanges() {
    if (!this.sceneInitialized) { return; }

    const items = this.data['body'];
    if (items.length === 0) { return; }

    for (let x = 1; x <= 3; x++) {
      const wallItems = items.filter(item => item['path'].includes(`Wall ${x}`));
      const arrayHeight = wallItems.find(item => item['path'].includes('Array Height'))['value'];
      const arrayWidth = wallItems.find(item => item['path'].includes('Array Width'))['value'];
      const values = wallItems.find(item => item['path'].endsWith(`Wall ${x}`))['value'];

      const hm = new Simpleheat(this.canvases[x - 1]);

      const hmData = this.genHeatMapData(values, this.cubeSide, this.cubeSide, arrayWidth, arrayHeight);
      hm.data = hmData;
      hm.radius(20, 20);
      hm.setMax(1500);
      hm.draw(.5);

      this.sideMaterials[x - 1].map.needsUpdate = true;
    }
  }

  ngOnInit() {
    console.log('Initializing 3D visualization');
    this.container = this.elementRef.nativeElement;

    this.containerWidth = this.container.clientWidth;
    this.containerHeight = this.container.clientHeight;

    this.heatMapCanvasS1 = this.canvasRef1.nativeElement;
    this.heatMapCanvasS2 = this.canvasRef2.nativeElement;
    this.heatMapCanvasS3 = this.canvasRef3.nativeElement;
  }

  ngAfterViewInit() {
    this.initCube();
  }

  initCube() {
    const screen = {
      width  : this.containerWidth,
      height : this.containerHeight
    },
    view = {
      angle  : 45,
      aspect : screen.width / screen.height,
      near   : 0.1,
      far    : 10000
    };

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(view.angle, view.aspect, view. near, view.far);
    this.renderer = new THREE.WebGLRenderer();

    this.scene.add(this.camera);
    this.scene.add(new THREE.AxesHelper(500));

    this.camera.position.set(this.containerHeight * .75, 10, this.containerHeight * .75);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.renderer.setSize(screen.width, screen.height);
    this.container.appendChild(this.renderer.domElement);

    this.cubeSide = this.containerHeight / 4;
    this.heatMapCanvasS1.width = this.heatMapCanvasS1.height = this.cubeSide;
    this.heatMapCanvasS2.width = this.heatMapCanvasS2.height = this.cubeSide;
    this.heatMapCanvasS3.width = this.heatMapCanvasS3.height = this.cubeSide;

    this.canvases = [];
    this.canvases.push(this.heatMapCanvasS1);
    this.canvases.push(this.heatMapCanvasS2);
    this.canvases.push(this.heatMapCanvasS3);

    const texture1 = new THREE.CanvasTexture(this.heatMapCanvasS1);
    const texture2 = new THREE.CanvasTexture(this.heatMapCanvasS2);
    const texture3 = new THREE.CanvasTexture(this.heatMapCanvasS3);

    const material1 = new THREE.MeshBasicMaterial({map: texture1});
    const material2 = new THREE.MeshBasicMaterial({map: texture2});
    const material3 = new THREE.MeshBasicMaterial({color: 0xffffff});
    const material4 = new THREE.MeshBasicMaterial({color: 0xffffff});
    const material5 = new THREE.MeshBasicMaterial({map: texture3});
    const material6 = new THREE.MeshBasicMaterial({color: 0xffffff});

    this.sideMaterials = [];
    this.sideMaterials.push(material1, material2, material5);

    const materials = [];
    materials.push(material1, material2, material3, material4, material5, material6);

    const mesh = new THREE.Mesh( new THREE.BoxGeometry( this.cubeSide, this.cubeSide, this.cubeSide ), materials );
    this.scene.add( mesh );

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.render();
    this.sceneInitialized = true;
  }

  genHeatMapData(readings, canvasWidth, canvasHeight, arrayWidth, arrayHeight): any[] {

    let currentReading = 0;
    let returnArray = [];

    const heightIncrement = (canvasHeight / arrayHeight) - (canvasHeight * 0.1);
    const widthIncrement = (canvasWidth / arrayWidth) - (canvasWidth * 0.1);

    for ( let y = 1; y <= arrayHeight; y++) {
      for ( let x = 1; x <= arrayHeight; x++) {
        let dataReading = [];
        dataReading.push(x * widthIncrement);
        dataReading.push(y * heightIncrement);
        dataReading.push(readings[currentReading]);

        returnArray.push(dataReading);

        currentReading++;
      }
    }
    return returnArray;
  }

  render() {

    const self: ThreedvisComponent = this;

    (function render() {
      requestAnimationFrame(render);
      self.renderer.render(self.scene, self.camera);
    }());
  }
}
