// Setup Scrollama
const scroller = scrollama();

// Set up SVG
const svgWidth = 600;
const svgHeight = 400;

const svg = d3.select("#chart")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Create 100 fake student entries
const studentData = d3.range(100).map(i => ({
  id: i,
  sleep: Math.random() > 0.5 ? "good" : "poor",
  depressed: Math.random() > 0.7 ? true : false
}));

// Initial dot layout (Step 0)
function drawInitial() {
  svg.selectAll("circle")
    .data(studentData, d => d.id)
    .join("circle")
    .attr("cx", () => Math.random() * svgWidth)
    .attr("cy", () => Math.random() * svgHeight)
    .attr("r", 5)
    .attr("fill", "#aaa");
}

// Color by sleep quality (Step 1)
function colorBySleep() {
  svg.selectAll("circle")
    .transition()
    .duration(800)
    .attr("fill", d => d.sleep === "good" ? "#69b3a2" : "#f28e2b");
}

// Cluster by depression status (Step 2)
function clusterByDepression() {
  svg.selectAll("circle")
    .transition()
    .duration(800)
    .attr("cx", d => d.depressed ? 200 : 400)
    .attr("cy", () => 150 + Math.random() * 100)
    .attr("fill", d => d.depressed ? "#e15759" : "#4e79a7");
}

// Add a summary label (Step 3)
function showLabel() {
  svg.append("text")
    .attr("x", svgWidth / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("opacity", 0)
    .text("Clustered by Depression Status")
    .transition()
    .duration(800)
    .attr("opacity", 1);
}

// Scroll event handler
scroller
  .setup({
    step: ".step",
    offset: 0.5,
    debug: false
  })
  .onStepEnter(response => {
    const i = response.index;

    if (i === 0) drawInitial();
    if (i === 1) colorBySleep();
    if (i === 2) clusterByDepression();
    if (i === 3) showLabel();
  });

