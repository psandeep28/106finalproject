function renderBarChart(data) {
    const svg = d3.select("#barChart");
    svg.selectAll("*").remove();
  
    const margin = { top: 20, right: 20, bottom: 40, left: 60 },
          width = +svg.attr("width") - margin.left - margin.right,
          height = +svg.attr("height") - margin.top - margin.bottom;
  
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  
    const metrics = [
      { label: "Academic Pressure", value: data.pressure },
      { label: "Financial Stress", value: data.stress }
    ];
  
    const x = d3.scaleLinear().domain([0, 5]).range([0, width]);
    const y = d3.scaleBand().domain(metrics.map(d => d.label)).range([0, height]).padding(0.3);
  
    g.selectAll("rect")
      .data(metrics)
      .enter().append("rect")
      .attr("x", 0)
      .attr("y", d => y(d.label))
      .attr("height", y.bandwidth())
      .attr("width", 0)
      .attr("fill", "steelblue")
      .transition()
      .duration(800)
      .attr("width", d => x(d.value));
  
    g.append("g").call(d3.axisLeft(y));
    g.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(x));
  }
  
  function renderCGPA(data) {
    const svg = d3.select("#cgpaBar");
    svg.selectAll("*").remove();
  
    const width = +svg.attr("width"), height = +svg.attr("height");
    const margin = 10, barHeight = 20;
  
    svg.append("rect")
      .attr("x", margin)
      .attr("y", height / 2 - barHeight / 2)
      .attr("width", width - 2 * margin)
      .attr("height", barHeight)
      .attr("fill", "#ddd");
  
    svg.append("rect")
      .attr("x", margin)
      .attr("y", height / 2 - barHeight / 2)
      .attr("width", 0)
      .attr("height", barHeight)
      .attr("fill", "#4caf50")
      .transition()
      .duration(1000)
      .attr("width", (width - 2 * margin) * (data.cgpa / 10));
  
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height / 2 + 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .text(`CGPA: ${data.cgpa.toFixed(2)}`);
  }
  
  function renderDonut(data) {
    const svg = d3.select("#depressionDonut");
    svg.selectAll("*").remove();
  
    const width = +svg.attr("width"), height = +svg.attr("height"), radius = Math.min(width, height) / 2;
    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);
  
    const arc = d3.arc().innerRadius(50).outerRadius(radius);
    const pie = d3.pie().value(d => d.value);
  
    const depression = data.depressionRate;
    const donutData = [
      { label: "At Risk", value: depression },
      { label: "Not At Risk", value: 100 - depression }
    ];
  
    const color = d3.scaleOrdinal().domain(donutData.map(d => d.label)).range(["#e15759", "#4caf50"]);
  
    g.selectAll("path")
      .data(pie(donutData))
      .enter().append("path")
      .attr("d", arc)
      .attr("fill", d => color(d.data.label));
  
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("y", 5)
      .attr("font-size", "16px")
      .text(`${depression.toFixed(1)}% Risk`);
  }
  
  function processProfileData(allData, fieldName) {
    const filtered = allData.filter(d => d.Career_Field === fieldName);
  
    const pressure = d3.mean(filtered, d => +d["Academic Pressure"]);
    const stress = d3.mean(filtered, d => +d["Financial Stress"]);
    const cgpa = d3.mean(filtered, d => +d["CGPA"]);
    const depressionRate = d3.mean(filtered, d => +d["Depression"]) * 100;
    const sleepCounts = d3.rollup(filtered, v => v.length, d => d["Sleep Duration"]);
    const mostCommonSleep = Array.from(sleepCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown";
  
    return { pressure, stress, cgpa, depressionRate, sleep: mostCommonSleep };
  } 
  