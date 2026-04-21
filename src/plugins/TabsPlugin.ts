import type { SimplePlugin, PluginContext } from './types';
import type ConfigurationManager from '../managers/ConfigurationManager';

const TAB_REGEX = /\[\{Tab\s+name='([^']+)'\s*\}\]([\s\S]*?)\[\{\/Tab\}\]/g;

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const TabsPlugin: SimplePlugin = {
  name: 'TabsPlugin',
  description: 'Renders Bootstrap nav-tabs from [{Tab name="..."}]content[{/Tab}] body blocks',
  author: 'ngdpbase',
  version: '1.0.0',

  async execute(context: PluginContext): Promise<string> {
    const body = (context.bodyContent as string | null) ?? '';

    const tabs: Array<{ name: string; slug: string; content: string }> = [];
    let match: RegExpExecArray | null;
    TAB_REGEX.lastIndex = 0;
    while ((match = TAB_REGEX.exec(body)) !== null) {
      tabs.push({ name: match[1], slug: slugify(match[1]), content: match[2].trim() });
    }

    if (tabs.length === 0) return '';

    const configManager = context.engine?.getManager('ConfigurationManager') as ConfigurationManager | undefined;
    const style = (configManager?.getProperty('ngdpbase.tab.style', 'tabs') as string) || 'tabs';
    const persist = configManager?.getProperty('ngdpbase.tab.persist', true) as boolean;

    const uid = Math.random().toString(36).slice(2, 8);
    const storageKey = `ngdp-tab-${context.pageName ?? 'page'}-${uid}`;

    const navClass = style === 'pills' ? 'nav-pills' : style === 'underline' ? 'nav-underline' : 'nav-tabs';

    const navItems = tabs.map((t, i) => {
      const active = i === 0 ? ' active' : '';
      const selected = i === 0 ? 'true' : 'false';
      return '<li class="nav-item" role="presentation">' +
        `<button class="nav-link${active}" id="tab-${uid}-${t.slug}" ` +
        `data-bs-toggle="tab" data-bs-target="#pane-${uid}-${t.slug}" ` +
        `type="button" role="tab" aria-controls="pane-${uid}-${t.slug}" ` +
        `aria-selected="${selected}">${t.name}</button></li>`;
    }).join('\n');

    const panes = tabs.map((t, i) => {
      const active = i === 0 ? ' show active' : '';
      return `<div class="tab-pane fade${active}" id="pane-${uid}-${t.slug}" ` +
        `role="tabpanel" aria-labelledby="tab-${uid}-${t.slug}">\n${t.content}\n</div>`;
    }).join('\n');

    const persistScript = persist ? `
<script>
(function(){
  var key=${JSON.stringify(storageKey)};
  var saved=localStorage.getItem(key);
  if(saved){var el=document.getElementById('tab-${uid}-'+saved);if(el)el.click();}
  document.querySelectorAll('#tabs-${uid} .nav-link').forEach(function(btn){
    btn.addEventListener('shown.bs.tab',function(){localStorage.setItem(key,btn.dataset.bsTarget.replace('#pane-${uid}-',''));});
  });
})();
</script>` : '';

    return `<div class="ngdp-tabs" id="tabs-${uid}">
<ul class="nav ${navClass} mb-3" role="tablist">
${navItems}
</ul>
<div class="tab-content">
${panes}
</div>
</div>${persistScript}`;
  }
};

export default TabsPlugin;
