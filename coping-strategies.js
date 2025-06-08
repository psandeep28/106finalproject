// Fixed coping-strategies.js - REMOVED the conflicting startPostAssessmentExploration function

// Integration script to connect everything together
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔗 Initializing coping strategies integration...');
    
    // REMOVED THE CONFLICTING FUNCTION - let post-assessment.js handle the flow
    
    // Enhanced personalization function
    function personalizeStrategies(userInputs) {
      console.log('🎯 Personalizing strategies for user...', userInputs);
      
      try {
        // Calculate risk level
        const riskLevel = calculateUserRisk(userInputs);
        updateRiskSummary(riskLevel, userInputs);
        
        // Personalize each strategy card
        personalizeIndividualStrategies(userInputs);
        
        // Set priority levels
        setPriorityLevels(userInputs);
        
        console.log('✅ Strategy personalization complete');
      } catch (error) {
        console.error('❌ Error personalizing strategies:', error);
      }
    }
    
    function calculateUserRisk(userInputs) {
      // Simplified risk calculation based on your model
      let risk = 0.3; // Base risk
      
      // Sleep impact (strongest factor)
      const sleepImpacts = {
        '5': 0.25,
        '5-6': 0.15,
        '7-8': -0.05,
        '8': -0.10
      };
      risk += sleepImpacts[userInputs.sleepDuration] || 0.05;
      
      // Other factors
      risk += (userInputs.academicPressure - 50) * 0.002;
      risk += (userInputs.financialStress - 50) * 0.002;
      risk -= (userInputs.workLifeBalance - 50) * 0.002;
      risk -= (userInputs.socialSupport - 50) * 0.0015;
      
      return Math.max(0.1, Math.min(0.9, risk));
    }
    
    function updateRiskSummary(riskLevel, userInputs) {
      const summaryElement = document.getElementById('user-risk-summary');
      if (!summaryElement) return;
      
      const percentage = Math.round(riskLevel * 100);
      let category, color, message;
      
      if (percentage >= 70) {
        category = 'High Risk';
        color = '#dc3545';
        message = 'Your assessment indicates elevated risk factors. These strategies are especially important.';
      } else if (percentage >= 50) {
        category = 'Moderate Risk';
        color = '#ffc107';
        message = 'Your assessment shows some risk factors. These strategies can help build resilience.';
      } else {
        category = 'Lower Risk';
        color = '#28a745';
        message = 'Your assessment shows good protective factors. These strategies help maintain wellbeing.';
      }
      
      summaryElement.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
          <div style="font-size: 2rem; font-weight: bold; color: ${color};">${percentage}%</div>
          <div>
            <div style="color: ${color}; font-weight: bold; font-size: 1.1rem;">${category}</div>
            <div style="color: #ccc; font-size: 0.9rem;">Based on your assessment</div>
          </div>
        </div>
        <p style="margin: 0; color: #fff; line-height: 1.5;">${message}</p>
      `;
    }
    
    function personalizeIndividualStrategies(userInputs) {
      // Social Support
      const socialCard = document.getElementById('social-support-card');
      const socialPersonalized = document.getElementById('social-personalized');
      const socialPriority = document.getElementById('social-priority');
      
      if (socialCard && socialPersonalized && socialPriority) {
        if (userInputs.socialSupport <= 40) {
          socialPersonalized.textContent = "Your assessment shows you may feel isolated. Building social connections is crucial and should be a top priority.";
          socialPriority.textContent = "High Priority";
          socialPriority.className = "priority-badge high";
          socialCard.setAttribute('data-priority', 'high');
        } else if (userInputs.socialSupport <= 60) {
          socialPersonalized.textContent = "Your social support could be stronger. Nurturing relationships will boost your resilience.";
          socialPriority.textContent = "Medium Priority";
          socialPriority.className = "priority-badge medium";
        } else {
          socialPersonalized.textContent = "You have good social support! Continue nurturing these relationships.";
          socialPriority.textContent = "Maintain Current";
          socialPriority.className = "priority-badge low";
        }
      }
      
      // Sleep Strategy (conditional)
      const sleepCard = document.getElementById('sleep-card');
      const sleepPersonalized = document.getElementById('sleep-personalized');
      
      if (sleepCard && sleepPersonalized) {
        if (userInputs.sleepDuration === '5' || userInputs.sleepDuration === '5-6') {
          sleepCard.style.display = 'block';
          sleepCard.setAttribute('data-priority', 'high');
          
          if (userInputs.sleepDuration === '5') {
            sleepPersonalized.textContent = "Getting less than 5 hours significantly increases depression risk. Improving sleep should be your #1 priority.";
          } else {
            sleepPersonalized.textContent = "5-6 hours increases depression risk. Adding 1-2 more hours could dramatically improve your mental health.";
          }
        } else {
          sleepCard.style.display = 'none';
        }
      }
      
      // Self Care
      const selfcarePersonalized = document.getElementById('selfcare-personalized');
      const selfcarePriority = document.getElementById('selfcare-priority');
      
      if (selfcarePersonalized && selfcarePriority) {
        if (userInputs.workLifeBalance <= 40) {
          selfcarePersonalized.textContent = "Your work-life balance suggests self-care may be challenging. Start small - even one act per day helps.";
          selfcarePriority.textContent = "High Priority";
          selfcarePriority.className = "priority-badge high";
        } else {
          selfcarePersonalized.textContent = "Maintaining consistent self-care routines will help manage stress and maintain wellbeing.";
          selfcarePriority.textContent = "Medium Priority";
          selfcarePriority.className = "priority-badge medium";
        }
      }
      
      // Nutrition
      const nutritionPriority = document.getElementById('nutrition-priority');
      if (nutritionPriority) {
        if (userInputs.academicPressure >= 70 || userInputs.financialStress >= 70) {
          nutritionPriority.textContent = "High Priority";
          nutritionPriority.className = "priority-badge high";
        } else {
          nutritionPriority.textContent = "Medium Priority";
          nutritionPriority.className = "priority-badge medium";
        }
      }
    }
    
    function setPriorityLevels(userInputs) {
      // Exercise is always high priority
      const exerciseCard = document.getElementById('exercise-card');
      if (exerciseCard) {
        exerciseCard.setAttribute('data-priority', 'high');
      }
      
      // Additional priority logic based on user inputs
      if (userInputs.sleepDuration === '5') {
        // Sleep becomes ultra-high priority
        const sleepCard = document.getElementById('sleep-card');
        if (sleepCard) {
          sleepCard.style.borderColor = '#dc3545';
          sleepCard.style.boxShadow = '0 0 20px rgba(220, 53, 69, 0.4)';
        }
      }
    }
    
    function initializeCopingFeatures() {
      console.log('🎮 Initializing interactive features...');
      
      try {
        // Progress tracking
        setupProgressTracking();
        
        // Gratitude journal
        setupGratitudeJournal();
        
        // Footer buttons
        setupFooterActions();
        
        // Resource buttons
        setupResourceButtons();
        
        console.log('✅ Interactive features initialized');
      } catch (error) {
        console.error('❌ Error initializing features:', error);
      }
    }
    
    function setupProgressTracking() {
      const checkboxes = document.querySelectorAll('.strategy-checkbox');
      let completedStrategies = 0;
      
      checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
          updateProgressCounters();
          showProgressFeedback(checkbox);
        });
      });
      
      function updateProgressCounters() {
        const strategies = new Set();
        document.querySelectorAll('.strategy-checkbox:checked').forEach(cb => {
          strategies.add(cb.dataset.strategy);
        });
        
        const completedEl = document.getElementById('completed-strategies');
        if (completedEl) completedEl.textContent = strategies.size;
        
        const weeklyEl = document.getElementById('weekly-checkins');
        if (weeklyEl) weeklyEl.textContent = Math.min(strategies.size, 7);
      }
      
      function showProgressFeedback(checkbox) {
        const card = checkbox.closest('.strategy-card');
        if (!card) return;
        
        const checkedInCard = card.querySelectorAll('.strategy-checkbox:checked').length;
        const totalInCard = card.querySelectorAll('.strategy-checkbox').length;
        
        if (checkedInCard === totalInCard) {
          card.classList.add('completed');
          showSuccessMessage(card.querySelector('h3').textContent);
        } else {
          card.classList.remove('completed');
        }
      }
      
      function showSuccessMessage(strategyName) {
        const message = document.createElement('div');
        message.style.cssText = `
          position: fixed; top: 20px; right: 20px; z-index: 1000;
          background: linear-gradient(45deg, #28a745, #20c997);
          color: white; padding: 1rem 1.5rem; border-radius: 10px;
          font-family: 'Orbitron', monospace; font-weight: 600;
          box-shadow: 0 5px 15px rgba(40, 167, 69, 0.3);
          animation: slideInRight 0.5s ease-out;
        `;
        message.innerHTML = `<span style="margin-right: 0.5rem;">✅</span>Great progress with ${strategyName}!`;
        
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 3000);
      }
    }
    
    function setupGratitudeJournal() {
      const input = document.getElementById('gratitude-input');
      const button = document.getElementById('save-gratitude');
      const container = document.getElementById('gratitude-entries');
      
      if (!input || !button || !container) return;
      
      let entries = [];
      
      button.addEventListener('click', () => {
        const text = input.value.trim();
        if (!text) return;
        
        const entry = {
          text: text,
          date: new Date().toLocaleDateString(),
          id: Date.now()
        };
        
        entries.unshift(entry);
        if (entries.length > 10) entries.pop(); // Keep last 10
        
        input.value = '';
        displayEntries();
        updateGratitudeCounter();
      });
      
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          button.click();
        }
      });
      
      function displayEntries() {
        if (entries.length === 0) {
          container.innerHTML = '<p style="color: #666; font-style: italic;">Your gratitude entries will appear here...</p>';
          return;
        }
        
        container.innerHTML = entries.map(entry => `
          <div class="gratitude-entry">
            <div class="entry-date">${entry.date}</div>
            <div>${entry.text}</div>
          </div>
        `).join('');
      }
      
      function updateGratitudeCounter() {
        const counter = document.getElementById('gratitude-entries-count');
        if (counter) counter.textContent = entries.length;
      }
      
      displayEntries();
    }
    
    function setupFooterActions() {
      const returnBtn = document.getElementById('return-to-assessment');
      const shareBtn = document.getElementById('share-strategies');
      const saveBtn = document.getElementById('save-strategies');
      
      if (returnBtn) {
        returnBtn.addEventListener('click', () => {
          document.getElementById('coping-strategies-screen').classList.add('hidden');
          document.getElementById('user-profile').classList.remove('hidden');
        });
      }
      
      if (shareBtn) {
        shareBtn.addEventListener('click', () => {
          const text = `I'm working on my mental health with evidence-based coping strategies:
  
  🤝 Staying connected with support network
  🏃‍♂️ Regular exercise (even 20 min helps!)
  🛁 Maintaining self-care routines
  🥗 Focusing on nutritious eating
  📝 Keeping a gratitude journal
  
  Remember: You're not alone, help is available.
  Emergency: 911 | Crisis: 988`;
  
          if (navigator.share) {
            navigator.share({ title: 'Mental Health Strategies', text });
          } else if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
          } else {
            prompt('Copy this text:', text);
          }
        });
      }
      
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          alert('Your personalized plan has been saved for this session!');
        });
      }
    }
    
    function setupResourceButtons() {
      document.querySelectorAll('.resource-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const resourceType = e.target.closest('.resource-card').querySelector('h3').textContent;
          
          const resources = {
            'Campus Counseling': 'https://www.google.com/search?q=university+counseling+services',
            'Therapy': 'https://www.psychologytoday.com/us/therapists',
            'Support Groups': 'https://www.nami.org/Support-Education/Support-Groups'
          };
          
          if (resources[resourceType]) {
            if (confirm(`This will open a new tab to search for ${resourceType}. Continue?`)) {
              window.open(resources[resourceType], '_blank');
            }
          } else {
            alert(`For ${resourceType}: Contact your healthcare provider or student services.`);
          }
        });
      });
    }
    
    // Make functions globally available (but NOT startPostAssessmentExploration!)
    window.personalizeStrategies = personalizeStrategies;
    window.initializeCopingFeatures = initializeCopingFeatures;
    
    console.log('✅ Coping strategies integration ready');
});