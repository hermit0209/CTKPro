const c = document.getElementById('myCanvas');
const ctx = c.getContext('2d');
// c.style.backgroundColor = '#ECE5F0';

let pointCollection;

class Vector {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z; 
    }

    set(x, y) {
        this.x = x;
        this.y = y;
    }
}
 
class PointCollection {
    constructor(){
        this.mousePos = new Vector(0, 0);
        this.pointCollectionX = 0;
        this.pointCollectionY = 0;
        this.points = [];
    }
	
    update() {
  	    for (let i = 0; i < this.points.length; i++) {
    	    let point = this.points[i]; 
            let dx = this.mousePos.x - point.curPos.x;
            let dy = this.mousePos.y - point.curPos.y;
            let d = Math.sqrt(dx ** 2 + dy ** 2);
 
            point.targetPos.x = d < 150 ? point.curPos.x - dx : point.originalPos.x;
            point.targetPos.y = d < 150 ? point.curPos.y - dy : point.originalPos.y;
            point.update();
        }
    };
 
    draw(bubbleShape, reset) {
  	    for (let i = 0; i < this.points.length; i++) {
    	    let point = this.points[i];
 
            if (point === null)
      	    continue;
 
            if (window.reset) {
      	        this.pointCollectionX = 0;
                this.pointCollectionY = 0;
                this.mousePos = new Vector(0, 0);
            }
 
            point.draw(bubbleShape, this.pointCollectionX, this.pointCollectionY, reset);
        }
    };
 
	reset = bubbleShape => {};
}
 
class Point {
    constructor(x, y, z, size, color) {
	    this.curPos = new Vector(x, y, z);
        this.color = color;
        this.friction = 0.75;//default 0.85
        this.rotationForce = 0.01;//0 ~ 0.06
        this.springStrength = 0.1;
        this.originalPos = new Vector(x, y, z);
        this.radius = size;
        this.size = size;
        this.targetPos = new Vector(x, y, z);
        this.velocity = new Vector(0.0, 0.0, 0.0);
    }
	update() {
  	    let dx = this.targetPos.x - this.curPos.x;
  	    let dy = this.targetPos.y - this.curPos.y;
  	    // Orthogonal vector is [-dy,dx]
  	    let ax = dx * this.springStrength - this.rotationForce * dy;
  	    let ay = dy * this.springStrength + this.rotationForce * dx;
 
        this.velocity.x += ax;
        this.velocity.x *= this.friction;
        this.curPos.x += this.velocity.x;
 
        this.velocity.y += ay;
        this.velocity.y *= this.friction;
        this.curPos.y += this.velocity.y;
 
        let dox = this.originalPos.x - this.curPos.x;
        let doy = this.originalPos.y - this.curPos.y;
        let d = Math.sqrt(dox ** 2 + doy ** 2);
 
        this.targetPos.z = d / 100 + 1;
        let dz = this.targetPos.z - this.curPos.z;
        let az = dz * this.springStrength;
        this.velocity.z += az;
        this.velocity.z *= this.friction;
        this.curPos.z += this.velocity.z;
 
        this.radius = this.size * this.curPos.z;
        if (this.radius < 1) this.radius = 1;
	};
 
	draw(bubbleShape, dx, dy) {
        ctx.fillStyle = this.color;
        if (bubbleShape == "square") {
      	    ctx.beginPath();
            ctx.fillRect(this.curPos.x + dx, this.curPos.y + dy, this.radius * 1.5, this.radius * 1.5);
        }else if(bubbleShape == "triangle"){
            ctx.beginPath();
            ctx.moveTo(this.curPos.x + dx, this.curPos.y + dy);// move to vertex A
            ctx.lineTo(this.curPos.x + dx, this.curPos.y + dy + this.radius * 1.5);// move to vertex B
            ctx.lineTo(this.curPos.x + dx + this.radius * 1.5, this.curPos.y + dy + this.radius * 1.5);//to C
            ctx.fill();
        }else{
            ctx.beginPath();
            ctx.arc(this.curPos.x + dx, this.curPos.y + dy, this.radius, 0, Math.PI * 2, true);
            ctx.fill();
        }
    };
}

function makeColor(hslList) {
    let hue = hslList[0];
    let sat = hslList[1];
    let lgt = hslList[2];
    return `hsl( ${hue}, ${sat}%, ${lgt}%)`;
}

function initEventListeners() {
    window.addEventListener("resize",() => drawName(letterColors));
    window.addEventListener("mousemove", e => {
        if (pointCollection) {
            pointCollection.mousePos.set(e.x - c.offsetLeft, e.y - c.offsetTop);
        }
    });

    c.ontouchmove = e => {
        e.preventDefault();
        onTouchMove(e);
    };
 
    c.ontouchstart = e => e.preventDefault();
}
 
function onTouchMove(e) {
    if (pointCollection) {
        pointCollection.mousePos.set(
            e.targetTouches[0].pageX - c.offsetLeft, e.targetTouches[0].pageY - c.offsetTop
        );
    }
}
 

function draw(reset) {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    
    bubbleShape = typeof bubbleShape !== 'undefined' ? bubbleShape : "circle";
    
    if (pointCollection) {
        pointCollection.draw(bubbleShape, reset);
        pointCollection.update();
    }
}

function drawName(letterColors) {
    console.time("timetest");
    
    draw();
    let offset = 0;
    let g = [];
    let scale = 4.5; 

    // letterColors = [[0, 0, 27]];
        
    let pts_ct = document.points.P_ct;
    let pts_k = document.points.P_k;
            
    for (let i=0, j=0; i < pts_ct.length, j < pts_k.length; ++i,++j) {
        pt_ct = pts_ct[i];
        pt_k = pts_k[j];
        g.push(
            new Point(pt_ct[0] * scale,
            pt_ct[1] * scale -10,
            0,
            1 * scale,//size
            makeColor(letterColors[i % letterColors.length]))
        );
        g.push(
            new Point(pt_k[0] * scale,
            pt_k[1] * scale -10,
            0,
            1 * scale,//size
            makeColor([0, 0, 27]))
        );

    }
    
    for (let j = 0; j < g.length; j++) {
        g[j].curPos.x = (window.innerWidth / 2 - offset / 2) + g[j].curPos.x;
        g[j].curPos.y = (window.innerHeight / 2 - 105) + g[j].curPos.y;
        g[j].originalPos.x = (window.innerWidth / 2 - offset / 2) + g[j].originalPos.x;
        g[j].originalPos.y = (window.innerHeight / 2 - 105) + g[j].originalPos.y;
    }

    pointCollection = new PointCollection();
    pointCollection.points = g;
    
    console.timeEnd("timetest");
}

function bounceBubbles() {
    draw();
    setTimeout(bounceBubbles, 30);
}

window.reset = false;
window.addEventListener("mouseout",() => window.reset = true)
window.addEventListener("mouseover",() => window.reset = false)


let space = [201, 36, 41];
let blue = [202, 45, 35];
let indigo = [202, 44, 29];
let metal = [201, 43, 24];
let dark = [201, 44, 15];

let letterColors = [space, blue, indigo, metal, dark];

// bubbleShape = 'square';
bubbleShape = 'circle';
// bubbleShape = 'triangle';

drawName(letterColors);
initEventListeners();

bounceBubbles();

