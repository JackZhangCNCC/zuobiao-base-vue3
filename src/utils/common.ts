/**
 * 触发窗口大小调整事件
 */
export function triggerWindowResizeEvent(): void {
  let event = document.createEvent('HTMLEvents');
  event.initEvent('resize', true, true);
  (event as any).eventType = 'message';
  window.dispatchEvent(event);
}
