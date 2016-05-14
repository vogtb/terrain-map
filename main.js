var worker;
$(document).ready(function() {

  function spinner(id) {
    
  }

  $("#standard").click(function() {
    var worker = new Worker('worker.js');
    worker.postMessage("standard");
    worker.addEventListener('message', function(e) {
      var terrain = new LandMap(e.data);
      terrain.draw();
    }, false);
  });

  $("#combined").click(function() {
    var worker = new Worker('worker.js');
    worker.postMessage("combined");
    worker.addEventListener('message', function(e) {
      var terrain = new LandMap(e.data);
      terrain.draw();
    }, false);
  });

  $("#grd").click(function() {
    var worker = new Worker('worker.js');
    worker.postMessage("grd");
    worker.addEventListener('message', function(e) {
      var terrain = new LandMap(e.data);
      terrain.draw();
    }, false);
  });


  $("#simpleErosion").click(function() {
    var worker = new Worker('worker.js');
    worker.postMessage("simpleErosion");
    worker.addEventListener('message', function(e) {
      var terrain = new LandMap(e.data);
      terrain.draw();
    }, false);
  });

  $("#complexErosion").click(function() {
    var worker = new Worker('worker.js');
    worker.postMessage("complexErosion");
    worker.addEventListener('message', function(e) {
      var terrain = new LandMap(e.data);
      terrain.draw();
    }, false);
  });
})
