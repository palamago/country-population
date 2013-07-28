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

    CountryPopulation.bindings = {
        percentage:ko.observable(0),
        percentageTotal: 0,
        poblacionTotal:ko.observable(0),
        cantSelected:ko.observable(0)
    };

    CountryPopulation.convertSliderValue = function(v){
        return 100-v;
    }

    //Remove this, just to test
    CountryPopulation.retrieveData = function(){
        d3.text("/data/lanacion-censo.csv", function(datasetText) {
          CountryPopulation.data = d3.csv.parseRows(datasetText);
          CountryPopulation.headers = CountryPopulation.data[0]; 
          CountryPopulation.data = CountryPopulation.data.slice(1,CountryPopulation.data.length);
          var total = 0;
          CountryPopulation.data.forEach(function (e) {
            var n = parseInt(e[19]);
            if(!isNaN(n)){
              total = total + n;
            }
          });
        CountryPopulation.bindings.poblacionTotal(total);
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
        ko.applyBindings(CountryPopulation.bindings);

        //Init map
        d3.populationMap('map-container',$('#map-container').width());

        //Parsing Data
        CountryPopulation.retrieveData();
    };

    CountryPopulation.slideStopHandler = function (data) {
        var percentage = CountryPopulation.convertSliderValue(data.value);
        CountryPopulation.bindings.percentage(percentage);
        CountryPopulation.calculatePopulation(percentage);
    };

    CountryPopulation.getHeaderIndex = function (element) {
        return (CountryPopulation.headers.indexOf(element)>-1)?CountryPopulation.headers.indexOf(element):false;
    };

    CountryPopulation.calculatePopulation = function (percentage) {
        var cant = Math.round((CountryPopulation.bindings.poblacionTotal()*percentage)/100);
        CountryPopulation.bindings.cantSelected(cant);
        console.log(cant);
    };

})(window, document,jQuery, d3, ko);

window.onload = function() {
    CountryPopulation.init(); 
}