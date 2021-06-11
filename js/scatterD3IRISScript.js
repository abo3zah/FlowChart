

const dataFetch = async () => {
    try {
        const res = await d3.dsv(",", "data/iris.csv", d3.autoType);
        return res
    }catch(err){
        console.error(err);
    }
}

const populate = (data, label, targetSelectID) => {
    
    d3.select("#main")
        .append("label")
            .attr("for", targetSelectID)
            .text(label)

    var dropDown = d3.select("#main")
        .append("select")
            .attr("name", targetSelectID)
            .attr("id", targetSelectID)
            .attr("class", "form-control")
            .attr("onchange","draw()")

    var options = dropDown.selectAll("option")
            .data(data)
            .enter().append("option")
            .attr("value", function (d) { return d; })
            .text(function (d) { return d; });
}

dataFetch().then((data) => {
    populate(data.columns, "xAxis", "xAxisColumn");
    populate(data.columns, "yAxis", "yAxisColumn");
    populate(["",...data.columns], "Radius Column", "radiusColumn");
    populate(["",...data.columns], "Color Column", "colorColumn");

    d3.select("#main").append("br")

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
     "#main",
     screen.availWidth-32, 500, 30, 150, 60, 120,"bottomRight")
}