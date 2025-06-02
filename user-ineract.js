import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { createRadarChart } from './script.js';

let userData = {
  name: 'User',
  depressionRate: 0,
  avgSleep: '6 hours',
  stressLevel: 0.7,
  sleepScore: 65,
  insights: "this is a test user",
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
    let dataPoint = userData.detailData.filter((f) => f.factor === dataName)[0];
    if (dataName === 'Academic Pressure') {
      bufferAcademic = Number(slider.value);
    } else if (dataName === "Financial Stress") {
      bufferFin = Number(slider.value);
    }
    dataPoint.value = Number(slider.value);
    label.innerHTML = slider.value;
  }
  createRadarChart(userData, '#user-chart');
  userData.stressLevel = (bufferAcademic + bufferFin) / 2;
  console.log(userData.stressLevel);
}

createRadarChart(userData, '#user-chart');
addSliderValues();
