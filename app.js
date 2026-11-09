'use strict';
(() => {
  const preview = document.querySelector('#ar-preview');
  const button = document.querySelector('#ar-button');
  const label = document.querySelector('#ar-button-label');
  const message = document.querySelector('#support-message');
  const status = document.querySelector('#share-status');
  const modelURL = new URL('model.usdz', location.href);
  const pageURL = new URL('./', location.href);
  pageURL.search = ''; pageURL.hash = '';
  const expectedMime = 'model/vnd.usdz+zip';
  let supported = false;
  try { supported = preview.relList.supports('ar'); } catch { /* Keep the Safari instructions. */ }
  let modelError = false;

  function setMessage(text, state = '') {
    message.textContent = text;
    message.dataset.state = state;
  }
  if (supported) {
    setMessage('Quick Look доступен. Нажмите на модель, выберите AR и наведите камеру на стол или пол.', 'ready');
  } else {
    label.textContent = 'Открыть на iPhone или iPad';
    document.querySelector('#preview-hint').textContent = 'Превью модели';
    setMessage('Этот браузер не поддерживает Apple AR Quick Look. Отсканируйте QR-код и откройте страницу в Safari на совместимом iPhone или iPad.');
  }
  function fallback(event) {
    if (!supported) {
      event.preventDefault();
      document.querySelector('#phone').scrollIntoView({block:'center'});
    } else if (modelError) {
      event.preventDefault();
      setMessage('Модель недоступна или сервер отправляет неверный MIME-тип. Попробуйте обновить страницу; владельцу сайта нужно проверить публикацию.', 'error');
    }
  }
  preview.addEventListener('click', fallback);
  button.addEventListener('click', () => {
    if (supported) preview.click();
    else document.querySelector('#phone').scrollIntoView({block:'center'});
  });

  // Detection above checks browser integration, not camera permission or plane tracking.
  // Quick Look controls the camera, surface detection, and placement after the user tap.
  if (/^https?:$/.test(location.protocol)) {
    fetch(modelURL, {method:'HEAD', cache:'no-cache'}).then(response => {
      const mime = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
      if (!response.ok || mime !== expectedMime) {
        modelError = true;
        setMessage(!response.ok
          ? 'Не удалось загрузить USDZ-модель. Проверьте публикацию файла model.usdz и обновите страницу.'
          : 'Сервер отправляет неверный MIME-тип USDZ. Для Quick Look требуется model/vnd.usdz+zip. Сообщите владельцу сайта.', 'error');
      }
    }).catch(() => {
      // A transient HEAD failure should not prevent Safari from opening the real link.
      setMessage('Не удалось проверить модель по сети. Проверьте подключение и попробуйте нажать на превью.');
    });
  }

  // QR generation stays on this device. No URL is sent to a QR service.
  const qrState = document.querySelector('#qr-state');
  let qrBlob;
  try {
    if (location.protocol !== 'https:') {
      qrState.textContent = 'Локальный просмотр. QR-код файла ведёт на адрес GitHub Pages; он заработает после публикации.';
    } else {
      const qr = qrcode(0, 'M');
      qr.addData(pageURL.href, 'Byte'); qr.make();
      const svg = qr.createSvgTag({cellSize:6, margin:24, scalable:true});
      document.querySelector('#qr').innerHTML = svg;
      qrBlob = URL.createObjectURL(new Blob([svg], {type:'image/svg+xml'}));
      document.querySelector('#qr-download').href = qrBlob;
      qrState.textContent = pageURL.host;
    }
  } catch {
    qrState.textContent = 'Используйте QR-код из файла или поделитесь ссылкой на страницу.';
  }
  window.addEventListener('pagehide', () => { if (qrBlob) URL.revokeObjectURL(qrBlob); }, {once:true});

  const dialog = document.querySelector('#share-dialog');
  const input = document.querySelector('#share-url');
  input.value = location.protocol === 'https:' ? pageURL.href : 'https://ufinexofficial-hash.github.io/usdz-ar-viewer/';
  function showShareDialog() { dialog.showModal(); input.select(); }
  document.querySelector('#share-button').addEventListener('click', async () => {
    if (navigator.share && location.protocol === 'https:') {
      try { await navigator.share({title:document.title, url:pageURL.href}); return; }
      catch (error) { if (error.name === 'AbortError') return; }
    }
    showShareDialog();
  });
  document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
  document.querySelector('#copy-url').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(input.value);
      dialog.close(); status.textContent = 'Ссылка скопирована.';
    } catch {
      input.focus(); input.select();
      status.textContent = 'Скопируйте выделенную ссылку вручную.';
    }
  });
})();
