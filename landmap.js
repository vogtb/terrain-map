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

// options can be a serialized LandMap
function LandMap(options) {
  var level = 8;
  this.containerId = options.containerId;
  this.size = Math.pow(2, level) + 1;
  this.max = this.size - 1;
  this.maps = options.maps || {};
  this.meta = options.meta || {}
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

LandMap.prototype.generate = function(options) {
  var deviationAmount = options.deviation,
    feature = options.feature;
  this.meta[options.feature] = options;
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

LandMap.prototype.smooth = function(options) {
  var amount = options.amount,
    featureFrom = options.from,
    featureTo = options.to;

  this.meta[featureTo] = options;

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

LandMap.prototype.combine = function(options) {
  var one = options.one,
    two = options.two,
    three = options.three,
    result = options.result;

  this.meta[result] = options;

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

LandMap.prototype.grd = function(options) {
  var amount = options.amount,
    percent = options.percent,
    featureFrom = options.from,
    featureTo = options.to;

  this.meta[featureTo] = options;

  this.maps[featureTo] = new Array(this.size * this.size);

  for (var y = 0; y < this.size; y++) {
    for (var x = 0; x < this.size; x++) {
      this.set(featureTo, x, y, this.get(featureFrom, x, y));
    }
  }

  var operationAray = new Array(this.size * this.size);
  for (var y = 0; y < this.size; y++) {
    for (var x = 0; x < this.size; x++) {
      operationAray[(x + this.size * y)] = [0];
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
    // for (var xRange = Math.max(x - Math.round(MARGIN), 0); xRange < Math.min(x + Math.round(MARGIN), this.size); xRange++) {
    //   for (var yRange = Math.max(y - Math.round(MARGIN), 0); yRange < Math.min(y + Math.round(MARGIN), this.size); yRange++) {
    for (var y = 1; y < this.size-2; y++) {
      for (var x = 1; x < this.size-2; x++) {
        var neighbors = [
          this.get(featureTo, x - 1, y),
          this.get(featureTo, x + 1, y),
          this.get(featureTo, x, y - 1),
          this.get(featureTo, x, y + 1)
        ];
        operationAray[(x + this.size * y)].push(this.get(featureTo, x, y));
        var index = indexOfMax(featureTo);
        var thisValue = this.get(featureTo, x, y);
        if (neighbors[index] > thisValue) {
          if (index == 0) {
            // WEST (left)
            operationAray[(x + this.size * y)].push(this.get(featureTo, x - 1, y) * percent);
            operationAray[((x - 1) + this.size * y)].push(this.get(featureTo, x - 1, y) * (percent) * (-1));
          } else if (index == 1) {
            // EAST (right)
            operationAray[(x + this.size * y)].push(this.get(featureTo, x + 1, y) * percent);
            operationAray[((x + 1) + this.size * y)].push(this.get(featureTo, x + 1, y) * (percent) * (-1));
          } else if (index == 2) {
            // NORTH (up)
            operationAray[(x + this.size * y)].push(this.get(featureTo, x, y - 1) * percent);
            operationAray[(x + this.size * (y - 1))].push(this.get(featureTo, x - 1, y) * (percent) * (-1));
          } else if (index == 3) {
            // SOUTH (down)
            operationAray[(x + this.size * y)].push(this.get(featureTo, x, y + 1) * percent);
            operationAray[(x + this.size * (y + 1))].push(this.get(featureTo, x, y + 1) * (percent) * (-1));
          }
        }
      }
    }
    //iterate through summing the operationAray, and setting it
    for (var y = 1; y < this.size - 2; y++) {
      for (var x = 1; x < this.size - 2; x++) {
        var value = operationAray[(x + this.size * y)].reduce(function(a, b) {
          return a + b;
        }, 0);
        this.set(featureTo, x, y, value);
        operationAray[(x + this.size * y)] = [value];
      }
    }
  }
};

LandMap.prototype.simpleErosion = function(options) {
  var Kq = options.carryingCapacity;
  var Kd = options.depositionSpeed;
  var iterations = options.iterations;
  var drops = options.drops;
  var one = options.from;
  var two = options.to;

  this.meta[two] = options;

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
  var one = options.from;
  var two = options.to;

  this.meta[two] = options;

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

LandMap.prototype.draw = function() {
  var html = '<div class="row">';
  var featureCount = 0;
  for (feature in this.maps) {
    html += '<div class="four columns"><strong>' + feature + '</strong><br><div class="box"><span id="' + this.containerId + feature + '"></span><pre>' + JSON.stringify(this.meta[feature], null, 2) + '</pre></div></div>';
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
