/*  arts-radial.js  •  circular heat-ring for Arts students (legend-v2)  */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- helpers & constants ------------------------- */
  const ARTS = new Set(['BA','MA','LLB','PhD','BVoc']);

  const sleepBucket = s => {
    s = String(s).toLowerCase();
    if (s.includes('less'))  return '<5 h';
    if (s.includes('5-6'))   return '5-6 h';
    if (s.includes('7-8'))   return '7-8 h';
    if (s.includes('more'))  return '8+ h';
    return 'unknown';
  };

  const sleepOrder = ['<5 h','5-6 h','7-8 h','8+ h'];        // inner → outer

  /* ---------- SVG & scales -------------------------------- */
  const svg = d3.select('#radial'),
        W   = +svg.attr('width'),
        H   = +svg.attr('height'),
        R   = Math.min(W,H)/2 - 40,
        g   = svg.append('g').attr('transform',`translate(${W/2},${H/2})`);

  const tip = d3.select('#tooltip');

  const colour = d3.scaleLinear()
    .domain([0,.5,1])
    .range(['#36e4fd','#ffe987','#ff6f96']);

  const thick = d3.scaleSqrt().range([12,48]);

  const ringR = sleepOrder.map((_,i)=> [i*60, i*60+55]);     // radii per ring

  /* ---------- data load ----------------------------------- */
  d3.csv('data/student_depression_dataset.csv').then(rows => {

    rows.forEach(d=>{
      d.isArts  = ARTS.has(String(d.Degree).replace(/\s+/g,''));
      d.sleep   = sleepBucket(d['Sleep Duration']);
      d.press   = +d['Academic Pressure']||0;
      d.dep     = +d.Depression===1;
      d.gender  = (d.Gender||'').trim();
    });

    /* ---------- draw / update ----------------------------- */
    function draw(){
      const showF = d3.select('#fem').property('checked'),
            showM = d3.select('#male').property('checked'),
            showT = d3.select('#small').property('checked');

      const arts = rows.filter(d =>
        d.isArts && ((d.gender==='Female'&&showF)||(d.gender==='Male'&&showM))
      );

      let cells = d3.rollups(
        arts,
        v => ({n:v.length, p:d3.mean(v,x=>x.dep)}),
        d=>d.sleep,
        d=>d.press
      ).flatMap(([sleep,a]) => a.map(([pr,val])=>({sleep,press:+pr,...val})));

      if(!showT) cells = cells.filter(d=>d.n>=4);
      thick.domain(d3.extent(cells,d=>d.n));

      /* arc generator */
      const arc = d3.arc()
        .startAngle(d=> (d.press-1)*2*Math.PI/5 )
        .endAngle  (d=>  d.press   *2*Math.PI/5 )
        .innerRadius(d=> ringR[sleepOrder.indexOf(d.sleep)][0])
        .outerRadius(d=> ringR[sleepOrder.indexOf(d.sleep)][0] + thick(d.n));

      /* JOIN */
      const seg = g.selectAll('.cell').data(cells,d=>`${d.sleep}-${d.press}`);
      seg.exit().remove();

      seg.enter().append('path')
          .attr('class','cell')
          .attr('stroke','#111').attr('stroke-width',1)
          .attr('opacity',.9)
        .merge(seg)
          .on('mouseover',(ev,d)=>{
            d3.select(ev.currentTarget).attr('stroke','#18e9ff').attr('stroke-width',2);
            tip.style('opacity',1)
               .html(`<b>Sleep:</b> ${d.sleep}<br>
                      <b>Pressure:</b> ${d.press}<br>
                      <b>Students:</b> ${d.n}<br>
                      <b>% Depressed:</b> ${(d.p*100).toFixed(1)}%`)
               .style('left',(ev.clientX+10)+'px')
               .style('top', (ev.clientY+10)+'px');
          })
          .on('mousemove',ev=>{
            tip.style('left',(ev.clientX+10)+'px')
               .style('top', (ev.clientY+10)+'px');
          })
          .on('mouseout',ev=>{
            d3.select(ev.currentTarget).attr('stroke','#111').attr('stroke-width',1);
            tip.style('opacity',0);
          })
          .transition().duration(400)
            .attr('d',arc)
            .attr('fill',d=>colour(d.p));

      /* ----------- large legends (built once) -------------- */
      buildLegends();          // only adds if not present
      redrawLabels();          // sleep ring labels + radial guides
    }

    /* ---------------- legend builders --------------------- */
    function buildLegends(){
      /* A) enlarged sleep-ring mini-legend */
      if(svg.select('#legend-sleep').empty()){
        const LG = svg.append('g')
                      .attr('id','legend-sleep')
                      .attr('transform','translate(110,110)');
        const miniR = [14,24,34,44];
        LG.selectAll('circle')
          .data(miniR)
          .enter().append('circle')
            .attr('r',d=>d)
            .attr('fill','none')
            .attr('stroke','#465057')
            .attr('stroke-width',1.4);
        LG.selectAll('text')
          .data(sleepOrder)
          .enter().append('text')
            .attr('y',(d,i)=>-miniR[i]-4)
            .attr('text-anchor','middle')
            .text(d=>d)
            .style('fill','#e7fafd').style('font-size','12px');
        LG.append('text')
          .attr('x',0).attr('y',62)
          .text('ring = sleep')
          .style('fill','#8ceefd').style('font-size','15px');
      }

      /* B) enlarged pressure “clock” legend */
      if(svg.select('#legend-pressure').empty()){
        const PG = svg.append('g')
                      .attr('id','legend-pressure')
                      .attr('transform','translate('+(W-150)+',110)');
        PG.append('circle')
          .attr('r',40)
          .attr('fill','none')
          .attr('stroke','#2a2f34');
        for(let p=1;p<=5;p++){
          const ang = (p-1)*2*Math.PI/5 - Math.PI/2;
          PG.append('text')
            .attr('x',Math.cos(ang)*46)
            .attr('y',Math.sin(ang)*46)
            .attr('text-anchor','middle')
            .attr('dy','.35em')
            .text(p)
            .style('fill','#e7fafd')
            .style('font-size','14px');
        }
        PG.append('text')
          .attr('x',0).attr('y',60)
          .text('pressure 1-5')
          .attr('text-anchor','middle')
          .style('fill','#8ceefd').style('font-size','15px');
      }
    }

    /* -------- redraw labels & radial guides --------------- */
    function redrawLabels(){
      g.selectAll('.slabel').remove();
      g.selectAll('.slabel')
        .data(sleepOrder)
        .enter().append('text')
          .attr('class','slabel')
          .attr('y',(d,i)=> (ringR[i][0]+ringR[i][1])/2 )
          .attr('dy','.35em')
          .attr('text-anchor','middle')
          .text(d=>d)
          .style('fill','#111')        // *** black hour labels ***
          .style('font-size','15px');

      g.selectAll('.tickline').remove();
      for(let p=1;p<=5;p++){
        const ang = (p-1)*2*Math.PI/5;
        g.append('line')
          .attr('class','tickline')
          .attr('x1',0).attr('y1',0)
          .attr('x2',Math.cos(ang)*(ringR[3][1]+12))
          .attr('y2',Math.sin(ang)*(ringR[3][1]+12))
          .attr('stroke','#2a2f34');
      }
    }

    /* listeners & first render */
    d3.selectAll('#fem,#male,#small').on('change',draw);
    draw();
  });
});
