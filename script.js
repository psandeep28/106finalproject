export { createRadarChart, startGame, goBack };


let careerData = {};

function startGame() {
  document.getElementById("welcome-screen").classList.add("hidden");
  document.getElementById("profiles-screen").classList.remove("hidden");
}

function goBack() {
  document.getElementById("profiles-screen").classList.add("hidden");
  document.getElementById("welcome-screen").classList.remove("hidden");
  document.getElementById("visualization-panel").classList.add("hidden");
}

function selectCareer(career) {
    document.querySelectorAll(".career-card").forEach(card => card.classList.remove("active"));
    document.querySelector(`[data-career="${career}"]`).classList.add("active");
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

  function renderSleepRiskChart() {
    const data = [
      { sleep: "Less than 5 hours", rate: 64.5 },
      { sleep: "5–6 hours", rate: 56.9 },
      { sleep: "7–8 hours", rate: 59.5 },
      { sleep: "More than 8 hours", rate: 50.9 }
    ];
  
    const svg = d3.select("#sleep-risk-chart").append("svg")
      .attr("width", 400).attr("height", 300);
  
    const x = d3.scaleBand()
      .domain(data.map(d => d.sleep))
      .range([40, 360])
      .padding(0.2);
  
    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([250, 40]);
  
    svg.append("g")
      .attr("transform", "translate(0,250)")
      .call(d3.axisBottom(x));
  
    svg.append("g")
      .attr("transform", "translate(40,0)")
      .call(d3.axisLeft(y));
  
    svg.selectAll("rect")
      .data(data)
      .enter().append("rect")
      .attr("x", d => x(d.sleep))
      .attr("y", d => y(d.rate))
      .attr("width", x.bandwidth())
      .attr("height", d => 250 - y(d.rate))
      .attr("fill", "#00ffff");
  }
  
  function renderWorkRiskChart() {
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
      const card = document.createElement("div");
      card.className = "career-card";
      card.setAttribute("data-career", key);
      card.innerHTML = `
        <div class="risk-indicator ${getRiskClass(d.depressionRate)}"></div>
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
      document.getElementById("risk-panels-screen").classList.remove("hidden");
      d3.select("#sleep-risk-chart").selectAll("*").remove();
      d3.select("#work-risk-chart").selectAll("*").remove();
      renderSleepRiskChart();
      renderWorkRiskChart();
    });
  }
};

function getRiskClass(rate) {
  if (rate >= 0.65) return "risk-critical";
  if (rate >= 0.5) return "risk-high";
  if (rate >= 0.35) return "risk-medium";
  return "risk-low";
}

document.getElementById("confirm-button").addEventListener("click", () => {
    // Hide profile screen and confirm button
    document.getElementById("profiles-screen").classList.add("hidden");
    document.getElementById("confirm-container").classList.add("hidden");
  
    // Show the risk panel page
    document.getElementById("risk-panels-screen").classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: 'smooth' });

  
    // Trigger the D3 charts
    renderSleepRiskChart();
    renderWorkRiskChart();
  });
  
