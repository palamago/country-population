d3.bargraph = function(containerId,width,dataRaw) {

  //Init vars
  var chart,
      bar_height = 1,
      height,
      x,
      y,
      lines,
      groups,
      left_width = 5,
      padding_top = 30,
      padding_bottom = 5,
      padding_left = 5,
      padding_right = 10,
      names,
      index,
      gap = 0,
      xAxis,
      data = dataRaw;
  
  function _init() {
    height = data.length*bar_height;
    index = d3.range(data.length);
    //index.sort(function(a, b) { return Math.round(data[b][16]) - Math.round(data[a][16]); });
    _setScales();
    _createChart();
    _createAxis();
    _createElements();
  };

  function _setScales(){
    //Scales
    x = d3.scale.linear()
       .domain([0, d3.max(data, function(d){return Math.round(d[17]);})])
       .range([0, width-left_width-padding_left-padding_right]);

    y = d3.scale.ordinal()
       .domain(index)
       .rangeBands([0, (bar_height + 2 * gap) * data.length]);
  }

  function _createChart(){
    //create svg
    chart = d3.select('#'+containerId)
      .append('svg')
      .attr('height', (bar_height + gap * 2) * data.length + gap * 2 + padding_top + padding_bottom) 
      .attr('width', width);

  }

  function _createAxis(){
    xAxis = d3.svg.axis()
      .scale(x)
      .orient('top')
      .tickSize(5)
      .tickPadding(5);

    chart.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate('+left_width+', '+(padding_top-5)+')')
        .call(xAxis);
  }

  function _createElements(){
    //create groups
    groups = chart.selectAll("g.line-group")
      .data(data)
      .enter()
      .append("g")
      .attr('class','line-group')
      .attr('id',function(d){
        return 'line-group-'+d[1];
      });

    //update position
    chart.selectAll("g.line-group")
    .transition()
    .duration(1000)
    .attr("transform", function(d, i) {
      //Cálculo de la variación
      var posX = 0;
      var posY = y(i)+padding_top+gap*2;
      return ("translate(" + posX + "," + posY + ")");
    });

    //create bars
    lines = groups.append("rect")
      .attr("width", function(d,i){
        var w = parseFloat(d[17]);
        if (w<parseFloat(20))
          return x(20);
        return x(w);
      })
      .attr('x',left_width)
      .attr("id", function(d){return "line-"+d[1]})
      .attr("height", bar_height)
      .attr("class", 'bar-line')
      .attr("fill", function(d) {
          return "#E1E1E1";
      });
    
    //add labels
   /* numbers = groups
      .append("text")
      .attr("class", "qty")
      .attr("x", function(d){
        return x(d[16])+left_width;
      })
      .attr("y", function(d){ return y.rangeBand()/2; } )
      .attr("dx", -5)
      .attr("dy", ".20em")
      .attr("text-anchor", "end")
      .text(function(d){return d[8];});*/

    //names
   /* names = groups
      .append("text")
      .attr("class", "name")
      .attr("x",0)
      .attr("y", function(d){ return y.rangeBand()/2; } )
      .attr("dx", left_width-10)
      .attr("dy", ".20em")
      .attr("text-anchor", "end")
      .text(function(d){return d[8];});*/

  }

  /* //update positions  
  lines
    .transition()
    .duration(1000)
    .attr("y", function(d,i){
        return y(i);
      } 
    );*/

    _init();

  return {
    sort: function(type){
      var  f;
      console.log(type);
      switch(type){
        case 'ASCENDENTE':
          f = function(a,b){
              if ( parseFloat(data[a][17]) < parseFloat(data[b][17]) ) return -1;
              if ( parseFloat(data[a][17]) > parseFloat(data[b][17]) ) return 1;
              return 0;
          };
        break;
        case 'DESCENDENTE':
          f = function(a,b){
              if ( parseFloat(data[a][17]) > parseFloat(data[a][17]) ) return -1;
              if ( parseFloat(data[a][17]) < parseFloat(data[a][17]) ) return 1;
              return 0;
          };
        break;
        case 'ALFABÉTICAMENTE':
          f = function(a,b) {
              if (data[a][8].toUpperCase().replace('Ñ','N') < data[b][8].toUpperCase().replace('Ñ','N')) return -1;
              if (data[a][8].toUpperCase().replace('Ñ','N') > data[b][8].toUpperCase().replace('Ñ','N')) return 1;
              return 0;
          };
        break;
      }

      index.sort(f);
      
      _setScales();
      _createElements();
    },
    update: function(areas){
      chart
        .selectAll('rect.bar-line')
        .attr('class',function (d){
          $(this)[0].classList.remove("selected");
          return $(this)[0].classList.toString();
        });

      chart
        .selectAll('rect.bar-line')
        .attr('class', function (d){
          if(areas.indexOf(d[1])>-1){
            $(this)[0].classList.add("selected");
          } else {
            $(this)[0].classList.remove("selected");
          }
          return $(this)[0].classList.toString();
        });
    }
  }

}
