function scatterDraw(dataPath, xAxisC, yAxisC, radiusData = "", radius = 5, colorData = "", color = "", xScale=d3.scaleLinear(),yScale=d3.scaleLinear(),targetId = "#main", outerWidth = 500, outerHeight = 500, marginTop = 30, marginRight = 70, marginBottom = 60, marginLeft = 120, legendLocationSelection = "bottomRight") {


    var innerHeight = outerHeight - marginTop - marginBottom;
    var innerWidth = outerWidth - marginLeft - marginRight;

    if (radiusData == "") {
        var rScale = radius;
    } else {
        var rMin = 0;
        var rMax = 20;
        var rScale = d3.scaleSqrt().range([rMin, rMax]);
    }

    if (colorData == "") {
        var colorScale = color;
    } else {
        var colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    }

    var xAxisLabelOffset = 50;
    var yAxisLabelOffset = 80;

    var xAxisLabelText = xAxisC.split(/\.|_| /).map(d => d[0].toUpperCase() + d.slice(1)).join(" ");
    var yAxisLabelText = yAxisC.split(/\.|_| /).map(d => d[0].toUpperCase() + d.slice(1)).join(" ");
    var filtered = false;

    var legendLocation = {
        topRight: [0, 1],
        bottomRight: [innerHeight - xAxisLabelOffset, -1]
    }

    xScale = xScale.range([0, innerWidth]);
    yScale = yScale.range([innerHeight, 0]);


    var yAxis = d3.axisLeft(yScale);
    var xAxis = d3.axisBottom(xScale);

    var svg = d3.select(targetId)
        .append("svg")
        .attr("width", outerWidth)
        .attr("height", outerHeight)

    var g = svg.append("g")
        .attr('transform', 'translate(' + marginLeft + ',' + marginTop + ')')

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
        Number.isInteger(rScale) ? null : rScale.domain([0, d3.max(data, d => d[radiusData])]);

        xAxisG.call(xAxis);
        yAxisG.call(yAxis);

        var circles = g.selectAll("circle").data(data);

        circles.enter()
            .append("circle")
            .attr('r', data => Number.isInteger(rScale) ? rScale : rScale(data[radiusData]))
            .attr('cx', data => xScale(data[xAxisC]))
            .attr('cy', data => yScale(data[yAxisC]))
            .attr('fill', data => typeof colorScale == "string" ? colorScale : colorScale(data[colorData]))
            .attr('opacity', 0.6)
            .exit()
            .remove();


        if (typeof colorScale != "string") {
            var legend = svg.selectAll(".legend")
                .data(colorScale.domain());

            legend.enter()
                .append('rect')
                .attr("y", (d, i) => legendLocation[legendLocationSelection][0] + (legendLocation[legendLocationSelection][1] * i * 20))
                .attr('x', outerWidth - 30)
                .attr('width', 18)
                .attr('height', 18)
                .attr('fill', colorScale)
                .exit()
                .remove();

            legend.enter()
                .append('text')
                .attr('x', outerWidth - 40)
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
                    if (filtered) {
                        filtered = false;
                        d3.selectAll('circle')
                            .style('opacity', 0.6)
                    } else {
                        filtered = true;
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
    }

    d3.dsv(",", dataPath, d3.autoType).then((data) => render(data));

}