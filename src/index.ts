import utils from "./utils";
import Simplex from "./simplex-noise";
import worldTemplates from "./world-templates";

class PlanetTextureGenerator {
  mass: any;
  isGasGiant: boolean;
  withPolarCaps: boolean;
  resolution: number;
  octaves: number;
  falloff: number;
  noiseScale: number;
  colors: any;
  size: number;
  textureData: any;
  bumpTextureData: any;
  simplex: any;

  constructor(
    mass: any,
    isGasGiant: boolean,
    withPolarCaps: boolean,
    resolution: number,
    octaves: number,
    falloff: number
  ) {
    this.mass = mass;
    this.isGasGiant = isGasGiant;
    this.withPolarCaps = withPolarCaps ? withPolarCaps : false;
    this.resolution = resolution;

    this.noiseScale = utils.getRandomFloatInRange(0.0007, 0.007);

    const randomInteger = utils.getRandomInteger(
      0,
      worldTemplates[mass.worldType].length - 1
    );

    this.colors = worldTemplates[mass.worldType][randomInteger].data;

    this.size = this.resolution * this.resolution;

    const numberOfPixels = 4 * this.size;

    this.textureData = new Uint8Array(numberOfPixels);
    this.bumpTextureData = new Uint8Array(numberOfPixels);

    this.simplex = new Simplex(octaves, falloff);

    this.addTerrain();
  }

  getPixelColourFromTemplate(elevation: number, colors: any) {
    const colorsLen = colors.length;

    for (let i = 0; i < colorsLen; i++) {
      if (colors[i] && elevation < colors[i][3]) {
        elevation = utils.clamp(elevation, colors[i][4], 1);

        return [
          colors[i][0] * elevation,
          colors[i][1] * elevation,
          colors[i][2] * elevation,
        ];
      }
    }
  }

  getElevation(i: number): number {
    const fNX = ((i % this.resolution) + 0.5) / this.resolution;
    const fNY = ((i / this.resolution) << (0 + 0.5)) / this.resolution;

    const fRdx = fNX * 2 * Math.PI;
    const fRdy = fNY * Math.PI;

    const fYSin = Math.sin(fRdy + Math.PI);
    const a =
      ((0.5 * this.resolution) / (2 * Math.PI)) * Math.sin(fRdx) * fYSin;
    const b =
      ((0.5 * this.resolution) / (2 * Math.PI)) * Math.cos(fRdx) * fYSin;
    const c = ((0.5 * this.resolution) / (2 * Math.PI)) * Math.cos(fRdy);

    let x, y, z;

    if (!this.isGasGiant) {
      x = 123 + a * this.noiseScale;
      y = 132 + b * this.noiseScale;
      z = 312 + c * this.noiseScale;
    } else {
      x = 123 + c * this.noiseScale;
      y = (132 + b * this.noiseScale) / 30;
      z = (312 + a * this.noiseScale) / 15;
    }

    return this.simplex.generateNoise(x, y, z);
  }

  paintTerrainPixel(data: any, i: number, [r, g, b]: [number, number, number]) {
    data[i * 4] = r * 255;
    data[i * 4 + 1] = g * 255;
    data[i * 4 + 2] = b * 255;
    data[i * 4 + 3] = 0;
  }

  addTerrain() {
    const { bumpTextureData, textureData, resolution } = this;

    for (let i = 0; i < this.size; i++) {
      const elevation = this.getElevation(i);
      const y = i / resolution;

      if (
        (this.withPolarCaps && y * elevation < 200) ||
        (this.withPolarCaps && y > resolution - 900 * elevation)
      ) {
        this.paintTerrainPixel(textureData, i, [1, 1, 1]);
      } else {
        const [r, g, b]: any = this.getPixelColourFromTemplate(
          elevation,
          this.colors
        );

        this.paintTerrainPixel(textureData, i, [r, g, b]);
      }

      this.paintTerrainPixel(bumpTextureData, i, [
        elevation,
        elevation,
        elevation,
      ]);
    }
  }
}

export default PlanetTextureGenerator;
