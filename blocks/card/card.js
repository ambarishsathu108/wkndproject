import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * WkndFaqCard
 *
 * Authored structure (3 rows):
 *   Row 1 — heading only  : h1/h2/h3 for the section title (e.g. "FAQs")
 *   Row 2 — two columns   : [picture]  |  [h3 + paragraph(s)]
 *   Row 3 — one column    : full-width body text paragraph
 *
 * Produces:
 *   .card-heading-wrapper  (inserted before the block)
 *   .card.wknd-faq-card
 *     .card-main-row
 *       .card-image
 *       .card-content
 *     .card-body-text  (optional, only when row 3 exists)
 */
class WkndFaqCard {
  constructor(block) {
    this.block = block;
  }

  /**
   * Extract the heading row from the block, tag it, and place it
   * immediately before the block element in the DOM.
   */
  extractHeading() {
    const rows = [...this.block.children];
    const headingRow = rows.find((row) => {
      const heading = row.querySelector('h1, h2, h3, h4, h5, h6');
      const hasPicture = row.querySelector('picture');
      return heading && !hasPicture;
    });

    if (!headingRow) return;

    const heading = headingRow.querySelector('h1, h2, h3, h4, h5, h6');
    heading.classList.add('wknd-section-heading');

    const wrapper = document.createElement('div');
    wrapper.className = 'card-heading-wrapper';
    wrapper.append(heading);

    this.block.insertAdjacentElement('beforebegin', wrapper);
    headingRow.remove();
  }

  /**
   * Optimise every <img> inside the block.
   */
  optimiseImages() {
    this.block.querySelectorAll('picture > img').forEach((img) => {
      img.closest('picture').replaceWith(
        createOptimizedPicture(img.src, img.alt, false, [{ width: '900' }]),
      );
    });
  }

  /**
   * Restructure block children into:
   *   .card-main-row  (.card-image + .card-content)
   *   .card-body-text (if a third row exists)
   */
  buildLayout() {
    const rows = [...this.block.children];

    // Row with 2 columns → main card row
    const mainRow = rows.find((row) => row.children.length === 2);
    // Row with 1 column (and no picture) → body text
    const textRow = rows.find((row) => row.children.length === 1 && !row.querySelector('picture'));

    if (mainRow) {
      const [imageCol, contentCol] = [...mainRow.children];

      mainRow.className = 'card-main-row';
      imageCol.className = 'card-image';
      contentCol.className = 'card-content';
    }

    if (textRow) {
      textRow.className = 'card-body-text';
    }
  }

  /**
   * Run all decoration steps.
   */
  decorate() {
    this.block.classList.add('wknd-faq-card');
    this.extractHeading();
    this.optimiseImages();
    this.buildLayout();
  }
}

/**
 * Loads and decorates the card block.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const card = new WkndFaqCard(block);
  card.decorate();
}
