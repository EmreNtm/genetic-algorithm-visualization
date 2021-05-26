//Koordinatı ifade etmek için kullandığım class.
class Coordinate {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

//Genetik algoritma kodlarını içeren class.
class GeneticAlgorithm {
  constructor(
    droneAmount,
    //Bir drone'un edeceği hareket sayısı
    movementAmount,
    populationSize,
    mutationChance,
    startLocation,
    boardSize
  ) {
    //ilk popülasyonu oluştur
    this.droneAmount = droneAmount;
    this.movementAmount = movementAmount;
    this.populationSize = populationSize;
    this.mutationChance = mutationChance;
    this.startLocation = startLocation;

    //Random popülasyon oluştur
    this.population = [];
    this.populationFitnessPercentages = [];
    for (var i = 0; i < populationSize; i++) {
      this.population.push(
        new Member(
          "random",
          undefined,
          droneAmount,
          startLocation,
          movementAmount,
          boardSize
        )
      );
    }
    this.topMember = this.population[0];
    this.bestMemberOfPopulation = this.population[0];

    //Random popülasyonun fitnessa göre seçilme oranlarını bul
    this.findPopulationFitnessPercentages();
    //En iyi bireyi bul.
    this.findBestMemberOfLastGen();
  }

  //Tek bir drone'un iyilik puanını hesaplar.
  static fitnessOfADrone(drone, movementAmount, boardSize) {
    //Taranan alanı maksimum olmalı
    var scannedAreaScore = drone.scannedAreas.length;
    var outOfMapPenalty = drone.outOfMapAreas.length;
    if (outOfMapPenalty <= scannedAreaScore)
      scannedAreaScore -= outOfMapPenalty;
    //0 - 1 arasına map et. Maksimum skor = geziş sayısı
    var areaSize = boardSize * boardSize;
    scannedAreaScore /=
      movementAmount + 1 <= areaSize ? movementAmount + 1 : areaSize;

    //Dönüş açıları minimum olmalı
    var minimumAngleScore = 0;
    for (var i = 0; i < drone.moveOrder.length - 1; i++) {
      var temp = Math.abs(drone.moveOrder[i] - drone.moveOrder[i + 1]);
      if (temp == 1 || temp == 7) {
        minimumAngleScore += 0.0001;
      } else if (temp == 2 || temp == 6) {
        minimumAngleScore += 0.004;
      } else if (temp == 3 || temp == 5) {
        minimumAngleScore += 0.09;
      } else if (temp == 4) {
        minimumAngleScore += 1.6;
      } else {
        minimumAngleScore += 0;
      }
    }
    minimumAngleScore = 1 / (minimumAngleScore + 1);

    //Sonu başladığı yer olmalı
    var finishPointScore =
      Math.abs(
        drone.coordinates[drone.coordinates.length - 1].x -
          drone.startLocation.x
      ) +
      Math.abs(
        drone.coordinates[drone.coordinates.length - 1].y -
          drone.startLocation.y
      );
    finishPointScore = 1 / (finishPointScore * finishPointScore + 1);

    return (
      scannedAreaScore * 0.3 + minimumAngleScore * 0.3 + finishPointScore * 0.4
    );
  }

  //Tüm popülasyon birelyeri için iyilik puanlarına göre
  //seçilme oranı oluşturur.
  findPopulationFitnessPercentages() {
    this.populationFitnessPercentages = [];
    var sum = 0;
    for (var i = 0; i < this.population.length; i++) {
      sum += this.population[i].fitness;
    }
    for (var i = 0; i < this.population.length; i++) {
      this.populationFitnessPercentages.push(this.population[i].fitness / sum);
    }
  }

  //En yeni popülasyonun en iyi bireyini bulur.
  findBestMemberOfLastGen() {
    var max = -1;
    var bestMember = this.bestMemberOfPopulation;
    for (var i = 0; i < this.population.length; i++) {
      if (this.populationFitnessPercentages[i] > max) {
        max = this.populationFitnessPercentages[i];
        bestMember = this.population[i];
      }
    }

    if (bestMember.fitness > this.topMember.fitness) {
      this.topMember = bestMember;
    }

    this.bestMemberOfPopulation = bestMember;
  }

  //Genetik algoritmayı uygulayarak sıradaki jenerasyonu oluşturur.
  findNextGeneration() {
    var newPopulation = [];
    for (var i = 0; i < this.population.length / 2; i++) {
      var x = this.randomSelect();
      var y = this.randomSelect();

      var childs = this.reproduce(x, y);

      if (random() < this.mutationChance) {
        this.mutate(childs.child1, 0.1);
      }
      if (random() < this.mutationChance) {
        this.mutate(childs.child2, 0.1);
      }
      newPopulation.push(childs.child1);
      newPopulation.push(childs.child2);
    }
    this.population = newPopulation;
    this.findPopulationFitnessPercentages();
    this.findBestMemberOfLastGen();
  }

  //Popülasyon içerisinden iyilik oranlarına bağlı olarak
  //bir adet birey döndürür.
  randomSelect() {
    var rn = random();
    var temp = 0;
    var index = 0;
    while (temp < rn) {
      temp += this.populationFitnessPercentages[index];
      index++;
    }
    index--;

    return this.population[index];
  }

  //Verilen iki bireyi çaprazlayarak
  //2 yeni birey oluşturur.
  reproduce(memberX, memberY) {
    var child1 = new Member(
      "reproduce",
      memberX,
      undefined,
      undefined,
      undefined,
      undefined
    );
    var child2 = new Member(
      "reproduce",
      memberX,
      undefined,
      undefined,
      undefined,
      undefined
    );
    //moveOrder bul
    for (var i = 0; i < memberX.droneAmount; i++) {
      var drone1 = new Drone(
        "reproduce",
        memberX.drones[i],
        undefined,
        undefined,
        undefined
      );
      var drone2 = new Drone(
        "reproduce",
        memberX.drones[i],
        undefined,
        undefined,
        undefined
      );
      var moveOrder1 = [];
      var moveOrder2 = [];
      var randomIndex = random(memberX.drones[i].moveOrder.length);
      for (var j = 0; j < memberX.drones[i].moveOrder.length; j++) {
        if (j < randomIndex) {
          moveOrder1.push(memberX.drones[i].moveOrder[j]);
          moveOrder2.push(memberY.drones[i].moveOrder[j]);
        } else {
          moveOrder1.push(memberY.drones[i].moveOrder[j]);
          moveOrder2.push(memberX.drones[i].moveOrder[j]);
        }
      }
      drone1.moveOrder = moveOrder1;
      drone2.moveOrder = moveOrder2;

      //koordinatları bul
      drone1.findCoordinates();
      drone2.findCoordinates();
      //taranan alanı bul
      drone1.findScannedAreas();
      drone2.findScannedAreas();
      //fitness puanını bul
      drone1.findFitnessScore();
      drone2.findFitnessScore();

      child1.drones.push(drone1);
      child2.drones.push(drone2);
    }
    child1.findScannedAreas();
    child1.findFitnessScore();
    child2.findScannedAreas();
    child2.findFitnessScore();

    return { child1, child2 };
  }

  //Verilen bireyi mutasyona uğratır.
  mutate(member, percentage) {
    var amount = this.population.length * percentage;
    amount = floor(amount);
    for (var i = 0; i < member.droneAmount; i++) {
      for (var j = 0; j < amount; j++) {
        //Başlangıç değişmesin diye -1
        member.drones[i].moveOrder[
          floor(random(member.drones[i].moveOrder.length - 1)) + 1
        ] = floor(random(8));
      }
      member.drones[i].findCoordinates();
      member.drones[i].findScannedAreas();
      member.drones[i].findFitnessScore();
    }
    member.findScannedAreas();
    member.findFitnessScore();
  }
}
