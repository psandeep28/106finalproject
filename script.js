// Initialize Scrollama
const scroller = scrollama();

// Select the SVG and draw one circle
const svg = d3.select("#chart");

svg.append("circle")
  .attr("cx", 300)
  .attr("cy", 200)
  .attr("r", 50)
  .attr("fill", "#69b3a2");

// Set up Scrollama + single onStepEnter handler
scroller
  .setup({
    step: ".step",
    offset: 0.5,
    debug: true
  })
  .onStepEnter((response) => {
    const index = response.index;
    console.log("Entered step", index);

    // Change color of the circle on scroll
    svg.select("circle")
      .transition()
      .duration(500)
      .attr("fill", 
        index === 0 ? "#69b3a2" :
        index === 1 ? "#f28e2b" :
        index === 2 ? "#e15759" :
                      "#76b7b2"
      );
  });
