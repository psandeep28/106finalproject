// Post-Assessment Data Exploration JavaScript
document.addEventListener('DOMContentLoaded', function() {
  setupPostAssessmentFlow();
});

function setupPostAssessmentFlow() {
  // Navigation between comparison screens
  document.getElementById('next-to-stress-comparison')?.addEventListener('click', function() {
    document.getElementById('your-sleep-comparison').classList.add('hidden');
    document.getElementById('your-stress-comparison').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  
  document.getElementById('next-to-peer-match')?.addEventListener('click', function() {
    document.getElementById('your-stress-comparison').classList.add('hidden');
    document.getElementById('peer-matching-screen').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  
  document.getElementById('reveal-my-risk')?.addEventListener('click', function() {
    document.getElementById('peer-matching-screen').classList.add('hidden');
    // This would go to the final risk assessment results
    showFinalRiskAssessment();
  });
}

function populateUserComparisons(userInputs) {
  // Update sleep comparison
  updateSleepComparison(userInputs.sleepDuration);
  
  // Update stress comparison
  updateStressComparison(userInputs);
  
  // Update peer matching
  updatePeerMatching(userInputs);
}

function updateSleepComparison(sleepDuration) {
  const sleepData = {
    '5': { percentage: 34.2, depression: 71.3, groupSize: 9547, advantage: "You're in a high-risk sleep group" },
    '5-6': { percentage: 30.1, depression: 62.8, groupSize: 8398, advantage: "Your sleep puts you at moderate risk" },
    '7-8': { percentage: 32.9, depression: 42.1, groupSize: 9184, advantage: "You're in the optimal sleep range!" },
    '8': { percentage: 2.8, depression: 38.5, groupSize: 781, advantage: "You get excellent sleep!" }
  };
  
  const data = sleepData[sleepDuration];
  const avgDepression = 58.6;
  const difference = data.depression - avgDepression;
  
  // Update displays
  document.getElementById('user-sleep-display').textContent = sleepDuration + ' hours';
  document.getElementById('you-sleep-hours').textContent = sleepDuration + ' hours';
  document.getElementById('your-group-size').textContent = data.groupSize.toLocaleString();
  document.getElementById('your-group-depression').textContent = data.depression + '%';
  document.getElementById('depression-difference').textContent = (difference > 0 ? '+' : '') + difference.toFixed(1) + '%';
  document.getElementById('sleep-advantage-text').textContent = data.advantage;
  
  // Create sleep population chart
  createSleepPopulationChart(sleepDuration, data);
}

function createSleepPopulationChart(userSleep, userData) {
  const chartContainer = document.getElementById('sleep-population-chart');
  
  const sleepGroups = [
    { label: '<5h', value: '5', percentage: 34.2, depression: 71.3 },
    { label: '5-6h', value: '5-6', percentage: 30.1, depression: 62.8 },
    { label: '7-8h', value: '7-8', percentage: 32.9, depression: 42.1 },
    { label: '>8h', value: '8', percentage: 2.8, depression: 38.5 }
  ];
  
  // Create a visual representation of sleep distribution
  chartContainer.innerHTML = `
    <div style="display: flex; align-items: end; height: 200px; gap: 1.5rem; justify-content: center;">
      ${sleepGroups.map(group => `
        <div class="sleep-bar ${userSleep === group.value ? 'user-bar' : ''}" style="display: flex; flex-direction: column; align-items: center;">
          <div style="width: 70px; background: ${userSleep === group.value ? '#00ffff' : '#666'}; height: ${group.percentage * 4}px; margin-bottom: 0.5rem; border-radius: 4px; position: relative; ${userSleep === group.value ? 'box-shadow: 0 0 20px rgba(0, 255, 255, 0.5); animation: userBarGlow 2s ease-in-out infinite alternate;' : ''}">
            ${userSleep === group.value ? '<div style="position: absolute; top: -30px; left: 50%; transform: translateX(-50%); color: #00ffff; font-weight: bold; font-size: 1.2rem;">👤 YOU</div>' : ''}
          </div>
          <span style="font-size: 0.9rem; color: #fff; margin-bottom: 0.25rem;">${group.label}</span>
          <span style="font-size: 0.8rem; color: #999;">${group.percentage}%</span>
          <span style="font-size: 0.7rem; color: ${group.depression > 58.6 ? '#ff6b6b' : '#00ff00'};">${group.depression}% dep.</span>
        </div>
      `).join('')}
    </div>
    
    <style>
      @keyframes userBarGlow {
        from { box-shadow: 0 0 10px rgba(0, 255, 255, 0.3) !important; }
        to { box-shadow: 0 0 25px rgba(0, 255, 255, 0.8) !important; }
      }
    </style>
  `;
}

function updateStressComparison(userInputs) {
  const datasetAverages = {
    academic: 65.2,
    financial: 52.8,
    balance: 48.3,
    social: 61.7,
    security: 45.9
  };
  
  // Update user bars and values
  document.getElementById('you-academic-bar').style.width = userInputs.academicPressure + '%';
  document.getElementById('you-academic-value').textContent = userInputs.academicPressure;
  
  document.getElementById('you-financial-bar').style.width = userInputs.financialStress + '%';
  document.getElementById('you-financial-value').textContent = userInputs.financialStress;
  
  document.getElementById('you-balance-bar').style.width = userInputs.workLifeBalance + '%';
  document.getElementById('you-balance-value').textContent = userInputs.workLifeBalance;
  
  document.getElementById('you-social-bar').style.width = userInputs.socialSupport + '%';
  document.getElementById('you-social-value').textContent = userInputs.socialSupport;
  
  // Update insights based on comparison to averages
  updateFactorInsights(userInputs, datasetAverages);
  
  // Create stress radar comparison
  createStressRadarComparison(userInputs, datasetAverages);
}

function updateFactorInsights(user, avg) {
  const academicDiff = user.academicPressure - avg.academic;
  const financialDiff = user.financialStress - avg.financial;
  const balanceDiff = user.workLifeBalance - avg.balance;
  const socialDiff = user.socialSupport - avg.social;
  
  document.getElementById('academic-insight').textContent = 
    academicDiff > 10 ? "You're experiencing high academic pressure" :
    academicDiff > 0 ? "You're slightly above average in academic pressure" :
    "Your academic pressure is manageable compared to most students";
    
  document.getElementById('financial-insight').textContent = 
    financialDiff > 10 ? "You're experiencing significant financial stress" :
    financialDiff > 0 ? "You have moderate financial concerns" :
    "You have lower financial stress than most students";
    
  document.getElementById('balance-insight').textContent = 
    balanceDiff > 15 ? "Your work-life balance is significantly better than average" :
    balanceDiff > 5 ? "You maintain better work-life balance than most" :
    "Your work-life balance could use improvement";
    
  document.getElementById('social-insight').textContent = 
    socialDiff > 15 ? "You feel much more supported than most students" :
    socialDiff > 5 ? "You have good social support" :
    "You may benefit from building stronger support networks";
}

function createStressRadarComparison(user, avg) {
  const container = d3.select('#user-stress-radar');
  container.selectAll('*').remove();
  
  const width = 300;
  const height = 300;
  const radius = Math.min(width, height) / 2 - 40;
  
  const svg = container.append('svg')
    .attr('width', width)
    .attr('height', height);
    
  const g = svg.append('g')
    .attr('transform', `translate(${width/2}, ${height/2})`);
  
  const factors = [
    { name: 'Academic\nPressure', userValue: user.academicPressure, avgValue: avg.academic },
    { name: 'Financial\nStress', userValue: user.financialStress, avgValue: avg.financial },
    { name: 'Work-Life\nBalance', userValue: user.workLifeBalance, avgValue: avg.balance },
    { name: 'Social\nSupport', userValue: user.socialSupport, avgValue: avg.social },
    { name: 'Job\nSecurity', userValue: user.jobSecurity || 50, avgValue: avg.security }
  ];
  
  const angleScale = d3.scaleLinear()
    .domain([0, factors.length])
    .range([0, 2 * Math.PI]);
    
  const radiusScale = d3.scaleLinear()
    .domain([0, 100])
    .range([0, radius]);
  
  // Draw grid circles
  for (let i = 1; i <= 5; i++) {
    g.append('circle')
      .attr('r', (radius / 5) * i)
      .attr('fill', 'none')
      .attr('stroke', '#333')
      .attr('stroke-width', 1);
  }
  
  // Draw axes and labels
  factors.forEach((d, i) => {
    const angle = angleScale(i) - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    g.append('line')
      .attr('x1', 0).attr('y1', 0)
      .attr('x2', x).attr('y2', y)
      .attr('stroke', '#333')
      .attr('stroke-width', 1);
      
    g.append('text')
      .attr('x', Math.cos(angle) * (radius + 25))
      .attr('y', Math.sin(angle) * (radius + 25))
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '10px')
      .text(d.name);
  });
  
  // Draw average line
  const avgLine = d3.lineRadial()
    .angle((d, i) => angleScale(i))
    .radius(d => radiusScale(d.avgValue))
    .curve(d3.curveLinearClosed);
    
  g.append('path')
    .datum(factors)
    .attr('d', avgLine)
    .attr('fill', '#666')
    .attr('fill-opacity', 0.2)
    .attr('stroke', '#666')
    .attr('stroke-width', 2);
  
  // Draw user line
  const userLine = d3.lineRadial()
    .angle((d, i) => angleScale(i))
    .radius(d => radiusScale(d.userValue))
    .curve(d3.curveLinearClosed);
    
  g.append('path')
    .datum(factors)
    .attr('d', userLine)
    .attr('fill', '#00ffff')
    .attr('fill-opacity', 0.3)
    .attr('stroke', '#00ffff')
    .attr('stroke-width', 3);
}

function updatePeerMatching(userInputs) {
  // Calculate similarity and find peer group statistics
  const similarityScore = calculateSimilarityScore(userInputs);
  const peerGroupStats = calculatePeerGroupStats(userInputs);
  
  // Update similarity display
  document.getElementById('similarity-score').textContent = peerGroupStats.count;
  document.getElementById('match-quality-bar').style.width = similarityScore + '%';
  document.querySelector('.match-percentage').textContent = similarityScore + '% similarity match';
  
  // Update peer outcomes
  document.getElementById('peer-healthy-rate').textContent = (100 - peerGroupStats.depressionRate).toFixed(0) + '%';
  document.getElementById('peer-depression-rate').textContent = peerGroupStats.depressionRate.toFixed(0) + '%';
  
  const avgDepression = 58.6;
  const improvement = ((avgDepression - peerGroupStats.depressionRate) / avgDepression * 100);
  document.getElementById('peer-group-insight').innerHTML = 
    `Students with your profile have a <strong>${improvement.toFixed(0)}% ${improvement > 0 ? 'lower' : 'higher'}</strong> depression rate than the general student population.`;
  
  // Create peer depression donut chart
  createPeerDepressionChart(peerGroupStats.depressionRate);
}

function calculateSimilarityScore(userInputs) {
  // Simple similarity calculation based on how close user is to optimal ranges
  let score = 70; // Base score
  
  // Sleep bonus
  if (userInputs.sleepDuration === '7-8' || userInputs.sleepDuration === '8') score += 15;
  else if (userInputs.sleepDuration === '5-6') score += 5;
  
  // Stress factors
  if (userInputs.academicPressure <= 70) score += 5;
  if (userInputs.financialStress <= 50) score += 5;
  if (userInputs.workLifeBalance >= 60) score += 10;
  if (userInputs.socialSupport >= 70) score += 10;
  
  return Math.min(95, score);
}

function calculatePeerGroupStats(userInputs) {
  // Simulate peer group based on user inputs
  let baseCount = 847;
  let baseDepression = 58.6;
  
  // Adjust based on protective/risk factors
  if (userInputs.sleepDuration === '7-8' || userInputs.sleepDuration === '8') {
    baseDepression -= 16; // Sleep is protective
  } else if (userInputs.sleepDuration === '5') {
    baseDepression += 12;
  }
  
  if (userInputs.workLifeBalance >= 70) baseDepression -= 8;
  if (userInputs.socialSupport >= 70) baseDepression -= 6;
  if (userInputs.academicPressure >= 80) baseDepression += 8;
  if (userInputs.financialStress >= 70) baseDepression += 6;
  
  baseDepression = Math.max(15, Math.min(85, baseDepression));
  
  return {
    count: baseCount,
    depressionRate: baseDepression
  };
}

function createPeerDepressionChart(depressionRate) {
  const container = d3.select('#peer-depression-chart');
  container.selectAll('*').remove();
  
  const width = 200;
  const height = 200;
  const radius = Math.min(width, height) / 2;
  
  const svg = container.append('svg')
    .attr('width', width)
    .attr('height', height);
    
  const g = svg.append('g')
    .attr('transform', `translate(${width/2}, ${height/2})`);
  
  const pie = d3.pie()
    .value(d => d.value)
    .sort(null);
    
  const arc = d3.arc()
    .innerRadius(radius * 0.6)
    .outerRadius(radius);
  
  const data = [
    { label: 'Healthy', value: 100 - depressionRate, color: '#00ff00' },
    { label: 'Depression', value: depressionRate, color: '#ff6b6b' }
  ];
  
  const arcs = g.selectAll('.arc')
    .data(pie(data))
    .enter().append('g')
    .attr('class', 'arc');
    
  arcs.append('path')
    .attr('d', arc)
    .attr('fill', d => d.data.color)
    .attr('stroke', '#333')
    .attr('stroke-width', 2);
    
  // Add center text
  g.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .style('font-size', '16px')
    .style('font-weight', 'bold')
    .style('fill', '#ffffff')
    .text('Your Peers');
}

// Fixed function in post-assessment.js
function showFinalRiskAssessment() {
    // Hide the peer screen
    document.getElementById('peer-matching-screen').classList.add('hidden');
  
    // NOW start the coping strategies (not the original results)
    console.log('🛠️ Moving to coping strategies after post-assessment...');
    
    // Get user inputs from the global scope or retrieve them
    const userInputs = window.currentUserInputs || {
      academicPressure: 50,
      financialStress: 50,
      workLifeBalance: 50,
      socialSupport: 50,
      jobSecurity: 50,
      sleepDuration: '7-8'
    };
  
    // Show coping strategies screen
    const copingScreen = document.getElementById('coping-strategies-screen');
    if (copingScreen) {
      copingScreen.classList.remove('hidden');
      
      // Add entrance animation
      copingScreen.style.opacity = '0';
      copingScreen.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        copingScreen.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        copingScreen.style.opacity = '1';
        copingScreen.style.transform = 'translateY(0)';
      }, 100);
      
      // Personalize the strategies
      setTimeout(() => {
        if (typeof personalizeStrategies === 'function') {
          personalizeStrategies(userInputs);
        }
        if (typeof initializeCopingFeatures === 'function') {
          initializeCopingFeatures();
        }
      }, 200);
      
      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      console.log('✅ Coping strategies screen loaded successfully');
    } else {
      console.error('❌ Coping strategies screen not found in DOM');
    }
  }
  
  // Enhanced post-assessment flow
  window.startPostAssessmentExploration = function(userInputs) {
    console.log('Starting post-assessment exploration with user inputs:', userInputs);
    
    // Store user inputs globally so they can be accessed later
    window.currentUserInputs = userInputs;
    
    // Hide the assessment screen
    document.getElementById('user-profile').classList.add('hidden');
    
    // Populate all the comparison data
    populateUserComparisons(userInputs);
    
    // Show the first comparison screen (sleep comparison)
    document.getElementById('your-sleep-comparison').classList.remove('hidden');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };