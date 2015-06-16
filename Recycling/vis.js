// Visualisation 1: Pie Chart

(function(){

  (function(d3) {
    'use strict';

    var width = 400;
    var height = 400;
    var radius = Math.min(width, height) / 2;
    var donutWidth = 85;
    var legendRectSize = 18;
    var legendSpacing = 4;

    var color = d3.scale.ordinal()
      .range(["#66c2a5","#fc8d62","#8da0cb"]);

    var svg = d3.select('#vis1')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(' + (width / 2) + 
        ',' + (height / 2) + ')');

    var arc = d3.svg.arc()
      .innerRadius(radius - donutWidth)
      .outerRadius(radius);

    var pie = d3.layout.pie()
      .value(function(d) { return d.Percentage; })
      .sort(null);

    var tooltip2 = d3.select('#vis1')                               
      .append('div')                                                
      .attr('class', 'tooltip2');                                    
                      
    tooltip2.append('p')                                           
      .attr('class', 'Wales')
      .style("font-weight", "bold");                                      
         
    tooltip2.append('p')                                           
      .attr('class', 'Percentage');  

    tooltip2.append('p')                                           
      .attr('class', 'Description');                                    

    d3.csv('municipal.csv', function(error, dataset) {
      dataset.forEach(function(d) {
        d.Percentage = +d.Percentage;
      });

      var path = svg.selectAll('path')
        .data(pie(dataset))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', function(d, i) { 
          return color(d.data.Wales); 
        });

      path.on('mouseover', function(d) {                            
        var total = d3.sum(dataset.map(function(d) {                
          return d.Percentage;                                           
        }));                                                        
        var percent = Math.round(1000 * d.data.Percentage / total) / 10;              
        tooltip2.select('.Percentage').html(d.data.Percentage + '%');  
        tooltip2.select('.Wales').html(d.data.Wales);
        tooltip2.select('.Description').html(d.data.Description);             
        tooltip2.style('display', 'block');                          
      });                                                           
      
      path.on('mouseout', function() {                              
        tooltip2.style('display', 'none');                          
      });                                                           
        
      var legend = svg.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
          var height = legendRectSize + legendSpacing;
          var offset =  height * color.domain().length / 2;
          var horz = -2 * legendRectSize;
          var vert = i * height - offset;
          return 'translate(' + horz + ',' + vert + ')';
        });

      legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)                                   
        .style('fill', color)
        .style('stroke', color);
        
      legend.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function(d) { return d; })
        .style('font-size', 18);
    });

  })(window.d3);

}());

// Visualisation 2: Household Wasting and Recycling

(function(){

  var margin = {top: 10, right: 20, bottom: 30, left: 60},
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  var x0 = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

  var x1 = d3.scale.ordinal();

  var y = d3.scale.linear()
    .range([height, 0]);

  var color = d3.scale.ordinal()
    .range(["#fee0d2", "#fc9272"]);

  var xAxis = d3.svg.axis() // Creating Axis
    .scale(x0)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));

  var svg = d3.select("#vis2").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv("household2.csv", function(error, data) { // Attaching data
    var householdStuff= d3.keys(data[0]).filter(function(key) { return key !== "Year"; });

    data.forEach(function(d) {
      d.stuff = householdStuff.map(function(name) { return {name: name, value: +d[name]}; });
    });

    x0.domain(data.map(function(d) { return d.Year; }));
    x1.domain(householdStuff).rangeRoundBands([0, x0.rangeBand()]);
    y.domain([0, d3.max(data, function(d) { return d3.max(d.stuff, function(d) { return +d.value; }); })]);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -60)
      .attr("x", -180)
      .attr("dy", ".90em")
      .style("text-anchor", "end")
      .text("Tonnes");

    var year = svg.selectAll(".Year")
      .data(data)
      .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) { return "translate(" + x0(d.Year) + ",0)"; });

    year.selectAll("rect")
      .data(function(d) { return d.stuff; })
      .enter().append("rect")
      .attr("width", x1.rangeBand())
      .attr("x", function(d) { return x1(d.name); })
      .attr("y", function(d) { return y(+d.value); })
      .attr("height", function(d) { return height - y(+d.value); })
      .style("fill", function(d) { return color(d.name); });

    var legend = svg.selectAll(".legend") // Creating Legend
      .data(householdStuff.slice().reverse())
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

    legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });

  });
}());

// Visualisation 3: Line graph packaging

(function(){

  var margin = {top: 0, right: 80, bottom: 30, left: 70},
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
  
  var parseDate = d3.time.format("%Y").parse;

  var x = d3.time.scale()
      .range([0, width]);

  var y = d3.scale.linear()
    .range([height, 0]);

  var color = d3.scale.category10();

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format(".2s"));

  var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.kilotonnes); });

  var svg = d3.select("#vis3").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv("packaging.csv", function(error, data) {
    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

    data.forEach(function(d) {
      d.date = parseDate(d.date);
    });

    var materials = color.domain().map(function(name) {
      return {
        name: name,
        values: data.map(function(d) {
          return {date: d.date, kilotonnes: +d[name]};
        })
      };
    });

    x.domain(d3.extent(data, function(d) { return d.date; }));

    y.domain([
      0, d3.max(materials, function(c) { return d3.max(c.values, function(v) { return v.kilotonnes; }); })
    ]);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -55)
      .attr("x", -200)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Tonnes");

    var city = svg.selectAll(".year")
      .data(materials)
      .enter().append("g")
      .attr("class", "year");

    city.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return color(d.name); });

    city.append("text")
      .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.kilotonnes) + ")"; })
      .attr("x", 3)
      .attr("dy", ".35em")
      .text(function(d) { return d.name; });
  });
}());
  
// Visualisation 4: Bar chart with Material Recycled 

(function(){

  var margin = {top: 0, right: 20, bottom: 100, left: 40},
  width = 800 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

  var colour_scale = d3.scale.quantile().range(colorbrewer.RdGy[7]);
  
  var x_scale = d3.scale.ordinal()
    .rangeBands([margin.left, width-margin.right], .5);

  var y_scale = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
    .scale(x_scale) 
    .orient("bottom")

  var yAxis = d3.svg.axis()
    .scale(y_scale)
    .orient("left")
    .tickFormat(d3.format(".2s"));

  var svg = d3.select("#vis4").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");   

  d3.csv('Material.csv', function(data) { // Attaching data
    console.log(data);

    data.sort(function(a, b){
      if(+a.Household > +b.Household) {
        return -1;
      }
      if(+a.Household < +b.Household) {
        return 1;
      }
        return 0;
      });

    console.log(data);

    var labels = data.map(function(d){
      console.log(d);
      return d.Material;
    });

    console.log(labels);

    x_scale.domain(labels);

    var max = d3.max(data, function(d){ return +d.Household });

    y_scale.domain([0, max]);

    colour_scale.domain([0, max]);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-10")
      .attr("dy", "-5")
      .attr("transform", "rotate(-70)" );

    svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(40,0)")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -180)
      .style("text-anchor", "end")
      .text("Tonnes")

    var bars = svg.selectAll("rect")
      .data(data)
      .enter() //will create rect if they dont exist
      .append("rect") // for each data
      .attr("x", function(d) { return x_scale(d.Material)})
      .attr("width", x_scale.rangeBand())
      .attr("y", function(d) { return y_scale(+d.Household); })
      .attr("height", function(d) { return height - y_scale(+d.Household); })
      .style("fill", function(d){ return colour_scale(d.Household); })

    d3.selectAll("rect")
      .on("mouseover", function(d){
        console.log('hover');
        console.log(d);
        var text_div = d3.select("#right-side")
          .attr("height", height)
          .style("background-color", "#eee");
          text_div.append("p")
            .text(d.Material)
            .style("font-weight", "bold");
      });

    d3.selectAll("rect")
      .on("mouseout", function(d){
        console.log('mouseout');
        var text_div = d3.select("#right-side")
          .html('');
      });
  });
}());

// Visualisation 5: Renewable Sources

(function(){

  var margin = {top: 10, right: 20, bottom: 30, left: 50},
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  var parseDate = d3.time.format("%Y").parse;

  var x = d3.time.scale()
    .range([0, width]);

  var y = d3.scale.linear()
    .range([height, 0]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

  var line = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.Renewable); });

  var div = d3.select("#vis5").append("div")   //tooltip
    .attr("class", "tooltip")               
    .style("opacity", 0)

  var svg = d3.select("#vis5").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  function make_x_axis() {        
    return d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(12)
  }

  function make_y_axis() {        
    return d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(8)
  }

  d3.csv("renewable.csv", function(error, data) {
    data.forEach(function(d) {
      d.date = parseDate(d.date);
      d.Renewable = +d.Renewable;
    });

  x.domain(d3.extent(data, function(d) { return d.date; }));
  
  y.domain([
      0, d3.max(data, function(v) { return v.Renewable; })
  ]);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -50)
    .attr("x", -180)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Percentage %");

  svg.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", line);

  svg.append("g")         
    .attr("class", "grid")
    .attr("transform", "translate(0," + height + ")")
    .call(make_x_axis()
      .tickSize(-height, 0, 0)
      .tickFormat("")
    )

  svg.append("g")         
    .attr("class", "grid")
    .call(make_y_axis()
      .tickSize(-width, 0, 0)
      .tickFormat("")
    )

  svg.selectAll("dot")    
    .data(data)         
    .enter().append("circle")                               
    .attr("r", 4) 
    .attr("opacity", 0)      
    .attr("cx", function(d) { return x(d.date); })       
    .attr("cy", function(d) { return y(d.Renewable); })     
    .on("mouseover", function(d) {      
      div.transition()        
        .duration(200)      
        .style("opacity", 0.7);      
      div.html(d.Renewable + "%")  
        .style("left", (d3.event.pageX) + "px")     
        .style("top", (d3.event.pageY - 28) + "px");    
    })                  
    .on("mouseout", function(d) {       
      div.transition()        
        .duration(500)      
        .style("opacity", 0);   
    });
  });
}());