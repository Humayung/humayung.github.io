// ************************ Drag and drop ***************** //
let dropArea;
window.onload = function () {
	// ************************ Drag and drop ***************** //
	let dropArea = document.getElementById("drop-area")

		// Prevent default drag behaviors
		;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
			dropArea.addEventListener(eventName, preventDefaults, false)
			document.body.addEventListener(eventName, preventDefaults, false)
		})

		// Highlight drop area when item is dragged over it
		;['dragenter', 'dragover'].forEach(eventName => {
			dropArea.addEventListener(eventName, highlight, false)
		})

		;['dragleave', 'drop'].forEach(eventName => {
			dropArea.addEventListener(eventName, unhighlight, false)
		})

	// Handle dropped files
	dropArea.addEventListener('drop', handleDrop, false)

	function preventDefaults(e) {
		e.preventDefault()
		e.stopPropagation()
	}

	function highlight(e) {
		dropArea.classList.add('highlight')
	}

	function unhighlight(e) {
		dropArea.classList.remove('active')
	}

};

function handleDrop(e) {
	var dt = e.dataTransfer;
	var files = dt.files;
	processImage(files[0]);
}

function handleFiles(files) {
	processImage(files[0]);
}

let loadedImage;
let colorDegree = 1;
let bw = false;
function processImage(file) {
	console.log(file)
	if (file.type.includes("image")) {
		const image = URL.createObjectURL(file);
		const output = document.getElementById('output')
		output.src = image
		loadedImage = file
		const selectImage = document.getElementById('selectImage')
		const ditherImage = document.getElementById('ditherOutput')
		selectImage.style.display = 'none'
		ditherImage.style.display = 'flex'
		return
	}
	console.log('Not an image!')
}

var worker;
let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");

function prepareDither() {
	const output = document.getElementById('output')
	var img = new Image;
	
	worker = new Worker('dither-worker.js')
	canvas = document.createElement("canvas");
	ctx = canvas.getContext("2d");
	worker.onmessage = receivedWorkerMessage
	img.onload = async function () {
		canvas.width = img.width
		canvas.height = img.height
		ctx.drawImage(img, 0, 0);
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

		console.log('sending to worker')
		loading.style.display = 'flex'
		worker.postMessage({
			imageData: imageData,
			colorDegree: colorDegree
		})

	}
	img.src = URL.createObjectURL(loadedImage);
}

function receivedWorkerMessage(event) {
	ctx.putImageData(event.data.imageData, 0, 0)
	const out = canvas.toDataURL("image/jpeg");
	output.src = out
	output.setAttribute('src', out)
	loading.style.display = 'none'
}

function setColorDegree(event) {
	colorDegree = event.target.value
}

async function downloadCanvas(el) {
	const imageURI = canvas.toDataURL("image/jpg");
	el.href = imageURI;
};

