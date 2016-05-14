var worker;
$(document).ready(function() {

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
    var terrain;
    worker = new Worker('erosion.js');
    worker.postMessage(0);
    worker.addEventListener('message', function(e) {
      console.log(e.data.maps)
      terrain = new LandMap(e.data);
      console.log(terrain.maps)
      terrain.draw();
    }, false);
  });
})
