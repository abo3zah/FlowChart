var canvas = document.querySelector("#drawArea");
var ctx = canvas.getContext('2d');

canvas.width = document.body.clientWidth - (16*2);
canvas.height = 500;

document.querySelector("#width").value = canvas.width;
document.querySelector("#height").value = canvas.height;

function changeCanvasDimension(){
    let width = document.querySelector("#width");
    let height = document.querySelector("#height");

    canvas.width = width.value;
    canvas.height = height.value;
}

function restore(){

}

function save(){

}

function draw(event) {
    var x = event.layerX;
    var y = event.layerY;

    let width = 100;
    let height = 100;

    ctx.fillStyle = 'hsl(0,0%,90%)';
    ctx.fillRect(x,y,width,height);

    ctx.fillStyle = 'black'
    ctx.strokeRect(x,y,width,height);
  }

canvas.addEventListener('click', function(event) {
    draw(event);
});