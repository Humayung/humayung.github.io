let loc = {
	iteration: 256,
	zoom: 1,
	x : 0,
	y : 0,
  blockSize : 1
};

let fixedLoc = {
	iteration: 256,
	zoom: 1,
	x : 0,
  y : 0
};

let tLoc = {
	iteration: 256,
	zoom: 1,
	x : 0,
  y : 0,
  blockSize : 1
};

let mouse = {
	px: 0,
	py: 0,
	x: 0,
	y: 0
};

let step = 1;
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let dragging = false;
let mandel = Array();
canvas.width = 800;
canvas.height = 600;


function populateLocationsDropdown() {
	let select = document.getElementById('locations');
	select.addEventListener(
		'change',
		(event) => {
			jumpTo(event.target.value);
		},
		false
	);
	for (let key in locations) {
		let opt = document.createElement('option');
		opt.value = key;
		opt.innerHTML = locations[key].name;
		select.appendChild(opt);
	}
}

function jumpTo(value) {
	setLocation(value);
}

function mouseMove(event) {
	mouse.x = event.screenX;
	mouse.y = event.screenY;
	if (dragging) {
		let dx = mouse.px - mouse.x;
		let dy = mouse.py - mouse.y;

		tLoc.x = fixedLoc.x - dx;
		tLoc.y = fixedLoc.y - dy;
	}
  
  // console.log(getComplexMousePoint());
}



function getComplexMousePoint(){
  let startRe = loc.re - step * canvas.width / 2;
  let startIm = loc.im - step * canvas.height / 2
  let endRe = loc.re + step * canvas.width / 2;
  let endIm = loc.im + step * canvas.height / 2
  let pointRe = scaleTo(mouse.x, 0, canvas.width, startRe, endRe);
  let pointIm = scaleTo(mouse.y, 0, canvas.width, startIm, endIm);
  return {pointRe : pointRe, pointIm : pointIm};
}

function mouseUp(event) {
	dragging = false;
	updateFixedLoc();
}

function mouseDown(event) {
	dragging = true;
	mouse.px = event.screenX;
	mouse.py = event.screenY;
}

function updateFixedLoc() {
	fixedLoc = jsonCopy(tLoc);
}

function mouseWheel(event) {
	let direction = event.deltaY > 0 ? -1 : 1;
	tLoc.zoom *= 1 + direction * 0.1;
}
function setLocation(locationName) {
  let selected = locations[locationName];
	tLoc.iteration = selected.iteration;
	tLoc.zoom = selected.zoom;
  tLoc.blockSize = selected.blockSize;
	tLoc.x = -selected.re * selected.zoom + canvas.width/2;
	tLoc.y = -selected.im * selected.zoom + canvas.height/2;
  console.log(tLoc);
	updateFixedLoc();
}

function setup() {
	setLocation('home');
	populateLocationsDropdown();
	frameRate(60);
}

let prevPixels = []
function draw() {
	let imgData = loadImageData(canvas, 1);
	let pixels = imgData.data;
  let blockSize = 1;
  console.log(frameRate())
  let mandel = mandelCompute(imgData.width, imgData.height, blockSize);

	for (let py = 0; py < imgData.height; py+=blockSize) {
		for (let px = 0; px < imgData.width; px+=blockSize) {
			let index = (px + py * imgData.width);
			let iteration = mandel[index]
			let color = scaleTo(loc.iteration - iteration, 0, loc.iteration, 0, 256);
      if (prevPixels){
        let pixelPos1 = ((px + blockSize) + (py) * imgData.width) << 2;
        let pixelPos2 = ((px + blockSize) + (py + blockSize) * imgData.width) << 2;
        let pixelPos3 = ((px + blockSize) + (py - blockSize) * imgData.width) << 2;
        let pixelPos4 = ((px) + (py + blockSize) * imgData.width) << 2;
        let pixelPos5 = ((px) + (py - blockSize) * imgData.width) << 2;
        let pixelPos6 = ((px - blockSize) + (py) * imgData.width) << 2;
        let pixelPos7 = ((px - blockSize) + (py + blockSize) * imgData.width) << 2;
        let pixelPos8 = ((px - blockSize) + (py - blockSize) * imgData.width) << 2;

        let sum = prevPixels[pixelPos1] + prevPixels[pixelPos2] + prevPixels[pixelPos3] + prevPixels[pixelPos4] + prevPixels[pixelPos5] + prevPixels[pixelPos6] + prevPixels[pixelPos7] + prevPixels[pixelPos8]
        // color = parseInt(sum/8);
      }
      for (let j = 0; j < blockSize; j++) {
        // let yOffset = (py + j) * imgData.width;
        for (let i = 0; i < blockSize; i++) {
            // pixelPos = ((x + i) + yOffset) << 2;
            let pixelPos = ((px + i) + (py + j) * imgData.width) << 2;
            
            pixels[pixelPos] = color;
            pixels[++pixelPos] = color;
            pixels[++pixelPos] = color;
            pixels[++pixelPos] = 255;
        }
      }
		}
	}
  prevPixels = imgData.data;
  console.log(prevPixels)
	updateImageData(canvas, imgData);
	animate(loc, tLoc, 0.1);
  ctx.beginPath();
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.stroke();
}

function mandelCompute(width, height, blockSize){
  for (let y = 0; y < height; y+= blockSize) {
    let im = (y - loc.y) / loc.zoom;
		for (let x = 0; x < width; x+= blockSize) {
      let re = (x - loc.x) / loc.zoom;
      let iteration = mandelbrot(re, im);
      mandel[x + y * width] = iteration;
		}
	}
  return mandel;
}

function mandelbrot(re, im) {
	let iteration = loc.iteration;
	let x = 0;
	let y = 0;
	let xTemp;
  if ((re > -0.5) && (re < 0.25) && (im > -0.5) && (im < 0.5)){
    return loc.iteration;
  }
	while (x*x + y*y < 2 * 2 && iteration--) {
		xTemp = x*x - y*y + re;
		y = 2*x*y + im;
		x = xTemp;
	}
	return loc.iteration - iteration;
}
