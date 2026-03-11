// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';

/**
 * WkndAdventuresTabs
 * Handles heading extraction, tab navigation, and card grid layout
 * for the Adventures tab section.
 */
class WkndAdventuresTabs {
  constructor(block) {
    this.block = block;
    this.tablist = null;
  }

  /**
   * Pull the authored heading (first row of the block) out of the block
   * and inject it immediately before the block as a styled heading wrapper.
   */
  extractHeading() {
    const firstRow = this.block.firstElementChild;
    if (!firstRow) return;

    const heading = firstRow.querySelector('h1, h2, h3, h4, h5, h6');
    if (!heading) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'tabs-heading-wrapper';
    heading.classList.add('wknd-section-heading');
    wrapper.append(heading);

    // Place heading wrapper directly before the block element
    this.block.insertAdjacentElement('beforebegin', wrapper);
    firstRow.remove();
  }

  /**
   * Build a single card element from a picture paragraph and optional
   * sibling description paragraph.
   *
   * @param {HTMLParagraphElement} picPara  - <p> containing the <picture> + title
   * @param {HTMLParagraphElement|null} descPara - <p> with plain description text
   * @returns {HTMLDivElement} the assembled card
   */
  buildCard(picPara, descPara) {
    const card = document.createElement('div');
    card.className = 'tabs-card';

    // ── Image ──────────────────────────────────────────────────
    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'tabs-card-image';
    imgWrapper.append(picPara.querySelector('picture'));
    card.append(imgWrapper);

    // ── Title ─────────────────────────────────────────────────
    const titleNode = picPara.querySelector('strong')
      || picPara.querySelector('a.button')
      || picPara.querySelector('a[href]');
    const titleText = titleNode ? titleNode.textContent.trim() : '';

    if (titleText) {
      const titleEl = document.createElement('p');
      titleEl.className = 'tabs-card-title';
      titleEl.textContent = titleText;
      card.append(titleEl);
    }

    // ── Description ───────────────────────────────────────────
    if (descPara) {
      const descEl = document.createElement('p');
      descEl.className = 'tabs-card-desc';
      descEl.textContent = descPara.textContent.trim();
      card.append(descEl);
    }

    return card;
  }

  /**
   * Transform all image+title+description paragraph groups inside a tab panel
   * into a responsive card grid.
   *
   * @param {HTMLElement} panel - a .tabs-panel element
   */
  buildTabCards(panel) {
    // The right-hand cell holds all the card content
    const content = panel.querySelector(':scope > div:last-child') || panel;
    const paragraphs = [...content.querySelectorAll(':scope > p')];
    const cards = [];
    let i = 0;

    while (i < paragraphs.length) {
      const p = paragraphs[i];

      if (p.querySelector('picture')) {
        const next = paragraphs[i + 1];
        const hasDesc = next && !next.querySelector('picture');
        cards.push(this.buildCard(p, hasDesc ? next : null));
        if (hasDesc) i += 1; // consume description paragraph
      }

      i += 1;
    }

    const grid = document.createElement('div');
    grid.className = 'tabs-cards-grid';
    cards.forEach((card) => grid.append(card));

    content.innerHTML = '';
    content.append(grid);
  }

  /**
   * Build the horizontal tab button list and wire up click handlers.
   * Assumes the heading row has already been extracted from the block.
   */
  buildTabList() {
    this.tablist = document.createElement('div');
    this.tablist.className = 'tabs-list';
    this.tablist.setAttribute('role', 'tablist');

    const rows = [...this.block.children];

    rows.forEach((row, i) => {
      const labelCell = row.firstElementChild;
      const id = toClassName(labelCell.textContent.trim());

      // ── Decorate panel ──────────────────────────────────────
      row.className = 'tabs-panel';
      row.id = `tabpanel-${id}`;
      row.setAttribute('aria-hidden', i !== 0);
      row.setAttribute('aria-labelledby', `tab-${id}`);
      row.setAttribute('role', 'tabpanel');

      // ── Build tab button ────────────────────────────────────
      const button = document.createElement('button');
      button.className = 'tabs-tab';
      button.id = `tab-${id}`;
      button.textContent = labelCell.textContent.trim();
      button.setAttribute('aria-controls', `tabpanel-${id}`);
      button.setAttribute('aria-selected', i === 0);
      button.setAttribute('role', 'tab');
      button.setAttribute('type', 'button');

      button.addEventListener('click', () => {
        // Deactivate all panels and buttons
        this.block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
          panel.setAttribute('aria-hidden', true);
        });
        this.tablist.querySelectorAll('.tabs-tab').forEach((btn) => {
          btn.setAttribute('aria-selected', false);
        });

        // Activate the selected tab and panel
        row.setAttribute('aria-hidden', false);
        button.setAttribute('aria-selected', true);
      });

      this.tablist.append(button);

      // Remove the label cell — the content cell stays as the panel body
      labelCell.remove();
    });

    this.block.prepend(this.tablist);
  }

  /**
   * Main entry — run all decoration steps in order.
   */
  decorate() {
    this.block.classList.add('wknd-adventures-tabs');
    this.extractHeading();
    this.buildTabList();
    this.block.querySelectorAll('.tabs-panel').forEach((panel) => {
      this.buildTabCards(panel);
    });
  }
}

/**
 * Loads and decorates the tabs block.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const tabsBlock = new WkndAdventuresTabs(block);
  tabsBlock.decorate();
}
