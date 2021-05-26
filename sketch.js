//Bu dosya p5.js kütüphanesi kullanılarak yazılmıştır.
//Genetik algoritmanın sonuçlarının görselleştirildiği kısımdır.

var BOARD_SIZE = 9;
//Max drone amount: 4
var DRONE_AMOUNT = 4;
var MOVEMENT_AMOUNT = 18;
var POPULATION_SIZE = 5000;
var MUTATION_CHANCE = 0.01;
var START_LOCATION_X = 4;
var START_LOCATION_Y = 4;
var geneticAlgorithm;

var sliders = [];
var startButton;
var stopButton;

var averageFitnessGraphPoints = [];
var bestIndividualFitnessGraphPoints = [];

//GeneticAlgorithm oluşturulur
//Ekran ayarları yapılır
function setup() {
  createCanvas(640, 550);
  frameRate(60);
  noLoop();

  geneticAlgorithm = new GeneticAlgorithm(
    DRONE_AMOUNT,
    MOVEMENT_AMOUNT,
    POPULATION_SIZE,
    MUTATION_CHANCE,
    new Coordinate(START_LOCATION_X, START_LOCATION_Y),
    BOARD_SIZE
  );

  for (var i = 0; i < 4; i++) {
    sliders.push(createSlider(0, 255, 255, 1));
  }

  startButton = createButton("START");
  startButton.mouseClicked(() => {
    frameRate(60);
    loop();
  });
  stopButton = createButton("STOP");
  stopButton.mouseClicked(() => {
    frameRate(0);
    console.log(geneticAlgorithm.topMember);
    for (var i = 0; i < geneticAlgorithm.topMember.droneAmount; i++) {
      console.log(
        i + 1 + ".Drone: " + geneticAlgorithm.topMember.drones[i].moveOrder
      );
    }
  });

  averageFitnessGraphPoints.push(0);
  bestIndividualFitnessGraphPoints.push(0);
}

//Bu method bir sonsuz döngüdür.
//Her dönüşte GeneticAlgorithm için
//Yeni bir nesil üreten fonksiyon çağırılır
//ve sonuçlar görselleştirilir.
function draw() {
  background(230, 230, 250);
  drawBoards(BOARD_SIZE);

  drawMemberOnBoard(geneticAlgorithm.bestMemberOfPopulation, 1);
  drawMemberOnBoard(geneticAlgorithm.topMember, 0);
  drawGraph();
  drawPopulationOnGraph(geneticAlgorithm.population);
  textSize(15);
  stroke(0, 135, 135);
  text("Parameters", (2 * width) / 3 + 50, height / 9 - 25);
  text("Drone Amount: " + DRONE_AMOUNT, (2 * width) / 3 + 50, height / 9);
  text(
    "Movement Amount: " + MOVEMENT_AMOUNT,
    (2 * width) / 3 + 50,
    height / 9 + 25
  );
  text(
    "Population Size: " + POPULATION_SIZE,
    (2 * width) / 3 + 50,
    height / 9 + 50
  );
  text(
    "Mutation Chance: " + MUTATION_CHANCE,
    (2 * width) / 3 + 50,
    height / 9 + 75
  );
  text(
    "Start Location: [" + START_LOCATION_X + ", " + START_LOCATION_Y + "]",
    (2 * width) / 3 + 50,
    height / 9 + 100
  );
  textSize(20);
  text("Best Solution", width / 36, height / 9 - 25);
  text(
    "Scanned Areas: " + geneticAlgorithm.topMember.scannedAreas.length,
    width / 36,
    height / 9
  );
  text(
    "Fitness: " + geneticAlgorithm.topMember.fitness.toFixed(2),
    width / 36,
    height / 9 + 25
  );

  text(
    "Fitness: " + geneticAlgorithm.bestMemberOfPopulation.fitness.toFixed(2),
    width / 12,
    (11 * height) / 12 + 25
  );

  textSize(15);
  text("Best of Generation: " + frameCount, width / 12, (6 * height) / 12 + 25);

  //Yeni jenerasyonu üretir.
  geneticAlgorithm.findNextGeneration();
}

//Verilen popülasyon bireyini bir tahta üzerine çizen method.
function drawMemberOnBoard(member, boardNo) {
  var x = floor(width / 3);
  var offsetX = floor((width - x) / 2);
  var y = floor((height / 2) * (2 / 3));
  var offsetY = floor((height / 2 - y) / 2);
  offsetY += (height / 2) * boardNo;
  offsetX -= (width / 4) * boardNo;

  var unitWidth = floor(x / BOARD_SIZE);
  var unitHeight = floor(y / BOARD_SIZE);

  for (var k = 0; k < member.droneAmount; k++) {
    var startLocation = member.drones[k].startLocation;
    var coordinates = member.drones[k].coordinates;
    beginShape();
    pickEllipseColor(k);
    ellipse(
      offsetX + floor(unitWidth / 2) + startLocation.x * unitWidth,
      offsetY + floor(unitHeight / 2) + startLocation.y * unitHeight,
      4
    );
    vertex(
      offsetX + floor(unitWidth / 2) + startLocation.x * unitWidth,
      offsetY + floor(unitHeight / 2) + startLocation.y * unitHeight
    );
    for (var i = 0; i < coordinates.length; i++) {
      ellipse(
        offsetX + floor(unitWidth / 2) + coordinates[i].x * unitWidth,
        offsetY + floor(unitHeight / 2) + coordinates[i].y * unitHeight,
        4
      );
      vertex(
        offsetX + floor(unitWidth / 2) + coordinates[i].x * unitWidth,
        offsetY + floor(unitHeight / 2) + coordinates[i].y * unitHeight
      );
    }
    pickPathColor(k);
    endShape();
  }
}

//Tahtaları çizen method.
function drawBoards(size) {
  var x = floor(width / 3);
  var offsetX = floor((width - x) / 2);
  var y = floor((height / 2) * (2 / 3));
  var offsetY = floor((height / 2 - y) / 2);

  strokeWeight(2);
  stroke(34, 34, 93);
  beginShape(LINES);
  for (var i = 0; i <= y; i += y / size) {
    vertex(offsetX + 0, offsetY + i);
    vertex(offsetX + x, offsetY + i);
  }
  endShape();

  beginShape(LINES);
  for (var j = 0; j <= x; j += x / size) {
    vertex(offsetX + j, offsetY + 0);
    vertex(offsetX + j, offsetY + y);
  }
  endShape();

  offsetY += height / 2;
  offsetX -= width / 4;
  stroke(34, 34, 93);
  beginShape(LINES);
  for (var i = 0; i <= y; i += y / size) {
    vertex(offsetX + 0, offsetY + i);
    vertex(offsetX + x, offsetY + i);
  }
  endShape();

  beginShape(LINES);
  for (var j = 0; j <= x; j += x / size) {
    vertex(offsetX + j, offsetY + 0);
    vertex(offsetX + j, offsetY + y);
  }
  endShape();
}

//Grafiği çizen method.
function drawGraph() {
  var x = floor(width / 3);
  var offsetX = floor((width - x) / 2);
  var y = floor((height / 2) * (2 / 3));
  var offsetY = floor((height / 2 - y) / 2);

  offsetY += height / 2;
  offsetX += width / 4;
  stroke(34, 34, 93);
  line(offsetX, offsetY, offsetX, offsetY + y);
  line(offsetX, offsetY + y, offsetX + x, offsetY + y);

  textSize(15);
  stroke(0, 150, 0);
  text("Best Fitness of Generation", offsetX + 25, offsetY - 30);
  stroke(150, 0, 0);
  text("Average Fitness of Generation", offsetX + 25, offsetY - 5);
}

//Popülasyon bilgilerini kullanarak verileri
//grafiğin üzerine yerleştirir.
function drawPopulationOnGraph(population) {
  var x = floor(width / 3);
  var offsetX = floor((width - x) / 2);
  var y = floor((height / 2) * (2 / 3));
  var offsetY = floor((height / 2 - y) / 2);

  offsetY += height / 2;
  offsetX += width / 4;

  if (frameCount % 1 == 0) {
    var fitness = 0;
    for (var i = 0; i < population.length; i++) {
      fitness += population[i].fitness;
    }
    fitness /= population.length;
    averageFitnessGraphPoints.push(fitness);
    bestIndividualFitnessGraphPoints.push(
      geneticAlgorithm.bestMemberOfPopulation.fitness
    );
  }

  if (averageFitnessGraphPoints.length == x) {
    var temp = averageFitnessGraphPoints[averageFitnessGraphPoints.length - 1];
    averageFitnessGraphPoints = [];
    averageFitnessGraphPoints.push(temp);

    temp =
      bestIndividualFitnessGraphPoints[
        bestIndividualFitnessGraphPoints.length - 1
      ];
    bestIndividualFitnessGraphPoints = [];
    bestIndividualFitnessGraphPoints.push(temp);
  }

  //Average
  stroke(255, 0, 0);
  for (var i = 1; i < averageFitnessGraphPoints.length; i++) {
    line(
      offsetX + i - 1,
      offsetY + y - averageFitnessGraphPoints[i - 1] * y,
      offsetX + i,
      offsetY + y - averageFitnessGraphPoints[i] * y
    );
  }

  //Best
  stroke(0, 200, 0);
  for (var i = 1; i < bestIndividualFitnessGraphPoints.length; i++) {
    line(
      offsetX + i - 1,
      offsetY + y - bestIndividualFitnessGraphPoints[i - 1] * y,
      offsetX + i,
      offsetY + y - bestIndividualFitnessGraphPoints[i] * y
    );
  }

  stroke(0, 0, 200, 50);
  line(
    offsetX,
    offsetY + y - geneticAlgorithm.topMember.fitness * y,
    offsetX + x,
    offsetY + y - geneticAlgorithm.topMember.fitness * y
  );

  textSize(15);
  stroke(0, 0, 200, 85);
  text(
    "Fitness: \n" + geneticAlgorithm.topMember.fitness.toFixed(2),
    offsetX - 60,
    offsetY + y - geneticAlgorithm.topMember.fitness * y
  );

  textSize(15);
  stroke(0, 0, 200, 85);
  text(
    "Gen: " + (frameCount - (averageFitnessGraphPoints.length - 2)),
    offsetX - 20,
    offsetY + y + 20
  );

  text(
    "Gen: " + (frameCount - (averageFitnessGraphPoints.length - 1) + x),
    offsetX + x - 30,
    offsetY + y + 20
  );
}

function pickEllipseColor(k) {
  if (k == 0) {
    fill(153, 67, 105);
    stroke(153, 67, 105);
  } else if (k == 1) {
    fill(117, 187, 105);
    stroke(117, 187, 105);
  } else if (k == 2) {
    fill(24, 98, 209);
    stroke(24, 98, 209);
  } else {
    fill(195, 194, 34);
    stroke(195, 194, 34);
  }
}

function pickPathColor(k) {
  noFill();
  if (k == 0) {
    stroke(153, 67, 105, sliders[k].value());
  } else if (k == 1) {
    stroke(117, 187, 105, sliders[k].value());
  } else if (k == 2) {
    stroke(24, 98, 209, sliders[k].value());
  } else {
    stroke(195, 194, 34, sliders[k].value());
  }
}
