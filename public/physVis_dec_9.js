
    var margin = {top: 10, right: 20, bottom: 20, left: 60},
    width = (640 - margin.left - margin.right),
    height = (220 - margin.top - margin.bottom),
    sheight = (220 - margin.top - margin.bottom),
    width2 = 640 - margin.top - margin.bottom,
    height2 = 40 - margin.top - margin.bottom;

    var parseDate = d3.time.format("%Y-%m-%d %H:%M").parse;
    var parseDate2 = d3.time.format("%Y-%m-%d %H:%M:%S.0").parse;

    var formatDate = d3.time.format("%B %d, %Y");

    var tooltipDiv = d3.select('#streamgraph')
                                   .append('div')
                                   .attr('class', 'tooltip');

    var tooltipLin = d3.select('#lineargraph')
                                   .append('div')
                                   .attr('class', 'tooltip');

    var formatTime = d3.time.format("%I %p"),
      formatHour = function (d) {
        if (d == 12) return "noon";
        if (d == 24 || d == 0) return "midnight";
        return formatTime(new Date(2013, 2, 9, d, 00));
      };

       var nestByDate = d3.nest()
      .key(function(d) { return d.days; })
      .key(function(d) { return d.minutes; })
      .sortValues(function(a,b) { return ((a.ABSTRACTIONVALUE - b.ABSTRACTIONVALUE)
        ? -1
        : 1)});

       var nestByAggDate = d3.nest()
      .key(function(d) { return d.days; })
      .key(function(d) { return d.minutes; })
      .key(function(d) {
                    return d.ABSTRACTIONTYPE;
                }).sortKeys(d3.ascending)
      .rollup(function(leaves) { return {"date": d3.extent(leaves.map(function(d){ return d.ACTUALSTARTTIME})), "count": leaves.length, "total_time": d3.sum(leaves, function(d) {return parseFloat(d.ABSTRACTIONVALUE);})} })
           ;

      var nestByType = d3.nest()
             .key(function(d) {
                    return d.ABSTRACTIONTYPE;
                }).sortKeys(d3.ascending)
             .key(function(d) {
                  return new Date (d.ACTUALSTARTTIME.getFullYear(), d.ACTUALSTARTTIME.getMonth(), d.ACTUALSTARTTIME.getDate(), d.ACTUALSTARTTIME.getHours(),0,0,0) ;
                })
            .rollup(function(leaves) { return {"date": d3.extent(leaves.map(function(d){ return d.ACTUALSTARTTIME})), "count": leaves.length, "total_time": d3.sum(leaves, function(d) {return parseFloat(d.ABSTRACTIONVALUE);})} })
            ;


            /*
            .sortValues(function(a,b) { return ((a.ABSTRACTIONVALUE - b.ABSTRACTIONVALUE)
                    ? -1
                    : 1)})
             */


      var patientID = "P24412";

      var abst;

      var svg = {};

      svg["ri_pause"] = d3.select("#ri_pause").append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .attr("class", "ri")
                  .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      svg["hr"] = d3.select("#hr").append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .attr("class", "hr")
                  .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      svg["spo2"] = d3.select("#spo2").append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .attr("class", "spo2")
                  .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

     svg["spells"] = d3.select("#streamgraph").append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", sheight + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      svg["slinear"] = d3.select("#lineargraph").append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", sheight + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

       svg["sstacked"] = d3.select("#sstacked").append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", sheight + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


      svg["legend"] = d3.select("#legend").append("svg")
          .attr("width", width2 + margin.right )
          .attr("height", height2 + margin.bottom)
          .append("g")
          .attr("class", "legend")
          .attr("transform", "translate(" + (margin.left ) + "," + margin.top + ")");

var charts = {};



  function createChart () {

          this.graphs = ["ri_pause","hr","spo2","spells", "linear", "stacked"];


          for (var i = 0; i < this.graphs.length; i++) {

                    (function(c) {
                      var name = graphs[i];
                      var n = i;
                      d3.json("data/" + patientID + "_breaching_" + ((name==="linear" || name==="stacked") ? "spells" : name) + ".json", function (error, data) {

                              if (name === "spells" || name === "linear" || name === "stacked") {


                                    charts[name] = (new streamGraph({
                                                        data: data,
                                                        id: n,
                                                        name: name,
                                                        width: width,
                                                        height: sheight,
                                                        svg: svg[name],
                                                        margin: margin
                                                      }));
                              } else {
                                  charts[name] = (new Chart({
                                                        data: data,
                                                        id: n,
                                                        name: name,
                                                        width: width,
                                                        height: height,
                                                        svg: svg[name],
                                                        margin: margin
                                                      }));
                                }
                            });
                    })(i);
              }
          }

  createChart();

function streamGraph(options){

  var that = this;
              this.chartData = options.data;
              this.width = options.width;
              this.height = options.height;
              this.svg = options.svg;
              this.id = options.id;
              this.name = options.name;
              this.margin = options.margin;
              this.abst = [];

    this.ext = d3.extent(this.chartData.map(function(d){return parseDate2(d.ACTUALSTARTTIME);}));
    var localName = this.name;

          this.chartData = this.chartData.filter(function (d) {return d.ABSTRACTIONTYPE !== "Iso RI pause" && d.ABSTRACTIONTYPE !== "Unclassified"});

           this.chartData.forEach( function (d) {
            d.ACTUALSTARTTIME =  parseDate2(d.ACTUALSTARTTIME);
            d.days = d.ACTUALSTARTTIME.getDate();
            d.minutes = d.ACTUALSTARTTIME.getHours();
            d.ACTUALENDTIME =  parseDate(d.ACTUALENDTIME);
            d.ABSTRACTIONVALUE = parseInt(d.ABSTRACTIONVALUE, 10);
          }
          );

           this.cf = crossfilter(this.chartData);




          this.xC = d3.scale.linear().range([0, this.width]);
          this.yC = d3.scale.linear().range([this.height, 0]);

          this.yext = d3.extent(that.chartData.map(function(d){return d.ABSTRACTIONVALUE;}));

           this.xL = d3.time.scale().range([0, this.width]).domain(this.ext);
           this.yL = d3.scale.log().range([this.height, 0]).domain(this.yext);

           this.xSc = d3.time.scale().range([0, this.width]).domain(this.ext);
           this.ySc = d3.scale.linear().range([this.height, 0]).domain([0,150]);


          this.Cbrush = d3.svg.brush()
                          .x(that.xC)
                          .y(that.yC)
                         .on("brushend",  _.bind(brushmend, this));



          var xC = this.xC;
          var yC = this.yC;

          xC.domain(["0","23"]);
          yC.domain(["7","18"]);

          this.xCAxis = d3.svg.axis().scale(this.xC).orient("bottom"),
          this.yCAxis = d3.svg.axis().scale(this.yC).orient("left");

          var formatSi = d3.format("4d");

          this.xLAxis = d3.svg.axis().scale(this.xL).orient("bottom"),
          this.yLAxis = d3.svg.axis().scale(this.yL).orient("left").ticks(10, ".2");


      // get a count of all abstractiontypes
      this.classifications = crossfilter(this.chartData),
            this.all = this.classifications.groupAll(),
            this.date = this.classifications.dimension(function(d) { return d.ACTUALSTARTTIME; }),
            this.hour = this.classifications.dimension(function(d) { return d.ACTUALSTARTTIME.getHours() + d.ACTUALSTARTTIME.getMinutes() / 60; }),
            this.duration = this.classifications.dimension(function(d) { return Math.max(-60, Math.min(149, d.ABSTRACTIONVALUE)); }),
            this.type = this.classifications.dimension(function(d) { return d.ABSTRACTIONTYPE; });

      this.types = this.date.group().all();

      this.groupx = this.type.group().all();

      this.oScore = {};


          for (i=0;i<this.groupx.length;i++) {
            var tval;
              this.abst.push(this.groupx[i].key);
              tval = 1/this.groupx[i].value
               this.oScore[this.groupx[i].key] = (tval<0.01) ? tval * 30 : tval ;
           }

      this.color = d3.scale.ordinal()
      .domain(["Central", "Central Obs.", "Iso Brady", "Iso. Desat", "Pos. Iso. Brady", "Pos. Iso. Desat", "Vagal"])
      .range(["#feb24c", "#f03b20" , "#d62728" , "#1f77b4" , "#d6616b", "#aec7e8" , "#006633"]);

      this.display = d3.select("#check")

      this.names = this.abst;



             var that = this;
             if(this.name === "spells"){
              this.checks = this.display.append("ul")
                .classed("check", true)
                .selectAll("ul.check")
                .data(this.names)
                .enter()
                .append("li")

              this.checks.append("input")
                .attr({
                  "type": "checkbox",
                  "checked": true
                })
                .on("change", function(d,i) {

                var ind = that.names.indexOf(d)
                console.log("fromAbst: " + d  + " from index: " + ind );
                if(ind >= 0) {
                  that.names.splice(ind,1)
                } else {
                 that.names.push(d)
                }
                console.log(that.names);
                charts.spells.updateViz();
              })

            this.checks.append("span")
              .text(function(d) {
                return d; })

              createMatrixViz(that);

            } else if (this.name === "linear") {

              linGraph = new createLinearViz(that);

            } else if (this.name === "stacked") {
              stackGraph = new createStackedViz(that);
              }




      /*
        We are creating the chart here.
        First the groups are initiated, followed by rect appends.
       */



function createLinearViz(tap) {

        this.transition_data = function() {

          var that = this;

          if(that.brush.empty()) {
                charts.linear.xL.domain(charts.spells.ext)
              }


          svg["slinear"].selectAll(".scatter").data(charts.linear.chartData)
          .transition()
            .duration(500)
            .attr("cx", function(d) { return charts.linear.xL(d.ACTUALSTARTTIME); });
          }

         this.transition1_data = function(tpq) {

          var that = tpq;

          if(that.brush.empty()) {
                charts.linear.xL.domain(charts.spells.ext)
              } else  {
                charts.linear.xL.domain( that.brush.extent());
              }


          svg["slinear"].selectAll(".scatter").data(charts.linear.chartData)
          .transition()
            .duration(500)
            .attr("cx", function(d) { return charts.linear.xL(d.ACTUALSTARTTIME); });
          }

          this.reset_axis = function() {
              var that = this;
             svg["slinear"].transition().duration(500)
             .select(".x.axis")
             .call(charts.linear.xLAxis);

          }

          this.brushlend = function() {

            var that = this;

            if(that.brush.empty()) {

                that.transition_data();
                that.reset_axis();
              }


            //d3.selectAll(".spellslinbrush").call(that.brush);

            charts.linear.xL.domain( (that.brush.empty()) ? charts.spells.ext : that.brush.extent());

              that.transition_data();
              that.reset_axis();
              d3.select(".spellslinbrush").call(that.brush.clear());
          }

    var pr = this;
    var that = tap;
   // remove all previous items before render
    svg["slinear"].selectAll('*').remove();

    this.localName = that.name;

      that.type.filter(function(d){
       if(that.names.indexOf(d) >= 0)
          return true;
        return false;
      })

       var abstByDate = nestByDate.entries(that.date.top(Infinity));


    // var yL = d3.scale.ordinal().rangeRoundBands([height, 0], .05).domain(that.abst);



      this.brush = d3.svg.brush()
                  .x(that.xL)
                  .on("brushend", _.bind(this.brushlend,this));



      svg["slinear"].append("g")
          .attr("class", "spellslinbrush")
          .call(this.brush)
        .selectAll('rect')
          .attr('height', that.height);

      /*
            Legend Ends -- Abstraction Graph Begins
       */

      this.scatter = svg["slinear"].selectAll(".scatter")
                    .data(that.chartData)
                    .enter().append("circle")
                    .attr("class", "scatter")
                    .attr("clip-path", "url(#clip)")
                    .attr("cy", function(d) {return that.yL(d.ABSTRACTIONVALUE)})
                    .attr("cx", function(d) {
                      return that.xL(d.ACTUALSTARTTIME);
                    })
                    .attr("fill", function(d){
                      return that.color(d.ABSTRACTIONTYPE);

                    })
                    .attr("r", function(d) { return (r = Math.log(d.ABSTRACTIONVALUE) * 1.2 )})
                    .style("opacity", function(d) {
                      // use absractiontype length to control opacity
                      return that.oScore[d.ABSTRACTIONTYPE]*7;
                      })

                    this.scatter.on('mouseover.tooltip', function(pD, pI){
                      var bodyNode = bubbles3.node();
                      var html = d3.functor('');
                          var absoluteMousePos = d3.mouse(bodyNode);
                          tooltipDiv.style({
                              left: (absoluteMousePos[0] + 5)+'px',
                              top: (absoluteMousePos[1]) + 'px',
                              'background-color': '#d8d5e4',
                              width: '185px',
                              height: '50px',
                              padding: '5px',
                              position: 'absolute',
                              'z-index': 1001,
                              'box-shadow': '0 1px 2px 0 #656565',
                              'visibility': 'visible',
                              'opacity': 0.9
                          });

                          var first_line = '<p class="ttext" ><strong>' + pD.ABSTRACTIONTYPE + '</strong>   for ' + pD.ABSTRACTIONVALUE  + ' Secs. </p><br />';
                          var second_line = '<p class="ttext">Time: ' + formatDate(pD.ACTUALSTARTTIME) + ' '+ formatTime(pD.ACTUALSTARTTIME) + '</p><br />';
                           tooltipDiv.html(first_line + second_line);
                      })
                    .on("mouseover.stroke",  function() {
                      var sel = d3.select(this);
                      sel.style({'stroke': 'black', 'stroke-width': 3});
                    })
                    .on('mousemove.tooltip', function(pD, pI){
                          // Move tooltip
                          var bodyNode = bubbles3.node();

                          var absoluteMousePos = d3.mouse(bodyNode);
                          tooltipDiv.style({
                              left: (absoluteMousePos[0] + 5)+'px',
                              top: (absoluteMousePos[1])+'px'
                          });
                    })
                    .on("mouseout.tip", function(){
                              d3.select(this).style("stroke-width", 0);
                              // d3.select("#stronggraph").selectAll("div").remove();
                             })
                            .on('mouseout.tooltip', function(pD, pI){
                              // Remove tooltip
                              var bodyNode = bubbles3.node();
                              var absoluteMousePos = d3.mouse(bodyNode);
                              tooltipDiv.style({

                                      'opacity': 0
                                  });
                    });

          this.scatter.transition()
          .duration(500);

          this.scatter.on('mousedown', function(){
            brush_elm = svg["slinear"].select(".spellslinbrush").node();
            new_click_event = new Event('mousedown');
            new_click_event.pageX = d3.event.pageX;
            new_click_event.clientX = d3.event.clientX;
            new_click_event.pageY = d3.event.pageY;
            new_click_event.clientY = d3.event.clientY;
            brush_elm.dispatchEvent(new_click_event);
          });

      this.yAxSvg = svg["slinear"].append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(-10,0)")
          .call(that.yLAxis);




      this.xAxSvg = svg["slinear"].append("g")
          .attr("class", "x axis")
          //.attr("clip-path", "url(#clip)")
          .attr("transform", "translate(10," + that.height + ")")
          .call(that.xLAxis);

      this.clipSvg =svg["slinear"].append("defs").append("clipPath")
                    .attr("id", "clip")
                    .append("rect")
                    .attr("transform", "translate(-10,-20)")
                    .attr("width", that.width + 30)
                    .attr("height", that.height + 20);

                   // .attr("transform", "translate(10," + height + ")");
                   //


}

function createStackedViz(tap) {

        this.transition_data = function() {

              var that = this;

              if(that.brush.empty()) {
                    xScale.domain(charts.spells.ext)
                  }

              svg["sstacked"].selectAll(".scatter").data(charts.linear.chartData)
              .transition()
                .duration(500)
                .attr("cx", function(d) { return charts.linear.xL(d.ACTUALSTARTTIME); });
          }

         this.transition1_data = function(tpq) {

                var that = tpq;

                if(that.brush.empty()) {
                      charts.linear.xL.domain(charts.spells.ext)
                    } else  {
                      charts.linear.xL.domain( that.brush.extent());
                    }

                svg["sstacked"].selectAll(".stacked").data(charts.linear.chartData)
                  .transition()
                  .duration(500)
                  .attr("cx", function(d) { return charts.linear.xL(d.ACTUALSTARTTIME); });
          }

          this.reset_axis = function() {
                    var that = this;
                   svg["slinear"].transition().duration(500)
                                 .select(".x.axis")
                                 .call(charts.linear.xLAxis);
          }

          this.brushlend = function() {

                          var that = this;
                          if(that.brush.empty()) {
                              that.transition_data();
                              that.reset_axis();
                            }
                  charts.linear.xL.domain( (that.brush.empty()) ? charts.spells.ext : that.brush.extent());
                    that.transition_data();
                    that.reset_axis();
                    d3.select(".spellslinbrush").call(that.brush.clear());
          }

                  var pr = this;
                  var that = tap;

                      // remove all previous items before render
                      svg["sstacked"].selectAll('*').remove();

                      this.localName = that.name;

                        that.type.filter(function(d){
                         if(that.names.indexOf(d) >= 0)
                            return true;
                          return false;
                        })


                  var abstByType = nestByType.entries(that.date.top(Infinity));


                  var uniqArray = [];

                  var normalize=function(obj){

                        var uniq = {};

                          obj.forEach( function(d) {
                                    for (var i=0; i < d.values.length; i++) {
                                         var el = d.values[i].key;
                                         if(!uniq[el]) uniq[el] = [];
                                         uniq[el].push(d.values[i].key);
                                       }
                                })

                            for (n in uniq) { uniqArray.push(n)};

                             obj.forEach( function(d) {

                              var dvallen = d.values.length;
                              for (i = 0; i < uniqArray.length; i++) {
                                var isFound = false;
                                for (j = 0; j < dvallen; j++) {
                                  if (uniqArray[i] === d.values[j].key) {
                                    isFound = true;
                                  }
                                }
                                if (!isFound) {
                                  d.values[d.values.length] = {key: 0, values: {count:0, total_time:0} }
                                  d.values[d.values.length-1].key = uniqArray[i];
                                }
                              }
                                })
                          return obj;
                        };

                      var normalizedData = normalize(abstByType);

                      function custom_sort(a, b) {
                                return new Date(a.key).getTime() - new Date(b.key).getTime();
                            }

                      normalizedData.forEach(function(d) {
                        d.values.sort(custom_sort)
                          })

                  // var xScale = d3.scale.ordinal()
                  //   .domain(d3.range(normalizedData[0].length))
                  //   .rangeRoundBands([0, width], 0.05);
                  //

                  var xScale = d3.time.scale()
                          .domain(that.ext)
                          .range([0, width]);

                  var yScale = d3.scale.linear()
                      .domain([0,20
                      ])
                      .range([sheight,0]);

                  var xAxis = d3.svg.axis()
                      .scale(that.xSc)
                      .orient("bottom");

                  var yAxis = d3.svg.axis()
                      .scale(yScale)
                      .orient("left");

                  var stack = d3.layout.stack()
                                  .offset("silhouette")
                                  .values(function(d) {
                                    return d.values; })
                                  .x(function(d) {
                                      return new Date (d.key )})
                                  .y(function(d) { return d.values.count; });

                  var layers = stack(normalizedData);
                  console.log(layers);
                  var area = d3.svg.area()
                      .interpolate("cardinal")
                      .x(function(d) { return xScale(new Date (d.key)); })
                      .y0(function(d) { return yScale(d.y0); })
                      .y1(function(d) { return yScale(d.y0 + d.y); });

                    this.brush = d3.svg.brush()
                                .x(that.xSc)
                                .on("brushend", _.bind(this.brushlend,this));


                    this.createStackChart = function() {

                          this.stacked = svg["sstacked"]
                                      .selectAll(".layer")
                                      .data(layers)
                                    .enter().append("path")
                                      .attr("class", function(d) { return d.key; })
                                      .attr("d", function(d) { return area(d.values); })
                                      .style("fill", function(d, i) { return that.color(d.key); });
                  }

                    this.createStackChart();

                    svg["sstacked"].append("g")
                        .attr("class", "brush")
                        .call(this.brush)
                      .selectAll('rect')
                        .attr('height', that.height);

                    this.xAxSvg = svg["sstacked"].append("g")
                        .attr("class", "x axis")
                        //.attr("clip-path", "url(#clip)")
                        .attr("transform", "translate(10," + that.height + ")")
                        .call(xAxis);

}

function createMatrixViz(tap) {
          var that = tap;
          //var that = this;
          var localName = that.name;
         // remove all previous items before render
          svg["spells"].selectAll('*').remove();
          svg["legend"].selectAll('*').remove();


        that.type.filter(function(d){
         if(that.names.indexOf(d) >= 0)
            return true;
          return false;
        })

         var abstByDate = nestByDate.entries(that.date.top(Infinity));

        /*
                Legend for Abstraction Graph
        */

      var legendSpace = width/that.abst.length;

      var legend = svg["legend"].selectAll('g')
            .data(that.abst)
           .enter()
          .append('g')
            .attr('class', 'legend')
            .attr("transform", function(d,i) {
                        return "translate(" + ((legendSpace/2) + (i * legendSpace)) + ",0)"; })
            ;


        legend.append('circle')
            .attr("r","0.4em")
            .style('fill', function(d,i) {
              return that.color(d);
            });

        legend.append('text')
            .attr("dy",4)
              .attr("dx",".52em")
              .attr("text-anchor", "start")
            .text(function(d,i){ return d; });

                          // Clean up lost tooltips
                          d3.select('.body').selectAll('div.tooltip').remove();
                          // Append tooltip

      this.Cbrush = that.Cbrush;

      svg["spells"].append("g")
          .attr("class", "spellmbrush")
          .call(this.Cbrush)
        .selectAll('rect')
          .attr('height', that.height);



      /*
            Legend Ends -- Abstraction Graph Begins
       */

        bubbles = svg["spells"].selectAll(".bubbles")
                    .data(abstByDate, function(d) { return d.key; })
                    .enter( ).append("g")

                    .attr("class", "g")
                    .attr("transform", function(d) {
                        return "translate(" + 10 + ",0)"; })
                     .attr("clip-path", "url(#clip)");


        bubbles2  = bubbles.selectAll(".types")
                    .data(function(d){ return d.values;})
                      .enter().append("g")

                  .attr("class", "types");

        bubbles3 = bubbles2.selectAll(".bubbles")
                  .data(function (d) {
                  return d.values; })
                      .enter().append("circle")

                      .attr("class", "bubbles")
                      .attr("cy", function(d) {return that.yC(d.days)})
                      .attr("cx", function(d) {
                        return that.xC(d.minutes);
                      })
                      .attr("fill", function(d){
                        return that.color(d.ABSTRACTIONTYPE);

                      })
                      .attr("r", function(d) { return (r = Math.log(d.ABSTRACTIONVALUE) * 2 )})

                      .style("opacity", function(d) {

                        if (d3.selectAll("circle") <= 20) {
                        return that.oScore[d.ABSTRACTIONTYPE]*20;
                      } else {
                        return that.oScore[d.ABSTRACTIONTYPE]*2;
                      }
                        });


                      bubbles3.on('mouseover.tooltip', function(pD, pI){
                        var bodyNode = bubbles3.node();
                        var html = d3.functor('');
                            var absoluteMousePos = d3.mouse(bodyNode);
                            tooltipDiv.style({
                                left: (absoluteMousePos[0] + 5)+'px',
                                top: (absoluteMousePos[1]) + 'px',
                                'background-color': '#d8d5e4',
                                width: '185px',
                                height: '50px',
                                padding: '5px',
                                position: 'absolute',
                                'z-index': 1001,
                                'box-shadow': '0 1px 2px 0 #656565',
                                'visibility': 'visible',
                                'opacity': 0.9
                            });

                            var first_line = '<p class="ttext" ><strong>' + pD.ABSTRACTIONTYPE + '</strong>   for ' + pD.ABSTRACTIONVALUE  + ' Secs. </p><br />';
                            var second_line = '<p class="ttext">Time: ' + formatDate(pD.ACTUALSTARTTIME) + ' '+ formatTime(pD.ACTUALSTARTTIME) + '</p><br />';
                             tooltipDiv.html(first_line + second_line);
                        })
                      .on("mouseover.stroke",  function() {
                        var sel = d3.select(this);
                        sel.style({'stroke': 'black', 'stroke-width': 3});
                      })
                      .on('mousemove.tooltip', function(pD, pI){
                            // Move tooltip
                            var bodyNode = bubbles3.node();

                            var absoluteMousePos = d3.mouse(bodyNode);
                            tooltipDiv.style({
                                left: (absoluteMousePos[0] + 5)+'px',
                                top: (absoluteMousePos[1])+'px'
                            });
                      })
                      .on("mouseout.tip", function(){
                                d3.select(this).style("stroke-width", 0);
                                // d3.select("#stronggraph").selectAll("div").remove();
                               })
                              .on('mouseout.tooltip', function(pD, pI){
                                // Remove tooltip
                                var bodyNode = bubbles3.node();
                                var absoluteMousePos = d3.mouse(bodyNode);
                                tooltipDiv.style({

                                        'opacity': 0
                                    });
                    });


          bubbles3.transition()
          .duration(500);

          bubbles3.on('mousedown', function(){
            brush_elm = svg["spells"].select(".spellmbrush").node();
            new_click_event = new Event('mousedown');
            new_click_event.pageX = d3.event.pageX;
            new_click_event.clientX = d3.event.clientX;
            new_click_event.pageY = d3.event.pageY;
            new_click_event.clientY = d3.event.clientY;
            brush_elm.dispatchEvent(new_click_event);
          });

      svg["spells"].append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(-10,0)")
          .call(that.yCAxis);




      svg["spells"].append("g")
          .attr("class", "x axis")
          //.attr("clip-path", "url(#clip)")
          .attr("transform", "translate(10," + that.height + ")")
          .call(that.xCAxis);

      svg["spells"].append("defs").append("clipPath")
                    .attr("id", "clip")
                    .append("rect")
                    .attr("transform", "translate(-10,-20)")
                    .attr("width", that.width + 30)
                    .attr("height", that.height + 20);

                   // .attr("transform", "translate(10," + height + ")");

          /*
              TREEMAP VISUALIZATION
              Rishikesan Kamaleswaran, 2014
           */

      var renameKeys=function(obj){

        /*Recursively renames "key" keys to "name" and
        renames "values" keys to "children" */

        obj.name=obj.key;
        delete obj.key;
          if(obj.values){
            obj.children=obj.values;
            delete obj.values;
            if ( obj.children instanceof Array) {
            obj.children.forEach(renameKeys);
          }
        }

        return obj;
      };

        heightm = height*2;

        var tsvg = d3.select("#tree").append("svg")
          .attr("width", (width + margin.left + margin.right))
          .attr("height", (heightm + margin.top + margin.bottom))
          .attr("transform", "translate(" + (margin.right) + "," + margin.top + ")");

          var CountByDate = nestByType.entries(that.date.top(Infinity));

           var root={key:'root',values:[]};
           root.values=CountByDate;
          renameKeys(root);
          // //

        var treemap = d3.layout.treemap()
          .size([width, heightm])
          .sticky(true)
          // .children(function children(d, depth) {
          //     return d.values;
          //   })
          .value(function(d) {
           // console.log(d);
            return d.children.count; })
          .sort(function(a,b) { return a.count - b.count; })
          .nodes(root);


          var cells = tsvg.selectAll(".cell")
            .data(treemap)
            .enter()
            .append("g")
            .attr("class","cell");

            cells.append("rect")
              .attr("x", function(d){ return d.x;})
              .attr("y", function(d){ return d.y;})
              .attr("width", function(d){ return d.dx;})
              .attr("height", function(d){ return d.dy;})
              .attr("fill", function(d){ return d.children ? null : color(d.name)})
              .attr("stroke", "#fff");

              cells.append("text")
                .attr("x", function(d){ return d.x + d.dx / 2;})
                .attr("y", function(d) { return d.y + d.dy / 2;})
                .attr("text-anchor", "middle")
                .text(function(d) { return d.name;})

                cells.attr("transform", "translate(" + 100 + "," + margin.right + ")");


        function position() {
        this.style("left", function(d) {
          return d.x + "px"; })
            .style("top", function(d) { return d.y + "px"; })
            .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
            .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
      }

}

this.updateViz = function () {

        var that = charts.spells;
       // remove all previous items before render
        svg["spells"].selectAll('*').remove();
        svg["legend"].selectAll('*').remove();

          that.type.filter(function(d){
           if(that.names.indexOf(d) >= 0)
              return true;
            return false;
          })

           var abstByDate = nestByDate.entries(that.date.top(Infinity));

          /*
                  Legend for Abstraction Graph
          */

        var legendSpace = width/that.abst.length;

        var legend = svg["legend"].selectAll('g')
              .data(that.abst)
             .enter()
            .append('g')
              .attr('class', 'legend')
              .attr("transform", function(d,i) {
                          return "translate(" + ((legendSpace/2) + (i * legendSpace)) + ",0)"; })
              ;


          legend.append('circle')
              .attr("r","0.4em")
              .style('fill', function(d,i) {
                return that.color(d);
              });

          legend.append('text')
              .attr("dy",4)
                .attr("dx",".52em")
                .attr("text-anchor", "start")
              .text(function(d,i){ return d; });


        this.Cbrush = d3.svg.brush()
                            .x(that.xC)
                            .y(that.yC)
                           .on("brushend",  _.bind(brushmend, this));

        svg["spells"].append("g")
            .attr("class", "spellbrush")
            .call(this.Cbrush)
          .selectAll('rect')
            .attr('height', that.height);

        /*
              Legend Ends -- Abstraction Graph Begins
         */

        //x.domain(["0","23"]);
          bubbles = svg["spells"].selectAll(".bubbles")
                      .data(abstByDate, function(d) { return d.key; })
                      .enter( ).append("g")

                      .attr("class", "g")
                      .attr("transform", function(d) {
                          return "translate(" + 10 + ",0)"; })
                       .attr("clip-path", "url(#clip)");


        bubbles2  = bubbles.selectAll(".types")
                    .data(function(d){ return d.values;})
                      .enter().append("g")

                  .attr("class", "types");



        bubbles3 = bubbles2.selectAll(".bubbles")
                  .data(function (d) {
                  return d.values; })
                      .enter().append("circle")

                      .attr("class", "bubbles")
                      .attr("cy", function(d) {return that.yC(d.days)})
                      .attr("cx", function(d) {
                        return that.xC(d.minutes);
                      })
                      .attr("fill", function(d){
                        return that.color(d.ABSTRACTIONTYPE);

                      })
                      .attr("r", function(d) { return (r = Math.log(d.ABSTRACTIONVALUE) * 2 )})

                       .style("opacity", function(d) {
                        return that.oScore[d.ABSTRACTIONTYPE]*2;
                        });

                      bubbles3.on('mouseover.tooltip', function(pD, pI){
                        var bodyNode = bubbles3.node();
                        var html = d3.functor('');
                            var absoluteMousePos = d3.mouse(bodyNode);
                            tooltipDiv.style({
                                left: (absoluteMousePos[0] + 5)+'px',
                                top: (absoluteMousePos[1]) + 'px',
                                'background-color': '#d8d5e4',
                                width: '185px',
                                height: '50px',
                                padding: '5px',
                                position: 'absolute',
                                'z-index': 1001,
                                'box-shadow': '0 1px 2px 0 #656565',
                                'visibility': 'visible',
                                'opacity': 0.9
                            });

                            var first_line = '<p class="ttext" ><strong>' + pD.ABSTRACTIONTYPE + '</strong>   for ' + pD.ABSTRACTIONVALUE  + ' Secs. </p><br />';
                            var second_line = '<p class="ttext">Time: ' + formatDate(pD.ACTUALSTARTTIME) + ' '+ formatTime(pD.ACTUALSTARTTIME) + '</p><br />';
                             tooltipDiv.html(first_line + second_line);
                        })
                      .on("mouseover.stroke",  function() {
                        var sel = d3.select(this);
                        sel.style({'stroke': 'black', 'stroke-width': 3});
                      })
                      .on('mousemove.tooltip', function(pD, pI){
                            // Move tooltip
                            var bodyNode = bubbles3.node();

                            var absoluteMousePos = d3.mouse(bodyNode);
                            tooltipDiv.style({
                                left: (absoluteMousePos[0] + 5)+'px',
                                top: (absoluteMousePos[1])+'px'
                            });
                      })
                      .on("mouseout.tip", function(){
                                d3.select(this).style("stroke-width", 0);
                                // d3.select("#stronggraph").selectAll("div").remove();
                               })
                              .on('mouseout.tooltip', function(pD, pI){
                                // Remove tooltip
                                var bodyNode = bubbles3.node();
                                var absoluteMousePos = d3.mouse(bodyNode);
                                tooltipDiv.style({

                                        'opacity': 0
                                    });
                      });

            bubbles3.transition()
            .duration(500);

            bubbles3.on('mousedown', function(){
              brush_elm = svg["spells"].select(".brush").node();
              new_click_event = new Event('mousedown');
              new_click_event.pageX = d3.event.pageX;
              new_click_event.clientX = d3.event.clientX;
              new_click_event.pageY = d3.event.pageY;
              new_click_event.clientY = d3.event.clientY;
              brush_elm.dispatchEvent(new_click_event);
            });

        svg["spells"].append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(-10,0)")
            .call(that.yCAxis);

        svg["spells"].append("g")
            .attr("class", "x axis")
            //.attr("clip-path", "url(#clip)")
            .attr("transform", "translate(10," + that.height + ")")
            .call(that.xCAxis);

        svg["spells"].append("defs").append("clipPath")
                      .attr("id", "clip")
                      .append("rect")
                      .attr("transform", "translate(-10,-20)")
                      .attr("width", that.width + 30)
                      .attr("height", that.height + 20);

    }

// function reset_axis(input) {
//  var that = input;

//  if (that.localName === "spellsLin") {
//   var canvas = that.svg.slinear;

//   canvas.transition().duration(500)
//    .select(".x.axis")
//    .call(

//     that.xLAxis

//     );

//  }
//   else {
//     var t = this;
//     var canvas = that.svg.spells;
//   canvas.transition().duration(500)
//    .select(".x.axis")
//    .call(charts.spells.xCAxis);
//  }
// }

// function brushmove() {

//   var that = this;
//     var e = brush.extent();

//     d3.selectAll(".spellsbrush").call(brush);

//   bubbles.classed("selected", function(d) {
//     is_brushed = e[0] <= d.ACTUALSTARTTIME && d.ACTUALSTARTTIME <= e[1];
//     return is_brushed;
//   });
// }

// function brushend() {


//   var that = this;

//   this.pq = this;

//   if (this.pq.localName === "linear") {

//     if(brush.empty()) {
//       charts.spells.xL.domain(charts.spells.ext)
//       transition_data(this.pq);
//       reset_axis(pq);
//     }

//     charts.spells.xL.domain(pq.brush.extent());


//     transition_data(pq);
//     reset_axis(pq);

//   } else {
//   that.xC.domain(that.Cbrush.empty() ? that.xC.domain() : that.Cbrush.extent());

//   if (that.Cbrush.empty()) {
//     that.xC.domain(["0","23"]);
//     //transition_data();
//     updateViz()
//     reset_axis();
//   }
//       //x.domain(brush.extent());

//       updateViz()
//       reset_axis();

//       if (that.Cbrush.empty()) d3.selectAll(".selected").classed("selected", false);
//       d3.select(".spellbrush").call(that.Cbrush.clear());

//   }




// }

function brushmend() {

 var that = this;

  charts.spells.xC.domain(that.Cbrush.empty() ? charts.spells.xC.domain() : that.Cbrush.extent());

  if (that.Cbrush.empty()) {
    charts.spells.xC.domain(["0","23"]);
    //transition_data();
    that.updateViz()
  }
      //x.domain(brush.extent());

      that.updateViz()


      if (that.Cbrush.empty()) d3.selectAll(".selected").classed("selected", false);
      d3.select(".spellmbrush").call(that.Cbrush.clear());
}


}  // ends streamGraph()



function Chart(options) {

    var that = this;
              this.chartData = options.data;
              this.width = options.width;
              this.height = options.height;
              this.svg = options.svg;
              this.id = options.id;
              this.name = options.name;
              this.margin = options.margin;
              this.ext = options.minmax;

    var localName = this.name;

        this.setColor = function() {
                switch (localName) {
                   case 'ri_pause': return that.z = d3.scale.linear().domain([00, 40]).interpolate(d3.interpolateLab).range(["white", "purple"]);
                        break;
                   case 'hr' : return that.z = d3.scale.linear().domain([00, 40]).interpolate(d3.interpolateLab).range(["white", "red"]);
                        break;
                   case 'spo2': return that.z = d3.scale.linear().domain([00, 40]).interpolate(d3.interpolateLab).range(["white", "lightblue"]);
                        break;
                    default: that.z = d3.scale.linear().domain([00, 40]).interpolate(d3.interpolateLab).range(["white", "black"]);
                };
        }

          this.setColor();

          this.xScale = d3.time.scale().range([0, width]);

          this.yScale = d3.scale.ordinal()
            .rangeRoundBands([height, 0], .05);

          var xS = this.xScale;
          var yS = this.yScale;

          this.brush = d3.svg.brush()
            .x(xS)
            .on("brush", _.bind(this.brushmove, this) )
            .on("brushend", _.bind(this.brushend, this));

          this.xAxis = d3.svg.axis()
            .scale(xS)
            .orient("bottom")
            ;

          this.yAxis = d3.svg.axis()
            .scale(yS)
            .orient("left")
            .tickFormat(d3.format("d"));

          this.xCAxis = d3.svg.axis().scale(this.xC).orient("bottom"),
          this.yCAxis = d3.svg.axis().scale(this.yC).orient("left");


      /*
        We are creating the chart here.
        First the groups are initiated, followed by rect appends.
       */

        var binNames = d3.keys(this.chartData[0]).filter(function(key) {
                                return key != "0"
                                  && key != "DAY"
                                  && key != "PATIENT"
                                  && key != "HOUR"
                                  && key != "TYPE"
                                  && key != "UN"; });
        var maxBins = binNames.length;
          //preprocess dates and separate keyvals for d3 render
          this.chartData.forEach( function(d) {
                            d.DAY = d.DAY.concat(" " + d.HOUR + ":00");
                            d.DAY = parseDate(d.DAY);
                            d.values = [];
                               for (var b=0; b < maxBins; b++) {
                                    d.values.push( parseInt(d[+binNames[b]],10));
                                  };
                        });

          this.m = this.chartData.map(function(d){ return d.DAY });
          this.m.push(new Date((+this.m[this.m.length-1] - +this.m[this.m.length-2]) + +this.m[this.m.length-1]));

          this.ext = d3.extent(this.m);
              yS.domain(binNames);
              xS.domain(this.ext);

          this.ticks = yS.domain().filter(function(d,i){ return !(i%2); } );
          this.yAxis.tickValues( this.ticks );

          this.ylable = this.svg.append("g")
              .attr("class", "y axis")
              .call(this.yAxis)
              .append("text")
              .attr("transform", "rotate(-90) translate(-50,-40)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end");

              if (localName === 'ri_pause') this.ylable.text("Duration of Pause (Sec.)");
               else if (localName === 'hr') this.ylable.text("Heart Rate Breaches (%)");
               else if (localName === 'spo2') this.ylable.text("SpO₂ Breaches (%)");

          this.physMap = this.svg.selectAll(".physMap")
              .data(this.chartData)
              .enter( ).append("g")
              .attr("class", "physMap")
              ;

          this.mapBins = this.physMap.selectAll(".bin")
                .data(function (d) {
                      return d.values;
                      })
                .enter();

          this.mapBins.append("rect")
                .attr("clip-path", "url(#clip)")
                .attr("class", "bin" + localName)
                .attr("transform",
                  (localName === "ri_pause") ? "translate(" + 2 + "," + (5) + ")" : "translate(" + 2 + "," + (1) + ")"

                  )
                .attr("x", function(d,i,j){
                              return xS(this.parentNode.__data__.DAY);
                           })
                .attr("y", function(d,i,j) {
                              return yS(binNames[i]);
                            })
                .attr("height", yS.rangeBand())
                .attr("width", this.width / this.chartData.length)
                .style("fill", function(d) {
                  return that.z(d); });

            this.svg.append("defs").append("clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("width", this.width)
                .attr("height", this.height + 20);

            this.svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(2," + (height) + ")")
                .call(this.xAxis);

            this.svg.append("g")
               .attr("class", "y axis")
               .call(this.yAxis);

            this.svg.append("g")
               .attr("class", "brush")
               .call(this.brush)
               .selectAll('rect')
               .attr('height', height);

            this.physMap.on('mousedown', function(){
                brush_elm = this.svg.select(".brush").node();
                new_click_event = new Event('mousedown');
                new_click_event.pageX = d3.event.pageX;
                new_click_event.clientX = d3.event.clientX;
                new_click_event.pageY = d3.event.pageY;
                new_click_event.clientY = d3.event.clientY;
                brush_elm.dispatchEvent(new_click_event);
              });


}




var brushCell;

  // Clear the previously-active brush, if any.
  function brushstart(p) {
    if (brushCell !== this) {
      d3.select(brushCell).call(brush.clear());
      // x.domain(x(p.DAY));
      brushCell = this;
      console.log("changed cell") // yeah this clears the original brush
    }
  }

  // Highlight the selected bins.
 Chart.prototype.brushmove = function(p) {

  var that = this;
    var e = this.brush.extent();

    d3.selectAll(".brush").call(this.brush);

    d3.selectAll(".physMap").classed("masked", function(d) {
      return e[0] > d.DAY || d.DAY > e[1];
    });


  }

  // If the brush is empty, select all bins.
Chart.prototype.brushend = function(p) {

    var that = this;

    charts.spells.Cbrush.extent = that.brush.extent;
    //charts.spells.Lbrush.extent = that.brush.extent;
    //charts.spells.xC.domain([0,23]);
    //charts.spells.xC.domain([charts.spells.Cbrush.extent()[0].getHours(), charts.spells.Cbrush.extent()[1].getHours()]);
    charts.spells.yC.domain([charts.spells.Cbrush.extent()[0].getDate()-0.8, charts.spells.Cbrush.extent()[1].getDate()+0.8]);
    charts.spells.updateViz();

    //linGraph.brush.extent = that.brush.extent;


    linGraph.transition1_data(that);
    linGraph.reset_axis();

    var cz = d3.scale.linear()
            .domain([00, 50])
            .interpolate(d3.interpolateLab);
      cz.range(["white", "black"]);

          if (that.brush.empty()) { d3.selectAll(".masked").classed("masked", false);
             d3.selectAll(".physMap").selectAll(".binri_pause").style("fill", function(d){ return charts.ri_pause.z(d) });
             d3.selectAll(".physMap").selectAll(".binhr").style("fill", function(d){ return charts.hr.z(d) });
             d3.selectAll(".physMap").selectAll(".binspo2").style("fill", function(d){ return charts.spo2.z(d) });
            charts.spells.yC.domain(["7","18"]);
            charts.spells.xC.domain(["0","23"]);
            charts.spells.updateViz();
          }

    d3.selectAll("#ri_pause").selectAll(".physMap").selectAll("rect").style("fill", function(d) {
      return charts.ri_pause.z(d)});
    d3.selectAll("#hr").selectAll(".physMap").selectAll("rect").style("fill", function(d) {
      return charts.hr.z(d)});
    d3.selectAll("#spo2").selectAll(".physMap").selectAll("rect").style("fill", function(d) {
      return charts.spo2.z(d)});
    d3.selectAll(".physMap.masked").selectAll("rect").style("fill", function(d) { return cz(d)});

  }

    clearMap = function () {
          svg.selectAll("*")
            .remove();
    };

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};


