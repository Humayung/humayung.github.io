onmessage = function (event) {
    const data = event.data
    makeDithered(data.imageData, data.colorDegree)
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
            // distributeError(img, x, y, errR, errG, errB);
            // console.log(clr)
        }
        progress += img.width
        const percent = progress * 100 / maxProgress
    }
    postMessage({
        imageData: img
    })
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