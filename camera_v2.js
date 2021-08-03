/* pre-trained TensorFlow.js models: https://github.com/tensorflow/tfjs-models/tree/master/body-pix */

const videoElement = document.querySelector("#video");
const canvas = document.querySelector("#cvs");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const blurBtn = document.getElementById('blur-btn');
const unblurBtn = document.getElementById('unblur-btn');

startBtn.addEventListener('click', e => {
    startBtn.disabled = true;
    stopBtn.disabled = false;

    unblurBtn.disabled = false;
    blurBtn.disabled = false;

    playVideo();
});

stopBtn.addEventListener('click', e => {
    startBtn.disabled = false;
    stopBtn.disabled = true;

    unblurBtn.disabled = true;
    blurBtn.disabled = true;

    unblurBtn.hidden = true;
    blurBtn.hidden = false;

    videoElement.hidden = false;
    canvas.hidden = true;

    stopVideo();
});

blurBtn.addEventListener('click', e => {
    blurBtn.hidden = true;
    unblurBtn.hidden = false;

    videoElement.hidden = true;
    canvas.hidden = false;

    loadBodyPix();
});

unblurBtn.addEventListener('click', e => {
    blurBtn.hidden = false;
    unblurBtn.hidden = true;

    videoElement.hidden = false;
    canvas.hidden = true;
});

videoElement.addEventListener('playing', () => {
    ctx.height = videoElement.videoHeight;
    ctx.width = videoElement.videoWidth;
});


function playVideo() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
            videoElement.srcObject = stream;
            videoElement.play();
        })
        .catch(err => {
            startBtn.disabled = false;
            blurBtn.disabled = true;
            stopBtn.disabled = true;
            alert(`Following error occured: ${err}`);
        });
}

function stopVideo() {
    const stream = videoElement.srcObject;

    stream.getTracks().forEach(track => track.stop());
    videoElement.srcObject = null;
}

function loadBodyPix() {
    params = {
        // It is the float multiplier for the depth (number of channels) for all convolution ops. 
        multiplier: 0.75,
        // It specifies the output stride of the BodyPix model. 
        stride: 32,
        // This argument controls the bytes used for weight quantization.
        quantBytes: 4
    }
    bodyPix.load(params)
        .then(net => draw(net))
        .catch(err => console.log(err))
}
async function draw(net) {
    while (startBtn.disabled && blurBtn.hidden) {
        const segmentation = await net.segmentPerson(videoElement);

        const backgroundBlurAmount = 6;
        const edgeBlurAmount = 3;
        const flipHorizontal = true;
        // Draw the image with the background blurred onto the canvas. The edge between
        // the person and blurred background is blurred by 3 pixels.
        bodyPix.drawBokehEffect(
            canvas, videoElement, segmentation, backgroundBlurAmount, edgeBlurAmount, flipHorizontal);
    }
}