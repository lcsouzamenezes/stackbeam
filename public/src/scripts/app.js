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

  socket.on('error', function (code) {
    console.log('code', code);
    var stacktraceFrames = code;
    var errorCode = stacktraceFrames[0];
    var displayCode = errorCode.pre_context.join('\n') + '\n' + errorCode.context_line + '\n' + errorCode.post_context.join('\n');
    var linesStart = parseInt(errorCode.lineno) - 7;
    app.html = '<pre class="line-numbers" data-start="' + linesStart + '" data-line="' + errorCode.lineno + '"><code class="highlight-code language-js">' + displayCode + '</code></pre>'
    app.title = 'NEW ERROR HAS APPEARED: (' + errorCode.filename + ')';
    reInitPrism();
  });

});

Prism.plugins.NormalizeWhitespace.setDefaults({
  'remove-trailing': true,
  'right-trim': true,
  'tabs-to-spaces': 2
});