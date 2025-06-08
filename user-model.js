// Enhanced integration between user-model.js and main application
// This replaces the existing user profile functionality with the modern assessment

import { createRadarChart } from './script.js';

// Enhanced user data management
class UserAssessment {
  constructor() {
    this.userData = {
      name: 'User',
      depressionRate: 0,
      avgSleep: '6 hours',
      stressLevel: 0.7,
      sleepScore: 65,
      insights: "Complete the assessment to see your personalized insights",
      completed: false,
      detailData: [
        { factor: 'Academic Pressure', value: 50, color: '#ff6b9d' },
        { factor: 'Financial Stress', value: 50, color: '#ffd93d' },
        { factor: 'Work-Life Balance', value: 50, color: '#6bcf7f' },
        { factor: 'Social Support', value: 50, color: '#4ecdc4' },
        { factor: 'Job Security', value: 50, color: '#45b7d1' },
      ],
    };

    this.datasetStats = {
      depressionRate: 58.6,
      totalStudents: 27901,
      avgAcademicPressure: 65.2,
      avgFinancialStress: 52.8,
      avgWorkLifeBalance: 48.3,
      avgSocialSupport: 61.7,
      avgJobSecurity: 45.9,
      sleepDistribution: {
        '5': 34.2, '5-6': 30.1, '7-8': 32.9, '8': 2.8
      },
      riskDistribution: {
        'low': 28.3, 'moderate': 35.1, 'high': 24.2, 'very-high': 12.4
      }
    };

    this.currentStep = 'assessment';
    this.init();
  }

  // Initialize the assessment integration
  init() {
    this.enhanceUserProfileScreen();
    this.setupEventListeners();
    this.createAssessmentStyles();
  }

  // Enhanced user profile screen with modern UI
  enhanceUserProfileScreen() {
    const userProfile = document.getElementById('user-profile');
    if (!userProfile) return;

    // Clear existing content and rebuild with modern design
    userProfile.innerHTML = `
      <div class="assessment-container">
        <div class="assessment-header">
          <div class="step-indicator">
            <div class="step current">1</div>
            <div class="step-line"></div>
            <div class="step">2</div>
            <div class="step-line"></div>
            <div class="step">3</div>
            <div class="step-line"></div>
            <div class="step">4</div>
          </div>
          <h2 class="assessment-title">
            <span class="title-icon">🎯</span>
            Personal Risk Assessment
          </h2>
          <p class="assessment-subtitle">
            Help us understand your situation to provide personalized insights
          </p>
        </div>

        <div class="assessment-content">
          <div class="assessment-left">
            <div class="radar-container">
              <div id="user-chart" class="chart-container"></div>
              <div class="chart-legend">
                <div class="legend-item">
                  <span class="legend-dot academic"></span>
                  Academic Pressure
                </div>
                <div class="legend-item">
                  <span class="legend-dot financial"></span>
                  Financial Stress
                </div>
                <div class="legend-item">
                  <span class="legend-dot balance"></span>
                  Work-Life Balance
                </div>
                <div class="legend-item">
                  <span class="legend-dot support"></span>
                  Social Support
                </div>
                <div class="legend-item">
                  <span class="legend-dot security"></span>
                  Job Security
                </div>
              </div>
            </div>
          </div>

          <div class="assessment-right">
            <div class="assessment-form">
              <div class="form-section">
                <h3>Stress Factors</h3>
                
                <div class="input-group">
                  <label for="ac-pressure">Academic Pressure</label>
                  <div class="slider-container">
                    <input type="range" id="ac-pressure" name="Academic Pressure" 
                           class="assessment-slider" min="0" max="100" value="50">
                    <div class="slider-labels">
                      <span>Low</span>
                      <span class="slider-value" id="ac-pressure-value">50</span>
                      <span>High</span>
                    </div>
                  </div>
                  <div class="input-hint">How overwhelmed do you feel by academic demands?</div>
                </div>

                <div class="input-group">
                  <label for="fin-stress">Financial Stress</label>
                  <div class="slider-container">
                    <input type="range" id="fin-stress" name="Financial Stress" 
                           class="assessment-slider" min="0" max="100" value="50">
                    <div class="slider-labels">
                      <span>Secure</span>
                      <span class="slider-value" id="fin-stress-value">50</span>
                      <span>Stressed</span>
                    </div>
                  </div>
                  <div class="input-hint">How worried are you about money and expenses?</div>
                </div>
              </div>

              <div class="form-section">
                <h3>Support Systems</h3>
                
                <div class="input-group">
                  <label for="wl-balance">Work-Life Balance</label>
                  <div class="slider-container">
                    <input type="range" id="wl-balance" name="Work-Life Balance" 
                           class="assessment-slider" min="0" max="100" value="50">
                    <div class="slider-labels">
                      <span>Poor</span>
                      <span class="slider-value" id="wl-balance-value">50</span>
                      <span>Excellent</span>
                    </div>
                  </div>
                  <div class="input-hint">How well do you balance work/study with personal time?</div>
                </div>

                <div class="input-group">
                  <label for="soc-supp">Social Support</label>
                  <div class="slider-container">
                    <input type="range" id="soc-supp" name="Social Support" 
                           class="assessment-slider" min="0" max="100" value="50">
                    <div class="slider-labels">
                      <span>Isolated</span>
                      <span class="slider-value" id="soc-supp-value">50</span>
                      <span>Supported</span>
                    </div>
                  </div>
                  <div class="input-hint">How connected do you feel to friends, family, and community?</div>
                </div>

                <div class="input-group">
                  <label for="job-sec">Job Security</label>
                  <div class="slider-container">
                    <input type="range" id="job-sec" name="Job Security" 
                           class="assessment-slider" min="0" max="100" value="50">
                    <div class="slider-labels">
                      <span>Uncertain</span>
                      <span class="slider-value" id="job-sec-value">50</span>
                      <span>Confident</span>
                    </div>
                  </div>
                  <div class="input-hint">How confident are you about your career prospects?</div>
                </div>
              </div>

              <div class="form-section">
                <h3>Sleep Patterns</h3>
                
                <div class="input-group">
                  <label for="sleep-amnt">Average Sleep per Night</label>
                  <select id="sleep-amnt" name="Amount of Sleep" class="assessment-select">
                    <option value="5">Less than 5 Hours</option>
                    <option value="5-6">5–6 Hours</option>
                    <option value="7-8" selected>7–8 Hours</option>
                    <option value="8">More than 8 Hours</option>
                  </select>
                  <div class="input-hint">Quality sleep is crucial for mental health</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="assessment-footer">
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" id="assessment-progress"></div>
            </div>
            <div class="progress-text" id="progress-text">Adjust the sliders to see your profile</div>
          </div>
          
          <button id="complete-assessment-btn" class="assessment-button" disabled>
            <span class="button-icon">🎯</span>
            <span class="button-text">Analyze My Risk Profile</span>
            <span class="button-arrow">→</span>
          </button>
          
          <div class="privacy-note">
            <span class="privacy-icon">🔒</span>
            Your responses are confidential and used only for this assessment
          </div>
        </div>
      </div>
    `;

    // Initialize the enhanced assessment
    this.setupSliders();
    this.createRadarChart();
  }

  // Setup enhanced slider interactions
  setupSliders() {
    const sliders = document.querySelectorAll('.assessment-slider');
    
    sliders.forEach(slider => {
      // Update display values and chart
      slider.addEventListener('input', (e) => {
        this.updateSliderValue(e.target);
        this.updateRadarChart();
        this.updateProgress();
      });

      // Enhanced interactions
      slider.addEventListener('mousedown', () => slider.classList.add('active'));
      slider.addEventListener('mouseup', () => slider.classList.remove('active'));
      slider.addEventListener('mouseleave', () => slider.classList.remove('active'));

      // Initialize display
      this.updateSliderValue(slider);
    });

    // Sleep selector
    const sleepSelect = document.getElementById('sleep-amnt');
    sleepSelect.addEventListener('change', () => {
      this.updateProgress();
    });
  }

  // Update individual slider display
  updateSliderValue(slider) {
    const value = slider.value;
    const valueDisplay = document.getElementById(slider.id + '-value');
    
    if (valueDisplay) {
      valueDisplay.textContent = value;
      valueDisplay.style.transform = 'scale(1.1)';
      setTimeout(() => {
        valueDisplay.style.transform = 'scale(1)';
      }, 150);
    }

    // Update slider visual feedback
    const percentage = value / 100;
    const factorName = slider.name;
    
    // Color coding based on factor type
    let hue;
    if (factorName === 'Academic Pressure' || factorName === 'Financial Stress') {
      hue = (1 - percentage) * 120; // Higher values = more red
    } else {
      hue = percentage * 120; // Higher values = more green
    }
    
    slider.style.background = `linear-gradient(to right, 
      hsl(${hue}, 70%, 50%) 0%, 
      hsl(${hue}, 70%, 50%) ${percentage * 100}%, 
      #e9ecef ${percentage * 100}%, 
      #e9ecef 100%)`;

    // Update userData
    const dataPoint = this.userData.detailData.find(d => d.factor === factorName);
    if (dataPoint) {
      dataPoint.value = Number(value);
    }
  }

  // Update radar chart with smooth animations
  updateRadarChart() {
    createRadarChart(this.userData, '#user-chart');
  }

  // Create the initial radar chart
  createRadarChart() {
    createRadarChart(this.userData, '#user-chart');
  }

  // Update assessment progress
  updateProgress() {
    const requiredFields = ['ac-pressure', 'fin-stress', 'wl-balance', 'soc-supp', 'job-sec', 'sleep-amnt'];
    const completedFields = requiredFields.filter(id => {
      const element = document.getElementById(id);
      return element && element.value && element.value !== '0';
    });

    const progressPercent = (completedFields.length / requiredFields.length) * 100;
    const progressFill = document.getElementById('assessment-progress');
    const progressText = document.getElementById('progress-text');
    const completeButton = document.getElementById('complete-assessment-btn');

    if (progressFill) {
      progressFill.style.width = progressPercent + '%';
    }

    if (progressText) {
      if (progressPercent === 100) {
        progressText.textContent = 'Ready to analyze your results!';
        progressText.className = 'progress-text complete';
      } else {
        const remaining = requiredFields.length - completedFields.length;
        progressText.textContent = `${remaining} field${remaining !== 1 ? 's' : ''} remaining`;
        progressText.className = 'progress-text';
      }
    }

    if (completeButton) {
      if (progressPercent === 100) {
        completeButton.disabled = false;
        completeButton.classList.add('enabled');
      } else {
        completeButton.disabled = true;
        completeButton.classList.remove('enabled');
      }
    }
  }

  // Setup event listeners for the flow
  setupEventListeners() {
    // Update the existing "next to user" button to show enhanced assessment
    document.addEventListener('click', (e) => {
      if (e.target.id === 'next-to-user') {
        this.showAssessment();
      } else if (e.target.id === 'complete-assessment-btn') {
        this.completeAssessment();
      }
    });
  }

  // Show the assessment (called from risk panels)
  showAssessment() {
    document.getElementById('risk-panels-screen').classList.add('hidden');
    document.getElementById('user-profile').classList.remove('hidden');
    
    // Smooth entrance animation
    const userProfile = document.getElementById('user-profile');
    userProfile.style.opacity = '0';
    userProfile.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      userProfile.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      userProfile.style.opacity = '1';
      userProfile.style.transform = 'translateY(0)';
    }, 100);

    userProfile.scrollIntoView({ behavior: 'smooth' });
  }

  // Enhanced assessment completion
  completeAssessment() {
    const userInputs = {
      academicPressure: Number(document.getElementById('ac-pressure').value),
      financialStress: Number(document.getElementById('fin-stress').value),
      workLifeBalance: Number(document.getElementById('wl-balance').value),
      socialSupport: Number(document.getElementById('soc-supp').value),
      jobSecurity: Number(document.getElementById('job-sec').value),
      sleepDuration: document.getElementById('sleep-amnt').value
    };

    // Calculate risk with enhanced model
    const result = this.predictDepressionRisk(userInputs);
    this.userData.depressionRate = Math.round(result.risk * 100);
    this.userData.confidence = result.confidence;
    this.userData.completed = true;
    this.userData.userInputs = userInputs;

    // Show results with smooth transition
    this.showResults();
    document.getElementById('user-profile').classList.add('hidden');
    startPostAssessmentExploration(this.userData.userInputs);

  }

  // Enhanced prediction model
  predictDepressionRisk(userInputs) {
    const { academicPressure, financialStress, workLifeBalance, socialSupport, jobSecurity, sleepDuration } = userInputs;
    
    let riskScore = 0.32;
    let confidence = 0.85;
    
    // Sleep Duration (Strongest predictor based on your dataset)
    const sleepImpact = { '5': 0.28, '5-6': 0.18, '7-8': -0.08, '8': -0.12 };
    riskScore += sleepImpact[sleepDuration] || 0.10;
    confidence += 0.05;
    
    // Academic Pressure
    if (academicPressure >= 90) riskScore += 0.22;
    else if (academicPressure >= 80) riskScore += 0.18;
    else if (academicPressure >= 70) riskScore += 0.12;
    else if (academicPressure >= 60) riskScore += 0.08;
    else if (academicPressure >= 40) riskScore += 0.03;
    else riskScore -= 0.05;
    
    // Financial Stress
    if (financialStress >= 90) riskScore += 0.20;
    else if (financialStress >= 80) riskScore += 0.16;
    else if (financialStress >= 70) riskScore += 0.12;
    else if (financialStress >= 60) riskScore += 0.08;
    else if (financialStress >= 40) riskScore += 0.04;
    else riskScore -= 0.03;
    
    // Work-Life Balance (protective when high)
    if (workLifeBalance >= 80) riskScore -= 0.12;
    else if (workLifeBalance >= 70) riskScore -= 0.08;
    else if (workLifeBalance >= 60) riskScore -= 0.04;
    else if (workLifeBalance >= 40) riskScore += 0.02;
    else if (workLifeBalance >= 30) riskScore += 0.08;
    else riskScore += 0.15;
    
    // Social Support (protective when high)
    if (socialSupport >= 80) riskScore -= 0.10;
    else if (socialSupport >= 70) riskScore -= 0.06;
    else if (socialSupport >= 60) riskScore -= 0.03;
    else if (socialSupport >= 40) riskScore += 0.02;
    else if (socialSupport >= 30) riskScore += 0.06;
    else riskScore += 0.12;
    
    // Job Security
    if (jobSecurity >= 80) riskScore -= 0.05;
    else if (jobSecurity >= 60) riskScore -= 0.02;
    else if (jobSecurity >= 40) riskScore += 0.01;
    else if (jobSecurity >= 30) riskScore += 0.04;
    else riskScore += 0.08;
    
    // Interaction effects
    if ((sleepDuration === '5' || sleepDuration === '5-6') && academicPressure >= 75) {
      riskScore += 0.10;
      confidence += 0.03;
    }
    
    if (financialStress >= 70 && socialSupport <= 40) {
      riskScore += 0.08;
      confidence += 0.02;
    }
    
    return {
      risk: Math.max(0.08, Math.min(0.88, riskScore)),
      confidence: Math.min(0.95, confidence)
    };
  }

  // Show results screen
  showResults() {
    // Hide the assessment screen
    document.getElementById('user-profile').classList.add('hidden');
  
    // START the post-assessment flow instead of going to old results
    startPostAssessmentExploration(this.userData.userInputs);
  }

  // Create modern results screen
  createResultsScreen() {
    const screen = document.createElement('div');
    screen.id = 'user-results-screen';
    screen.className = 'results-screen';
    screen.innerHTML = `
      <div class="results-container">
        <div class="results-header">
          <div class="step-indicator">
            <div class="step completed">1</div>
            <div class="step-line completed"></div>
            <div class="step completed">2</div>
            <div class="step-line completed"></div>
            <div class="step current">3</div>
            <div class="step-line"></div>
            <div class="step">4</div>
          </div>
          <h1 class="results-title">
            <span class="title-icon">📊</span>
            Your Personal Risk Assessment
          </h1>
          <p class="results-subtitle">
            Based on analysis of <span class="highlight">27,901 students</span>
          </p>
        </div>

        <div class="results-content">
          <div class="risk-summary">
            <div class="risk-score-container">
              <div class="risk-circle" id="user-risk-circle">
                <div class="risk-percentage" id="user-risk-percentage">0%</div>
                <div class="risk-category" id="user-risk-category">Calculating...</div>
              </div>
              <div class="confidence-bar">
                <div class="confidence-fill" id="user-confidence-fill"></div>
                <span class="confidence-text" id="user-confidence-text">Confidence: 0%</span>
              </div>
            </div>
            
            <div class="risk-comparison">
              <h3>How You Compare</h3>
              <div id="comparison-charts"></div>
            </div>
          </div>

          <div class="insights-panel">
            <div class="insight-card">
              <h3><span class="insight-icon">🎯</span>Key Insights</h3>
              <div id="user-insights-content"></div>
            </div>
            
            <div class="insight-card">
              <h3><span class="insight-icon">💡</span>Recommendations</h3>
              <div id="user-recommendations-content"></div>
            </div>
          </div>
        </div>

        <div class="results-actions">
          <button id="view-coping-strategies" class="results-button primary">
            <span class="button-icon">🛠️</span>
            Get Personalized Coping Strategies
            <span class="button-arrow">→</span>
          </button>
          <button id="restart-assessment" class="results-button secondary">
            <span class="button-icon">↺</span>
            Retake Assessment
          </button>
        </div>
      </div>
    `;

    // Event listeners
    screen.querySelector('#view-coping-strategies').addEventListener('click', () => {
      this.showCopingStrategies();
    });
    
    screen.querySelector('#restart-assessment').addEventListener('click', () => {
      this.restartAssessment();
    });

    return screen;
  }

  // Generate and display results
  generateResults() {
    const riskLevel = this.userData.depressionRate;
    const confidence = this.userData.confidence;
    
    // Animate risk score
    this.animateRiskScore(riskLevel, confidence);
    
    // Generate insights and recommendations
    this.generateInsights();
    
    // Create comparison visualizations
    this.createComparisonCharts();
  }

  // Animate risk score display
  animateRiskScore(riskLevel, confidence) {
    const circle = document.getElementById('user-risk-circle');
    const percentage = document.getElementById('user-risk-percentage');
    const category = document.getElementById('user-risk-category');
    const confidenceFill = document.getElementById('user-confidence-fill');
    const confidenceText = document.getElementById('user-confidence-text');
    
    // Determine risk category and styling
    let riskCategory, riskColor;
    if (riskLevel >= 75) {
      riskCategory = 'Very High Risk';
      riskColor = '#dc3545';
    } else if (riskLevel >= 60) {
      riskCategory = 'High Risk';
      riskColor = '#fd7e14';
    } else if (riskLevel >= 45) {
      riskCategory = 'Moderate Risk';
      riskColor = '#ffc107';
    } else if (riskLevel >= 30) {
      riskCategory = 'Some Risk';
      riskColor = '#20c997';
    } else {
      riskCategory = 'Lower Risk';
      riskColor = '#28a745';
    }
    
    // Animate percentage counter
    let currentPercentage = 0;
    const percentageInterval = setInterval(() => {
      currentPercentage += 1;
      percentage.textContent = currentPercentage + '%';
      
      if (currentPercentage >= riskLevel) {
        clearInterval(percentageInterval);
        percentage.textContent = riskLevel + '%';
      }
    }, 30);
    
    // Update styling
    setTimeout(() => {
      circle.style.borderColor = riskColor;
      circle.className = `risk-circle ${riskCategory.toLowerCase().replace(/\s+/g, '-')}`;
      category.textContent = riskCategory;
      category.style.color = riskColor;
    }, 1000);
    
    // Animate confidence
    setTimeout(() => {
      confidenceFill.style.width = (confidence * 100) + '%';
      confidenceFill.style.backgroundColor = confidence > 0.8 ? '#28a745' : confidence > 0.6 ? '#ffc107' : '#fd7e14';
      confidenceText.textContent = `Confidence: ${Math.round(confidence * 100)}%`;
    }, 2000);
  }

  // Generate personalized insights
  generateInsights() {
    const inputs = this.userData.userInputs;
    const insights = [];
    const recommendations = [];
    
    // Sleep analysis
    if (inputs.sleepDuration === '5' || inputs.sleepDuration === '5-6') {
      insights.push('Poor sleep significantly increases your depression risk');
      recommendations.push('Prioritize 7-8 hours of sleep per night as your #1 mental health strategy');
    } else if (inputs.sleepDuration === '7-8' || inputs.sleepDuration === '8') {
      insights.push('Your healthy sleep pattern is a strong protective factor');
    }
    
    // Academic pressure
    if (inputs.academicPressure >= 75) {
      insights.push('High academic pressure is contributing to your stress levels');
      recommendations.push('Consider time management techniques and academic support resources');
    }
    
    // Financial stress
    if (inputs.financialStress >= 70) {
      insights.push('Financial stress is a significant factor in your risk profile');
      recommendations.push('Explore financial aid options and budgeting resources');
    }
    
    // Social support
    if (inputs.socialSupport <= 40) {
      insights.push('Limited social support increases isolation and risk');
      recommendations.push('Build connections through clubs, study groups, or counseling services');
    }
    
    // Update display
    document.getElementById('user-insights-content').innerHTML = 
      insights.map(insight => `<div class="insight-item">• ${insight}</div>`).join('');
    
    document.getElementById('user-recommendations-content').innerHTML = 
      recommendations.map(rec => `<div class="recommendation-item">→ ${rec}</div>`).join('');
  }

  // Create comparison charts
  createComparisonCharts() {
    // This would create visualizations comparing user to dataset
    // Implementation would use D3.js similar to the existing charts
  }

  // Show coping strategies (simplified version)
  showCopingStrategies() {
    alert('Coping strategies functionality would be implemented here, connecting to mental health resources and personalized recommendations based on the user\'s risk profile.');
  }

  // Restart the assessment
  restartAssessment() {
    // Remove results screen
    const resultsScreen = document.getElementById('user-results-screen');
    if (resultsScreen) {
      resultsScreen.remove();
    }
    
    // Reset data
    this.userData.completed = false;
    this.userData.depressionRate = 0;
    this.userData.userInputs = null;
    
    // Reset form values
    ['ac-pressure', 'fin-stress', 'wl-balance', 'soc-supp', 'job-sec'].forEach(id => {
      const element = document.getElementById(id);
      if (element) element.value = 50;
    });
    
    const sleepSelect = document.getElementById('sleep-amnt');
    if (sleepSelect) sleepSelect.value = '7-8';
    
    // Show assessment screen
    document.getElementById('user-profile').classList.remove('hidden');
    this.updateProgress();
    this.updateRadarChart();
  }

  showOriginalResults() {
    const resultsScreen = this.createResultsScreen();
    document.body.appendChild(resultsScreen);
  
    setTimeout(() => {
      resultsScreen.style.opacity = '1';
      resultsScreen.style.transform = 'translateY(0)';
      this.generateResults();
    }, 100);
  }

  // Create enhanced styling
  createAssessmentStyles() {
    if (document.getElementById('assessment-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'assessment-styles';
    styles.textContent = `
      .assessment-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
        background: rgba(0, 0, 0, 0.9);
        border-radius: 20px;
        border: 2px solid #00ffff;
        box-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
      }

      .assessment-header {
        text-align: center;
        margin-bottom: 3rem;
      }

      .step-indicator {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 2rem;
      }

      .step {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #333;
        color: #00ff00;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        border: 2px solid #00ff00;
        transition: all 0.3s ease;
      }

      .step.current {
        background: #00ffff;
        color: #000;
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
      }

      .step.completed {
        background: #00ff00;
        color: #000;
      }

      .step-line {
        width: 60px;
        height: 2px;
        background: #333;
        margin: 0 10px;
        transition: all 0.3s ease;
      }

      .step-line.completed {
        background: #00ff00;
      }

      .assessment-title {
        font-size: 2.5rem;
        color: #00ffff;
        text-shadow: 0 0 20px #00ffff;
        margin-bottom: 0.5rem;
        font-family: 'Orbitron', monospace;
      }

      .title-icon {
        margin-right: 1rem;
      }

      .assessment-subtitle {
        font-size: 1.2rem;
        color: #ffffff;
        margin-bottom: 2rem;
      }

      .assessment-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3rem;
        margin-bottom: 3rem;
      }

      .assessment-left {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .radar-container {
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid #00ff00;
        border-radius: 15px;
        padding: 2rem;
        width: 100%;
        max-width: 500px;
      }

      .chart-container {
        min-height: 400px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .chart-legend {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-top: 1.5rem;
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        color: #ffffff;
      }

      .legend-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }

      .legend-dot.academic { background: #ff6b9d; }
      .legend-dot.financial { background: #ffd93d; }
      .legend-dot.balance { background: #6bcf7f; }
      .legend-dot.support { background: #4ecdc4; }
      .legend-dot.security { background: #45b7d1; }

      .assessment-right {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid #333;
        border-radius: 15px;
        padding: 2rem;
      }

      .form-section {
        margin-bottom: 2rem;
      }

      .form-section h3 {
        color: #00ffff;
        margin-bottom: 1.5rem;
        font-size: 1.3rem;
        border-bottom: 2px solid #00ffff;
        padding-bottom: 0.5rem;
      }

      .input-group {
        margin-bottom: 2rem;
      }

      .input-group label {
        display: block;
        color: #ffffff;
        margin-bottom: 0.5rem;
        font-weight: 600;
        font-size: 1.1rem;
      }

      .slider-container {
        position: relative;
        margin-bottom: 0.5rem;
      }

      .assessment-slider {
        width: 100%;
        height: 8px;
        border-radius: 4px;
        background: #333;
        outline: none;
        cursor: pointer;
        transition: all 0.3s ease;
        -webkit-appearance: none;
        appearance: none;
      }

      .assessment-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #00ffff;
        cursor: pointer;
        border: 3px solid #fff;
        box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        transition: all 0.3s ease;
      }

      .assessment-slider::-moz-range-thumb {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #00ffff;
        cursor: pointer;
        border: 3px solid #fff;
        box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
      }

      .assessment-slider.active::-webkit-slider-thumb {
        transform: scale(1.2);
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
      }

      .slider-labels {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 0.5rem;
        font-size: 0.9rem;
        color: #999;
      }

      .slider-value {
        background: #00ffff;
        color: #000;
        padding: 0.2rem 0.5rem;
        border-radius: 12px;
        font-weight: bold;
        font-size: 0.9rem;
        min-width: 35px;
        text-align: center;
        transition: transform 0.3s ease;
      }

      .input-hint {
        font-size: 0.85rem;
        color: #666;
        margin-top: 0.5rem;
        font-style: italic;
      }

      .assessment-select {
        width: 100%;
        padding: 0.75rem;
        background: rgba(0, 0, 0, 0.5);
        border: 2px solid #333;
        border-radius: 8px;
        color: #ffffff;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .assessment-select:focus {
        border-color: #00ffff;
        box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
        outline: none;
      }

      .assessment-select option {
        background: #000;
        color: #fff;
      }

      .assessment-footer {
        text-align: center;
      }

      .progress-container {
        margin-bottom: 2rem;
      }

      .progress-bar {
        width: 100%;
        max-width: 500px;
        height: 8px;
        background: #333;
        border-radius: 4px;
        margin: 0 auto 1rem;
        overflow: hidden;
        border: 1px solid #00ff00;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #00ff00, #00ffff);
        width: 0%;
        transition: width 0.5s ease;
        border-radius: 4px;
      }

      .progress-text {
        color: #ffffff;
        font-size: 1rem;
        margin-bottom: 1rem;
      }

      .progress-text.complete {
        color: #00ff00;
        font-weight: 600;
      }

      .assessment-button {
        background: linear-gradient(45deg, #00ff00, #00ffff);
        color: #000;
        border: none;
        padding: 1rem 2rem;
        border-radius: 50px;
        font-size: 1.2rem;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
        font-family: 'Orbitron', monospace;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .assessment-button:hover:not(:disabled) {
        transform: translateY(-3px);
        box-shadow: 0 10px 25px rgba(0, 255, 255, 0.4);
      }

      .assessment-button:disabled {
        background: #333;
        color: #666;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      .assessment-button.enabled {
        animation: buttonGlow 2s ease-in-out infinite alternate;
      }

      @keyframes buttonGlow {
        from { box-shadow: 0 0 20px rgba(0, 255, 255, 0.3); }
        to { box-shadow: 0 0 30px rgba(0, 255, 255, 0.6); }
      }

      .button-icon {
        font-size: 1.3rem;
      }

      .button-arrow {
        transition: transform 0.3s ease;
      }

      .assessment-button:hover:not(:disabled) .button-arrow {
        transform: translateX(5px);
      }

      .privacy-note {
        margin-top: 1rem;
        font-size: 0.9rem;
        color: #666;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
      }

      .privacy-icon {
        color: #00ff00;
      }

      /* Results Screen Styles */
      .results-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #0f0f23 0%, #1a1a3a 50%, #0f0f23 100%);
        z-index: 1000;
        overflow-y: auto;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s ease-out;
      }

      .results-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }

      .results-header {
        text-align: center;
        margin-bottom: 3rem;
      }

      .results-title {
        font-size: 2.5rem;
        color: #00ffff;
        text-shadow: 0 0 20px #00ffff;
        margin-bottom: 0.5rem;
        font-family: 'Orbitron', monospace;
      }

      .results-subtitle {
        font-size: 1.2rem;
        color: #ffffff;
      }

      .highlight {
        color: #00ff00;
        font-weight: 600;
      }

      .results-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3rem;
        margin-bottom: 3rem;
        flex: 1;
      }

      .risk-summary {
        background: rgba(0, 0, 0, 0.7);
        border: 2px solid #ff00ff;
        border-radius: 20px;
        padding: 2rem;
      }

      .risk-score-container {
        text-align: center;
        margin-bottom: 2rem;
      }

      .risk-circle {
        width: 200px;
        height: 200px;
        border: 8px solid #333;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1rem;
        transition: all 1s ease;
        position: relative;
      }

      .risk-circle::before {
        content: '';
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        border-radius: 50%;
        background: conic-gradient(from 0deg, transparent, currentColor, transparent);
        z-index: -1;
        animation: rotate 3s linear infinite;
      }

      @keyframes rotate {
        to { transform: rotate(360deg); }
      }

      .risk-percentage {
        font-size: 3rem;
        font-weight: 900;
        color: #ffffff;
        font-family: 'Orbitron', monospace;
      }

      .risk-category {
        font-size: 1.1rem;
        font-weight: 600;
        margin-top: 0.5rem;
      }

      .confidence-bar {
        width: 200px;
        height: 8px;
        background: #333;
        border-radius: 4px;
        margin: 0 auto;
        overflow: hidden;
        border: 1px solid #00ff00;
      }

      .confidence-fill {
        height: 100%;
        width: 0%;
        border-radius: 4px;
        transition: all 1s ease;
      }

      .confidence-text {
        display: block;
        margin-top: 0.5rem;
        color: #ffffff;
        font-size: 0.9rem;
      }

      .risk-comparison h3 {
        color: #00ffff;
        margin-bottom: 1rem;
        text-align: center;
      }

      .insights-panel {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .insight-card {
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid #00ff00;
        border-radius: 15px;
        padding: 1.5rem;
        flex: 1;
      }

      .insight-card h3 {
        color: #00ff00;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .insight-icon {
        font-size: 1.2rem;
      }

      .insight-item, .recommendation-item {
        color: #ffffff;
        margin-bottom: 0.5rem;
        line-height: 1.5;
      }

      .recommendation-item {
        color: #00ffff;
      }

      .results-actions {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-top: 2rem;
      }

      .results-button {
        padding: 1rem 2rem;
        border: none;
        border-radius: 50px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
        font-family: 'Orbitron', monospace;
        text-transform: uppercase;
      }

      .results-button.primary {
        background: linear-gradient(45deg, #ff00ff, #00ffff);
        color: #000;
      }

      .results-button.secondary {
        background: rgba(0, 0, 0, 0.5);
        color: #ffffff;
        border: 2px solid #00ff00;
      }

      .results-button:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .assessment-content {
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        .results-content {
          grid-template-columns: 1fr;
        }

        .assessment-title {
          font-size: 2rem;
        }

        .results-title {
          font-size: 2rem;
        }

        .results-actions {
          flex-direction: column;
          align-items: center;
        }
      }

      /* Risk Level Specific Styles */
      .risk-circle.very-high-risk {
        border-color: #dc3545;
        color: #dc3545;
      }

      .risk-circle.high-risk {
        border-color: #fd7e14;
        color: #fd7e14;
      }

      .risk-circle.moderate-risk {
        border-color: #ffc107;
        color: #ffc107;
      }

      .risk-circle.some-risk {
        border-color: #20c997;
        color: #20c997;
      }

      .risk-circle.lower-risk {
        border-color: #28a745;
        color: #28a745;
      }
    `;
    
    document.head.appendChild(styles);
  }
}

// Initialize the integrated assessment when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if we're not already in a user assessment flow
  if (!window.userAssessmentInitialized) {
    window.userAssessment = new UserAssessment();
    window.userAssessmentInitialized = true;
    console.log('✅ Integrated User Assessment initialized');
  }
});

// Export for use in other modules
export { UserAssessment };