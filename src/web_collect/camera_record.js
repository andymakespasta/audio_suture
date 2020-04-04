// This code is adapted from https://github.com/webrtc/samples

'use strict';

var state_recording = false;
var r_category_text = "";
var r_category_id = "";
var r_phrase_text = "";
var r_phrase_id = "";
var download_file_name = "";
var current_phrase; // the DOM element that is to be removed upon successful


/////////////////////////////////////////////////////////////////////////////////////////
// Video playback, mostly stolen from webRTC examples
/////////////////////////////////////////////////////////////////////////////////////////
/* globals MediaRecorder */
const liveVideo = document.querySelector('video#view'); // live view of the camera
const recordedVideo = document.querySelector('video#recorded'); // playback in a loop


const mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
let mediaRecorder;
let recordedBlobs;  // array of a bunch of small recorded blobs
let sourceBuffer;


// public functions
function startPlaybackLoop(){ //on recordedVideo, from recordedBlobs
    const superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
    recordedVideo.src = null;
    recordedVideo.srcObject = null;
    recordedVideo.src = window.URL.createObjectURL(superBuffer);
    recordedVideo.controls = true;
    recordedVideo.play();
}

function stopPlaybackLoop(){
    recordedVideo.src = null;
    recordedVideo.srcObject = null;
}

function surfaceDownload(){ //created from recordedBlobs, using globals as file name
    const blob = new Blob(recordedBlobs, {type: 'video/webm'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;

    alert(download_file_name);

    a.download = download_file_name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    }, 1000);
}

function startRecording() { //starts recording to recorded blobs
  recordedBlobs = [];
  let options = {mimeType: 'video/webm;codecs=vp9'};
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

  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e) {
    console.error('Exception while creating MediaRecorder:', e);
    return;
  }

  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  // recordButton.textContent = 'Stop Recording';
  // playButton.disabled = true;
  // downloadButton.disabled = true;
  mediaRecorder.onstop = (event) => {
    console.log('Recorder stopped: ', event);
    console.log('Recorded Blobs: ', recordedBlobs);
  };
  mediaRecorder.ondataavailable = handleDataAvailable;
  // alert(MediaRecorder.isTypeSupported(options.mimeType));
  mediaRecorder.start(10); // collect 10ms of data
  console.log('MediaRecorder started', mediaRecorder);
}

function stopRecording() {
  mediaRecorder.stop();
}

function handleSuccess(stream) {
    //close init overlay
    document.getElementById("init_overlay").style.display = "none";

    console.log('getUserMedia() got stream:', stream);
    window.stream = stream;

  liveVideo.srcObject = stream;
}

async function initRecorder() {

  // const hasEchoCancellation = document.querySelector('#echoCancellation').checked;
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
  await init(constraints);
}


async function init(constraints) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    handleSuccess(stream);
  } catch (e) {
    console.error('navigator.getUserMedia error:', e);
  }
}

//private internal stuff
function handleSourceOpen(event) {
  console.log('MediaSource opened');
  sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
  console.log('Source buffer: ', sourceBuffer);
}

function handleDataAvailable(event) {
  console.log('handleDataAvailable', event);
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}








///// Automatic Spreadsheet get:
var optionsData;

function dataCallback(data) {
    optionsData = data.feed.entry;
    //optionsData.feed.entry[0].gs$cell = 
    // {row: "1", col: "1", $t: "Yeh"}
    // {row: "1", col: "2", $t: "001"}
    // {row: "1", col: "3", $t: "有幽默感"}
    var col_check = 0 //last observed column
    var row_check = 0 //last observed row
    var category_id = ""
    var phrase_id = ""
    var phrase_text = ""
    var i;
    for (i = 0; i < optionsData.length; ++i) {
        if (optionsData[i].gs$cell.col == "1"){ //new column
            if(optionsData[i].gs$cell.row != row_check + 1){
                console.log("row/col newcol check failed on item " + i);
            }
        }
        else {
            if (optionsData[i].gs$cell.row != row_check ||
                optionsData[i].gs$cell.col != col_check + 1){
                console.log("row/col check failed on item " + i);
            }
        }
        row_check = parseInt(optionsData[i].gs$cell.row);
        col_check = parseInt(optionsData[i].gs$cell.col);

        if (optionsData[i].gs$cell.col == "1"){ //new column
            category_id = optionsData[i].gs$cell.$t;
            phrase_id = "";
            phrase_text = "";
        }
        if (optionsData[i].gs$cell.col == "2"){
            phrase_id = optionsData[i].gs$cell.$t;
        }
        if (optionsData[i].gs$cell.col == "3"){
            phrase_text = optionsData[i].gs$cell.$t;
            if (phrase_id && phrase_text) { //have all three columns
                spawnPhrase(category_id, phrase_id, phrase_text);
            }
        }
    }
}

function spawnPhrase(category_id, phrase_id, phrase_text) {
    if (['Yeh', 'Yao', 'Both', 'Bless'].indexOf(category_id) >= 0) { // is one of the four
        var container = document.getElementById(category_id);
        var newButton = document.createElement('button');
        if (phrase_id == 'Free'){
            newButton.setAttribute("class", "selectablePhrase Free");    
        }
        else {
            newButton.setAttribute("class", "selectablePhrase");
        }
        newButton.setAttribute("id", category_id+'_'+phrase_id)
        newButton.setAttribute("onclick", 'selectPhrase(this)');
        newButton.innerText = phrase_text;
        container.appendChild(newButton);




    }
}

const countdownDiv = document.getElementById("view_block_countdown");

function recursiveCountdown(seconds, callback){
    console.log(countdownDiv);
    if (seconds <= 0){
        countdownDiv.style.display = 'none';
        callback();
    }
    else { // draw number hack will not auto resize...
        console.log(countdownDiv);
        countdownDiv.style.display = "block";
        countdownDiv.style.height = liveVideo.getBoundingClientRect().height+'px';
        countdownDiv.style.lineHeight = countdownDiv.style.height;
        countdownDiv.style.width = liveVideo.getBoundingClientRect().width+'px';
        countdownDiv.style.top = liveVideo.getBoundingClientRect().top+'px';
        countdownDiv.style.left = liveVideo.getBoundingClientRect().left+'px';
        countdownDiv.innerText = seconds;
        console.log(seconds)
        console.log(countdownDiv.innerText)
        setTimeout(function() {
            recursiveCountdown(seconds -1, callback);
        }, 1000)
    }
}














// Implement UI and function hooks on buttons
const initButton = document.querySelector('button#init');
initButton.addEventListener('click', () => {
    initRecorder();
    // TODO: get_list();
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
    recursiveCountdown(3, startRecording)
    // startRecording();
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
    surfaceDownload();
    // alert(finishedButton)
    finishedButton.className = finishedButton.className.replace(" grey", "");
    finishedButton.disabled = false;
    // finishedButton.style.display = 'block';
    // TODO: remove item from list
    // TODO:send status up to server
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
    closeSaveOverlay();
    resetTabs();
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

    // clear out recording
    document.getElementById("recorder_prompt").style.display = "none";


    ///// grab the category id straight from tab
    r_category_text = document.getElementById(tabId).getElementsByClassName("categoryText")[0].innerText
    r_category_id = tabId
}

function resetTabs(event){
    openTab('Default');
    document.getElementById("recorder_prompt").style.display = "none";
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
    document.getElementById("recorder_prompt").style.display = "block";
    writePromptRecorder();
}


/////////////////////////// Write selection to left panel
const rp_category = document.getElementById("record_category_text");
const rp_phrase = document.getElementById("record_phrase_text");
const rp_phrase2 = document.getElementById("record_phrase_text2");
function writePromptRecorder(){
    rp_category.innerText = r_category_text;

    if (r_phrase_id.indexOf('Free') == -1 ){
        rp_phrase.innerText = "__" + r_phrase_text + "__";
    } // can't find "Free" in r_phrase_id 
    else {
        rp_phrase.innerText = "__????__"
    }
    rp_phrase2.innerText = rp_phrase.innerText;
}




/////////////////////////// Overlay Stuff
function openSaveOverlay(){
    document.getElementById("check_overlay").style.display = "block";
    if( !finishedButton.classList.contains('grey')){
        finishedButton.className += " grey";    
    }
    finishedButton.disabled = true;
    startPlaybackLoop();
    download_file_name = r_phrase_id + '_' + generateId(8)+'.webm';
}

function closeSaveOverlay(){
    document.getElementById("check_overlay").style.display = "none";
    stopPlaybackLoop();
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