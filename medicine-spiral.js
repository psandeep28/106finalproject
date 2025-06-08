// medicine-spiral.js

const MedicineSpiral = {

  data: {
      all: [],
      filtered: [],
      currentDegree: 'all',
      currentPressure: 10,
      sleepToRadius: {
        'Less than 5 hours': 80,        
        '5-6 hours': 140,               
        '7-8 hours': 220,               
        'More than 8 hours': 300,      
        'Unknown': 180,                 
        'less than 5 hours': 80,
        '5-6': 140,
        '7-8': 220,
        'more than 8 hours': 300
      }
    },
      
      // Main render function
      render: function() {
        // Clear any existing content
        d3.select("#medicine-analysis-screen .container").selectAll(".spiral-content").remove();
        d3.select("#spiral-container").selectAll("*").remove();
        d3.selectAll('.medicine-spiral-tooltip').remove();
        
        // Create the main container structure
        const mainContainer = d3.select("#medicine-analysis-screen .container");
        const spiralContent = mainContainer.append("div").attr("class", "spiral-content");
        
        // Build the UI with enhanced header
        this.createHeader(spiralContent);
        this.createControls(spiralContent);
        this.createSVGContainer(spiralContent);
        this.createLegends(spiralContent);
        this.createStats(spiralContent);
        this.createTooltip();
        
        // Load and process the data
        this.loadData();
      },
      
      // NEW: Create enhanced header with title and description
      createHeader: function(container) {
        const header = container.append("div")
          .attr("class", "spiral-header")
          .style("text-align", "center")
          .style("margin-bottom", "2rem")
          .style("padding", "2rem")
          .style("background", "rgba(0, 0, 0, 0.7)")
          .style("border", "2px solid #00ffcc")
          .style("border-radius", "15px")
          .style("box-shadow", "0 0 20px rgba(0, 255, 204, 0.3)");
        
        // Main title
        header.append("h2")
          .attr("class", "spiral-title")
          .style("color", "#00ffcc")
          .style("font-size", "2rem")
          .style("font-family", "Orbitron, monospace")
          .style("margin-bottom", "1rem")
          .style("text-shadow", "0 0 10px rgba(0, 255, 204, 0.5)")
          .html("🌀 The Mental Health Spiral: Sleep vs Academic Pressure");
        
        // Descriptive text
        header.append("p")
          .attr("class", "spiral-description")
          .style("color", "#ffffff")
          .style("font-size", "1.1rem")
          .style("line-height", "1.6")
          .style("max-width", "800px")
          .style("margin", "0 auto 1rem auto")
          .html("This visualization reveals how sleep deprivation creates a dangerous spiral for medicine students. Each dot represents a student - their <strong style='color: #00ff00;'>distance from center shows sleep hours</strong>, while <strong style='color: #ffff00;'>dot size represents study hours</strong>. Notice how students closest to the center (danger zone) often struggle with both sleep and mental health.");
      },
    
    createControls: function(container) {
      const controls = container.append("div")
        .attr("class", "controls")
        .style("display", "flex")
        .style("justify-content", "center")
        .style("gap", "30px")
        .style("margin-bottom", "20px")
        .style("flex-wrap", "wrap");
        
      // Degree filters
      const degreeFilters = controls.append("div")
        .attr("class", "degree-filters")
        .style("display", "flex")
        .style("gap", "10px");
        
      const degrees = ['all', 'B.Pharm', 'M.Pharm', 'BSc', 'MSc'];
      degrees.forEach((degree, i) => {
        degreeFilters.append("button")
          .attr("class", `degree-btn ${i === 0 ? 'active' : ''}`)
          .attr("data-degree", degree)
          .text(degree === 'all' ? 'All Medicine' : degree)
          .on("click", function() {
            MedicineSpiral.handleDegreeFilter(this);
          });
      });
      
      // Pressure slider
      const pressureSlider = controls.append("div")
        .attr("class", "pressure-slider")
        .style("display", "flex")
        .style("align-items", "center")
        .style("gap", "15px");
        
      pressureSlider.append("label")
        .text("Academic Pressure:")
        .style("color", "#00ffcc");
        
      pressureSlider.append("input")
        .attr("type", "range")
        .attr("id", "pressure-filter")
        .attr("min", "0")
        .attr("max", "10")
        .attr("value", "10")
        .attr("step", "1")
        .on("input", function() {
          MedicineSpiral.handlePressureFilter(this);
        });
        
      pressureSlider.append("span")
        .attr("class", "pressure-value")
        .text("All");
    },
    
    createSVGContainer: function(container) {
      container.append("div")
        .attr("id", "spiral-container")
        .style("text-align", "center")
        .style("position", "relative");
    },
    
    createLegends: function(container) {
      // Main legend
      const legend = container.append("div")
        .attr("class", "legend")
        .style("display", "flex")
        .style("justify-content", "center")
        .style("gap", "40px")
        .style("margin-top", "30px")
        .style("flex-wrap", "wrap");
        
      const legendItems = [
        { color: '#ff4444', text: 'With Depression' },
        { color: '#4488ff', text: 'Without Depression' }
      ];
      
      legendItems.forEach(item => {
        const legendItem = legend.append("div")
          .attr("class", "legend-item")
          .style("display", "flex")
          .style("align-items", "center")
          .style("gap", "10px");
          
        legendItem.append("div")
          .style("width", "16px")
          .style("height", "16px")
          .style("border-radius", "50%")
          .style("background", item.color);
          
        legendItem.append("span")
          .text(item.text)
          .style("color", "#fff");
      });
      
      // Size legend
      const sizeLegend = legend.append("div")
        .attr("class", "legend-item")
        .style("display", "flex")
        .style("align-items", "center")
        .style("gap", "10px");
        
      sizeLegend.append("span")
        .style("font-size", "20px")
        .text("⭕");
        
      sizeLegend.append("span")
        .text("Larger = More Study Hours")
        .style("color", "#fff");
      
      // Sleep legend
      this.createSleepLegend(container);
    },
    
    createSleepLegend: function(container) {
      const sleepLegend = container.append("div")
        .attr("class", "sleep-legend")
        .style("background", "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)")
        .style("border", "2px solid #00ffcc")
        .style("border-radius", "15px")
        .style("padding", "20px")
        .style("margin", "30px auto")
        .style("max-width", "600px")
        .style("text-align", "center");
        
      sleepLegend.append("h3")
        .text("Distance from Center = Hours of Sleep")
        .style("color", "#00ffcc")
        .style("margin-bottom", "20px");
        
      const legendItems = [
        { class: 'center', label: 'Center (Danger Zone)', desc: 'Less than 5 hours' },
        { class: 'inner', label: 'Inner Ring', desc: '5-6 hours' },
        { class: 'middle', label: 'Middle Ring', desc: '7-8 hours' },
        { class: 'outer', label: 'Outer Ring', desc: 'More than 8 hours' }
      ];
      
      const legendContainer = sleepLegend.append("div")
        .style("display", "grid")
        .style("grid-template-columns", "repeat(auto-fit, minmax(250px, 1fr))")
        .style("gap", "15px")
        .style("text-align", "left");
        
      legendItems.forEach(item => {
        const legendItem = legendContainer.append("div")
          .style("display", "flex")
          .style("align-items", "center")
          .style("gap", "15px");
          
        const indicator = legendItem.append("div")
          .style("width", item.class === 'center' ? "40px" : 
                 item.class === 'inner' ? "35px" : 
                 item.class === 'middle' ? "30px" : "25px")
          .style("height", item.class === 'center' ? "40px" : 
                  item.class === 'inner' ? "35px" : 
                  item.class === 'middle' ? "30px" : "25px")
          .style("border-radius", "50%")
          .style("background", item.class === 'center' ? "radial-gradient(circle, #ff0000 0%, #660000 100%)" :
                  item.class === 'inner' ? "radial-gradient(circle, #ff6600 0%, #663300 100%)" :
                  item.class === 'middle' ? "radial-gradient(circle, #ffaa00 0%, #665500 100%)" :
                  "radial-gradient(circle, #00ff00 0%, #006600 100%)");
                  
        if (item.class === 'center') {
          indicator.style("animation", "pulse 2s infinite");
        }
          
        legendItem.append("span")
          .html(`<strong style="color: #fff;">${item.label}</strong>: ${item.desc}`)
          .style("color", "#ccc")
          .style("font-size", "0.9em");
      });
    },
    
    createStats: function(container) {
      const stats = container.append("div")
        .attr("class", "stats")
        .style("display", "grid")
        .style("grid-template-columns", "repeat(auto-fit, minmax(220px, 1fr))")
        .style("gap", "20px")
        .style("margin-top", "40px");
        
      const statCards = [
        { id: 'total-students', label: 'Total Students' },
        { id: 'avg-sleep', label: 'Avg Sleep Hours' },
        { id: 'depression-rate', label: 'Depression Rate' },
        { id: 'sleep-deprived', label: 'Sleep Deprived (<6hrs)' }
      ];
      
      statCards.forEach(stat => {
        const card = stats.append("div")
          .attr("class", "stat-card")
          .style("background", "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)")
          .style("padding", "25px")
          .style("border-radius", "15px")
          .style("border", "1px solid #333")
          .style("text-align", "center");
          
        card.append("div")
          .attr("id", stat.id)
          .style("font-size", "2.5em")
          .style("color", "#00ffcc")
          .style("font-weight", "bold")
          .text("0");
          
        card.append("div")
          .style("color", "#888")
          .style("margin-top", "8px")
          .text(stat.label);
      });
    },
    
    createTooltip: function() {
      if (d3.select(".medicine-spiral-tooltip").empty()) {
        d3.select("body").append("div")
          .attr("class", "medicine-spiral-tooltip")
          .style("position", "absolute")
          .style("padding", "15px")
          .style("background", "rgba(0, 0, 0, 0.95)")
          .style("border", "2px solid #00ffcc")
          .style("border-radius", "8px")
          .style("pointer-events", "none")
          .style("opacity", 0)
          .style("font-size", "14px")
          .style("line-height", "1.6")
          .style("color", "#fff")
          .style("font-family", "Orbitron");
      }
    },
    
    // In the loadData function, clean the sleep duration data:
loadData: function() {
    d3.csv("data/student_depression_dataset.csv").then(data => {
      // Filter for medicine students
      const medicineData = data.filter(d => {
        const degree = d.Degree ? d.Degree.replace(/\./g, '').replace(/\s+/g, '').toUpperCase() : '';
        return ['BPHARM', 'MPHARM', 'BSC', 'MSC'].includes(degree);
      });
      
      // Process and clean data
      this.data.all = medicineData.map((d, i) => {
        // Clean sleep duration field
        let sleepDuration = d['Sleep Duration'] || 'Unknown';
        sleepDuration = sleepDuration.trim();
        
        // Standardize sleep duration values
        if (sleepDuration.includes('Less than 5') || sleepDuration.includes('< 5')) {
          sleepDuration = 'Less than 5 hours';
        } else if (sleepDuration.includes('5-6') || sleepDuration.includes('5–6')) {
          sleepDuration = '5-6 hours';
        } else if (sleepDuration.includes('7-8') || sleepDuration.includes('7–8')) {
          sleepDuration = '7-8 hours';
        } else if (sleepDuration.includes('More than 8') || sleepDuration.includes('> 8')) {
          sleepDuration = 'More than 8 hours';
        }
        
        return {
          id: `med-${i}`,
          Degree: d.Degree,
          'Sleep Duration': sleepDuration,
          'Work/Study Hours': +d['Work/Study Hours'] || 0,
          'Academic Pressure': +d['Academic Pressure'] || 0,
          Depression: +d.Depression || 0,
          Gender: d.Gender,
          Age: +d.Age || 0,
          'Financial Stress': d['Financial Stress'],
          'Suicidal Thoughts': d['Have you ever had suicidal thoughts ?']
        };
      });
      
      console.log("Processed medicine students:", this.data.all.length);
      console.log("Sleep duration distribution:", 
        d3.rollup(this.data.all, v => v.length, d => d['Sleep Duration'])
      );
      
      this.data.filtered = this.data.all;
      this.initializeVisualization();
      
    }).catch(error => {
      console.error("Error loading data:", error);
    });
  },
    
    initializeVisualization: function() {
      const width = 900;
      const height = 650;
      const centerX = width / 2;
      const centerY = height / 2;
      
      const svg = d3.select("#spiral-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
        
      // Add gradients
      const defs = svg.append("defs");
      this.createGradients(defs);
      
      const g = svg.append("g").attr("class", "spiral-group");
      
      // Draw static elements
      this.drawSpiralGuides(g, centerX, centerY);
      this.drawCenterVortex(g, centerX, centerY);
      
      // Initial update
      this.updateVisualization();
    },
    
    createGradients: function(defs) {
      // Depression gradient
      const depGradient = defs.append("radialGradient")
        .attr("id", "med-depression-gradient");
      depGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#ff6666");
      depGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#ff0000");
        
      // Healthy gradient
      const healthyGradient = defs.append("radialGradient")
        .attr("id", "med-healthy-gradient");
      healthyGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#6699ff");
      healthyGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#0066ff");
        
      // Vortex gradient
      const vortexGradient = defs.append("radialGradient")
        .attr("id", "med-vortex-gradient");
      vortexGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#ff0000")
        .attr("stop-opacity", 0.8);
      vortexGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#000000")
        .attr("stop-opacity", 1);
    },
    
    drawSpiralGuides: function(g, centerX, centerY) {
        // Remove any existing guides first
        g.selectAll('.spiral-guide').remove();
        
        const sleepZones = [
          { name: 'Less than 5 hours', radius: 80, color: '#ff4444' },
          { name: '5-6 hours', radius: 140, color: '#ff8844' },
          { name: '7-8 hours', radius: 220, color: '#ffaa44' },
          { name: 'More than 8 hours', radius: 300, color: '#44ff44' }
        ];
        
        // Create tooltip for ring info
        const tooltip = d3.select('body').select('.ring-tooltip');
        if (tooltip.empty()) {
          d3.select('body').append('div')
            .attr('class', 'ring-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0, 0, 0, 0.9)')
            .style('color', '#fff')
            .style('padding', '10px')
            .style('border-radius', '5px')
            .style('font-family', 'Orbitron')
            .style('pointer-events', 'none')
            .style('opacity', 0);
        }
        
        // Draw interactive rings
        g.selectAll('.spiral-guide')
          .data(sleepZones)
          .enter()
          .append('circle')
          .attr('class', 'spiral-guide')
          .attr('cx', centerX)
          .attr('cy', centerY)
          .attr('r', d => d.radius)
          .attr('fill', 'none')
          .attr('stroke', d => d.color)
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '8,4')
          .attr('opacity', 0.6)
          .style('cursor', 'pointer')
          .on('mouseover', function(event, d) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('stroke-width', 4)
              .attr('opacity', 1);
            
            d3.select('.ring-tooltip')
              .style('opacity', 1)
              .html(`<strong>${d.name}</strong><br>Ring radius: ${d.radius}px`)
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY - 30) + 'px');
          })
          .on('mouseout', function(event, d) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('stroke-width', 2)
              .attr('opacity', 0.6);
            
            d3.select('.ring-tooltip').style('opacity', 0);
          });
      },
    
    drawCenterVortex: function(g, centerX, centerY) {
        // Remove any existing vortex first
        g.selectAll('.vortex').remove();
        
        const vortex = g.append('g').attr('class', 'vortex');
        
        vortex.append('circle')
          .attr('cx', centerX)
          .attr('cy', centerY)
          .attr('r', 25)
          .attr('fill', 'url(#med-vortex-gradient)')
          .attr('opacity', 0.8);
          
        vortex.append('text')
          .attr('x', centerX)
          .attr('y', centerY + 5)
          .attr('text-anchor', 'middle')
          .attr('fill', '#ff6666')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .attr('font-family', 'Orbitron')
          .text('DANGER');
      },
    
    handleDegreeFilter: function(button) {
      const degree = button.getAttribute('data-degree');
      d3.selectAll('.degree-btn').classed('active', false);
      d3.select(button).classed('active', true);
      this.data.currentDegree = degree;
      this.updateVisualization();
    },
    
    handlePressureFilter: function(input) {
      const value = +input.value;
      this.data.currentPressure = value;
      d3.select('.pressure-value').text(value === 10 ? 'All' : `≤ ${value}`);
      this.updateVisualization();
    },
    
    updateVisualization: function() {
      // Filter data
      this.data.filtered = this.data.all.filter(d => {
        const degreeMatch = this.data.currentDegree === 'all' || 
                           d.Degree === this.data.currentDegree;
        const pressureMatch = this.data.currentPressure === 10 || 
                             d['Academic Pressure'] <= this.data.currentPressure;
        return degreeMatch && pressureMatch;
      });
      
      this.updateStats();
      this.updateSpiral();
    },
    
    updateSpiral: function() {
      const spiralData = this.createSpiralPositions(this.data.filtered);
      const sizeScale = d3.scaleSqrt().domain([0, 16]).range([3, 10]);
      const g = d3.select('.spiral-group');
      
      const dots = g.selectAll('.student-dot')
        .data(spiralData, d => d.id);
        
      // Exit
      dots.exit()
        .transition()
        .duration(500)
        .attr('r', 0)
        .style('opacity', 0)
        .remove();
        
      // Enter
      const newDots = dots.enter()
        .append('circle')
        .attr('class', 'student-dot')
        .attr('cx', 450)
        .attr('cy', 325)
        .attr('r', 0)
        .style('opacity', 0);
        
      // Update
      dots.merge(newDots)
        .transition()
        .duration(1500)
        .delay((d, i) => Math.min(i * 2, 200))
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', d => sizeScale(d['Work/Study Hours']))
        .attr('fill', d => d.Depression ? 'url(#med-depression-gradient)' : 'url(#med-healthy-gradient)')
        .style('opacity', 0.7)
        .attr('stroke', d => d.Depression ? '#ff0000' : '#0066ff')
        .attr('stroke-width', 1);
        
      this.setupDotInteractions(g, sizeScale);
    },
    
    createSpiralPositions: function(data) {
        const centerX = 450;
        const centerY = 325;
        const spiralData = [];
        
        // Debug: log the data to see what we're working with
        console.log("Total students:", data.length);
        console.log("Sleep duration breakdown:", d3.group(data, d => d['Sleep Duration']));
        
        const grouped = d3.group(data, d => d['Sleep Duration']);
        
        grouped.forEach((students, sleepDuration) => {
          console.log(`${sleepDuration}: ${students.length} students`);
          
          const baseRadius = this.data.sleepToRadius[sleepDuration] || 150;
          const numStudents = students.length;
          
          if (numStudents === 0) return;
          
          // Create more spacing between students
          const angleStep = (Math.PI * 2) / Math.max(numStudents, 8); // Minimum 8 positions
          
          students.forEach((student, i) => {
            const angle = i * angleStep + (Math.random() - 0.5) * 0.2; // Add slight randomness
            const radiusVariation = (Math.random() - 0.5) * 30; // Add radius variation
            const finalRadius = Math.max(baseRadius + radiusVariation, 35); // Don't go too close to center
            
            const x = centerX + finalRadius * Math.cos(angle);
            const y = centerY + finalRadius * Math.sin(angle);
            
            // Make sure positions are within bounds
            if (x > 50 && x < 850 && y > 50 && y < 600) {
              spiralData.push({
                ...student,
                x: x,
                y: y,
                originalSleepDuration: sleepDuration,
                debugRadius: finalRadius
              });
            }
          });
        });
        
        console.log("Final spiral data points:", spiralData.length);
        return spiralData;
      },
    
    setupDotInteractions: function(g, sizeScale) {
      const tooltip = d3.select('.medicine-spiral-tooltip');
      
      g.selectAll('.student-dot')
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', d => sizeScale(d['Work/Study Hours']) * 1.5)
            .style('opacity', 1)
            .attr('stroke-width', 3);
            
          tooltip
            .style('opacity', 1)
            .html(`
              <strong style="color: #00ffcc; font-size: 16px;">${d.Degree} Student</strong><br>
              <span style="color: #ccc;">Age: ${d.Age}, ${d.Gender}</span><br><br>
              Sleep: <strong>${d['Sleep Duration']}</strong><br>
              Study Hours: <strong>${d['Work/Study Hours'].toFixed(1)} hrs/day</strong><br>
              Academic Pressure: <strong>${d['Academic Pressure'].toFixed(1)}/10</strong><br>
              Depression: <strong style="color: ${d.Depression ? '#ff6666' : '#66ff66'}">${d.Depression ? 'Yes' : 'No'}</strong><br>
              ${d['Suicidal Thoughts'] === 'Yes' ? '<span style="color: #ff0000;">⚠ Has had suicidal thoughts</span>' : ''}
            `)
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 15) + 'px');
        })
        .on('mouseout', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', d => sizeScale(d['Work/Study Hours']))
            .style('opacity', 0.7)
            .attr('stroke-width', 1);
            
          tooltip.style('opacity', 0);
        });
    },
    
    updateStats: function() {
      const data = this.data.filtered;
      const total = data.length;
      
      if (total === 0) {
        ['total-students', 'avg-sleep', 'depression-rate', 'sleep-deprived'].forEach(id => {
          document.getElementById(id).textContent = id.includes('rate') || id.includes('deprived') ? '0%' : '0';
        });
        return;
      }
      
      const depressed = data.filter(d => d.Depression).length;
      const sleepDeprived = data.filter(d => 
        d['Sleep Duration'] === 'Less than 5 hours' || 
        d['Sleep Duration'] === '5-6 hours'
      ).length;
      
      const avgSleepMap = {
        'Less than 5 hours': 4.5,
        '5-6 hours': 5.5,
        '7-8 hours': 7.5,
        'More than 8 hours': 8.5,
        'Unknown': 6
      };
      
      const avgSleep = data.reduce((sum, d) => 
        sum + (avgSleepMap[d['Sleep Duration']] || 6), 0
      ) / total;
      
      this.animateValue('total-students', 0, total, 1000);
      this.animateValue('avg-sleep', 0, avgSleep, 1000, 1);
      this.animateValue('depression-rate', 0, (depressed / total) * 100, 1000, 1, '%');
      this.animateValue('sleep-deprived', 0, (sleepDeprived / total) * 100, 1000, 1, '%');
    },
    
    animateValue: function(id, start, end, duration, decimals = 0, suffix = '') {
      const element = document.getElementById(id);
      if (!element) return;
      
      const range = end - start;
      const increment = range / (duration / 16);
      let current = start;
      
      const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
          current = end;
          clearInterval(timer);
        }
        element.textContent = current.toFixed(decimals) + suffix;
      }, 16);
    }
  };
  
  // Export for use in other files
  window.MedicineSpiral = MedicineSpiral;