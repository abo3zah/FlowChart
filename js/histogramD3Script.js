const loadingFile = () => {
    const dataFetch = async () => {
        try {
            const res = await d3.dsv(",", document.querySelector("#filePath").value, d3.autoType);
            return res
        } catch (err) {
            console.error(err);
        }
    }
    const populate = (data, label, targetSelectID) => {

        d3.select("#dropDownGroup")
            .append("label")
            .attr("for", targetSelectID)
            .attr('class', 'form-control')
            .text(label)

        var dropDown = d3.select("#dropDownGroup")
            .append("select")
            .attr("name", targetSelectID)
            .attr("id", targetSelectID)
            .attr("onchange", "draw()")
            .attr('class', 'form-control')

        var options = dropDown.selectAll("option")
            .data(data)
            .enter().append("option")
            .attr("value", function (d) {
                return d;
            })
            .text((d) => {
                return d == "" ? "" : d.split(/\.|_| /).map(d => d[0].toUpperCase() + d.slice(1)).join(" ")
            });
    }

    dataFetch().then((data) => {
        d3.select("#dropDownGroup").selectAll('label').remove()
        d3.select("#dropDownGroup").selectAll('select').remove()
        populate(data.columns, "xAxis: ", "xAxisColumn");
        populate(data.columns, "yAxis: ", "yAxisColumn");

        document.querySelector("#xAxisColumn").selectedIndex = 4;
        document.querySelector("#yAxisColumn").selectedIndex = 0;

        draw();
    });
}

const draw = () => {
    histogramDraw(
        document.querySelector("#filePath").value,
        document.querySelector("#xAxisColumn").value,
        document.querySelector("#yAxisColumn").value,
        "#drawingArea",
        document.querySelector("#drawingWidth").value,
        document.querySelector("#drawingHeight").value,
        document.querySelector("#yAxisTickFormat").value,
        undefined,undefined,undefined,undefined,
        document.querySelector('#svgBackgroundColor').value,
        document.querySelector('#title').value
    )
}

//initalizing
document.querySelector("#drawingWidth").value = document.body.clientWidth - 32;
loadingFile()



