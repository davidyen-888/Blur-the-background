const video = document.createElement("video");
const ctx = document.querySelector("#cvs").getContext("2d");

// Load the blazeface model in advance. Prevent the browser from loading the model every time the page is loaded.
let model = null;
async function init() {
    model = await blazeface.load();
    video.addEventListener("loadeddata", () => {
        // Call the detect function every 10ms.
        window.setInterval(detect, 10);
    });
    // Obtain video in browser and play it
    window.navigator.mediaDevices.getUserMedia({ audio: false, video: true }).then((stream) => {
        video.srcObject = stream;
        video.play();
    });
}
init();

// The callback function for the face detection.
async function detect() {
    // Pass in an image or video to the model. The model returns an array of
    // bounding boxes, probabilities, and landmarks, one for each detected face.
    const returnTensors = false; // Pass in `true` to get tensors back, rather than values.
    const predictions = await model.estimateFaces(video, returnTensors);

    // Set the canvas to the size of the frame.
    ctx.canvas.width = video.videoWidth;
    ctx.canvas.height = video.videoHeight;

    if (predictions.length > 0) {   // If there are faces detected.
        /*
        `predictions` is an array of objects describing each detected face, for example:
    
        [
          {
            topLeft: [232.28, 145.26],
            bottomRight: [449.75, 308.36],
            probability: [0.998],
            landmarks: [
              [295.13, 177.64], // right eye
              [382.32, 175.56], // left eye
              [341.18, 205.03], // nose
              [345.12, 250.61], // mouth
              [252.76, 211.37], // right ear
              [431.20, 204.93] // left ear
            ]
          }
        ]
        */
        // Get the top-left and bottom-right coordinates of the faces by using for loop.
        for (let i = 0; i < predictions.length; i++) {
            const rightEye = predictions[i].landmarks[0];
            const leftEye = predictions[i].landmarks[1];
            const start = predictions[i].topLeft;
            const end = predictions[i].bottomRight;
            const size = [end[0] - start[0], end[1] - start[1]];

            // Render a clear image in face.
            const faceArea = new Path2D();    // create a new Path2D object
            // Calculate the center of the face as the midpoint between the rightEye and leftEye coordinates.
            faceArea.ellipse(
                (leftEye[0] + rightEye[0]) / 2,
                (leftEye[1] + rightEye[1]) / 2,
                size[0] / 2, size[1] * 0.8,
                0, 0, 2 * Math.PI
            );

            // Only draw the image at the coordinates defined above a.k.a. the face part.
            ctx.save();
            ctx.clip(faceArea); // Clip the canvas to the area of the face
            ctx.drawImage(video, 0, 0);
            ctx.restore();
        }
    }
    // Add blur background to the image.
    ctx.save();
    ctx.filter = "blur(10px)";
    ctx.globalCompositeOperation = "destination-atop";    // If the image was drawn, preserve the pre-existing image, draw only on the place never drawn before.
    ctx.drawImage(video, 0, 0);
    ctx.restore()
}