function highlightSelection(selected, targetId, shape, opacitySet, colorColumn) {
    //highlight selection
    var selection = d3.select(targetId).selectAll(shape)
    selection
        .attr('opacity', selection.attr("opacity") == opacitySet ? 0.15 : opacitySet)

    selection = selection
        .filter((d, i) => d[colorColumn] == selected.getAttribute("class"))

    selection = selection
        .attr('opacity', selection.attr("opacity") == 0.15 ? 1 : opacitySet);
}

function preparationFunction(targetId, title, outerWidth, outerHeight, marginTop, marginRight, marginBottom, marginLeft, svgBackgroundColor) {

    innerHeight = outerHeight - marginTop - marginBottom;
    innerWidth = outerWidth - marginLeft - marginRight;

    //simple customization
    var tickFontSize = 10;
    var axisLabelSize = 12;

    d3.select(targetId).selectAll("svg").remove()

    d3.select(targetId)
        .append("svg")
        .attr("width", outerWidth)
        .attr("height", outerHeight)
        .style('border', "1px solid black")
        .style('background-color', svgBackgroundColor)
        .append("g")
        .attr('transform', 'translate(' + marginLeft + ',' + marginTop + ')')
        .attr('class', 'drawingArea')

    d3.select(targetId)
        .select('svg')
        .append('text')
        .attr("x", (outerWidth / 2))
        .attr("y", (marginTop / 2) + 5)
        .attr("text-anchor", "middle")
        .style("font-size", "16pt")
        .style("font-weight", "bold")
        .text(title);

    d3.select(targetId)
        .select("svg")
        .attr('onclick', '')


    return [innerHeight, innerWidth, tickFontSize, axisLabelSize]
}

function xAndYScale(data, xAxisC, yAxisC, bar, xScale, yScale, innerWidth, innerHeight, yAxisFormat, violin = false) {

    //extracting the data
    var xData = data.map(d => d[xAxisC]);
    var yData = data.map(d => d[yAxisC]);


    xScale = d3[xScale]()
        .domain(bar || violin ? xData : d3.extent(xData))
        .range([0, innerWidth])

    yScale = d3[yScale]()
        .domain(bar ? [0, d3.max(yData)] : violin ? [d3.min(yData) * 0.8, d3.max(yData) * 1.2] : d3.extent(yData))
        .range([innerHeight, 0])

    var padding = violin ? 0.5 : (xData.length - 1) / xData.length

    yAxisFormat == "null" & (d3.max(yData) - d3.min(yData) > 1000) ? yAxisFormat = "~s" : 'null'

    return [xScale, yScale, padding, yAxisFormat]
}

function drawingAxises(innerHeight, innerWidth, tickFontSize, xScale, yScale, xTicksShow, yTicksShow, xAxisFormat, yAxisFormat, marginLeft, axisLabelSize, xAxisLabelText, yAxisLabelText) {
    //select drawing area
    var g = d3.select('.drawingArea');

    //defining xAxis ticks and Label
    g.append("g")
        .attr("transform", "translate(0," + innerHeight + ")")
        .attr('class', "x axis")
        .style('font-size', tickFontSize + 'pt')
        .call(d3.axisBottom(xScale)
            .tickSize(xTicksShow == true ? -innerHeight : 0)
            .tickFormat(xAxisFormat == "null" ? null : d3.format(xAxisFormat)))
        .append("text")
            .attr('text-anchor', 'middle')
            .attr("x", innerWidth / 2)
            .attr("y", 30)
            .attr("class", 'label')
            .style('font-size', axisLabelSize + 'pt')
            .text(xAxisLabelText)

    //defining yAxis ticks and Label
    g.append("g")
        .attr('class', "y axis")
        .style('font-size', tickFontSize + 'pt')
        .call(d3.axisLeft(yScale)
            .tickSize(yTicksShow == true ? -innerWidth : 0)
            .tickFormat(yAxisFormat == "null" ? null : d3.format(yAxisFormat)))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr('y', -30)
        .attr('x', -(innerHeight / 2) + 30)
        .attr("class", 'label')
        .style('font-size', axisLabelSize + 'pt')
        .text(yAxisLabelText)
}

function scatterDraw(dataPath, xAxisC, yAxisC, radiusData = "", radius = 5, colorData = "", color = "", xScaleSelection = 'scaleLinear', yScaleSelection = 'scaleLinear', xAxisFormat = null, yAxisFormat = null, opacitySet = 0.6, targetId = "#drawingArea", outerWidth = 500, outerHeight = 500, marginTop = 40, marginRight = 70, marginBottom = 60, marginLeft = 70, legendLocationSelection = "bottomRight", svgBackgroundColor = 'white', title = "", xTicksShow = true, yTicksShow = true) {

    ////preparing the xAxis Label
    var xAxisLabelText = xAxisC.split(/\.|_| /).map(d => d[0].toUpperCase() + d.slice(1)).join(" ");
    var yAxisLabelText = yAxisC.split(/\.|_| /).map(d => d[0].toUpperCase() + d.slice(1)).join(" ");

    ////general preparation
    title == "" ? title = xAxisLabelText + " vs. " + yAxisLabelText : null
    var [innerHeight, innerWidth, tickFontSize, axisLabelSize] = preparationFunction(targetId, title, outerWidth, outerHeight, marginTop, marginRight, marginBottom, marginLeft, svgBackgroundColor);

    //select drawing area
    var g = d3.select('.drawingArea');

    //defining the colorScale
    colorData == "" ? colorScale = color : colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    //defining the legend location
    var legendLocation = {
        topRight: [marginTop, 1],
        bottomRight: [innerHeight, -1]
    }

    function render(data) {

        //defining Scales
        [xScale, yScale, padding, yAxisFormat] = xAndYScale(data, xAxisC, yAxisC, false, xScaleSelection, yScaleSelection, innerWidth, innerHeight, yAxisFormat)

        //drawing Axises
        drawingAxises(innerHeight, innerWidth, tickFontSize, xScale, yScale, xTicksShow, yTicksShow, xAxisFormat, yAxisFormat, marginLeft, axisLabelSize, xAxisLabelText, yAxisLabelText)

        //defining the radius scale
        radiusData == "" ? rScale = radius : rScale = d3.scaleSqrt().range([0, 20]).domain([0, d3.max(data, d => d[radiusData])]);

        //drawing the circles
        g.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr('r', data => Number.isInteger(rScale) ? rScale : rScale(data[radiusData]))
            .attr('cx', data => xScale(data[xAxisC]))
            .attr('cy', data => yScale(data[yAxisC]))
            .attr('fill', data => typeof colorScale == "string" ? colorScale : colorScale(data[colorData]))
            .attr('opacity', opacitySet)
            .append('title')
                .text(data => '( ' + data[xAxisC] + ' , ' + data[yAxisC] + ' )')
            .exit()
            .remove();


        if (colorData != "") {
            var legend = d3.select('svg').selectAll(".legend")
                .data(colorScale.domain());

            legend.enter()
                .append('rect')
                .attr("y", (d, i) => legendLocation[legendLocationSelection][0] + (legendLocation[legendLocationSelection][1] * i * 20))
                .attr('x', outerWidth - 30)
                .attr('width', 18)
                .attr('height', 18)
                .attr('onclick', 'highlightSelection(this, "' + targetId + '" ,"circle",' + opacitySet + ',"' + colorData + '")') //do function here
                .attr('class', d => d)
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
        }
    }

    d3.dsv(",", dataPath, d3.autoType).then((data) => render(data));

}

function countDraw(data, xAxisC, targetId = "#drawingArea", outerWidth = 1000, outerHeight = 500, yAxisFormat = 'null', marginTop = 40, marginRight = 70, marginBottom = 60, marginLeft = 120, svgBackgroundColor = 'white', xTicksShow = false, yTicksShow = false) {

    function render(data) {

        var count = []

        for (i of Array.from(d3.rollup(data, v => v.length, d => d[xAxisC]))) {
            count.push({
                'name': i[0],
                'count': i[1]
            })
        }

        barDraw(count, 'name', 'count', targetId, outerWidth, outerHeight, yAxisFormat, marginTop, marginRight, marginBottom, marginLeft, svgBackgroundColor, xTicksShow, yTicksShow)
    }

    d3.dsv(",", data, d3.autoType).then((data) => render(data));
}

function barDraw(data, xAxisC, yAxisC, targetId = "#drawingArea", outerWidth = 1000, outerHeight = 500, yAxisFormat = 'null', marginTop = 40, marginRight = 70, marginBottom = 60, marginLeft = 120, svgBackgroundColor = 'white', title = '', xTicksShow = false, yTicksShow = false) {

    ////preparing the xAxis Label
    var xAxisLabelText = xAxisC.split(/\.|_| /).map(d => d[0].toUpperCase() + d.slice(1)).join(" ");
    var yAxisLabelText = yAxisC.split(/\.|_| /).map(d => d[0].toUpperCase() + d.slice(1)).join(" ");

    ////general preparation
    title == "" ? title = yAxisLabelText + " by " + xAxisLabelText : null

    var [innerHeight, innerWidth, tickFontSize, axisLabelSize] = preparationFunction(targetId, title, outerWidth, outerHeight, marginTop, marginRight, marginBottom, marginLeft, svgBackgroundColor);

    //select drawing area
    var g = d3.select('.drawingArea');

    //drawing function
    function render(data) {

        [xScale, yScale, padding, yAxisFormat] = xAndYScale(data, xAxisC, yAxisC, true, 'scaleBand', 'scaleLinear', innerWidth, innerHeight, yAxisFormat)

        xScale = xScale.padding(padding);

        drawingAxises(innerHeight, innerWidth, tickFontSize, xScale, yScale, xTicksShow, yTicksShow, "null", yAxisFormat, marginLeft, axisLabelSize, "", yAxisLabelText)

        //drawing the bars
        g.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr('x', d => xScale(d[xAxisC]))
            .attr('y', d => yScale(d[yAxisC]))
            .attr('height', d => innerHeight - yScale(d[yAxisC]))
            .attr('width', xScale.bandwidth())
            .attr('fill', '#69b3a2')
            .append('title')
            .text(d => d[yAxisC])
            .exit()
            .remove();

    }

    typeof data == "string" ? d3.dsv(",", data, d3.autoType).then((data) => render(data)) : render(data);

}

function violinDraw(data, xAxisC, yAxisC, targetId = "#drawingArea", outerWidth = 1000, outerHeight = 500, yAxisFormat = 'null', marginTop = 40, marginRight = 70, marginBottom = 60, marginLeft = 120, svgBackgroundColor = 'white', title = '', xTicksShow = false, yTicksShow = false) {

    ////preparing the xAxis Label
    var xAxisLabelText = xAxisC.split(/\.|_| /).map(d => d[0].toUpperCase() + d.slice(1)).join(" ");
    var yAxisLabelText = yAxisC.split(/\.|_| /).map(d => d[0].toUpperCase() + d.slice(1)).join(" ");

    ////general preparation//TODO: fix title for histogram
    title == "" ? title = yAxisLabelText + " by " + xAxisLabelText : null

    var [innerHeight, innerWidth, tickFontSize, axisLabelSize] = preparationFunction(targetId, title, outerWidth, outerHeight, marginTop, marginRight, marginBottom, marginLeft, svgBackgroundColor);

    //select drawing area
    var g = d3.select('.drawingArea');

    //drawing function
    function render(data) {

        [xScale, yScale, padding, yAxisFormat] = xAndYScale(data, xAxisC, yAxisC, false, 'scaleBand', 'scaleLinear', innerWidth, innerHeight, yAxisFormat, true)

        xScale = xScale.padding(padding);

        drawingAxises(innerHeight, innerWidth, tickFontSize, xScale, yScale, xTicksShow, yTicksShow, "null", yAxisFormat, marginLeft, axisLabelSize, "", yAxisLabelText)

        // Features of the histogram
        var histogram = d3.histogram()
            .domain(yScale.domain())
            .thresholds(yScale.ticks(20)) // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
            .value(d => d)

        // Compute the binning for each group of the dataset
        var sumStat = d3.nest() // nest function allows to group the calculation per level of a factor
            .key(function (d) {
                return d[xAxisC];
            })
            .rollup(function (d) { // For each key..
                input = d.map(function (g) {
                    return g[yAxisC];
                }) // Keep the variable called Sepal_Length
                bins = histogram(input) // And compute the binning on it.
                return (bins)
            })
            .entries(data)


        // What is the biggest number of value in a bin? We need it cause this value will have a width of 100% of the bandwidth.
        var maxNum = 0
        for (i in sumStat) {
            allBins = sumStat[i].value
            lengths = allBins.map(function (a) {
                return a.length;
            })
            longest = d3.max(lengths)
            if (longest > maxNum) {
                maxNum = longest
            }
        }

        // The maximum width of a violin must be x.bandwidth = the width dedicated to a group
        var xNum = d3.scaleLinear()
            .range([0, xScale.bandwidth()])
            .domain([-maxNum, maxNum])


        //TODO: fix colors
        //drawing the bars
        g.selectAll("myViolin")
            .data(sumStat)
            .enter() // So now we are working group per group
            .append("g")
            .attr("transform", function (d) {
                return ("translate(" + xScale(d.key) + " ,0)")
            }) // Translation on the right to be at the group position
            .append("path")
            .datum(function (d) {
                return (d.value)
            }) // So now we are working bin per bin
            .style("stroke", "none")
            .style("fill", "#69b3a2")
            .attr("d", d3.area()
                .x0(function (d) {
                    return (xNum(-d.length))
                })
                .x1(function (d) {
                    return (xNum(d.length))
                })
                .y(function (d) {
                    return (yScale(d.x0))
                })
                .curve(d3.curveCatmullRom) // This makes the line smoother to give the violin appearance. Try d3.curveStep to see the difference
            )


    }

    typeof data == "string" ? d3.dsv(",", data, d3.autoType).then((data) => render(data)) : render(data);

}

function histogramDraw(data, xAxisC, colorData = "", color = "#69b3a2", xAxisMax=0,targetId = "#drawingArea",outerWidth = 1000, outerHeight = 500,marginTop = 40, marginRight = 70, marginBottom = 60, marginLeft = 70, svgBackgroundColor = 'white', title = '') {

    var xAxisLabelText = xAxisC.split(/\.|_| /).map(d => d[0].toUpperCase() + d.slice(1)).join(" ");

    // set the dimensions and margins of the graph
    innerWidth = outerWidth - marginLeft - marginRight,
    innerHeight = outerHeight - marginTop - marginBottom;

    //general preparation//TODO: fix title for histogram
    title == "" ? title = "Distribution for " + xAxisLabelText : null

    var [innerHeight, innerWidth, tickFontSize, axisLabelSize] = preparationFunction(targetId, title, outerWidth, outerHeight, marginTop, marginRight, marginBottom, marginLeft, svgBackgroundColor);


    //select drawing area
    var g = d3.select('.drawingArea');

    function render(data) {

        xAxisMax==0 ? xAxisMax=d3.max(data, d => d[xAxisC]) : null

        //set xAxis Scale
        var xScale = d3.scaleLinear()
            .domain([0, xAxisMax])
            .range([0, innerWidth]);

        // set the parameters for the histogram
        var histogram = d3.histogram()
            .value(d => d[xAxisC]) // I need to give the vector of value
            .domain(xScale.domain()) // then the domain of the graphic
            .thresholds(xScale.ticks(70)); //TODO: fix bin with ricks

        bins = []

        if (colorData == ""){
            colorScale = color
            // And apply this function to data to get the bins
            bins[0] = histogram(data);
        } else {
            colorScale = d3.scaleOrdinal(d3.schemeCategory10);
            classes = Array.from(d3.group(data, d => d[colorData]).keys())
            for (c of classes){
                bins.push(histogram(data.filter( d => d[colorData] == c)));
            }
        }
        // Y axis: scale and draw:
        var yScale = d3.scaleLinear()
            .range([innerHeight, 0]);

        yScale.domain([0, d3.max(bins[0], d => d.length)]); // d3.hist has to be called before the Y axis obviously
        
        drawingAxises(innerHeight, innerWidth, tickFontSize, xScale, yScale, false, false, "null", "null", marginLeft, axisLabelSize, xAxisLabelText, "")

        i =0
        // append the bar rectangles to the g element
        for (bin of bins){
            g.selectAll('rect'+i)
            .data(bin)
            .enter()
            .append("rect")
                .attr("x", 1)
                .attr("transform", d => "translate(" + xScale(d.x0) + "," + yScale(d.length) + ")")
                .attr("width", d => xScale(d.x1) - xScale(d.x0) - 1)
                .attr("width", d => xScale(d.x1) - xScale(d.x0) - 1)
                .attr("height", d => innerHeight - yScale(d.length))
                .attr("opacity", typeof colorScale == "string" ? 1 : 0.5)
                .attr('fill', data => typeof colorScale == "string" ? colorScale : colorScale(i))
            i++;
        }
    }

    // get the data
    d3.dsv(",", data, d3.autoType).then((data) => render(data))
}