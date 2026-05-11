Make all changes exactly as described. Do not read files not mentioned. Do not change anything not listed. Make all changes in one pass.

---

## BEFORE RUNNING THIS PROMPT

Copy these files into E:\Claude Project\ (project root, same level as index.html):
- manifest.json
- sw.js

Create a folder called `icons` in E:\Claude Project\ and copy these into it:
- icon-192.png
- icon-512.png

---

## CHANGE 1 — `index.html`: Link manifest and register service worker

Find:
```
  <meta charset="UTF-8">
```
Replace with:
```
  <meta charset="UTF-8">
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#4D8B7A">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="Kitchen Calm">
  <link rel="apple-touch-icon" href="/icons/icon-192.png">
```

Find:
```
</body>
```
Replace with:
```
  <script>
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  </script>
</body>
```

---

## CHANGE 2 — `HANDOVER.md`: Document PWA setup

Find:
```
## Next Session Priorities
```
Replace with:
```
## Next Session Priorities

> **Completed this session:** PWA setup complete. manifest.json and sw.js added to project root. Icons at icons/icon-192.png and icons/icon-512.png. App now installable via "Add to Home Screen" on Android Chrome/Brave and iOS Safari. Service worker caches shell files for offline support. Ready for Samsung Galaxy Store and Amazon Appstore submission.

```

---

## CHANGE 3 — Commit and push

Run:
```
git add -A
git commit -m "Add PWA manifest, service worker and icons — app now installable"
git push
```
