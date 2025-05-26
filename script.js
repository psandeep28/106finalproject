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
  panel.scrollIntoView({ behavior: "smooth" });
}

function updateInfoPanel(data) {
  document.getElementById("depression-bar").style.width = (data.depressionRate * 100) + "%";
  document.getElementById("depression-text").textContent = `Depression Rate: ${(data.depressionRate * 100).toFixed(1)}%`;
  document.getElementById("sleep-bar").style.width = data.sleepScore + "%";
  document.getElementById("sleep-text").textContent = `Average Sleep: ${data.avgSleep}`;
  document.getElementById("stress-bar").style.width = (data.stressLevel / 5 * 100) + "%";
  document.getElementById("stress-text").textContent = `Stress Level: ${data.stressLevel}/5`;
  document.getElementById("insights-text").textContent = data.insights;
}

function createRadarChart(data) {
  const container = d3.select("#chart-container");
  container.selectAll("*").remove();
  const width = 400;
  const height = 400;
  const radius = Math.min(width, height) / 2 - 40;
  const svg = container.append("svg").attr("width", width).attr("height", height);
  const g = svg.append("g").attr("transform", `translate(${width/2}, ${height/2})`);

  const angleScale = d3.scaleLinear().domain([0, data.detailData.length]).range([0, 2 * Math.PI]);
  const radiusScale = d3.scaleLinear().domain([0, 100]).range([0, radius]);

  for (let i = 1; i <= 5; i++) {
    g.append("circle")
      .attr("r", (radius / 5) * i)
      .attr("fill", "none")
      .attr("stroke", "#00ff00")
      .attr("stroke-opacity", 0.3)
      .attr("stroke-width", 1);
  }

  data.detailData.forEach((d, i) => {
    const angle = angleScale(i) - Math.PI / 2;
    g.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", Math.cos(angle) * radius)
      .attr("y2", Math.sin(angle) * radius)
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

  const area = d3.areaRadial()
    .angle((d, i) => angleScale(i))
    .innerRadius(0)
    .outerRadius(d => radiusScale(d.value))
    .curve(d3.curveLinearClosed);

  g.append("path")
    .datum(data.detailData)
    .attr("d", area)
    .attr("fill", "#ff00ff")
    .attr("fill-opacity", 0.2)
    .attr("stroke", "#ff00ff")
    .attr("stroke-width", 2);

  g.selectAll(".data-point")
    .data(data.detailData)
    .enter()
    .append("circle")
    .attr("class", "data-point")
    .attr("cx", (d, i) => Math.cos(angleScale(i) - Math.PI / 2) * radiusScale(d.value))
    .attr("cy", (d, i) => Math.sin(angleScale(i) - Math.PI / 2) * radiusScale(d.value))
    .attr("r", 0)
    .attr("fill", "#ffff00")
    .attr("stroke", "#ff00ff")
    .attr("stroke-width", 2)
    .transition()
    .duration(1000)
    .delay((d, i) => i * 100)
    .attr("r", 4);
}

// Load data from CSV on page load
window.onload = () => {
    d3.csv("data/mindscope_profiles_transformed_clean.csv", d3.autoType).then(data => {
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
          <div class="stat"><div class="stat-label">Stress Level</div><div class="stat-value stress-level">${d.stressLevel}/5</div></div>
        </div>
      `;
      card.onclick = () => selectCareer(key);
      grid.appendChild(card);
    });
  });
};

function getRiskClass(rate) {
  if (rate >= 0.65) return "risk-critical";
  if (rate >= 0.5) return "risk-high";
  if (rate >= 0.35) return "risk-medium";
  return "risk-low";
}
