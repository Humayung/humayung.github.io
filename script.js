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

function prepareDither() {
	const output = document.getElementById('output')
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	var img = new Image;
	img.onload = function () {
		canvas.width = img.width
		canvas.height = img.height
		ctx.drawImage(img, 0, 0);
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
		console.log(imageData)
		makeDithered(imageData, colorDegree)
		ctx.putImageData(imageData, 0, 0)
		const out = canvas.toDataURL("image/jpeg");
		output.src = out

	}
	img.src = URL.createObjectURL(loadedImage);

}

function setColorDegree(event) {
	colorDegree = event.target.value
}

function toggleBw(obj) {

}

function imageIndex(img, x, y) {
	return 4 * (x + y * img.width);
}

function getColorAtindex(img, x, y) {
	let idx = imageIndex(img, x, y);
	let pix = img.data;
	let red = pix[idx];
	let green = pix[idx + 1];
	let blue = pix[idx + 2];
	let alpha = pix[idx + 3];
	return [red, green, blue, alpha];
}

function setColorAtIndex(img, x, y, clr) {
	let idx = imageIndex(img, x, y);
	let pix = img.data;
	pix[idx] = clr[0];
	pix[idx + 1] = clr[1];
	pix[idx + 2] = clr[2];

}

// Finds the closest step for a given value
// The step 0 is always included, so the number of steps
// is actually steps + 1
function closestStep(max, steps, value) {
	const closest = Math.round((steps * value) / 255) * Math.floor(255 / steps);

	return closest
}

function makeDithered(img, steps) {
	let maxProgress = img.width * img.height
	let progress = 0
	for (let y = 0; y < img.height; y++) {
		for (let x = 0; x < img.width; x++) {
			let clr = getColorAtindex(img, x, y);
			let oldR = clr[0];
			let oldG = clr[1];
			let oldB = clr[2];
			let newR = closestStep(255, steps, oldR);
			let newG = closestStep(255, steps, oldG);
			let newB = closestStep(255, steps, oldB);

			let newClr = [newR, newG, newB];
			// console.log(newClr)
			setColorAtIndex(img, x, y, newClr);

			let errR = oldR - newR;
			let errG = oldG - newG;
			let errB = oldB - newB;
			distributeError(img, x, y, errR, errG, errB);
			// console.log(clr)
		}
		progress += img.width
		const percent = progress * 100 / maxProgress
	}


}

function distributeError(img, x, y, errR, errG, errB) {
	addError(img, 7 / 16.0, x + 1, y, errR, errG, errB);
	addError(img, 3 / 16.0, x - 1, y + 1, errR, errG, errB);
	addError(img, 5 / 16.0, x, y + 1, errR, errG, errB);
	addError(img, 1 / 16.0, x + 1, y + 1, errR, errG, errB);
}

function addError(img, factor, x, y, errR, errG, errB) {
	if (x < 0 || x >= img.width || y < 0 || y >= img.height) return;
	let clr = getColorAtindex(img, x, y);
	let r = clr[0];
	let g = clr[1];
	let b = clr[2];
	clr[0] = r + errR * factor;
	clr[1] = g + errG * factor;
	clr[2] = b + errB * factor;

	setColorAtIndex(img, x, y, clr);
}

