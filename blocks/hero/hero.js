function getPrecedingHeading(block) {
  const wrapper = block.closest('.hero-wrapper') || block.parentElement;
  if (!wrapper) return null;
  const prev = wrapper.previousElementSibling;
  if (prev && prev.classList.contains('default-content-wrapper')) {
    return prev.querySelector('h1, h2');
  }
  return null;
}

function getInlineHeading(block) {
  // New authoring pattern: heading is authored into the first row of the block
  const firstRow = block.querySelector(':scope > div:first-child');
  if (!firstRow) return null;
  const firstCell = firstRow.querySelector(':scope > div');
  if (!firstCell) return null;
  if (firstCell.children.length !== 1) return null;
  return firstCell.querySelector('h1, h2');
}

function normalizeActionButton(block) {
  // After wrapNextAdventuresContent runs, paragraphs live inside the panel
  const panel = block.querySelector('.wknd-next-adventures-content');
  const searchRoot = panel || block.querySelector(':scope > div > div');
  if (!searchRoot) return;

  const actionParagraphs = [...searchRoot.querySelectorAll(':scope > p')]
    .filter((paragraph) => !paragraph.querySelector('picture'));

  const actionParagraph = actionParagraphs[actionParagraphs.length - 1];
  if (!actionParagraph) return;

  const label = actionParagraph.textContent.trim();
  if (label.toLowerCase() !== 'see trip') return;

  const existingLink = actionParagraph.querySelector('a');
  if (existingLink) {
    existingLink.classList.add('button', 'primary');
    existingLink.textContent = 'SEE TRIP';
    return;
  }

  actionParagraph.innerHTML = '';
  const cta = document.createElement('a');
  cta.href = '#';
  cta.className = 'button primary';
  cta.textContent = 'SEE TRIP';
  actionParagraph.append(cta);
}

function wrapNextAdventuresContent(block) {
  // When heading is inline (row 1), content is in row 2; otherwise row 1
  const rows = [...block.querySelectorAll(':scope > div')];
  const contentRow = rows.length >= 2 ? rows[1] : rows[0];
  const content = contentRow?.querySelector(':scope > div');
  if (!content) return;

  if (content.querySelector(':scope > .wknd-next-adventures-content')) return;

  const imageParagraph = [...content.querySelectorAll(':scope > p')]
    .find((paragraph) => paragraph.querySelector('picture'));

  if (!imageParagraph) return;

  const panel = document.createElement('div');
  panel.className = 'wknd-next-adventures-content';

  [...content.children].forEach((child) => {
    if (child !== imageParagraph) {
      panel.append(child);
    }
  });

  content.append(panel);
}

function wrapAdventuresContent(block) {
  // Row 1 is the heading row; content (image + h2 + p) is always in the last row
  const rows = [...block.querySelectorAll(':scope > div')];
  const contentRow = rows.length >= 2 ? rows[rows.length - 1] : rows[0];
  const content = contentRow?.querySelector(':scope > div');
  if (!content) return;
  if (content.querySelector(':scope > .wknd-adventures-content')) return;

  const imageParagraph = [...content.querySelectorAll(':scope > p')]
    .find((p) => p.querySelector('picture'));
  if (!imageParagraph) return;

  const panel = document.createElement('div');
  panel.className = 'wknd-adventures-content';

  [...content.children].forEach((child) => {
    if (child !== imageParagraph) {
      panel.append(child);
    }
  });

  content.append(panel);
}

export default function decorate(block) {
  // Prefer inline heading (new authoring: heading inside block row 1)
  const heading = getInlineHeading(block) || getPrecedingHeading(block);
  const isNextAdventures = heading?.id === 'next-adventures';
  const isAdventures = heading?.id === 'adventures';

  if (isNextAdventures) {
    block.classList.add('wknd-next-adventures-hero');
    heading.classList.add('wknd-section-heading', 'wknd-next-adventures-heading');
    wrapNextAdventuresContent(block);
    normalizeActionButton(block);
  } else if (isAdventures) {
    block.classList.add('wknd-adventures-hero');
    heading.classList.add('wknd-section-heading');
    wrapAdventuresContent(block);
  }
}
