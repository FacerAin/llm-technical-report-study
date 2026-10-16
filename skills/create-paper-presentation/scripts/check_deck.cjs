#!/usr/bin/env node
// A real-browser check of the bundled shell; it does not establish factual accuracy.
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL, fileURLToPath} = require('node:url');

async function main() {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) throw new Error('Usage: node check_deck.cjs deck.html output-directory');
  const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
  const out = path.resolve(output);
  fs.mkdirSync(out, {recursive: true});
  const browser = await chromium.launch({headless: true,
    ...(process.env.CHROME_PATH ? {executablePath: process.env.CHROME_PATH} : {})});
  const errors = [], views = [], failures = [];
  try {
    const page = await browser.newPage();
    page.on('pageerror', error => errors.push(error.message));
    const url = /^https?:\/\//.test(input) ? input : pathToFileURL(path.resolve(input)).href;
    for (const vp of [{width:1440,height:900},{width:860,height:760},{width:390,height:844}]) {
      await page.setViewportSize(vp);
      await page.goto(url);
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      await page.evaluate(() => document.fonts.ready);
      const audit = await page.evaluate(() => window.deckCheck());
      if (!audit.length) failures.push(`${vp.width}: no slides`);
      const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2);
      if (horizontalOverflow) failures.push(`${vp.width}: page horizontal overflow`);
      if (vp.width < 820) {
        const mobileMode = await page.evaluate(() => ({fit:document.documentElement.classList.contains('fit'),toggleHidden:document.querySelector('#mode').hidden}));
        if (mobileMode.fit || !mobileMode.toggleHidden) failures.push(`${vp.width}: unsupported mobile fit mode available`);
        await page.selectOption('#jump','0');
        await page.evaluate(() => window.scrollTo(0,document.documentElement.scrollHeight));
        if (audit.length > 1) {
          await page.locator('#next').click();
          if (await page.evaluate(() => window.scrollY > 2)) failures.push(`${vp.width}: next slide retained previous scroll position`);
        }
        // A saved desktop preference must not clip the mobile layout on reload.
        await page.evaluate(() => localStorage.setItem('paper-study-' + document.title + '-mode','slide'));
        await page.reload();
        if (await page.evaluate(() => document.documentElement.classList.contains('fit'))) failures.push(`${vp.width}: saved slide mode bypassed mobile layout`);
        await page.evaluate(() => localStorage.clear());
      }
      for (const item of audit) {
        if (item.innerOverflow || item.cardOverflow || !item.hasSource)
          failures.push(`${vp.width}: slide ${item.slide} overflow or missing source`);
        await page.selectOption('#jump', String(item.slide - 1));
        await page.screenshot({path:path.join(out,`${vp.width}-s${String(item.slide).padStart(2,'0')}.png`),fullPage:vp.width < 820});
      }
      views.push({viewport:vp, horizontalOverflow, slides:audit});
    }
    await page.setViewportSize({width:1440,height:900});
    await page.reload();
    await page.locator('body').click({position:{x:5,y:5}});
    await page.keyboard.press('Home');
    const first = await page.locator('#count').innerText();
    const total = await page.locator('.slide').count();
    if (total > 1) await page.locator('#next').click();
    const next = await page.locator('#count').innerText();
    if (total > 1) await page.locator('#prev').click();
    const previous = await page.locator('#count').innerText();
    await page.locator('body').click({position:{x:5,y:5}});
    await page.keyboard.press('End');
    const end = await page.locator('#count').innerText();
    await page.keyboard.press('ArrowLeft');
    const left = await page.locator('#count').innerText();
    await page.locator('#mode').click();
    const read = await page.evaluate(() => !document.documentElement.classList.contains('fit'));
    await page.locator('#mode').click();
    const fit = await page.evaluate(() => document.documentElement.classList.contains('fit'));
    const navigation = {first,next,previous,end,left,read,fit};
    if (first !== `1 / ${total}` || previous !== first || next !== `${Math.min(2,total)} / ${total}` ||
        end !== `${total} / ${total}` || left !== `${Math.max(1,total-1)} / ${total}` || !read || !fit)
      failures.push('navigation or mode toggle mismatch');
    const links = await page.locator('.slide a').evaluateAll(nodes => nodes.map(a => ({label:a.textContent,href:a.href})));
    const brokenLocal = links.filter(link => link.href.startsWith('file:') && !fs.existsSync(fileURLToPath(new URL(link.href))));
    if (brokenLocal.length) failures.push(`${brokenLocal.length} missing local link targets`);
    if (errors.length) failures.push(`${errors.length} browser errors`);
    await page.emulateMedia({media:'print'});
    await page.pdf({path:path.join(out,'review.pdf'),preferCSSPageSize:true,printBackground:true});
    const report = {views,navigation,links,brokenLocal,errors,failures,
      note:'External URLs were collected, not HTTP-validated. Screenshots require visual review.'};
    fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify({slides:total,viewports:views.length,navigation,brokenLocal,errors,failures},null,2));
    process.exitCode = failures.length ? 1 : 0;
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
