const start = document.getElementById("start");
const stop = document.getElementById("stop");
const video = document.querySelector("video");

const { desktopCapturer } = require('electron')
let recorder, stream;

desktopCapturer.getSources({ types: ['window', 'screen'] }).then((sources) => {
    for (let source of sources) console.log(source);
})

async function startRecording() {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: {
        mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: "screen:1:0"
          }
    },
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: "screen:1:0"
      }
    }
  });
  recorder = new MediaRecorder(stream);
  video.srcObject = stream;
  video.play();
  const chunks = [];
  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.onstop = e => {
    //video.srcObject = stream;
  };

  recorder.start();
}

/*start.addEventListener("click", () => {
  start.setAttribute("disabled", true);
  stop.removeAttribute("disabled");

  startRecording();
});

stop.addEventListener("click", () => {
  stop.setAttribute("disabled", true);
  start.removeAttribute("disabled");

  recorder.stop();
  stream.getVideoTracks()[0].stop();
});*/

startRecording();