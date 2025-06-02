export { createRadarChart, startGame, goBack };


let careerData = {};

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
    d3.select("#work-risk-chart").selectAll("*").remove();
    renderSleepRiskChart();
    renderWorkRiskChart();
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
      document.getElementById("visualization-panel").classList.add("hidden");
  
      if (window.selectedCareer.toLowerCase() === "business") {
        document.getElementById("timeline-screen").classList.remove("hidden");
        renderTimelineChart();
      } else {
        document.getElementById("risk-panels-screen").classList.remove("hidden");
        d3.select("#sleep-risk-chart").selectAll("*").remove();
        d3.select("#work-risk-chart").selectAll("*").remove();
        renderSleepRiskChart();
        renderWorkRiskChart();
      }
    });
}
};

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
  


function getRiskClass(rate) {
  if (rate >= 0.65) return "risk-critical";
  if (rate >= 0.5) return "risk-high";
  if (rate >= 0.35) return "risk-medium";
  return "risk-low";
}

document.getElementById("confirm-button").addEventListener("click", () => {
    document.getElementById("profiles-screen").classList.add("hidden");
    document.getElementById("confirm-container").classList.add("hidden");
  
    if (window.selectedCareer.toLowerCase() === "business") {
      // ✅ SHOW ONLY TIMELINE SCREEN
      document.getElementById("timeline-screen").classList.remove("hidden");
      renderTimelineChart();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Directly go to risk panels
      document.getElementById("risk-panels-screen").classList.remove("hidden");
      renderSleepRiskChart();
      renderWorkRiskChart();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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
