const dataFetch = async () => {
    try {
        const res = await d3.dsv(",", "data/iris.csv", d3.autoType);
        return res
    }catch(err){
        console.error(err);
    }
}
const populate = (data, label, targetSelectID) => {
    
    d3.select("#dropDownGroup")
        .append("label")
            .attr("for", targetSelectID)
            .style("background-color","hsl(0,0%,40%)")
            .style("color","hsl(0,0%,100%)")
            .attr('class', 'form-control col-3')
            .text(label)

    var dropDown = d3.select("#dropDownGroup")
        .append("select")
            .attr("name", targetSelectID)
            .attr("id", targetSelectID)
            .attr("onchange","draw()")
            .attr('class', 'form-control col-3')

    var options = dropDown.selectAll("option")
            .data(data)
            .enter().append("option")
            .attr("value", function (d) { return d; })
            .text((d) => {return d==""?"":d.split(/\.|_| /).map(d => d[0].toUpperCase() + d.slice(1)).join(" ")});
}

dataFetch().then((data) => {
    populate(data.columns, "xAxis: ", "xAxisColumn");
    populate(data.columns, "yAxis: ", "yAxisColumn");
    populate(["",...data.columns], "Radius Column: ", "radiusColumn");
    populate(["",...data.columns], "Color Column: ", "colorColumn");

    document.getElementById("yAxisColumn").selectedIndex = 3;
    document.getElementById("radiusColumn").selectedIndex = 3;
    document.getElementById("colorColumn").selectedIndex = 5;

    draw();
});

function draw(){
    scatterDraw("data/iris.csv", 
    document.querySelector("#xAxisColumn").value,
    document.querySelector("#yAxisColumn").value,
    document.querySelector("#radiusColumn").value,
    5,
    document.querySelector("#colorColumn").value,
     "black", 
     d3.scaleLinear(), 
     d3.scaleLinear(),
     null, null,
     0.8,
     "#drawingArea",
     screen.availWidth-32, 500, 30, 150, 60, 120,"bottomRight")
}