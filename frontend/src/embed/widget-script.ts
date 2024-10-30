import { createWidgetBodyIframe, createWidgetButtonIframe, loadScript, toggleBodyIframe } from '../utils/iframeUtils';

declare global {
  interface Window {
    Widget: {
      mount: (doc: Document, selector: string) => void;
    };
  }
}

(function () {
  const CDN_URL = import.meta.env.VITE_CDN_URL;

  window.addEventListener('message', event => {
    if (event.data.type === 'toggle-body-iframe') {
      const iframe = document.getElementById('widget-body-iframe') as HTMLIFrameElement;
      toggleBodyIframe(iframe, event.data.show);
    }
  });

  createWidgetButtonIframe(CDN_URL, () => {
    window.parent.postMessage({ type: 'toggle-body-iframe', show: true }, '*');
  });

  createWidgetBodyIframe(CDN_URL, (doc, iframe) => {
    const rootElementId = 'root';
    if (iframe?.contentWindow) {
      loadScript(doc, `${CDN_URL}/assets/main.js`, () => {
        iframe.contentWindow?.Widget.mount(doc, `#${rootElementId}`);
      });
    }
  });
})();
