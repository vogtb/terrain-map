var worker;
$(document).ready(function() {

  function spinner(id) {
    var spinner = '<img class="spinner" width="24" height="24" src="data:image/gif;base64,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" />';
    this.document.getElementById(id).innerHTML = spinner;
  }

  $("#standard").click(function() {
    spinner("container-1");
    var worker = new Worker('worker.js');
    worker.postMessage("standard");
    worker.addEventListener('message', function(e) {
      var terrain = new LandMap(e.data);
      terrain.draw();
    }, false);
  });

  $("#combined").click(function() {
    spinner("container-2");
    var worker = new Worker('worker.js');
    worker.postMessage("combined");
    worker.addEventListener('message', function(e) {
      var terrain = new LandMap(e.data);
      terrain.draw();
    }, false);
  });

  $("#grd").click(function() {
    spinner("container-3");
    var worker = new Worker('worker.js');
    worker.postMessage("grd");
    worker.addEventListener('message', function(e) {
      var terrain = new LandMap(e.data);
      terrain.draw();
    }, false);
  });


  $("#simpleErosion").click(function() {
    spinner("container-4");
    var worker = new Worker('worker.js');
    worker.postMessage("simpleErosion");
    worker.addEventListener('message', function(e) {
      var terrain = new LandMap(e.data);
      terrain.draw();
    }, false);
  });

  $("#complexErosion").click(function() {
    spinner("container-5");
    var worker = new Worker('worker.js');
    worker.postMessage("complexErosion");
    worker.addEventListener('message', function(e) {
      var terrain = new LandMap(e.data);
      terrain.draw();
    }, false);
  });
})
