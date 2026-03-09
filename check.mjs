import fs from 'fs';
const c = fs.readFileSync('src/app/pricing/page.tsx', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('\telative') || l.includes('\text-sm') || l.includes('\tlock ')) {
    console.log(i+1, JSON.stringify(l.substring(0,100)), 'CORRUPT');
  }
});
console.log('total lines:', lines.length);
