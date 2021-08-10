var colorsCount = 20;
var colors = [];
var oldColors = [];
var currentColors = [];
var colorPos = 0;

const rgb = (str) =>{
  var s = str.substring(4, str.length - 1)
            .replaceAll(' ', '')
            .split(','); 
  return {
    'r' : s[0],
    'g' : s[1],
    'b' : s[2]
  }
}

const toString = (rgb) =>{
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

const lerp = (from, to, amt) => {
  return parseFloat((to - from) * amt) + parseFloat(from);
}

const lerpColor = (from, to, amt) =>{
  var newR = lerp(from.r, to.r, amt);
  var newG = lerp(from.g, to.g, amt);
  var newB = lerp(from.b, to.b, amt);

  return {
    'r' : newR,
    'g' : newG,
    'b' : newB
  };
}

function getLines(ctx, text, maxWidth) {
  var words = text.split(' ');
  var lines = [];
  var currentLine = words[0];

  for (var i = 1; i < words.length; i++) {
      var word = words[i];
      var width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
          currentLine += " " + word;
      } else {
          lines.push(currentLine);
          currentLine = word;
      }
  }
  lines.push(currentLine);
  return lines;
}

function nextColors(){
  oldColors = colors;
  colors = [];
  for (var i = 0; i < colorsCount; i++){
    colors.push(`rgb(${r()}, ${r()}, ${r()})`);
  }
}
const clear = () => {
  ctx.clearRect(0, 0, c.width, c.height);
}


const interpolateColors = () =>{
  if (colorPos > 1){
    colorPos = 0;
    nextColors();
  }

  // currentColors = colors;
  currentColors = [];
  for (var i = 0; i < colors.length; i++){
      var color = toString(lerpColor(rgb(oldColors[i]), rgb(colors[i]), colorPos));
      currentColors.push(color);
  }
  colorPos += 0.07;
}

const line = (x1, y1, x2, y2) =>{
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}


/////////////////////SETUP
noise.seed(Math.random());
var time = 0;
var c = document.getElementById("myCanvas");
c.addEventListener('click', function() { window.open("fractal.html","_self")}, false);
var ctx = c.getContext("2d");

var angle = 0;

const r = () =>{
  return Math.random() * 200 + 56;
}


nextColors();
oldColors = colors;
interpolateColors();
// console.log(currentColors);
////////////////////SETUP

const draw = () => {
  clear(); 
  angle = noise.simplex2(angle * 0.005, time * 0.005) * Math.PI * 2;
  ctx.canvas.width  = window.innerWidth;
  ctx.canvas.height = window.innerHeight - 20;
  // Create gradient
  var x1 = c.width * Math.cos(angle);  // angle in radians
  var y1 = c.width * Math.sin(angle); 
  var x2 = c.width * Math.cos(angle);  // angle in radians
  var y2 = c.width * Math.sin(angle);  // angle in radians
  var gradient = ctx.createLinearGradient(-x1, -y1, x2, y2);

  
  for (var i = 0; i < colorsCount; i++){
    gradient.addColorStop(i / colorsCount, currentColors[i]);
  }
  var text = "ostrich scan expose grab damp diet angle circle collect visit wheat brief ";
  ctx.lineWidth = (c.width + c.height) * 0.002;
  var fontSize = ((c.width + c.height) * 5) / text.length;
  ctx.font = `${fontSize}px Verdana`;
  
  // Fill with gradient
  ctx.fillStyle = gradient;
  ctx.strokeStyle = gradient;


  var lines = getLines(ctx, text, c.width);
  var marginTop = (c.height - lines.length * fontSize) / 2;
  
  time += 0.05;
  var shakeAmt = 50;
  var rotAmt = 0.1;
  var rotPosAmt = c.width * 0.5;  

  
  for(var i = 0; i < lines.length; i++){
    var x = 0;
    var y = fontSize * (i + 1) + marginTop ;

    // Noise
    var sy = noise.simplex3(y, time * 0.08, x * y) * shakeAmt;
    var sx = noise.simplex3(x, time * 0.08, y) * shakeAmt;
    var sa = noise.simplex2(y, time * rotAmt);
    var saa = noise.simplex2(time * 0.05, y) * rotPosAmt;

    // Text
    ctx.save();
    ctx.textAlign = "center";
    ctx.translate(x + sy + c.width/2 + saa, y + sx);
    ctx.rotate(sa * 0.1);
    ctx.fillText(lines[i], -saa, 0);
    ctx.restore();

    // Rect
    ctx.beginPath();
    // ctx.rect(0, 0, c.width, c.height);
    ctx.stroke();
  }
  interpolateColors();
}



const id = setInterval(() => {
  draw();
}, 20);
