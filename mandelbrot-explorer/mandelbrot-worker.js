// Create a new file called mandelbrot-worker.js with this content:
self.onmessage = function(e) {
  try {
    const { width, height, minX, maxX, minY, maxY, maxIter, modifier, renderQuality } = e.data;
    const pixels = new Uint8ClampedArray(width * height * 4);
    
    for (let px = 0; px < width; px += renderQuality) {
      for (let py = 0; py < height; py += renderQuality) {
        const x0 = map(px, 0, width, minX, maxX);
        const y0 = map(py, 0, height, minY, maxY);
        let x = 0;
        let y = 0;
        let iteration = maxIter;
        
        let x2 = 0, y2 = 0;
        while (x2 + y2 <= 4 && iteration--) {
          x2 = x * x;
          y2 = y * y;
          const xTemp = x2 - y2 + x0;
          y = modifier * x * y + y0;
          x = xTemp;
        }
        
        iteration = maxIter - iteration;
        
        for (let fillX = 0; fillX < renderQuality && px + fillX < width; fillX++) {
          for (let fillY = 0; fillY < renderQuality && py + fillY < height; fillY++) {
            const pix = ((px + fillX) + (py + fillY) * width) * 4;
            pixels[pix + 0] = 0;
            pixels[pix + 1] = iteration;
            pixels[pix + 2] = iteration;
            pixels[pix + 3] = 255;
          }
        }
      }
    }
    
    self.postMessage({ pixels }, [pixels.buffer]);
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};

self.map = function(value, start1, stop1, start2, stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
};