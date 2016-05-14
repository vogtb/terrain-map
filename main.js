$(document).ready(function() {
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
  };

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

})
