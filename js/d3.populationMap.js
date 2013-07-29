d3.populationMap = function(containerId,width) {

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
    AMBA_IDS = ["D02003", "D02004", "D02011", "D02017", "D02035", "D02036", "D02132", "D02038", "D02051", "D02052", "D02134", "D02133", "D02129", "D02061", "D02063", "D02062", "D02070", "D02130", "D02075", "D02077", "D02079", "D02080", "D02089", "D02128", "D02092", "D02105", "D02106", "D02053", "D02109", "D02113", "D02118", "D02122", "CAPFED"],
    projection;
  
  function _init() {
    _createMap();
    _createPath();
  };

  function _createMap() {

    projection = d3.geo.albersUsa()
      .scale(1070)
      .translate([width / 2, height / 2]);

    svg = d3.select('#'+containerId).append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "Poblacion");

  };

  function _getName(e) {
    return e.replace(/\s+/g, "-").toLowerCase()
  };

  function _createPath() {
    var scale = d3.geo.mercator().scale(900).center([-65, -35]).translate([width / 2 - 30, height / 2 - 125]);
    projection = scale;
    path = d3.geo.path().projection(scale);

    d3.json("data/argentina.json", function(error, e) {

        mapa_svg = svg.append("g").classed("mapa", !0).attr("transform", "translate(0, 20)");

        departamentos = mapa_svg.append("g").attr("class", "departamentos");
        provincias = mapa_svg.append("g").attr("class", "provincias");
        legend = svg.append("g").attr("class", "legend");
        
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
          .attr("class", "departamento");

    });

  };

  _init();

  return {
    
    update: function(areas){
      
      departamentos
        .selectAll('path')
        .attr('class','departamento');

      departamentos
        .selectAll('path')
        .attr('class', function (d){
          if(areas.indexOf(d.id)>-1){
            return 'departamento selected'; 
          } else {
            return 'departamento';
          }
        });

    }

  }

}
