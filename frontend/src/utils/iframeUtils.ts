export function createIframe(id: string, styles: string): HTMLIFrameElement {
  const iframe = document.createElement('iframe');
  iframe.id = id;
  iframe.style.cssText = styles;
  document.body.appendChild(iframe);
  return iframe;
}

export function loadScript(doc: Document, src: string, callback: () => void): void {
  const script = doc.createElement('script');
  script.src = src;
  script.onload = callback;
  doc.head.appendChild(script);
}

export function loadStylesheet(doc: Document, href: string): void {
  const link = doc.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  doc.head.appendChild(link);
}

export function createWidgetButtonIframe(CDN_URL: string, onClick: () => void): void {
  const iframe = createIframe(
    'widget-button-iframe',
    `
    display: none;
    position: fixed;
    bottom: 16px;
    right: 16px;
    width: 78px;
    height: 78px;
    border: none;
    z-index: 9999;
    `,
  );

  const doc = iframe.contentDocument || iframe.contentWindow?.document;

  if (!doc) return;

  loadStylesheet(doc, `${CDN_URL}/button-style.css`);

  const buttonHtml = `
    <button id="toggle-button" class="button">
      <img src="${CDN_URL}/images/button.svg" class="button__image" alt="Widget Button" width="78" height="78" />
    </button>
  `;
  doc.body.innerHTML = buttonHtml;

  const button = doc.getElementById('toggle-button');
  if (button) {
    button.addEventListener('click', onClick);
  }
}

export function createWidgetBodyIframe(CDN_URL: string, onLoad: (doc: Document, iframe: HTMLIFrameElement) => void): void {
  const customWidth = import.meta.env.VITE_CUSTOM_WIDTH;
  const width = customWidth ?? '393px';

  const iframe = createIframe(
    'widget-body-iframe',
    `
    position: fixed;
    bottom: 0px;
    right: 0px;
    width: ${width};
    height: 100%;
    height: 100dvh;
    border: none;
    z-index: 9999;
    display: none;
    box-shadow: -6px 0px 24px 0px rgba(0, 0, 0, 0.16);
    `,
  );

  const doc = iframe.contentDocument || iframe.contentWindow?.document;

  if (!doc) return;

  loadStylesheet(doc, `${CDN_URL}/main.css`);

  const rootElementId = 'root';
  const rootDiv = doc.createElement('div');
  rootDiv.id = rootElementId;
  rootDiv.classList.add('h-full', 'w-full');
  doc.body.appendChild(rootDiv);

  const isWidgetExpanded = localStorage?.getItem('amp_widget_expanded');
  if (isWidgetExpanded === 'true' || (isWidgetExpanded === null && window.innerWidth > 450)) {
    iframe.style.display = 'block';
  } else {
    iframe.style.display = 'none';
  }

  onLoad(doc, iframe);
}

export function toggleBodyIframe(iframe: HTMLIFrameElement, show: boolean) {
  if (iframe) {
    iframe.style.display = show ? 'block' : 'none';
    localStorage?.setItem('amp_widget_expanded', show ? 'true' : 'false');
    if (show) {
      const messageInput = iframe.contentWindow?.document.getElementById('message') as HTMLTextAreaElement;
      if (messageInput) {
        messageInput.focus();
      }
    }
  }
}
