// Downloads the TIPS logo and consultant photos from tipscanada.ca into src/images.
// Usage:  npm run fetch-images          (download only)
//         npm run fetch-images -- --push (download, commit and push to GitHub)
import { writeFile, mkdir } from 'node:fs/promises';
import { execSync } from 'node:child_process';

const BASE = 'https://www.tipscanada.ca/wp-content/uploads/';
const FILES = {
  'tips-logo.jpg':     '2019/11/cropped-logo-5.jpg',
  'team-manpreet.jpg': '2023/01/manpreet-tips1.jpg',
  'team-surinder.jpg': '2023/09/WhatsApp-Image-2023-09-19-at-12.11.15-PM.jpeg',
  'team-manisha.jpg':  '2023/01/manisha-tips1.jpg',
  'team-nitin.jpg':    '2023/01/nitin-tips.jpg',
};

await mkdir('src/images', { recursive: true });
let failed = 0;
for (const [name, path] of Object.entries(FILES)) {
  try {
    const res = await fetch(BASE + path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 5000) throw new Error(`only ${buf.length} bytes, not a real photo`);
    await writeFile(`src/images/${name}`, buf);
    console.log(`ok   ${name.padEnd(20)} ${(buf.length / 1024).toFixed(0)} KB`);
  } catch (e) {
    failed++;
    console.log(`FAIL ${name.padEnd(20)} ${e.message}`);
  }
}
if (failed) { console.log(`\n${failed} download(s) failed. Nothing was committed.`); process.exit(1); }

if (process.argv.includes('--push')) {
  const run = (c) => execSync(c, { stdio: 'inherit' });
  run('git add src/images');
  run('git commit -m "Add TIPS logo and team photos"');
  run('git pull --rebase');
  run('git push');
  console.log('\nPushed to GitHub.');
} else {
  console.log('\nDone. Refresh localhost to see them.');
}
