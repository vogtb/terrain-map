self.importScripts('landmap.js');
self.addEventListener('message', function(e) {
  var data = e.data;
  var terrain;
  switch (data) {
    case 'smooth-simple-erosion':
      terrain = new LandMap({
        containerId: "container-smooth-simple-erosion"
      });
      terrain.generate({
        deviation: 0.75,
        feature: "m1"
      });
      terrain.simpleErosion({
        carryingCapacity: 1.5,
        depositionSpeed: 0.03,
        iterations: 10,
        drops: 1000000,
        from: "m1",
        to: "m2"
      });
      terrain.smooth({
        amount: 3,
        from: "m2",
        to: "m3"
      });
      break;
    case 'smooth-complex-erosion':
      terrain = new LandMap({
        containerId: "container-smooth-complex-erosion"
      });
      terrain.generate({
        deviation: 0.75,
        feature: "m1"
      });
      terrain.complexErosion({
        carryingCapacity: 1.5,
        depositionSpeed: 0.03,
        iterations: 3,
        drops: 8000000,
        from: "m1",
        to: "m2"
      });
      terrain.smooth({
        amount: 2,
        from: "m2",
        to: "m3"
      });
      break;
    case 'many':
      terrain = new LandMap({
        containerId: "container-many"
      });
      terrain.generate({
        deviation: 0.75,
        feature: "m1"
      });
      terrain.smooth({
        amount: 10,
        from: "m1",
        to: "m2"
      });
      terrain.generate({
        deviation: 0.75,
        feature: "p1"
      });
      terrain.smooth({
        amount: 10,
        from: "p1",
        to: "p2"
      });
      terrain.complexErosion({
        carryingCapacity: 1.5,
        depositionSpeed: 0.03,
        iterations: 3,
        drops: 8000000,
        from: "p2",
        to: "p3"
      });
      //combining
      terrain.combine({
        one: "p2",
        two: "p3",
        three: "m2",
        result: "c1 from (p2,p3,m2)"
      });
      terrain.combine({
        one: "p3",
        two: "p2",
        three: "m2",
        result: "c2 from (p3,p2,m2)"
      });
      break;
    case 'sample':
      terrain = new LandMap({
        containerId: "container-sample"
      });
      terrain.generate({
        deviation: 0.75,
        feature: "standard"
      });
      terrain.smooth({
        amount: 10,
        from: "standard",
        to: "smoothed-10"
      });
      terrain.grd({
        amount: 20,
        percent: 0.03,
        from: "standard",
        to: "grd-20-0.03"
      });
      terrain.complexErosion({
        carryingCapacity: 1.5,
        depositionSpeed: 0.03,
        iterations: 3,
        drops: 8000000,
        from: "standard",
        to: "complexErosion-8000000-3ipd"
      });
      break;
    case 'complexErosion':
      terrain = new LandMap({
        containerId: "container-complexErosion"
      });
      terrain.generate({
        deviation: 0.75,
        feature: "standard"
      });
      terrain.complexErosion({
        carryingCapacity: 1.5,
        depositionSpeed: 0.03,
        iterations: 10,
        drops: 1000000,
        from: "standard",
        to: "complexErosion-1000000-10ipd"
      });
      terrain.complexErosion({
        carryingCapacity: 1.5,
        depositionSpeed: 0.03,
        iterations: 20,
        drops: 1000000,
        from: "standard",
        to: "complexErosion-1000000-20ipd"
      });
      terrain.complexErosion({
        carryingCapacity: 1.5,
        depositionSpeed: 0.03,
        iterations: 3,
        drops: 4000000,
        from: "standard",
        to: "complexErosion-4000000-3ipd"
      });
      terrain.complexErosion({
        carryingCapacity: 1.5,
        depositionSpeed: 0.03,
        iterations: 3,
        drops: 8000000,
        from: "standard",
        to: "complexErosion-8000000-3ipd"
      });
      break;
    case 'simpleErosion':
      terrain = new LandMap({
        containerId: "container-simpleErosion"
      });
      terrain.generate({
        deviation: 0.75,
        feature: "standard"
      });
      terrain.simpleErosion({
        carryingCapacity: 1.5,
        depositionSpeed: 0.03,
        iterations: 10,
        drops: 1000000,
        from: "standard",
        to: "simpleErosion"
      });
      break;
    case 'grd':
      terrain = new LandMap({
        containerId: "container-grd"
      });
      terrain.generate({
        deviation: 0.75,
        feature: "standard"
      });
      terrain.grd({
        amount: 22,
        percent: 0.01,
        from: "standard",
        to: "grd-22-0.01"
      });
      terrain.grd({
        amount: 20,
        percent: 0.03,
        from: "standard",
        to: "grd-20-0.03"
      });
      terrain.grd({
        amount: 40,
        percent: 0.01,
        from: "standard",
        to: "grd-40-0.01"
      });
      break;
    case 'combined':
      terrain = new LandMap({
        containerId: "container-combined"
      });
      terrain.generate({
        deviation: 0.75,
        feature: "standard"
      });
      terrain.generate({
        deviation: 0.75,
        feature: "standard-two"
      });
      terrain.smooth({
        amount: 10,
        from: "standard",
        to: "standard-10"
      });
      terrain.smooth({
        amount: 20,
        from: "standard-two",
        to: "standard-two-20"
      });
      terrain.combine({
        one: "standard",
        two: "standard-10",
        three: "standard-two-20",
        result: "combined"
      });
      terrain.combine({
        one: "standard-10",
        two: "standard",
        three: "standard-two-20",
        result: "reversed"
      });
      break;
    case 'smoothed':
      terrain = new LandMap({
        containerId: "container-smoothed"
      });
      terrain.generate({
        deviation: 0.75,
        feature: "p1"
      });
      terrain.smooth({
        amount: 10,
        from: "p1",
        to: "p2"
      });
      terrain.smooth({
        amount: 20,
        from: "p1",
        to: "p3"
      });
      break;
    case 'standard':
      terrain = new LandMap({
        containerId: "container-standard"
      });
      terrain.generate({
        deviation: 0.35,
        feature: "m1"
      });
      terrain.generate({
        deviation: 0.75,
        feature: "p1"
      });
      terrain.generate({
        deviation: 0.95,
        feature: "r1"
      });
      break;
  };
  self.postMessage(terrain);
}, false);
