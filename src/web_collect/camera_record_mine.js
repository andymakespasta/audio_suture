// This code is adapted from https://github.com/webrtc/samples

'use strict';

var state_recording = false;
var r_category_text = ""
var r_category_id = ""
var r_phrase_text = ""
var r_phrase_id = ""


/////////////////////////////////////////////////////////////////////////////////////////
// Video playback, mostly stolen from webRTC examples
/////////////////////////////////////////////////////////////////////////////////////////
/* globals MediaRecorder */
const liveVideo = document.querySelector('video#view'); // live view of the camera
const recordedVideo = document.querySelector('video#recorded'); // playback in a loop




// Implement the recording related functions
// Public Globals:
let RecorderState = "idle"
let recordedBlobs; // 10ms slices of the recording
let recordedMergedBlob; //merged into one big boy webm
let options; // auto detect optimal options
let mediaRecorder;


// Start/ Stop recording
function startRecording() {
  recordedBlobs = [];

  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e) {
    console.error('Exception while creating MediaRecorder:', e);
    // errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
    return;
  }

  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  recordButton.textContent = 'Stop Recording';

  mediaRecorder.onstop = (event) => {
    console.log('Recorder stopped: ', event);
    console.log('Recorded Blobs: ', recordedBlobs);
  };
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start(10); // collect 10ms of data
  console.log('MediaRecorder started', mediaRecorder);
}

function stopRecording() {
  mediaRecorder.stop();
  recordedMergedBlob = new Blob(recordedBlobs, {type: 'video/webm'});
}

function handleDataAvailable(event) {
  console.log('handleDataAvailable', event);
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}


function startPlaybackLoop() {
  recordedVideo.src = null; // clear out old
  recordedVideo.srcObject = null;
  recordedVideo.src = window.URL.createObjectURL(recordedMergedBlob);  //old blob still lives in the background?
  recordedVideo.controls = true;
  recordedVideo.play();
}

function download() {
    const url = window.URL.createObjectURL(recordedMergedBlob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'test.webm';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    }, 100);
}

// Initialize
async function initRecorder() {
  const hasEchoCancellation = true;
  const constraints = {
    audio: {
      echoCancellation: {exact: hasEchoCancellation}
    },
    video: {
      width: 1280, height: 720
    }
  };
  console.log('Using media constraints:', constraints);
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log(navigator.mediaDevices);
    console.log(stream);
    // const stream =  navigator.mediaDevices.getUserMedia(constraints);

      recordButton.disabled = false;
      console.log('getUserMedia() got stream:', stream);
      window.stream = stream;

      const gumVideo = document.querySelector('video#view');
      gumVideo.srcObject = stream;
  } catch (e) {
    console.error('navigator.getUserMedia error:', e);
       DebugLog (`navigator.getUserMedia error:${e.toString()}`)
  }
    //try all the codecs to see if supported
  options = {mimeType: 'video/webm;codecs=vp9'};
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    console.error(`${options.mimeType} is not Supported`);
    options = {mimeType: 'video/webm;codecs=vp8'};
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.error(`${options.mimeType} is not Supported`);
      options = {mimeType: 'video/webm'};
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.error(`${options.mimeType} is not Supported`);
        options = {mimeType: ''};
      }
    }
  }
  DebugLog( `using ${options.mimeType}`);
}


// Debuggy stuff that should be taken out in the release version:


function DebugLog( output )
{
    const debugLogElement = document.querySelector('span#debugLog');
    debugLogElement.appendChild(document.createTextNode(output));
    debugLogElement.appendChild(document.createElement("br"));
}













// Implement UI and function hooks on buttons
const initButton = document.querySelector('button#init');
initButton.addEventListener('click', () => {
    initRecorder();
    // TODO: get_list();
    document.getElementById("init_overlay").style.display = "none";
});

// Start/ Stop Record button
const recordButton = document.querySelector('button#startstopicon');
const recordText = document.querySelector('button#startstoptext');

recordButton.addEventListener('click', () => {
  if (state_recording == false ) {
    clicked_start_record();
  } else {
    clicked_stop_record();
  }
});

recordText.addEventListener('click', () => {  
  if (state_recording == false ) {
    clicked_start_record();
  } else {
    clicked_stop_record();
  }
});

function clicked_start_record() {
    recordText.textContent = '完成錄音'
    recordButton.style.backgroundImage = "url('assets/stop-button.png')";
    state_recording = true;
    startRecording();
}

function clicked_stop_record() {
    recordText.textContent = '開始錄音'
    recordButton.style.backgroundImage = "url( 'assets/record-button.png' )";
    state_recording = false;
    stopRecording();
    openSaveOverlay();
}




// Overlay Save / Retry / Close buttons
const downloadButton = document.querySelector('button#save');
const retryButton = document.querySelector('button#discard');
const finishedButton = document.querySelector('button#close');

downloadButton.addEventListener('click', () => {
    
    download();

    alert(finishedButton)
    finishedButton.className = finishedButton.className.replace(" grey", "");
    finishedButton.disabled = false;
    // finishedButton.style.display = 'block';
});

// Retry Button
retryButton.addEventListener('click', () => {
    // clearRecording();
    closeSaveOverlay();
    // finishedButton.style.display = 'none';
});

// Close/Finished button
finishedButton.addEventListener('click', () => {
    // clearRecording();
    resetTabs();
    closeSaveOverlay();
    // finishedButton.style.display = 'none';
});












//////////////////////// Selection Panel Stuff
// document.getElementById("defaultTab").click();

function openTab(tabId){
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them, then display only target
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    document.getElementById(tabId).style.display = "block";

    ///// grap the category id straight from tab
    r_category_text = document.getElementById('Yeh').getElementsByClassName("categoryText")[0].innerText
    r_category_id = tabId
}

function resetTabs(event){
    openTab('Default');
}

function selectPhrase(self) {
    var i, allSelectables;

    //make selection the only item with class selected
    allSelectables = document.getElementsByClassName("selectablePhrase");
    for (i=0; i<allSelectables.length; i++) {
        allSelectables[i].className = allSelectables[i].className.replace(" selected", "");
    }
    if( !finishedButton.classList.contains('grey')){
        self.className += " selected";
    }

    // grab the phrase_text and phrase_id
    r_phrase_text = self.innerText;
    r_phrase_id = self.id;
    writePromptRecorder();
}


/////////////////////////// Write selection to left panel
const rp_category = document.getElementById("record_category_text");
const rp_phrase = document.getElementById("record_phrase_text");
function writePromptRecorder(){
    rp_category.innerText = r_category_text;

    if (r_phrase_id.indexOf('Free') == -1 ){
        rp_phrase.innerText = r_phrase_text;    
    } // can't find "Free" in r_phrase_id 
    else {
        rp_phrase.innerText = "_???_"
    }
}




/////////////////////////// Overlay Stuff
function openSaveOverlay(){
    document.getElementById("check_overlay").style.display = "block";
    if( !finishedButton.classList.contains('grey')){
        finishedButton.className += " grey";    
    }
    finishedButton.disabled = true;
    startPlaybackLoop();
}

function closeSaveOverlay(){
    document.getElementById("check_overlay").style.display = "none";
}




/////////////////////////// Utility
// random string from stackoverflow "Thank You"
// dec2hex :: Integer -> String
// i.e. 0-255 -> '00'-'ff'
function dec2hex (dec) {
  return ('0' + dec.toString(16)).substr(-2)
}

// generateId :: Integer -> String
function generateId (len) {
  var arr = new Uint8Array((len || 40) / 2)
  window.crypto.getRandomValues(arr)
  return Array.from(arr, dec2hex).join('')
}
// var uuid = require("uuid");
// var id = uuid.v4();