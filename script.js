// Updated script.js with integrated user assessment flow
export { createRadarChart, startGame, goBack };

let careerData = {};
let currentPhase = 0;

const degreeToProfile = {
  'BBA': 'Business', 'MBA': 'Business', 'BCOM': 'Business', 'MCOM': 'Business',
  'BE': 'Engineering', 'BTECH': 'Engineering', 'ME': 'Engineering', 'MTECH': 'Engineering',
  'BCA': 'Engineering', 'MCA': 'Engineering',
  'BA': 'Arts', 'MA': 'Arts', 'LLB': 'Arts', 'PHD': 'Arts', 'BVOC': 'Arts',
  'BPHARM': 'Medicine', 'MPHARM': 'Medicine', 'BSC': 'Medicine', 'MSC': 'Medicine'
};

let animatedStudents = [];

function normalizeDegree(degree) {
  return (degree || '').replace(/\./g, '').replace(/\s+/g, '').toUpperCase();
}

const phaseDescriptions = {
  1: "Phase 1: Grouping students by academic profile...",
  2: "Phase 2: Reorganizing by mental health risk factors...",
  3: "Phase 3: Highlighting those with depression — unity across all fields."
};

function startGame() {
  document.getElementById("welcome-screen").classList.add("hidden");
  document.getElementById("profiles-screen").classList.remove("hidden");
}


function goBack() {
  document.getElementById("profiles-screen").classList.add("hidden");
  document.getElementById("welcome-screen").classList.remove("hidden");
  document.getElementById("visualization-panel").classList.add("hidden");
  
  // Hide any user assessment screens
  const userScreens = ['user-profile', 'user-results-screen'];
  userScreens.forEach(screenId => {
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.add('hidden');
  });
}

function selectCareer(career) {
  document.querySelectorAll(".career-card").forEach(card => card.classList.remove("active"));
  document.querySelector(`[data-career="${career}"]`).classList.add("active");

  // Save selected career globally
  window.selectedCareer = career;

  showVisualization(career);
}

function showVisualization(career) {
  const data = careerData[career];
  const panel = document.getElementById("visualization-panel");
  panel.classList.remove("hidden");

  document.getElementById("viz-title").textContent = `${data.name.toUpperCase()} - DETAILED ANALYSIS`;
  updateInfoPanel(data);
  createRadarChart(data);

  // Show confirm button
  document.getElementById("confirm-container").classList.remove("hidden");

  panel.scrollIntoView({ behavior: "smooth" });

  // Save selected career if needed for later use
  window.selectedCareer = career;
}

function updateInfoPanel(data) {
  document.getElementById("depression-bar").style.width = (data.depressionRate * 100) + "%";
  document.getElementById("depression-text").textContent = `Depression Rate: ${(data.depressionRate * 100).toFixed(1)}%`;
  document.getElementById("sleep-bar").style.width = data.sleepScore + "%";
  document.getElementById("sleep-text").textContent = `Average Sleep: ${data.avgSleep}`;
  document.getElementById("stress-bar").style.width = (data.stressLevel * 100) + "%";
  document.getElementById("stress-text").textContent = `Stress Level: ${(data.stressLevel * 5).toFixed(1)}/5`;
  document.getElementById("insights-text").textContent = data.insights;
}

function createRadarChart(data, containId='#chart-container') {
  const container = d3.select(containId);
  container.selectAll("*").remove();

  const width = 400;
  const height = 400;
  const radius = Math.min(width, height) / 2 - 40;

  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg.append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  // Create display data with inverted scales for protective factors
  const displayData = data.detailData.map(d => {
    const factor = d.factor;
    let displayValue = d.value;
    
    // Invert protective factors so higher values = higher risk on chart
    if (factor === 'Work-Life Balance' || 
        factor === 'Social Support' || 
        factor === 'Job Security') {
      displayValue = 100 - d.value;
    }
    
    return {
      ...d,
      displayValue: displayValue
    };
  });

  const angleScale = d3.scaleLinear()
    .domain([0, displayData.length])
    .range([0, 2 * Math.PI]);

  const radiusScale = d3.scaleLinear()
    .domain([0, 100])
    .range([0, radius]);

  // Grid circles
  for (let i = 1; i <= 5; i++) {
    g.append("circle")
      .attr("r", (radius / 5) * i)
      .attr("fill", "none")
      .attr("stroke", "#00ff00")
      .attr("stroke-opacity", 0.3)
      .attr("stroke-width", 1);
  }

  // Axis lines and labels
  displayData.forEach((d, i) => {
    const angle = angleScale(i) - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    g.append("line")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", x).attr("y2", y)
      .attr("stroke", "#00ff00")
      .attr("stroke-opacity", 0.5)
      .attr("stroke-width", 1);

    // Enhanced labels with risk direction indicators
    const labelText = d.factor;
    const isInverted = d.factor === 'Work-Life Balance' || 
                     d.factor === 'Social Support' || 
                     d.factor === 'Job Security';
    
    g.append("text")
      .attr("x", Math.cos(angle) * (radius + 30))
      .attr("y", Math.sin(angle) * (radius + 30))
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#00ffff")
      .attr("font-family", "Orbitron")
      .attr("font-size", "10px")
      .text(labelText);

    // Add small indicator for inverted scales
    if (isInverted) {
      g.append("text")
        .attr("x", Math.cos(angle) * (radius + 45))
        .attr("y", Math.sin(angle) * (radius + 45))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#ffff00")
        .attr("font-family", "Orbitron")
        .attr("font-size", "8px")
        .text("⟲");
    }
  });

  // Area path using display values
  const area = d3.areaRadial()
    .angle((d, i) => angleScale(i))
    .innerRadius(0)
    .outerRadius(d => radiusScale(d.displayValue))
    .curve(d3.curveLinearClosed);

  const radarPath = g.append("path")
    .datum(displayData)
    .attr("fill", "#ff00ff")
    .attr("fill-opacity", 0.2)
    .attr("stroke", "#ff00ff")
    .attr("stroke-width", 2)
    .attr("d", area)
    .attr("stroke-dasharray", function() {
      const totalLength = this.getTotalLength();
      return `${totalLength} ${totalLength}`;
    })
    .attr("stroke-dashoffset", function() {
      return this.getTotalLength();
    })
    .transition()
    .duration(1200)
    .ease(d3.easeCubicInOut)
    .attr("stroke-dashoffset", 0);

  // Tooltip logic
  let locked = false;
  let tooltip = d3.select("body").select(".tooltip");
  if (tooltip.empty()) {
    tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "#000")
      .style("color", "#0f0")
      .style("padding", "8px")
      .style("border", "1px solid #0f0")
      .style("border-radius", "4px")
      .style("font-family", "Orbitron")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0);
  }

  // Data points with hover + click-to-lock
  g.selectAll(".data-point")
    .data(displayData)
    .enter()
    .append("circle")
    .attr("class", "data-point")
    .attr("cx", (d, i) => Math.cos(angleScale(i) - Math.PI / 2) * radiusScale(d.displayValue))
    .attr("cy", (d, i) => Math.sin(angleScale(i) - Math.PI / 2) * radiusScale(d.displayValue))
    .attr("r", 4)
    .attr("fill", "#ffff00")
    .attr("stroke", "#ff00ff")
    .attr("stroke-width", 2)
    .style("cursor", "pointer")
    .on("mouseover", function(event, d) {
      if (locked) return;
      d3.select(this).transition().duration(150).attr("r", 7);
      
      // Show original value in tooltip, not display value
      const isInverted = d.factor === 'Work-Life Balance' || 
                        d.factor === 'Social Support' || 
                        d.factor === 'Job Security';
      
      const tooltipText = isInverted 
        ? `${d.factor}: ${d.value}% (showing risk: ${d.displayValue}%)`
        : `${d.factor}: ${d.value}%`;
      
      tooltip.html(tooltipText)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 30 + "px")
        .style("opacity", 1);
    })
    .on("mouseout", function() {
      if (locked) return;
      d3.select(this).transition().duration(150).attr("r", 4);
      tooltip.style("opacity", 0);
    })
    .on("click", function(event, d) {
      locked = !locked;
      if (locked) {
        d3.selectAll(".data-point").attr("r", 4);
        d3.select(this).attr("r", 7);
        
        const isInverted = d.factor === 'Work-Life Balance' || 
                          d.factor === 'Social Support' || 
                          d.factor === 'Job Security';
        
        const tooltipText = isInverted 
          ? `${d.factor}: ${d.value}% (showing risk: ${d.displayValue}%)`
          : `${d.factor}: ${d.value}%`;
        
        tooltip.html(tooltipText)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 30 + "px")
          .style("opacity", 1);
      } else {
        tooltip.style("opacity", 0);
        d3.select(this).transition().duration(150).attr("r", 4);
      }
    });

  // Add legend explaining the inversion
  g.append("text")
    .attr("x", -radius)
    .attr("y", radius + 25)
    .attr("fill", "#ffff00")
    .attr("font-family", "Orbitron")
    .attr("font-size", "9px")
    .text("⟲ = Inverted scale (larger area = higher risk)");
}

// Enhanced next-to-user functionality with integrated assessment
function enhanceNextToUserFlow() {
  const originalHandler = document.getElementById("next-to-user");
  if (originalHandler) {
    originalHandler.addEventListener("click", () => {
      document.getElementById("risk-panels-screen").classList.add("hidden");
      
      // Check if user assessment is available
      if (window.userAssessment) {
        window.userAssessment.showAssessment();
      } else {
        // Fallback to basic user profile
        document.getElementById("user-profile").classList.remove("hidden");
        document.getElementById("user-profile").scrollIntoView({ behavior: "smooth" });
      }
    });
  }
}

// Updated event handlers for navigation flow
function setupEnhancedEventHandlers() {
  // Timeline to risk panels
  document.getElementById("next-to-risk").addEventListener("click", () => {
    document.getElementById("timeline-screen").classList.add("hidden");
    document.getElementById("risk-panels-screen").classList.remove("hidden");
    
    d3.select("#sleep-risk-chart").selectAll("*").remove();
    d3.select("#depression-unity-chart").selectAll("*").remove();
    renderHeatmap();
    
    if (animatedStudents && animatedStudents.length > 0) {
      initializeAnimation();
      setTimeout(() => playAllPhases(), 500);
    }
  });

  // Engineering to risk panels
  document.getElementById("next-from-engineering").addEventListener("click", () => {
    document.getElementById("engineering-matrix-screen").classList.add("hidden");
    document.getElementById("risk-panels-screen").classList.remove("hidden");
    renderHeatmap();
    
    if (animatedStudents && animatedStudents.length > 0) {
      initializeAnimation();
      setTimeout(() => playAllPhases(), 500);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Arts to risk panels  
  document.getElementById("next-from-arts").addEventListener("click", () => {
    document.getElementById("arts-analysis-screen").classList.add("hidden");
    document.getElementById("risk-panels-screen").classList.remove("hidden");
    
    renderHeatmap();
    
    if (animatedStudents && animatedStudents.length > 0) {
      initializeAnimation();
      setTimeout(() => playAllPhases(), 500);
    }
    
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Medicine to risk panels
  document.getElementById("next-from-medicine").addEventListener("click", () => {
    document.getElementById("medicine-analysis-screen").classList.add("hidden");
    document.getElementById("risk-panels-screen").classList.remove("hidden");
    
    // Clean up tooltips
    d3.selectAll('.medicine-spiral-tooltip').remove();
    
    renderHeatmap();
    
    if (animatedStudents && animatedStudents.length > 0) {
      initializeAnimation();
      setTimeout(() => playAllPhases(), 500);
    }
    
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Enhanced next-to-user with integrated assessment
  const nextToUserBtn = document.getElementById("next-to-user");
  if (nextToUserBtn) {
    // Remove existing listeners and add enhanced one
    const newBtn = nextToUserBtn.cloneNode(true);
    nextToUserBtn.parentNode.replaceChild(newBtn, nextToUserBtn);
    
    newBtn.addEventListener("click", () => {
      document.getElementById("risk-panels-screen").classList.add("hidden");
      
      // Use the integrated user assessment if available
      if (window.userAssessment) {
        window.userAssessment.showAssessment();
      } else {
        // Fallback to basic user profile
        document.getElementById("user-profile").classList.remove("hidden");
        document.getElementById("user-profile").scrollIntoView({ behavior: "smooth" });
      }
    });
  }
}

// Enhanced back button handling for user assessment
function setupEnhancedBackButtons() {
  const screens = [
    { screen: '#timeline-screen', button: '#timeline-screen .back-button' },
    { screen: '#engineering-matrix-screen', button: '#engineering-matrix-screen .back-button' },
    { screen: '#arts-analysis-screen', button: '#arts-analysis-screen .back-button' },
    { screen: '#medicine-analysis-screen', button: '#medicine-analysis-screen .back-button' }
  ];
  
  screens.forEach(config => {
    const backBtn = document.querySelector(config.button);
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        // Hide current screen
        document.querySelector(config.screen).classList.add("hidden");
        
        // Show profiles screen
        document.getElementById("profiles-screen").classList.remove("hidden");
        document.getElementById("visualization-panel").classList.remove("hidden");
        
        // Clean up tooltips and user assessment screens
        d3.selectAll('.tooltip').remove();
        d3.selectAll('.medicine-spiral-tooltip').remove();
        d3.selectAll('.ring-tooltip').remove();
        
        // Hide user assessment results if open
        const userResultsScreen = document.getElementById('user-results-screen');
        if (userResultsScreen) {
          userResultsScreen.remove();
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  });

  // Add back button for user assessment results
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('assessment-back-button')) {
      const userResultsScreen = document.getElementById('user-results-screen');
      if (userResultsScreen) {
        userResultsScreen.remove();
      }
      document.getElementById("risk-panels-screen").classList.remove("hidden");
    }
  });
}

function renderHeatmap() {
  d3.select("#sleep-risk-chart").selectAll("*").remove();
  const svg = d3.select("#sleep-risk-chart").append("svg")
    .attr("width", 750)
    .attr("height", 420);

  const margin = { top: 40, right: 30, bottom: 60, left: 100 },
        width = 750 - margin.left - margin.right,
        height = 420 - margin.top - margin.bottom;

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  const xLabels = ['Less than 5 hours', '5-6 hours', '7-8 hours', 'More than 8 hours'];
  const yLabels = ['Arts', 'Business', 'Engineering', 'Medicine'];

  const x = d3.scaleBand().domain(xLabels).range([0, width]).padding(0.05);
  const y = d3.scaleBand().domain(yLabels).range([0, height]).padding(0.05);
  const color = d3.scaleSequential(d3.interpolateReds).domain([0.4, 0.7]);

  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "rgba(0,0,0,0.9)")
    .style("color", "#00ff00")
    .style("padding", "10px")
    .style("border", "1px solid #00ff00")
    .style("border-radius", "6px")
    .style("font-size", "13px")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("font-family", "Orbitron");

  d3.json("data/depression_heatmap_data_enhanced.json").then(data => {
    g.selectAll(".cell")
      .data(data)
      .enter().append("rect")
      .attr("class", "cell")
      .attr("x", d => x(d.Sleep))
      .attr("y", d => y(d.Profile))
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .attr("fill", d => color(d.Rate))
      .style("stroke", "#00ffff")
      .style("stroke-width", 1)
      .on("mouseover", function(event, d) {
        d3.select(this).style("stroke-width", 3);
        tooltip.html(`<strong>${d.Profile}</strong><br>${d.Sleep}<br><strong>Depression Rate:</strong> ${(d.Rate * 100).toFixed(1)}%<br><strong>Compared to Avg:</strong> ${(d.DeltaFromAvg > 0 ? '+' : '') + (d.DeltaFromAvg * 100).toFixed(1)}%`)
          .style("opacity", 1);
      })
      .on("mousemove", event => {
        tooltip.style("left", (event.pageX + 10) + "px")
               .style("top", (event.pageY - 30) + "px");
      })
      .on("mouseleave", function() {
        d3.select(this).style("stroke-width", 1);
        tooltip.style("opacity", 0);
      });

    // Draw axes
    g.append("g")
      .call(d3.axisLeft(y).tickSize(0))
      .selectAll("text")
      .attr("fill", "#00ff00")
      .attr("font-family", "Orbitron")
      .attr("font-size", "12px");

    g.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("fill", "#00ff00")
      .attr("font-family", "Orbitron")
      .attr("font-size", "12px");

    // Add legend
    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "0%");

    linearGradient.selectAll("stop")
      .data([
        { offset: "0%", color: color(0.4) },
        { offset: "100%", color: color(0.7) }
      ])
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);

    const legendWidth = 150;
    const legendHeight = 12;

    svg.append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top - 20)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)")
      .style("stroke", "#00ffff")
      .style("stroke-width", 1);

    svg.append("text")
      .attr("x", margin.left)
      .attr("y", margin.top - 25)
      .attr("fill", "#00ff00")
      .attr("font-family", "Orbitron")
      .attr("font-size", "12px")
      .text("Lower Risk");

    svg.append("text")
      .attr("x", margin.left + legendWidth)
      .attr("y", margin.top - 25)
      .attr("text-anchor", "end")
      .attr("fill", "#00ff00")
      .attr("font-family", "Orbitron")
      .attr("font-size", "12px")
      .text("Higher Risk");
  });

  // Render other chart components
  renderDietaryHabitsChart();
  renderStudySatisfactionChart();
}

function renderTimelineChart() {
  const margin = { top: 60, right: 70, bottom: 130, left: 60 },
        width = 900,
        height = 500,
        height2 = 80;

  const svg = d3.select("#chart").html("").append("svg")
    .attr("width", width)
    .attr("height", height);

  const focus = svg.append("g");
  const context = svg.append("g").attr("transform", `translate(0, ${height - height2 - 30})`);

  let tooltip = d3.select("#tooltip");
  if (tooltip.empty()) {
    tooltip = d3.select("body")
      .append("div")
      .attr("id", "tooltip")
      .attr("class", "tooltip");
  }

  d3.csv("data/business_stress_timeline.csv", d3.autoType).then(data => {
    const x = d3.scaleLinear().domain(d3.extent(data, d => d.Age)).range([margin.left, width - margin.right]);
    const x2 = x.copy();
    const y = d3.scaleLinear().domain([0, 10]).range([height - margin.bottom, margin.top]);
    const yR = d3.scaleLinear().domain([0, 1]).range([height - margin.bottom, margin.top]);
    const yMini = d3.scaleLinear().domain(y.domain()).range([height2, 0]);

    const line = (key, xScale, yScale) =>
      d3.line().x(d => xScale(d.Age)).y(d => yScale(d[key]));

    const drawFocus = () => {
      focus.selectAll("*").remove();

      // Axes with labels
      focus.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .append("text")
        .attr("x", (width / 2))
        .attr("y", 40)
        .attr("fill", "#ffff00")
        .attr("text-anchor", "middle")
        .attr("font-family", "Orbitron")
        .attr("font-size", "14px")
        .text("Age");

      focus.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .attr("fill", "#ffff00")
        .attr("font-family", "Orbitron")
        .attr("font-size", "14px")
        .text("Stress Score");

      focus.append("g")
        .attr("transform", `translate(${width - margin.right},0)`)
        .call(d3.axisRight(yR).tickFormat(d3.format(".0%")))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 40)
        .attr("text-anchor", "middle")
        .attr("fill", "#ffff00")
        .attr("font-family", "Orbitron")
        .attr("font-size", "14px")
        .text("Depression Rate (%)");

      // Line paths
      focus.append("path").datum(data).attr("fill", "none").attr("stroke", "#00ffff").attr("stroke-width", 2).attr("d", line("Academic Pressure", x, y));
      focus.append("path").datum(data).attr("fill", "none").attr("stroke", "#ff00ff").attr("stroke-width", 2).attr("d", line("Financial Stress", x, y));
      focus.append("path").datum(data).attr("fill", "none").attr("stroke", "#ffff00").attr("stroke-width", 2).attr("stroke-dasharray", "4 2").attr("d", line("Depression", x, yR));

      // Interactive dots
      [["Academic Pressure", "#00ffff", y], ["Financial Stress", "#ff00ff", y], ["Depression", "#ffff00", yR]].forEach(([key, color, scale]) => {
        focus.selectAll(`.dot-${key}`).data(data).enter().append("circle")
          .attr("cx", d => x(d.Age))
          .attr("cy", d => scale(d[key]))
          .attr("r", 4)
          .attr("fill", color)
          .on("mouseover", (event, d) => {
            tooltip
              .html(`${key}<br>Age: ${d.Age}<br>Value: ${d[key].toFixed(2)}`)
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY - 28 + "px")
              .style("opacity", 1);
          })
          .on("mouseout", () => tooltip.style("opacity", 0));
      });

      // High stress indicators
      focus.selectAll(".pulse-dot").data(data.filter(d => d["High Stress Flag"])).enter().append("circle")
        .attr("cx", d => x(d.Age))
        .attr("cy", d => y(d["Total Stress"]))
        .attr("r", 5)
        .attr("fill", "red")
        .attr("class", "pulse-dot")
        .on("mouseover", (event, d) => {
          tooltip
            .html(`High Total Stress<br>Age: ${d.Age}<br>Total: ${d["Total Stress"].toFixed(2)}`)
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 28 + "px")
            .style("opacity", 1);
        })
        .on("mouseout", () => tooltip.style("opacity", 0));
    };

    // Context chart with brush
    context.append("g").attr("transform", `translate(0,${height2})`).call(d3.axisBottom(x2));
    context.append("path").datum(data).attr("fill", "none").attr("stroke", "#888").attr("stroke-width", 1).attr("d", line("Total Stress", x2, yMini));

    const brush = d3.brushX()
      .extent([[margin.left, 0], [width - margin.right, height2]])
      .on("brush end", (event) => {
        const sel = event.selection;
        if (sel) {
          x.domain(sel.map(x2.invert, x2));
          drawFocus();
        }
      });

    context.append("g").attr("class", "brush").call(brush);
    drawFocus();
  });
}

function renderEngineeringMatrix() {
  const svg = d3.select("#engineering-matrix-svg");
  svg.selectAll("*").remove();

  const margin = { top: 60, right: 30, bottom: 60, left: 130 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  const tooltip = d3.select("#engineering-tooltip");

  d3.csv("data/engineering_sleep_matrix.csv").then(data => {
    data.forEach(d => {
      d.Study = +d["Study Bin"];
      d.Depression = +d["depression_rate"];
      d.Students = +d["student_count"];
      d.GPA = +d["avg_gpa"];
    });

    const sleepCats = [...new Set(data.map(d => d["Sleep Duration"]))];
    const x = d3.scaleLinear().domain([0, 15]).range([0, width]);
    const y = d3.scaleBand().domain(sleepCats).range([height, 0]).padding(0.2);
    const radius = d3.scaleSqrt().domain([1, d3.max(data, d => d.Students)]).range([3, 25]);
    const color = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, 1]);

    // Axes
    g.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .attr("color", "#00ff00");

    g.append("g")
      .call(d3.axisLeft(y))
      .attr("color", "#00ff00");

    // Axis labels
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("fill", "#ffff00")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Study Hours Per Day");

    g.append("text")
      .attr("x", -height / 2)
      .attr("y", -60)
      .attr("transform", "rotate(-90)")
      .attr("fill", "#ffff00")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Sleep Duration");

    // Data circles
    g.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.Study))
      .attr("cy", d => y(d["Sleep Duration"]) + y.bandwidth()/2)
      .attr("r", d => radius(d.Students))
      .attr("fill", d => color(d.Depression))
      .attr("stroke", "#00ffff")
      .attr("stroke-width", 1)
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 1)
          .html(`<strong>${d["Sleep Duration"]}</strong><br>
                 Study Hours: ${d.Study}<br>
                 Depression Rate: ${(d.Depression * 100).toFixed(1)}%<br>
                 GPA: ${d.GPA.toFixed(2)}<br>
                 Students: ${d.Students}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 40) + "px");
      })
      .on("mouseout", () => tooltip.style("opacity", 0));
  });
}

function renderDietaryHabitsChart() {
  const container = d3.select('#dietary-habits-chart');
  container.selectAll('*').remove();
  const margin = { top: 40, right: 200, bottom: 50, left: 60 };
  const width = 600 - margin.left - margin.right;
  const height = 350 - margin.top - margin.bottom;
  const svg = container.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  const tooltip = container.append('div').attr('class', 'tooltip');

  d3.csv('data/student_depression_dataset.csv').then(data => {
    data.forEach(d => {
      d['Dietary Habits'] = (d['Dietary Habits'] || '').replace(/'/g, '').trim();
      d.Depression = +d.Depression;
    });
    const habits = Array.from(new Set(data.map(d => d['Dietary Habits'])));
    const depressionCats = [0, 1];
    const grouped = {};
    habits.forEach(habit => {
      grouped[habit] = { habit };
      depressionCats.forEach(dep => {
        grouped[habit][dep] = data.filter(d => d['Dietary Habits'] === habit && d.Depression === dep).length;
      });
    });
    const chartData = Object.values(grouped);
    const stack = d3.stack().keys(depressionCats);
    const series = stack(chartData);
    const x = d3.scaleBand().domain(habits).range([0, width]).padding(0.2);
    const y = d3.scaleLinear().domain([0, d3.max(chartData, d => d[0] + d[1])]).nice().range([height, 0]);
    const color = d3.scaleOrdinal().domain(depressionCats).range(['#1f77b4', '#d62728']);

    svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x));
    svg.append('g').call(d3.axisLeft(y));

    const groups = svg.selectAll('.series')
      .data(series)
      .enter().append('g')
      .attr('class', 'series')
      .attr('fill', d => color(d.key));

    groups.selectAll('rect')
      .data(d => d)
      .enter().append('rect')
      .attr('x', d => x(d.data.habit))
      .attr('y', d => y(d[1]))
      .attr('height', d => y(d[0]) - y(d[1]))
      .attr('width', x.bandwidth())
      .on('mouseover', function(event, d) {
        const dep = this.parentNode.__data__.key;
        tooltip.style('opacity', 1)
          .html(`<strong>Dietary Habit:</strong> ${d.data.habit}<br><strong>${dep == 1 ? 'Depressed' : 'Not Depressed'}:</strong> ${d.data[dep]}`)
          .style('left', (event.pageX + 12) + 'px')
          .style('top',  (event.pageY - 28) + 'px');
      })
      .on('mousemove', function(event) {
        tooltip.style('left', (event.pageX + 12) + 'px').style('top',  (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() { tooltip.style('opacity', 0); });

    // Legend and title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('fill', '#ff00ff')
      .text('Depression Status by Dietary Habits');
  });
}

function renderStudySatisfactionChart() {
  const container = d3.select('#study-satisfaction-chart');
  container.selectAll('*').remove();
  const margin = { top: 40, right: 200, bottom: 50, left: 60 };
  const width = 600 - margin.left - margin.right;
  const height = 350 - margin.top - margin.bottom;
  const svg = container.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  const tooltip = container.append('div').attr('class', 'tooltip');

  d3.csv('data/student_depression_dataset.csv').then(data => {
    data.forEach(d => {
      d['Study Satisfaction'] = +d['Study Satisfaction'];
      d.Depression = +d.Depression;
    });
    const sats = Array.from(new Set(data.map(d => d['Study Satisfaction']))).sort((a, b) => a - b);
    const depressionCats = [0, 1];
    const grouped = {};
    sats.forEach(sat => {
      grouped[sat] = { sat };
      depressionCats.forEach(dep => {
        grouped[sat][dep] = data.filter(d => d['Study Satisfaction'] === sat && d.Depression === dep).length;
      });
    });
    const chartData = Object.values(grouped);
    const stack = d3.stack().keys(depressionCats);
    const series = stack(chartData);
    const x = d3.scaleBand().domain(sats).range([0, width]).padding(0.2);
    const y = d3.scaleLinear().domain([0, d3.max(chartData, d => d[0] + d[1])]).nice().range([height, 0]);
    const color = d3.scaleOrdinal().domain(depressionCats).range(['#1f77b4', '#d62728']);

    svg.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x));
    svg.append('g').call(d3.axisLeft(y));

    const groups = svg.selectAll('.series')
      .data(series)
      .enter().append('g')
      .attr('class', 'series')
      .attr('fill', d => color(d.key));

    groups.selectAll('rect')
      .data(d => d)
      .enter().append('rect')
      .attr('x', d => x(d.data.sat))
      .attr('y', d => y(d[1]))
      .attr('height', d => y(d[0]) - y(d[1]))
      .attr('width', x.bandwidth())
      .on('mouseover', function(event, d) {
        const dep = this.parentNode.__data__.key;
        tooltip.style('opacity', 1)
          .html(`<strong>Study Satisfaction:</strong> ${d.data.sat}<br><strong>${dep == 1 ? 'Depressed' : 'Not Depressed'}:</strong> ${d.data[dep]}`)
          .style('left', (event.pageX + 12) + 'px')
          .style('top',  (event.pageY - 28) + 'px');
      })
      .on('mousemove', function(event) {
        tooltip.style('left', (event.pageX + 12) + 'px').style('top',  (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() { tooltip.style('opacity', 0); });

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('fill', '#ff00ff')
      .text('Depression Status by Study Satisfaction');
  });
}

// Initialize phase animations
function goToPhase(phase) {
  currentPhase = phase;
  const label = document.getElementById("phase-description-label");
  if (label) label.textContent = phaseDescriptions[phase];

  d3.selectAll('.factor-label').classed('visible', phase === 2);

  d3.selectAll('.phase-btn').classed('active', false);
  const phaseButtons = document.querySelectorAll('.phase-btn');
  if (phaseButtons[phase - 1]) {
    phaseButtons[phase - 1].classList.add('active');
  }

  let positionFn;
  switch(phase) {
    case 1: positionFn = getPhase1Position; break;
    case 2: positionFn = getPhase2Position; break;
    case 3: positionFn = getPhase3Position; break;
    default: return;
  }

  if (!animatedStudents || animatedStudents.length === 0) {
    console.warn("No student data available");
    return;
  }

  const circles = d3.selectAll("#depression-unity-chart svg circle");
  if (circles.empty()) {
    console.warn("No circles found - initializing animation first");
    initializeAnimation();
    setTimeout(() => goToPhase(phase), 100);
    return;
  }

  circles
    .transition()
    .duration(2000)
    .attr("cx", (d, i) => {
      const pos = positionFn(d, i);
      return pos.x;
    })
    .attr("cy", (d, i) => {
      const pos = positionFn(d, i);
      return pos.y;
    })
    .attr("r", 2)
    .attr("opacity", d => {
      if (phase === 3 && !d.hasDepression) return 0.2;
      return 0.8;
    })
    .attr("fill", d => {
      if (phase === 3 && d.hasDepression) return "#ff6b6b";
      
      const profileColors = {
        Business: '#3498db',
        Engineering: '#e74c3c',
        Arts: '#9b59b6',
        Medicine: '#1abc9c'
      };
      return profileColors[d.profile] || "#999";
    });
}

function getPhase1Position(d) {
  const positions = {
    Business: { x: 175, y: 100 },
    Engineering: { x: 525, y: 100 },
    Arts: { x: 175, y: 300 },
    Medicine: { x: 525, y: 300 }
  };

  const base = positions[d.profile] || { x: 350, y: 200 };
  const angle = Math.random() * 2 * Math.PI;
  const radius = Math.random() * 60 + 20;
  
  return {
    x: base.x + Math.cos(angle) * radius,
    y: base.y + Math.sin(angle) * radius
  };
}

function getPhase2Position(d) {
  const centerX = 350, centerY = 200;
  let x = centerX, y = centerY;
  
  const academicOffset = ((d.academicPressure - 5) / 5) * 100;
  y -= academicOffset;
  
  const workOffset = ((d.workPressure - 5) / 5) * 50;
  y += workOffset;
  
  if (d.financialStress) {
    x -= 120 + (Math.random() * 60 - 30);
  }
  
  const studyOffset = ((d.studyHours - 8) / 4) * 80;
  x += studyOffset;
  
  const angle = Math.random() * Math.PI * 2;
  const spread = Math.random() * 40 + 20;
  x += Math.cos(angle) * spread;
  y += Math.sin(angle) * spread;
  
  x = Math.max(50, Math.min(650, x));
  y = Math.max(50, Math.min(350, y));
  
  return { x, y };
}

function getPhase3Position(d, i) {
  const width = 700, height = 450;
  const centerX = width / 2;
  const centerY = height / 2;

  const index = animatedStudents.indexOf(d);
  const total = animatedStudents.length;
  
  const t = (index / total) * Math.PI * 2;
  
  const scale = 120;
  const x = scale * Math.pow(Math.sin(t), 3);
  const y = -(scale * 0.8) * (1.3 * Math.cos(t) - 0.5 * Math.cos(2*t) - 0.2 * Math.cos(3*t) - 0.1 * Math.cos(4*t));
  
  return { 
    x: centerX + x, 
    y: centerY + y
  };
}

function initializeAnimation() {
  const svg = d3.select("#depression-unity-chart").html("").append("svg")
    .attr("width", 700)
    .attr("height", 450);

  let tooltip = d3.select("body").select(".depression-tooltip");
  if (tooltip.empty()) {
    tooltip = d3.select("body")
      .append("div")
      .attr("class", "depression-tooltip tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("pointer-events", "none");
  }

  svg.selectAll("circle")
    .data(animatedStudents)
    .enter()
    .append("circle")
    .attr("r", 2)
    .attr("fill", d => {
      const profileColors = {
        Business: '#3498db',
        Engineering: '#e74c3c',
        Arts: '#9b59b6',
        Medicine: '#1abc9c'
      };
      return profileColors[d.profile] || "#999";
    })
    .attr("cx", d => Math.random() * 700)
    .attr("cy", d => Math.random() * 450)
    .attr("opacity", 0.8)
    .style("cursor", "pointer")
    .on("mouseover", function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", 5);
      
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      
      tooltip.html(`
        <strong>${d.profile} Student</strong><br/>
        Depression: ${d.hasDepression ? 'Yes' : 'No'}<br/>
        Academic Pressure: ${d.academicPressure.toFixed(1)}/10<br/>
        Study Hours: ${d.studyHours.toFixed(1)}/day<br/>
        Financial Stress: ${d.financialStress ? 'Yes' : 'No'}
      `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", 2);
      
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });
}

function playAllPhases() {
  goToPhase(1);
  setTimeout(() => goToPhase(2), 3000);
  setTimeout(() => goToPhase(3), 6000);
}

function getRiskClass(rate) {
  if (rate >= 0.65) return "risk-critical";
  if (rate >= 0.5) return "risk-high";
  if (rate >= 0.35) return "risk-medium";
  return "risk-low";
}

function initializeMedicineMatrix() {
  console.log('🔬 Initializing enhanced medicine matrix...');
  
  // Constants and helpers
  const medicineDegrees = new Set(['B.Pharm', 'M.Pharm', 'BSc', 'MSc', 'BPHARM', 'MPHARM']);
  
  const sleepToHrs = (s) => {
    s = String(s).toLowerCase();
    if (s.includes('less')) return 4.5;
    if (s.includes('5-6')) return 5.5;
    if (s.includes('7-8')) return 7.5;
    if (s.includes('more')) return 8.5;
    return 6;
  };

  // SVG setup with enhanced styling
  const svg = d3.select('#medicine-matrix-plot');
  const W = +svg.attr('width');
  const H = +svg.attr('height');
  const M = { left: 120, right: 40, top: 80, bottom: 80 };
  const PW = W - M.left - M.right;
  const PH = H - M.top - M.bottom;
  const g = svg.append('g').attr('transform', `translate(${M.left},${M.top})`);
  const tip = d3.select('#medicine-matrix-tooltip');

  // Enhanced color and size scales
  const colour = d3.scaleLinear()
    .domain([0, 0.5, 1])
    .range(['#36e4fd', '#ffe987', '#ff6f96']);

  const size = d3.scaleLinear()
    .domain([1, 5])
    .range([12, 32]);

  // Load and process data
  d3.csv('data/student_depression_dataset.csv').then(raw => {
    console.log('📊 Processing medicine student data...');
    
    const data = raw
      .filter(d => {
        const degree = String(d.Degree || '').replace(/\s+/g, '').toUpperCase();
        return medicineDegrees.has(degree) || 
               degree.includes('PHARM') || 
               degree.includes('BSC') || 
               degree.includes('MSC');
      })
      .map(d => ({
        pressure: +d['Academic Pressure'] || 0,
        sleep: sleepToHrs(d['Sleep Duration']),
        satisf: +d['Study Satisfaction'] || 0,
        depressed: +d.Depression === 1,
        gender: (d.Gender || '').trim(),
        degree: (d.Degree || '').trim()
      }))
      .filter(d => d.pressure > 0 && d.satisf > 0); // Filter out invalid data

    console.log(`📈 Found ${data.length} medicine students for analysis`);

    // Populate degree dropdown
    const degrees = ['All', ...new Set(data.map(d => d.degree)).values()];
    d3.select('#medicine-degree-select')
      .selectAll('option')
      .data(degrees)
      .join('option')
      .attr('value', d => d)
      .text(d => d === 'All' ? 'All Medicine Students' : d);

    // Enhanced axes with cyberpunk styling
    const x = d3.scaleLinear().domain([1, 5]).range([0, PW]);
    const y = d3.scalePoint()
      .domain([4.5, 5.5, 7.5, 8.5])
      .range([PH, 0])
      .padding(0.3);

    // X-axis
    g.append('g')
      .attr('class', 'matrix-axis')
      .attr('transform', `translate(0,${PH})`)
      .call(d3.axisBottom(x).tickValues([1, 2, 3, 4, 5]))
      .selectAll('text')
      .style('fill', '#00ffcc')
      .style('font-family', 'Orbitron')
      .style('font-size', '14px');

    // Y-axis
    g.append('g')
      .attr('class', 'matrix-axis')
      .call(d3.axisLeft(y).tickFormat(d => d + ' hrs'))
      .selectAll('text')
      .style('fill', '#00ffcc')
      .style('font-family', 'Orbitron')
      .style('font-size', '14px');

    // Enhanced axis labels
    g.append('text')
      .attr('class', 'matrix-axis-label')
      .attr('x', PW / 2)
      .attr('y', PH + 50)
      .attr('text-anchor', 'middle')
      .style('fill', '#00ffcc')
      .style('font-family', 'Orbitron')
      .style('font-size', '16px')
      .style('font-weight', '600')
      .text('Academic Pressure Level (1-5)');

    g.append('text')
      .attr('class', 'matrix-axis-label')
      .attr('x', -60)
      .attr('y', PH / 2)
      .attr('transform', `rotate(-90,-60,${PH / 2})`)
      .attr('text-anchor', 'middle')
      .style('fill', '#00ffcc')
      .style('font-family', 'Orbitron')
      .style('font-size', '16px')
      .style('font-weight', '600')
      .text('Sleep Duration');

    // Enhanced update function
    function update() {
      const deg = d3.select('#medicine-degree-select').property('value');
      const showF = d3.select('#medicine-show-females').property('checked');
      const showM = d3.select('#medicine-show-males').property('checked');

      const filt = data.filter(d =>
        (deg === 'All' || d.degree === deg) &&
        ((d.gender === 'Female' && showF) || (d.gender === 'Male' && showM))
      );

      console.log(`🔍 Filtered to ${filt.length} students`);

      // Aggregate by (pressure, sleep) with enhanced grouping
      const byCell = d3.groups(filt, 
        d => Math.round(d.pressure), 
        d => d.sleep
      );
      
      const cells = [];
      byCell.forEach(([p, rowsBySleep]) => {
        rowsBySleep.forEach(([s, arr]) => {
          if (arr.length < 3) return; // Minimum threshold
          cells.push({
            pressure: +p,
            sleep: +s,
            count: arr.length,
            avgSat: d3.mean(arr, d => d.satisf),
            pctDep: arr.filter(d => d.depressed).length / arr.length,
            riskLevel: getRiskLevel(+p, +s, arr.filter(d => d.depressed).length / arr.length)
          });
        });
      });

      console.log(`📊 Created ${cells.length} data points for visualization`);

      // Enhanced dot visualization
      const dot = g.selectAll('.agg-dot')
        .data(cells, d => `${d.pressure}-${d.sleep}`);

      dot.exit()
        .transition()
        .duration(300)
        .attr('r', 0)
        .style('opacity', 0)
        .remove();

      dot.enter()
        .append('circle')
        .attr('class', 'agg-dot')
        .attr('r', 0)
        .style('opacity', 0)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .merge(dot)
        .on('mouseover', (event, d) => {
          d3.select(event.currentTarget)
            .attr('stroke', '#00ff00')
            .attr('stroke-width', 3)
            .style('filter', 'brightness(1.3)');

          tip.style('opacity', 1)
            .html(`
              <div style="text-align: center; margin-bottom: 0.5rem;">
                <strong style="color: #00ff00; font-size: 1.1rem;">Medicine Students</strong>
              </div>
              <div><strong>Academic Pressure:</strong> ${d.pressure}/5</div>
              <div><strong>Sleep Duration:</strong> ${d.sleep} hours</div>
              <div><strong>Student Count:</strong> ${d.count}</div>
              <div><strong>Avg Study Satisfaction:</strong> ${d.avgSat.toFixed(1)}/5</div>
              <div><strong>Depression Rate:</strong> ${(d.pctDep * 100).toFixed(1)}%</div>
              <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #00ffcc;">
                <strong style="color: ${d.riskLevel.color};">${d.riskLevel.label}</strong>
              </div>
            `)
            .style('left', (event.clientX + 15) + 'px')
            .style('top', (event.clientY - 10) + 'px');
        })
        .on('mousemove', event => {
          tip.style('left', (event.clientX + 15) + 'px')
            .style('top', (event.clientY - 10) + 'px');
        })
        .on('mouseout', event => {
          d3.select(event.currentTarget)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .style('filter', 'brightness(1)');
          tip.style('opacity', 0);
        })
        .transition()
        .duration(500)
        .delay((d, i) => i * 50)
        .attr('cx', d => x(d.pressure))
        .attr('cy', d => y(d.sleep))
        .attr('r', d => size(d.avgSat))
        .attr('fill', d => colour(d.pctDep))
        .style('opacity', 0.85);
    }

    // Enhanced risk level calculation
    function getRiskLevel(pressure, sleep, depRate) {
      if (pressure >= 4 && sleep <= 5.5) {
        return { label: 'Critical Risk Zone', color: '#ff6f96' };
      } else if (pressure >= 3.5 && sleep <= 6) {
        return { label: 'High Risk', color: '#ff8c42' };
      } else if (pressure <= 2.5 && sleep >= 7) {
        return { label: 'Optimal Zone', color: '#36e4fd' };
      } else if (depRate <= 0.3) {
        return { label: 'Protective Pattern', color: '#ffe987' };
      } else {
        return { label: 'Moderate Risk', color: '#ffd93d' };
      }
    }

    // Enhanced event listeners
    d3.select('#medicine-degree-select').on('change', update);
    d3.select('#medicine-show-females').on('change', update);
    d3.select('#medicine-show-males').on('change', update);

    // Initial render
    update();
    console.log('✅ Medicine matrix visualization ready!');
  }).catch(error => {
    console.error('❌ Error loading medicine matrix data:', error);
  });
}

// Initialize when medicine screen is shown
document.addEventListener('DOMContentLoaded', function() {
  // Wait for the medicine analysis screen to be shown
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const medicineScreen = document.getElementById('medicine-analysis-screen');
        if (medicineScreen && !medicineScreen.classList.contains('hidden')) {
          // Medicine screen is now visible, initialize matrix
          setTimeout(() => {
            if (document.getElementById('medicine-matrix-plot') && !window.medicineMatrixInitialized) {
              initializeMedicineMatrix();
              window.medicineMatrixInitialized = true;
            }
          }, 500);
        }
      }
    });
  });

  // Observe changes to the medicine screen
  const medicineScreen = document.getElementById('medicine-analysis-screen');
  if (medicineScreen) {
    observer.observe(medicineScreen, { attributes: true });
  }
});


function initializeArtsRadial() {
  console.log('🎨 Initializing enhanced arts radial visualization...');
  
  // Constants and helpers
  const ARTS = new Set(['BA', 'MA', 'LLB', 'PhD', 'BVoc', 'BVOC']);
  
  const sleepBucket = (s) => {
    s = String(s).toLowerCase();
    if (s.includes('less')) return '<5 h';
    if (s.includes('5-6')) return '5-6 h';
    if (s.includes('7-8')) return '7-8 h';
    if (s.includes('more')) return '8+ h';
    return 'unknown';
  };

  const sleepOrder = ['<5 h', '5-6 h', '7-8 h', '8+ h'];

  // SVG setup
  const svg = d3.select('#arts-radial');
  const W = +svg.attr('width');
  const H = +svg.attr('height');
  const R = Math.min(W, H) / 2 - 60;
  const g = svg.append('g').attr('transform', `translate(${W/2},${H/2})`);
  const tip = d3.select('#arts-radial-tooltip');

  // Enhanced scales
  const colour = d3.scaleLinear()
    .domain([0, 0.5, 1])
    .range(['#36e4fd', '#ffe987', '#ff6f96']);

  const thick = d3.scaleSqrt().range([15, 55]);
  const ringR = sleepOrder.map((_, i) => [i * 70 + 30, i * 70 + 75]);

  // Load and process data
  d3.csv('data/student_depression_dataset.csv').then(rows => {
    console.log('📊 Processing arts student data...');
    
    // Enhanced data processing
    rows.forEach(d => {
      const degree = String(d.Degree || '').replace(/\s+/g, '').toUpperCase();
      d.isArts = ARTS.has(degree) || degree.includes('BA') || degree.includes('MA') || 
                 degree.includes('LLB') || degree.includes('PHD') || degree.includes('BVOC');
      d.sleep = sleepBucket(d['Sleep Duration']);
      d.press = +d['Academic Pressure'] || 0;
      d.dep = +d.Depression === 1;
      d.gender = (d.Gender || '').trim();
    });

    const artsStudents = rows.filter(d => d.isArts);
    console.log(`🎭 Found ${artsStudents.length} arts students for analysis`);

    // Enhanced drawing function
    function draw() {
      const showF = d3.select('#arts-fem').property('checked');
      const showM = d3.select('#arts-male').property('checked');
      const showT = d3.select('#arts-small').property('checked');

      const arts = artsStudents.filter(d =>
        ((d.gender === 'Female' && showF) || (d.gender === 'Male' && showM))
      );

      let cells = d3.rollups(
        arts,
        v => ({ n: v.length, p: d3.mean(v, x => x.dep) }),
        d => d.sleep,
        d => Math.round(d.press) // Round pressure to integer
      ).flatMap(([sleep, a]) => 
        a.map(([pr, val]) => ({ sleep, press: +pr, ...val }))
      ).filter(d => d.press >= 1 && d.press <= 5); // Only valid pressure ranges

      if (!showT) cells = cells.filter(d => d.n >= 4);
      
      console.log(`📈 Analyzing ${cells.length} arts student groups`);
      
      thick.domain(d3.extent(cells, d => d.n) || [1, 10]);

      // Enhanced arc generator
      const arc = d3.arc()
        .startAngle(d => (d.press - 1) * 2 * Math.PI / 5)
        .endAngle(d => d.press * 2 * Math.PI / 5)
        .innerRadius(d => {
          const ringIndex = sleepOrder.indexOf(d.sleep);
          return ringIndex >= 0 ? ringR[ringIndex][0] : 50;
        })
        .outerRadius(d => {
          const ringIndex = sleepOrder.indexOf(d.sleep);
          const baseRadius = ringIndex >= 0 ? ringR[ringIndex][0] : 50;
          return baseRadius + thick(d.n);
        });

      // Enhanced data join
      const seg = g.selectAll('.arts-cell').data(cells, d => `${d.sleep}-${d.press}`);
      
      seg.exit()
        .transition()
        .duration(300)
        .style('opacity', 0)
        .remove();

      seg.enter()
        .append('path')
        .attr('class', 'arts-cell')
        .attr('stroke', '#2c2c2c')
        .attr('stroke-width', 1.5)
        .style('opacity', 0)
        .merge(seg)
        .on('mouseover', (event, d) => {
          d3.select(event.currentTarget)
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 3)
            .style('filter', 'brightness(1.2)');
            
          tip.style('opacity', 1)
            .html(`
              <div style="text-align: center; margin-bottom: 0.5rem;">
                <strong style="color: #ffffff; font-size: 1.1rem;">Arts Students</strong>
              </div>
              <div><strong>Sleep Duration:</strong> ${d.sleep}</div>
              <div><strong>Academic Pressure:</strong> ${d.press}/5</div>
              <div><strong>Student Count:</strong> ${d.n}</div>
              <div><strong>Depression Rate:</strong> ${(d.p * 100).toFixed(1)}%</div>
              <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #9b59b6;">
                <strong style="color: ${d.p > 0.6 ? '#ff6f96' : d.p > 0.3 ? '#ffe987' : '#36e4fd'};">
                  ${d.p > 0.6 ? 'High Risk' : d.p > 0.3 ? 'Moderate Risk' : 'Lower Risk'}
                </strong>
              </div>
            `)
            .style('left', (event.clientX + 15) + 'px')
            .style('top', (event.clientY - 10) + 'px');
        })
        .on('mousemove', event => {
          tip.style('left', (event.clientX + 15) + 'px')
            .style('top', (event.clientY - 10) + 'px');
        })
        .on('mouseout', event => {
          d3.select(event.currentTarget)
            .attr('stroke', '#2c2c2c')
            .attr('stroke-width', 1.5)
            .style('filter', 'brightness(1)');
          tip.style('opacity', 0);
        })
        .transition()
        .duration(600)
        .delay((d, i) => i * 50)
        .style('opacity', 0.9)
        .attr('d', arc)
        .attr('fill', d => colour(d.p || 0));

      // Update statistics
      updateArtsStats(arts, cells);
      
      // Build enhanced legends and guides
      buildEnhancedLegends();
      redrawArtsLabels();
    }

    // Enhanced statistics update
    function updateArtsStats(arts, cells) {
      const total = arts.length;
      const avgDepression = total > 0 ? d3.mean(arts, d => d.dep) * 100 : 0;
      const highRiskCombos = cells.filter(d => d.p > 0.6).length;
      const optimalSleep = arts.filter(d => d.sleep === '7-8 h').length;
      const optimalSleepPercent = total > 0 ? (optimalSleep / total) * 100 : 0;

      // Animate stats
      animateStatValue('arts-total-students', total);
      animateStatValue('arts-avg-depression', avgDepression, '%');
      animateStatValue('arts-high-risk', highRiskCombos);
      animateStatValue('arts-optimal-sleep', optimalSleepPercent, '%');
    }

    function animateStatValue(id, value, suffix = '') {
      const element = document.getElementById(id);
      if (!element) return;
      
      const startValue = 0;
      const duration = 1000;
      const increment = (value - startValue) / (duration / 16);
      let current = startValue;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          current = value;
          clearInterval(timer);
        }
        element.textContent = Math.round(current) + suffix;
      }, 16);
    }

    // Enhanced legend builders
    function buildEnhancedLegends() {
      // Only build if not already present
      if (svg.select('#arts-sleep-legend').empty()) {
        const sleepLegend = svg.append('g')
          .attr('id', 'arts-sleep-legend')
          .attr('transform', 'translate(80, 80)');
          
        const miniR = [20, 30, 40, 50];
        sleepLegend.selectAll('circle')
          .data(miniR)
          .enter().append('circle')
          .attr('r', d => d)
          .attr('fill', 'none')
          .attr('stroke', '#9b59b6')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '3,2')
          .attr('opacity', 0.6);
          
        sleepLegend.append('text')
          .attr('x', 0)
          .attr('y', 70)
          .text('Sleep Rings')
          .attr('text-anchor', 'middle')
          .style('fill', '#9b59b6')
          .style('font-size', '14px')
          .style('font-family', 'Orbitron');
      }

      if (svg.select('#arts-pressure-legend').empty()) {
        const pressureLegend = svg.append('g')
          .attr('id', 'arts-pressure-legend')
          .attr('transform', `translate(${W - 120}, 80)`);
          
        pressureLegend.append('circle')
          .attr('r', 45)
          .attr('fill', 'none')
          .attr('stroke', '#9b59b6')
          .attr('stroke-width', 2)
          .attr('opacity', 0.6);
          
        for (let p = 1; p <= 5; p++) {
          const ang = (p - 1) * 2 * Math.PI / 5 - Math.PI / 2;
          pressureLegend.append('text')
            .attr('x', Math.cos(ang) * 52)
            .attr('y', Math.sin(ang) * 52)
            .attr('text-anchor', 'middle')
            .attr('dy', '.35em')
            .text(p)
            .style('fill', '#9b59b6')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .style('font-family', 'Orbitron');
        }
        
        pressureLegend.append('text')
          .attr('x', 0)
          .attr('y', 70)
          .text('Pressure Clock')
          .attr('text-anchor', 'middle')
          .style('fill', '#9b59b6')
          .style('font-size', '14px')
          .style('font-family', 'Orbitron');
      }
    }

    function redrawArtsLabels() {
      // Remove existing labels
      g.selectAll('.arts-slabel').remove();
      g.selectAll('.arts-tickline').remove();
      
      // Sleep duration labels
      g.selectAll('.arts-slabel')
        .data(sleepOrder)
        .enter().append('text')
        .attr('class', 'arts-slabel')
        .attr('y', (d, i) => (ringR[i][0] + ringR[i][1]) / 2)
        .attr('dy', '.35em')
        .attr('text-anchor', 'middle')
        .text(d => d)
        .style('fill', '#2c2c2c')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .style('font-family', 'Orbitron');

      // Pressure division lines
      for (let p = 1; p <= 5; p++) {
        const ang = (p - 1) * 2 * Math.PI / 5;
        g.append('line')
          .attr('class', 'arts-tickline')
          .attr('x1', 0).attr('y1', 0)
          .attr('x2', Math.cos(ang) * (ringR[3][1] + 15))
          .attr('y2', Math.sin(ang) * (ringR[3][1] + 15))
          .attr('stroke', '#4a4a4a')
          .attr('stroke-width', 1)
          .attr('opacity', 0.7);
      }
    }

    // Event listeners
    d3.selectAll('#arts-fem, #arts-male, #arts-small').on('change', draw);
    
    // Initial render
    draw();
    console.log('✅ Arts radial visualization ready!');
    
  }).catch(error => {
    console.error('❌ Error loading arts radial data:', error);
  });
}

// Initialize when arts screen is shown
document.addEventListener('DOMContentLoaded', function() {
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const artsScreen = document.getElementById('arts-analysis-screen');
        if (artsScreen && !artsScreen.classList.contains('hidden')) {
          setTimeout(() => {
            if (document.getElementById('arts-radial') && !window.artsRadialInitialized) {
              initializeArtsRadial();
              window.artsRadialInitialized = true;
            }
          }, 500);
        }
      }
    });
  });

  const artsScreen = document.getElementById('arts-analysis-screen');
  if (artsScreen) {
    observer.observe(artsScreen, { attributes: true });
  }
});


// Enhanced initialization with user assessment integration
window.onload = () => {
  // Load career data
  d3.csv("data/mindscope_profiles_revised_final.csv", d3.autoType).then(data => {
    data.forEach(row => {
      careerData[row.career] = {
        name: row.career,
        depressionRate: row.depressionRate,
        avgSleep: row.avgSleep,
        stressLevel: row.stressLevel,
        sleepScore: row.sleepScore,
        insights: row.insights,
        detailData: JSON.parse(row.detailData)
      };
    });

    // Create career cards
    const grid = document.querySelector(".career-grid");
    Object.entries(careerData).forEach(([key, d]) => {
      const avatarMap = {
        business: 'images/business-avatar.png',
        engineering: 'images/engineering-avatar.png',
        arts: 'images/arts-avatar.png',
        medicine: 'images/medicine-avatar.png'
      };
      const card = document.createElement("div");
      card.className = "career-card";
      card.setAttribute("data-career", key);
      card.innerHTML = `
        <div class="risk-indicator ${getRiskClass(d.depressionRate)}"></div>
        <div class="avatar-container">
          <img src="${avatarMap[key]}" alt="${d.name} avatar" class="career-avatar" />
        </div>
        <h3 class="career-title">${d.name.toUpperCase()}</h3>
        <div class="career-stats">
          <div class="stat"><div class="stat-label">Depression Rate</div><div class="stat-value depression-rate">${(d.depressionRate*100).toFixed(0)}%</div></div>
          <div class="stat"><div class="stat-label">Avg Sleep</div><div class="stat-value sleep-duration">${d.avgSleep}</div></div>
          <div class="stat"><div class="stat-label">Stress Level</div><div class="stat-value stress-level">${(d.stressLevel * 5).toFixed(1)}/5</div></div>
        </div>
      `;
      card.onclick = () => selectCareer(key);
      grid.appendChild(card);
    });
  });

  // Setup enhanced confirm button functionality
  const confirmButton = document.getElementById("confirm-button");
  if (confirmButton) {
    confirmButton.addEventListener("click", () => {
      document.getElementById("profiles-screen").classList.add("hidden");
      document.getElementById("confirm-container").classList.add("hidden");
    
      const selected = window.selectedCareer.toLowerCase();
      if (selected === "business") {
        document.getElementById("timeline-screen").classList.remove("hidden");
        renderTimelineChart();
      } else if (selected === "engineering") {
        document.getElementById("engineering-matrix-screen").classList.remove("hidden");
        renderEngineeringMatrix();
      } else if (selected === "arts") {
        document.getElementById("arts-analysis-screen").classList.remove("hidden");
        renderDietaryHabitsChart();
        renderStudySatisfactionChart();
      } else if (selected === "medicine") {
        document.getElementById("medicine-analysis-screen").classList.remove("hidden");
        if (window.MedicineSpiral) {
          setTimeout(() => {
            MedicineSpiral.render();
          }, 100);
        }
      } else {
        document.getElementById("risk-panels-screen").classList.remove("hidden");
        renderHeatmap();
        
        if (animatedStudents && animatedStudents.length > 0) {
          initializeAnimation();
          setTimeout(() => playAllPhases(), 500);
        }
      }
    
      window.scrollTo({ top: 0, behavior: "smooth" });
    });      
  }

  
  

  // Load student data for animations
  d3.csv("data/student_depression_dataset.csv").then(data => {
    const sampleSize = 2000;
    animatedStudents = data
      .map((d, i) => {
        const degree = normalizeDegree(d.Degree);
        const profile = degreeToProfile[degree];
        if (!profile) return null;

        return {
          id: i,
          profile: profile,
          hasDepression: d.Depression === '1' || d.Depression === 'Yes',
          academicPressure: +d["Academic Pressure"] || 0,
          workPressure: +d["Work Pressure"] || 0,
          sleepDuration: d["Sleep Duration"],
          financialStress: d["Financial Stress"] === 'Yes',
          familyHistory: d["Family History of Mental Illness"] === 'Yes',
          suicidalThoughts: d["Have you ever had suicidal thoughts ?"] === 'Yes',
          studyHours: +d["Work/Study Hours"] || 0,
          gender: d.Gender,
          age: +d.Age
        };
      })
      .filter(d => d !== null)
      .sort(() => 0.5 - Math.random())
      .slice(0, sampleSize);

    console.log(`✅ Loaded ${animatedStudents.length} student records for visualization`);
  });

  // Setup enhanced event handlers
  setupEnhancedEventHandlers();
  setupEnhancedBackButtons();
  
  console.log('✅ Enhanced Career Path Chronicles initialized with integrated user assessment');
};

// Make functions globally available
window.goToPhase = goToPhase;
window.currentPhase = currentPhase;

// Enhanced integration message
console.log('🎮 Enhanced Career Path Chronicles with Integrated User Assessment');
console.log('📊 Features: Career exploration → Risk analysis → Personal assessment → Coping strategies');
console.log('🔗 Seamless flow between dataset insights and personal evaluation');