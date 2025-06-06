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
  document.getElementById('user-profile').classList.remove('hidden');
}

function goBack() {
  document.getElementById("profiles-screen").classList.add("hidden");
  document.getElementById("welcome-screen").classList.remove("hidden");
  document.getElementById("visualization-panel").classList.add("hidden");
  document.getElementById('user-profile').classList.add('hidden');
}

function selectCareer(career) {
    document.querySelectorAll(".career-card").forEach(card => card.classList.remove("active"));
    document.querySelector(`[data-career="${career}"]`).classList.add("active");
  
    // Save selected career globally
    window.selectedCareer = career;
  
    showVisualization(career); // always show radar chart first
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

  document.getElementById("next-to-risk").addEventListener("click", () => {
    // 👇 HIDE TIMELINE
    document.getElementById("timeline-screen").classList.add("hidden");
  
    // 👇 SHOW RISK PANELS
    document.getElementById("risk-panels-screen").classList.remove("hidden");
  
    // 🧼 Clear & re-render risk visuals
    d3.select("#sleep-risk-chart").selectAll("*").remove();
    d3.select("depression-unity-chart").selectAll("*").remove();
    renderHeatmap();
    playAllPhases();
  });
  

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

    const angleScale = d3.scaleLinear()
      .domain([0, data.detailData.length])
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
    data.detailData.forEach((d, i) => {
      const angle = angleScale(i) - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      g.append("line")
        .attr("x1", 0).attr("y1", 0)
        .attr("x2", x).attr("y2", y)
        .attr("stroke", "#00ff00")
        .attr("stroke-opacity", 0.5)
        .attr("stroke-width", 1);

      g.append("text")
        .attr("x", Math.cos(angle) * (radius + 20))
        .attr("y", Math.sin(angle) * (radius + 20))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#00ffff")
        .attr("font-family", "Orbitron")
        .attr("font-size", "10px")
        .text(d.factor);
    });

    // Area path
    const area = d3.areaRadial()
      .angle((d, i) => angleScale(i))
      .innerRadius(0)
      .outerRadius(d => radiusScale(d.value))
      .curve(d3.curveLinearClosed);

    const radarPath = g.append("path")
      .datum(data.detailData)
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
      .data(data.detailData)
      .enter()
      .append("circle")
      .attr("class", "data-point")
      .attr("cx", (d, i) => Math.cos(angleScale(i) - Math.PI / 2) * radiusScale(d.value))
      .attr("cy", (d, i) => Math.sin(angleScale(i) - Math.PI / 2) * radiusScale(d.value))
      .attr("r", 4)
      .attr("fill", "#ffff00")
      .attr("stroke", "#ff00ff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        if (locked) return;
        d3.select(this).transition().duration(150).attr("r", 7);
        tooltip.html(`${d.factor}: ${d.value}%`)
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
          tooltip.html(`${d.factor}: ${d.value}%`)
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 30 + "px")
            .style("opacity", 1);
        } else {
          tooltip.style("opacity", 0);
          d3.select(this).transition().duration(150).attr("r", 4);
        }
      });

    // Optional: Add mini legend below
    container.append("div")
      .attr("class", "legend")
      .style("margin-top", "10px")
      .style("font-family", "Orbitron")
      .style("color", "#00ffff")
      .style("font-size", "12px")
      .html(`
        <strong>Legend:</strong>
        <span style="color:#ffff00;">●</span> Metric point &nbsp;&nbsp;
        <span style="color:#ff00ff;">▰</span> Risk polygon
      `);
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
  
      // ✅ Now that x/y are defined, draw the axes
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
  
      // ✅ Add legend
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

    renderDietaryHabitsChart();
    renderStudySatisfactionChart();
  }  

  function renderWorkRiskChart() {
    d3.select("#work-risk-chart").selectAll("*").remove();
    const data = [
      { group: "With Depression", hours: 7.81 },
      { group: "Without Depression", hours: 6.24 }
    ];

    const svg = d3.select("#work-risk-chart").append("svg")
      .attr("width", 400).attr("height", 300);

    const x = d3.scaleBand()
      .domain(data.map(d => d.group))
      .range([60, 340])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, 10])
      .range([250, 40]);

    svg.append("g")
      .attr("transform", "translate(0,250)")
      .call(d3.axisBottom(x));

    svg.append("g")
      .attr("transform", "translate(60,0)")
      .call(d3.axisLeft(y));

    svg.selectAll("rect")
      .data(data)
      .enter().append("rect")
      .attr("x", d => x(d.group))
      .attr("y", d => y(d.hours))
      .attr("width", x.bandwidth())
      .attr("height", d => 250 - y(d.hours))
      .attr("fill", "#ff00ff");
  }

  document.getElementById("next-from-engineering").addEventListener("click", () => {
    document.getElementById("engineering-matrix-screen").classList.add("hidden");
    document.getElementById("risk-panels-screen").classList.remove("hidden");
    renderHeatmap();
    renderWorkRiskChart();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
// Load data from CSV on page load
window.onload = () => {
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
        }
        else if (selected === "arts") {
          document.getElementById("arts-analysis-screen").classList.remove("hidden");
          renderDietaryHabitsChart();
          renderStudySatisfactionChart();
        } 
        else if (selected === "medicine") {
          document.getElementById("medicine-analysis-screen").classList.remove("hidden");
          // Call the medicine spiral from the separate file
          MedicineSpiral.render();
        }
        else {
          document.getElementById("risk-panels-screen").classList.remove("hidden");
          renderHeatmap();
          renderWorkRiskChart();
        }
      
        window.scrollTo({ top: 0, behavior: "smooth" });
      });      
}

d3.csv("data/student_depression_dataset.csv").then(data => {
  const sampleSize = 2000; // Limit for performance
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
    .sort(() => 0.5 - Math.random()) // shuffle
    .slice(0, sampleSize);

  initializeAnimation(); // 👈 trigger phase setup once data is ready
});
};


function goToPhase(phase) {
  currentPhase = phase;
  const label = document.getElementById("phase-description-label");
  if (label) label.textContent = phaseDescriptions[phase];

  // Show/hide factor labels
  d3.selectAll('.factor-label')
    .classed('visible', phase === 2);

  // Update button states
  d3.selectAll('.phase-btn').classed('active', false);
  const phaseButtons = document.querySelectorAll('.phase-btn');
  if (phaseButtons[phase - 1]) {
    phaseButtons[phase - 1].classList.add('active');
  }

  // Get position function for this phase
  let positionFn;
  switch(phase) {
    case 1: positionFn = getPhase1Position; break;
    case 2: positionFn = getPhase2Position; break;
    case 3: positionFn = getPhase3Position; break;
    default: return;
  }

  // Check if we have data and SVG
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

  // Animate dots to new positions
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

// Make sure position functions return correct values
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
  
  // Use gradual positioning based on actual values, not just binary
  // Academic pressure affects vertical position (higher pressure = higher up)
  const academicOffset = ((d.academicPressure - 5) / 5) * 100; // Scale from -100 to +100
  y -= academicOffset;
  
  // Work pressure also affects vertical but opposite direction
  const workOffset = ((d.workPressure - 5) / 5) * 50;
  y += workOffset;
  
  // Financial stress affects horizontal position
  if (d.financialStress) {
    x -= 120 + (Math.random() * 60 - 30); // More variation
  }
  
  // Study hours affects horizontal position
  const studyOffset = ((d.studyHours - 8) / 4) * 80; // Gradual based on hours
  x += studyOffset;
  
  // Add more random spread to avoid perfect clusters
  const angle = Math.random() * Math.PI * 2;
  const spread = Math.random() * 40 + 20;
  x += Math.cos(angle) * spread;
  y += Math.sin(angle) * spread;
  
  // Keep within bounds
  x = Math.max(50, Math.min(650, x));
  y = Math.max(50, Math.min(350, y));
  
  return { x, y };
}

function getPhase3Position(d, i) {
  const width = 700, height = 450;
  const centerX = width / 2;
  const centerY = height / 2;

  // ALL students form the heart shape
  const index = animatedStudents.indexOf(d);
  const total = animatedStudents.length;
  
  // Distribute all students evenly around the heart
  const t = (index / total) * Math.PI * 2;
  
  // Heart parametric equation - larger and clearer
  const scale = 120; // Bigger heart
  const x = scale * Math.pow(Math.sin(t), 3);
  const y = -(scale * 0.8) * (1.3 * Math.cos(t) - 0.5 * Math.cos(2*t) - 0.2 * Math.cos(3*t) - 0.1 * Math.cos(4*t));
  
  return { 
    x: centerX + x, 
    y: centerY + y
  };
}

// Make functions globally available
window.goToPhase = goToPhase;
window.currentPhase = currentPhase;

function initializeAnimation() {
  const svg = d3.select("#depression-unity-chart").html("").append("svg")
    .attr("width", 700)
    .attr("height", 450);

  // Create tooltip div if it doesn't exist
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
      // Make the dot bigger on hover
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", 5);
      
      // Show tooltip
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
      // Return to normal size
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", 2);
      
      // Hide tooltip
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
  
        // X-Axis
        focus.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .append("text") // 👈 Axis label
        .attr("x", (width / 2))
        .attr("y", 40)
        .attr("fill", "#ffff00")
        .attr("text-anchor", "middle")
        .attr("font-family", "Orbitron")
        .attr("font-size", "14px")
        .text("Age");

        // Y-Left (Stress Score)
        focus.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .append("text") // 👈 Axis label
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .attr("fill", "#ffff00")
        .attr("font-family", "Orbitron")
        .attr("font-size", "14px")
        .text("Stress Score");

        // Y-Right (Depression Rate %)
        focus.append("g")
        .attr("transform", `translate(${width - margin.right},0)`)
        .call(d3.axisRight(yR).tickFormat(d3.format(".0%")))
        .append("text") // 👈 Axis label
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 40)
        .attr("text-anchor", "middle")
        .attr("fill", "#ffff00")
        .attr("font-family", "Orbitron")
        .attr("font-size", "14px")
        .text("Depression Rate (%)");

  
        focus.append("g").attr("transform", `translate(${width - margin.right},0)`)
          .call(d3.axisRight(yR).tickFormat(d3.format(".0%")))
          .call(g => g.append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .text("Depression Rate")
          );

        context.append("g")
        .attr("transform", `translate(0,${height2})`)
        .call(d3.axisBottom(x2))
        .selectAll("text")
        .style("font-size", "10px")
        .style("fill", "#00ff00")
        .style("font-family", "Orbitron");
  
        // Line Paths
        focus.append("path").datum(data).attr("fill", "none").attr("stroke", "#00ffff").attr("stroke-width", 2).attr("d", line("Academic Pressure", x, y));
        focus.append("path").datum(data).attr("fill", "none").attr("stroke", "#ff00ff").attr("stroke-width", 2).attr("d", line("Financial Stress", x, y));
        focus.append("path").datum(data).attr("fill", "none").attr("stroke", "#ffff00").attr("stroke-width", 2).attr("stroke-dasharray", "4 2").attr("d", line("Depression", x, yR));
  
        // Dots
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
  
        // High Stress Pulses
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
  
      // Context (Mini) Chart & Brush
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
  
      g.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .attr("color", "#00ff00");
  
      g.append("g")
        .call(d3.axisLeft(y))
        .attr("color", "#00ff00");

  
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
  
  
  

function getRiskClass(rate) {
  if (rate >= 0.65) return "risk-critical";
  if (rate >= 0.5) return "risk-high";
  if (rate >= 0.35) return "risk-medium";
  return "risk-low";
}
document.getElementById("confirm-button").addEventListener("click", () => {
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
    // NEW: Show arts-specific screen
    document.getElementById("arts-analysis-screen").classList.remove("hidden");
    renderDietaryHabitsChart();
    renderStudySatisfactionChart();
  } 
  else if (selected === "medicine") {
    document.getElementById("medicine-analysis-screen").classList.remove("hidden");
    // Only call this once and add a delay to ensure DOM is ready
    setTimeout(() => {
      MedicineSpiral.render();
    }, 100);
  }else {
    // Medicine or other profiles go to risk panels
    document.getElementById("risk-panels-screen").classList.remove("hidden");
    renderHeatmap();
    
    if (animatedStudents && animatedStudents.length > 0) {
      initializeAnimation();
      setTimeout(() => playAllPhases(), 500);
    }
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.getElementById("next-to-risk").addEventListener("click", () => {
  // Hide timeline
  document.getElementById("timeline-screen").classList.add("hidden");

  // Show risk panels
  document.getElementById("risk-panels-screen").classList.remove("hidden");

  // Clear & re-render risk visuals
  d3.select("#sleep-risk-chart").selectAll("*").remove();
  d3.select("#depression-unity-chart").selectAll("*").remove(); // Fixed: added #
  
  renderHeatmap();
  
  // Initialize and play depression animation
  if (animatedStudents && animatedStudents.length > 0) {
      initializeAnimation();
      setTimeout(() => playAllPhases(), 500);
  }
});
  
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
  

  document.getElementById("next-to-user").addEventListener("click", () => {
    document.getElementById("risk-panels-screen").classList.add("hidden");
    document.getElementById("user-profile").classList.remove("hidden");
  
    // Optionally scroll into view
    document.getElementById("user-profile").scrollIntoView({ behavior: "smooth" });
  });

  document.addEventListener("DOMContentLoaded", function () {
    const nextBtn = document.getElementById("next-to-user");
    const userProfile = document.getElementById("user-profile");
    const riskPanels = document.getElementById("risk-panels-screen");

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        riskPanels.classList.add("hidden");
        userProfile.classList.remove("hidden");
        userProfile.scrollIntoView({ behavior: "smooth" });
      });
    }
  });

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
    // Legend
    const legendData = [
      { label: 'Not Depressed (Blue)', value: 0 },
      { label: 'Depressed (Red)', value: 1 }
    ];
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width + 30}, 10)`);
    legend.append('text')
      .attr('x', 0)
      .attr('y', -20)
      .attr('font-size', '16px')
      .attr('fill', '#fff')
      .text('Legend:');
    legendData.forEach((d, i) => {
      const item = legend.append('g')
        .attr('class', 'legend-item')
        .attr('transform', `translate(0, ${i * 30})`)
        .style('cursor', 'pointer')
        .on('click', () => toggleStatus(d.value));
      item.append('rect')
        .attr('width', 18)
        .attr('height', 18)
        .attr('fill', color(d.value));
      item.append('text')
        .attr('x', 24)
        .attr('y', 14)
        .attr('font-size', '14px')
        .attr('fill', '#fff')
        .text(d.label);
    });
    const visibility = { 0: true, 1: true };
    function toggleStatus(val) {
      visibility[val] = !visibility[val];
      svg.selectAll('.series')
        .filter(d => d.key == val)
        .attr('display', visibility[val] ? null : 'none');
      legend.selectAll('.legend-item')
        .filter((d, i) => legendData[i].value == val)
        .select('text')
        .attr('fill-opacity', visibility[val] ? 1 : 0.3);
      legend.selectAll('.legend-item')
        .filter((d, i) => legendData[i].value == val)
        .select('rect')
        .attr('fill-opacity', visibility[val] ? 1 : 0.3);
    }
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('fill', '#ff00ff')
      .text('Depression Status by Dietary Habits');
  });
}

function addBackButtonHandlers() {
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
        
        // Clean up tooltips
        d3.selectAll('.tooltip').remove();
        d3.selectAll('.medicine-spiral-tooltip').remove();
        d3.selectAll('.ring-tooltip').remove();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  });
}

// Call this function when DOM is loaded
document.addEventListener("DOMContentLoaded", addBackButtonHandlers);

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
    // Legend
    const legendData = [
      { label: 'Not Depressed (Blue)', value: 0 },
      { label: 'Depressed (Red)', value: 1 }
    ];
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width + 30}, 10)`);
    legend.append('text')
      .attr('x', 0)
      .attr('y', -20)
      .attr('font-size', '16px')
      .attr('fill', '#fff')
      .text('Legend:');
    legendData.forEach((d, i) => {
      const item = legend.append('g')
        .attr('class', 'legend-item')
        .attr('transform', `translate(0, ${i * 30})`)
        .style('cursor', 'pointer')
        .on('click', () => toggleStatus(d.value));
      item.append('rect')
        .attr('width', 18)
        .attr('height', 18)
        .attr('fill', color(d.value));
      item.append('text')
        .attr('x', 24)
        .attr('y', 14)
        .attr('font-size', '14px')
        .attr('fill', '#fff')
        .text(d.label);
    });
    const visibility = { 0: true, 1: true };
    function toggleStatus(val) {
      visibility[val] = !visibility[val];
      svg.selectAll('.series')
        .filter(d => d.key == val)
        .attr('display', visibility[val] ? null : 'none');
      legend.selectAll('.legend-item')
        .filter((d, i) => legendData[i].value == val)
        .select('text')
        .attr('fill-opacity', visibility[val] ? 1 : 0.3);
      legend.selectAll('.legend-item')
        .filter((d, i) => legendData[i].value == val)
        .select('rect')
        .attr('fill-opacity', visibility[val] ? 1 : 0.3);
    }
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('fill', '#ff00ff')
      .text('Depression Status by Study Satisfaction');
  });
}

// Add calls to these in renderHeatmap or risk panel logic
const oldRenderHeatmap = renderHeatmap;
renderHeatmap = function() {
  oldRenderHeatmap();
  renderDietaryHabitsChart();
  renderStudySatisfactionChart();
}
