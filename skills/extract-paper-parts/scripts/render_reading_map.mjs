#!/usr/bin/env node
/** Render reviewed Markdown without rewriting its factual content. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node render_reading_map.mjs input.md output.html [--title "Title"]');
  process.exit(1);
}
const [inputArg, outputArg] = args;
const input = path.resolve(inputArg), output = path.resolve(outputArg);
const explicitTitle = args.includes('--title') ? args[args.indexOf('--title') + 1] : null;
let moduleName = process.env.MARKED_MODULE || 'marked';
if (path.isAbsolute(moduleName)) {
  if (fs.statSync(moduleName).isDirectory()) {
    const pkg = JSON.parse(fs.readFileSync(path.join(moduleName, 'package.json'), 'utf8'));
    moduleName = path.join(moduleName, pkg.module || pkg.main);
  }
  moduleName = pathToFileURL(moduleName).href;
}
const {Marked} = await import(moduleName);
const md = new Marked({gfm:true, breaks:false});
const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain = s => s.replace(/<[^>]+>/g,'').replace(/&amp;/g,'&');
const original = fs.readFileSync(input, 'utf8');
const tokens = md.lexer(original);
// Rebase local references when the output is placed in a different folder.
md.walkTokens(tokens, token => {
  if (!['link','image'].includes(token.type) || /^(?:[a-z][a-z0-9+.-]*:|#|\/)/i.test(token.href)) return;
  const match = /^([^?#]*)(.*)$/.exec(token.href);
  const target = path.resolve(path.dirname(input), decodeURIComponent(match[1]));
  token.href = path.relative(path.dirname(output), target).split(path.sep).map(encodeURIComponent).join('/') + match[2];
});
const h1 = tokens.find(t => t.type === 'heading' && t.depth === 1);
const title = explicitTitle || (h1 ? plain(md.parseInline(h1.text)) : path.basename(input,'.md'));
const reserved = new Set([...original.matchAll(/\bid=["']([^"']+)["']/g)].map(m => m[1]));
const uniqueId = value => {
  let result=value, n=2;
  while (reserved.has(result)) result=value+'-'+n++;
  reserved.add(result);return result;
};
// The document outline is evidence organization, not the reading navigation.
// Every page belongs to one of the five study parts, or to shared context.
const partOrder=['architecture','data','post','alignment','background','common'];
const partLabels={architecture:'Architecture & Pre-training',data:'Data & Synthesis',post:'Post-training',alignment:'Alignment & RL',background:'Background',common:'공통 자료'};
const normalizePart=value=>({posttraining:'post','post-training':'post',ap:'architecture'})[value] || (partOrder.includes(value)?value:null);
const markerPart=token=>{
  const found=/<!--\s*part:\s*([a-z-]+)\s*-->/i.exec(token.raw || '');
  return found ? normalizePart(found[1].toLowerCase()) : null;
};
const partNames=value=>{
  const valueText=plain(md.parseInline(String(value))).trim();
  const matches=[];
  if (/Architecture|Pre[- ]training|A&P/i.test(valueText)) matches.push('architecture');
  if (/\bData\b(?:\s*&\s*Synthesis)?|데이터\s*파트/i.test(valueText)) matches.push('data');
  if (/Post[- ]training/i.test(valueText)) matches.push('post');
  if (/Alignment(?:\s*&\s*RL)?|(?:^|[\s/])RL(?:핵심|\s|$)/i.test(valueText)) matches.push('alignment');
  if (/Background/i.test(valueText)) matches.push('background');
  return [...new Set(matches)];
};
const singlePart=value=>{const found=partNames(value);return found.length===1?found[0]:null;};
const exactPart=value=>{
  const text=plain(md.parseInline(String(value))).trim();
  return Object.keys(partLabels).find(key=>partLabels[key].toLowerCase()===text.toLowerCase()) || null;
};
const sections=[];
let current=null, declaredPart=null;
for (const token of tokens) {
  if (token === h1) continue;
  const marker=token.type==='html' && /^\s*<!--\s*part:\s*[a-z-]+\s*-->\s*$/i.test(token.raw || '') ? markerPart(token) : null;
  if (marker) declaredPart=marker;
  if (token.type === 'heading' && token.depth === 2) {
    const heading=plain(md.parseInline(token.text));
    current={title:heading,id:uniqueId('section-'+(sections.length+1)),part:exactPart(heading)||declaredPart,tokens:[]};
    sections.push(current);
  } else {
    if (!current) {current={title:'읽기 안내',id:uniqueId('section-intro'),part:declaredPart,tokens:[]};sections.push(current);}
    current.tokens.push(token);
  }
}
const anchorOnly = token => /^(?:\s*<a\s+(?:id|name)=["'][^"']+["']\s*><\/a>\s*)+$/.test(token.raw || '');
const metadataOnly=token=>anchorOnly(token) || /^(?:\s*<!--[\s\S]*?-->\s*)+$/.test(token.raw || '');
const meaningful = values => values.some(t => t.type !== 'space' && !metadataOnly(t));
const visibleSections=sections.filter(s => meaningful(s.tokens));
const render = values => {values.links=tokens.links;return md.parser(values);};
const cell = value => render([{type:'paragraph',text:value.text,tokens:value.tokens}]).replace(/^<p>|<\/p>\n?$/g,'');
const textOf=value=>plain(cell(value)).trim();
const sectionStage=title=>/핵심 인계|요약|핵심 질문/.test(title)?0:/분량|개요|범위와 부담/.test(title)?1:/공백|확인 필요/.test(title)?3:/읽기|선행/.test(title)?4:5;
const ownerOf=(section,item)=>{
  if (section.part) return section.part;
  const raw=item.tokens.map(t=>t.raw || '').join('\n');
  const owner=/(?:^|[;\n])\s*(?:-\s*)?주관(?![ \t]+(?:K[ \t]*)?ID\b)(?:[ \t]*:[ \t]*|[ \t]+)([^;\n]+?)(?:;|공동|$)/mi.exec(raw);
  const explicitOwner=owner && singlePart(owner[1]);
  if (explicitOwner) return explicitOwner;
  if (/외부.*배경/.test(section.title)) return 'background';
  return 'common';
};
const rowOwner=(section,item,row,owner)=>{
  const explicit=markerPart({raw:row[0]?.text || ''});
  if (explicit) return explicit;
  if (section.part) return section.part;
  if (owner!=='common') return owner;
  const first=textOf(row[0]),second=row[1]?textOf(row[1]):'';
  const exact=exactPart(first);
  if (exact) return exact;
  if (/공통.*심화|선행.*읽기/.test(section.title) || /읽기/.test(item.title)) {
    if (/^공통/.test(first)) return 'common';
    if (/^선행[·ㆍ/ ]|^외부/.test(first)) return 'background';
    if (/^파트별/.test(first)) return singlePart(second) || 'common';
    return singlePart(first) || 'common';
  }
  if (/공백|확인 필요/.test(section.title+' '+item.title)) {
    // Only explicit part labels assign ownership. An unlabeled SFT dataset
    // question, for example, must not be guessed into Post-training.
    return singlePart(first) || 'common';
  }
  if (/범위 조정/.test(section.title+' '+item.title)) return singlePart(first) || 'common';
  return 'common';
};
const pages=[];
let summaryRendered=false;
const addPage=(section,title,html,kind,owner,stage,topic='')=>{
  pages.push({section,title,html,kind:kind||'text',part:owner||'common',stage,topic,id:uniqueId('page-'+(pages.length+1)),sequence:pages.length});
};
for (const section of visibleSections) {
  const groups=[];
  let group={title:section.title,tokens:[]};
  for (const token of section.tokens) {
    if (token.type==='heading' && (token.depth===3 || token.depth===4 && /^[KE]\d+\b/.test(token.text))) {
      const leading=[];
      while (group.tokens.length && (group.tokens.at(-1).type==='space' || metadataOnly(group.tokens.at(-1)))) leading.unshift(group.tokens.pop());
      if (meaningful(group.tokens)) groups.push(group);
      group={title:plain(md.parseInline(token.text)),tokens:leading};
    } else group.tokens.push(token);
  }
  if (meaningful(group.tokens)) groups.push(group);
  else if (group.tokens.length && groups.length) groups.at(-1).tokens.push(...group.tokens);
  for (const item of groups) {
    const owner=ownerOf(section,item);
    const topic=/^([KE]\d+)\b/.exec(item.title)?.[1] || '';
    const stage=topic?2:sectionStage(item.title);
    let buffer=[],continuation=0;
    const flush=()=>{
      if (!meaningful(buffer)) return;
      addPage(section,item.title+(continuation++?' · 계속':''),render(buffer),stage===0 && owner!=='common' && !topic?'part':'text',owner,stage,topic);
      buffer=[];
    };
    for (const token of item.tokens) {
      if (token.type==='list') {
        const chunks=[];
        let rows=[],characters=0,offset=0;
        const pushChunk=()=>{
          if (!rows.length) return;
          chunks.push({...token,items:rows,start:token.ordered?Number(token.start)+offset:token.start});
          offset+=rows.length;rows=[];characters=0;
        };
        for (const row of token.items) {
          const count=plain(render([{...token,items:[row]}])).replace(/\s+/g,' ').trim().length;
          if (rows.length && (rows.length>=6 || characters+count>600)) pushChunk();
          rows.push(row);characters+=count;
        }
        pushChunk();
        chunks.forEach((chunk,index)=>{
          const combined=plain(render([...buffer,chunk])).replace(/\s+/g,' ').trim().length;
          if (meaningful(buffer) && combined>700) flush();
          buffer.push(chunk);
          if (index<chunks.length-1) flush();
        });
        continue;
      }
      if (token.type!=='table') {buffer.push(token);continue;}
      const isSummary=!summaryRendered && /핵심 인계/.test(section.title);
      flush();
      const leading=render(buffer);buffer=[];
      if (isSummary) {
        token.rows.forEach((row,index)=>{
          const part=rowOwner(section,item,row,owner);
          const question=row[1]?`<div class="part-question"><span>${cell(token.header[1])}</span><p>${cell(row[1])}</p></div>`:'';
          const fields=row.slice(2).map((value,j)=>`<dt>${cell(token.header[j+2])}</dt><dd>${cell(value)}</dd>`).join('');
          const html=`${index===0?leading:''}<article class="part-card"><span class="part-label">${cell(token.header[0])} ${String(partOrder.indexOf(part)+1).padStart(2,'0')}</span>${question}<dl>${fields}</dl></article>`;
          addPage(section,textOf(row[0]),html,'part',part,0);
        });
        summaryRendered=true;
      } else {
        // A page never mixes rows belonging to different parts. Each source
        // cell survives unchanged, including rows kept in the common group.
        const sets=new Map();
        for (const row of token.rows) {
          const part=rowOwner(section,item,row,owner);
          if (!sets.has(part)) sets.set(part,[]);
          sets.get(part).push(row);
        }
        let firstPage=true;
        for (const [part,rows] of sets) {
          for (let index=0;index<rows.length;index+=2) {
            const chunk=rows.slice(index,index+2);
            const suffix=rows.length>2?` · ${index+1}–${index+chunk.length}/${rows.length}`:'';
            addPage(section,item.title+suffix,(firstPage?leading:'')+render([{...token,rows:chunk}]),'table',part,stage,topic);
            firstPage=false;
          }
        }
      }
    }
    flush();
    if (buffer.length && pages.length) pages.at(-1).html+=render(buffer);
  }
}
// Part-local progression: question → scope → owned evidence → gaps → reading.
// Shared context keeps its source order in the separate common collection.
pages.sort((a,b)=>partOrder.indexOf(a.part)-partOrder.indexOf(b.part) || (a.part==='common'?0:a.stage-b.stage) || a.sequence-b.sequence);
const seenSections=new Set();
const partCounts=Object.fromEntries(partOrder.map(part=>[part,pages.filter(page=>page.part===part).length]));
const localIndices={};
const body=pages.map(page=>{
  const sectionAnchor=seenSections.has(page.section.id)?'':`<a class="section-anchor" id="${page.section.id}"></a>`;
  seenSections.add(page.section.id);
  const index=localIndices[page.part]=(localIndices[page.part]||0)+1;
  return `<section class="paper-page" id="${page.id}" data-part="${page.part}" data-section="${escape(page.section.title)}" data-page-title="${escape(page.title)}" data-kind="${page.kind}" data-topic="${escape(page.topic)}" aria-label="${escape(partLabels[page.part])} ${index} / ${partCounts[page.part]}">${sectionAnchor}<div class="section-heading"><span>${String(index).padStart(2,'0')}</span><h2>${escape(page.title)}</h2></div><div class="page-body">${page.html}</div></section>`;
}).join('\n');
const toc=partOrder.map((part,index)=>{
  const first=pages.find(page=>page.part===part);
  return first?`<a href="#${first.id}" data-part="${part}"><span>${String(index+1).padStart(2,'0')}</span>${escape(partLabels[part])}</a>`:'';
}).join('');
const sourceHref = path.relative(path.dirname(output),input).split(path.sep).map(encodeURIComponent).join('/');
const here=path.dirname(fileURLToPath(import.meta.url));
let shell=fs.readFileSync(path.join(here,'../assets/reading-map-shell.html'),'utf8');
if(!pages.length) throw new Error('No reading-map content found in the Markdown input.');
const slots=[
  [/<title data-reading-map-title>[^<]*<\/title>/,'<title>'+escape(title)+'</title>'],
  [/<h1 class="ttl" data-reading-map-title>[^<]*<\/h1>/,'<h1 class="ttl">'+escape(title)+'</h1>'],
  [/<a class="source-link" data-reading-map-source href="[^"]*">[^<]*<\/a>/,'<a class="source-link" href="'+escape(sourceHref)+'">Markdown ↗</a>'],
  [/<!-- READING_MAP_BODY -->/,body]
];
for(const [pattern,value] of slots){
  if(!pattern.test(shell)) throw new Error('Reading-map shell is missing a required content slot.');
  shell=shell.replace(pattern,()=>value);
}
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,shell);
console.log(`${output}: ${pages.length} pages; parts ${JSON.stringify(partCounts)}; original Markdown retained`);
