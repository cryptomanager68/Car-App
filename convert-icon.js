/**
 * Converts download.jfif → download.ico using jpeg-js + pngjs + png-to-ico
 */
const fs = require('fs');
const path = require('path');
const jpegJs = require('jpeg-js');
const { PNG } = require('pngjs');
const { default: pngToIco } = require('png-to-ico');

const jfifPath = path.join(__dirname, 'download.jfif');
const pngPath  = path.join(__dirname, 'download.png');
const icoPath  = path.join(__dirname, 'download.ico');

// 1. Decode JPEG/JFIF
const jpegData = fs.readFileSync(jfifPath);
const decoded  = jpegJs.decode(jpegData, { useTArray: true });

// 2. Resize to 256x256 via nearest-neighbour and encode as PNG
const TARGET = 256;
const png = new PNG({ width: TARGET, height: TARGET });
const srcW = decoded.width;
const srcH = decoded.height;

for (let y = 0; y < TARGET; y++) {
  for (let x = 0; x < TARGET; x++) {
    const sx = Math.floor(x * srcW / TARGET);
    const sy = Math.floor(y * srcH / TARGET);
    const si = (sy * srcW + sx) * 4;
    const di = (y  * TARGET + x) * 4;
    png.data[di]     = decoded.data[si];
    png.data[di + 1] = decoded.data[si + 1];
    png.data[di + 2] = decoded.data[si + 2];
    png.data[di + 3] = 255;
  }
}

const pngBuf = PNG.sync.write(png);
fs.writeFileSync(pngPath, pngBuf);
console.log('PNG written:', pngPath);

// 3. Convert PNG → ICO
pngToIco(pngPath)
  .then(icoBuffer => {
    fs.writeFileSync(icoPath, icoBuffer);
    console.log('ICO written:', icoPath, `(${(icoBuffer.length/1024).toFixed(1)} KB)`);
    fs.unlinkSync(pngPath); // clean up temp png
  })
  .catch(err => { console.error('ICO conversion failed:', err); process.exit(1); });
