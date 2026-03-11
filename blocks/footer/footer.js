import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  block.classList.add('wknd-footer');

  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // The fragment delivers: div.section > div.default-content-wrapper > content
  const inner = footer.querySelector('.default-content-wrapper') || footer.querySelector(':scope > div') || footer;

  // 1. Logo — first <p> containing a <picture>
  const logoP = inner.querySelector(':scope > p:first-child');
  if (logoP && logoP.querySelector('picture')) {
    logoP.classList.add('footer-logo');
  }

  // 2. Split <ul> into nav links and social icons
  const ul = inner.querySelector(':scope > ul');
  if (ul) {
    const navList = document.createElement('ul');
    navList.classList.add('footer-nav-list');

    const socialWrapper = document.createElement('div');
    socialWrapper.classList.add('footer-social');

    const socialIcons = document.createElement('div');
    socialIcons.classList.add('footer-social-icons');

    let inSocial = false;
    [...ul.children].forEach((li) => {
      const text = li.textContent.trim().toUpperCase();
      if (text === 'FOLLOW US') {
        inSocial = true;
        const label = document.createElement('span');
        label.classList.add('footer-follow-label');
        label.textContent = 'FOLLOW US';
        socialWrapper.append(label);
        return;
      }
      if (li.querySelector('picture')) {
        inSocial = true;
        li.classList.add('footer-social-icon');
        socialIcons.append(li);
        return;
      }
      if (!inSocial) navList.append(li);
    });

    socialWrapper.append(socialIcons);

    const nav = document.createElement('nav');
    nav.classList.add('footer-nav');
    nav.append(navList);

    ul.replaceWith(nav, socialWrapper);
  }

  // 3. Wrap logo + nav + social into top bar
  const logoEl = inner.querySelector('.footer-logo');
  const navEl = inner.querySelector('.footer-nav');
  const socialEl = inner.querySelector('.footer-social');
  if (logoEl && navEl && socialEl) {
    const topBar = document.createElement('div');
    topBar.classList.add('footer-top');
    topBar.append(logoEl, navEl, socialEl);
    inner.prepend(topBar);
  }

  // 4. Wrap remaining <p>s into body; last <p> = legal links
  const bodyPs = [...inner.querySelectorAll(':scope > p')];
  if (bodyPs.length) {
    const bodyWrapper = document.createElement('div');
    bodyWrapper.classList.add('footer-body');
    bodyPs.forEach((p, i) => {
      if (i === bodyPs.length - 1) p.classList.add('footer-legal');
      bodyWrapper.append(p);
    });
    inner.append(bodyWrapper);
  }

  block.append(footer);
}
