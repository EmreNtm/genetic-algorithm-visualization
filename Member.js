//Popülasyon içerisindeki bireyler bu classa aittir.
//İçerisinde Drone class'ına ait elemanlar bulundurur.
class Member {
  constructor(
    //oluşum sebebine göre constructor değiştirir.
    //(Rastgele veya çaprazlama sonucu oluşum)
    mode,
    parent,
    droneAmount,
    startLocation,
    movementAmount,
    boardSize
  ) {
    if (mode == "reproduce") {
      this.constructor2(parent);
      return;
    }

    this.droneAmount = droneAmount;
    this.movementAmount = movementAmount;
    this.boardSize = boardSize;
    this.startLocation = startLocation;
    this.fitness = -1;

    //Drone'ları oluşturur
    this.drones = [];
    for (var i = 0; i < this.droneAmount; i++) {
      this.drones.push(
        new Drone(
          "random",
          undefined,
          this.startLocation,
          this.movementAmount,
          this.boardSize
        )
      );
    }
    this.scannedAreas = [];

    //Oluşan drone'ların gezdiği yerleri kullanarak
    //gezilen alanları bulur.
    this.findScannedAreas();

    //Drone'ların kendi iyilik puanlarını da kullanarak
    //bireyin iyilik puanı hesaplanır.
    this.findFitnessScore();
  }

  //Birey çaprazlama sonucu oluşmuşsa bu constructor çalışır.
  constructor2(parentX) {
    this.droneAmount = parentX.droneAmount;
    this.movementAmount = parentX.movementAmount;
    this.boardSize = parentX.boardSize;
    this.startLocation = parentX.startLocation;
    this.fitness = -1;
    this.drones = [];
  }

  //Bireyin iyilik pyanını hesaplar.
  //iyilik puanı:
  //droneların iyilik puanı ortalaması * 0.6  + gezilen alan skoru * 0.4
  findFitnessScore() {
    //Droneların ayrı ayrı skorlarının ortalaması
    var individualDroneAverage = 0;
    for (var i = 0; i < this.droneAmount; i++) {
      individualDroneAverage += this.drones[i].fitness;
    }
    individualDroneAverage /= this.drones.length;

    var totalScannedAreaScore = this.scannedAreas.length;
    var areaSize = this.boardSize * this.boardSize;
    totalScannedAreaScore /=
      this.movementAmount * this.droneAmount <= areaSize
        ? this.movementAmount * this.droneAmount
        : areaSize;

    this.fitness = individualDroneAverage * 0.6 + totalScannedAreaScore * 0.4;
  }

  //Elemanı olan drone'ların gezdikleri alanları birleştirir.
  findScannedAreas() {
    this.scannedAreas = [];
    for (var i = 0; i < this.droneAmount; i++) {
      for (var j = 0; j < this.drones[i].scannedAreas.length; j++) {
        if (
          !this.isScannedAlready(
            new Coordinate(
              this.drones[i].scannedAreas[j][0],
              this.drones[i].scannedAreas[j][1]
            )
          )
        ) {
          this.scannedAreas.push([
            this.drones[i].scannedAreas[j][0],
            this.drones[i].scannedAreas[j][1],
          ]);
        }
      }
    }
  }

  //Bir koordinatın zaten taranıp taranmadığını verir.
  isScannedAlready(coordinate) {
    for (var i = 0; i < this.scannedAreas.length; i++) {
      if (
        this.scannedAreas[i][0] == coordinate.x &&
        this.scannedAreas[i][1] == coordinate.y
      )
        return true;
    }
    return false;
  }
}

//Geziş yönlerinin listesini içeren class
class Drone {
  constructor(mode, parent, startLocation, movementAmount, boardSize) {
    if (mode == "reproduce") {
      this.constructor2(parent);
      return;
    }

    //Dronelar rastgele oluşmuşsa bu constructor çalışır.
    this.movementAmount = movementAmount;
    this.boardSize = boardSize;

    this.moveOrder = [];
    this.startLocation = startLocation;
    this.coordinates = [];
    this.scannedAreas = [];
    this.outOfMapAreas = [];

    //Rastgele hareketler oluşturur.
    for (var i = 0; i < movementAmount; i++) {
      this.moveOrder.push(floor(random(8)));
    }
    //moveOrder hazırken kullanınca koordinatları bulur.
    this.findCoordinates();
    //koordinatlar hazırken kullanınca taranan alanı bulur.
    this.findScannedAreas();

    //taranan alan hazırken kullanılınca fitness puanını bulur.
    this.fitness = -1;
    this.findFitnessScore();
  }

  //Çaprazlama sonucu oluşursa bu constructor çalışır.
  constructor2(parentX) {
    this.movementAmount = parentX.movementAmount;
    this.boardSize = parentX.boardSize;

    this.moveOrder = [];
    this.startLocation = parentX.startLocation;
    this.coordinates = [];
    this.scannedAreas = [];
    this.outOfMapAreas = [];
    //Daha ölçülmedi.
    this.fitness = -1;
  }

  //Yapılan hareketlere göre gezilen koordinatları bulur.
  findCoordinates() {
    this.coordinates = [];
    for (var i = 0; i < this.moveOrder.length; i++) {
      if (i == 0) {
        this.coordinates.push(
          new Coordinate(this.startLocation.x, this.startLocation.y)
        );
      } else {
        this.coordinates.push(
          new Coordinate(this.coordinates[i - 1].x, this.coordinates[i - 1].y)
        );
      }

      if (this.moveOrder[i] == 0) {
        this.coordinates[i].y -= 1;
      } else if (this.moveOrder[i] == 1) {
        this.coordinates[i].x -= 1;
        this.coordinates[i].y -= 1;
      } else if (this.moveOrder[i] == 2) {
        this.coordinates[i].x -= 1;
      } else if (this.moveOrder[i] == 3) {
        this.coordinates[i].x -= 1;
        this.coordinates[i].y += 1;
      } else if (this.moveOrder[i] == 4) {
        this.coordinates[i].y += 1;
      } else if (this.moveOrder[i] == 5) {
        this.coordinates[i].x += 1;
        this.coordinates[i].y += 1;
      } else if (this.moveOrder[i] == 6) {
        this.coordinates[i].x += 1;
      } else if (this.moveOrder[i] == 7) {
        this.coordinates[i].x += 1;
        this.coordinates[i].y -= 1;
      }
    }
  }

  //Gezilen koordinatların bir seti.
  findScannedAreas() {
    this.scannedAreas = [];
    this.outOfMapAreas = [];
    this.scannedAreas.push([this.startLocation.x, this.startLocation.y]);
    for (var i = 0; i < this.coordinates.length; i++) {
      if (
        this.coordinates[i].x >= 0 &&
        this.coordinates[i].x < this.boardSize &&
        this.coordinates[i].y >= 0 &&
        this.coordinates[i].y < this.boardSize
      ) {
        if (!this.isScannedAlready(this.coordinates[i]))
          this.scannedAreas.push([
            this.coordinates[i].x,
            this.coordinates[i].y,
          ]);
      } else {
        this.outOfMapAreas.push([this.coordinates[i].x, this.coordinates[i].y]);
      }
    }
  }

  //Bir koordinat taranan alanların içinde zaten var mı kontrolü yapar.
  isScannedAlready(coordinate) {
    for (var i = 0; i < this.scannedAreas.length; i++) {
      if (
        this.scannedAreas[i][0] == coordinate.x &&
        this.scannedAreas[i][1] == coordinate.y
      )
        return true;
    }
    return false;
  }

  //GeneticAlgorithm classındaki methodu kullanarak
  //kendisinin diğer drone'lardan bağımsız iyilik puanını bulur.
  findFitnessScore() {
    this.fitness = GeneticAlgorithm.fitnessOfADrone(
      this,
      this.movementAmount,
      this.boardSize
    );
  }
}
