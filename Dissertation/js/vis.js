// Visualisation 1: MAP 

	(function(){
		var boundaries;
		var recycling_data;
		var units = "lad";

		var width = 500;
		var height = 500;

	// projection
		var projection = d3.geo.albers()
		    .rotate([0, 0]);

		var path = d3.geo.path()
		    .projection(projection);

	// create the svg element for drawing onto
		var svg = d3.select("#map").append("svg")
		    .attr("width", width)
		    .attr("height", height);

	//var tooltip
	    var toolmap = d3.select("#map").append("div")
	    	.attr("class", "toolmap");

		var g = svg.append("g");

		var colour_scale = d3.scale.quantize()
		   	.range(colorbrewer.GnBu[9]);

		get_value_by_id = function(lad_id) {
		    for(var d in recycling_data) {
		     	if(recycling_data[d].id === lad_id) {
		     		return +recycling_data[d].value;
		     	}
		    }
		    return undefined;
			}

		draw_map = function() {
	// draw our map on the SVG element
			var max = d3.max(recycling_data, function(d){return +d.value});
			//console.log(max);
			colour_scale.domain([0, max]);

			projection
			    .scale(1)
			    .translate([0,0]);

	// compute the correct bounds and scaling from the topoJSON
			var b = path.bounds(topojson.feature(boundaries, boundaries.objects[units]));
		    var s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
		    var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
			    
			projection
		        .scale(s)
		        .translate(t);

	// add an area for each feature in the topoJSON
			g.selectAll(".area")
			    .data(topojson.feature(boundaries, boundaries.objects[units]).features)
			    .enter().append("path")
		        .attr("class", "area")
			    .attr("fill", function(d){ return colour_scale(get_value_by_id(d.id)); })
			    .attr("id", function(d){return d.id})
		        .attr("value", function(d){return get_value_by_id(d.id);})
		        .attr("d", path);

	// add a boundary between areas
			g.append("path")
			    .datum(topojson.mesh(boundaries, boundaries.objects[units], function(a, b){ return a !== b }))
			    .attr('d', path)
		        .attr('class', 'boundary');			

			var legend = d3.select('#legend')
			    .append('ul')
			    	.attr('class', 'list-inline');

			var keys = legend.selectAll('li.key')
			    .data(colour_scale.range());

			keys.enter()
				.append('li')
			    .attr('class', 'key')
			    .style('border-top-color', String)
			    .text(function(d) {
				    var formats = d3.format(".2r")
				   	var r = colour_scale.invertExtent(d);
			        return formats(r[0]);
				});

	// Tooltip
	        g.selectAll(".area")
	            .on("mousemove", function(d,i) {
	            	console.log(d);
	            	// console.log(this);
	            toolmap
	                .classed("hidden", false)
	                .attr("style", "left:"+ d3.event.pageX +"px; top:"+ d3.event.pageY +"px")
	                .html("<p>Local Authority: " + d.properties.LAD13NM + 
	                	"<br>Incidents: " + get_value_by_id(d.id)  +  "</p>")
	            })
	            .on("mouseout",  function(d,i) {
	                toolmap.classed("hidden", true)
	            });
		}

		queue()
			.defer(d3.json, "lad.json")
			.defer(d3.csv, "csv/where.csv")
			.await(function(error, b, data){
				boundaries = b;
				recycling_data = data;
				draw_map();
			})
	}());

// Visualisation 3: Bar graph

	(function(){

	    var width = 800;
	    var height = 500;

	    var bottom_padding = 150;
	    var left_padding = 60;

	    var transition_duration = 2000;

	// the svg element that will hold the visualisation
	    var svg;

	// a scale of colours
	    var colour_scale = d3.scale.quantile().range(colorbrewer.YlGnBu[9]);

	    colorbrewer.GnBu[9]

	// define x-scale and y-scale
	    var x_scale = d3.scale.ordinal()
	    var y_scale = d3.scale.linear()

	// define xaxis
	    var x_axis = d3.svg.axis()
	        .scale(x_scale)
	        .orient("bottom")
	        //.ticks(8);

	// define Y axis
	    var y_axis = d3.svg.axis()
	        .scale(y_scale)
	        .orient("left")
	        //x.ticks(8);

		var tip = d3.tip()
	        .attr('class', 'd3-tip')
	        .offset([-10, 0])
	        .html(function(d) {
	        	return "<span style='color:white'>" + d.Value + "</span>";
	        })

	    var column;

	    var set_sizes = function() {
	       	var w = window,
	            d = document,
	            e = d.documentElement,
	            g = d.getElementById("bar-graph"),
	            x = g.clientWidth;
	            y = g.clientHeight;
	            
	        width = x;
	        height = y;
	    }

	    var init_plot = function() {

	        x_scale.rangeRoundBands([left_padding, width-left_padding], 0.25);
	        y_scale.range([height-bottom_padding, 0]);

	        svg = d3.select("#bar-graph")
	            .append("svg")
	            .attr("id", "bar_chart")
	            .attr("height", height)
	            .attr("width", width)

	        svg.append("rect")
	            .attr("id","center")
	            .attr("height", 500)
	   	        .attr("width", 600) // ?
	            .attr("fill", "white");

	            //.on("click", update_plot);

	        svg.call(tip); 

	        svg.append("g")
	            .attr("class", "x axis bar_chart")
	            .attr("transform", "translate(0," + (height - bottom_padding) + ")")
	            .call(x_axis)
	            .selectAll("text")
	            .style("text-anchor", "end")
	            .attr("dx", "-10")
	            .attr("dy", "-5")
	            .attr("transform", "rotate(-40)" )

	        svg.append("g")
	            .attr("class", "y axis")
	            .attr("transform", "translate(" + left_padding + ",0)")
	            .append("text")
	            .attr("transform", "rotate(-90)")
	            .attr("y", (-left_padding/3)*2)
	            .attr("x", -(height-bottom_padding)/2)
	            .style("text-anchor", "middle")
	            //.text("Number of incidents")
	            .style("font-size", 12);
	    }

	    var draw_plot = function(year) {
			
			d3.csv('csv/material' + year + '.csv', function(data) {
	            	set_sizes();

	            var max_value = d3.max(data, function(d){ return +d.Value; });

	            x_scale.domain(data.map(function(d) { return d.Material; }));
	       	    y_scale.domain([0, max_value]);
	            colour_scale.domain([0, max_value]);

	            var bars = d3.select("#bar_chart")
	                .selectAll(".bar")
	                .data(data);            

	            bars
	                .enter()
	                .append("rect")
	                .attr("x", function(d){ return x_scale(d.Material); })
	                .attr("y", function(d){ return height - bottom_padding; })
	                .attr("width", x_scale.rangeBand())
	                .attr("height", 0)
	                .attr("fill", function(d) {
	                    return colour_scale(+d.Value)
	                })
	                .attr('class', 'bar')
	                .on('mouseover', tip.show)
	                .on('mouseout', tip.hide);

	            bars      
	                // .transition()
	                // .duration(transition_duration)
	                .attr("y", function(d){ 
	                	return y_scale(+d.Value); })
	                .attr("height", function(d){ return height - y_scale(+d.Value) - bottom_padding })
	                .attr("fill", function(d) {
	                    return colour_scale(+d.Value);
	                });

	            bars
	                .exit()
	                .transition()
	                .duration(transition_duration)
	                .attr("x", width)
	                .remove();

	            // create x-axis
	            svg.select(".x.axis.bar_chart")
	                .call(x_axis)
		            .selectAll("text")
		            .style("text-anchor", "end")
		            .attr("dx", "-10")
		            .attr("dy", "-5")
		            .attr("transform", "rotate(-50)" );
	                
	  			// create y-axis
	            svg.select(".y.axis")
	                .transition()
	                .duration(transition_duration)
	                .call(y_axis);
	        });
	    }

	    var init = function() {
	        set_sizes();
	        init_plot();
	        draw_plot(2014);
	        d3.select('#year_select')
	            .on('change', function() {
	                var selected = this.options[this.selectedIndex].value;
	                draw_plot(selected);
	            })
	    }();
	}());

// SCATTERPLOT 
(function(){

    var margin = {top: 30, right: 20, bottom: 20, left: 70},
        width = 600 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // setup x 
    var xValue = function(d) { return d.Year;}, 
        xScale = d3.scale.ordinal().rangePoints([0, width]),
        xMap = function(d) { return xScale(xValue(d));},
        xAxis = d3.svg.axis().scale(xScale).orient("bottom");

    // setup y
    var yValue = function(d) { return d["Figure"];}, 
        yScale = d3.scale.linear().range([height, 0]), 
        yMap = function(d) { return yScale(yValue(d));}, 
        yAxis = d3.svg.axis().scale(yScale).orient("left");

    // setup fill color
    var cValue = function(d) { return d.Authority;},
        color = d3.scale.category10();

    // add the graph canvas to the body of the webpage
    var svg = d3.select("#scat").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // add the tooltip area to the webpage
    var tooltip = d3.select("#scat").append("div")
        .attr("class", "tooltip2")
        .style("opacity", 0);

    // load data
    d3.csv("csv/howmuch.csv", function(error, data) {

    // change string (from CSV) into number format
    data.forEach(function(d) {
        d["Figure"] = +d["Figure"];
    });

    // don't want dots overlapping axis, so add in buffer to data domain
    xScale.domain(["2006-07", "2007-08", "2008-09", "2009-10", "2010-11", "2011-12", "2012-13", "2013-14", "2014-15"]);
    yScale.domain([0, d3.max(data, yValue)+1]);

    // x-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", 15)
        .style("text-anchor", "end")
        .text("");

    // y-axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("");

    // draw dots
    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 7)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", function(d) { return color(cValue(d));}) 
        .on("mouseover", function(d) {
            d3.select(this)
                .transition(200)
                .attr("r", 10)
                // .style("fill","black");
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(d["Authority"] + "<br/>Year: " + xValue(d) 
            + "<br/>Accidents: " + yValue(d))
                .style("left", (d3.event.pageX - 30) + "px")
                .style("top", (d3.event.pageY - 70) + "px");
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .transition(1000)
                .attr("r", 7)
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // draw legend
    var legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend2")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    // draw legend colored rectangles
    legend.append("rect")
        .attr("x", width - 0)
        .attr("width", 10)
        .attr("height", 7)
        .style("fill", color);

    // draw legend text
    legend.append("text")
        .attr("x", width - 1)
        .attr("y", 3)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .style("font-size", 12)
        .text(function(d) { return d;})
    });
}());

// Pie 

      (function(d3) {
        'use strict';

        var dataset = [
          { label: 'Fine', count: 85 },
          { label: 'Case lost', count: 1 },
          { label: 'Community service', count: 2 },
          { label: 'Other (successful)', count: 3 },
          { label: 'Discharge', count: 14 }
          // { label: 'Custodial Sentence', count: 0 },
        ];

        var width = 180;
        var height = 180;
        var radius = Math.min(width, height) / 2;

   		var color = d3.scale.ordinal()
        	.range(["#669933","blue","black","orange","#D00000"]);

        var svg = d3.select('#chart')
          .append('svg')
          .attr('width', width)
          .attr('height', height)
          .append('g')
          .attr('transform', 'translate(' + (width / 2) + 
            ',' + (height / 2) + ')');

        var arc = d3.svg.arc()
          .outerRadius(radius - 4);

        var pie = d3.layout.pie()
          .value(function(d) { return d.count; })
          .sort(null);

        var path = svg.selectAll('path')
          .data(pie(dataset))
          .enter()
          .append('path')
          .attr('d', arc)
          .attr('fill', function(d, i) { 
            return color(d.data.label);
          });

      })(window.d3);

// Line graph 

(function(){
	//Dimensions and padding
	var fullwidth = 700;
	var fullheight = 500;
	var margin = {top: 10, right: 100, bottom: 40, left:100};

	var width = fullwidth - margin.left - margin.right;
	var height = fullheight - margin.top - margin.bottom;

	//Set up date formatting and years
	var dateFormat = d3.time.format("%Y");

	//Set up scales
	var xScale = d3.time.scale()
		.range([ 0, width ]);

	var yScale = d3.scale.linear()
		.range([ 0, height ]);

	//Configure axis generators
	var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom")
		.tickFormat(function(d) {
			return dateFormat(d);
		})
		.outerTickSize([0])
		.innerTickSize([0]);

	var yAxis = d3.svg.axis()
		.scale(yScale)
		.orient("left")
		.outerTickSize([0]);

	//Configure line generator. Each line must have a d.year and a d.amount 
	var line = d3.svg.line()
		.x(function(d) {
			return xScale(dateFormat.parse(d.year));
		})
		.y(function(d) {
			return yScale(+d.amount);
		});

	// Create SVG
	var svg = d3.select("#line-graph")
		.append("svg")
		.attr("width", fullwidth)
		.attr("height", fullheight)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	var tooltip = d3.select("body")
      	.append("div")
      	.attr("class", "tooltip");

	// Load data
	d3.csv("when.csv", function(data) {

		var years = ["2006", "2007", "2008", "2009", "2010","2011","2012","2013","2014"];

		var dataset = [];

		data.forEach(function (d, i) {
			var myIncidents = [];
			years.forEach(function (y) {
				if (d[y]) {
					myIncidents.push({
						authority: d.LocalAuthority,
						year: y,
						amount: d[y]
						});
				}

			});

			dataset.push( {
				authority: d.LocalAuthority,
				emissions: myIncidents
				} );
		});

		//Set scale domains
		xScale.domain(
			d3.extent(years, function(d) {
				return dateFormat.parse(d);
			}));

		yScale.domain([
			d3.max(dataset, function(d) {
				return d3.max(d.emissions, function(d) {
					return +d.amount;
				});
			}),
			0
		]);

		//Make a group for each authority
		var groups = svg.selectAll("g")
			.data(dataset)
			.enter()
			.append("g");

		groups.selectAll("path")
			.data(function(d) { 
				return [ d.emissions ];
			})
			.enter()
			.append("path")
			.attr("class", "line")
			.classed("unfocused", true) 
			.attr("id", function(d) {
				if (d[0] && d[0].length != 0) {
					return d[0].authority.replace(/ |,|\./g, '_');
				}
			})
			.attr("d", line);

	// Tooltip dots

	var circles = groups.selectAll("circle")
						.data(function(d) { // because there's a group with data already...
									return d.emissions; // NOT an array here.
						})
						.enter()
						.append("circle");

		circles.attr("cx", function(d) {
				return xScale(dateFormat.parse(d.year));
			})
			.attr("cy", function(d) {
				return yScale(d.amount);
			})
			.attr("r", 3)
			.attr("id", function(d) {
				return d.authority.replace(/ |,|\./g, '_');
			})
			.style("opacity", 0); // this is optional - if you want visible dots or not!

		// Adding a subtle animation to increase the dot size when over it!

		circles
			.on("mouseover", mouseoverFunc)
			.on("mousemove", mousemoveFunc)
			.on("mouseout",	mouseoutFunc);

	// text label
	groups.append("text")
      .attr("x", function(d) {
      	if (d.emissions.length != 0) {
	      	var lastYear = d.emissions[d.emissions.length-1].year;
	      	return xScale(dateFormat.parse(lastYear));
	      }
      })
      .attr("y", function(d) {
      	if (d.emissions.length != 0) {
	      	var lastAmount = d.emissions[d.emissions.length-1].amount;
	      	return yScale(+lastAmount);
      	}
      })
      .attr("dx", "3px")
      .attr("dy", "3px")
      .text(function(d) {
      	if (d.emissions.length != 0) {
      		var lastAmount = d.emissions[d.emissions.length-1].amount;
      		if (+lastAmount > 1800) {
      			return d.authority;
      		}
      	}
      })
      .attr("class", "linelabel");

		//Axes
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis);

		function mouseoverFunc(d) {
			// this will highlight both a dot and its line.
			var lineid = d3.select(this).attr("id");

			d3.select(this)
				.transition()
				.style("opacity", 1)
				.attr("r", 4);

			d3.select("path#" + lineid).classed("focused", true).classed("unfocused", false);

			tooltip
				.style("display", null)
				.html("<p>Local Authority: " + d.authority +
							"<br>Year: " + d.year +
						  "<br>Incidents: " + d.amount + "</p>");
			}

		function mousemoveFunc(d) {
			tooltip
				.style("top", (d3.event.pageY - 10) + "px" )
				.style("left", (d3.event.pageX + 10) + "px");
			}

		function mouseoutFunc(d) {
			d3.select(this)
				.transition()
				.style("opacity", 0)
				.attr("r", 3);

			d3.selectAll("path.line").classed("unfocused", true).classed("focused", false);

	    tooltip.style("display", "none");  // this sets it to invisible!
	  }

	}); 
}());

// Line graph top 3 

(function(){
	//Dimensions and padding
	var fullwidth = 700;
	var fullheight = 500;
	var margin = {top: 10, right: 100, bottom: 40, left:100};

	var width = fullwidth - margin.left - margin.right;
	var height = fullheight - margin.top - margin.bottom;

	//Set up date formatting and years
	var dateFormat = d3.time.format("%Y");

	//Set up scales
	var xScale = d3.time.scale()
		.range([ 0, width ]);

	var yScale = d3.scale.linear()
		.range([ 0, height ]);

	//Configure axis generators
	var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom")
		//.ticks('')
		.tickFormat(function(d) {
			return dateFormat(d);
		})
		.outerTickSize([0])
		.innerTickSize([0]);

	var yAxis = d3.svg.axis()
		.scale(yScale)
		.orient("left")
		.outerTickSize([0]);

	//Configure line generator. Each line must have a d.year and a d.amount 
	var line = d3.svg.line()
		.x(function(d) {
			return xScale(dateFormat.parse(d.year));
		})
		.y(function(d) {
			return yScale(+d.amount);
		});

	// Create SVG
	var svg = d3.select("#vis5")
		.append("svg")
		.attr("width", fullwidth)
		.attr("height", fullheight)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	var tooltip = d3.select("body")
      	.append("div")
      	.attr("class", "tooltip");

	// Load data
	d3.csv("top3.csv", function(data) {

		var years = ["2006", "2007", "2008", "2009", "2010","2011","2012","2013","2014"];

		//Create a new, empty array to hold our restructured dataset
		var dataset = [];

		//Loop once for each row in data
		data.forEach(function (d, i) {

			var myIncidents = [];

			//Loop through all the years
			years.forEach(function (y) {
				if (d[y]) {
					myIncidents.push({
						authority: d.LocalAuthority,
						year: y,
						amount: d[y]
						});
				}

			});

			dataset.push( {
				authority: d.LocalAuthority,
				emissions: myIncidents
				} );

		});

		//Set scale
		xScale.domain(
			d3.extent(years, function(d) {
				return dateFormat.parse(d);
			}));

		yScale.domain([
			d3.max(dataset, function(d) {
				return d3.max(d.emissions, function(d) {
					return +d.amount;
				});
			}),
			0
		]);

		var groups = svg.selectAll("g")
			.data(dataset)
			.enter()
			.append("g");

		groups.selectAll("path")
			.data(function(d) { return [ d.emissions ];	})
			.enter()
			.append("path")
			.attr("class", "line")
			.classed("unfocused", true) // they are not focused till mouseover
			.attr("id", function(d) {
				if (d[0] && d[0].length != 0) {
					return d[0].authority.replace(/ |,|\./g, '_');
				}
			})
			.attr("d", line);

	// Tooltip dots

	var circles = groups.selectAll("circle")
						.data(function(d) { return d.emissions; })
						.enter()
						.append("circle");

		circles.attr("cx", function(d) {
				return xScale(dateFormat.parse(d.year));
			})
			.attr("cy", function(d) {
				return yScale(d.amount);
			})
			.attr("r", 3)
			.attr("id", function(d) {
				return d.authority.replace(/ |,|\./g, '_');
			})
			.style("opacity", 0); // this is optional - if you want visible dots or not!

		circles
			.on("mouseover", mouseoverFunc)
			.on("mousemove", mousemoveFunc)
			.on("mouseout",	mouseoutFunc);


	groups.append("text")
      .attr("x", function(d) {
      	if (d.emissions.length != 0) {
	      	var lastYear = d.emissions[d.emissions.length-1].year;
	      	return xScale(dateFormat.parse(lastYear));
	      }
      })
      .attr("y", function(d) {
      	if (d.emissions.length != 0) {
	      	var lastAmount = d.emissions[d.emissions.length-1].amount;
	      	return yScale(+lastAmount);
      	}
      })
      .attr("dx", "3px")
      .attr("dy", "3px")
      .text(function(d) {
      	if (d.emissions.length != 0) {
      		var lastAmount = d.emissions[d.emissions.length-1].amount;
      		if (+lastAmount > 4400) {
      			return d.authority;
      		}
      	}
      })
      .attr("class", "linelabel");

		//Axes
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis);

		function mouseoverFunc(d) {
			// this will highlight both a dot and its line.
			var lineid = d3.select(this).attr("id");

			d3.select(this)
				.transition()
				.style("opacity", 1)
				.attr("r", 4);

			d3.select("path#" + lineid).classed("focused", true).classed("unfocused", false);

			tooltip
				.style("display", null)
				.html("<p>Local Authority: " + d.authority +
							"<br>Year: " + d.year +
						  "<br>Incidents: " + d.amount + "</p>");
			}

		function mousemoveFunc(d) {
			tooltip
				.style("top", (d3.event.pageY - 10) + "px" )
				.style("left", (d3.event.pageX + 10) + "px");
			}

		function mouseoutFunc(d) {
			d3.select(this)
				.transition()
				.style("opacity", 0)
				.attr("r", 3);

			d3.selectAll("path.line").classed("unfocused", true).classed("focused", false);

	    tooltip.style("display", "none");  // invisible
	  }

	}); 
}()); 

// Pie 
(function(){
var pie = new d3pie("pieChart", {
	"header": {
		"title": {
			"fontSize": 24,
			"font": "verdana"
		},
		"subtitle": {
			"color": "#999999",
			"fontSize": 12,
			"font": "open sans"
		},
		"titleSubtitlePadding": null
	},
	"footer": {
		"color": "#999999",
		"fontSize": 10,
		"font": "open sans",
		"location": "bottom-left"
	},
	"size": {
		"canvasHeight": 300,
		"canvasWidth": 460,
		"pieOuterRadius": "100%"
	},
	"data": {
		"sortOrder": "value-desc",
		"content": [
			{
				"label": "Fine",
				"value": 85,
				"color": "#2484c1"
			},
			{
				"label": "Case Lost",
				"value": 1,
				"color": "#bf273e"
			},
			{
				"label": "Community Service",
				"value": 2,
				"color": "#df9b41"
			},
			{
				"label": "Discharge",
				"value": 14,
				"color": "#248838"
			},
			{
				"label": "Other (successful)",
				"value": 3,
				"color": "#956412"
			}
		]
	},
	"labels": {
		"outer": {
			"pieDistance": 20
		},
		"inner": {
			"hideWhenLessThanPercentage": 4
		},
		"mainLabel": {
			"fontSize": 11
		},
		"percentage": {
			"color": "#ffffff",
			"decimalPlaces": 0
		},
		"value": {
			"color": "#adadad",
			"fontSize": 11
		},
		"lines": {
			"enabled": true
		},
		"truncation": {
			"enabled": true
		}
	},
	"tooltips": {
		"enabled": true,
		"type": "placeholder",
		"string": "{label}: {value}",
		"styles": {
			"backgroundOpacity": 0.48
		}
	},
	"effects": {
		"pullOutSegmentOnClick": {
			"effect": "linear",
			"speed": 400,
			"size": 8
		}
	},
	"misc": {
		"gradient": {
			"enabled": true,
			"percentage": 100
		},
		"canvasPadding": {
			"right": 0
		}
	},
	"callbacks": {}
});
}()); 