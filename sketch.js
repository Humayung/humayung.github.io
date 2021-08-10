
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

function setup() {
  createCanvas(448, 256);
  pixelDensity(1);
  screenRatio = height/width;
  stroke(255);
  fill(255, 50, 0);
  textAlign(CENTER, CENTER);
  mandelBrot();

  inputMaxX = document.getElementById('maxX');
  inputMaxY = document.getElementById('maxY');
  inputMinX = document.getElementById('minX');
  inputMinY = document.getElementById('minY');
  parameter = document.getElementById('parameter');
  inputMaxIter = document.getElementById('maxIter');
  
  pointZoomRange = document.getElementById('pointZoomAmt');
  error = document.getElementById('error');
  
  inputMaxIter.value = maxIter;
  updateInfo();
  document.getElementById('upload').addEventListener('change', handleFileSelect, false);
  inputMaxIter.addEventListener('input', setMaxIter);
  inputMaxIter.addEventListener('propertychange', setMaxIter);
  pointZoomRange.addEventListener('change', setPointZoomAmt);
}

function draw() {
  mandelBrot();
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
    updateInfo();
    updateCurrentpos();
    error.style.display = 'none';
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
  minXd = map(mouseX, 0, width, 0, tMaxX - tMinX);
  minYd = map(mouseY, 0, height, 0, tMaxY - tMinY);
  maxXd = map(width - mouseX, 0, width, 0, tMaxX - tMinX);
  maxYd = map(height - mouseY, 0, height, 0, tMaxY - tMinY);
  
  polar = isZoomOut ? -1 : 1;
  tMinX += pointZoomAmt * minXd * polar; 
  tMinY += pointZoomAmt * minYd * polar; 
  tMaxX -= pointZoomAmt * maxXd * polar;  
  tMaxY -= pointZoomAmt * maxYd * polar; 
  // updateCurrentpos();
}

function mouseDragged() {
  rectW = mouseX - rectX;
  rectH = rectW * screenRatio;

  //   stroke(255);
  //   line(pMouseX, pMouseY, mouseX, mouseY);
  // }
}

function mouseReleased() {
  if (mouseButton === LEFT && rectW * rectH > 0 && keyCode == ALT) {
    rectZoom();
  }

  if (dragging && !selectingRect){
    updateCurrentpos();
  }
  selectingRect = false;
  dragging = false;
}

function updateCurrentpos(){
  currentPos = {'minX' : parseFloat(tMinX), 'minY' : parseFloat(tMinY), 'maxX' : parseFloat(tMaxX), 'maxY' : parseFloat(tMaxY)};
}

function rectZoom(){
  zooms.push({
    'minX' : tMinX, 
    'minY' : tMinY, 
    'maxX' : tMaxX, 
    'maxY' : tMaxY
  });
  newMinX = map(rectX, 0, width, minX, maxX);
  newMaxX = map(rectX + rectW, 0, width, minX, maxX);
  newMinY = map(rectY, 0, height, minY, maxY);
  newMaxY = map(rectY + rectH, 0, height, minY, maxY);
  tMinX = newMinX;
  tMaxX = newMaxX;
  tMinY = newMinY;
  tMaxY = newMaxY;
  updateCurrentpos();
  updateInfo();
  mandelBrot();
}

function drag(){
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
  updateInfo();
  // print(`ScaledDx ${scaledDx} ScaledDx ${scaledDy}`);
}

function direction(a){
  return a/abs(a) || 0;
}

function keyPressed(){
  if (key == ' ' && zooms.length > 0) {
    z = zooms.pop();
    tMinX = z.minX;
    tMinY = z.minY;
    tMaxX = z.maxX;
    tMaxY = z.maxY;
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
  let gap = 0.01 * (currentPos.minX - minX);
  minX = lerp(minX, tMinX, amt);
  minY = lerp(minY, tMinY, amt);
  maxX = lerp(maxX, tMaxX, amt);
  maxY = lerp(maxY, tMaxY, amt);
}

function selectRect() {
  fill(255, 50);
  stroke(255);
  rect(rectX, rectY, rectW, rectH);
  
}

let timeMean = [];
async function mandelBrot() {
  loadPixels();
  generatePixels(width, height, pixels);
  updatePixels();

}

function generatePixels(width, height, pixels){
  let x0, y0, x, y, iteration, progress = 0, maxProgress = width * height;
  for (let px = 0; px < width; px++) {
    for (let py = 0; py < height; py++) {
      x0 = map(px, 0, width, minX, maxX);
      y0 = map(py, 0, height, minY, maxY);
      x = 0;
      y = 0;
      iteration = maxIter;
      let xTemp;

      while (x < 2 && iteration--) {
        //xTemp = x*x*x - 3 * x*y*y + x0;
        xTemp = x*x - y*y + x0;
        y = 3*x*y + y0;
        //y = 3 * x*x*y - y*y*y + y0;
        x = xTemp;
      }

      iteration = maxIter - iteration;
     
      pix = (px + py * width) * 4;
      if (iteration < maxIter) {
        pixels[pix + 0] = 0;
        pixels[pix + 1] = iteration;
        pixels[pix + 2] = iteration;
        pixels[pix + 3] = 255;
      } else {
        pixels[pix + 0] = 0;
        pixels[pix + 1] = 255;
        pixels[pix + 2] = 255;
        pixels[pix + 3] = 255;
      }
    }
   progress += height;
    // if(progress % (height * 50) == 0 || progress == maxProgress){
    //   console.log(progress/maxProgress)
    // }
  }
  
}
