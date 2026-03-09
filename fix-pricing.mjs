import fs from 'fs';
let c = fs.readFileSync('src/app/pricing/page.tsx', 'utf8');

// Fix tab character before ext-sm
const tab = '\t';
c = c.replace(`className={${tab}ext-sm font-medium}`, 'className="text-sm font-medium"');

// Fix href with template literal issue
c = c.replace(/href=\{\/register\?plan=[^}]*\}/g, 'href="/register"');

// Fix className with block issue
c = c.replace(/className=\{lock text-center py-3 rounded-xl font-semibold text-sm transition-all mb-7 \}/g, 
  'className="block text-center py-3 rounded-xl font-semibold text-sm transition-all mb-7"');

fs.writeFileSync('src/app/pricing/page.tsx', c);
console.log('pricing/page.tsx patched');
