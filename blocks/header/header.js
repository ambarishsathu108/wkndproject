import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    }
    // Mobile: do NOT close on focus loss — only close via overlay click or nav link
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.classList.contains('nav-drop');
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  const menuOpen = nav.getAttribute('aria-expanded') === 'true' && !isDesktop.matches;
  document.body.classList.toggle('wknd-mobile-nav-open', menuOpen);
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  if (navSections) {
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener('focus', focusNavSection);
      });
    }
  }

  // Escape key closes desktop dropdowns and mobile menu
  if (!expanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }

  // Show or hide the mobile overlay
  const overlay = document.querySelector('.wknd-nav-overlay');
  if (overlay) {
    overlay.classList.toggle('wknd-nav-overlay--active', !expanded && !isDesktop.matches);
  }
}

/**
 * WkndHeader — decorates the WKND site header with scoped JS classes
 * so that all styling is fully independent of global styles.
 */
class WkndHeader {
  constructor(block) {
    this.block = block;
    this.nav = null;
    this.navSections = null;
  }

  /** Load the nav fragment and build the base nav element */
  async buildNav() {
    const navMeta = getMetadata('nav');
    const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
    const fragment = await loadFragment(navPath);

    this.block.textContent = '';
    this.nav = document.createElement('nav');
    this.nav.id = 'nav';
    this.nav.classList.add('wknd-nav');
    while (fragment.firstElementChild) this.nav.append(fragment.firstElementChild);

    const classes = ['brand', 'sections', 'tools'];
    classes.forEach((c, i) => {
      const section = this.nav.children[i];
      if (section) section.classList.add(`nav-${c}`);
    });
  }

  /** Strip global .button class from brand, add wknd-brand-link */
  decorateBrand() {
    const navBrand = this.nav.querySelector('.nav-brand');
    if (!navBrand) return;

    const brandLink = navBrand.querySelector('.button');
    if (brandLink) {
      brandLink.className = 'wknd-brand-link';
      const container = brandLink.closest('.button-container');
      if (container) container.className = 'wknd-brand-container';
    }

    navBrand.querySelectorAll('a').forEach((a) => {
      a.classList.add('wknd-brand-link');
    });
  }

  /** Decorate each nav item: add scoped classes, detect active page, attach handlers */
  decorateNavItems() {
    this.navSections = this.nav.querySelector('.nav-sections');
    if (!this.navSections) return;

    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';

    // Class the list itself for scoped styling
    const navList = this.navSections.querySelector('.default-content-wrapper > ul');
    if (navList) navList.classList.add('wknd-nav-list');

    this.navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navItem) => {
      navItem.classList.add('wknd-nav-item');
      if (navItem.querySelector('ul')) navItem.classList.add('nav-drop');

      // Add wknd-nav-link class to the immediate child link
      const link = navItem.querySelector(':scope > a');
      if (link) {
        link.classList.add('wknd-nav-link');

        // Active-page detection: compare link pathname to current page
        const linkPath = new URL(link.href, window.location).pathname.replace(/\/$/, '') || '/';
        if (currentPath === linkPath || (linkPath !== '/' && currentPath.startsWith(`${linkPath}/`))) {
          navItem.classList.add('wknd-nav-active');
          link.classList.add('wknd-nav-link-active');
        }

        // On mobile close the menu when a nav link is tapped
        link.addEventListener('click', () => {
          if (!isDesktop.matches) {
            toggleMenu(this.nav, this.navSections, false);
          }
        });
      }

      // Desktop dropdown toggle
      navItem.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navItem.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(this.navSections);
          navItem.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  /** Building the search box in nav bar with query-index search */
  buildSearchTool() {
    const navTools = this.nav.querySelector('.nav-tools');
    if (!navTools || navTools.textContent.trim()) return;

    navTools.innerHTML = '';
    const searchBox = document.createElement('div');
    searchBox.classList.add('wknd-search-box');
    searchBox.setAttribute('role', 'search');
    const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21"
          x2="16.65" y2="16.65"/></svg>`;
    searchBox.innerHTML = `
      <span class="wknd-search-icon" aria-hidden="true">${svgIcon}</span>
      <input type="search" class="wknd-search-input" placeholder="SEARCH" aria-label="Search" autocomplete="off">
      <ul class="wknd-search-results" role="listbox" aria-label="Search results" hidden></ul>`;
    navTools.append(searchBox);

    const input = searchBox.querySelector('.wknd-search-input');
    const results = searchBox.querySelector('.wknd-search-results');
    let index = null;

    async function loadIndex() {
      if (index) return;
      try {
        const resp = await fetch('/query-index.json');
        const json = await resp.json();
        // Normalise keys — the published index has a trailing space on "path "
        index = (json.data || []).map((item) => {
          const entry = {};
          Object.keys(item).forEach((k) => { entry[k.trim()] = item[k]; });
          return entry;
        });
      } catch (e) {
        index = [];
      }
    }

    function renderResults(q) {
      const query = q.trim().toLowerCase();
      results.innerHTML = '';
      if (!query) { results.hidden = true; return; }
      const hits = (index || []).filter(({ title = '', description = '', tags = '' }) => (
        `${title} ${description} ${tags}`.toLowerCase().includes(query)
      )).slice(0, 8);
      if (!hits.length) {
        results.innerHTML = '<li class="wknd-search-no-results">No results found</li>';
      } else {
        results.innerHTML = hits.map(({ path, title }) => {
          const label = (title || path).split(' ').slice(0, 7).join(' ');
          return `<li class="wknd-search-result" role="option">
            <a href="${path}" class="wknd-search-result-link">
              <span class="wknd-search-result-title">${label}</span>
              <span class="wknd-search-result-path">${path}</span>
            </a>
          </li>`;
        }).join('');
      }
      results.hidden = false;
    }

    function clearResults() {
      results.hidden = true;
      results.innerHTML = '';
    }

    input.addEventListener('focus', () => { loadIndex(); });

    input.addEventListener('input', async () => {
      await loadIndex();
      renderResults(input.value);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { clearResults(); input.value = ''; input.blur(); }
      if (e.key === 'Enter') {
        const first = results.querySelector('.wknd-search-result-link');
        if (first) window.location = first.getAttribute('href');
      }
    });

    // Hide results when clicking outside the search box
    document.addEventListener('click', (e) => {
      if (!searchBox.contains(e.target)) clearResults();
    });
  }

  /** Build transparent overlay — clicking it closes the mobile menu */
  buildOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'wknd-nav-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.addEventListener('click', () => {
      toggleMenu(this.nav, this.navSections, false);
    });
    document.body.append(overlay);
  }

  /** Build hamburger toggle for mobile */
  buildHamburger() {
    const hamburger = document.createElement('div');
    hamburger.classList.add('nav-hamburger');
    hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
        <span class="nav-hamburger-icon"></span>
      </button>`;
    hamburger.addEventListener('click', () => toggleMenu(this.nav, this.navSections));
    this.nav.prepend(hamburger);
  }

  /** Scroll listener: toggle compact class on header */
  setupScroll() {
    const header = this.block.closest('header');
    if (!header) return;

    const scrollThreshold = 50;
    const onScroll = () => {
      if (window.scrollY > scrollThreshold) {
        header.classList.add('wknd-header-scrolled');
      } else {
        header.classList.remove('wknd-header-scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /** Main entry: assemble and decorate the full header */
  async decorate() {
    this.block.classList.add('wknd-header-block');
    await this.buildNav();
    this.decorateBrand();
    this.decorateNavItems();
    this.buildSearchTool();
    this.buildHamburger();
    this.buildOverlay();

    // Initialize nav state
    this.nav.setAttribute('aria-expanded', 'false');
    toggleMenu(this.nav, this.navSections, isDesktop.matches);
    isDesktop.addEventListener('change', () => {
      toggleMenu(this.nav, this.navSections, isDesktop.matches);
    });

    // Wrap nav and append to block
    const navWrapper = document.createElement('div');
    navWrapper.className = 'nav-wrapper wknd-nav-wrapper';
    navWrapper.append(this.nav);
    this.block.append(navWrapper);

    this.setupScroll();
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const header = new WkndHeader(block);
  await header.decorate();
}
