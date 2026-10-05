var x = 500;
var y = 250;
var hoek = 0;

var snelheid = 5;       
var draaiSnelheid = 0.05; 
var levens = 3; // Nieuw: Je hebt nu 3 levens!

var kogels = []; 
var kogelSnelheid = 12;
var schietTimer = 0; 

// Nieuw: Vijandelijke luchtafweerkogels
var vijandKogels = [];
var vijandKogelSnelheid = 7;

var bommen = [];
var explosies = [];

var doelen = [];
var aantalDoelen = 25; 
var score = 0;

function setup() {
  var canvas = createCanvas(1200, 700);
  canvas.parent('processing');
  
  for (var i = 0; i < aantalDoelen; i++) {
    maakNieuwDoel(true); 
  }
}

function draw() {
  background('green');
  
  var middenX = width / 2;
  var middenY = height / 2;
  
  // Game Over check
  if (levens <= 0) {
    tekenGameOver();
    return; // Stopt de rest van de game-loop
  }
  
  // 1. Beweging van het vliegtuig
  var doelHoek = atan2(mouseY - middenY, mouseX - middenX);
  var hoekVerschil = doelHoek - hoek;
  while (hoekVerschil < -PI) hoekVerschil += TWO_PI;
  while (hoekVerschil > PI)  hoekVerschil -= TWO_PI;
  
  if (hoekVerschil > 0) hoek += min(draaiSnelheid, hoekVerschil);
  else if (hoekVerschil < 0) hoek += max(-draaiSnelheid, hoekVerschil);
  
  x += cos(hoek) * snelheid;
  y += sin(hoek) * snelheid;
  
  // --- CAMERA VERSCHUIVING START ---
  push();
  translate(middenX - x, middenY - y);
  
  // 2. Update en teken alle gronddoelen (Inclusief Luchtafweer)
  for (var i = doelen.length - 1; i >= 0; i--) {
    var d = doelen[i];
    
    if (d.type === "infanterie") {
      d.x += random(-0.5, 0.5);
      d.y += random(-0.5, 0.5);
      tekenInfanterie(d.x, d.y);
    } else if (d.type === "tank") {
      d.x += cos(d.richting) * 0.3;
      d.y += sin(d.richting) * 0.3;
      if (random(1) < 0.01) { d.richting = random(TWO_PI); }
      tekenTank(d.x, d.y, d.richting);
    } else if (d.type === "luchtafweer") {
      // Luchtafweer logica: bereken hoek naar het vliegtuig
      var hoekNaarVliegtuig = atan2(y - d.y, x - d.x);
      tekenLuchtafweer(d.x, d.y, hoekNaarVliegtuig);
      
      // Schiet als het vliegtuig binnen een straal van 450 pixels is
      var afstandTotVliegtuig = dist(x, y, d.x, d.y);
      if (afstandTotVliegtuig < 450) {
        d.herlaadTimer--;
        if (d.herlaadTimer <= 0) {
          // Schiet een rode kogel richting de huidige positie van het vliegtuig
          vijandKogels.push({
            x: d.x + cos(hoekNaarVliegtuig) * 15,
            y: d.y + sin(hoekNaarVliegtuig) * 15,
            h: hoekNaarVliegtuig
          });
          d.herlaadTimer = 75; // Wacht even voor het volgende schot
        }
      }
    }
    
    if (dist(x, y, d.x, d.y) > 1300) {
      doelen.splice(i, 1);
      maakNieuwDoel(false); 
    }
  }
  
  // 3. Vijandelijke kogels updaten en checken of ze JOU (het vliegtuig) raken
  for (var i = vijandKogels.length - 1; i >= 0; i--) {
    var vk = vijandKogels[i];
    vk.x += cos(vk.h) * vijandKogelSnelheid;
    vk.y += sin(vk.h) * vijandKogelSnelheid;
    
    // Teken vijandelijke flak-kogel (Rood met een gloed)
    fill('red');
    ellipse(vk.x, vk.y, 8, 8);
    
    // Omdat het vliegtuig altijd op (x, y) in de wereld is, checken we die afstand
    if (dist(vk.x, vk.y, x, y) < 18) {
      levens -= 1; // Au! Geraakt!
      vijandKogels.splice(i, 1);
      continue;
    }
    
    // Opruimen als de vijandelijke kogel te ver weg is
    if (dist(x, y, vk.x, vk.y) > 1000) {
      vijandKogels.splice(i, 1);
    }
  }
  
  // 4. Automatisch schieten (Speler mitrailleur)
  if (mouseIsPressed) {
    if (schietTimer <= 0) {
      schietKogel();
      schietTimer = 6; 
    }
  }
  if (schietTimer > 0) { schietTimer--; }
  
  // 5. Speler kogels updaten
  for (var i = kogels.length - 1; i >= 0; i--) {
    var k = kogels[i];
    k.x += cos(k.h) * kogelSnelheid;
    k.y += sin(k.h) * kogelSnelheid;
    
    fill('yellow');
    ellipse(k.x, k.y, 6, 6);
    
    for (var j = doelen.length - 1; j >= 0; j--) {
      var d = doelen[j];
      var afstandTotDoel = dist(k.x, k.y, d.x, d.y);
      
      // Bepaal de hitbox grootte
      var raakAfstand = 12;
      if (d.type === "tank") raakAfstand = 22;
      if (d.type === "luchtafweer") raakAfstand = 25;
      
      if (afstandTotDoel < raakAfstand) {
        // Punten toekennen
        if (d.type === "tank") score += 5;
        else if (d.type === "luchtafweer") score += 10; // Luchtafweer geeft de meeste punten!
        else score += 2;
        
        // Voeg een kleine mini-explosie toe voor de visuele feedback
        explosies.push({ x: d.x, y: d.y, straal: 0, maxStraal: 25 });
        
        doelen.splice(j, 1);
        kogels.splice(i, 1);
        maakNieuwDoel(false);
        break;
      }
    }
    if (kogels[i] && dist(x, y, k.x, k.y) > 1000) { kogels.splice(i, 1); }
  }
  
  // 6. Bommen updaten
  for (var i = bommen.length - 1; i >= 0; i--) {
    var b = bommen[i];
    b.x += b.vx; b.y += b.vy; b.timer -= 1; 
    var bomGrootte = map(b.timer, 40, 0, 8, 16);
    fill(30);
    ellipse(b.x, b.y, bomGrootte, bomGrootte);
    
    if (b.timer <= 0) {
      explosies.push({ x: b.x, y: b.y, straal: 0, maxStraal: 80 });
      bommen.splice(i, 1);
    }
  }
  
  // 7. Explosies animeren (Inclusief vernietiging van doelen)
  for (var i = explosies.length - 1; i >= 0; i--) {
    var e = explosies[i]; e.straal += 4; 
    fill(255, 69, 0, 150); ellipse(e.x, e.y, e.straal * 2, e.straal * 2);
    fill(255, 215, 0, 200); ellipse(e.x, e.y, e.straal, e.straal);
    
    for (var j = doelen.length - 1; j >= 0; j--) {
      var d = doelen[j];
      if (dist(e.x, e.y, d.x, d.y) < e.straal) {
        if (d.type === "tank") score += 5;
        else if (d.type === "luchtafweer") score += 10;
        else score += 2;
        doelen.splice(j, 1);
        maakNieuwDoel(false);
      }
    }
    if (e.straal >= e.maxStraal) { explosies.splice(i, 1); }
  }
  
  pop();
  // --- CAMERA VERSCHUIVING EIND ---
  
  // 8. Teken het vliegtuig in het midden van het scherm
  tekenVliegtuig(middenX, middenY, hoek);
  
  // 9. UI (Score en Levens)
  tekenUI();
}

function keyPressed() {
  if (keyCode === 32 && levens > 0) { gooiBom(); }
  // Druk op 'R' om te herstarten als je dood bent
  if ((key === 'r' || key === 'R') && levens <= 0) {
    levens = 3; score = 0; doelen = []; kogels = []; vijandKogels = []; bommen = []; explosies = [];
    for (var i = 0; i < aantalDoelen; i++) { maakNieuwDoel(true); }
  }
}

function schietKogel() {
  kogels.push({ x: x + cos(hoek) * 20, y: y + sin(hoek) * 20, h: hoek });
}

function gooiBom() {
  bommen.push({ x: x, y: y, vx: cos(hoek) * snelheid, vy: sin(hoek) * snelheid, timer: 40 });
}

function maakNieuwDoel(willekeurig) {
  // 50% kans infanterie, 30% kans tank, 20% kans luchtafweer
  var r = random(1);
  var gekozenType = "infanterie";
  if (r > 0.5 && r <= 0.8) gekozenType = "tank";
  if (r > 0.8) gekozenType = "luchtafweer";
  
  var dX = willekeurig ? x + random(-1200, 1200) : x + cos(hoek + random(-1, 1)) * random(900, 1200);
  var dY = willekeurig ? y + random(-1200, 1200) : y + sin(hoek + random(-1, 1)) * random(900, 1200);
  
  doelen.push({
    x: dX, y: dY, type: gekozenType, richting: random(TWO_PI), herlaadTimer: random(30, 60)
  });
}

function tekenInfanterie(ix, iy) {
  noStroke(); fill('#4a5d4e'); ellipse(ix, iy, 10, 10); 
  fill('#d2b48c'); ellipse(ix, iy - 2, 5, 5); 
}

function tekenTank(tx, ty, th) {
  push(); translate(tx, ty); rotate(th); rectMode(CENTER); noStroke();
  fill(40); rect(0, -10, 24, 6, 2); rect(0, 10, 24, 6, 2);
  fill('#556b2f'); rect(0, 0, 20, 16, 3);
  fill(50); ellipse(-2, 0, 10, 10); rect(6, 0, 12, 3); 
  pop();
}

function tekenLuchtafweer(lax, lay, laHoek) {
  push();
  translate(lax, lay);
  rectMode(CENTER);
  noStroke();
  
  // Vierkante betonnen bunkerbasis
  fill(100);
  rect(0, 0, 32, 32, 4);
  fill(70);
  ellipse(0, 0, 22, 22);
  
  // De geschutskoepel draait mee naar het vliegtuig
  rotate(laHoek);
  fill(40);
  rect(0, 0, 12, 12);
  rect(10, 0, 18, 4); // Lange dubbele loop die richting de speler wijst
  pop();
}

function tekenVliegtuig(vliegtuigX, vliegtuigY, vliegtuigHoek) {
  push(); translate(vliegtuigX, vliegtuigY); rotate(vliegtuigHoek); noStroke();
  fill('grey'); rect(-25, -5, 50, 10); rect(-5, -25, 10, 50); rect(-25, -15, 6, 30);  
  fill('black'); ellipse(20, 0, 12, 8);  
  pop(); 
}

function tekenUI() {
  fill(0, 0, 0, 100);
  rect(10, 10, 550, 45, 5);
  
  fill('white'); textSize(20); textAlign(LEFT, TOP);
  var hartjes = "".padStart(levens, "❤️");
  text("Score: " + score + "  |  Levens: " + hartjes, 25, 20);
}

function tekenGameOver() {
  background(20, 20, 20);
  fill('red'); textSize(60); textAlign(CENTER, CENTER);
  text("GAME OVER", width / 2, height / 2 - 30);
  fill('white'); textSize(24);
  text("Eindscore: " + score, width / 2, height / 2 + 30);
  textSize(18); fill(150);
  text("Druk op [ R ] om opnieuw te starten", width / 2, height / 2 + 80);
}