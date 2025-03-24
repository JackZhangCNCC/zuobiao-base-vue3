import { message } from 'ant-design-vue';

interface LessWindow extends Window {
  less?: {
    modifyVars: (vars: Record<string, string>) => Promise<void>;
  };
}

declare let window: LessWindow;

let lessNodesAppended = false;

/**
 * 更新主题颜色
 * @param primaryColor 主题色值
 */
const updateTheme = (primaryColor: string): void => {
  if (!primaryColor) {
    return;
  }
  // 显示加载消息
  const hideMessage = message.loading('加载主题...', 0);

  function buildIt(): void {
    if (!window.less) {
      return;
    }
    setTimeout(() => {
      window.less!
        .modifyVars({
          '@primary-color': primaryColor
        })
        .then(() => {
          hideMessage();
        })
        .catch((e) => {
          console.log(e);
          message.error('Failed to update theme');
          hideMessage();
        });
    }, 200);
  }

  if (!lessNodesAppended) {
    // 插入 less.js 和 color.less
    const lessStyleNode = document.createElement('link');
    const lessConfigNode = document.createElement('script');
    const lessScriptNode = document.createElement('script');
    lessStyleNode.setAttribute('rel', 'stylesheet/less');
    lessStyleNode.setAttribute('href', '/src/styles/theme.less'); // 调整路径到Vue3项目的样式文件
    lessConfigNode.innerHTML = `
      window.less = {
        async: true,
        env: 'production',
        javascriptEnabled: true
      }
    `;
    lessScriptNode.src = 'https://cdn.jsdelivr.net/npm/less@4.1.1/dist/less.min.js'; // 使用更新的CDN和版本
    lessScriptNode.async = true;
    lessScriptNode.onload = () => {
      buildIt();
      lessScriptNode.onload = null;
    };
    document.body.appendChild(lessStyleNode);
    document.body.appendChild(lessConfigNode);
    document.body.appendChild(lessScriptNode);
    lessNodesAppended = true;
  } else {
    buildIt();
  }
};

export { updateTheme };
