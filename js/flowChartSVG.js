const select = d3.select;

let shape='rect';

console.log(d3.median([0,5,10]));

function draw(event,shape){
    if (shape=='circle'){
        let drawing = drawArea.append('circle')
                                .attr('r',40)
                                .attr('cx',event.clientX)
                                .attr('cy',event.clientY-132)
                                .attr('fill', itemColor)
                                .attr('stroke', 'black');
    } else if (shape=='rect'){
        let drawing = drawArea.append('rect')
                                .attr('width',selectionSVGHeight-30)
                                .attr('height',selectionSVGHeight-30)
                                .attr('x',event.clientX-50)
                                .attr('y',event.clientY-132)
                                .attr('fill', itemColor)
                                .attr('stroke', 'black')
                                .attr('onclick','shape="rect"');
    }
}

const svgWidth = screen.width - 16;
const selectionSVGHeight = 100;
const itemColor = 'hsl(0,0%,90%)';
const SVGColor = 'hsl(0,0%,80%)';
const myBorder = '1px solid black';

const selectionArea = select('#selectionArea')
                        .attr('width', svgWidth)
                        .attr('height', selectionSVGHeight)
                        .style('background-color', SVGColor)
                        .style('border', myBorder);

const circle = selectionArea.append('circle')
                    .attr('r',selectionSVGHeight/3)
                    .attr('cx',selectionSVGHeight/2)
                    .attr('cy',selectionSVGHeight/2)
                    .attr('fill', itemColor)
                    .attr('stroke', 'black')
                    .attr('onclick','shape="circle"');

const rect = selectionArea.append('rect')
                    .attr('width',selectionSVGHeight-30)
                    .attr('height',selectionSVGHeight-30)
                    .attr('x',110)
                    .attr('y',15)
                    .attr('fill', itemColor)
                    .attr('stroke', 'black')
                    .attr('onclick','shape="rect"');


const drawArea = select('#drawArea')
                .attr('width', svgWidth)
                .attr('height', 500)
                .style('background-color',SVGColor)
                .style('border', myBorder)
                .attr('onclick','draw(event,shape)');
