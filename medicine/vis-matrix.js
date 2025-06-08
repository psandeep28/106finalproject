/* ----- constants & helpers ---------------------------------- */
const medicineDegrees = new Set(['B.Pharm','M.Pharm','BSc','MSc']);
const sleepToHrs = s => {
  s = String(s).toLowerCase();
  if (s.includes('less')) return 4.5;
  if (s.includes('5-6'))  return 5.5;
  if (s.includes('7-8'))  return 7.5;
  if (s.includes('more')) return 8.5;
  return 6;
};

/* ----- SVG setup -------------------------------------------- */
const svg  = d3.select('#matrix-plot'),
      W    = +svg.attr('width'),
      H    = +svg.attr('height'),
      M    = {left:140,right:40,top:140,bottom:80},
      PW   = W - M.left - M.right,
      PH   = H - M.top  - M.bottom,
      g    = svg.append('g').attr('transform',`translate(${M.left},${M.top})`),
      tip  = d3.select('#matrix-tooltip');

/* ----- scales ------------------------------------------------ */
const colour = d3.scaleLinear()
  .domain([0,.5,1])
  .range(['#36e4fd','#ffe987','#ff6f96']);

const size = d3.scaleLinear().domain([2,10]).range([12,34]);

/* ----- legends (top margin) --------------------------------- */
buildLegends();
function buildLegends(){
  const Lx = W * .15,
        Ly = M.top - 80,
        Lg = svg.append('g').attr('transform',`translate(${Lx},${Ly})`);

  /* colour bar */
  const defs = svg.append('defs'),
        grad = defs.append('linearGradient').attr('id','gradDep');
  grad.append('stop').attr('offset','0%').attr('stop-color',colour(0));
  grad.append('stop').attr('offset','50%').attr('stop-color',colour(.5));
  grad.append('stop').attr('offset','100%').attr('stop-color',colour(1));

  Lg.append('text').attr('y',0).text('% Depressed')
    .style('fill','#8ceefd').style('font-size','17px');

  Lg.append('rect').attr('y',12).attr('width',140).attr('height',16)
    .attr('fill','url(#gradDep)');

  Lg.append('text').attr('y',44).text('0%')
    .style('fill','#eaf9ff').style('font-size','13px');
  Lg.append('text').attr('x',130).attr('y',44).text('100%')
    .style('fill','#eaf9ff').style('font-size','13px');

  /* simple size note */
  Lg.append('text')
    .attr('x',180).attr('y',28)
    .text('Dot size ∝ study satisfaction')
    .style('fill','#eaf9ff').style('font-size','15px');
}

/* ----- data load -------------------------------------------- */
d3.csv('data/student_depression_dataset.csv').then(raw=>{
  const data = raw
    .filter(d=>medicineDegrees.has(String(d.Degree).replace(/\s+/g,'')))
    .map(d=>({
      pressure:+d['Academic Pressure']||0,
      sleep:   sleepToHrs(d['Sleep Duration']),
      satisf:  +d['Study Satisfaction']||0,
      depressed:+d.Depression===1,
      gender:(d.Gender||'').trim(),
      degree:(d.Degree||'').trim()
    }));

  /* degree dropdown */
  d3.select('#degree-select')
    .selectAll('option')
    .data(['All',...new Set(data.map(d=>d.degree)).values()])
    .join('option')
      .attr('value',d=>d)
      .text(d=>d);

  /* axes */
  const x = d3.scaleLinear().domain([1,5]).range([0,PW]);
  const y = d3.scalePoint()
    .domain([4.5,5.5,7.5,8.5]).range([PH,0]).padding(.38);

  g.append('g')
    .call(d3.axisLeft(y).tickFormat(d=>d+' hrs'))
    .selectAll('text').style('fill','#baf6fa').style('font-size','19px');

  g.append('g')
    .attr('transform',`translate(0,${PH})`)
    .call(d3.axisBottom(x).tickValues([1,2,3,4,5]))
    .selectAll('text').style('fill','#baf6fa').style('font-size','20px');

  g.append('text')
    .attr('x',PW/2).attr('y',PH+46).attr('text-anchor','middle')
    .style('fill','#82e2fd').style('font-size','25px')
    .text('Academic Pressure (1–5)');

  g.append('text')
    .attr('x',-100).attr('y',PH/2)
    .attr('transform','rotate(-90,-100,'+PH/2+')')
    .attr('text-anchor','middle')
    .style('fill','#82e2fd').style('font-size','25px')
    .text('Sleep Duration');

  /* ------- update (filters & plot) -------------------------- */
  function update(){
    const deg   = d3.select('#degree-select').property('value'),
          showF = d3.select('#show-females').property('checked'),
          showM = d3.select('#show-males').property('checked');

    const filt = data.filter(d=>
      (deg==='All'||d.degree===deg) &&
      ((d.gender==='Female'&&showF)||(d.gender==='Male'&&showM))
    );

    /* aggregate by (pressure, sleep) */
    const byCell = d3.groups(filt, d=>d.pressure, d=>d.sleep),
          cells  = [];
    byCell.forEach(([p,rowsBySleep])=>{
      rowsBySleep.forEach(([s,arr])=>{
        if(arr.length<4) return;
        cells.push({
          pressure:+p,
          sleep:+s,
          count:arr.length,
          avgSat:d3.mean(arr,d=>d.satisf),
          pctDep:arr.filter(d=>d.depressed).length/arr.length
        });
      });
    });

    /* join dots */
    const dot = g.selectAll('.agg-dot')
      .data(cells,d=>`${d.pressure}-${d.sleep}`);
    dot.exit().remove();

    dot.enter().append('circle')
        .attr('class','agg-dot')
        .attr('stroke','#fff').attr('stroke-width',1.4)
        .attr('opacity',.9)
      .merge(dot)
        .on('mouseover',(ev,d)=>{
          d3.select(ev.currentTarget)
            .attr('stroke','#18e9ff').attr('stroke-width',2.4);

          tip.style('opacity',1)
             .html(`
               <b>Pressure:</b> ${d.pressure}<br>
               <b>Sleep:</b> ${d.sleep} hrs<br>
               <b>Count:</b> ${d.count}<br>
               <b>Satisfaction:</b> ${d.avgSat.toFixed(1)}<br>
               <b>% Depressed:</b> ${(d.pctDep*100).toFixed(1)}%
             `)
             .style('left',(ev.clientX+10)+'px')
             .style('top', (ev.clientY+10)+'px');
        })
        .on('mousemove',ev=>{
          tip.style('left',(ev.clientX+10)+'px')
             .style('top', (ev.clientY+10)+'px');
        })
        .on('mouseout',ev=>{
          d3.select(ev.currentTarget)
            .attr('stroke','#fff').attr('stroke-width',1.4);
          tip.style('opacity',0);
        })
        .transition().duration(350)
          .attr('cx',d=>x(d.pressure))
          .attr('cy',d=>y(d.sleep))
          .attr('r', d=>size(d.avgSat))
          .attr('fill',d=>colour(d.pctDep));
  }

  /* controls */
  d3.select('#degree-select').on('change',update);
  d3.select('#show-females').on('change',update);
  d3.select('#show-males').on('change',update);
  update();
});
