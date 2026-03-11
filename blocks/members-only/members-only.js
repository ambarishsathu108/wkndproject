/**
 * loads and decorates the members-only block
 * Handles both single-row (heading + content in same cell) and
 * two-row (heading row / content row) authored structures.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // Get the innermost content cell regardless of row structure
  const cell = block.querySelector(':scope > div > div');
  if (!cell) return;

  // 1. Wrap heading
  const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    const headingWrapper = document.createElement('div');
    headingWrapper.classList.add('members-only-heading');
    cell.insertBefore(headingWrapper, heading);
    headingWrapper.append(heading);
  }

  // 2. Unwrap ul > li into a plain paragraph
  const ul = cell.querySelector('ul');
  if (ul) {
    const li = ul.querySelector('li');
    if (li) {
      const p = document.createElement('p');
      p.innerHTML = li.innerHTML;
      ul.replaceWith(p);
    }
  }

  // 3. Wrap all remaining (non-heading) nodes in a content div
  const contentNodes = [...cell.childNodes].filter(
    (n) => !n.classList?.contains('members-only-heading'),
  );
  if (contentNodes.length) {
    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('members-only-content');
    contentNodes.forEach((n) => contentWrapper.append(n));
    cell.append(contentWrapper);
  }

  // 4. Flatten — hoist the two wrapper divs directly into the block
  block.replaceChildren(...cell.childNodes);
}
