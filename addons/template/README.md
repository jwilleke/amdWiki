# ngdpbase Add-on Template

Starter scaffold for building a new ngdpbase add-on.

## Quick Start

1. Copy this folder to your add-on repo and rename it:

   ```sh
   cp -r addons/template /path/to/my-addon-repo/addons/my-addon
   ```

2. Install dependencies (external repos cannot use ngdpbase's `node_modules`):

   ```sh
   npm install
   ```

3. Rename every occurrence of `template` / `Template` to your add-on name in:
   - `index.js` — `name:`, require paths, route prefix, static path
   - `managers/TemplateDataManager.js` → `managers/MyDataManager.js`
   - `plugins/TemplatePlugin.js` → `plugins/MyPlugin.js`
   - `routes/api.js` — route prefix
   - `public/css/template.css` → `public/css/my-addon.css`

4. Add to your ngdpbase instance config (`$FAST_STORAGE/config/app-custom-config.json`):

   ```json
   {
     "ngdpbase.managers.addons-manager.addons-path": "/absolute/path/to/my-addon-repo/addons",
     "ngdpbase.addons.my-addon.enabled": true,
     "ngdpbase.addons.my-addon.dataPath": "./data/my-addon"
   }
   ```

5. Restart: `./server.sh restart`

6. Verify in the admin panel → Add-ons section.

## Structure

```
template/
├── package.json              ← declare express + any other deps; run npm install
├── index.js                  ← AddonModule entry point
├── managers/
│   └── TemplateDataManager.js  ← JSON-backed data store (replace with your logic)
├── plugins/
│   └── TemplatePlugin.js       ← [{Template id='42'}] markup directive
├── routes/
│   └── api.js                  ← GET /api/template/search, /api/template/:id
├── public/
│   └── css/
│       └── template.css        ← Served at /addons/template/css/template.css
└── README.md
```

## Further Reading

- [Add-on Development Guide](../../docs/platform/addon-development-guide.md)
- [Platform Guide](../../docs/platform/ngdp-as-platform.md)
