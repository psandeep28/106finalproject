// Initialize scrollama
const scroller = scrollama();

// Draw a basic circle in the SVG
const svg = d3.select("#chart");
svg.append("circle")
  .attr("cx", 300)
  .attr("cy", 200)
  .attr("r", 50)
  .attr("fill", "#69b3a2");

// Scrollama event setup
scroller
  .setup({
    step: ".step",
    offset: 0.5,
    debug: false
  })
  .onStepEnter(response => {
    const index = response.index;

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
