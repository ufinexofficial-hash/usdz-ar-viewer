# Орбита — USDZ / Apple AR Quick Look

Минимальное статическое приложение на HTML5, CSS и JavaScript. Превью открывает `model.usdz` в Apple AR Quick Look. Камеру, обнаружение горизонтальной поверхности и размещение объекта выполняет системный просмотрщик Apple. Установка приложения не нужна.

Репозиторий: https://github.com/ufinexofficial-hash/usdz-ar-viewer

Адрес после включения GitHub Pages: **https://ufinexofficial-hash.github.io/usdz-ar-viewer/**

## Файлы

| Файл | Назначение |
| --- | --- |
| `index.html` | Адаптивный интерфейс, ссылка `rel="ar"` с единственным дочерним `img` |
| `styles.css`, `app.js` | Стили, проверка поддержки и MIME, QR, обмен ссылкой |
| `model.usdz` | Оригинальная демонстрационная лампа: высота 28 см, диаметр 22 см |
| `preview.png` | Рендер той же модели |
| `qr-code.svg` | QR-код адреса Pages, с полями по четыре модуля |
| `publication.json` | Адрес, закодированный в сохранённом QR |
| `vendor/qrcode.js` | Локальная бесплатная библиотека генерации QR, MIT |
| `.github/workflows/pages.yml` | Публикация и проверка HTTPS, MIME и файлов |
| `scripts/` | Бесплатные средства сборки, локального просмотра и проверки |

Исходный QR уже указывает на адрес этого репозитория. До включения Pages этот адрес может возвращать 404. При публикации через Actions QR создаётся заново из фактического `base_url`, включая пользовательский домен, если он настроен. На HTTPS-странице QR дополнительно генерируется локально из текущего адреса. Внешние QR-сервисы, CDN, аналитика и платные сервисы не используются.

## Публикация без установки программ

1. Откройте репозиторий на GitHub. Для пустого репозитория нажмите **uploading an existing file**; иначе **Add file → Upload files**.
2. Перетащите **всё содержимое** папки проекта, включая папки `.github`, `scripts` и `vendor`. Саму внешнюю папку проекта и ZIP загружать не нужно: `index.html` должен лежать в корне репозитория. Нажмите **Commit changes** в ветку `main`.
3. Откройте **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. Откройте **Actions → Publish AR viewer → Run workflow → main → Run workflow**. Если самый первый запуск после загрузки завершился ошибкой до включения Pages, это устраняется повторным запуском после шага 3.
5. Дождитесь зелёного результата. Откройте адрес из блока deployment. При необходимости проверьте **Settings → Pages → Enforce HTTPS**.
6. Сохранённый QR доступен по адресу https://ufinexofficial-hash.github.io/usdz-ar-viewer/qr-code.svg или кнопкой на странице.

Workflow ничего не устанавливает из npm: достаточно встроенного Node.js 22 и библиотеки из `vendor`. Публикуются только необходимые статические файлы, без `.git`, скриптов и истории репозитория.

### Простой альтернативный способ

Можно выбрать **Settings → Pages → Source: Deploy from a branch → main → /(root) → Save**. Готовые файлы уже работают без сборки; `.nojekyll` отключает Jekyll. В этом режиме автоматическая проверка из workflow не используется. Не запускайте ручной workflow для этого варианта. При смене домена обновите сохранённый QR командой ниже.

## Локальный просмотр

Нужен бесплатный Node.js 20 или новее. В папке проекта:

```sh
node scripts/serve.cjs
```

Откройте http://127.0.0.1:4173 . Сервер явно отдаёт `.usdz` как `model/vnd.usdz+zip`. Этот адрес доступен только на текущем компьютере. Для проверки на iPhone используйте опубликованную HTTPS-страницу. Открытие `index.html` как `file://` позволяет увидеть макет, но сетевые проверки и AR таким способом не проверяются.

## QR для другого репозитория или домена

```sh
node scripts/build.cjs https://OWNER.github.io/REPOSITORY/
```

Команда обновляет `qr-code.svg` и `publication.json` в проекте. Передайте третий аргумент `.site`, чтобы собрать отдельную папку для публикации. На Actions адрес передаётся автоматически через `actions/configure-pages`.

## Проверка MIME и HTTPS после публикации

Правильный HTTP-заголовок для USDZ: **`Content-Type: model/vnd.usdz+zip`**. Атрибут `type` у ссылки и `<meta>` не заменяют заголовок ответа сервера.

```sh
curl -I https://ufinexofficial-hash.github.io/usdz-ar-viewer/model.usdz
node scripts/check-deployment.cjs https://ufinexofficial-hash.github.io/usdz-ar-viewer/
```

На Windows используйте `curl.exe -I ...`, если `curl` является псевдонимом PowerShell. Скрипт проверяет доступность HTTPS, тип HTML/PNG/SVG/USDZ, SHA-256 опубликованных файлов относительно текущей сборки и адрес QR из `publication.json`. На Actions предусмотрено ожидание обновления CDN. Проверка MIME также выполняется в браузере запросом HEAD; неверный тип или HTTP-ошибка отображаются пользователю.

**GitHub Pages не позволяет задавать MIME-типы через `.htaccess`, `_headers` или файл в репозитории.** Тип определяется самим GitHub Pages на основе общей базы MIME. Если опубликованный USDZ получает неверный тип, исправление HTML не поможет: проверьте, что URL возвращает именно модель, а не HTML ошибки, и обратитесь к поддержке Pages / списку MIME. До проверки реального ответа нельзя считать критерий MIME выполненным.

## Ручная приёмка на iPhone / iPad

Проверка на реальном устройстве обязательна: проверка файлов и браузера на компьютере не подтверждает работу камеры и ARKit.

1. На совместимом iPhone или iPad откройте HTTPS-адрес **в Safari**. При открытии внутри другого приложения используйте «Открыть в Safari».
2. Нажмите на изображение лампы. Должен открыться системный Quick Look, а не скачивание файла или новая HTML-страница.
3. Выберите **AR**, если открыт режим «Объект». Разрешите использование камеры, если система спросит.
4. Медленно поводите устройством над освещённым столом или полом. Дождитесь распознавания поверхности и появления модели.
5. Убедитесь, что основание стоит на поверхности, модель вертикальна, размер около 28 × 22 × 22 см при исходном масштабе. Переместите и поверните её жестами. Масштабирование в Quick Look разрешено.
6. Закройте Quick Look: должна снова появиться веб-страница.
7. С другого экрана или распечатки отсканируйте `qr-code.svg` камерой. Ссылка должна открыть ту же опубликованную HTTPS-страницу; повторите шаги 2–5.
8. На Android или настольном браузере проверьте понятное сообщение о необходимости Safari на совместимом iPhone/iPad, работающую загрузку USDZ и возможность поделиться ссылкой.

`relList.supports('ar')` проверяет интеграцию браузера с Quick Look. Эта проверка не гарантирует наличие камеры, разрешения и успешное распознавание поверхности. Горизонтальное якорение задано внутри USDZ; JavaScript страницы не получает данные камеры.

## Замена модели

Замените `model.usdz` и соответствующее `preview.png`, обновите название, описание, размеры в `index.html`. Имена файлов сохраняются — менять ссылку не требуется. Браузерная загрузка пользовательских моделей не предусмотрена: по заданию модель является статическим файлом.

Модель демонстрации создана в Blender и упакована USD ARKit packager: `upAxis = Y`, `metersPerUnit = 1`, нижняя точка на Y=0, материалы UsdPreviewSurface, меши из треугольников; корневой prim содержит `preliminary:anchoring:type = plane` и `preliminary:planeAnchoring:alignment = horizontal`. Превью получено из той же геометрии. Это демонстрационный объект, не товар для продажи.

При экспорте своей модели используйте корректный USDZ-экспортёр: обычное переименование ZIP не подходит. USDZ хранит файлы без сжатия, с выравниванием данных по 64 байтам. Проверьте ориентацию, масштаб, нормали, материалы и основание на Y=0.

## Официальная документация

- Apple: [Previewing a Model with AR Quick Look](https://developer.apple.com/documentation/arkit/previewing-a-model-with-ar-quick-look)
- WebKit: [Viewing Augmented Reality Assets in Safari for iOS](https://webkit.org/blog/8421/viewing-augmented-reality-assets-in-safari-for-ios/) — структура ссылки, определение поддержки и MIME.
- GitHub: [Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- GitHub: [Creating a GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site) — раздел MIME types.
- GitHub: [Securing your GitHub Pages site with HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)

Сторонняя библиотека и её лицензия описаны в `THIRD_PARTY_NOTICES.md`.
