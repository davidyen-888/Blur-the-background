const videoElement = document.querySelector("#video");
const canvas = document.querySelector("#cvs");


videoElement.onplaying = () => {
    canvas.height = videoElement.videoHeight;
    canvas.width = videoElement.videoWidth;
};



async function loadAndPredict() {
    /**
     * One of (see documentation below):
     *   - net.segmentPerson
     *   - net.segmentPersonParts
     *   - net.segmentMultiPerson
     *   - net.segmentMultiPersonParts
     * See documentation below for details on each method.
     */
    // video.addEventListener("loadeddata", () => {
    //     // Call the draw function every 10ms.
    // window.setInterval(draw, 10);
    // });

    // Obtain video in browser and play it
    playVideo();
    loadBodyPix();
}
loadAndPredict();


function playVideo() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
            videoElement.srcObject = stream;
            videoElement.play();
        })
        .catch(err => console.log(err));
}

function loadBodyPix() {
    options = {
        multiplier: 0.75,
        stride: 32,
        quantBytes: 4
    }
    bodyPix.load(options)
        .then(net => draw(net))
        .catch(err => console.log(err))
}

async function draw(net) {
        const segmentation = await net.segmentPerson(video);

        const backgroundBlurAmount = 6;
        const edgeBlurAmount = 3;
        const flipHorizontal = true;
        // Draw the image with the background blurred onto the canvas. The edge between
        // the person and blurred background is blurred by 3 pixels.
        bodyPix.drawBokehEffect(canvas, videoElement, segmentation, backgroundBlurAmount, edgeBlurAmount, flipHorizontal);
}

