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

    CountryPopulation.bindings = {
        percentage:ko.observable(0),
        percentageTotal: 0,
        poblacionTotal:ko.observable(0)
    };

    CountryPopulation.convertSliderValue = function(v){
        return 100-v;
    }

    //Remove this, just to test
    CountryPopulation._sumarize = function(){
        d3.text("/data/lanacion-censo.csv", function(datasetText) {
          var parsedCSV = d3.csv.parseRows(datasetText);
          var total = 0;
          parsedCSV.forEach(function (e) {
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

        //Testing Data
        CountryPopulation._sumarize();
    };

    CountryPopulation.slideStopHandler = function (data) {
        CountryPopulation.bindings.percentage(CountryPopulation.convertSliderValue(data.value));
    };

})(window, document,jQuery, d3, ko);

window.onload = function() {
    CountryPopulation.init(); 
}