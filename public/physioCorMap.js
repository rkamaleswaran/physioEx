<!DOCTYPE html>
<meta charset="utf-8">
<style>

svg {
  font: 10px sans-serif;
  background-color: #000;
}

.axis path,
.axis line {
  fill: none;
  stroke:  #696969;
  shape-rendering: crispEdges;
}

.axis text {
  fill: #696969;
}

div.tooltip {
  position: absolute;
  text-align: center;
  width: 150px;
  height: 48px;
  padding: 2px;
  font: 12px sans-serif;
  border: 0px;
  border-radius: 8px;
  pointer-events: none;
}
</style>

</style>
<body>
<H1>spells -- durations by conditions</H1>
<script src="http://d3js.org/d3.v3.min.js"></script>
<script>

    var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = (940 - margin.left - margin.right),
    height = (250 - margin.top - margin.bottom);

      //var x = d3.time.scale()
    var x = d3.time.scale().range([0, width]);

    var y = d3.scale.ordinal()
      .rangeRoundBands([height, 0], .05);

    var z = d3.scale.linear()
      .domain([00, 30])
      .interpolate(d3.interpolateLab);

    var formatTime = d3.time.format("%I %p"),
      formatHour = function (d) {
        if (d == 12) return "noon";
        if (d == 24 || d == 0) return "midnight";
        return formatTime(new Date(2013, 2, 9, d, 00));
      };

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      //.tickFormat(formatHour)
      ;

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickFormat(d3.format("d"));

    var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.json("data/P21492_breaching_ri_pause.json", function(error, data) {

   // var data = data.filter(function(d) { if(d.DURATION>20) { return d.DURATION;}});
    var binNames = d3.keys(data[0]).filter(function(key) { return key != "DAY" && key != "HOUR" && key != "TYPE"; });

       var parseDate = d3.time.format("%Y-%m-%d %H:%M").parse;
        var binNames = d3.keys(data[0])
                      .filter(function(key) {
                        return key != "DAY"
                          && key != "PATIENT"
                          && key != "HOUR"
                          && key != "TYPE"
                          && key != "UN"; });

                  //preprocess dates and separate keyvals for d3 render
                  data.forEach( function(d) {
                  d.DAY = d.DAY.concat(" " + d.HOUR + ":00");
                  d.DAY = parseDate(d.DAY);

                  d.values = [];
                     for (var b=0;b < binNames.length;b++)
                     { d.values.push( parseInt(d[+binNames[b]],10));}
                  });

        var m = data.map(function(d){
          return d.DAY
          });

         m.push(new Date((+m[m.length-1] - +m[m.length-2]) + +m[m.length-1]))

        var ext = d3.extent(m);

        y.domain(binNames);

        x.domain(ext);



         svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis);

          svg.append("g")
              .attr("class", "y axis")
              .call(yAxis);

          svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Duration of Pause in Seconds");

            // var circle = svg.selectAll("circle")
            // .data(data)
            // .enter()
            // .append("circle")
            // .attr("cx", function(d){return x(d.DAY)})
            // .attr("cy", 10)
            // .attr("r", 5);

        var physMap = svg.selectAll(".physMap")
          .data(data)
          .enter( ).append("g")
          .attr("class", "physMap")
          ;


        var mapBins = physMap.selectAll(".bin")
              .data(function (d) {

              return d.values; })
              .enter();

          mapBins.append("rect")
                .attr("class", "bin")
                .attr("x", function(d,i,j){
                    return x(mapBins[j].parentNode.__data__.DAY);
                })
                .attr("y", function(d,i,j) {
                  return y(binNames[i]);
                })
                .attr("height", y.rangeBand())
                .attr("width", width / data.length)
                .style("fill", function(d) { return z(d); });




          });


    clearMap = function () {
          svg.selectAll("*")
            .remove();
    };

    changeMapColor = function(tab) {
      switch (tab) {
         case 'ri_pause': z.range(["white", "purple"]);
              break;
         case 'hr' : z.range(["white", "red"]);
              break;
         case 'spo2': z.range(["white", "orange"]);
              break;
          default: z.range(["white", "black"]);
      };
    };

    </script>
