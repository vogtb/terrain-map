self.importScripts('landmap.js');
self.addEventListener('message', function(e) {
  var terrain = new LandMap({
    containerId: "container-5"
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
  self.postMessage(terrain);
}, false);
