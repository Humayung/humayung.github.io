let minX = -2.5, maxX = 1, minY = -1, maxY = 1;
let tMinX = minX, tMaxX = maxX, tMinY = minY, tMaxY = maxY;
let maxIter = 255;
let selectingRect = false;
let dragging = false;
let zooms = [];
let rectX=0, rectY=0, rectW=0, rectH=0;
let infoLocation;
let doPointZoom = false, isZoomOut = false;
let inputMaxX, inputMinX, inputMaxY, inputMinY, inputMaxIter, pointZoomAmt = 0.01;
let currentPos = {'minX' : tMinX, 'minY' : tMinY, 'maxX' : tMaxX, 'maxY' : tMaxY};
let modifiedFormula = true;
let modifier = 3;
let tModifier = 3;
let drawing = true;
let renderQuality = 1;
let worker = null;
let isCalculating = false;
let pendingRender = false;
let useWorker = true; // Toggle for testing
let performanceStats = {
  workerTimes: [],
  nonWorkerTimes: [],
  lastRenderTime: 0
};
let SIDE_PANEL_WIDTH = 300; // Width of the side panel
const ASPECT_RATIO = 16/9; // or you can use 4/3 if you prefer
let screenRatio;

function setup() {
  // Calculate available space
  canvasWidth = windowWidth - SIDE_PANEL_WIDTH - 20;
  canvasHeight = windowHeight - 20;
  
  createCanvas(Math.floor(canvasWidth), Math.floor(canvasHeight));
  pixelDensity(1);
  
  // Calculate the view bounds based on the aspect ratio
  // This ensures the scale remains constant regardless of window size
  let baseWidth = maxX - minX;  // Current view width (-2.5 to 1 = 3.5)
  let baseHeight = maxY - minY;  // Current view height (-1 to 1 = 2)
  let currentRatio = canvasWidth / canvasHeight;
  
  // Adjust the view bounds to match canvas ratio while keeping scale
  if (currentRatio > baseWidth/baseHeight) {
    // Window is wider - adjust X bounds
    let newWidth = baseHeight * currentRatio;
    let centerX = (minX + maxX) / 2;
    minX = centerX - newWidth/2;
    maxX = centerX + newWidth/2;
  } else {
    // Window is taller - adjust Y bounds
    let newHeight = baseWidth / currentRatio;
    let centerY = (minY + maxY) / 2;
    minY = centerY - newHeight/2;
    maxY = centerY + newHeight/2;
  }
  
  // Update target bounds too
  tMinX = minX;
  tMaxX = maxX;
  tMinY = minY;
  tMaxY = maxY;
  
  stroke(255);
  fill(255, 50, 0);
  textAlign(CENTER, CENTER);
  
  screenRatio = height/width;
  
  // Initialize worker with proper error handling
  try {
    worker = new Worker('mandelbrot-worker.js');
    worker.onmessage = function(e) {
      loadPixels();
      pixels.set(new Uint8ClampedArray(e.data.pixels));
      updatePixels();
      isCalculating = false;
      
      const renderTime = performance.now() - performanceStats.lastRenderTime;
      updatePerformanceStats(renderTime, true);
      
      // Handle any pending render
      if (pendingRender) {
        pendingRender = false;
        mandelBrot();
      }
    };
  } catch (e) {
    console.error("Worker failed to initialize:", e);
    // Fallback to non-worker version if worker fails
    worker = null;
  }

  // Initial render
  mandelBrot();

  inputMaxX = document.getElementById('maxX');
  inputMaxY = document.getElementById('maxY');
  inputMinX = document.getElementById('minX');
  inputMinY = document.getElementById('minY');
  parameter = document.getElementById('parameter');
  inputMaxIter = document.getElementById('maxIter');
  
  pointZoomRange = document.getElementById('pointZoomAmt');
  error = document.getElementById('error');
  generating = document.getElementById('generating');
  resolutionOption = document.getElementById('res');
  resolution = document.getElementById('resolution');
  
  document.getElementById('toggleFormula').addEventListener('change', toggleFormula, false);
  inputMaxIter.value = maxIter;
  updateInfo();
  document.getElementById('upload').addEventListener('change', handleFileSelect, false);
  inputMaxIter.addEventListener('input', setMaxIter);
  inputMaxIter.addEventListener('propertychange', setMaxIter);
  pointZoomRange.addEventListener('change', setPointZoomAmt);
}

function toggleFormula(){
  modifiedFormula = !modifiedFormula;
  tModifier = 2 + modifiedFormula;
}

function draw() {
  if (drawing && !isCalculating) {
    mandelBrot();
  }
  if (isValidCoord()){
    if(doPointZoom){
      pointZoom();
    }else{
      if (selectingRect) {
        selectRect();
      }else if (dragging){
        drag();
      }
    }
  }
  animate();
}

function toggleSave(){
  resolutionOption.style.display = 'block';
}

function saveToImage(){
  // generatePixels();
  generating.style.display = "block";
  setTimeout(startSaving, 1000);
}

function startSaving(){
  let multiplier = resolution.selectedIndex + 1;
  var c = document.getElementById("myCanvas");
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  var imgWidth = width * multiplier * 10;
  var imgHeigth = height * multiplier * 10
  c.width = imgWidth;
  c.height = imgHeigth;
  var imgData = ctx.createImageData(c.width, c.height);
  generatePixels(c.width, c.height, imgData.data);
  ctx.putImageData(imgData, 10, 10);
  
  var dataURL = c.toDataURL("image/png");
  var newTab = window.open('about:blank','image from canvas');
  
  
  newTab.document.write("<img src='" + dataURL + "' alt='from canvas'/>");
  generating.style.display = 'none';
  resolutionOption.style.display = 'none';

}

function isValidCoord(){
  return mouseX < width && mouseY < height && mouseX > 0 && mouseY > 0; 
}

function setPointZoomAmt(){
  
  pointZoomAmt = map(pointZoomRange.value, 0, 100, 0.001, 0.05);
}


const downloadToFile = (content, filename, contentType) => {
  const a = document.createElement('a');
  const file = new Blob([content], {type: contentType});
  a.href= URL.createObjectURL(file);
  a.download = filename;
  a.click();

	URL.revokeObjectURL(a.href);
};

function saveParameter(){
  const data = {
    'minX' : tMinX,
    'minY' : tMinY,
    'maxX' : tMaxX,
    'maxY' : tMaxY
  }
  downloadToFile(JSON.stringify(data), 'parameter.json', 'text/plain');
}



function handleFileSelect(evt) {
  var files = evt.target.files;
  f = files[0];
  var reader = new FileReader();  
  reader.onload = (function(theFile) {
      return function(e) {
        loadData(e.target.result);
      };
    })(f);
    reader.readAsText(f);
}


function loadData(data){
  try{
    data = JSON.parse(data);
    tMinY = data.minY;
    tMaxY = data.maxY;
    tMinX = data.minX;
    tMaxX = data.maxX;
    
    // Set current bounds to target bounds
    minX = tMinX;
    maxX = tMaxX;
    minY = tMinY;
    maxY = tMaxY;
    
    // Adjust bounds to maintain correct scaling
    adjustViewBounds();
    
    updateInfo();
    updateCurrentpos();
    error.style.display = 'none';
    
    // Reset worker state
    isCalculating = false;
    pendingRender = false;
    
    // Force new render
    mandelBrot();
  }catch(e){
    error.style.display = 'block';
  }
  
}


function resetLocation(){
  tMinX = -2.5;
  tMaxX = 1;
  tMinY = -1;
  tMaxY = 1;
  updateInfo();
}

function setMaxIter(e){
  maxIter = e.target.value;
}

function demo(n){
  if (n == 1){
    loadData('{"minX":"-0.9382322492310408","minY":"-0.10144867274785412","maxX":"-0.9382285561774096","maxY":"-0.1014456926055355"}');
  }else if (n == 2){
    loadData('{"minX":"-0.8870122244103785","minY":"-0.07795486870677842","maxX":"-0.8824093762479188","maxY":"-0.07582173384850426"}');
  }
}

function setLocation(){
  if (parameter.value == ""){
    tMinX = inputMinX.value;
    tMaxX = inputMaxX.value;
    tMinY = inputMinY.value;
    tMaxY = inputMaxY.value;
    error.style.display = 'none';
  } else {
    loadData(parameter.value);
  }
}

function updateInfo(){
  inputMinX.value = tMinX;
  inputMinY.value = tMinY;
  inputMaxX.value = tMaxX;
  inputMaxY.value = tMaxY;

}
  
let pMouseX;
let pMouseY;
function mousePressed() {
  pMouseX = mouseX;
  pMouseY = mouseY;
  if (mouseButton == LEFT) {
    if (keyCode == ALT){
      rectX = mouseX;
      rectY = mouseY;
      rectW = 0;
      rectH = 0;
      selectingRect = true;
    }else{
      dragging = true;
    }
  }
  
}

async function pointZoom(){
  renderQuality = 4;
  minXd = map(mouseX, 0, width, 0, tMaxX - tMinX);
  minYd = map(mouseY, 0, height, 0, tMaxY - tMinY);
  maxXd = map(width - mouseX, 0, width, 0, tMaxX - tMinX);
  maxYd = map(height - mouseY, 0, height, 0, tMaxY - tMinY);
  
  polar = isZoomOut ? -1 : 1;
  tMinX += pointZoomAmt * minXd * polar; 
  tMinY += pointZoomAmt * minYd * polar; 
  tMaxX -= pointZoomAmt * maxXd * polar;  
  tMaxY -= pointZoomAmt * maxYd * polar;

  // Set current bounds to target bounds
  minX = tMinX;
  maxX = tMaxX;
  minY = tMinY;
  maxY = tMaxY;
  
  // Adjust bounds to maintain correct scaling
  adjustViewBounds();
}

function mouseDragged() {
  if (selectingRect) {
    rectW = mouseX - rectX;
    rectH = rectW * screenRatio;
  }
}

function mouseReleased() {
  if (mouseButton === LEFT && rectW * rectH > 0 && keyCode == ALT) {
    rectZoom();
  }

  if (dragging && !selectingRect) {
    updateCurrentpos();
    renderQuality = 1;
    mandelBrot();
  }
  selectingRect = false;
  dragging = false;
}

function updateCurrentpos(){
  currentPos = {'minX' : parseFloat(tMinX), 'minY' : parseFloat(tMinY), 'maxX' : parseFloat(tMaxX), 'maxY' : parseFloat(tMaxY)};
}

function rectZoom(){
  zooms.push({
    'minX': minX,
    'minY': minY,
    'maxX': maxX,
    'maxY': maxY
  });

  newMinX = map(rectX, 0, width, minX, maxX);
  newMaxX = map(rectX + rectW, 0, width, minX, maxX);
  newMinY = map(rectY, 0, height, minY, maxY);
  newMaxY = map(rectY + rectH, 0, height, minY, maxY);

  minX = newMinX;
  maxX = newMaxX;
  minY = newMinY;
  maxY = newMaxY;

  // Adjust bounds to maintain correct scaling
  adjustViewBounds();
  
  updateCurrentpos();
  updateInfo();
  mandelBrot();
}

function drag(){
  renderQuality = 4;
  let dx = pMouseX - mouseX;
  let dy = pMouseY - mouseY;
  scaledDx = map(dx, 0, width, 0, tMaxX - tMinX) || 0;
  scaledDy = map(dy, 0, height, 0, tMaxY - tMinY) || 0;

  scaledDx = abs(scaledDx) * direction(dx);
  scaledDy = abs(scaledDy) * direction(dy);  
  
  tMinX = currentPos.minX + scaledDx;
  tMaxX = currentPos.maxX + scaledDx;
  tMinY = currentPos.minY + scaledDy;
  tMaxY = currentPos.maxY + scaledDy;

  // Set current bounds to target bounds
  minX = tMinX;
  maxX = tMaxX;
  minY = tMinY;
  maxY = tMaxY;
  
  // Adjust bounds to maintain correct scaling
  adjustViewBounds();
  
  updateInfo();
}

function direction(a){
  return a/abs(a) || 0;
}

function keyPressed(){
  if (key == ' ' && zooms.length > 0) {
    z = zooms.pop();
    tMinX = z.minX;
    tMaxX = z.maxX;
    tMinY = z.minY;
    tMaxY = z.maxY;
    
    // Set current bounds to target bounds
    minX = tMinX;
    maxX = tMaxX;
    minY = tMinY;
    maxY = tMaxY;
    
    // Adjust bounds to maintain correct scaling
    adjustViewBounds();
    
    updateCurrentpos();
    updateInfo();
    mandelBrot();
  }

  if (key == 'z'){
    doPointZoom = !doPointZoom;
    updateCurrentpos();
  }
  if (key == 'x'){
    isZoomOut = !isZoomOut;
  }
}

function keyReleased(){
  keyCode = -1;  
}

function animate(){
  amt = 0.3;
  minX = lerp(minX, tMinX, amt);
  minY = lerp(minY, tMinY, amt);
  maxX = lerp(maxX, tMaxX, amt);
  maxY = lerp(maxY, tMaxY, amt);
  modifier = lerp(modifier, tModifier, amt);
}

function selectRect() {
  fill(255, 50);
  stroke(255);
  rect(rectX, rectY, rectW, rectH);
  
}

function mandelBrot() {
  const startTime = performance.now();
  
  if (!useWorker || !worker) {
    // Non-worker implementation
    loadPixels();
    generatePixels(width, height, pixels);
    updatePixels();
    const renderTime = performance.now() - startTime;
    updatePerformanceStats(renderTime, false);
    return;
  }

  if (isCalculating) {
    pendingRender = true;
    return;
  }

  isCalculating = true;
  performanceStats.lastRenderTime = startTime;
  worker.postMessage({
    width,
    height,
    minX,
    maxX,
    minY,
    maxY,
    maxIter,
    modifier,
    renderQuality
  });
}

// Keep the original generatePixels as fallback
function generatePixels(width, height, outPixels) {
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
          outPixels[pix + 0] = 0;
          outPixels[pix + 1] = iteration;
          outPixels[pix + 2] = iteration;
          outPixels[pix + 3] = 255;
        }
      }
    }
  }
}

// Add debounced full quality render
let renderTimeout;
function scheduleFullQualityRender() {
  clearTimeout(renderTimeout);
  renderTimeout = setTimeout(() => {
    renderQuality = 1;
    mandelBrot();
  }, 150);
}

function toggleWorker() {
  useWorker = !useWorker;
  performanceStats.workerTimes = [];
  performanceStats.nonWorkerTimes = [];
  document.getElementById('workerStatus').textContent = useWorker ? 'ON' : 'OFF';
  console.log(`Using ${useWorker ? 'Worker' : 'Non-Worker'} implementation`);
}

function updatePerformanceStats(renderTime, isWorker) {
  const times = isWorker ? performanceStats.workerTimes : performanceStats.nonWorkerTimes;
  times.push(renderTime);
  
  // Keep only last 10 measurements
  if (times.length > 10) times.shift();
  
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  
  document.getElementById('perfStats').innerHTML = `
    <div style="margin-top: 10px;">
        <div>Mode: ${useWorker ? 'Worker' : 'Non-Worker'}</div>
        <div>Last Render: ${renderTime.toFixed(1)}ms</div>
        <div>Avg (last 10): ${avg.toFixed(1)}ms</div>
        <div>Worker Avg: ${getAverage(performanceStats.workerTimes).toFixed(1)}ms</div>
        <div>Non-Worker Avg: ${getAverage(performanceStats.nonWorkerTimes).toFixed(1)}ms</div>
    </div>
  `;
}

function getAverage(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

// Add this function to test heavy workloads
function stressTest() {
  maxIter = 1000; // Increase iteration count
  renderQuality = 1; // Force full quality
  // Zoom into a complex region
  loadData('{"minX":"-0.7436447860,"minY":"0.1318259043","maxX":"-0.7436447859","maxY":"0.1318259044"}');
}

function windowResized() {
  canvasWidth = windowWidth - SIDE_PANEL_WIDTH - 20;
  canvasHeight = windowHeight - 20;
  
  // Store current view center
  let centerX = (minX + maxX) / 2;
  let centerY = (minY + maxY) / 2;
  
  // Calculate scale (how much of the set is visible)
  let scale = (maxX - minX) / canvasWidth; // units per pixel
  
  resizeCanvas(Math.floor(canvasWidth), Math.floor(canvasHeight));
  
  // Adjust bounds to new size while maintaining scale
  let newWidth = canvasWidth * scale;
  let newHeight = canvasHeight * scale;
  
  minX = centerX - newWidth/2;
  maxX = centerX + newWidth/2;
  minY = centerY - newHeight/2;
  maxY = centerY + newHeight/2;
  
  // Update target bounds
  tMinX = minX;
  tMaxX = maxX;
  tMinY = minY;
  tMaxY = maxY;
  
  mandelBrot();
}

// Add this helper function to maintain correct scaling
function adjustViewBounds() {
  let currentRatio = width / height;
  let viewWidth = maxX - minX;
  let viewHeight = maxY - minY;
  let viewRatio = viewWidth / viewHeight;

  if (currentRatio > viewRatio) {
    // Window is wider - adjust X bounds
    let newWidth = viewHeight * currentRatio;
    let centerX = (minX + maxX) / 2;
    minX = centerX - newWidth/2;
    maxX = centerX + newWidth/2;
  } else {
    // Window is taller - adjust Y bounds
    let newHeight = viewWidth / currentRatio;
    let centerY = (minY + maxY) / 2;
    minY = centerY - newHeight/2;
    maxY = centerY + newHeight/2;
  }

  // Update target bounds too
  tMinX = minX;
  tMaxX = maxX;
  tMinY = minY;
  tMaxY = maxY;
}
