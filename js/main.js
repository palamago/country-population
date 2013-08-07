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

    CountryPopulation.$twitterButton = $('.twitter');

    CountryPopulation.$facebookButton = $('.facebook');

    CountryPopulation.$googleButton = $('.gplus');

    CountryPopulation.$text = $('.texto-resumen');

    CountryPopulation.$orderSelectors = $('.filter-order')

    CountryPopulation.$fullScreenBtn = $('#full-screen-btn');

    CountryPopulation.$upBtn = $('#arrow-up');

    CountryPopulation.$downBtn = $('#arrow-down');

    CountryPopulation.$popover;

    CountryPopulation.bindings = {
        percentage:ko.observable(0),
        percentageTotal: 0,
        poblacionTotal:ko.observable(0),
        superficieTotal:ko.observable(0),
        cantSelected:ko.observable(0),
        supSelected:ko.observable(0),
        percentageSupSelected:0,
        superficieTotalStr:0,
        poblacionTotalStr:0,
        availableFilters:ko.observable(),
        selectedFilter:ko.observable(),
        selectedOrder:ko.observable('DESCENDENTE'),
        densidadSelected:0
    };

    var FilterOption = function(name, id, icon) {
        this.name = name;
        this.id = id;
        this.icon = icon;
    };

    CountryPopulation.init = function () {
        //Init slider
        CountryPopulation.$slider
        .slider(CountryPopulation.sliderOptions)
        .on('slide',CountryPopulation.slideStopHandler);

        CountryPopulation.$slider.slider('setValue', CountryPopulation.convertSliderValue(0));

        //Init KO bindings
        CountryPopulation.bindings.percentageTotal = ko.computed(function() {
            if(isNaN(CountryPopulation.bindings.cantSelected()))
                return 0+"%";
            return CountryPopulation.bindings.percentage() + "%";
        }, this);
        CountryPopulation.bindings.percentageSupSelected = ko.computed(function() {
            var r = (CountryPopulation.bindings.supSelected()*100) / CountryPopulation.bindings.superficieTotal();
            if(r>99.99999)
                return 100+"%"
            if(!r || r===0)
                return 0+"%";
            return ( r ).toFixed(3).replace('.',',') + "%";
        }, this);
        CountryPopulation.bindings.superficieTotalStr = ko.computed(function() {
            return CountryPopulation.dotSeparateNumber(CountryPopulation.bindings.superficieTotal());
        }, this);
        CountryPopulation.bindings.poblacionTotalStr = ko.computed(function() {
            return CountryPopulation.dotSeparateNumber(CountryPopulation.bindings.poblacionTotal());
        }, this);
        CountryPopulation.bindings.cantSelectedStr = ko.computed(function() {
            if(isNaN(CountryPopulation.bindings.cantSelected()))
                return 0;
            return CountryPopulation.dotSeparateNumber(CountryPopulation.bindings.cantSelected());
        }, this);
        CountryPopulation.bindings.supSelectedStr = ko.computed(function() {
            return CountryPopulation.dotSeparateNumber(Math.round(CountryPopulation.bindings.supSelected()));
        }, this);
        CountryPopulation.bindings.densidadSelected = ko.computed(function() {
            if(CountryPopulation.bindings.supSelected()===0)
                return 0;
            var r = (CountryPopulation.bindings.cantSelected() / CountryPopulation.bindings.supSelected());
            return CountryPopulation.dotSeparateNumber(Math.round( r ));
        }, this);
        ko.applyBindings(CountryPopulation.bindings);

        //Parsing Data
        CountryPopulation.retrieveData();

        //Init button
        CountryPopulation.$twitterButton.on('click',CountryPopulation.shareTwitter);
        CountryPopulation.$facebookButton.on('click',CountryPopulation.shareFacebook);
        CountryPopulation.$googleButton.on('click',CountryPopulation.shareGoogle);
        CountryPopulation.$fullScreenBtn.on('click',CountryPopulation.fullScreen);

        CountryPopulation.$upBtn.on('click',function(){CountryPopulation.moveSlider(-1);});
        CountryPopulation.$downBtn.on('click',function(){CountryPopulation.moveSlider(1);});
        $('.slider-handle.primero').on('mousedown',function(){$('.popover').fadeOut();});

        //Open popover
        CountryPopulation.$popover = $('.slider-handle.primero').popover({
            animation:true,
            html:true,
            trigger:'manual',
            content:'<p>Deslice el control verticalmente para ver cambios en el mapa.</p>',
            title:'AYUDA'
        })
        .popover('show');

    };

    //Revisar

    CountryPopulation.moveSlider = function(oper) {
        $('.popover').fadeOut();
        var newValue = parseInt(CountryPopulation.$slider.slider('getValue'));
        if(newValue != 100 && newValue != 0 ){
            CountryPopulation.$slider.slider('setValue', newValue+oper);
            CountryPopulation.$slider
            .trigger({
                type: 'slide',
                value: parseInt(newValue+oper)
            });
        }

    };

    CountryPopulation.fullScreen = function() {
        var el = document.documentElement
        , rfs =
                el.requestFullScreen
                || el.webkitRequestFullScreen
                || el.mozRequestFullScreen
        ;
        rfs.call(el);
    };

    CountryPopulation.getLocation = function(href) {
        var l = document.createElement("a");
        l.href = href;
        return l;
    };

    CountryPopulation.convertSliderValue = function(v){
        return 100-v;
    }

    CountryPopulation.retrieveData = function(){
        d3.text(window.location.pathname+"data/lanacion-censo.csv", function(datasetText) {
          CountryPopulation.data = d3.csv.parseRows(datasetText);
          CountryPopulation.headers = CountryPopulation.data[0];
          CountryPopulation.addFilterOptions();
          CountryPopulation.data = CountryPopulation.data.slice(1,CountryPopulation.data.length);
          var total = 0,
            superficie = 0,
            filter = "Poblacion_Total_2010",
            indexTotal = CountryPopulation.getHeaderIndex(filter),
            indexSuperficie = CountryPopulation.getHeaderIndex('SUPERFICIE');
          
          CountryPopulation.data.forEach(function (e) {
            var n = parseInt(e[indexTotal]);
            if(!isNaN(n)){
              total = total + n;
            }
            var n = parseInt(e[indexSuperficie]);
            if(!isNaN(n)){
              superficie = superficie + n;
            }
          });
        CountryPopulation.bindings.poblacionTotal(total);
        CountryPopulation.bindings.superficieTotal(Math.round(superficie/100000000000000000));

        //Init map
        CountryPopulation.map = d3.populationMap('map-container',$('#map-container').width(),CountryPopulation.data);


        });

    };

    CountryPopulation.addFilterOptions = function(){
        CountryPopulation.$orderSelectors.on('click',CountryPopulation.orderChanged);
    };

    CountryPopulation.shareTwitter = function(e){
        e.preventDefault();
        var qObj = {
            'text': CountryPopulation.$text.text(),
            'related': 'palamago,lndata',
            'hashtags': 'argentina,censo,paisFederal'
        };

        var qs = $.param(qObj);

        var width  = 575,
            height = 400,
            left   = ($(window).width()  - width)  / 2,
            top    = ($(window).height() - height) / 2,
            url    = this.href+"?"+qs,
            opts   = 'status=1' +
                     ',width='  + width  +
                     ',height=' + height +
                     ',top='    + top    +
                     ',left='   + left;
        
        window.open(url, 'Twitter', opts);
     
        return false;
    }

    CountryPopulation.shareFacebook = function(e){
        e.preventDefault();
        var qs = 
            '&p[url]='+window.location+
            '&p[title]='+'Argentina, un país POCO federal...'+
            '&p[images][0]='+window.location+'img/share.png'+
            '&p[summary]='+CountryPopulation.$text.text();

        var width  = 575,
            height = 400,
            left   = ($(window).width()  - width)  / 2,
            top    = ($(window).height() - height) / 2,
            url    = this.href+qs,
            opts   = 'status=1' +
                     ',width='  + width  +
                     ',height=' + height +
                     ',top='    + top    +
                     ',left='   + left;
        
        window.open(url, 'Facebook', opts);
     
        return false;
    }

    CountryPopulation.shareGoogle = function(e){
        e.preventDefault();
        var qs = 
            'url='+ window.location;

        var width  = 575,
            height = 400,
            left   = ($(window).width()  - width)  / 2,
            top    = ($(window).height() - height) / 2,
            url    = this.href+"?"+qs,
            opts   = 'status=1' +
                     ',width='  + width  +
                     ',height=' + height +
                     ',top='    + top    +
                     ',left='   + left;
        
        window.open(url, 'Google+', opts);
     
        return false;
    }

    CountryPopulation.orderChanged = function (e) {
        var s = $(this);
        if(s.hasClass('disabled'))
            return;
        CountryPopulation.$orderSelectors.removeClass('disabled btn-inverse').addClass('btn-default');
        s.addClass('btn-inverse disabled').removeClass('btn-default');

        CountryPopulation.bindings.selectedOrder(s.text());

        CountryPopulation.$slider
                .trigger({
                    type: 'slide',
                    value: parseInt(CountryPopulation.$slider.val())
                });
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
        var filter =  'Poblacion_Densidad_2010',
            index = CountryPopulation.getHeaderIndex(filter),
            order = CountryPopulation.bindings.selectedOrder().toUpperCase().trim(),
            f;
       
        var test = parseFloat(CountryPopulation.data[0][index]);

        if(!isNaN(test)) {
            if(order==="DESCENDENTE"){
                f = function(a,b){
                    return parseFloat(b[index]) - parseFloat(a[index]);
                };
            }else if(order==="ASCENDENTE"){
                f = function(a,b){
                    return parseFloat(a[index]) - parseFloat(b[index]);
                };
            }
        } else {
            if(order==="DESCENDENTE"){
                f = function(a,b) {
                    if (a[index] < b[index]) return -1;
                    if (a[index] > b[index]) return 1;
                    return 0;
                };
            }else if(order==="ASCENDENTE"){
                f = function(a,b) {
                    if (b[index] < a[index]) return -1;
                    if (b[index] > a[index]) return 1;
                    return 0;
                };
            }
        }


        CountryPopulation.data.sort(f);
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
        if(max>0){
            $.each(CountryPopulation.data,function(i,e){
                if(!isNaN(parseInt(e[index]))){
                    temp += parseInt(e[index]);
                    ids.push(e[indexId]);
                    sup += parseInt(e[indexSuperficie]);
                    if( max <= temp ){
                        return false;
                    }
                }
            });
        }
        CountryPopulation.bindings.supSelected(sup/100000000000000000);
        CountryPopulation.updateMap(ids);
    };

    CountryPopulation.updateMap = function (localidadesIds) {
        CountryPopulation.map.update(localidadesIds);
    };

    CountryPopulation.dotSeparateNumber = function(val){
        while (/(\d+)(\d{3})/.test(val.toString())){
          val = val.toString().replace(/(\d+)(\d{3})/, '$1'+'.'+'$2');
        }
        return val;
    }

})(window, document,jQuery, d3, ko);

window.onload = function() {
    CountryPopulation.init(); 
}