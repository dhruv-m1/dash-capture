/*
    Core Logic for Dash Capture v0.5
*/

import Vue from '../../node_modules/vue/dist/vue.esm.browser.min.js';
const { desktopCapturer, remote } = require('electron');
const { dialog } = remote;
let stream, recorder;
const { writeFile } = require('fs');
let chunks = [];

const app = new Vue({
    el: '#app',
    data: {
        ui: {
            screenSource: 'Not Selected',
            recordButton: 'Start Recording',
            screenSourceModal: false
        },
        screen: {
            sources: [],
            selection: 'Select Source'
        }
    },
    methods: {
        async getSourceList() {
          return new Promise(async(resolve) => {
            this.screen.sources = await desktopCapturer.getSources({ types: ['window', 'screen'] });
            
            resolve();
          });
            
        },
        async setSource(src) {
            this.ui.screenSource = src.name;
            const video = document.querySelector("video");
            video.srcObject = null;
            stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: src.id
                      }
                },
                video: {
                  mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: src.id
                  }
                }
              });

              video.srcObject = stream;
              await video.play();
              this.ui.screenSourceModal = false;
        },
        async toggleRecording() {

          if (this.ui.recordButton == 'Start Recording') {
            recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
            recorder.ondataavailable = e => chunks.push(e.data);
            this.ui.recordButton = 'Stop Recording';
            recorder.start();
          } else {

            recorder.stop();

            recorder.onstop = async(e) => {
                const blob = new Blob(chunks, {
                    type: 'video/webm; codecs=vp9'
                  });
                
                  const buffer = Buffer.from(await blob.arrayBuffer());
                
                  const { filePath } = await dialog.showSaveDialog({
                    buttonLabel: 'Save video',
                    defaultPath: `vid-${Date.now()}.webm`
                  });
                
                  if (filePath) {
                    writeFile(filePath, buffer, () => console.log('video saved successfully!'));
                    chunks = [];
                    this.ui.recordButton = 'Start Recording';
                  }
            };
          }
        },
        async triggerScreenSelection() {
          await this.getSourceList();
          this.ui.screenSourceModal = true;
        }

    },
    created: async function() {
      await this.getSourceList();
      this.ui.screenSource = this.screen.sources[0].name;
      this.setSource(this.screen.sources[0]);
    }
  })