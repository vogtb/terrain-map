$(document).ready(function() {

  function indexOfMax(arr) {
    if (arr.length === 0) {
      return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var ind = 1; ind < arr.length; ind++) {
      if (arr[ind] > max) {
        maxIndex = ind;
        max = arr[ind];
      }
    }
    return maxIndex;
  }

  function indexOfMin(arr) {
    if (arr.length === 0) {
      return -1;
    }

    var min = arr[0];
    var minIndex = 0;

    for (var ind = 1; ind < arr.length; ind++) {
      if (arr[ind] < min) {
        minIndex = ind;
        min = arr[ind];
      }
    }
    return minIndex;
  }

  function LandMap(options) {
    var level = 8;
    this.containerId = options.containerId;
    this.title = options.title;
    this.size = Math.pow(2, level) + 1;
    this.max = this.size - 1;
    this.maps = {};
  }

  LandMap.prototype.get = function(which, x, y) {
    if (x < 0 || x > this.max || y < 0 || y > this.max) {
      return -1;
    } else {
      return this.maps[which][x + this.size * y];
    }
  };

  LandMap.prototype.set = function(which, x, y, value) {
    this.maps[which][(x + this.size * y)] = value;
  };

  LandMap.prototype.generate = function(deviationAmount, feature) {
    var self = this;

    if (!(feature in self.maps)) {
      this.maps[feature] = new Array(this.size * this.size);
    }

    this.set(feature, 0, 0, Math.random() * self.max);
    this.set(feature, this.max, 0, Math.random() * self.max);
    this.set(feature, this.max, this.max, Math.random() * self.max);
    this.set(feature, 0, this.max, Math.random() * self.max);

    subdivide(this.max);

    function subdivide(size) {
      var x, y, half = size / 2;
      var scale = deviationAmount * size;
      if (half < 1) return;

      for (y = half; y < self.max; y += size) {
        for (x = half; x < self.max; x += size) {
          square(feature, x, y, half, Math.random() * scale * 2 - scale);
        }
      }
      for (y = 0; y <= self.max; y += half) {
        for (x = (y + half) % size; x <= self.max; x += size) {
          diamond(feature, x, y, half, Math.random() * scale * 2 - scale);
        }
      }
      subdivide(size / 2);
    }

    function average(values) {
      var valid = values.filter(function(val) {
        return val !== -1;
      });
      var total = valid.reduce(function(sum, val) {
        return sum + val;
      }, 0);
      return total / valid.length;
    }

    function square(which, x, y, size, offset) {
      var ave = average([
        self.get(which, x - size, y - size), // upper left
        self.get(which, x + size, y - size), // upper right
        self.get(which, x + size, y + size), // lower right
        self.get(which, x - size, y + size) // lower left
      ]);
      self.set(which, x, y, ave + offset);
    }

    function diamond(which, x, y, size, offset) {
      var ave = average([
        self.get(which, x, y - size), // top
        self.get(which, x + size, y), // right
        self.get(which, x, y + size), // bottom
        self.get(which, x - size, y) // left
      ]);
      self.set(which, x, y, ave + offset);
    }
  };

  LandMap.prototype.smooth = function(amount, featureFrom, featureTo) {
    if (!(featureTo in this.maps)) {
      this.maps[featureTo] = new Array(this.size * this.size);
    }

    var self = this;
    var MARGIN = amount;
    for (var y = 0; y < this.size; y++) {
      for (var x = 0; x < this.size; x++) {
        var nextValue = self.get(featureFrom, x, y);
        var nextValueCount = 0;
        for (var xRange = Math.max(x - Math.round(MARGIN), 0); xRange < Math.min(x + Math.round(MARGIN), this.size); xRange++) {
          for (var yRange = Math.max(y - Math.round(MARGIN), 0); yRange < Math.min(y + Math.round(MARGIN), this.size); yRange++) {
            if (distanceBetween(x, y, xRange, yRange) <= MARGIN) {
              var value = self.get(featureFrom, xRange, yRange);
              nextValue = nextValue + value;
              nextValueCount++;
            }
          }
        }
        var finalVal = ((nextValue / nextValueCount));
        self.set(featureTo, x, y, finalVal);
      }
    }

    function distanceBetween(ax, ay, bx, by) {
      return Math.abs(Math.sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by)));
    }
  };

  LandMap.prototype.combine = function(one, two, three, result) {

    function percent(value, max, min) {
      return value / Math.abs((max - min));
    }

    if (!(result in this.maps)) {
      this.maps[result] = new Array(this.size * this.size);
    }

    var max = Number.MIN_SAFE_INTEGER;
    var min = Number.MAX_SAFE_INTEGER;
    for (var y = 0; y < this.size; y++) {
      for (var x = 0; x < this.size; x++) {
        var val = this.get(two, x, y);
        if (val !== undefined) {
          max = Math.max(max, val);
          min = Math.min(min, val);
        }
      }
    }

    for (var y = 0; y < this.size; y++) {
      for (var x = 0; x < this.size; x++) {
        var featureOne = this.get(one, x, y);
        var featureTwo = this.get(two, x, y);
        var featureThree = this.get(three, x, y);
        if (featureOne !== undefined && featureTwo !== undefined && featureThree !== undefined) {
          var featureThreePercent = percent(featureThree, min, max);
          var val = (1 - featureThreePercent) * featureOne + featureThreePercent * featureTwo;
          this.set(result, x, y, val);
        }
      }
    }
  };

  LandMap.prototype.grd = function(amount, percent, featureFrom, featureTo) {
    this.maps[featureTo] = new Array(this.size * this.size);

    for (var y = 0; y < this.size; y++) {
      for (var x = 0; x < this.size; x++) {
        this.set(featureTo, x, y, this.get(featureFrom, x, y));
      }
    }

    var operationAray = new Array(this.size * this.size);
    var size = this.size
    for (var y = 0; y < this.size; y++) {
      for (var x = 0; x < this.size; x++) {
        operationAray[(x + size * y)] = [0];
      }
    }

    var MARGIN = amount;
    for (var i = 0; i < MARGIN; i++) {
      operationAray[(x + this.size * y)] = [0];
      var max = Number.MIN_SAFE_INTEGER;
      var min = Number.MAX_SAFE_INTEGER;
      for (var y = 0; y < this.size; y++) {
        for (var x = 0; x < this.size; x++) {
          var val = this.get(featureTo, x, y);
          if (val !== undefined) {
            max = Math.max(max, val);
            min = Math.min(min, val);
          }
        }
      }

      // iterate through all
      for (var y = MARGIN; y < this.size - MARGIN; y++) {
        for (var x = MARGIN; x < this.size - MARGIN; x++) {
          var neighbors = [
            this.get(featureTo, x - 1, y),
            this.get(featureTo, x + 1, y),
            this.get(featureTo, x, y - 1),
            this.get(featureTo, x, y + 1)
          ];
          operationAray[(x + size * y)].push(this.get(featureTo, x, y));
          var index = indexOfMax(featureTo);
          var thisValue = this.get(featureTo, x, y);
          if (neighbors[index] > thisValue) {
            if (index == 0) {
              // WEST (left)
              operationAray[(x + size * y)].push(this.get(featureTo, x - 1, y) * percent);
              operationAray[((x - 1) + size * y)].push(this.get(featureTo, x - 1, y) * (percent) * (-1));
            } else if (index == 1) {
              // EAST (right)
              operationAray[(x + size * y)].push(this.get(featureTo, x + 1, y) * percent);
              operationAray[((x + 1) + size * y)].push(this.get(featureTo, x + 1, y) * (percent) * (-1));
            } else if (index == 2) {
              // NORTH (up)
              operationAray[(x + size * y)].push(this.get(featureTo, x, y - 1) * percent);
              operationAray[(x + size * (y - 1))].push(this.get(featureTo, x - 1, y) * (percent) * (-1));
            } else if (index == 3) {
              // SOUTH (down)
              operationAray[(x + size * y)].push(this.get(featureTo, x, y + 1) * percent);
              operationAray[(x + size * (y + 1))].push(this.get(featureTo, x, y + 1) * (percent) * (-1));
            }
          }
        }
      }
      //iterate through summing the operationAray, and setting it
      for (var y = MARGIN; y < size - MARGIN; y++) {
        for (var x = MARGIN; x < size - MARGIN; x++) {
          var value = operationAray[(x + size * y)].reduce(function(a, b) {
            return a + b;
          }, 0);
          this.set(featureTo, x, y, value);
          operationAray[(x + size * y)] = [value];
        }
      }
    }
  };

  LandMap.prototype.simpleErosion = function(options) {
    var Kq = options.carryingCapacity;
    var Kd = options.depositionSpeed;
    var iterations = options.iterations;
    var drops = options.drops;
    var one = options.one;
    var two = options.two;

    var HeightMap = new Array(this.size * this.size);
    for (var y = 0; y < this.size; y++) {
      for (var x = 0; x < this.size; x++) {
        HeightMap[(x + this.size * y)] = this.get(one, x, y);
      }
    }

    var HMAP_SIZE = this.size;

    function HMAP_INDEX(x, y) {
      var val = (x + HMAP_SIZE * y)
      return val;
    }

    function HMAP_VALUE(x, y) {
      return HeightMap[(x + HMAP_SIZE * y)];
    }

    function DEPOSIT_AT(X, Y) {
      var c = 0.0;
      var v = 1.05;
      var maxVelocity = 10.0;

      // For the number of iterations
      for (var iter = 0; iter < iterations; iter++) {
        v = Math.min(v, maxVelocity); // limiting velocity
        var val = HMAP_VALUE(X, Y);
        var nv = [
          HMAP_VALUE(X, Y - 1), //NORTH
          HMAP_VALUE(X, Y + 1), //SOUTH
          HMAP_VALUE(X + 1, Y), //EAST
          HMAP_VALUE(X - 1, Y) //WEST
        ];

        var minInd = indexOfMin(nv);
        // if the lowest neighbor is NOT greater than the current value
        if (nv[minInd] < val) {
          //deposit or erode
          var vtc = Kd * v * Math.abs(nv[minInd]); // value to steal is depositionSpeed * velocity * abs(slope);
          // if carrying amount is greater than Kq
          if (c > Kq) {
            //DEPOSIT
            c -= vtc;
            HeightMap[HMAP_INDEX(X, Y)] += vtc;
          } else {
            //ERODE
            // if carrying + value to steal > carrying cap
            if (c + vtc > Kq) {
              var delta = c + vtc - Kq;
              c += delta;
              HeightMap[HMAP_INDEX(X, Y)] -= delta;
            } else {
              c += vtc;
              HeightMap[HMAP_INDEX(X, Y)] -= vtc;
            }
          }

          // move to next value
          if (minInd == 0) {
            //NORTH
            Y -= 1
          }
          if (minInd == 1) {
            //SOUTH
            Y += 1
          }
          if (minInd == 2) {
            //EAST
            X += 1
          }
          if (minInd == 3) {
            //WEST
            X -= 1
          }

          // limiting to edge of map
          if (X > this.size - 1) {
            X = this.size;
          }
          if (Y > this.size - 1) {
            Y = this.size;
          }
          if (Y < 0) {
            Y = 0;
          }
          if (X < 0) {
            X = 0;
          }
        }
      }
    }

    for (var drop = 0; drop < drops; drop++) {
      DEPOSIT_AT(Math.floor(Math.random() * this.size), Math.floor(Math.random() * this.size));
      this.maps[two] = HeightMap;
    }
  };

  LandMap.prototype.complexErosion = function(options) {
    var Kq = options.carryingCapacity;
    var Kd = options.depositionSpeed;
    var iterations = options.iterations;
    var drops = options.drops;
    var one = options.one;
    var two = options.two;

    var HeightMap = new Array(this.size * this.size);
    for (var y = 0; y < this.size; y++) {
      for (var x = 0; x < this.size; x++) {
        HeightMap[(x + this.size * y)] = this.get(one, x, y);
      }
    }

    var HMAP_SIZE = this.size;

    function HMAP_INDEX(x, y) {
      var val = (x + HMAP_SIZE * y)
      return val;
    }

    function HMAP_VALUE(x, y) {
      return HeightMap[(x + HMAP_SIZE * y)];
    }

    function DEPOSIT_AT(X, Y) {
      var c = 0.0;
      var v = 1.05;
      var minSlope = 1.15;
      var maxVelocity = 10.0;

      // For the number of iterations
      for (var iter = 0; iter < iterations; iter++) {
        v = Math.min(v, maxVelocity); // limiting velocity
        var val = HMAP_VALUE(X, Y);
        var nv = [
          HMAP_VALUE(X, Y - 1), //NORTH
          HMAP_VALUE(X, Y + 1), //SOUTH
          HMAP_VALUE(X + 1, Y), //EAST
          HMAP_VALUE(X - 1, Y) //WEST
        ];

        var minInd = indexOfMin(nv);
        // if the lowest neighbor is NOT greater than the current value
        if (nv[minInd] < val) {
          //deposit or erode
          var slope = Math.min(minSlope, val - nv[minInd])
          var vtc = Kd * v * slope; // value to steal is depositionSpeed * velocity * abs(slope);
          // if carrying amount is greater than Kq
          if (c > Kq) {
            //DEPOSIT
            c -= vtc;
            HeightMap[HMAP_INDEX(X, Y)] += vtc;
          } else {
            //ERODE
            // if carrying + value to steal > carrying cap
            if (c + vtc > Kq) {
              var delta = c + vtc - Kq;
              c += delta;
              HeightMap[HMAP_INDEX(X, Y)] -= delta;
            } else {
              c += vtc;
              HeightMap[HMAP_INDEX(X, Y)] -= vtc;
            }
          }

          // move to next value
          if (minInd == 0) {
            //NORTH
            Y -= 1
          }
          if (minInd == 1) {
            //SOUTH
            Y += 1
          }
          if (minInd == 2) {
            //EAST
            X += 1
          }
          if (minInd == 3) {
            //WEST
            X -= 1
          }

          // limiting to edge of map
          if (X > this.size - 1) {
            X = this.size;
          }
          if (Y > this.size - 1) {
            Y = this.size;
          }
          if (Y < 0) {
            Y = 0;
          }
          if (X < 0) {
            X = 0;
          }
        }
      }
    }

    for (var drop = 0; drop < drops; drop++) {
      DEPOSIT_AT(Math.floor(Math.random() * this.size), Math.floor(Math.random() * this.size));
      this.maps[two] = HeightMap;
    }
  };

  LandMap.prototype.spinner = function() {
    var spinner = '<img class="spinner" width="24" height="24" src="data:image/gif;base64,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" />';
    document.getElementById(this.containerId).innerHTML = spinner;
  }

  LandMap.prototype.draw = function() {
    var html = '<div class="row">';
    var featureCount = 0;
    for (feature in this.maps) {
      html += '<div class="four columns"><strong>' + feature + '</strong><div class="box"><span id="' + this.containerId + feature + '"></span><span id="' + feature + '-description"></span></div></div>';
      featureCount++;
      if (featureCount == 3) {
        html += '</div><div class="row">'
        featureCount = 0;
      }
    }
    document.getElementById(this.containerId).innerHTML = html;
    for (feature in this.maps) {
      var display = document.getElementById("tmp");
      var ctx = display.getContext('2d');
      var width = display.width = 256;
      var height = display.height = 256;
      var self = this;

      var cellWidth = 1;

      function drawCell(x, y, inensity) {
        ctx.fillStyle = inensity;
        ctx.fillRect(x * cellWidth, y * cellWidth, cellWidth, cellWidth);
      }

      // finding max, min
      var max = Number.MIN_SAFE_INTEGER;
      var min = Number.MAX_SAFE_INTEGER;
      for (var y = 0; y < this.size; y++) {
        for (var x = 0; x < this.size; x++) {
          var val = this.get(feature, x, y);
          if (val !== undefined) {
            max = Math.max(max, val);
            min = Math.min(min, val);
          }
        }
      }
      // Drawing each cell
      for (var y = 0; y < this.size; y++) {
        for (var x = 0; x < this.size; x++) {
          var val = this.get(feature, x, y);
          if (val !== undefined) {
            drawCell(x, y, brightness(val, max, min));
          }
        }
      }

      document.getElementById(this.containerId + feature).innerHTML = '<img src="' + display.toDataURL("image/png") + '" class="u-max-full-width map"/>';
    }

    function brightness(value, max, min) {
      var delta = Math.abs((max - min));
      var b = Math.floor((value / delta) * 255);
      return 'rgba(' + b + ',' + b + ',' + b + ',1)';
    }
  };

  $("#standard").click(function() {
    var standardMap = new LandMap({
      containerId: "container-1"
    });
    standardMap.generate(0.75, "standard");
    standardMap.smooth(10, "standard", "smoothed-10");
    standardMap.smooth(20, "standard", "smoothed-20");
    standardMap.draw();
  });

  $("#combined").click(function() {
    var terrain = new LandMap({
      containerId: "container-2"
    });
    terrain.generate(0.75, "standard");
    terrain.generate(0.75, "standard-two", "DS with 0.75");
    terrain.smooth(10, "standard", "standard-10");
    terrain.smooth(20, "standard-two", "standard-two-20");
    terrain.combine("standard", "standard-10", "standard-two-20", "combined");
    terrain.combine("standard-10", "standard", "standard-two-20", "reversed");
    terrain.draw();
  });

  $("#grd").click(function() {
    var terrain = new LandMap({
      containerId: "container-3"
    });
    terrain.generate(0.75, "standard");
    terrain.grd(22, 0.01, "standard", "grd-22-0.01");
    terrain.grd(20, 0.03, "standard", "grd-20-0.03");
    terrain.grd(40, 0.01, "standard", "grd-40-0.01");
    terrain.draw();
  });


  $("#simpleErosion").click(function() {
    var terrain = new LandMap({
      containerId: "container-4"
    });
    terrain.generate(0.75, "standard");
    terrain.simpleErosion({
      carryingCapacity: 1.5,
      depositionSpeed: 0.03,
      iterations: 10,
      drops: 1000000,
      one: "standard",
      two: "simpleErosion"
    });
    terrain.draw();
  });

  $("#complexErosion").click(function() {
    var terrain = new LandMap({
      containerId: "container-5"
    });
    terrain.spinner();
    setTimeout(function() {
      terrain.generate(0.75, "standard");
      // terrain.complexErosion({
      //   carryingCapacity: 1.5,
      //   depositionSpeed: 0.03,
      //   iterations: 10,
      //   drops: 1000000,
      //   one: "standard",
      //   two: "complexErosion-1000000-10ipd"
      // });
      // terrain.complexErosion({
      //   carryingCapacity: 1.5,
      //   depositionSpeed: 0.03,
      //   iterations: 20,
      //   drops: 1000000,
      //   one: "standard",
      //   two: "complexErosion-1000000-20ipd"
      // });
      // terrain.complexErosion({
      //   carryingCapacity: 1.5,
      //   depositionSpeed: 0.03,
      //   iterations: 3,
      //   drops: 4000000,
      //   one: "standard",
      //   two: "complexErosion-4000000-3ipd"
      // });
      terrain.complexErosion({
        carryingCapacity: 1.0,
        depositionSpeed: 0.1,
        iterations: 3,
        drops: 2000000,
        one: "standard",
        two: "complexErosion-8000000-3ipd"
      });
      terrain.draw();
    }, 1000);

  });
})
