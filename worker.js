self.importScripts('landmap.js');
self.addEventListener('message', function(e) {
  var data = e.data;
  var terrain;
  switch (data) {
    case 'complexErosion':
      terrain = new LandMap({
        containerId: "container-complexErosion"
      });
      terrain.generate(0.75, "standard");
      terrain.complexErosion({
        carryingCapacity: 1.0,
        depositionSpeed: 0.1,
        iterations: 3,
        drops: 2000000,
        one: "standard",
        two: "complexErosion-8000000-3ipd"
      });
      break;
    case 'simpleErosion':
      terrain = new LandMap({
        containerId: "container-simpleErosion"
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
      break;
    case 'grd':
      terrain = new LandMap({
        containerId: "container-grd"
      });
      terrain.generate(0.75, "standard");
      terrain.grd(22, 0.01, "standard", "grd-22-0.01");
      terrain.grd(20, 0.03, "standard", "grd-20-0.03");
      terrain.grd(40, 0.01, "standard", "grd-40-0.01");
      break;
    case 'combined':
      terrain = new LandMap({
        containerId: "container-combined"
      });
      terrain.generate(0.75, "standard");
      terrain.generate(0.75, "standard-two", "DS with 0.75");
      terrain.smooth(10, "standard", "standard-10");
      terrain.smooth(20, "standard-two", "standard-two-20");
      terrain.combine("standard", "standard-10", "standard-two-20", "combined");
      terrain.combine("standard-10", "standard", "standard-two-20", "reversed");
      break;
    case 'standard':
      terrain = new LandMap({
        containerId: "container-standard"
      });
      terrain.generate(0.75, "standard");
      terrain.smooth(10, "standard", "smoothed-10");
      terrain.smooth(20, "standard", "smoothed-20");
      break;
  };
  self.postMessage(terrain);
}, false);
