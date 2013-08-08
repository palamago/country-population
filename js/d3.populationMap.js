d3.populationMap = function(containerId,width,data) {

  //Init vars
  var height=700,
    centered,
    projection,
    path,
    mapa_svg,
    mainGroup,
    departamentos,
    provincias,
    legend,
    gran_buenos_aires,
    gran_buenos_aires_mesh,
    svg,
    mini_svg,
    AMBA_IDS = ["D02003", "D02004", "D02011", "D02017", "D02035", "D02036", "D02132", "D02038", "D02051", "D02052", "D02134", "D02133", "D02129", "D02061", "D02063", "D02062", "D02070", "D02130", "D02075", "D02077", "D02079", "D02080", "D02089", "D02128", "D02092", "D02105", "D02106", "D02053", "D02109", "D02113", "D02118", "D02122", "CAPFED"],
    projection,
    mini_projection,
    amba,
    mini_path,
    mini_provincias,
    tooltip,
    extraInfo = d3.nest()
                .key(function(d) { return d[1]; })
                .map(data, d3.map),
    color_scale = d3.scale.quantile()
      .domain([0, d3.max(data, function(d){ return Math.round(d[17]);})])
      .range(d3.range(9)),
    color = d3.scale.category20(),
    pad = d3.format("0ed");

  function _init() {
    _createMap();
    _createTooltip();
    _createPath();
  };

  function _createTooltip() {
    //Crea el tooltip            
    tooltip = d3.select("body").append("div")   
                .attr("id", "tooltip")               
                .style("opacity", 0);

    svg.on("mousemove", mousemove);
    mini_svg.on("mousemove", mousemove);

    function mousemove() {
      tooltip.style("left", (d3.event.pageX + 20) + "px").style("top", (d3.event.pageY - 30) + "px");
    }
  }

  function _createMap() {

    svg = d3.select('#'+containerId).append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "poblacion");

    mini_svg = d3.select('#'+containerId).append("svg")
      .attr("width", 200)
      .attr("height", 200)
      .attr("class", "poblacion-mini");

  };

  function _getName(e) {
    return e.replace(/\s+/g, "-").toLowerCase()
  };

  function _createPath() {
    var scale = d3.geo.mercator().scale(900).center([-65, -35]).translate([width / 2 - 30, height / 2 - 125]);
    projection = scale;
    path = d3.geo.path().projection(scale);

    var mini_scale = d3.geo.mercator().scale(6600).center([-57.5, -35.6]).translate([width / 2 - 30, height / 2 - 125]);
    mini_projection = mini_scale;
    mini_path = d3.geo.path().projection(mini_scale);

    d3.json(window.location.pathname+"data/argentina.json", function(error, e) {

        //mini mapa
        mini_mapa_svg = mini_svg.append("g").classed("mini-mapa Blues", !0);

        //mapa
        mapa_svg = svg.append("g").classed("mapa Blues", !0).attr("transform", "translate(0, 20)");
        
        departamentos = mapa_svg.append("g").attr("class", "departamentos");
        provincias = mapa_svg.append("g").attr("class", "provincias");
        
        var featuresProvincias = topojson.feature(e, e.objects.provincias).features,
            featuresDepartamentos = topojson.feature(e, e.objects.departamentos).features;
        
        provincias.selectAll("path")
          .data(featuresProvincias)
          .enter()
          .append("path")
          .attr("id", function (e) {
              return _getName(e.properties.PROVINCIA)
          })
          .attr("d", path)
          .attr("class", "provincia");
  

        gran_buenos_aires = departamentos.append("g")
          .attr("class", "gran-buenos-aires");

        gran_buenos_aires_mesh = topojson.mesh(e, {
            type: "GeometryCollection",
            geometries: e.objects.departamentos.geometries.filter(function (e) {
                return AMBA_IDS.indexOf(e.id) !== -1
            })
        });

        featuresProvincias.forEach(function (e) {
            var r = _getName(e.properties.PROVINCIA);
            departamentos.append("g")
            .attr("id", "provincia-" + r)
              .selectAll("path")
              .data(featuresDepartamentos.filter(function (e) {
                return r === _getName(e.properties.p_id) && AMBA_IDS.indexOf(e.id) == -1;
              }))
              .enter()
              .append("path")
              .attr("id", function (e) {
                  return e.id;
              })
              .attr("d", path)
              .attr("class", "departamento")
        });

        departamentos.select("g#provincia-buenos-aires")
          .append("g")
          .attr("id", "gran-buenos-aires")
          .selectAll("path")
          .data(featuresDepartamentos.filter(function (e) {
              return AMBA_IDS.indexOf(e.id) !== -1
          }))
          .enter()
          .append("path")
          .attr("id", function (e) {
              return e.id
          })
          .attr("d", path)
          .attr("class", "departamento")

        mapa_svg.append("circle")
          .attr("class", "parte-ampliada")
          .attr("r",15)
          .attr("cx",312)
          .attr("cy",218);

        //mini mapa
        mini_mapa_svg.append("rect")
          .attr("class", "mini-mapa-bg")
          .attr("width",200)
          .attr("height",200);

        mini_provincias = mini_mapa_svg.append("g").attr("class", "mini-provincias");

        mini_provincias.selectAll("path")
          .data(featuresProvincias)
          .enter()
          .append("path")
          .attr("id", function (e) {
              return _getName(e.properties.PROVINCIA)
          })
          .attr("d", mini_path)
          .attr("class", "provincia");

        amba = mini_mapa_svg.append("g").attr("class", "amba");

        amba.selectAll("path")
          .data(featuresDepartamentos.filter(function (e) {
              return AMBA_IDS.indexOf(e.id) !== -1
          }))
          .enter()
          .append("path")
          .attr("id", function (e) {
              return e.id
          })
          .attr("d", mini_path)
          .attr("class", "departamento")

        //Tooltip
        var m = mapa_svg.selectAll("path.departamento");
        var mm = mini_mapa_svg.selectAll("path.departamento");

        function addTooltipListener(s) {
          s.on("mouseover", function(d) {
              var ha = extraInfo.get(d.id)[0][19],
                  dp = extraInfo.get(d.id)[0][17];

              var innerHTML = d.properties.a + '<br/><strong>' + d.properties.p + '</strong>' + '<br/>' + dotSeparateNumber(ha) + ' habitantes' + '<br/> Densidad: ' + dp.replace('.',',') + '';        
              tooltip.transition()        
                     .duration(100)      
                     .style("opacity", .9)

              tooltip.html(innerHTML);
              $(this)[0].classList.add("hover");
          })
          .on("mouseout", function(d) {
              $(this)[0].classList.remove("hover");
              tooltip.transition()        
                      .duration(200)      
                      .style("opacity", 0);   
          });
        };



        function dotSeparateNumber(val){
            while (/(\d+)(\d{3})/.test(val.toString())){
              val = val.toString().replace(/(\d+)(\d{3})/, '$1'+'.'+'$2');
            }
            return val;
        }


        addTooltipListener(m);

        addTooltipListener(mm);

    });

  };

  _init();

  return {
    
    update: function(areas){
      
      departamentos
        .selectAll('path')
        .attr('class',function (d){
          $(this)[0].classList.remove("selected");
          return $(this)[0].classList.toString();
        });

      departamentos
        .selectAll('path')
        .attr('class', function (d){
          if(areas.indexOf(d.id)>-1){
            $(this)[0].classList.add("selected");
          } else {
            $(this)[0].classList.remove("selected");
          }
          return $(this)[0].classList.toString();
        });

      amba
        .selectAll('path')
        .attr('class',function (d){
          $(this)[0].classList.remove("selected");
          return $(this)[0].classList.toString();
        });

      amba
        .selectAll('path')
        .attr('class', function (d){
          if(areas.indexOf(d.id)>-1){
            $(this)[0].classList.add("selected");
          } else {
            $(this)[0].classList.remove("selected");
          }
          return $(this)[0].classList.toString();
        });

    }

  }

}
