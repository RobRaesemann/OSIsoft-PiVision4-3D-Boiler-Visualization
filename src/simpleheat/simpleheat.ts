/*
This file is the SimpleHeat project converted to Typescript

https://github.com/mourner/simpleheat

*/

export default class SimpleHeat {

    canvas: any;
    ctx: any;
    private width: number;
    private height: number;
    private max = 100;
    private min = 0;
    public data: any[];
    private r: number;
    private circle: any;
    private defaultRadius = 25;
    private defaultBlur = .4;
    private defaultGradient = {
      0.4: 'blue',
      0.6: 'cyan',
      0.7: 'lime',
      0.8: 'yellow',
      1.0: 'red'
    };
    private grad: any;

    constructor(canvas) {

      this.canvas = canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;
      this.ctx = canvas.getContext('2d');
      this.width = canvas.width;
      this.height = canvas.height;
      this.max = 1;
      this.data = [];
    }

    public add(point) {
      this.data.push(point);
    }

    public clear() {
      this.data = [];
    }

    public resize() {
      this.width = this.canvas.width;
      this.height = this.canvas.height;
    }

    public setMax(max: number) {
      this.max = max;
    }

    public setMin(min: number) {
      this.min = min;
    }

    public radius(r: number, blur: number): void {
      blur = blur === undefined ? 15 : blur;

      // create a grayscale blurred circle image that we'll use for drawing points
      const circle = this.circle = this.createCanvas(),
          ctx = circle.getContext('2d'),
          r2 = this.r = r + blur;

      circle.width = circle.height = r2 * 2;

      ctx.shadowOffsetX = ctx.shadowOffsetY = r2 * 2;
      ctx.shadowBlur = blur;
      ctx.shadowColor = 'black';

      ctx.beginPath();
      ctx.arc(-r2, -r2, r, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
    }

    public gradient(grad: {}): void {
      // create a 256x1 gradient that we'll use to turn a grayscale heatmap into a colored one
      const canvas = this.createCanvas();
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 256);

      canvas.width = 1;
      canvas.height = 256;

      // tslint:disable-next-line:forin
      for (let i in grad) {
        gradient.addColorStop(+i, grad[i]);
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1, 256);

      this.grad = ctx.getImageData(0, 0, 1, 256).data;
    }

    public draw(minOpacity: number): void {
      if (!this.circle) {
        this.radius(this.defaultRadius, this.defaultBlur);
      }
      if (!this.grad) {
        this.gradient(this.defaultGradient);
      }

      const ctx = this.ctx;

      ctx.clearRect(0, 0, this.width, this.height);

      // draw a grayscale heatmap by putting a blurred circle at each data point
      for (let i = 0, len = this.data.length, p; i < len; i++) {
        const point = this.data[i];
        ctx.globalAlpha = Math.min(Math.max(point[2] / this.max, minOpacity === undefined ? 0.05 : minOpacity), 1);
        ctx.drawImage(this.circle, point[0] - this.r, point[1] - this.r);
      }

      // colorize the heatmap, using opacity value of each pixel to get the right color from our gradient
      const colored = ctx.getImageData(0, 0, this.width, this.height);
      this.colorize(colored.data, this.grad);
      ctx.putImageData(colored, 0, 0);
    }

    public colorize(pixels, gradient) {
      for (let i = 0, len = pixels.length, j; i < len; i += 4) {
        j = pixels[i + 3] * 4; // get gradient color from opacity value

        if (j) {
            pixels[i] = gradient[j];
            pixels[i + 1] = gradient[j + 1];
            pixels[i + 2] = gradient[j + 2];
        }
      }
    }

    private createCanvas(): any {
      if (typeof document !== 'undefined') {
        return document.createElement('canvas');
      } else {
        // create a new canvas instance in node.js
        // the canvas class needs to have a default constructor without any parameter
        return new this.canvas.constructor();
      }
    }
  }
