// ==UserScript==
// @name         Instagram Limpo
// @namespace    tower.instagram-limpo
// @version      0.1.0
// @description  Esconde Reels, publicidade, sugestões e Explorar no instagram.com. Uso pessoal.
// @match        https://www.instagram.com/*
// @match        https://instagram.com/*
// @run-at       document-start
// @inject-into  content
// @noframes
// @grant        none
// ==/UserScript==

/*
 * Instagram Limpo — filtro pessoal para o instagram.com.
 *
 * O que faz: esconde elementos no ecrã. Não envia dados para lado nenhum,
 * não faz pedidos à internet, não lê nem guarda a palavra-passe e não altera
 * nada na conta. Toda a lógica está neste ficheiro.
 *
 * Como funciona: procura marcas que mudam pouco na página do Instagram
 * (ligações para /reels/, o texto "Patrocinado", "Sugestões para ti", o botão
 * "Seguir" no cabeçalho de uma publicação) e esconde o bloco correspondente.
 * Quando o Instagram mudar o site, pode ser preciso ajustar estas marcas.
 */

(function () {
  'use strict';

  if (window.top !== window.self) return; // nunca correr dentro de iframes

  // ---------------------------------------------------------------------------
  // CONFIGURAÇÃO — muda true/false conforme preferires.
  // ---------------------------------------------------------------------------
  const CONFIG = {
    esconderReels: true,        // separador Reels, Reels no feed e separador Reels dos perfis
    reelsNasMensagens: true,    // true = Reels enviados por mensagem continuam a abrir
    esconderPublicidade: true,  // publicações e stories "Patrocinado"
    esconderSugestoes: true,    // "Sugestões para ti" e publicações de contas que não segues
    esconderExplorar: true,     // grelha do Explorar
    permitirPesquisa: true,     // mantém a pesquisa de contas (sem a grelha)
    feedSoQuemSigo: true,       // abre sempre o feed "A seguir"
    mostrarIndicador: true,     // aviso "Filtro ativo" durante uns segundos ao abrir
  };

  // ---------------------------------------------------------------------------
  // Textos que o Instagram mostra (português de Portugal, do Brasil e inglês).
  // ---------------------------------------------------------------------------
  function norm(s) {
    return (s || '')
      .replace(/[​-‍⁠﻿]/g, '')
      .replace(/ /g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/^[\s·•.:]+|[\s·•.:]+$/g, '')
      .toLowerCase();
  }
  const conjunto = (lista) => new Set(lista.map(norm));

  const TEXTO = {
    patrocinado: conjunto([
      'Patrocinado', 'Patrocinada', 'Sponsored', 'Publicidade',
    ]),
    sugestoes: conjunto([
      'Sugestões para ti', 'Sugestões para você', 'Sugerido para ti', 'Sugerido para você',
      'Sugeridos para ti', 'Sugeridos para você', 'Suggested for you',
      'Publicações sugeridas', 'Suggested posts',
      'Reels sugeridos', 'Suggested reels', 'Sugestões de reels',
      'Contas sugeridas', 'Suggested accounts',
    ]),
    seguir: conjunto([
      'Seguir', 'Follow', 'Seguir de volta', 'Follow back', 'Seguir também',
    ]),
  };

  // ---------------------------------------------------------------------------
  // Atributos e estado
  // ---------------------------------------------------------------------------
  const ATTR = 'data-il-hide';   // motivo pelo qual o elemento está escondido
  const KEY = 'data-il-key';     // "impressão digital" do elemento quando foi escondido
  const OWN = 'data-il-own';     // marca os elementos criados por este filtro
  const HOME_URL = CONFIG.feedSoQuemSigo ? '/?variant=following' : '/';

  const stats = { reels: 0, publicidade: 0, sugestoes: 0, explorar: 0 };
  const state = {
    startedAt: Date.now(),
    lastPath: null,
    lastHref: null,
    allowedReel: null,  // Reel aberto a partir das mensagens
    returnTo: null,     // conversa para onde voltar
    navigating: false,
  };

  // ---------------------------------------------------------------------------
  // Rotas
  // ---------------------------------------------------------------------------
  const isHome = (p) => p === '/';
  const isDirect = (p) => p.startsWith('/direct');
  const isStories = (p) => p.startsWith('/stories/');
  const isExploreGrid = (p) => p === '/explore/' || p === '/explore';
  const isReelsFeed = (p) => /^\/reels(\/|$)/.test(p);
  const isSingleReel = (p) =>
    /^\/reel\/[^/]+/.test(p) || (/^\/reels\/[^/]+\/?$/.test(p) && !/^\/reels\/audio/.test(p));

  function go(url) {
    state.navigating = true;
    location.replace(url);
  }

  // Proteção contra ciclos: se o Instagram ignorar "?variant=following",
  // deixamos de redirecionar durante esta sessão.
  function canRedirectHome() {
    try {
      const ss = window.sessionStorage;
      if (ss.getItem('il-variant-off') === '1') return false;
      const now = Date.now();
      const times = JSON.parse(ss.getItem('il-redir') || '[]').filter((t) => now - t < 20000);
      if (times.length >= 4) {
        ss.setItem('il-variant-off', '1');
        console.warn('[Instagram Limpo] O feed "A seguir" não ficou ativo; deixei de redirecionar nesta sessão.');
        return false;
      }
      times.push(now);
      ss.setItem('il-redir', JSON.stringify(times));
      return true;
    } catch (e) {
      return false; // sem armazenamento não arriscamos ciclos
    }
  }

  // Devolve true se a página vai ser redirecionada.
  function guardRoute() {
    const p = location.pathname;

    if (location.href !== state.lastHref) {
      const prevPath = state.lastPath;
      const prevHref = state.lastHref;
      state.lastPath = p;
      state.lastHref = location.href;
      if (prevPath && isDirect(prevPath) && isSingleReel(p)) {
        state.allowedReel = p;
        state.returnTo = prevHref;
      } else if (!isSingleReel(p)) {
        state.allowedReel = null;
      }
    }

    if (CONFIG.esconderReels && isReelsFeed(p)) {
      if (CONFIG.reelsNasMensagens && state.allowedReel === p) return false;
      go(state.allowedReel && state.returnTo ? state.returnTo : HOME_URL);
      return true;
    }
    if (CONFIG.esconderExplorar && !CONFIG.permitirPesquisa && isExploreGrid(p)) {
      go(HOME_URL);
      return true;
    }
    if (CONFIG.feedSoQuemSigo && isHome(p) && !new URLSearchParams(location.search).has('variant')) {
      if (canRedirectHome()) {
        go(HOME_URL);
        return true;
      }
    }
    return false;
  }

  // ---------------------------------------------------------------------------
  // Procurar textos exatos (ex.: "Patrocinado") sem apanhar frases das legendas
  // ---------------------------------------------------------------------------
  function findText(root, wanted, maxLen) {
    const out = [];
    if (!root) return out;
    const seen = new Set();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        const p = n.parentElement;
        if (!p || p.closest('script, style, noscript, [' + OWN + ']')) return NodeFilter.FILTER_REJECT;
        return n.data && n.data.length <= maxLen ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    let n;
    while ((n = walker.nextNode())) {
      let el = n.parentElement;
      if (wanted.has(norm(n.data))) {
        if (!seen.has(el)) { seen.add(el); out.push(el); }
        continue;
      }
      // Texto partido em vários elementos (ex.: "Patro" + "cinado").
      for (let i = 0; i < 2 && el.parentElement; i++) {
        el = el.parentElement;
        const t = el.textContent || '';
        if (t.length > maxLen) break;
        if (wanted.has(norm(t))) {
          if (!seen.has(el)) { seen.add(el); out.push(el); }
          break;
        }
      }
    }
    return out;
  }

  const rect = (el) => el.getBoundingClientRect();

  // Uma publicação no feed tem o botão "Seguir" no cabeçalho
  // quando é de uma conta que não segues (sugestão).
  function hasFollowInHeader(article) {
    const ar = rect(article);
    if (ar.height < 50) return false;
    for (const el of findText(article, TEXTO.seguir, 25)) {
      const r = rect(el);
      if (r.height > 0 && r.top - ar.top < 100) return true;
    }
    return false;
  }

  // Bloco de sugestões fora das publicações (ex.: carrossel de contas sugeridas).
  function sectionFor(el) {
    let node = el;
    while (node && node.parentElement && node.parentElement !== document.body) {
      const parent = node.parentElement;
      if (parent.tagName === 'MAIN') return okSection(node);
      if (parent.childElementCount >= 3 && rect(node).height >= 80) return okSection(node);
      node = parent;
    }
    return null;
  }
  function okSection(n) {
    if (!n || n === document.body || n === document.documentElement) return null;
    if (n.matches('main, nav') || n.querySelector('main, nav, article, input, textarea')) return null;
    const h = rect(n).height;
    if (h === 0 || h > window.innerHeight * 1.5) return null;
    return n;
  }

  function fingerprint(el) {
    const link = el.querySelector('a[href*="/p/"], a[href*="/reel/"], a[href*="/reels/"]');
    if (link) return link.getAttribute('href');
    return norm((el.textContent || '').slice(0, 60));
  }

  // ---------------------------------------------------------------------------
  // Regras
  // ---------------------------------------------------------------------------
  function collectSponsored(desired) {
    for (const el of findText(document.body, TEXTO.patrocinado, 40)) {
      const art = el.closest('article');
      if (art) desired.set(art, 'publicidade');
    }
  }

  function collectSuggestions(desired, path) {
    for (const el of findText(document.body, TEXTO.sugestoes, 60)) {
      const art = el.closest('article');
      if (art) {
        if (isHome(path)) desired.set(art, 'sugestoes');
        continue;
      }
      const sec = sectionFor(el);
      if (sec) desired.set(sec, 'sugestoes');
    }
    if (isHome(path)) {
      for (const art of document.querySelectorAll('article')) {
        if (art.hasAttribute(ATTR) || desired.has(art)) continue;
        if (hasFollowInHeader(art)) desired.set(art, 'sugestoes');
      }
    }
  }

  function collectFeedReels(desired) {
    for (const art of document.querySelectorAll('article')) {
      if (art.hasAttribute(ATTR) || desired.has(art)) continue;
      if (art.querySelector('a[href*="/reel/"], a[href*="/reels/"]')) desired.set(art, 'reels');
    }
  }

  function collectExploreGrid(desired) {
    const main = document.querySelector('main') || document.body;
    for (const a of main.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]')) {
      if (a.closest('[' + ATTR + ']')) continue;
      let node = a;
      while (
        node.parentElement &&
        node.parentElement !== main &&
        node.parentElement !== document.body &&
        !node.parentElement.querySelector('input, textarea, [role="search"], nav')
      ) {
        node = node.parentElement;
      }
      if (node !== main && node !== document.body) desired.set(node, 'explorar');
    }
  }

  // Na barra de navegação, esconde o espaço inteiro do botão (para não ficar um buraco).
  function hideNavLink(selector) {
    for (const a of document.querySelectorAll(selector)) {
      let node = a;
      while (
        node.parentElement &&
        node.parentElement !== document.body &&
        node.parentElement.querySelectorAll('a[href]').length === 1 &&
        rect(node.parentElement).height < 120
      ) {
        node = node.parentElement;
      }
      if (!node.hasAttribute(ATTR)) node.setAttribute(ATTR, 'nav');
    }
  }

  // Stories patrocinadas: tapa o anúncio e tira-lhe o som.
  // Toca no lado direito do ecrã para avançar, como numa story normal.
  const muted = new Set();
  function handleStoryAds() {
    const visible = findText(document.body, TEXTO.patrocinado, 40).some((el) => {
      const r = rect(el);
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
    });
    let overlay = document.getElementById('il-story-overlay');
    if (visible) {
      if (!overlay && document.body) {
        overlay = document.createElement('div');
        overlay.id = 'il-story-overlay';
        overlay.setAttribute(OWN, '');
        overlay.textContent = 'Publicidade escondida — toca à direita para avançar';
        document.body.appendChild(overlay);
      }
      for (const v of document.querySelectorAll('video')) {
        if (!v.muted) { v.muted = true; muted.add(v); }
      }
    } else {
      removeStoryOverlay();
    }
  }
  function removeStoryOverlay() {
    const overlay = document.getElementById('il-story-overlay');
    if (overlay) overlay.remove();
    for (const v of muted) v.muted = false;
    muted.clear();
  }

  // ---------------------------------------------------------------------------
  // Aviso "Filtro ativo" — também serve para confirmar que o filtro corre
  // no modo ecrã inteiro do iPhone.
  // ---------------------------------------------------------------------------
  function updateIndicator() {
    if (!CONFIG.mostrarIndicador || !document.body) return;
    let el = document.getElementById('il-indicator');
    if (Date.now() - state.startedAt > 6000) {
      if (el) el.remove();
      return;
    }
    if (!el) {
      el = document.createElement('div');
      el.id = 'il-indicator';
      el.setAttribute(OWN, '');
      document.body.appendChild(el);
      setTimeout(() => el.classList.add('il-fade'), 4500);
      setTimeout(() => el.remove(), 6000);
    }
    const partes = [];
    if (stats.publicidade) partes.push(stats.publicidade + ' anúncio' + (stats.publicidade > 1 ? 's' : ''));
    if (stats.reels) partes.push(stats.reels + ' reel' + (stats.reels > 1 ? 's' : ''));
    if (stats.sugestoes) partes.push(stats.sugestoes + ' sugest' + (stats.sugestoes > 1 ? 'ões' : 'ão'));
    const texto = '🧹 Filtro ativo' + (partes.length ? ' · escondidos: ' + partes.join(', ') : '');
    if (el.textContent !== texto) el.textContent = texto;
  }

  // ---------------------------------------------------------------------------
  // Varrimento principal
  // ---------------------------------------------------------------------------
  function scan() {
    if (state.navigating) return;
    if (guardRoute()) return;
    if (!document.body) return;

    const path = location.pathname;

    // Elementos já escondidos: se o Instagram reaproveitou o elemento para
    // outra publicação, volta a mostrar e reavalia.
    for (const el of document.querySelectorAll('[' + KEY + ']')) {
      if (el.getAttribute(KEY) !== fingerprint(el)) {
        el.removeAttribute(ATTR);
        el.removeAttribute(KEY);
      }
    }

    if (CONFIG.esconderReels) hideNavLink('a[href="/reels/"]');
    if (CONFIG.esconderExplorar && !CONFIG.permitirPesquisa) hideNavLink('a[href="/explore/"]');

    if (isStories(path)) {
      if (CONFIG.esconderPublicidade) handleStoryAds();
      updateIndicator();
      return;
    }
    removeStoryOverlay();

    // Nas mensagens não se esconde nada (os Reels enviados continuam visíveis).
    if (isDirect(path)) {
      updateIndicator();
      return;
    }

    const desired = new Map();
    if (CONFIG.esconderPublicidade) collectSponsored(desired);
    if (CONFIG.esconderSugestoes) collectSuggestions(desired, path);
    if (CONFIG.esconderReels && isHome(path)) collectFeedReels(desired);
    if (CONFIG.esconderExplorar && CONFIG.permitirPesquisa && isExploreGrid(path)) collectExploreGrid(desired);

    for (const [el, motivo] of desired) {
      if (el.hasAttribute(ATTR)) continue;
      el.setAttribute(ATTR, motivo);
      el.setAttribute(KEY, fingerprint(el));
      if (motivo in stats) stats[motivo]++;
    }

    updateIndicator();
  }

  // ---------------------------------------------------------------------------
  // Estilos (aplicados logo no arranque, antes de a página aparecer)
  // ---------------------------------------------------------------------------
  function injectCSS() {
    const root = document.documentElement;
    if (CONFIG.esconderReels) root.setAttribute('data-il-reels', '');
    if (CONFIG.esconderExplorar && !CONFIG.permitirPesquisa) root.setAttribute('data-il-noexplore', '');
    const style = document.createElement('style');
    style.setAttribute(OWN, '');
    style.textContent = [
      '[' + ATTR + ']{display:none!important}',
      'html[data-il-reels] a[href="/reels/"],',
      'html[data-il-reels] a[href$="/reels/"]{display:none!important}',
      'html[data-il-noexplore] a[href="/explore/"]{display:none!important}',
      '#il-indicator{position:fixed;left:50%;transform:translateX(-50%);',
      'top:calc(env(safe-area-inset-top, 0px) + 8px);z-index:2147483647;',
      'background:rgba(20,20,20,.88);color:#fff;font:600 13px/1.3 -apple-system,system-ui,sans-serif;',
      'padding:7px 12px;border-radius:999px;pointer-events:none;transition:opacity .8s;max-width:90vw;text-align:center}',
      '#il-indicator.il-fade{opacity:0}',
      '#il-story-overlay{position:fixed;inset:0;z-index:2147483646;background:#000;color:#bbb;',
      'display:flex;align-items:center;justify-content:center;text-align:center;padding:24px;',
      'font:500 15px/1.4 -apple-system,system-ui,sans-serif;pointer-events:none}',
    ].join('');
    (document.head || root).appendChild(style);
  }

  // ---------------------------------------------------------------------------
  // Arranque
  // ---------------------------------------------------------------------------
  // Redirecionar logo, antes de a página carregar (mais rápido).
  if (guardRoute()) return;

  // Muito cedo a página pode ainda não existir: espera pelo <html>.
  if (document.documentElement) {
    injectCSS();
  } else {
    const waitRoot = new MutationObserver(() => {
      if (document.documentElement) {
        waitRoot.disconnect();
        injectCSS();
      }
    });
    waitRoot.observe(document, { childList: true });
  }

  let scheduled = false;
  let last = 0;
  function schedule() {
    if (scheduled || state.navigating) return;
    scheduled = true;
    const wait = Math.max(0, 250 - (Date.now() - last));
    setTimeout(() => {
      scheduled = false;
      last = Date.now();
      try {
        scan();
      } catch (e) {
        console.warn('[Instagram Limpo]', e);
      }
    }, wait);
  }

  const observer = new MutationObserver((records) => {
    // Ignora as alterações feitas pelo próprio filtro (aviso e cortina das stories).
    const alheias = records.some((r) => {
      const t = r.target.nodeType === 1 ? r.target : r.target.parentElement;
      return !(t && t.closest('[' + OWN + ']'));
    });
    if (alheias) schedule();
  });
  observer.observe(document, { childList: true, subtree: true });

  window.addEventListener('popstate', schedule);
  setInterval(() => {
    if (location.href !== state.lastHref) schedule();
  }, 700);
  document.addEventListener('DOMContentLoaded', schedule);
  schedule();
})();
