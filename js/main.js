var CountryPopulation;

;(function(global, document, $, d3, ko){

    "use strict";

    CountryPopulation = global.countrypopulation = global.countrypopulation || {};

	CountryPopulation.$slider = $('#slider');

    CountryPopulation.sliderOptions = {
        min:0,
        max:100,
        step:1,
        orientation:'vertical',
        tooltip:'show',
        handle:'round',
        selection:'after',
        formater:function(v){
            return CountryPopulation.convertSliderValue(v)+'%';
        }
    }; 

    CountryPopulation.headers = [];

    CountryPopulation.data = [];

    CountryPopulation.map;

    CountryPopulation.bindings = {
        percentage:ko.observable(0),
        percentageTotal: 0,
        poblacionTotal:ko.observable(0),
        superficieTotal:ko.observable(0),
        cantSelected:ko.observable(0),
        supSelected:ko.observable(0),
        percentageSupSelected:0
    };

    CountryPopulation.convertSliderValue = function(v){
        return 100-v;
    }

    CountryPopulation.retrieveData = function(){
        d3.text("/data/lanacion-censo.csv", function(datasetText) {
          CountryPopulation.data = d3.csv.parseRows(datasetText);
          CountryPopulation.headers = CountryPopulation.data[0]; 
          CountryPopulation.data = CountryPopulation.data.slice(1,CountryPopulation.data.length);
          var total = 0;
          var superficie = 0;
          var filter = "Poblacion_Total_2010";
          var indexTotal = CountryPopulation.getHeaderIndex(filter);
          var indexSuperficie = CountryPopulation.getHeaderIndex('SUPERFICIE');
          CountryPopulation.data.forEach(function (e) {
            var n = parseInt(e[indexTotal]);
            if(!isNaN(n)){
              total = total + n;
            }
            var n = parseInt(e[indexSuperficie]);
            if(!isNaN(n)){
              superficie = superficie + (n/100000000000000000);
            }
          });
        CountryPopulation.bindings.poblacionTotal(total);
        CountryPopulation.bindings.superficieTotal(Math.round(superficie));
        });
    };

    CountryPopulation.init = function () {
    	//Init slider
        CountryPopulation.$slider
        .slider(CountryPopulation.sliderOptions)
        .on('slideStop',CountryPopulation.slideStopHandler);

        CountryPopulation.$slider.slider('setValue', CountryPopulation.convertSliderValue(0));

        //Init KO bindings
        CountryPopulation.bindings.percentageTotal = ko.computed(function() {
            return CountryPopulation.bindings.percentage() + "%";
        }, this);
        CountryPopulation.bindings.percentageSupSelected = ko.computed(function() {
            return ( (CountryPopulation.bindings.supSelected()*100) / CountryPopulation.bindings.superficieTotal() ).toFixed(3) + "%";
        }, this);
        ko.applyBindings(CountryPopulation.bindings);

        //Init map
        CountryPopulation.map = d3.populationMap('map-container',$('#map-container').width());

        //Parsing Data
        CountryPopulation.retrieveData();
    };

    CountryPopulation.slideStopHandler = function (data) {
        var percentage = CountryPopulation.convertSliderValue(data.value);
        CountryPopulation.bindings.percentage(percentage);
        CountryPopulation.calculatePopulation(percentage);
        CountryPopulation.orderData();
        CountryPopulation.filterData();
    };

    CountryPopulation.getHeaderIndex = function (element) {
        return (CountryPopulation.headers.indexOf(element)>-1)?CountryPopulation.headers.indexOf(element):false;
    };

    CountryPopulation.calculatePopulation = function (percentage) {
        var cant = Math.round((CountryPopulation.bindings.poblacionTotal()*percentage)/100);
        CountryPopulation.bindings.cantSelected(cant);
    };

    CountryPopulation.orderData = function () {
        var filter = "Poblacion_Total_2010";
        var index = CountryPopulation.getHeaderIndex(filter);
        var order = "ASC";

        if(order==="DESC"){
            CountryPopulation.data.sort(function(a,b){
                return a[index] - b[index];
            });
        }else if(order==="ASC"){
            CountryPopulation.data.sort(function(a,b){
                return b[index] - a[index];
            });
        }
    };

    CountryPopulation.filterData = function () {
        var filter = "Poblacion_Total_2010";
        var index = CountryPopulation.getHeaderIndex(filter);
        var indexId = CountryPopulation.getHeaderIndex('DNE_ID');
        var indexSuperficie = CountryPopulation.getHeaderIndex('SUPERFICIE');
        var max = CountryPopulation.bindings.cantSelected();
        var temp = 0;
        var ids = [];
        var names = [];
        var sup = 0;
        $.each(CountryPopulation.data,function(i,e){
            if(!isNaN(parseInt(e[index]))){
                temp += parseInt(e[index]);
                ids.push(e[indexId]);
                sup += parseInt((e[indexSuperficie]/100000000000000000));
                if( max < temp ){
                    return false;
                }
            }
        });
        CountryPopulation.bindings.supSelected(sup);
        CountryPopulation.updateMap(ids);
    };

    CountryPopulation.updateMap = function (localidadesIds) {
        CountryPopulation.map.update(localidadesIds);
    };

})(window, document,jQuery, d3, ko);

window.onload = function() {
    CountryPopulation.init(); 
}