var outerWidth = screen.availWidth - 32;
var outerHeight = 500;

var marginLeft = 60;
var marginTop = 32;
var marginRight = 32;
var marginBottom = 60;

var innerWidth = outerWidth - marginLeft - marginRight;
var innerHeight = outerHeight - marginTop - marginBottom;

var xAxisC = "population";
var yAxisC = "gdp";
var rSize = "population";
var xAxisLabelText = xAxisC[0].toUpperCase() + xAxisC.slice(1);
var xAxisLabelOffset = 45;
var rMax = 20;
var rMin = 0;

var xScale = d3.scaleLog().range([0,innerWidth]);
var yScale = d3.scaleLog().range([innerHeight, 0]);
var rScale = d3.scaleSqrt().range([rMin, rMax]);

var yAxis = d3.axisLeft(yScale);
var xAxis = d3.axisBottom(xScale);


var svg = d3.select("#main")
    .append("svg")
    .attr("width",outerWidth)
    .attr("height",outerHeight);

var g = svg.append("g")
    .style('border', '1px solid black')
    .attr('transform', 'translate(' + marginLeft + ','+ marginTop + ')')

var yAxisG = g.append("g")
    .attr("class","y axis")
    
var xAxisG = g.append("g")
    .attr("class","x axis")
    .attr('transform', "translate(0,"+ innerHeight + ")")

var xAxisLabel = xAxisG.append("text")
    .style('text-anchor', "middle")
    .attr("transform", "translate(" + (innerWidth / 2) + ", " + xAxisLabelOffset + ")")
    .attr('class', "label")
    .text(xAxisLabelText);

function render(data){
    xScale.domain(d3.extent(data, d => d[xAxisC]));
    yScale.domain(d3.extent(data, d => d[yAxisC]));
    rScale.domain([0, d3.max(data, d => d[rSize])]);

    xAxisG.call(xAxis);
    yAxisG.call(yAxis);
    
    var circles = g.selectAll("circle").data(data);

    circles.enter()
        .append("circle")
        .attr('r', data => rScale(data[rSize]))
        .attr('cx', data => xScale(data[xAxisC]))
        .attr('cy', data => yScale(data[yAxisC]))
        .attr('fill', 'black')
        .attr('opacity', 0.6)
        .exit()
        .remove()
}

function type(d){
    d.population = +d.population;
    d.gdp = +d.gdp;
    return d;
}

d3.dsv(",","data/population_vs_gdp.csv", type).then((data) => render(data));
  



