/**
 * WkndAccordion
 *
 * Authored structure — each row has 2 columns:
 *   Col 1: <h3><strong>Question text</strong></h3>
 *   Col 2: Answer text / paragraphs
 *
 * Produces:
 *   .accordion.wknd-accordion
 *     .accordion-item  (one per row)
 *       button.accordion-trigger
 *         span.accordion-question
 *         span.accordion-icon  (+ or −)
 *       div.accordion-panel
 *         (answer content)
 */
class WkndAccordion {
  constructor(block) {
    this.block = block;
    this.items = [];
  }

  /**
   * Build a single accordion item from a source row.
   * @param {Element} row   - original authored row div
   * @param {boolean} open  - whether this item starts open
   * @returns {Element}
   */
  buildItem(row, open) {
    const cols = [...row.children];
    const questionCol = cols[0];
    const answerCol = cols[1];

    // Extract question text from h3 > strong (or fallback to any text)
    const heading = questionCol.querySelector('h1, h2, h3, h4, h5, h6');
    const questionText = heading ? heading.textContent.trim() : questionCol.textContent.trim();

    // ── Item wrapper ────────────────────────────────────────
    const item = document.createElement('div');
    item.className = 'accordion-item';
    if (open) item.classList.add('accordion-item--open');

    // ── Trigger button ───────────────────────────────────────
    const trigger = document.createElement('button');
    trigger.className = 'accordion-trigger';
    trigger.setAttribute('type', 'button');
    trigger.setAttribute('aria-expanded', open);

    const questionSpan = document.createElement('span');
    questionSpan.className = 'accordion-question';
    questionSpan.textContent = questionText;

    const iconSpan = document.createElement('span');
    iconSpan.className = 'accordion-icon';
    iconSpan.setAttribute('aria-hidden', 'true');
    iconSpan.textContent = open ? '\u2212' : '+';

    trigger.append(questionSpan, iconSpan);

    // ── Panel ────────────────────────────────────────────────
    const panel = document.createElement('div');
    panel.className = 'accordion-panel';
    panel.setAttribute('role', 'region');
    panel.hidden = !open;

    // Move all answer children into the panel
    if (answerCol) {
      // unwrap bare text nodes into a <p> if needed
      [...answerCol.childNodes].forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
          const p = document.createElement('p');
          p.textContent = node.textContent.trim();
          panel.append(p);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // skip empty h3 placeholders sometimes left by the CMS
          if (node.tagName.match(/^H[1-6]$/) && !node.textContent.trim()) return;
          panel.append(node.cloneNode(true));
        }
      });
    }

    // ── Click handler ────────────────────────────────────────
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('accordion-item--open');

      // Close all items first
      this.items.forEach((it) => {
        it.classList.remove('accordion-item--open');
        it.querySelector('.accordion-trigger').setAttribute('aria-expanded', false);
        it.querySelector('.accordion-icon').textContent = '+';
        it.querySelector('.accordion-panel').hidden = true;
      });

      // If this item was closed, open it
      if (!isOpen) {
        item.classList.add('accordion-item--open');
        trigger.setAttribute('aria-expanded', true);
        iconSpan.textContent = '\u2212';
        panel.hidden = false;
      }
    });

    item.append(trigger, panel);
    return item;
  }

  /**
   * Run all decoration steps.
   */
  decorate() {
    this.block.classList.add('wknd-accordion');

    const rows = [...this.block.children];
    const fragment = document.createDocumentFragment();

    rows.forEach((row) => {
      const item = this.buildItem(row, false);
      this.items.push(item);
      fragment.append(item);
    });

    this.block.replaceChildren(fragment);
  }
}

/**
 * Loads and decorates the accordion block.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const accordion = new WkndAccordion(block);
  accordion.decorate();
}
