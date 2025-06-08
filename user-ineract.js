import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { createRadarChart } from './script.js';

const model = await tf.loadGraphModel('./javaScriptModel/model.json');

let userData = {
  name: 'User',
  depressionRate: 0,
  avgSleep: '6 hours',
  stressLevel: 0.7,
  sleepScore: 65,
  insights: "this is a test user",
  hours: 0,
  detailData: [
    { factor: 'Academic Pressure', value: 80 },
    { factor: 'Financial Stress', value: 80 },
    { factor: 'Work-Life Balance', value: 80 },
    { factor: 'Social Support', value: 80 },
    { factor: 'Job Security', value: 80 },
  ],
};

let bufferAcademic = 0;
let bufferFin = 0;

function addSliderValues() {
  let inputs = Array.from(document.getElementsByClassName('userin'));
  for (let userInput of inputs) {
    let slider = userInput.getElementsByClassName('user-input')[0];
    slider.addEventListener('input', updateSliderValues);
  }
  updateSliderValues();
}

function updateSliderValues() {
  let inputs = Array.from(document.getElementsByClassName('slider'));
  for (let userInput of inputs) {
    let slider = userInput.getElementsByClassName('user-input')[0];
    let label = userInput.getElementsByClassName('value')[0];
    let dataName = slider.name;
    let sliderVal = Number(slider.value);
    let dataPoint = {};
    if (dataName === 'Academic Pressure') {
      bufferAcademic = Number(slider.value);
    } else if (dataName === "Financial Stress") {
      bufferFin = Number(slider.value);
    }
    if (dataName === "Work/Study Hours") {
      userData.hours = sliderVal
    } else {
      dataPoint = userData.detailData.filter((f) => f.factor === dataName)[0];
      dataPoint.value = sliderVal;
    }
    label.innerHTML = slider.value;
  }
  let hoursWorked = document.getElementById('hrs').value;
  createRadarChart(userData, '#user-chart');
  userData.stressLevel = (bufferAcademic + bufferFin) / 2;
}

async function predictUser() {
  let sleepDur = Number(document.getElementById('sleep-amnt').value);
  let workPress = (100 - userData.detailData.filter((f) =>
    f.factor === 'Work-Life Balance')[0].value) * (5 / 100);
  // Scale the above value to fit the 0-5 format that the training data has
  let finStress = (userData.detailData.filter((f) =>
    f.factor === 'Financial Stress')[0].value * (4 / 100)) + 1;
  // Original data also has 0-5 scale for this, but starts at 1
  // (I think the training data is ordinal, and not ratio, but it should still work
  // since it is a nn accepting floats)
  let acPress = (100 - userData.detailData.filter((f) =>
    f.factor === 'Academic Pressure')[0].value) * (5 / 100);
  let hrs = userData.hours;
  let modelInput = Array(workPress, sleepDur, finStress, hrs, acPress);
  console.log(modelInput);
  modelInput = tf.tensor2d([modelInput], [1, 5])
  let userScore = model.predict(modelInput);
  userScore = await userScore.data();
  userData.score = userScore;
  showUserRisk(userData);
}

function showUserRisk(data) {
  let risk = Math.round(data.score * 100);
  let riskBlock = document.getElementById('user-risk')
  riskBlock.classList.remove('hidden')
  riskBlock.children[1].innerHTML = risk;
  console.log(riskBlock);
}

createRadarChart(userData, '#user-chart');
addSliderValues();

document.getElementById('run-model').addEventListener('click', predictUser)
