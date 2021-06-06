let outerWidth = screen.availWidth-32;
let xAxis = "sepal_length";
let yAxis = "petal_length";
let rData = "sepal_width";
let colorData = "variety"
let circleRadius = 5;
let rMin = 1;
let rMax = 10;

let svg = d3.select("#main")
    .append("svg")
    .attr("width",outerWidth)
    .attr("height",500);

let g = svg.append("g")
    .style('border', '1px solid black')
    .attr('transform', 'translate(16,0)');

var xScale = d3.scaleLinear().range([0,outerWidth]);
var yScale = d3.scaleLinear().range([500, 0]);
var rScale = d3.scaleLinear().range([rMin, rMax]);
var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

function render(data){
    xScale.domain(d3.extent(data, d => d[xAxis]));
    yScale.domain(d3.extent(data, d => d[yAxis]));
    rScale.domain(d3.extent(data, d => d[rData]));

    
    let circles = g.selectAll("circle").data(data);

    circles.enter()
        .append("circle")
        .attr('r', data => rScale(data[rData]))
        .attr('cx', data => xScale(data[xAxis]))
        .attr('cy', data => yScale(data[yAxis]))
        .attr('fill', data => colorScale(data[colorData]))
        .attr('opacity', 0.6)
        .exit()
        .remove()
}

function type(d){
    d.sepal_length = +d.sepal_length;
    d.sepal_width = +d.sepal_width;
    d.petal_length = +d.petal_length;
    d.petal_width = +d.petal_width;
    return d;
}

d3.dsv(",","data/iris.csv", type).then((data) => render(data));
  



