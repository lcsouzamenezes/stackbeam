var title = 'HELLO THERE';

var app = new Vue({
  el: '#app',
  data: {
    title: title,
    html: '<pre class="line-numbers"><code class="language-js">var errors = 0;</code></pre>'
  }
});

reInitPrism = function () {
  setTimeout(function () {
    Prism.highlightAll();
  }, 0);
};

// Socket
var socket = io.connect('http://server.zerocrash.net');
socket.on('connect', function() {
  socket.emit('join', 'zerocrash client');
  socket.on('update', function(msg) {
    console.log(msg);
  });

  socket.on('code', function (code) {
    app.html = '<pre class="line-numbers" data-start="15" data-line="16"><code class="highlight-code language-js">' + code + '</code></pre>'
    app.title = 'NEW ERROR HAS APPEARED';
    reInitPrism();
  });

});

Prism.plugins.NormalizeWhitespace.setDefaults({
  'remove-trailing': true,
  'right-trim': true,
  'tabs-to-spaces': 2
});