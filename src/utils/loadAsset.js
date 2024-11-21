/**
 * 加载远程 JS脚本
 * @param JsSrc: js脚本地址
 * @param callback
 */
export function loadRemoteJs(JsSrc, callback) {
  const curCallback = callback || noop;
  if (document.querySelector(`script[src='${JsSrc}']`)) {
    curCallback();
    return;
  }

  const script = document.createElement('script');

  const loadAction = () => {
    script.removeEventListener('load', loadAction);
    curCallback();
  };

  script.addEventListener('load', loadAction);
  script.src = JsSrc;
  document.body.appendChild(script);
}

/**
 * 加载远程 CSS
 * @param cssSrc: css地址
 * @param callback
 */
export function loadRemoteCSS(cssSrc) {
  const loadedLink = document.querySelector(`link[href='${cssSrc}']`);
  if (loadedLink) {
    // 避免重复加载
    loadedLink.disabled = false;
    return;
  }

  const head = document.getElementsByTagName('head')[0];
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = src;
  head.appendChild(link);
}
