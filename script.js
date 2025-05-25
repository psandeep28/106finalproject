// Initialize scrollama
const scroller = scrollama();

// SVG setup
const width = 600;
const height = 400;

const svg = d3.select("#chart")
  .attr("width", width)
  .attr("height", height);

// Create 100 fake students
const data = d3.range(100).map(i => ({
  id: i,
  sleep: Math.random() > 0.5 ? "good" : "poor",
  depressed: Math.random() > 0.7,
  x: Math.random() * width,
  y: Math.random() * height
}));

// Initial render
svg.selectAll("circle")
  .data(data, d => d.id)
  .enter()
  .append("circle")
  .attr("cx", d => d.x)
  .attr("cy", d => d.y)
  .attr("r", 5)
  .attr("fill", "#aaa");

// Step 0: Random scatter (reset)
function step0() {
  svg.selectAll("circle")
    .transition()
    .duration(800)
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("fill", "#aaa");
  
  svg.selectAll("text").remove();
}

// Step 1: Color by sleep quality
function step1() {
  svg.selectAll("circle")
    .transition()
    .duration(800)
    .attr("fill", d => d.sleep === "good" ? "#69b3a2" : "#f28e2b");
}

// Step 2: Cluster by depression status
function step2() {
  svg.selectAll("circle")
    .transition()
    .duration(1000)
    .attr("cx", d => d.depressed ? 200 : 400)
    .attr("cy", d => d.depressed ? 150 + Math.random() * 80 : 250 + Math.random() * 80)
    .attr("fill", d => d.depressed ? "#e15759" : "#4e79a7");
}

// Step 3: Add annotation label
function step3() {
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .attr("opacity", 0)
    .text("Clustered by Depression Status")
    .transition()
    .duration(800)
    .attr("opacity", 1);
}

// Scroll triggers
scroller
  .setup({
    step: ".step",
    offset: 0.5,
    debug: false
  })
  .onStepEnter(response => {
    const i = response.index;

    if (i === 0) step0();
    if (i === 1) step1();
    if (i === 2) step2();
    if (i === 3) step3();
  });
