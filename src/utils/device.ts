import enquireJs from 'enquire.js';

type CallbackFunction = (isMobile: boolean) => void;

interface Handler {
  match: () => void;
  unmatch: () => void;
}

/**
 * 媒体查询工具，用于检测移动设备
 * @param call 回调函数，当查询条件匹配/不匹配时调用
 */
const enquireScreen = function(call: CallbackFunction): void {
  const hanlder: Handler = {
    match: function(): void {
      call && call(true);
    },
    unmatch: function(): void {
      call && call(false);
    }
  };
  enquireJs.register('only screen and (max-width: 767.99px)', hanlder);
};

export default enquireScreen;
