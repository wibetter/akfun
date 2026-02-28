// 空函数
export function noop(): void {}

/**
 * 加载远程 JS脚本
 * 备注：用于动态加载自定义组件脚本
 * @param jsSrc js脚本地址
 * @param callback 加载完成后的回调函数
 */
export function loadRemoteJs(jsSrc: string, callback?: (success?: boolean) => void): void {
  const curCallback = callback || noop;

  // 检查脚本是否已存在
  const existingScript = document.querySelector(
    `script[src='${jsSrc}']`
  ) as HTMLScriptElement | null;

  if (existingScript) {
    // 检查脚本是否已加载完成
    const loadStatus = existingScript.getAttribute('script-load-status');

    if (loadStatus === 'true') {
      // 已加载完成，直接执行回调
      curCallback(true);
    } else {
      // 未加载完成，等待加载完成
      const waitLoadAction = (): void => {
        existingScript.removeEventListener('load', waitLoadAction);
        existingScript.setAttribute('script-load-status', 'true');
        curCallback(true);
      };

      const waitErrorAction = (): void => {
        existingScript.removeEventListener('error', waitErrorAction);
        curCallback(false);
      };

      existingScript.addEventListener('load', waitLoadAction);
      existingScript.addEventListener('error', waitErrorAction);
    }
  } else {
    // 创建新的脚本标签
    const script = document.createElement('script');

    const waitLoadAction = (): void => {
      script.removeEventListener('load', waitLoadAction);
      script.setAttribute('script-load-status', 'true');
      curCallback(true);
    };

    const waitErrorAction = (): void => {
      script.removeEventListener('error', waitErrorAction);
      curCallback(false);
    };

    script.addEventListener('load', waitLoadAction);
    script.addEventListener('error', waitErrorAction);
    script.src = jsSrc;
    document.body.appendChild(script);
  }
}

export const loadRemoteJsPromise = (url: string) =>
  new Promise<boolean>((resolve) => {
    loadRemoteJs(url, (loadResult) => {
      resolve(loadResult ?? false);
    });
  });

/**
 * 加载远程 CSS
 * @param cssSrc css地址
 */
export function loadRemoteCSS(cssSrc: string): void {
  const loadedLink = document.querySelector(`link[href='${cssSrc}']`) as HTMLLinkElement | null;
  if (loadedLink) {
    // 避免重复加载
    loadedLink.disabled = false;
    return;
  }

  const head = document.getElementsByTagName('head')[0];
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = cssSrc;
  head.appendChild(link);
}
