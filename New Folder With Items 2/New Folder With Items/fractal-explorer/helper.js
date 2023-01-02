const locations = {
	home: {
		name: 'Home',
		iteration: 256,
		zoom: 200,
		re: -0.5,
		im: 0,
    blockSize : 1
	},

  home2: {
		name: 'Home2',
		iteration: 256,
		zoom: 200,
		re: -0.5,
		im: 0,
    blockSize : 10
	},
	julia: {
		name: 'Julia Island',
		iteration: 500,
		zoom: 785714676,
		re: -1.768778833,
		im: -0.001738913
	},

	satellite: {
		name: 'Satellite',
		iteration: 500,
		zoom: 7502494.442311305,
		re: -0.743904874255535,
		im: -0.1317119067802009
	},

	tendrils: {
		name: 'Tendrils',
		iteration: 256,
		zoom: 743786806,
		re: -0.226266648,
		im: 1.11617444
	},

	fern: {
		name: 'Fern',
		iteration: 256,
		zoom: 119247,
		re: -0.8839127363543506,
		im: -0.07584296980763892
	}
};


let lastCalledTime = 0;
let delay = 1000/60; 
const frameRate = (fps) => {
  if (fps){
    delay = 1000/fps;
  }else{
    if(!lastCalledTime) {
      lastCalledTime = performance.now();
      return 1;
    }
    delta = (performance.now() - lastCalledTime)/1000;
    lastCalledTime = performance.now();
    return 1/delta;
  }
};

const loadImageData = (canvas, multiplier) => {
  let ctx = canvas.getContext('2d');
  let imgData = ctx.createImageData(canvas.width * multiplier, canvas.height * multiplier);
  return imgData;
};

const jsonCopy = (src) => {
  return JSON.parse(JSON.stringify(src));
}

const updateImageData = (canvas, imgData) => {
  let ctx = canvas.getContext('2d');
  ctx.putImageData(imgData, 1, 1);
};


const scaleTo = (val, fl, fh, tl, th) => {
  return (val / (fh - fl)) * (th - tl) + tl
}

// const interpolate = (from, to, amt) => {

//   return (to - from) * amt + from
// }

const interpolate = (v0, v1, t) => {
  return (1 - t) * v0 + t * v1;
}

const animate = (loc, tLoc, amt) => {
  loc.iteration = tLoc.iteration;
  loc.zoom = interpolate(loc.zoom, tLoc.zoom, amt);
  loc.y = interpolate(loc.y, tLoc.y, amt);
  loc.x = interpolate(loc.x, tLoc.x, amt);
  loc.blockSize = interpolate(loc.blockSize, tLoc.blockSize, amt);
}
canvas.addEventListener('wheel',function(event){
  mouseWheel(event);
  event.preventDefault();
  return false; 
}, false);

canvas.addEventListener('mousedown',function(event){
  mouseDown(event);
}, false);

canvas.addEventListener('mouseup',function(event){
  mouseUp(event);
}, false);

canvas.addEventListener('mousemove',function(event){
  mouseMove(event);
}, false);

setup();
let dTime = 0;
let sum = 0;
let count = 0;
const id = setInterval(() => {
  let startTime = performance.now();
  draw();
  sum += performance.now() - startTime;
  count++;
  // console.log(sum/count);
}, delay);

