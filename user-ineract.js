import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { createRadarChart } from './script.js';

let testData = {
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

createRadarChart(testData, '#user-profile');
