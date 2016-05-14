self.importScripts('landmap.js');
self.addEventListener('message', function(e) {
  var data = e.data;
  var terrain;
  switch (data) {
    case 'many':
      terrain = new LandMap({
        containerId: "container-many"
      });
      terrain.generate(0.75, "m1");
      terrain.smooth(10, "m1", "m2");
      terrain.generate(0.75, "p1");
      terrain.smooth(10, "p1", "p2");
      terrain.complexErosion({
        carryingCapacity: 1.5,
        depositionSpeed: 0.03,
        iterations: 3,
        drops: 8000000,
        one: "p2",
        two: "p3"
      });
      //combining
      terrain.combine("p2", "p3", "m2", "c1 from (p2,p3,m2)");
      terrain.combine("p3", "p2", "m2", "c2 from (p3,p2,m2)");
      break;
    case 'sample':
      terrain = new LandMap({
        containerId: "container-sample"
      });
      terrain.generate(0.75, "standard");
      terrain.smooth(10, "standard", "smoothed-10");
      terrain.grd(20, 0.03, "standard", "grd-20-0.03");
      terrain.complexErosion({
        carryingCapacity: 1.5,
        depositionSpeed: 0.03,
        iterations: 3,
        drops: 8000000,
        one: "standard",
        two: "complexErosion-8000000-3ipd"
      });
      break;
    case 'complexErosion':
      terrain = new LandMap({
        containerId: "container-complexErosion"
      });
      terrain.generate(0.75, "standard");
      terrain.complexErosion({
        carryingCapacity: 1.5,
        depositionSpeed: 0.03,
        iterations: 10,
        drops: 1000000,
        one: "standard",
        two: "complexErosion-1000000-10ipd"
      });
      terrain.complexErosion({
        carryingCapacity: 1.5,
        depositionSpeed: 0.03,
        iterations: 20,
        drops: 1000000,
        one: "standard",
        two: "complexErosion-1000000-20ipd"
      });
      terrain.complexErosion({
        carryingCapacity: 1.5,
        depositionSpeed: 0.03,
        iterations: 3,
        drops: 4000000,
        one: "standard",
        two: "complexErosion-4000000-3ipd"
      });
      terrain.complexErosion({
        carryingCapacity: 1.5,
        depositionSpeed: 0.03,
        iterations: 3,
        drops: 8000000,
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
