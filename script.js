const scroller = scrollama();

scroller
  .setup({
    step: ".step",
    offset: 0.5,
    debug: true
  })
  .onStepEnter((response) => {
    console.log("Entered step", response.index);
    // You’ll add D3 animations here based on index
  });
