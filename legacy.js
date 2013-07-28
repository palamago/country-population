
function (e) {
    var t = {};
    e.mapa = t;
    var n = ["D02003", "D02004", "D02011", "D02017", "D02035", "D02036", "D02132", "D02038", "D02051", "D02052", "D02134", "D02133", "D02129", "D02061", "D02063", "D02062", "D02070", "D02130", "D02075", "D02077", "D02079", "D02080", "D02089", "D02128", "D02092", "D02105", "D02106", "D02053", "D02109", "D02113", "D02118", "D02122", "CAPFED"];
    t.AMBA_IDS = n, 
    t.width = 400, 
    t.height = 950;
    var r = function (e, t, n) {
        e = e.sort(d3.ascending);
        var r = d3.mean(e),
            i = [r],
            s = function (e) {
                return n ? e.slice(0, d3.bisectLeft(e, r)) : e.slice(d3.bisectRight(e, r), e.length)
            };
        e = s(e);
        while (t > 1) r = d3.mean(e), i.push(r), e = s(e), t--;
        return i.sort(d3.ascending)
    }, 

    i = function (e) {
            return e.replace(/\s+/g, "-").toLowerCase()
        }, 
    s = d3.geo.mercator().scale(7e3).center([-65, -38]).translate([t.width / 2 - 30, t.height / 2 - 100]);
    t.projection = s;
    var o = d3.geo.path().projection(s),
        u = function (e, n, r, i, s) {
            var o = function (e) {
                return "q" + e + "-" + u + "-" + i + "n"
            };
            t.legend.selectAll("rect, text").remove();
            var s = s === undefined ? 2 : s,
                u = e.range().length,
                a = e.domain(),
                f = [
                    [n, a[0] - Math.pow(10, -s), o(0)]
                ];
            d3.range(u - 2).forEach(function (e) {
                f.push([a[e], a[e + 1] - Math.pow(10, -s), o(e + 1)])
            }), f.push([a[a.length - 1], r, o(u - 1)]);
            var l = t.width / u;
            t.legend.selectAll("rect").data(f).enter().append("rect").attr("x", function (e, t) {
                return l * t
            }).attr("width", l).attr("height", 10).attr("class", function (e) {
                return e[2]
            }).attr("data-start", function (e) {
                return e[0].toFixed(s)
            }).attr("data-end", function (e) {
                return e[1].toFixed(s)
            }), t.legend.selectAll("text").data(f).enter().append("text").attr("y", 22).attr("x", function (e, t) {
                return l * t
            }).text(function (e, t) {
                return e[0] % 1 === 0 ? Math.round(e[0]) : e[0].toFixed(s)
            }), t.legend.append("text").attr("y", 22).attr("x", l * u).text(f[f.length - 1][1] % 1 === 0 ? Math.round(f[f.length - 1][1]) : f[f.length - 1][1].toFixed(s)), t.legend.selectAll("text").attr("x", function (e, t) {
                return t == u ? this.getAttribute("x") - this.getBBox().width + 1 : t != 0 ? this.getAttribute("x") - this.getBBox().width / 2 : this.getAttribute("x")
            })
        };
    t.drawMap = function (e, n, i) {
        var s = function (e) {
            var t = e.length;
            for (var n = 1; n < e.length; n++) e[n] >= 0 && e[n - 1] < 0 && e.splice(n, 1, 0);
            return e
        }, o = d3.entries(e).map(function (e) {
                return parseFloat(e.value)
            }).filter(function (e) {
                return !isNaN(e)
            }).sort(d3.ascending),
            a, f;
        i === undefined && (i = "jenks");
        switch (i) {
        case undefined:
        case "jenks":
            var l = jenks(o, n);
            a = s(l);
            break;
        case "htt":
        case "htt-left":
            f = r(o, n - 1, i == "htt-left"), a = s([o[0]].concat(f).concat([o[o.length - 1]]));
            break;
        case "quantiles":
            var c = d3.scale.quantile().domain(o).range(d3.range(n)).quantiles();
            a = [o[0]].concat(c).concat([o[o.length - 1]]);
            break;
        default:
            var h = $.grep(i.split(/(-?\d+\.?\d*)/), function (e, t) {
                return t % 2 == 1
            }).map(parseFloat);
            if (h.length == 0 || h.length != n - 1) break;
            a = [o[0]].concat(h).concat([o[o.length - 1]])
        }
        var p = 0;
        a.forEach(function (e) {
            e < 0 && p++
        });
        var d = d3.scale.threshold().domain(a.splice(1, 4)).range(d3.range(n));
        u(d, o[0], o[o.length - 1], p), t.departamentos.selectAll("path, g.path").attr("class", function (t) {
            return "q" + d(e[t.id]) + "-" + n + "-" + p + "n"
        })
    }, t.drawPaths = function (e, r) {
        var s = d3.select(r).append("svg").attr("width", t.width).attr("height", t.height).attr("class", "Poblacion");
        t.mapa_svg = s.append("g").classed("mapa", !0).attr("transform", "translate(0, 20)"), 
        t.departamentos = t.mapa_svg.append("g").attr("class", "departamentos"), 
        t.provincias = t.mapa_svg.append("g").attr("class", "provincias"), 
        t.legend = s.append("g").attr("class", "legend");
        var u = topojson.object(e, e.objects.provincias).geometries,
            a = topojson.object(e, e.objects.departamentos).geometries;
        t.provincias.selectAll("path").data(u).enter().append("path").attr("id", function (e) {
            return i(e.properties.PROVINCIA)
        }).attr("d", o).attr("class", "provincia"), t.provincias, t.gran_buenos_aires = t.departamentos.append("g").attr("class", "gran-buenos-aires"), t.gran_buenos_aires_mesh = topojson.mesh(e, {
            type: "GeometryCollection",
            geometries: e.objects.departamentos.geometries.filter(function (e) {
                return n.indexOf(e.id) !== -1
            })
        }), u.forEach(function (e) {
            var r = i(e.properties.PROVINCIA);
            t.departamentos.append("g").attr("id", "provincia-" + r).selectAll("path").data(a.filter(function (e) {
                return r === i(e.properties.p_id) && n.indexOf(e.id) == -1
            })).enter().append("path").attr("id", function (e) {
                return e.id
            }).attr("d", o).attr("class", "departamento")
        }), t.departamentos.select("g#provincia-buenos-aires").append("g").attr("id", "gran-buenos-aires").selectAll("path").data(a.filter(function (e) {
            return n.indexOf(e.id) !== -1
        })).enter().append("path").attr("id", function (e) {
            return e.id
        }).attr("d", o).attr("class", "departamento")
    }, t.zoomToProvincia = function (e, n) {
        var r = s.translate(),
            u, a, f;
        if (e === null) u = 1, a = -r[0], f = -r[1], t.mapa_svg.transition().duration(750).attr("transform", "translate(0,20)").each("end", function () {
            t.mapa_svg.selectAll("g.departamentos g").classed("inactive", !1), t.mapa_svg.selectAll("g.provincias path").style("stroke-opacity", 1).style("stroke-width", 2), t.mapa_svg.selectAll("g.departamentos path").style("stroke-width", "1px"), t.zoomedTo = null, n !== undefined && n()
        });
        else {
            t.mapa_svg.selectAll("g.departamentos g").classed("inactive", !1);
            var l = o.bounds(e != "gran-buenos-aires" ? d3.select(".provincias path#" + i(e))[0][0].__data__ : t.gran_buenos_aires_mesh);
            u = 1 / Math.max((l[1][0] - l[0][0]) / t.width, (l[1][1] - l[0][1]) / t.height), t.mapa_svg.selectAll("g.provincias path").style("stroke-opacity", 0).style("stroke-width", .1), t.mapa_svg.selectAll("g.departamentos path").style("stroke-width", 1 / u + "px"), t.mapa_svg.transition().duration(750).attr("transform", "translate(" + (s.translate()[0] + 30) + "," + (s.translate()[1] + 100) + ")" + "scale(" + u + ")" + "translate(" + -(l[1][0] + l[0][0]) / 2 + "," + -(l[1][1] + l[0][1]) / 2 + ")").each("end", function () {
                t.mapa_svg.selectAll("g.departamentos > g:not(#provincia-" + i(e == "gran-buenos-aires" ? "buenos-aires" : e) + ")").classed("inactive", !0), t.zoomedTo = i(e), n !== undefined && n()
            })
        }
    }
}(this), 




$(function () {
    var e = function (e) {
        return e.replace(/\s+/g, "-").toLowerCase()
    }, t = function (e) {
            var t = {}, n = Array.prototype.slice;
            return function () {
                var r = n.call(arguments);
                return r in t ? t[r] : t[r] = e.apply(this, r)
            }
        };
    Object.extend = function (e, t) {
        var n;
        for (n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
        return e
    }, Number.prototype.format = function (e, t, n) {
        var r = this,
            e = isNaN(e = Math.abs(e)) ? 2 : e,
            t = t == undefined ? "." : t,
            n = n == undefined ? "," : n,
            i = r < 0 ? "-" : "",
            s = parseInt(r = Math.abs(+r || 0).toFixed(e)) + "",
            o = (o = s.length) > 3 ? o % 3 : 0;
        return i + (o ? s.substr(0, o) + n : "") + s.substr(o).replace(/(\d{3})(?=\d)/g, "$1" + n) + (e ? t + Math.abs(r - s).toFixed(e).slice(2) : "")
    };
    var n = function (e) {
        var e = e;
        this.getVariable = function (t, n) {
            var r = e._column_names.indexOf(t),
                i = e._years.indexOf(n.toString());
            if (r == -1 || i == -1) return null;
            var s = {};
            for (var o in e._districts) {
                var u = e._districts[o][i][r];
                u !== null && (s[o] = u)
            }
            return s
        }, this.getVariableAsRatio = function (e, t, n) {
            var r = this.getVariable(e, t),
                i = this.getVariable(n, t),
                s = {};
            for (var o in r) s[o] = (r[o] / (i[o] || .1)).toPrecision(5) * 100;
            return s
        }, this.getIntercensalVariation = function (e) {
            var t = this.getVariable(e, 2001),
                n = this.getVariable(e, 2010),
                r = {};
            for (var i in t) r[i] = (n[i] / (t[i] == 0 ? 1 : t[i]) - 1).toPrecision(5) * 100;
            return r
        }
    }, r, i = {};
    Handlebars.registerHelper("mais_um", function (e) {
        return e + 1
    }), Handlebars.registerHelper("to_id", e), Handlebars.registerHelper("format_number", function (e) {
        return e.format(e % 1 === 0 ? null : 2, ",", ".")
    });
    var s = Handlebars.compile($("#distrito-info-template").html()),
        o = Handlebars.compile($("#tabla-ranking-template").html()),
        u = $("#tooltip"),
        a = $("#ranking tbody"),
        f = function (e, t) {
            var n = e.substring(1).split("-"),
                r = n[0],
                i = n[1],
                s = n[2],
                o = null;
            if (i == "intercensal") {
                var u = $('a[href="#' + r + '-2001"]').data("units");
                o = {
                    data: t.getIntercensalVariation(r),
                    data_label: "VariaciÃ³n intercensal",
                    units: "%",
                    other_data: [
                        ["Censo 2001", t.getVariable(r, "2001"), u],
                        ["Censo 2010", t.getVariable(r, "2010"), u]
                    ]
                }
            } else if (i == "ratio") {
                var a;
                r == "Poblacion_Analfabetos" || r == "Poblacion_Alfabetos" ? a = "Poblacion_Mayor10" : a = r.split("_")[0] + "_Total";
                var f = t.getVariableAsRatio(r, s, a);
                o = {
                    data: t.getVariableAsRatio(r, s, a),
                    other_data: [
                        ["Total", t.getVariable(r, s)]
                    ],
                    data_label: "Porcentaje"
                }
            } else o = {
                data: t.getVariable(r, i),
                other_data: []
            };
            return o
        }, l = function (e) {
            var t = $("#ranking tbody"),
                n;
            $("tr", t).hide();
            if (typeof e == "string") {
                n = $('tr[data-provincia="' + e + '"]', t).show();
                var r = $('#ranking tbody tr[data-provincia="' + e + '"] td:first-child');
                $("span:first-child", r).hide(), $.each(r, function (e, t) {
                    $("span:nth-child(2)", t).html(e + 1)
                })
            } else if ($.isArray(e)) n = $(e.map(function (e) {
                return 'tr[data-id="' + e + '"]'
            }).join(","), t).show(), $("td:first-child span:first-child", n).hide(), $.each(n, function (e, t) {
                $("td:first-child span:nth-child(2)", t).html(e + 1)
            });
            else if (e == null || e === undefined) n = $("tr", t), n.show(), $("td:first-child span:first-child", n).show(), $("td:first-child span:nth-child(2)", n).html("")
        }, c = function () {
            location.hash.indexOf("intercensal") !== -1 ? $("#variaciones #variacion").trigger("click") : location.hash.indexOf("2001") !== -1 ? $("#variaciones #censo_2001").trigger("click") : location.hash.indexOf("2010") !== -1 && $("#variaciones #censo_2010").trigger("click")
        };







    $(window).hashchange(function () {
        if (location.hash.match(/^#(Viviendas|Poblacion|Hogares)/) == null) return;
        var e, t = $('a[href="' + location.hash + '"]');
        if (e = f(location.hash, r)) {
            mapa.drawMap(e.data, 5, t.data("breaks") || "jenks");
            var n = location.hash.match(/^#(Viviendas|Poblacion|Hogares)/);
            n.length == 2 && $("body").attr("class", n[1]), $(".variables li.active").removeClass("active"), $('.variables a[href="' + location.hash + '"]').parent().addClass("active");
            var s = t.attr("title").split("â€”");
            s = "<strong>" + s[0] + "</strong> â€” " + s[1], $("nav h2, #ranking thead tr:first-child th").html(s);
            var u = t.data("units") || "Porcentaje";
            $("#legend-units").html(u);
            var c = t.data("units-long") || "en porcentaje";
            $("#ranking thead tr:nth-child(2) th span:nth-child(2)").html("(" + c + ")");
            for (var h in e.data) {
                if (!i[h]) continue;
                i[h].data = e.data[h], e.other_data && (i[h].other_data = e.other_data.map(function (e) {
                    return [e[0], e[1][h]]
                })), i[h].data_label = e.data_label || u, i[h].units = e.units
            }
            a.html(o({
                units: u == "Porcentaje" ? "%" : "",
                data: d3.entries(i).sort(function (e, t) {
                    return t.value.data - e.value.data
                })
            })), l(mapa.zoomedTo == "gran-buenos-aires" ? mapa.AMBA_IDS : mapa.zoomedTo)
        }
        $("tbody.scrollContent").scrollTop(0)
    }), showDistritoTooltip = function (e) {
        var t = {
            rank: $("tr[data-id=" + e.id + "] td:first-child span:first-child", a).html(),
            data: i[e.id].data,
            other_data: i[e.id].other_data,
            data_label: i[e.id].data_label,
            units: i[e.id].units,
            group: $("nav #filtros div.filtro.active h3").text(),
            test_gruop: $("#variaciones li.active").is("#variacion")
        };
        u.html(s(Object.extend(t, e.__data__.properties))).css("visibility", "visible")
    };
    var h;
    hideDistritoTooltip = function () {
        u.css("visibility", "hidden"), h[0].classList.remove("hover")
    }, $(document).on({
        mouseenter: function () {
            h = $("path#" + $(this).data("id")), h[0].classList.add("hover"), h && showDistritoTooltip(h[0])
        },
        mouseleave: hideDistritoTooltip
    }, "#ranking tbody tr");
    var p = function () {
        if (!mapa.zoomedTo) return;
        mapa.zoomToProvincia(null), l(null), $("#volver").css("visibility", "hidden"), $("#haga_clic").css("visibility", "visible"), $("#ranking thead tr:nth-child(2) th span:first-child").html("Ranking de todo el paÃ­s")
    };
    $("input[type=search]").on("keyup search", function (e) {
        var t = $(this);
        if (t.val() == "") {
            $("table#ranking tbody tr").show();
            return
        }
        if (this.lastSearch == t.val()) return;
        this.lastSearch = t.val();
        var n = new RegExp(t.val(), "i");
        $("table#ranking tbody tr td:nth-child(2)").each(function (e) {
            $(this).parent().toggle($(this).text().search(n) >= 0)
        })
    }), $.getJSON("data/shapes.json", function (e) {
        mapa.drawPaths(e, "article#svg"), $("#ranking, svg").mousemove(function (e) {
            $("#tooltip").css("left", e.clientX + 10).css("top", e.clientY + 10)
        }), e.objects.departamentos.geometries.forEach(function (e) {
            i[e.id] = e.properties
        }), $(".departamentos path").on("mouseover", function () {
            (h = $(this))[0].classList.add("hover"), showDistritoTooltip(this)
        }).on("mouseout", hideDistritoTooltip), $.getJSON("data/data.json", function (e) {
            r = new n(e), location.hash == "" ? location.hash = "#Poblacion_Total-intercensal" : $(window).trigger("hashchange");
            var t = location.hash.match(/^#(Viviendas|Poblacion|Hogares)/);
            t.length == 2 && $("#filtros h3:contains(" + t[1] + ")").parent().trigger("click"), c(), loader.destruir(), addthis.init(), $("#volver").on("click", function (e) {
                e.preventDefault(), p()
            }), $("g.mapa g.departamentos g").on("click", function (e) {
                var t = $(this).attr("id");
                if (mapa.zoomedTo == "gran-buenos-aires" || mapa.zoomedTo && t.indexOf("gran-buenos-aires") !== 0) {
                    p();
                    return
                }
                t.indexOf("gran-buenos-aires") != 0 ? t = t.split(/provincia-(.+)/)[1] : e.stopPropagation(), mapa.zoomToProvincia(t, function () {
                    l(t == "gran-buenos-aires" ? mapa.AMBA_IDS : t), $("#ranking thead tr:nth-child(2) th span:first-child").html("Ranking de " + (t == "gran-buenos-aires" ? "Capital Federal y Gran Buenos Aires" : $('#ranking tbody tr[data-provincia="' + t + '"] td:nth-child(2) span').html())), $("#volver").css("visibility", "visible"), $("#haga_clic").css("visibility", "hidden")
                })
            })
        })
    })
});