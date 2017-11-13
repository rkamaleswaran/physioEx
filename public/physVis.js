
      var socket = io();
      var parseDate = d3.time.format("%Y-%m-%d %H:%M").parse;
      var parseDate2 = d3.time.format("%Y-%m-%d %H:%M:%S.0").parse;

      var parseDate3 = d3.time.format("%Y-%m-%d-%H.%M.%S.000000").parse;

    var hellp;

    var currentPtID, patientID;


      d3.json("data/instances.json", function(err, data){

        var patientList = [];
        var patList = {};

        data.forEach(
          function(d) {
            patientList.push(d.PATIENT_ID + " [" + d.INSTANCE + "]");

          });

        var nestedInts = d3.nest().key(function(d) {return d.PATIENT_ID;}).entries(data); // nesting instaces by patient id hierarchy
        var curInstance = {};
         function getPatients(e){
            currentPtID = e;
            console.log("Getting data for patientid: %s", e);
            for (l in nestedInts)
            {
              if (nestedInts[l].key === e)
              {
                curInstance = nestedInts[l].values;
                console.log (nestedInts[l].values);
              }
            }
            $("#ptSearch").ready(function(){
                  for( inst in curInstance )
                    {
                      $('.dropdown-menu').append('<li role="presentation"><a role="menuitem" tabindex="-1" data-inp="' + curInstance[inst].INSTANCE + '" data-start="' + curInstance[inst].STARTDATE + '" data-end="' + curInstance[inst].ENDDATE + '" href="#">' + curInstance[inst].INSTANCE + '</a></li>');
                    }
                  $('a').on('click', function(){

                    var inp = $(this).attr('data-inp'); // Get Instance ID

                    var obj = {};
                    obj.startdate = $(this).attr('data-start');
                    obj.enddate = $(this).attr('data-end');
                    obj.patient = currentPtID;

                    if (obj.startdate) {
                      //socket.emit('getInstData', obj);
                      patientID = obj.patient;
                      if (svg)
                        {
                          svg["slinear"].selectAll('*').remove();
                          svg["ri_pause"].selectAll('*').remove();
                          svg["hr"].selectAll('*').remove();
                          svg["spo2"].selectAll('*').remove();
                          svg["spells"].selectAll('*').remove();
                          svg["sstacked"].selectAll('*').remove();
                         // svg["legend"].selectAll('*').remove();
                          //d3.selectAll(".tooltip").remove();
                          // svg["hrchart"].selectAll('*').remove();
                          // svg["irwchart"].selectAll('*').remove();
                          // svg["spo2chart"].selectAll('*').remove();

                        }
                      d3.selectAll("ul.check").remove();
                       createChart(patientID,inp);
                      //console.log(obj);
                      }
                  });

                });
            console.log("This patient has %d number of instance(s)!", curInstance.length);
            // d3.event.preventDefault();
         }

         // jquery version:
         d3.select("#theForm").on("submit", function() {
              var inp = d3.select("#theInput").node();
              var v = inp.value.trim();
              // inp.property("value", "");
              if (v) {
                d3.event.preventDefault();
                getPatients(v);
                this.reset();
                console.log("i'm done");
              }
              //

            });
      });


    var margin = {top: 10, right: 20, bottom: 20, left: 60},
    width = (640 - margin.left - margin.right),
    height = (200 - margin.top - margin.bottom),
    sheight = (200 - margin.top - margin.bottom),
    width2 = 640 - margin.top - margin.bottom,
    height2 = 40 - margin.top - margin.bottom;


    var formatDate = d3.time.format("%B %d, %Y");
    var datearray = [];

    var crumbDiv = d3.select('#lineargraph')
                                   .append('div')
                                   .attr('class', 'crumb');

    var tooltipDiv = d3.select('#streamgraph')
                                   .append('div')
                                   .attr('class', 'tooltip');

    var tooltipStk = d3.select('#sstacked')
                                   .append('div')
                                   .attr('class', 'tooltip');

    var tooltipLin = d3.select('#lineargraph')
                                   .append('div')
                                   .attr('class', 'tiplin');

    var symbol = d3.scale.ordinal().range(["cross", "triangle-up"]);

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

      var nestByAggDate2 = d3.nest()
      .key(function(d) {
                   var tmpDate = new Date (d.ACTUALSTARTTIME);
                                    tmpDate.setHours(0);
                                    tmpDate.setMinutes(0);
                                    tmpDate.setSeconds(0);
                                    tmpDate.setMilliseconds(0);
                          return tmpDate;
          })
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


      patientID = currentPtID;
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
                        .attr("height", sheight + margin.top + margin.bottom + 30)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      svg["slinear"] = d3.select("#lineargraph").append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", sheight + margin.top + margin.bottom + 30)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

       svg["sstacked"] = d3.select("#sstacked").append("svg")
                        .attr("class", "stack")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", sheight + margin.top + margin.bottom - 40)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg["irwchart"] = d3.select("#graphs").append("svg");
        svg["hrchart"] = d3.select("#graphs").append("svg");
        svg["spo2chart"] = d3.select("#graphs").append("svg");


      // svg["legend"] = d3.select("#legend").append("svg")
      //     .attr("width", width2 + margin.right )
      //     .attr("height", height2 + margin.bottom)
      //     .append("g")
      //     .attr("class", "legend")
      //     .attr("transform", "translate(" + (margin.left ) + "," + margin.top + ")");

var charts = {};

  function createChart (a,b) {



                // mxGraph = {};
                // linGraph = {};
                // stackGraph = {};


          // if(!(_.isEmpty(charts))) {
          //   charts = {};
          // }

          patientID = a;
          Curinstance = b;

          this.graphs = ["ri_pause","hr","spo2", "spells", "linear", "stacked"];
          this.infections = [];

            d3.json("data/infections.json", function(err, data) {

              //console.log(data[0]);

           data.forEach(function(d){
              // new Date(year, month, day, hours, minutes, seconds, milliseconds);
              d.DATE = parseDate2(d.DATE);
              //d.DATE = new Date(+("20"+d.DATE.substring(6,8)),d.DATE.substring(0,2)-1,d.DATE.substring(3,5),d.DATE.substring(9,11),d.DATE.substring(12,14),d.DATE.substring(15,17))

              if (d.PATIENTID===patientID) {
                var infection = {};
                infection.date = d.DATE;
                infection.type = d.TYPE;
                infection.event = d.EVENT;
              this.infections.push(infection);
              }
              console.log(d);
            })

          })

          for (var i = 0; i < this.graphs.length; i++) {

                    (function(c) {
                      var name = graphs[i];
                      var n = i;
                      d3.json("data/" + patientID + "_" + Curinstance + "_breaching_" + ((name==="linear" || name==="stacked") ? "spells" : name) + ".json", function (error, data) {

                              if (name === "spells" || name === "linear" || name === "stacked") {


                                    charts[name] = (new streamGraph({
                                                        data: data,
                                                        id: n,
                                                        name: name,
                                                        width: width,
                                                        height: sheight,
                                                        svg: svg[name],
                                                        margin: margin,
                                                        infections : this.infections
                                                      }));
                              } else {
                                  charts[name] = (new Chart({
                                                        data: data,
                                                        id: n,
                                                        name: name,
                                                        width: width,
                                                        height: height,
                                                        svg: svg[name],
                                                        margin: margin,
                                                        infections : this.infections
                                                      }));
                                }
                            });
                    })(i);
              }
          }

  //createChart(patientID);

function streamGraph(options){

  var that = this;
              this.chartData = options.data;
              this.width = options.width;
              this.height = options.height;
              this.svg = options.svg;
              this.id = options.id;
              this.name = options.name;
              this.margin = options.margin;
              this.infections = options.infections;
              this.abst = [];

    this.ext = d3.extent(this.chartData.map(function(d){return parseDate3(d.ACTUALSTARTTIME);}));
    var localName = this.name;

          this.chartData = this.chartData.filter(function (d) {return d.ABSTRACTIONTYPE !== "Iso RI pause" && d.ABSTRACTIONTYPE !== "Unclassified"});

           this.chartData.forEach( function (d) {
            d.ACTUALSTARTTIME =  parseDate3(d.ACTUALSTARTTIME);
            d.days = d.ACTUALSTARTTIME;
            d.minutes = d.ACTUALSTARTTIME.getHours();
            d.ACTUALENDTIME =  parseDate3(d.ACTUALENDTIME);
            //d.ABSTRACTIONVALUE = parseInt(d.ABSTRACTIONVALUE, 10);
            d.ABSTRACTIONVALUE = parseFloat(d.ABSTRACTIONVALUE)
          }
          );

           this.cf = crossfilter(this.chartData);




          this.xC = d3.scale.linear().range([0, this.width]);
          // this.yC = d3.scale.linear().range([(this.height+30), 0]);
          this.yC = d3.scale.linear().range([(this.height+30), 0]);

          this.xCa = d3.scale.linear().range([0, this.width]);
          this.yCa = d3.time.scale().range([this.height, 0]).domain(this.ext);

          this.yCaAxis = d3.svg.axis()
                        .scale(this.yCa)
                        .orient("left")
                        .ticks(4)
                        //.ticks(d3.time.months.utc, 1)
                        .tickFormat(d3.time.format.utc('%d %m'));

          this.yext = d3.extent(that.chartData.map(function(d){return d.ABSTRACTIONVALUE;}));

           this.xL = d3.time.scale().range([0, this.width]).domain(this.ext);
           this.yL = d3.scale.log().range([this.height+30, 0]).domain(this.yext);

           this.xSc = d3.time.scale().range([0, this.width]).domain(this.ext);
           this.ySc = d3.scale.linear().range([(this.height - 40), 0]).domain([0,150]);

          this.xCAxis = d3.svg.axis().scale(this.xC).orient("bottom"),
          this.yCAxis = d3.svg.axis().scale(this.yC).orient("left").ticks(6).tickFormat(d3.format("4f"));

          var formatSi = d3.format("4d");

          this.xLAxis = d3.svg.axis().scale(this.xL).orient("bottom"),
          this.yLAxis = d3.svg.axis().scale(this.yL).orient("left").ticks(8, ".2");


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

       // this.color = d3.scale.ordinal()
      // .domain(["Central", "Central Obs.", "Iso Brady", "Iso. Desat", "Pos. Iso. Brady", "Pos. Iso. Desat", "Vagal"])
      // .range(["#feb24c", "#f03b20" , "#d62728" , "#045a8d" , "#FFC8D0", "#d0d1e6" , "#006633"]);


       this.color = d3.scale.ordinal()
      .domain(["Central", "Central Obs.", "Iso Brady", "Iso. Desat", "Pos. Iso. Brady", "Pos. Iso. Desat", "Vagal"])
      .range(["#9169AB", "#C3AFD5", "#D51632" , "#0079AD" , "#FFC9D4", "#AAC6E6" , "#339D46"]);

      var btD = that.date.bottom(1)[0];
      var tpD = that.date.top(1)[0];

      this.mxDays = [btD.ACTUALSTARTTIME.getDate()-1, tpD.ACTUALSTARTTIME.getDate()+1]
      //

      var lowDateMonth = (btD.ACTUALSTARTTIME);
      var topDateMonth = (tpD.ACTUALSTARTTIME);

      this.mxaDays = [lowDateMonth, topDateMonth];

      this.xC.domain(["0","23"]);
      this.yC.domain(this.mxDays);
      this.yCa.domain(this.mxaDays);

      this.display = d3.select("#check");

      this.names = ["Central", "Central Obs.", "Vagal", "Iso Brady", "Pos. Iso. Brady", "Iso. Desat", "Pos. Iso. Desat"];



             var that = this;
             if(this.name === "spells"){
              this.checks = this.display.append("ul")
                .classed("check", true)
                .selectAll("ul.check")
                .data(this.names)
                .enter()
                .append("li")

              // this.checks = this.display.append("div").classed().selectAll("div.check")

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
                // console.log(that.names);

                mxGraph.update();
                linGraph.update(that.names);
                stackGraph.createStackChart(that.names);
              })

            this.checks.append("span")
              .text(function(d) {
                return d; });

            this.checks.append("div")
            .attr("class", function(d) {

              if ( d === "Central") {
                return "Central";
              } else if ( d === "Central Obs.") {
                return "Central-Obs";
              } else if (d === "Iso Brady") {
                return "Iso-Brady";
              } else if (d === "Iso. Desat") {
                return "Iso-Desat";
              } else if (d === "Pos. Iso. Brady") {
                return "Pos-Iso-Brady";
              } else if ( d === "Pos. Iso. Desat") {
                return "Pos-Iso-Desat";
              } else {
              return d;
            };

            });

              mxGraph = new createMatrixViz(that);

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

                  this.height += 30;

                  if(that.brush.empty()) {
                        charts.linear.xL.domain(charts.spells.ext)
                      }


                  svg["slinear"].selectAll(".scatter").data(data)
                  .transition()
                    .duration(500)
                    .attr("cx", function(d) { return charts.linear.xL(d.ACTUALSTARTTIME); });

                  svg["slinear"].selectAll(".point").data(infections)
                  .transition()
                    .duration(500)
                    .attr("transform", function(d) { return "translate(" + charts.linear.xL(d.date) + "," + (sheight - 10) + ")"; });
                  }

                 this.transition1_data = function(tpq) {

                  var self = tpq;
                  var that = this;

                  if(self.brush.empty()) {
                        charts.linear.xL.domain(charts.spells.ext)
                      } else  {
                        charts.linear.xL.domain(self.brush.extent());
                      }

                  svg["slinear"].selectAll(".scatter").data(data)
                  .transition()
                    .duration(500)
                    .attr("cx", function(d) { return charts.linear.xL(d.ACTUALSTARTTIME); });

                  svg["slinear"].selectAll(".point").data(infections)
                  .transition()
                    .duration(500)
                    .attr("transform", function(d) { return "translate(" + charts.linear.xL(d.date) + "," + (sheight - 10) + ")"; });
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
                    //svg["slinear"].selectAll('*').remove();

                    this.localName = that.name;

                      that.type.filter(function(d){
                       if(that.names.indexOf(d) >= 0)
                          return true;
                        return false;
                      })

                      var maxmin = [that.date.bottom(1)[0].ACTUALSTARTTIME, that.date.top(1)[0].ACTUALSTARTTIME]

                      that.xL.domain(maxmin)

                      var abstByDate = nestByDate.entries(that.date.top(Infinity));

                       var data = that.date.top(Infinity);

                        var counter = {};

                       data.forEach(function(d) {

                        if (counter[d.ABSTRACTIONTYPE]) {
                          counter[d.ABSTRACTIONTYPE] += 1;
                        } else {
                          counter[d.ABSTRACTIONTYPE] = 1;
                        }
                       })

                       // data.forEach(function(d){

                       //    switch(d.ABSTRACTIONTYPE) {
                       //      case "Pos. Iso. Desat":
                       //        d.sigEvent = 0;
                       //        break;
                       //      case "Pos. Iso. Brady":
                       //        d.sigEvent = 0;
                       //        break;
                       //      case "Iso Brady":
                       //        d.sigEvent = 1;
                       //        break;
                       //      case "Iso. Desat":
                       //        d.sigEvent = 1;
                       //        break;
                       //      case "Central":
                       //        d.sigEvent = 2;
                       //        break;
                       //      case "Central Obs.":
                       //        d.sigEvent = 2;
                       //        break;
                       //      case "Vagal":
                       //        d.sigEvent = 2;
                       //        break;
                       //      default:
                       //        d.sigEvent = 2;
                       //    }

                       //  });


                      // function comparor(a,b) {
                      //   if (a.sigEvent < b.sigEvent)
                      //     return -1;
                      //   else if (a.sigEvent > b.sigEvent)
                      //     return 1;
                      //   else
                      //     return 0;
                      // }

                      // data.sort(comparor);
                      //


                      function compareVals(a,b) {

                        if (counter[a.ABSTRACTIONTYPE] > counter[b.ABSTRACTIONTYPE])
                          return -1;
                        else if (counter[a.ABSTRACTIONTYPE] < counter[b.ABSTRACTIONTYPE])
                          return 1;
                        else
                          return 0;
                      }

                      data.sort(compareVals);

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

                      var tooltipDiv = d3.select('#streamgraph')
                                   .append('div')
                                   .attr('class', 'tooltip');

                      this.scatter = svg["slinear"].selectAll(".scatter")
                                    .data(data)
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
                                      return that.oScore[d.ABSTRACTIONTYPE]*20;
                                      })

                                     this.scatter.on('mouseover.tooltip', function(pD, pI){
                                        var hrData, irwData, spo2Data;

                                        var self = this;
                                        var html = d3.functor('');
                                            var absoluteMousePos = d3.mouse(self.parentNode.parentNode.parentNode);
                                            tooltipDiv.style({
                                                left: (absoluteMousePos[0] + 5)+'px',
                                                top: (absoluteMousePos[1]) + 'px',
                                                'background-color': '#d8d5e4',
                                                width: '225px',
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
                                                          var third_line = '<div id="tipcrumb"></div>'
                                                          //add the hover HR chart here
                                             tooltipDiv.html(first_line + second_line + third_line);

                                        })
                                      .on("mouseover.stroke",  function() {
                                        var sel = d3.select(this);
                                        sel.style({'stroke': 'black', 'stroke-width': 2});
                                      })
                                      .on("mouseout.tip", function(){
                                                d3.select(this).style("stroke-width", 0);
                                                // d3.select("#stronggraph").selectAll("div").remove();
                                               })
                                    //   .on('mousemove.tooltip', function(pD, pI){
                                    //         // Move tooltip

                                    //         var self = this;
                                    //         var absoluteMousePos = d3.mouse(self.parentNode.parentNode.parentNode);
                                    //         tooltipDiv.style({
                                    //             left: (absoluteMousePos[0] + 5)+'px',
                                    //             top: (absoluteMousePos[1])+'px'
                                    //         });
                                    //   })

                                              .on('mouseout.tooltip', function(pD, pI){
                                                // Remove tooltip
                                                var self = this;
                                                var absoluteMousePos = d3.mouse(self.parentNode.parentNode.parentNode);
                                                tooltipDiv.style({
                                                        left: (absoluteMousePos[0] + 5)+'px',
                                                        top: (absoluteMousePos[1])+'px',
                                                        'opacity': 0
                                                    });
                                    })

                                              ;



                          this.scatter.transition()
                          .duration(500);

                          this.scatter.on('mousedown', function(pD, pI){

                            var self = this;
                             socket.emit('getPtData', obj = {pID : patientID, date: (pD.ACTUALSTARTTIME.getTime()/1000), duration: pD.ABSTRACTIONVALUE});

                                            var absoluteMousePos = d3.mouse(self.parentNode.parentNode.parentNode);
                                            crumbDiv.style({
                                                left: (absoluteMousePos[0] - 400)+'px',
                                                top: (absoluteMousePos[1] - 120) + 'px',
                                                'background-color': '#fff',
                                                width: '410px',
                                                height: '390px',
                                                padding: '5px',
                                                position: 'absolute',
                                                'z-index': 1001,
                                                'box-shadow': '0 1px 2px 0 #656565',
                                                'visibility': 'visible',
                                                'opacity': 1.0
                                            });
                                                          var first_line = '<p class="ttext" ><strong>' + pD.ABSTRACTIONTYPE + '</strong>  (' + pD.ABSTRACTIONVALUE  + ' Secs.)  Time: ' + formatDate(pD.ACTUALSTARTTIME) + ' '+ formatTime(pD.ACTUALSTARTTIME) + '</p><br />';
                                                          var second_line = '';
                                                          var third_line = '<div id="tipcrumb"></div>'
                                                          //add the hover HR chart here
                                             crumbDiv.html(first_line + second_line + third_line);
                          });

                      this.scatter.on('mousemove.crumb', function() {

                        var self = this;
                          var absoluteMousePos = d3.mouse(self.parentNode.parentNode.parentNode);
                          crumbDiv.style({
                                  left: (absoluteMousePos[0] + 5)+'px',
                                  top: (absoluteMousePos[1])+'px',
                                  'opacity': 0,
                                  'visibility': 'hidden'
                              });

                        // brush_elm = svg["slinear"].select(".spellslinbrush").node();
                        //     new_click_event = new Event('mousedown');
                        //     new_click_event.pageX = d3.event.pageX;
                        //     new_click_event.clientX = d3.event.clientX;
                        //     new_click_event.pageY = d3.event.pageY;
                        //     new_click_event.clientY = d3.event.clientY;
                        //     brush_elm.dispatchEvent(new_click_event);
                      })

                      irwGraph();
                      HRGraph();
                      SPO2Graph();

                      yAxSvg = svg["slinear"].append("g")
                          .attr("class", "y axis")
                          .attr("transform", "translate(-10,0)")
                          .call(that.yLAxis);


                           // build the visal object for infection
                        svg["slinear"].selectAll(".point")
                            .data(infections)
                          .enter().append("path")
                            .attr("class", "point")
                            .attr("transform", function(d) { return "translate(" + that.xL(d.date) + "," + (sheight - 10) + ")"; })
                              .attr("d",  d3.svg.symbol().size(50).type(function (d, i) {
                                   switch (d.type) {
                                       case "NE": return symbol(0);
                                       case "FUC": return symbol(1);
                                   }
                                   return symbol(i);
                               }))
                              .attr("fill", "red");

                      xAxSvg = svg["slinear"].append("g")
                          .attr("class", "x axis")
                          //.attr("clip-path", "url(#clip)")
                          .attr("transform", "translate(10," + (that.height + 20) + ")")
                          .call(that.xLAxis);

                      this.clipSvg =svg["slinear"].append("defs").append("clipPath")
                                    .attr("id", "clip")
                                    .append("rect")
                                    .attr("transform", "translate(-10,-20)")
                                    .attr("width", that.width + 30)
                                    .attr("height", that.height + 20);

                 // svg["slinear"].exit().remove();

                  this.update = function(names) {

                      var filter = names;

                      svg["slinear"].selectAll('*').remove();

                      that.type.filter(function(d){
                       if(filter.indexOf(d) >= 0)
                          return true;
                        return false;
                      });

                      var maxmin = [that.date.bottom(1)[0].ACTUALSTARTTIME, that.date.top(1)[0].ACTUALSTARTTIME]

                      that.xL.domain(maxmin)

                      var abstByDate = nestByDate.entries(that.date.top(Infinity));

                       var data = that.date.top(Infinity);

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
                                    .data(data)
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
                                      return that.oScore[d.ABSTRACTIONTYPE]*20;
                                      })

                                     this.scatter.on('mouseover.tooltip', function(pD, pI){
                                        var self = this;
                                        var html = d3.functor('');
                                            var absoluteMousePos = d3.mouse(self.parentNode.parentNode.parentNode);
                                            tooltipLin.style({
                                                left: (absoluteMousePos[0] + 5)+'px',
                                                top: (absoluteMousePos[1]) + 'px',
                                                'background-color': '#d8d5e4',
                                                width: '205px',
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
                                             tooltipLin.html(first_line + second_line);
                                        })
                                      .on("mouseover.stroke",  function() {
                                        var sel = d3.select(this);
                                        sel.style({'stroke': 'black', 'stroke-width': 2});
                                      })
                                      .on('mousemove.tooltip', function(pD, pI){
                                            // Move tooltip

                                            var self = this;
                                            var absoluteMousePos = d3.mouse(self.parentNode.parentNode.parentNode);
                                            tooltipLin.style({
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
                                                var self = this;
                                                var absoluteMousePos = d3.mouse(self.parentNode.parentNode.parentNode);
                                                tooltipLin.style({

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

                          this.yAxSvg = this.scatter.append("g")
                              .attr("class", "y axis")
                              .attr("transform", "translate(-10,0)")
                              .call(that.yLAxis);

                        // build the visal object for infection
                        this.scatter.selectAll(".point")
                            .data(infections)
                          .enter().append("path")
                            .attr("class", "point")
                            .attr("transform", function(d) { return "translate(" + that.xL(d.date) + "," + (sheight - 10) + ")"; })
                              .attr("d",  d3.svg.symbol().size(50).type(function (d, i) {
                                   switch (d.type) {
                                       case "NE": return symbol(0);
                                       case "FUC": return symbol(1);
                                   }
                                   return symbol(i);
                               }))
                               .attr("fill", "red");



                          this.xAxSvg = this.scatter.append("g")
                              .attr("class", "x axis")
                              //.attr("clip-path", "url(#clip)")
                              .attr("transform", "translate(10," + that.height + ")")
                              .call(that.xLAxis);

                          this.clipSvg =this.scatter.append("defs").append("clipPath")
                                        .attr("id", "clip")
                                        .append("rect")
                                        .attr("transform", "translate(-10,-20)")
                                        .attr("width", that.width + 30)
                                        .attr("height", that.height + 20);
                  }

}

function createStackedViz(tap) {

          var that = tap;

              var maxmin = [that.date.bottom(1)[0].ACTUALSTARTTIME, that.date.top(1)[0].ACTUALSTARTTIME]

                  var xScale = d3.time.scale()
                          .domain(maxmin)
                          .range([0, width]);

                  var yScale = d3.scale.linear()
                      // .domain([0,30
                      // ])
                      .range([(sheight-40),0]);

                  var xAxis = d3.svg.axis()
                      .scale(xScale)
                      .orient("bottom");

                  var yAxis = d3.svg.axis()
                      .scale(yScale)
                      .orient("left");

        this.transition_data = function() {

              var that = this;

              if(that.brush.empty()) {
                    xScale.domain(charts.spells.ext)
                  }

              svg["slinear"].selectAll(".scatter").data(charts.linear.chartData)
                  .transition()
                    .duration(500)
                    .attr("cx", function(d) { return charts.linear.xL(d.ACTUALSTARTTIME); });

                  svg["slinear"].selectAll(".point").data(infections)
                  .transition()
                    .duration(500)
                    .attr("transform", function(d) { return "translate(" + charts.linear.xL(d.date) + "," + (sheight - 10) + ")"; });
                  }

         this.transition1_data = function(tpq) {

                var that = tpq;
                var self = this;

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
                  that.height -= 40;

                      // remove all previous items before render
                      svg["sstacked"].selectAll('*').remove();

                      this.localName = that.name;



              this.createStackChart = function(name) {
                      var filter = name;

                      svg["sstacked"].selectAll('*').remove();

                        that.type.filter(function(d){
                         if(filter.indexOf(d) >= 0)
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
                                  d.values[d.values.length] = {key: 0, values: {date: [], count:0, total_time:0} }
                                  d.values[d.values.length-1].key = uniqArray[i];
                                  d.values[d.values.length-1].values.date.push(new Date(uniqArray[i]));
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

                  var m = abstByType.map(function(d){return d.values.map(function(d) {return d.values.count})})
                  var v = [];
                  m.forEach(function(d) { for (i=0; i<d.length; i++ ) {v.push(d[i])} });
                  yScale.domain(d3.extent(v));

                  var stack = d3.layout.stack()
                                  .offset("silhouette")
                                  .values(function(d) {
                                    return d.values; })
                                  .x(function(d) {
                                      return new Date (d.key )})
                                  .y(function(d) { return d.values.count; });

                  var layers = stack(normalizedData);
                  // console.log(layers);
                  var area = d3.svg.area()
                      .interpolate("cardinal")
                      .x(function(d) { return xScale(new Date (d.key)); })
                      .y0(function(d) { return yScale(d.y0); })
                      .y1(function(d) { return yScale(d.y0 + d.y); });

                    this.brush = d3.svg.brush()
                                .x(that.xSc)
                                .on("brushend", _.bind(this.brushlend,this));

                    svg["sstacked"].append("g")
                              .attr("class", "brush")
                              .call(this.brush)
                            .selectAll('rect')
                              .attr('height', that.height);

                    this.stacked = svg["sstacked"]
                              .selectAll(".layer")
                              .data(layers)
                            .enter().append("path")
                              .attr("class", "layer")
                              .attr("d", function(d) { return area(d.values); })
                              .style("fill", function(d, i) { return that.color(d.key); })
                              .attr("transform", "translate(" + 10 + "," + 0 + ")")
                              ;

                      var tooltipStk = d3.select('#sstacked')
                                   .append('div')
                                   .attr('class', 'tooltip');


                        svg["sstacked"].selectAll(".layer")
                                .attr("opacity", 1)
                                .on("mouseover", function(d, i) {
                                  svg["sstacked"].selectAll(".layer").transition()
                                  .duration(250)
                                  .attr("opacity", function(d, j) {
                                    return j != i ? 0.3 : 1;
                                })})

                                .on("mousemove", function(d, i) {
                                  var self = this;
                                  mousex = d3.mouse(self.parentNode.parentNode.parentNode);
                                  mousex = mousex[0];
                                  var invertedx = xScale.invert(mousex);
                                  invertedxd = new Date (invertedx.getFullYear(), invertedx.getMonth(), invertedx.getDate() - 1, invertedx.getHours(),0,0,0);
                                  inverteduti = invertedxd.getTime();


                                  var selected = (d.values);
                                  for (var k = 0; k < selected.length; k++) {
                                    var datetime = selected[k].values.date[0];

                                    normalDate = new Date (datetime.getFullYear(), datetime.getMonth(), datetime.getDate(), datetime.getHours(),0,0,0);
                                    datearray[k] = normalDate.getTime();
                                     //console.log("date time from array: " + datetime + " normalDate: " + normalDate + " UTI: " + datearray[k]);
                                  }

                                  mousedate = datearray.indexOf(inverteduti);
                                  pro = d.values[mousedate].values.count;
                                  time = d.values[mousedate].values.date[0];


                                        var html = d3.functor('');
                                            var absoluteMousePos = d3.mouse(self.parentNode.parentNode.parentNode);
                                            tooltipStk.style({
                                                left: (absoluteMousePos[0] + 5)+'px',
                                                top: (absoluteMousePos[1]) + 'px',
                                                'background-color': '#d8d5e4',
                                                width: '205px',
                                                height: '50px',
                                                padding: '5px',
                                                position: 'absolute',
                                                'z-index': 1001,
                                                'box-shadow': '0 1px 2px 0 #656565',
                                                'visibility': 'visible',
                                                'opacity': 0.9
                                            });

                                            var first_line = '<p class="ttext" ><strong>' + d.key + '</strong>   (' + pro  + ') </p><br />';
                                            var second_line = '<p class="ttext">Time: ' + formatDate(time) + ' '+ formatTime(time) + '</p><br />';
                                             tooltipStk.html(first_line + second_line);

                                  // d3.select(this)
                                  // .classed("hover", true)
                                  // .attr("stroke", that.color(d.key))
                                  // .attr("stroke-width", "0.25px"),
                                  // tooltip.html( "<p>" + d.key + "<br>" + pro + "</p>" ).style("visibility", "visible");

                                })
                                .on("mouseout", function(d, i) {
                                 svg["sstacked"].selectAll(".layer")
                                  .transition()
                                  .duration(250)
                                  .attr("opacity", "1");
                                  d3.select(this)
                                  .classed("hover", false)
                                  .attr("stroke-width", "0px"), tooltipStk.html( "<p>" + d.key + "<br>" + pro + "</p>" ).style("visibility", "hidden");
                              });



                          this.xAxSvg = svg["sstacked"].append("g")
                              .attr("class", "x axis")
                              //.attr("clip-path", "url(#clip)")
                              .attr("transform", "translate(10," + that.height + ")")
                              .call(xAxis);

                         // build the visal object for infection
                          svg["sstacked"].selectAll(".point")
                              .data(infections)
                            .enter().append("path")
                              .attr("class", "point")
                              .attr("transform", function(d) { return "translate(" + xScale(d.date) + "," + yScale(0) + ")"; })
                                .attr("d",  d3.svg.symbol().size(50).type(function (d, i) {
                                     switch (d.type) {
                                         case "NE": return symbol(0);
                                         case "FUC": return symbol(1);
                                     }
                                     return symbol(i);
                                 }))
                                 .attr("fill", "red");


                  }

                    this.createStackChart(that.names);


}

function createMatrixViz(tap) {
          var that = tap;
          //var that = this;
          var localName = that.name;
         // remove all previous items before render
          svg["spells"].selectAll('*').remove();
          //svg["legend"].selectAll('*').remove();

        that.height += 30;

        that.type.filter(function(d){
         if(that.names.indexOf(d) >= 0)
            return true;
          return false;
        })

         var abstByDate = nestByAggDate2.entries(that.date.top(Infinity));

        /*
                Legend for Abstraction Graph
        */


                          // Clean up lost tooltips
                          //d3.select('.body').selectAll('div.tooltip').remove();
                          // Append tooltip

      this.Cbrush = d3.svg.brush()
                          .x(this.xC)
                          .y(this.yC)
                         .on("brushend",  _.bind(brushmend, this));

      svg["spells"].append("g")
          .attr("class", "spellmbrush")
          .call(this.Cbrush)
        .selectAll('rect')
          .attr('height', that.height);

    abstByDate.forEach(function(d) {
        d.values.forEach( function(d) {
          d.values.forEach( function(d) {
            d.values.log_time = (Math.log(d.values.total_time));
            // for (i=0; i<d.values.length; i++) {
            //     d.values.log_time = (Math.log(d.values.total_time)) * 1.2;
            // }
          });
        });
        });


      abstByDate.forEach(function(d) {
        d.values.forEach( function(d) {
            for (i=0; i<d.values.length; i++) {
                d.values.sort(function(a, b) {return parseFloat(b.values.total_time) - parseFloat(a.values.total_time)})
            }
          })
        });

       var ubst = [];

        abstByDate.forEach(function(d) {
               var day = d.key;
               d.values.forEach(function(d) {
                   var hour = d.key;
                   for (i=0; i< d.values.length; i++) {
                      var el = d.values[i].key;
                      if (!ubst[el]) ubst[el] = [];
                       ubst.push({"name": el, "day" : day, "hour": hour, "count" : d.values[i].values.count, "total_time" : d.values[i].values.total_time})
            }
            })
            })

        /*

          Now the ubstNested array keeps a tab of count and total_time. count represents how many hours this event shows up in a day.
          Total_time repesents the total amount of seconds the event adds up to in the day.

        */

        var ubstNested = d3.nest()
            .key(function(d) { return d.name; })
            .key(function(d) { return (d.day); })
            .rollup(function(leaves) { return {"count": leaves.length, "total_time": d3.sum(leaves, function(d) {return parseFloat(d.total_time);})} })
            .entries(ubst);

      /*
          Abst Matrix Graph Beginning
       */

        this.bubbles = svg["spells"].selectAll(".bubbles")
                    .data(abstByDate, function(d) { return d.key; })
                    .enter( ).append("g")
                    .attr("class", "g");


                    this.bubbles.attr("transform", function(d) {

                        var tmpDate = new Date (d.key);
                          tmpDate.setHours(0);
                          tmpDate.setMinutes(0);
                          tmpDate.setSeconds(0);
                          tmpDate.setMilliseconds(0);

                        return "translate(" + 0 + "," + that.yCa(

                          tmpDate

                          ) + ")";
                      });


        this.bubbles2  = this.bubbles.selectAll(".types")
                    .data(function(d){

                      return d.values;})
                      .enter().append("g")

                  .attr("class", "types");

        this.bubbles2.attr("transform", function(d) {
                        return "translate(" + (that.xC(d.key) + 10) + "," + 0 + ")"; });

        this.bubbles3 = this.bubbles2.selectAll(".bubbles")
                  .data(function (d) {

                  return d.values; })
                      .enter().append("circle")

                      .attr("class", "bubbles")
                      .attr("cy", 0)
                      .attr("cx", 0)
                      .attr("fill", function(d){
                        return that.color(d.key);

                      })
                      .attr("r", function(d) {
                        // if (d.values.total_time >= 50) {return (Math.log(d.values.total_time)) * 1.2}
                        //   else { return (Math.sqrt(d.values.total_time)) * 1.35 }
                          return d.values.log_time * 1.6;
                        })

                      .style("opacity", function(d) {
                              for (i=0; i<ubstNested.length;i++) {
                                if (ubstNested[i].key === d.key) {
                                    for (j = 0; j < ubstNested[i].values.length; j++) {
                                      if (new Date(ubstNested[i].values[j].key).getDate() === d.values.date[0].getDate()) {
                                        if (d.key === "Pos. Iso. Desat" || d.key === "Pos. Iso. Brady") {
                                            return (Math.log(ubstNested[i].values[j].values.total_time/24));
                                            } else {
                                            return (Math.log(d.values.total_time)/10);
                                          }
                                      };
                                    };
                                 };
                              };
                            });


                      this.bubbles3.on('mouseover.tooltip', function(pD, pI){
                        var self = this;
                        var bodyNode = d3.select(this).node();
                        //var absoluteMousePos = d3.mouse(bodyNode.parentNode);
                        var html = d3.functor('');
                          var absoluteMousePos = d3.mouse(self.parentNode.parentNode.parentNode);
                            tooltipDiv.style({
                                left: (absoluteMousePos[0] + 5)+'px',
                                top: (absoluteMousePos[1]) + 'px',
                                'background-color': '#d8d5e4',
                                width: '205px',
                                height: '50px',
                                padding: '5px',
                                position: 'absolute',
                                'z-index': 1001,
                                'box-shadow': '0 1px 2px 0 #656565',
                                'visibility': 'visible',
                                'opacity': 0.9
                            });

                            var first_line = '<p class="ttext" ><strong>' + pD.key + '</strong>   for ' + pD.values.total_time  + ' Secs. </p><br />';
                            var second_line = '<p class="ttext">Time: ' + formatDate(pD.values.date[0]) + ' '+ formatTime(pD.values.date[0]) + '</p><br />';
                             tooltipDiv.html(first_line + second_line);
                        })
                      .on("mouseover.stroke",  function() {
                        var sel = d3.select(this);
                        sel.style({'stroke': 'black', 'stroke-width': 2});
                      })
                      .on('mousemove.tooltip', function(pD, pI){
                            // Move tooltip
                            var bodyNode = d3.select(this).node();
                            //var absoluteMousePos = d3.mouse(bodyNode.parentNode);
                            var self = this;
                            var absoluteMousePos = d3.mouse(self.parentNode.parentNode.parentNode);
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
                                var bodyNode = d3.select(this).node();
                                //var absoluteMousePos = d3.mouse(bodyNode);
                                tooltipDiv.style({

                                        'opacity': 0,
                                        'visibility': 'hidden'
                                    });
                    });


          this.bubbles3.on('mousedown', function(){
            brush_elm = svg["spells"].select(".spellmbrush").node();
            new_click_event = new Event('mousedown');
            new_click_event.pageX = d3.event.pageX;
            new_click_event.clientX = d3.event.clientX;
            new_click_event.pageY = d3.event.pageY;
            new_click_event.clientY = d3.event.clientY;
            brush_elm.dispatchEvent(new_click_event);
          });

      // build the visal object for infection
      svg["spells"].selectAll(".point")
          .data(infections)
        .enter().append("path")
          .attr("class", "point")
          .attr("transform", function(d) { return "translate(" + (that.xC(d.date.getHours()) + 10) + "," + that.yC(d.date.getDate()) + ")"; })
            .attr("d",  d3.svg.symbol().size(50).type(function (d, i) {
                 switch (d.type) {
                     case "NE": return symbol(0);
                     case "FUC": return symbol(1);
                 }
                 return symbol(i);
             }))
             .attr("fill", "red");

      svg["spells"].append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(-10,0)")
          .call(that.yCaAxis);

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

    this.update = function() {

            var self = this;
           // remove all previous items before render
            svg["spells"].selectAll('*').remove();
            //svg["legend"].selectAll('*').remove();

              that.type.filter(function(d){
               if(that.names.indexOf(d) >= 0)
                  return true;
                return false;
              })

              that.yCAxis = d3.svg.axis().scale(that.yC).orient("left").ticks(4).tickFormat(d3.format("4f"));

               var abstByDate = nestByAggDate.entries(that.date.top(Infinity));

              /*
                      Legend for Abstraction Graph
              */

            var legendSpace = width/that.abst.length;

            this.Cbrush = self.Cbrush;

            svg["spells"].append("g")
                .attr("class", "spellbrush")
                .call(this.Cbrush)
              .selectAll('rect')
                .attr('height', that.height);

            /*
                  Legend Ends -- Abstraction Graph Begins
             */

                 abstByDate.forEach(function(d) {
            d.values.forEach( function(d) {
                for (i=0; i<d.values.length; i++) {
                    d.values.sort(function(a, b) {return parseFloat(b.values.total_time) - parseFloat(a.values.total_time)})
                }
              })
            });

           var ubst = [];

            abstByDate.forEach(function(d) {
                   var day = d.key;
                   d.values.forEach(function(d) {
                       var hour = d.key;
                       for (i=0; i< d.values.length; i++) {
                          var el = d.values[i].key;
                          if (!ubst[el]) ubst[el] = [];
                           ubst.push({"name": el, "day" : day, "hour": hour, "count" : d.values[i].values.count, "total_time" : d.values[i].values.total_time})
                }
                })
                })

            var ubstNested = d3.nest()
                .key(function(d) { return d.name; })
                .key(function(d) { return d.day; })
                .rollup(function(leaves) { return {"count": leaves.length, "total_time": d3.sum(leaves, function(d) {return parseFloat(d.total_time);})} })
                .entries(ubst);



          /*
              Abst Matrix Graph Beginning
           */

            this.bubbles = svg["spells"].selectAll(".bubbles")
                        .data(abstByDate, function(d) { return d.key; })
                        .enter( ).append("g")

                        .attr("class", "g");

                        this.bubbles.attr("transform", function(d) {

                        var tmpDate = new Date (d.key);
                          tmpDate.setHours(0);
                          tmpDate.setMinutes(0);
                          tmpDate.setSeconds(0);
                          tmpDate.setMilliseconds(0);

                        return "translate(" + 0 + "," + that.yCa(

                          tmpDate

                          ) + ")";
                      });



                        // this.bubbles.attr("transform", function(d) {
                        //     return "translate(" + 0 + "," + ( (that.yC(d.key) > that.yC.range()[0]) ? -30 : that.yC(d.key) )  + ")"; });


            this.bubbles2  = this.bubbles.selectAll(".types")
                        .data(function(d){

                          return d.values;})
                          .enter().append("g")

                      .attr("class", "types");

            this.bubbles2.attr("transform", function(d) {
                            return "translate(" + (that.xC(d.key) + 10) + "," + 0 + ")"; });

            // this.bubbles3 = this.bubbles2.selectAll(".bubbles")
            //           .data(function (d) {

            //           return d.values; })
            //               .enter().append("circle")

            //               .attr("class", "bubbles")
            //               .attr("cy", 0)
            //               .attr("cx", 0)
            //               .attr("fill", function(d){
            //                 return that.color(d.key);

            //               })
            //               .attr("r", function(d) {
            //             if (d.values.total_time >= 50) {return (Math.log(d.values.total_time)) * 1.2}
            //               else { return (Math.sqrt(d.values.total_time)) * 2 }

            //             })

            //           .style("opacity", function(d) {
            //                   for (i=0; i<ubstNested.length;i++) {
            //                     if (ubstNested[i].key === d.key) {
            //                         for (j = 0; j < ubstNested[i].values.length; j++) {
            //                           if (+ubstNested[i].values[j].key === d.values.date[0].getDate()) {

            //                             return ((1/ubstNested[i].values[j].values.count)*4)
            //                           }
            //                         }
            //                      }
            //                   }
            //                 });

                this.bubbles3 = this.bubbles2.selectAll(".bubbles")
                  .data(function (d) {

                  return d.values; })
                      .enter().append("circle")

                      .attr("class", "bubbles")
                      .attr("cy", 0)
                      .attr("cx", 0)
                      .attr("fill", function(d){
                        return that.color(d.key);

                      })
                      .attr("r", function(d) {
                        if (d.values.total_time >= 50) {return (Math.log(d.values.total_time)) * 1.2}
                          else { return (Math.sqrt(d.values.total_time)) * 1.6 }

                        })

                      .style("opacity", function(d) {
                              for (i=0; i<ubstNested.length;i++) {
                                if (ubstNested[i].key === d.key) {
                                    for (j = 0; j < ubstNested[i].values.length; j++) {
                                      if (new Date(ubstNested[i].values[j].key).getDate() === d.values.date[0].getDate()) {
                                        if (d.key === "Pos. Iso. Desat" || d.key === "Pos. Iso. Brady") {
                                            return (Math.log(ubstNested[i].values[j].values.total_time/24));
                                            } else {
                                            return (Math.log(d.values.total_time)/10);
                                          }
                                      };
                                    };
                                 };
                              };
                            });

                          this.bubbles3.on('mouseover.tooltip', function(pD, pI){
                            var self = this;
                            var html = d3.functor('');
                                var absoluteMousePos = d3.mouse(self.parentNode.parentNode.parentNode);
                                tooltipDiv.style({
                                    left: (absoluteMousePos[0] + 5)+'px',
                                    top: (absoluteMousePos[1]) + 'px',
                                    'background-color': '#d8d5e4',
                                    width: '205px',
                                    height: '50px',
                                    padding: '5px',
                                    position: 'absolute',
                                    'z-index': 1001,
                                    'box-shadow': '0 1px 2px 0 #656565',
                                    'visibility': 'visible',
                                    'opacity': 0.9
                                });

                                var first_line = '<p class="ttext" ><strong>' + pD.key + '</strong>   for ' + pD.values.total_time  + ' Secs. </p><br />';
                                var second_line = '<p class="ttext">Time: ' + formatDate(pD.values.date[0]) + ' '+ formatTime(pD.values.date[0]) + '</p><br />';
                                 tooltipDiv.html(first_line + second_line);
                            })
                          .on("mouseover.stroke",  function() {
                            var sel = d3.select(this);
                            sel.style({'stroke': 'black', 'stroke-width': 2});
                          })
                          .on('mousemove.tooltip', function(pD, pI){
                                // Move tooltip

                                var self = this;
                                var absoluteMousePos = d3.mouse(self.parentNode.parentNode.parentNode);
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
                                   var self = this;
                                   var absoluteMousePos = d3.mouse(self.parentNode.parentNode.parentNode);
                                    tooltipDiv.style({

                                            'opacity': 0,
                                            'visibility': 'hidden'
                                        });
                        });

                this.bubbles3.on('mousedown', function(){
                  brush_elm = svg["spells"].select(".brush").node();
                  new_click_event = new Event('mousedown');
                  new_click_event.pageX = d3.event.pageX;
                  new_click_event.clientX = d3.event.clientX;
                  new_click_event.pageY = d3.event.pageY;
                  new_click_event.clientY = d3.event.clientY;
                  brush_elm.dispatchEvent(new_click_event);
                });

             // build the visal object for infection
          svg["spells"].selectAll(".point")
              .data(infections)
            .enter().append("path")
              .attr("class", "point")
              .attr("transform", function(d) { return "translate(" + (that.xC(d.date.getHours()) + 10) + "," + that.yC(d.date.getDate()) + ")"; })
                .attr("d",  d3.svg.symbol().size(50).type(function (d, i) {
                     switch (d.type) {
                         case "NE": return symbol(0);
                         case "FUC": return symbol(1);
                     }
                     return symbol(i);
                 }))
                 .attr("fill", "red");;

            svg["spells"].append("defs").append("clipPath")
                    .attr("id", "clip")
                    .append("rect")
                    .attr("transform", "translate(0,0)")
                    .attr("width", that.width + 20)
                    .attr("height", that.height + 20);

            svg["spells"].append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(-10,0)")
                .call(that.yCAxis);

            svg["spells"].append("g")
                .attr("class", "x axis")
                .attr("clip-path", "url(#clip)")
                .attr("transform", "translate(10," + that.height + ")")
                .call(that.xCAxis);

           // svg["spells"].exit().remove();

    }

function brushmend() {

 var that = this;

  charts.spells.xC.domain(that.Cbrush.empty() ? charts.spells.xC.domain() : that.Cbrush.extent());

  if (that.Cbrush.empty()) {
    that.yCAxis = d3.svg.axis().scale(that.yC).orient("left").ticks(6).tickFormat(d3.format("4f"));
    charts.spells.xC.domain(["0","23"]);
    //transition_data();
    that.update()
  }
      //x.domain(brush.extent());

      that.update()


      if (that.Cbrush.empty()) d3.selectAll(".selected").classed("selected", false);
      d3.select(".spellmbrush").call(that.Cbrush.clear());
  }}
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
              this.infections = options.infections;

    var localName = this.name;

        this.setColor = function() {
                switch (localName) {
                     case 'ri_pause': return that.z = d3.scale.linear().domain([00, 40]).interpolate(d3.interpolateLab).range(["white", "#9169AB"]);
                        break;
                   case 'hr' : return that.z = d3.scale.linear().domain([00, 40]).interpolate(d3.interpolateLab).range(["white", "#D51632"]);
                        break;
                   case 'spo2': return that.z = d3.scale.linear().domain([00, 40]).interpolate(d3.interpolateLab).range(["white", "#0079AD"]);
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
                .attr("transform",

                  (localName === "ri_pause") ? "translate(" + 2 + "," + (height) + ")" : "translate(" + 2 + "," + (height-6) + ")")
                 // "translate(2," + (height - 6) + ")")
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

            // build the visal object for infection
              this.svg.selectAll(".point")
                  .data(infections)
                .enter().append("path")
                  .attr("class", "point")
                  .attr("transform", function(d) { return "translate(" + xS(d.date) + "," + (height - 5) + ")"; })
                    .attr("d",  d3.svg.symbol().size(50).type(function (d, i) {
                         switch (d.type) {
                             case "NE": return symbol(0);
                             case "FUC": return symbol(1);
                         }
                         return symbol(i);
                     }))
                     .attr("fill", "red");


}


function parseEpoch(ts)
{
  return new Date(parseFloat(ts)*1000);
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

    // set the brush and call update on matrix graph
    // mxGraph.Cbrush.extent = that.brush.extent;
    // charts.spells.yC.domain([mxGraph.Cbrush.extent()[0].getDate()-0.8, mxGraph.Cbrush.extent()[1].getDate()+0.8]);
    // mxGraph.update();

    //set brush and call update on linear graph
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
            charts.spells.yC.domain(charts.spells.mxDays);
            charts.spells.xC.domain(["0","23"]);
            //mxGraph.update();
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

function irwGraph() {

  var that = this;

  var margin = {top: 20, right: 20, bottom: 20, left: 50},
      width = 425 - margin.left - margin.right,
      height = 120 - margin.top - margin.bottom;

  var data;

  var formatTime = d3.time.format("%H:%M:%S");

  var x = d3.time.scale()
      .range([0, width]);

  var x2 = d3.scale.linear()
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .tickFormat(formatTime)
      .orient("bottom")
      .ticks(6);

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

  var line = d3.svg.line()
      .interpolate("step-before")
      .x(function(d,i) { return x2(d.date); })
      .y(function(d,i) { return y(d.irwval); });

  socket.on('sendIRWData', function(msg) {
            data = msg;

      svg["irwchart"].selectAll('*').remove();

      svg["irwchart"] = d3.select(".crumb").append("svg")
            .attr("class", "chartCrumb")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + 30 + "," + margin.top + ")");

      var irwvalues = [];
      data.forEach(function(d,i) {
        d.x = [];
        d.date = parseEpoch(d.READINGEPOCH);
        if (d.IRWSTRING) {d.irwv = d.IRWSTRING.split(',');} else if (d.IRWVALUE) {d.irwv = d.IRWVALUE.split(',');};

        d.irwv = d.irwv.splice(0,16);
        var len = d.irwv.length;
        for(j=0; j < len; j++) {
          d.x.push(((i*16)+j));
        }
        d3.zip(d.x,d.irwv).map(function(d) { irwvalues.push({irwval: (d[1]/1000), date: d[0]})});
      });

      x.domain(d3.extent(data, function(d) { return d.date; }));
      x2.domain(d3.extent(irwvalues, function(d) { return d.date; }));
      y.domain(d3.extent(irwvalues, function(d) { return d.irwval; }));

      var t1 = x.domain()[1];
      var t0 = x.domain()[0];
      var g1 = t1.getTime()-30000;
      var g0 = t0.getTime()+30000;

      var band = svg["irwchart"].append("g")
          .attr("class", "focusBand")
         ;

      svg["irwchart"].append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

      svg["irwchart"].append("g")
          .attr("class", "y axis")
        .append("text")
          .attr("transform", "rotate(-90) translate(0,-30)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Respiratory (IRW)");

      band.append("rect")
          .attr("height", height)
          .attr("fill", "steelblue")
          .attr("opacity", 0.1)
          .attr("width",
                  (x(new Date(g1)) - x(new Date(g0)))
                )
          .attr("x", x(g0));

      svg["irwchart"].append("path")
          .datum(irwvalues)
          .attr("class", "irwline")
          .attr("d", line);

      //svg["irwchart"].exit().remove();
});
};


function HRGraph() {

  var that = this;

  // var margin = {top: 10, right: 5, bottom: 30, left: 5},
  //     width = 190,
  //     height = 120 - margin.top - margin.bottom;
  //

  var margin = {top: 20, right: 20, bottom: 20, left: 50},
      width = 425 - margin.left - margin.right,
      height = 120 - margin.top - margin.bottom;

  var data;

  var formatTime = d3.time.format("%H:%M:%S");

  var x = d3.time.scale()
      .range([0, width-40]);

  var x2 = d3.scale.linear()
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .tickFormat(formatTime)
      .orient("bottom")
      .ticks(3);

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(3)
      .tickFormat(d3.format("d"));

  var line = d3.svg.line()
      .interpolate("step-before")
      .x(function(d,i) { return x(d.date); })
      .y(function(d,i) { return y(d.close); })
      ;

  socket.on('sendHRData', function(msg) {

      svg["hrchart"].selectAll('*').remove();
      data = msg;

      svg["hrchart"] = d3.select(".crumb").append("svg")
            .attr("class", "chartCrumb")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + 40 + "," + margin.top + ")");

      data.forEach(function(d) {
        if (d.TIMESTAMP) {
          d.date = parseEpoch(d.TIMESTAMP);
        } else {

          d.date = parseEpoch(d.READINGEPOCH);
        }

        d.close = +d.HRVALUE;
        });

      x.domain(d3.extent(data, function(d) { return d.date; }));
      y.domain(d3.extent(data, function(d) { return d.close; }));

      var t1 = x.domain()[1];
      var t0 = x.domain()[0];
      var g1 = t1.getTime()-30000;
      var g0 = t0.getTime()+30000;

      var band =  svg["hrchart"].append("g")
          .attr("class", "focusBand")
         ;

       svg["hrchart"].append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

       svg["hrchart"].append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90) translate(0,-40)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Heartrate (HR)");

      band.append("rect")
          .attr("height", height)
          .attr("fill", "steelblue")
          .attr("opacity", 0.1)
          .attr("width",
                  (x(new Date(g1)) - x(new Date(g0)))
                )
          .attr("x", x(g0));

       svg["hrchart"].append("path")
          .datum(data)
          .attr("class", "hsline")
          .attr("d", line);

     // svg["hrchart"].exit().remove();

});
};

function SPO2Graph() {

  var that = this;

  // var margin = {top: 10, right: 5, bottom: 30, left: 5},
  //     width = 190,
  //     height = 120 - margin.top - margin.bottom;

  var margin = {top: 20, right: 20, bottom: 20, left: 50},
      width = 425 - margin.left - margin.right,
      height = 120 - margin.top - margin.bottom;

  var data;

  var formatTime = d3.time.format("%H:%M:%S");

  var x = d3.time.scale()
      .range([0, width-40]);

  var x2 = d3.scale.linear()
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height, 0]);

var xAxis = d3.svg.axis()
      .scale(x)
      .tickFormat(formatTime)
      .orient("bottom")
      .ticks(3);

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(3)
      .tickFormat(d3.format("d"));

  var line = d3.svg.line()
      .interpolate("step-before")
      .x(function(d,i) { return x(d.date); })
      .y(function(d,i) { return y(d.close); })
      ;

  socket.on('sendSPO2Data', function(msg) {

    svg["spo2chart"].selectAll('*').remove();

      data = msg;

      svg["spo2chart"] = d3.select(".crumb").append("div").attr("class", "O2Div").append("svg")
            .attr("class", "chartCrumb")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + 40 + "," + margin.top + ")");

      data.forEach(function(d) {
         if (d.TIMESTAMP) {
          d.date = parseEpoch(d.TIMESTAMP);
        } else {

          d.date = parseEpoch(d.READINGEPOCH);
        }
        d.close = +d.SPO2VALUE;
        });

      x.domain(d3.extent(data, function(d) { return d.date; }));
      y.domain(d3.extent(data, function(d) { return d.close; }));

      var t1 = x.domain()[1];
      var t0 = x.domain()[0];
      var g1 = t1.getTime()-30000;
      var g0 = t0.getTime()+30000;

      var band = svg["spo2chart"].append("g")
          .attr("class", "focusBand")
         ;

      svg["spo2chart"].append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

      svg["spo2chart"].append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90) translate(0,-40)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Oxygen (SpO₂)");

      band.append("rect")
          .attr("height", height)
          .attr("fill", "steelblue")
          .attr("opacity", 0.1)
          .attr("width",
                  (x(new Date(g1)) - x(new Date(g0)))
                )
          .attr("x", x(g0));

      svg["spo2chart"].append("path")
          .datum(data)
          .attr("class", "hsline")
          .attr("d", line);


      //svg["spo2chart"].exit().remove();

});
};
