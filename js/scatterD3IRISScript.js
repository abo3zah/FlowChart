var outerWidth = screen.availWidth - 32;
var outerHeight = 500;

var margin = {
    top: 30,
    right: 70,
    bottom: 60,
    left: 120
};

var innerHeight = outerHeight - margin.top - margin.bottom;
var innerWidth = outerWidth - margin.left - margin.right;

var xAxisC = "sepal_length";
var yAxisC = "petal_length";
var rData = "sepal_width";
var colorData = "variety";
var legendLocationSelection = "bottomRight"
var rMin = 5;
var rMax = 5;
var xAxisLabelOffset = 50;
var yAxisLabelOffset = 70;
var xAxisLabelText = xAxisC.split("_").map(d => d[0].toUpperCase() + d.slice(1)).join(" ");
var yAxisLabelText = yAxisC.split("_").map(d => d[0].toUpperCase() + d.slice(1)).join(" ");
var filtered = false;

var legendLocation = {
    topRight: [0, 1],
    bottomRight: [innerHeight - xAxisLabelOffset, -1]
}

var xScale = d3.scaleLinear().range([0, innerWidth]);
var yScale = d3.scaleLinear().range([innerHeight, 0]);
var rScale = d3.scaleSqrt().range([rMin, rMax]);
var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

var yAxis = d3.axisLeft(yScale);
var xAxis = d3.axisBottom(xScale);

var svg = d3.select("#main")
    .append("svg")
    .attr("width", outerWidth)
    .attr("height", outerHeight)

var g = svg.append("g")
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

var xAxisG = g.append("g")
    .attr("transform", "translate(0," + innerHeight + ")")
    .attr('class', "x axis")

var xAxisLabel = xAxisG.append("text")
    .attr('text-anchor', 'middle')
    .attr("transform", "translate(" + (innerWidth / 2) + ", " + xAxisLabelOffset + ")")
    .attr("class", 'label')
    .text(xAxisLabelText)

var yAxisG = g.append("g")
    .attr('class', "y axis")

var yAxisLabel = yAxisG.append("text")
    .attr("transform", "translate(" + -yAxisLabelOffset + ", " + (innerHeight / 2 + yAxisLabelOffset) + ") rotate(90)")
    .attr("class", 'label')
    .text(yAxisLabelText)

function render(data) {
    xScale.domain(d3.extent(data, d => d[xAxisC]));
    yScale.domain(d3.extent(data, d => d[yAxisC]));
    rScale.domain([0, d3.max(data, d => d[rData])]);

    xAxisG.call(xAxis);
    yAxisG.call(yAxis);

    var circles = g.selectAll("circle").data(data);

    circles.enter()
        .append("circle")
        .attr('r', data => rScale(data[rData]))
        .attr('cx', data => xScale(data[xAxisC]))
        .attr('cy', data => yScale(data[yAxisC]))
        .attr('fill', data => colorScale(data[colorData]))
        .attr('opacity', 0.6)
        .exit()
        .remove();

    var legend = g.selectAll(".legend")
        .data(colorScale.domain());

    legend.enter()
        .append('rect')
        .attr("y", (d, i) => legendLocation[legendLocationSelection][0] + (legendLocation[legendLocationSelection][1] * i * 20))
        .attr('x', innerWidth)
        .attr('width', 18)
        .attr('height', 18)
        .attr('fill', colorScale)
        .exit()
        .remove();

    legend.enter()
        .append('text')
        .attr('x', innerWidth - 6)
        .attr('y', (d, i) => legendLocation[legendLocationSelection][0] + (legendLocation[legendLocationSelection][1] * i * 20) + 8)
        .attr('dy', '.35em')
        .style('text-anchor', 'end')
        .text(function (d) {
            return d;
        })
        .exit()
        .remove();
    
    var rects = document.querySelectorAll('rect')

    rects.forEach(rect => {
        rect.addEventListener('click', event => {
            if (filtered){
                filtered=false;
                d3.selectAll('circle')
                    .style('opacity', 0.6)
            }else{
                filtered=true;
                d3.selectAll('circle')
                    .style('opacity', 0.15)
                    .filter(function (d) {
                        return colorScale(d[colorData]) == event.target.attributes.fill.nodeValue;
                    })
                    .style('opacity', 1);
            }
        });
    });

    legend.onclick = function (type) {
        d3.selectAll('circle')
            .style('opacity', 0.15)
            .filter(function (d) {
                return data[colorData] == type;
            })
            .style('opacity', 1);
    }
}

function type(d) {
    d.sepal_length = +d.sepal_length;
    d.sepal_width = +d.sepal_width;
    d.petal_length = +d.petal_length;
    d.petal_width = +d.petal_width;
    return d;
}

d3.dsv(",", "data/iris.csv", type).then((data) => render(data));
