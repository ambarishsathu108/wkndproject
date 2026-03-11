import { createOptimizedPicture } from '../../scripts/aem.js';

function isMagazineFeaturedBlock(block) {
  const rows = [...block.children];
  // New structure: row 1 = heading only, row 2 = image + content
  if (rows.length < 2) return false;
  const cardRow = rows[rows.length - 1];
  const cols = [...cardRow.children];
  if (cols.length !== 2) return false;
  const hasImage = cols.some((col) => col.querySelector('picture'));
  const hasFeaturedLabel = cols.some((col) => /featured article/i.test(col.textContent));
  return hasImage && hasFeaturedLabel;
}

function decorateMagazineFeatured(block) {
  block.classList.add('wknd-cards-magazine');

  // Tag the heading row — strip the wrapping cards-card-body div, hoist h1/h2 directly into li
  const rows = [...block.querySelectorAll(':scope > ul > li')];
  rows.forEach((li) => {
    const bodyDiv = li.querySelector('.cards-card-body');
    if (!bodyDiv) return;
    const heading = bodyDiv.querySelector('h1, h2, h3');
    // Heading-only row: has a heading but no image column
    if (heading && !li.querySelector('.cards-card-image')) {
      li.classList.add('cards-magazine-heading-row');
      heading.classList.add('cards-magazine-heading');
      // Hoist heading directly into li, remove the wrapper div
      li.prepend(heading);
      bodyDiv.remove();
    } else {
      // This is the card row (image + content)
      li.classList.add('cards-magazine-card-row');
    }
  });

  // Tag the Featured Article label
  block.querySelectorAll('.cards-card-body > p').forEach((p) => {
    if (/featured article/i.test(p.textContent)) p.classList.add('cards-magazine-label');
  });

  // Convert plain "Read More" paragraph into a primary button
  block.querySelectorAll('.cards-card-body p').forEach((p) => {
    if (p.textContent.trim().toLowerCase() !== 'read more') return;
    const existingLink = p.querySelector('a');
    if (existingLink) {
      existingLink.classList.add('button', 'primary');
      existingLink.textContent = 'READ MORE';
    } else {
      p.innerHTML = '<a href="#" class="button primary">READ MORE</a>';
    }
    p.classList.add('cards-magazine-cta');
  });
}

export default function decorate(block) {
  block.classList.add('wknd-cards');

  // Detect magazine block BEFORE ul/li transform (structure changes after)
  const isMag = isMagazineFeaturedBlock(block);

  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);

  // Apply magazine decoration AFTER ul/li transform so selectors target .cards-card-body
  if (isMag) decorateMagazineFeatured(block);
}
