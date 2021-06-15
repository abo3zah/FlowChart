function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function highlightSelection(selected, targetId, shape, opacitySet, colorColumn){

    //highlight selection
    var selection = d3.select(targetId).selectAll(shape)
    selection
        .attr('opacity', selection.attr("opacity") == opacitySet? 0.15 :opacitySet)
    
    selection = selection
        .filter( (d,i) => d[colorColumn] == selected.getAttribute("class"))

    selection = selection
        .attr('opacity', selection.attr("opacity") == 0.15? 1 :opacitySet);
}

function preparationFunction(targetId, title, outerWidth, outerHeight, marginTop, marginRight, marginBottom, marginLeft,svgBackgroundColor){

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
        .style('background-color',svgBackgroundColor)
        .append("g")
            .attr('transform', 'translate(' + marginLeft + ',' + marginTop + ')')
            .attr('class', 'drawingArea')

    d3.select(targetId)
        .select('svg')
        .append('text')
            .attr("x", (outerWidth / 2))             
            .attr("y", (marginTop/ 2)+5)
            .attr("text-anchor", "middle")  
            .style("font-size", "16pt") 
            .style("font-weight","bold")
            .text(title);

    d3.select(targetId)
        .select("svg")
        .attr('onclick','')
    

    return [innerHeight, innerWidth, tickFontSize, axisLabelSize]
}

function scatterDraw(dataPath, xAxisC, yAxisC, radiusData = "", radius = 5, colorData = "", color = "", xScaleSelection='scaleLinear',yScaleSelection='scaleLinear',xAxisFormat = null, yAxisFormat = null, opacitySet = 0.6,targetId = "#drawingArea", outerWidth = 500, outerHeight = 500, marginTop = 40, marginRight = 70, marginBottom = 60, marginLeft = 70, legendLocationSelection = "bottomRight", svgBackgroundColor='white',title="", ticksShow = true) {

    ////preparing the xAxis Label
    var xAxisLabelText = xAxisC.split(/\.|_| /).map(d => d[0].toUpperCase() + d.slice(1)).join(" ");
    var yAxisLabelText = yAxisC.split(/\.|_| /).map(d => d[0].toUpperCase() + d.slice(1)).join(" ");

    ////general preparation
    title == ""? title = xAxisLabelText + " vs. " + yAxisLabelText : null
    var [innerHeight,innerWidth, tickFontSize, axisLabelSize] = preparationFunction(targetId, title, outerWidth, outerHeight, marginTop, marginRight, marginBottom, marginLeft,svgBackgroundColor);

    //select drawing area
    var g = d3.select('.drawingArea');

    //defining the colorScale
    colorData == ""? colorScale = color: colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    
    //defining the legend location
    var legendLocation = {
        topRight: [marginTop, 1],
        bottomRight: [innerHeight, -1]
    }

    function render(data) {

        //defining xScale
        var xScale = d3[xScaleSelection]()
            .range([0, innerWidth])
            .domain(d3.extent(data, d => d[xAxisC]));

        //defining xAxis ticks and Label
        g.append("g")
            .attr("transform", "translate(0," + innerHeight + ")")
            .attr('class', "x axis")
            .style('font-size', tickFontSize +'pt')
            .call(d3.axisBottom(xScale)
                .tickSize(ticksShow==true?-innerHeight:0)
                .tickFormat(xAxisFormat == "null"? null :d3.format(xAxisFormat)))
            .append("text")
                .attr('text-anchor', 'middle')
                .attr("x", innerWidth/2 + marginLeft)
                .attr("y", 30)
                .attr("class", 'label')
                .style('font-size',axisLabelSize + 'pt')
                .text(xAxisLabelText)
        
        //defining yScale
        var yScale = d3[yScaleSelection]()
            .range([innerHeight, 0])
            .domain(d3.extent(data, d => d[yAxisC]));
        
        //defining yAxis ticks and Label
        g.append("g")
            .attr('class', "y axis")
            .style('font-size', tickFontSize +'pt')
            .call(d3.axisLeft(yScale)
                .tickSize(ticksShow==true?-innerWidth:0)
                .tickFormat(yAxisFormat == "null"? null :d3.format(yAxisFormat)))
            .append("text")
                .attr("transform", "rotate(-90)")
                .attr('y',-30)
                .attr('x', -(innerHeight / 2)+30)
                .attr("class", 'label')
                .style('font-size',axisLabelSize + 'pt')
                .text(yAxisLabelText)
        
        //defining the radius scale
        radiusData == ""? rScale = radius : rScale = d3.scaleSqrt().range([0, 20]).domain([0, d3.max(data, d => d[radiusData])]);

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
                    .text(data => '( '+ data[xAxisC] + ' , ' + data[yAxisC]  + ' )')
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
                .attr('onclick','highlightSelection(this, "' + targetId +'" ,"circle",'+ opacitySet +',"' + colorData + '")')//do function here
                .attr('class',d=>d)
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

function countDraw(data, xAxisC, targetId = "#drawingArea", outerWidth = 1000, outerHeight = 500, yAxisFormat = 'null', marginTop = 40, marginRight = 70, marginBottom = 60, marginLeft = 120,svgBackgroundColor='white', xTicksShow = false, yTicksShow=false) {

    d3.dsv(",", data, d3.autoType).then((data) => render(data));

    function render(data){
        var category = data.map(d=>d[xAxisC]).filter(onlyUnique)
        var count = category.map(c => data.filter((d)=> d.Class == c).length)
    
        var data = []
        for (var i =0;i< category.length;i++){
            data.push({'name':category[i],'count':count[i]})
        }

        barDraw(data, 'name', 'count', targetId, outerWidth, outerHeight, yAxisFormat, marginTop, marginRight, marginBottom, marginLeft,svgBackgroundColor, xTicksShow, yTicksShow)
    }
}

function xAndYScale(data, xAxisC, yAxisC, bar, xScale, yScale,innerWidth, innerHeight){
    
    //extracting the data
    var xData = data.map(d=>d[xAxisC]);
    var yData = data.map(d=>d[yAxisC]);

    xScale = d3[xScale]()
        .domain(bar?xData:d3.extent(xData))
        .range([0,innerWidth])

    yScale = d3[yScale]()
        .domain(d3.extent(yData))
        .range([0,innerHeight])

    var padding = (xData.length-1)/xData.length
    
    return [xScale,yScale,padding]
}

function barDraw(data, xAxisC, yAxisC, targetId = "#drawingArea", outerWidth = 1000, outerHeight = 500, yAxisFormat = 'null', marginTop = 40, marginRight = 70, marginBottom = 60, marginLeft = 120,svgBackgroundColor='white',title='', xTicksShow = false, yTicksShow=false) {

    ////preparing the xAxis Label
    var xAxisLabelText = xAxisC.split(/\.|_| /).map(d => d[0].toUpperCase() + d.slice(1)).join(" ");
    var yAxisLabelText = yAxisC.split(/\.|_| /).map(d => d[0].toUpperCase() + d.slice(1)).join(" ");

    ////general preparation
    title == ""? title = yAxisLabelText + " by " + xAxisLabelText : null
    var [innerHeight,innerWidth, tickFontSize, axisLabelSize] = preparationFunction(targetId, title, outerWidth, outerHeight, marginTop, marginRight, marginBottom, marginLeft,svgBackgroundColor);

    //select drawing area
    var g = d3.select('.drawingArea');
    
    //drawing function
    function render(data) {

        //extracting the data
        var xData = data.map(d=>d[xAxisC]);
        var yData = data.map(d=>d[yAxisC]);
        var padding = (xData.length-1)/xData.length

        //defining xAxis Scale
        var xScale = d3.scaleBand()
            .domain(xData)
            .range([0,innerWidth])
            .padding(padding)

        //defining xAxis Labels
        g.append("g")
            .attr("transform", "translate(0," + innerHeight + ")")
            .attr('class', "x axis")
            .style('font-size',tickFontSize+'pt')
            .call(d3.axisBottom(xScale)
                .tickSize(xTicksShow==true?-innerHeight:0))
            .selectAll('text')
                .attr("transform", "translate(0,10)")
        
        //defining yAxis Scale
        var yScale = d3.scaleLinear()
            .domain([0,d3.max(yData)])
            .range([innerHeight,0])

        //yAxisFormat default
        yAxisFormat == "null" & (d3.max(yData)-d3.min(yData)>1000)?yAxisFormat="~s":null
        

        //defining yAxis Labels
        g.append("g")
        .attr('class', "y axis")
        .style('font-size',tickFontSize+'pt')
        .call(d3.axisLeft(yScale)
            .tickSize(yTicksShow==true?-innerWidth:0)
            .tickFormat(yAxisFormat == "null"? null :d3.format(yAxisFormat)))
        .append("text")
            .attr("transform", "rotate(-90)")
            .attr('y',-60)
            .attr('x', -(innerHeight / 2)+30)
            .attr("class", 'label')
            .style('font-size',axisLabelSize + 'pt')
            .text(yAxisLabelText)
            .attr('fill','black')
        
        //drawing the bars
        g.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
                .attr('x', d => xScale(d[xAxisC]))
                .attr('y', d=> yScale(d[yAxisC]))
                .attr('height', d=> innerHeight - yScale(d[yAxisC]))
                .attr('width', xScale.bandwidth())
                .attr('fill', '#69b3a2')
                .append('title')
                    .text(d => d[yAxisC])
                .exit()
                .remove();

    }

    typeof data == "string"?d3.dsv(",", data, d3.autoType).then((data) => render(data)):render(data);

}