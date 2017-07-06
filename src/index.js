import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3  from 'd3';
import legend   from 'd3-svg-legend/no-extend';


class Matrix extends Component {

  static propTypes = {
    data: PropTypes.array,
    centroids: PropTypes.array,
    plotId: PropTypes.string
  }

  /*
    The following function, drawGraph is a modified version 
    of the code released from https://bl.ocks.org/mbostock/4063663
    under GNU General Public License, version 3. 

    Modified in June 2017.
  */
  drawGraph(data, centroids) {

    centroids.forEach((c,i) => {
      c.isCentroid = true;
    });

    var width = 960,
      size = 230,
      padding = 20;

    var x = d3.scale.linear()
      .range([padding / 2, size - padding / 2]);

    var y = d3.scale.linear()
      .range([size - padding / 2, padding / 2]);

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(6);

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(6);

    var domainByTrait = {},
      traits = d3.keys(data[0]).filter(function(d) { return (d !== "centroid" && d !== "isCentroid") }),
      n = traits.length;

    traits.forEach(function(trait) {
      domainByTrait[trait] = d3.extent(data, function(d) { return d[trait]; });
    });

    xAxis.tickSize(size * n);
    yAxis.tickSize(-size * n);

    var brush = d3.svg.brush()
      .x(x)
      .y(y)
      .on("brushstart", brushstart)
      .on("brush", brushmove)
      .on("brushend", brushend);

    var svg = d3.select(`#${this.props.plotId}`).append("svg")
      .attr("width", size * n + padding)
      .attr("height", size * n + padding)
      .append("g")
      .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

    svg.selectAll(".x.axis")
      .data(traits)
      .enter().append("g")
      .attr("class", "x axis")
      .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
      .each(function(d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); });

    svg.selectAll(".y.axis")
      .data(traits)
      .enter().append("g")
      .attr("class", "y axis")
      .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
      .each(function(d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });

    var cell = svg.selectAll(".cell")
      .data(cross(traits, traits))
      .enter().append("g")
      .attr("class", "cell")
      .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
      .each(plot);

    // Titles for the diagonal.
    cell.filter(function(d) { return d.i === d.j; }).append("text")
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", ".71em")
      .text(function(d) { return d.x; });

    cell.call(brush);

    function plot(p) {
    var cell = d3.select(this);

    x.domain(domainByTrait[p.x]);
    y.domain(domainByTrait[p.y]);

    cell.append("rect")
      .attr("class", "frame")
      .attr("x", padding / 2)
      .attr("y", padding / 2)
      .attr("width", size - padding)
      .attr("height", size - padding);

    cell.selectAll("circle")
      .data(data)
      .enter().append("circle")
      .attr("cx", function(d) { return x(d[p.x]); })
      .attr("cy", function(d) { return y(d[p.y]); })
      .attr("r", 4)
      .attr("centroid", function(d) { return d.centroid})
      .style("fill", function(d) { return color(d.centroid) });

    cell.selectAll("centroid")
      .data(centroids)
      .enter().append("circle")
      .attr("cx", function(d) { return x(d[p.x]); })
      .attr("cy", function(d) { return y(d[p.y]); })
      .attr("r", 4)
      .attr("centroid", function(d) { return d.centroid})
      .style("fill", function(d) { return "#000000" });

    }



    function cross(a, b) {
      var c = [], n = a.length, m = b.length, i, j;
        for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
      return c;
    }

    var brushCell;

    // Clear the previously-active brush, if any.
    function brushstart(p) {
      if (brushCell !== this) {
        d3.select(brushCell).call(brush.clear());
        x.domain(domainByTrait[p.x]);
        y.domain(domainByTrait[p.y]);
        brushCell = this;
      }
    }

    function color(n) {
      var colors = ["#1f77b4",
       "#ff7f0e",
       "#2ca02c",
       "#d62728",
       "#9467bd",
       "#8c564b",
       "#e377c2",
       "#bcbd22",
       "#b82e2e",
       "#316395",
       "#994499",
       "#22aa99",
       "#aaaa11",
       "#6633cc",
       "#e67300",
       "#8b0707",
       "#651067",
       "#329262",
       "#5574a6",
       "#3b3eac"];
      return colors[n % colors.length];
    }

    // Highlight the selected circles.
    function brushmove(p) {
      var e = brush.extent();
      svg.selectAll("circle").classed("hidden", function(d) {
      return e[0][0] > d[p.x] || d[p.x] > e[1][0]
        || e[0][1] > d[p.y] || d[p.y] > e[1][1];
      });
    }

    // If the brush is empty, select all circles.
    function brushend() {
      if (brush.empty()) svg.selectAll(".hidden").classed("hidden", false);
    }

    // generate dynamic legend based on number of centroids
    var domain = [];
    var range  = [];
    for(var i = 0; i < centroids.length; i++) {
      domain.push(i.toString());
      range.push(color(i));
    }

    // add centroids to legend
    domain.push("c");
    range.push("#000000");

    /*
    * d3 legend code
    * http://d3-legend.susielu.com/
    */

    var ordinal = d3.scale.ordinal()
      .domain(domain)
      .range(range);

    var legendSelection = d3.select(`#legend-${this.props.plotId}`).append("svg");

    legendSelection.append("g")
      .attr("class", "legendOrdinal")
      .attr("transform", "translate(30,0)");

    var legendOrdinal = legend.color()
      .shape("path", d3.svg.symbol().type("triangle-up").size(150)())
      .shapePadding(5)
      .scale(ordinal)
      .on("cellclick", function(d) {
        if(d == "c"){
          svg.selectAll("circle").classed("hidden",true);
          svg.selectAll("circle").select(function(p,i) {
            if(p.isCentroid == true) {
              d3.select(this).attr("class", "");  
            }
          }); 
        }else {
          svg.selectAll("circle").classed("hidden",true);
          svg.selectAll("circle").select(function(p,i) {
            if(p.centroid == d) {
              d3.select(this).attr("class", "");  
            }
          }); 
        }
      });

    legendSelection.select(".legendOrdinal")
      .call(legendOrdinal);
  }


  componentDidMount() {
    if(this.props.data != null && this.props.centroids) {
      console.log('data',this.props.data);
      console.log('centroids',this.props.centroids);
      this.drawGraph(this.props.data, this.props.centroids);
    } else {
      console.error("Matrix properties error")
    }
  }

  render() {
    return(
      <div className="matrix-plot">
        <div className="legend" id={`legend-${this.props.plotId}`}>
        </div>
        <div className="plot" id={this.props.plotId}></div>
      </div>
    );
  }

}
export default Matrix;