// ISP, CV, ML
let video;
let label = "waiting...";
let classifier;
let modelURL = 'https://teachablemachine.withgoogle.com/models/YI1Blm2Px/';
let lastLabel = "";
let framesSinceLabelSwitched = 0;
let category = "object";

// JSON
let url = './data/data.json';
let data;

// Audio
let soundCurrent;
let soundNext;
let soundEffect;
let soundSelect, soundCancel, soundConfirm;
let soundVerbalAffirm;
let soundTeapotHistorical, soundTeapotVerbal;
let soundTeacupHistorical, soundTeacupVerbal;
let soundInkwellHistorical, soundInkwellVerbal;

// Images
let scanMask;

// HTML
let modalElement;

function preload() {
  scanMask = loadImage('./assets/scanmask.png');
  data = loadJSON(url);
  classifier = ml5.imageClassifier(modelURL + 'model.json');
  soundVerbalAffirm = loadSound('assets/verbal_affirm.m4a');
  soundSelect = loadSound('assets/select.wav');
  soundCancel = loadSound('assets/cancel.wav');
  soundConfirm = loadSound('assets/confirm.wav');
  soundEffect = soundSelect;
  soundTeapotHistorical = loadSound('assets/teapot_historical.mp3');
  soundTeapotVerbal = loadSound('assets/teapot_verbal.mp3');
  soundTeacupHistorical = loadSound('assets/teacup_historical.mp3');
  soundTeacupVerbal = loadSound('assets/teacup_verbal.mp3');
  soundInkwellHistorical = loadSound('assets/inkwell_historical.mp3');
  soundInkwellVerbal = loadSound('assets/inkwell_verbal.mp3');
}

function setup() {
  modalElement = document.getElementById("info-modal-container");
  jsonLength = Object.keys(data).length;
  let canvasDiv = document.getElementById('canvas-container');
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent("#canvas-container");
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  flippedVideo = ml5.flipImage(video)
  classifyVideo();
  injectInfo(0, "historic_label");
}

function classifyVideo() {
  classifier.classify(video, gotResults);
}

function draw() {
  background(255);
  image(video, 0, 0, windowHeight * 3/2, windowHeight);
  classify();
  textSize(32);
  textAlign(CENTER, CENTER);
  fill(255);
  // text(label, width / 2, height - 25);
  // text(category, width / 2, height - 70);
  drawCrosshairs();
}

function drawCrosshairs() {
  image(scanMask, 0, 0, windowWidth, windowHeight);
}

function classify() {
  framesSinceLabelSwitched += 1;
  if(label != lastLabel) {
    lastLabel = label;
    framesSinceLabelSwitched = 0;
  }
  if (framesSinceLabelSwitched > 30) {
    switch(category) {
      case "cancellable":
          if (label == "Thumbs down") {
            soundCurrent.stop();
            soundNext.stop();
            soundSelect.stop();
            playSoundEffect("cancel");
            category = "object";
            framesSinceLabelSwitched = 0;
            modalElement.style.display = "none";
          }
        break;
      case "object":
          let currLabel = label;
          switch(label) {
            case "Empty": 
              break;
            case "Teacup":
              injectInfo(labelToIndex(label), "historic_label");
              playSoundEffect("select");
              soundCurrent = soundTeacupHistorical;
              soundNext = soundTeacupVerbal;
              category = "cancellable";
              soundCurrent.play();
              soundCurrent.onended(function () {
                verbalAffirm(currLabel);
              });
              toggleInfoModal();
              break;
            case "Teapot":
              injectInfo(labelToIndex(label), "historic_label");
              playSoundEffect("select");
              soundCurrent = soundTeapotHistorical;
              soundNext = soundTeapotVerbal;
              category = "cancellable";
              soundCurrent.play();
              soundCurrent.onended(function () {
                verbalAffirm(currLabel);
              });
              toggleInfoModal();
              break;
            case "Inkwell":
              injectInfo(labelToIndex(label), "historic_label");
              playSoundEffect("select");
              soundCurrent = soundInkwellHistorical;
              soundNext = soundInkwellVerbal;
              category = "cancellable";
              soundCurrent.play();
              soundCurrent.onended(function () {
                verbalAffirm(currLabel);
              });
              toggleInfoModal();
              break;
          }
        break;
      case "affirmation":
          if (label == "Thumbs up") {
            category = "cancellable";
            soundCurrent.stop();
            playSoundEffect("confirm");
            soundCurrent = soundNext;
            soundCurrent.play();
            soundCurrent.onended(function () { 
              if (!soundCurrent.isPaused()) {
                category = "object"; 
                toggleInfoModal();
                playSoundEffect("cancel");
              }
            })
            toggleInfoModal();
          } else if (label == "Thumbs down") {
            playSoundEffect("cancel");
            setHeader("Scan an object");
            soundCurrent.stop();
            category = "object";
          }
        break;
    }
  }
}

function toggleInfoModal() {
  if (modalElement.style.display ==  "flex") {
    playSoundEffect("cancel");
    modalElement.style.display = "none";
    soundCurrent.stop();
    soundNext.stop();
    soundVerbalAffirm.stop();
    soundCurrent.stop();
    soundNext.stop();
    soundVerbalAffirm.stop();
    category = "object";
    setHeader("Scan an object");
  } else {
    setHeader("Object description");
    modalElement.style.display = "flex";
    let playPauseButton = document.getElementById("play-pause-button");
    playPauseButton.src = "./assets/pause.png";
  }
}

function playSoundEffect(effect) {
  soundEffect.stop();
  switch(effect) {
    case "confirm":
      soundEffect = soundConfirm;
      soundEffect.play();
      break;
    case "cancel":
      soundEffect = soundCancel;
      soundEffect.play();
      break;
    case "select":
      soundEffect = soundSelect;
      soundEffect.play();
      break;
  }
}

function verbalAffirm(lastLabel) {
  console.log("verbalAffirm", lastLabel);
  if (!soundCurrent.isPaused()) {
    if (category == "cancellable") {
      injectInfo(labelToIndex(lastLabel), "verbal_description");
      toggleInfoModal();
      setHeader("Hear visual description?");
      soundCurrent = soundVerbalAffirm;
      soundCurrent.play();
      category = "affirmation";
    }
    else { category = "object"; }
  }
}

function labelToIndex(label) {
  switch(label) {
    case "Empty": 
      return 0;
      break;
    case "Teacup":
      return 1;
      break;
    case "Teapot":
      return 2;
      break;
    case "Inkwell":
      return 3;
      break;
  }
  return 0;
}

function gotResults(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  label = results[0].label;
  classifyVideo();
}

function togglePlayPause() {
  let playPauseButton = document.getElementById("play-pause-button");
  if (playPauseButton.src.includes("/assets/pause.png")) {
    playPauseButton.src = "./assets/play.png";
  } else {
    playPauseButton.src = "./assets/pause.png";
  }
  if (soundCurrent.isPlaying()) {
    soundCurrent.pause();
  } else if (soundCurrent.isPaused()) {
    soundCurrent.play();
  }
}

function setHeader(text) {
  let headerText = document.getElementById("header-text");
  headerText.innerHTML = text;
}

function rewind() {
  soundCurrent.jump();
}

function forward() {
  soundCurrent.stop();
}

function injectInfo(index, description) {
  console.log("injectInfo", index, description);
  let info = data[index];
  let imageElement = document.querySelector('#image-container');
  imageElement.innerHTML = "<img src=\""+info['image_src']+"\" id=\"image\">";
  let titleElement = document.querySelector('#title');
  titleElement.innerHTML = info['title'];
  let subheaderElement = document.querySelector('#subheader');
  subheaderElement.innerHTML = info['metadata'];
  let descriptionElement = document.querySelector('#description');
  descriptionElement.innerHTML = info[description];
  descriptionElement.scrollTop = 0;
}