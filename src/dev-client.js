require('eventsource-polyfill');
const hotClient = require('webpack-hot-middleware/client?noInfo=true&reload=true');

// 实现热更新
hotClient.subscribe((event) => {
  if (event.action === 'reload') {
    window.location.reload();
  }
});
