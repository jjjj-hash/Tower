// Testes do filtro num Instagram simulado (não toca no Instagram verdadeiro).
// Correr com:  node test/run-tests.js
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const SCRIPT = fs.readFileSync(path.join(__dirname, '..', 'instagram-limpo.user.js'), 'utf8');
const MOCK = fs.readFileSync(path.join(__dirname, 'mock-instagram.html'), 'utf8');

// Servidor local. Com stripVariant=true simula um Instagram que ignora "?variant=following".
function startServer({ stripVariant = false } = {}) {
  const hits = [];
  const server = http.createServer((req, res) => {
    hits.push(req.url);
    if (req.url === '/favicon.ico') { res.writeHead(404); return res.end(); }
    if (stripVariant && req.url.startsWith('/?variant=')) {
      res.writeHead(302, { Location: '/' });
      return res.end();
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(MOCK);
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve({ server, hits, base: `http://127.0.0.1:${server.address().port}` });
    });
  });
}

let failures = 0;
let passes = 0;
function check(name, cond, detail = '') {
  if (cond) { passes++; console.log(`  ✓ ${name}`); }
  else { failures++; console.log(`  ✗ ${name}${detail ? ' — ' + detail : ''}`); }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function visible(page, sel) {
  return page.evaluate((s) => {
    const el = document.querySelector(s);
    return !!el && el.checkVisibility();
  }, sel);
}

async function main() {
  const browser = await chromium.launch();
  const { server, base } = await startServer();

  async function newPage() {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.addInitScript({ content: SCRIPT });
    const page = await context.newPage();
    page.on('pageerror', (e) => { failures++; console.log('  ✗ erro na página: ' + e.message); });
    return { context, page };
  }

  // 1) Feed inicial
  console.log('Feed inicial');
  {
    const { context, page } = await newPage();
    await page.goto(base + '/');
    await page.waitForURL(/variant=following/, { timeout: 5000 }).catch(() => {});
    check('redireciona para o feed "A seguir"', page.url().endsWith('/?variant=following'), page.url());
    await sleep(700);

    check('aviso "Filtro ativo" aparece', /Filtro ativo/.test(await page.textContent('#il-indicator').catch(() => '')));
    check('publicação normal visível', await visible(page, '#normal'));
    check('legenda com "patrocinado"/"seguir" visível', await visible(page, '#caption-words'));
    check('publicação "Patrocinado" escondida', !(await visible(page, '#ad')));
    check('"Patrocinado" partido em pedaços escondido', !(await visible(page, '#ad-split')));
    check('publicação de conta que não sigo escondida', !(await visible(page, '#suggested')));
    check('Reel no feed escondido', !(await visible(page, '#reel')));
    check('Reel com link absoluto escondido', !(await visible(page, '#reel-abs')));
    check('vídeo normal (carrossel /p/) visível', await visible(page, '#video-post'));
    check('bloco "Sugestões para ti" escondido', !(await visible(page, '#sugg-section')));
    check('stories visíveis', await visible(page, '#tray'));
    check('botão Reels da barra escondido (com o espaço)', !(await visible(page, '#nav-reels-wrap')));
    check('botão Pesquisar visível', await visible(page, 'a[href="/explore/"]'));
    check('botão Mensagens visível', await visible(page, '#nav-dm'));

    await page.evaluate(() => window.mockLateAd());
    await sleep(600);
    check('anúncio carregado mais tarde escondido', !(await visible(page, '#late-ad')));

    // O Instagram pode reaproveitar um elemento para outra publicação.
    await page.evaluate(() => {
      const ad = document.getElementById('ad');
      ad.querySelector('.media').setAttribute('href', '/p/NOVA/');
      ad.querySelector('.hdr span').textContent = '• 3 h';
    });
    await sleep(600);
    check('elemento reaproveitado volta a aparecer', await visible(page, '#ad'));

    await sleep(6000);
    check('aviso desaparece ao fim de uns segundos', !(await page.$('#il-indicator')));
    await context.close();
  }

  // 2) Separador Reels bloqueado
  console.log('Separador Reels');
  {
    const { context, page } = await newPage();
    await page.goto(base + '/reels/');
    await page.waitForURL(/variant=following/, { timeout: 5000 }).catch(() => {});
    check('/reels/ volta para o feed', page.url().endsWith('/?variant=following'), page.url());
    await context.close();
  }

  // 3) Reels enviados por mensagem continuam a abrir
  console.log('Mensagens');
  {
    const { context, page } = await newPage();
    await page.goto(base + '/direct/t/1/');
    await sleep(600);
    check('Reel dentro da conversa visível', await visible(page, '#dm-reel'));
    await page.evaluate(() => window.mockNavigate('/reels/ABC/'));
    await sleep(1200);
    check('Reel aberto a partir da mensagem abre', page.url().endsWith('/reels/ABC/'), page.url());
    await page.evaluate(() => window.mockNavigate('/reels/XYZ/'));
    await page.waitForURL(/\/direct\/t\/1\/$/, { timeout: 5000 }).catch(() => {});
    check('deslizar para o Reel seguinte volta à conversa', page.url().endsWith('/direct/t/1/'), page.url());
    await context.close();
  }

  // 4) Explorar
  console.log('Explorar');
  {
    const { context, page } = await newPage();
    await page.goto(base + '/explore/');
    await sleep(700);
    check('grelha do Explorar escondida', !(await visible(page, '#grid')));
    check('caixa de pesquisa visível', await visible(page, '#search'));
    check('fica na página de pesquisa', page.url().endsWith('/explore/'), page.url());
    await context.close();
  }

  // 5) Perfil
  console.log('Perfil');
  {
    const { context, page } = await newPage();
    await page.goto(base + '/joao/');
    await sleep(700);
    check('separador Reels do perfil escondido', !(await visible(page, '#tab-reels')));
    check('separador Publicações visível', await visible(page, '#tab-posts'));
    check('"Sugestões para ti" do perfil escondido', !(await visible(page, '#profile-sugg')));
    check('publicação aberta de conta que não sigo visível', await visible(page, '#profile-post'));
    await context.close();
  }

  // 6) Stories patrocinadas
  console.log('Stories');
  {
    const { context, page } = await newPage();
    await page.goto(base + '/stories/marca/1/');
    await sleep(700);
    check('anúncio nas stories tapado', await visible(page, '#il-story-overlay'));
    check('anúncio nas stories sem som', await page.evaluate(() => document.getElementById('story-video').muted));
    await page.evaluate(() => window.mockNextStory());
    await sleep(700);
    check('story seguinte sem cortina', !(await page.$('#il-story-overlay')));
    check('story seguinte com som reposto', await page.evaluate(() => !document.getElementById('story-video').muted));
    await context.close();
  }

  server.close();

  // 7) Proteção contra ciclos de redirecionamento
  console.log('Proteção contra ciclos');
  {
    const strip = await startServer({ stripVariant: true });
    const { context, page } = await newPage();
    await page.goto(strip.base + '/').catch(() => {});
    await sleep(5000);
    const homeHits = strip.hits.filter((u) => u === '/' || u.startsWith('/?')).length;
    check('para de redirecionar se o Instagram ignorar "A seguir"', homeHits <= 12, `${homeHits} pedidos`);
    check('a página fica utilizável', new URL(page.url()).pathname === '/', page.url());
    await sleep(800);
    check('filtros continuam ativos', !(await visible(page, '#ad')));
    await context.close();
    strip.server.close();
  }

  await browser.close();
  console.log(`\n${passes} passaram, ${failures} falharam`);
  process.exit(failures ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
