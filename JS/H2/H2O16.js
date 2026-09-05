var spriteSheet;
var rij = 0;
var aantalSpriteRijen = 4;
var aantalSpriteKolommen = 12;

var schaal = 2.0;
var breedte; 
var hoogte; 
var sBr; 
var sHo; 
var br;
var ho; 
var x = 190; 
var y = 100;

function preload() {
  spriteSheet = loadImage("images/sprites/Pony.png");
}

function setup() {
  canvas = createCanvas(460,280);
  canvas.parent('processing');
  textFont("Georgia");
  textSize(18);
  noStroke();
  frameRate(10);
  breedte = spriteSheet.width;
  hoogte = spriteSheet.height;
  sBr = breedte / aantalSpriteKolommen;
  sHo = hoogte / aantalSpriteRijen;
  br = sBr*schaal;
  ho = sBr*schaal;
}

function draw() {
  background('lavender');
  image(spriteSheet,x,y,br,ho,(frameCount % aantalSpriteKolommen)*sBr,rij*sHo,sBr,sHo);

  if(keyIsDown(UP_ARROW)){
    y -= 10
    rij = 3
  }
  
  if(keyIsDown(DOWN_ARROW)){
    y += 10
    rij = 0
  }
  if(keyIsDown(RIGHT_ARROW)){
    x += 10
    rij = 2
  }
  if(keyIsDown(LEFT_ARROW)){
    x -= 10
    rij = 1
  }
x = constrain(x,0,width-br)
y = constrain(y,0,height-ho)
}