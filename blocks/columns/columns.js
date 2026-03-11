function tagPrecedingHeading(block, className) {
  const wrapper = block.closest('.columns-wrapper');
  if (!wrapper) return;
  const prev = wrapper.previousElementSibling;
  if (prev && prev.classList.contains('default-content-wrapper')) {
    const heading = prev.querySelector('h1, h2, h3, h4');
    if (heading) heading.classList.add(className);
  }
}

function decorateCtaButton(block) {
  const wrapper = block.closest('.columns-wrapper');
  if (!wrapper) return;
  const next = wrapper.nextElementSibling;
  if (!next || !next.classList.contains('default-content-wrapper')) return;

  const li = next.querySelector('ul > li');
  if (!li) return;

  const label = li.textContent.trim();
  const btn = document.createElement('a');
  btn.href = '#';
  btn.className = 'button primary wknd-columns-cta';
  btn.textContent = label;

  const p = document.createElement('p');
  p.className = 'button-wrapper wknd-columns-cta-wrapper';
  p.append(btn);

  li.closest('ul').replaceWith(p);
}

function isFeaturedArticleBlock(block) {
  if (block.classList.contains('featured-article')) return true;

  const firstRow = block.querySelector(':scope > div');
  if (!firstRow) return false;

  const columns = [...firstRow.children];
  if (columns.length !== 2) return false;

  const imageColumn = columns.find((column) => column.querySelector('picture, img'));
  const contentColumn = columns.find((column) => !column.querySelector('picture, img'));
  if (!imageColumn || !contentColumn) return false;

  const hasHeading = !!contentColumn.querySelector('h1, h2, h3, h4, h5, h6');
  const hasFeaturedLabel = /featured article/i.test(contentColumn.textContent || '');
  return hasHeading && hasFeaturedLabel;
}

function isRecentArticlesBlock(block) {
  if (block.classList.contains('columns-recent-articles')) return true;

  // Any row with 3+ columns where each column has h3 containing picture + link
  return [...block.querySelectorAll(':scope > div')].some((row) => {
    const cols = [...row.children];
    return cols.length >= 3 && cols.every((col) => {
      const h3 = col.querySelector(':scope > h3');
      return h3 && h3.querySelector('picture') && h3.querySelector('a');
    });
  });
}

function decorateFeaturedArticle(block) {
  if (!isFeaturedArticleBlock(block)) return;
  block.classList.add('featured-article');

  block.querySelectorAll(':scope > div > div:not(.columns-img-col)').forEach((contentCol) => {
    contentCol.querySelectorAll(':scope > p').forEach((p) => {
      const link = p.querySelector(':scope > a[href]');
      if (link && p.textContent.trim() === link.textContent.trim()) {
        p.classList.add('button-wrapper');
        link.classList.add('button', 'primary');
      }
    });

    const paragraphs = [...contentCol.querySelectorAll(':scope > p')];
    const ctaParagraph = paragraphs.reverse().find((p) => {
      const text = p.textContent.trim();
      return text && !p.querySelector('a, picture') && /^[A-Z\s]+$/.test(text);
    });

    if (ctaParagraph) {
      ctaParagraph.classList.add('columns-featured-cta');
    }
  });
}

function isWhereToGoBlock(block) {
  if (block.classList.contains('columns-where-to-go')) return true;

  // Check any row for 3+ columns where each has p > picture + link
  return [...block.querySelectorAll(':scope > div')].some((row) => {
    const cols = [...row.children];
    return cols.length >= 3 && cols.every((col) => {
      const p = col.querySelector(':scope > p');
      return p && p.querySelector('picture') && p.querySelector('a');
    });
  });
}

function decorateWhereToGo(block) {
  if (!isWhereToGoBlock(block)) return;
  block.classList.add('columns-where-to-go');

  [...block.querySelectorAll(':scope > div')].forEach((row) => {
    const cols = [...row.children];

    // Heading row: single column with heading, no images
    if (cols.length === 1 && cols[0].querySelector('h1, h2, h3, h4') && !cols[0].querySelector('picture')) {
      row.classList.add('columns-where-heading-row');
      const heading = cols[0].querySelector('h1, h2, h3, h4');
      if (heading) heading.classList.add('columns-where-heading');
      return;
    }

    // CTA row: single column with list item
    if (cols.length === 1 && cols[0].querySelector('ul > li')) {
      row.classList.add('columns-where-cta-row');
      const li = cols[0].querySelector('ul > li');
      const label = li.textContent.trim();
      const btn = document.createElement('a');
      btn.href = '#';
      btn.className = 'button primary wknd-columns-cta';
      btn.textContent = label;
      const p = document.createElement('p');
      p.className = 'button-wrapper wknd-columns-cta-wrapper';
      p.append(btn);
      li.closest('ul').replaceWith(p);
      return;
    }

    // Card row: 3+ columns each with p containing picture + link
    if (cols.length >= 3) {
      row.classList.add('columns-where-cards-row');
      cols.forEach((col) => {
        const p = col.querySelector(':scope > p');
        if (!p) return;

        const picture = p.querySelector('picture');
        const link = p.querySelector('a');

        if (picture) {
          const imgWrapper = document.createElement('div');
          imgWrapper.classList.add('columns-card-image');
          imgWrapper.append(picture);
          col.prepend(imgWrapper);
        }

        if (link) {
          const titleEl = document.createElement('h3');
          titleEl.classList.add('columns-card-title');
          link.classList.add('columns-card-link');
          titleEl.append(link);
          p.replaceWith(titleEl);
        }

        const h4 = col.querySelector(':scope > h4');
        if (h4) h4.classList.add('columns-card-description');
      });
    }
  });
}

function isAllArticlesBlock(block) {
  if (block.classList.contains('columns-all-articles')) return true;

  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return false;

  // Card row can be ANY row (first row may be a heading row)
  // Each column has <p> with picture but NO link inside that same <p>
  // (distinguishes from isWhereToGoBlock where picture + link share the same <p>)
  return rows.some((row) => {
    const cols = [...row.children];
    return cols.length >= 3 && cols.every((col) => {
      const firstP = col.querySelector(':scope > p');
      return firstP && firstP.querySelector('picture') && !firstP.querySelector('a');
    });
  });
}

function decorateAllArticles(block) {
  if (!isAllArticlesBlock(block)) return;
  block.classList.add('columns-all-articles');

  // Also tag any preceding external heading for backward-compat
  tagPrecedingHeading(block, 'wknd-section-heading wknd-all-articles-heading');

  const rows = [...block.querySelectorAll(':scope > div')];
  rows.forEach((row) => {
    const cols = [...row.children];

    // Heading row: single column with a heading element, no images
    if (cols.length === 1 && cols[0].querySelector('h1, h2, h3, h4') && !cols[0].querySelector('picture')) {
      row.classList.add('columns-all-articles-heading-row');
      const heading = cols[0].querySelector('h1, h2, h3, h4');
      if (heading) heading.classList.add('columns-all-articles-heading');
      return;
    }

    // Card row: 3+ columns each with a picture
    if (cols.length >= 3 && cols.some((col) => col.querySelector('picture'))) {
      row.classList.add('columns-all-articles-cards-row');
      cols.forEach((col) => {
        // Move picture out of its <p> into a dedicated image wrapper
        const imgP = col.querySelector(':scope > p:first-child');
        if (imgP) {
          const picture = imgP.querySelector('picture');
          if (picture) {
            const imgWrapper = document.createElement('div');
            imgWrapper.classList.add('columns-card-image');
            imgWrapper.append(picture);
            col.prepend(imgWrapper);
            imgP.remove();
          }
        }

        // Tag the title — handle <h2>, <h3>, or <p><strong> (with or without <a>)
        const heading = col.querySelector(':scope > h2, :scope > h3');
        if (heading) {
          heading.classList.add('columns-article-title');
        } else {
          const strongEl = col.querySelector(':scope > p > strong');
          if (strongEl) {
            const titleEl = document.createElement('h3');
            titleEl.classList.add('columns-article-title');
            const link = strongEl.querySelector('a');
            if (link) {
              titleEl.append(link.cloneNode(true));
            } else {
              titleEl.textContent = strongEl.textContent.trim();
            }
            strongEl.closest('p').replaceWith(titleEl);
          }
        }

        // Tag description — either a remaining <p> or an <h4>
        const desc = col.querySelector(':scope > p, :scope > h4');
        if (desc) desc.classList.add('columns-article-description');
      });
    }
  });
}

function decorateRecentArticles(block) {
  if (!isRecentArticlesBlock(block)) return;
  block.classList.add('columns-recent-articles');

  [...block.querySelectorAll(':scope > div')].forEach((row) => {
    const cols = [...row.children];

    // Heading row: single column with a heading, no images
    if (cols.length === 1 && cols[0].querySelector('h1, h2, h3, h4') && !cols[0].querySelector('picture')) {
      row.classList.add('columns-recent-heading-row');
      const heading = cols[0].querySelector('h1, h2, h3, h4');
      if (heading) heading.classList.add('columns-recent-heading');
      return;
    }

    // CTA row: single column with a list item
    if (cols.length === 1 && cols[0].querySelector('ul > li')) {
      row.classList.add('columns-recent-cta-row');
      const li = cols[0].querySelector('ul > li');
      const label = li.textContent.trim();
      const btn = document.createElement('a');
      btn.href = '#';
      btn.className = 'button primary wknd-columns-cta';
      btn.textContent = label;
      const p = document.createElement('p');
      p.className = 'button-wrapper wknd-columns-cta-wrapper';
      p.append(btn);
      li.closest('ul').replaceWith(p);
      return;
    }

    // Card row: 3+ columns each with h3 containing picture + link
    if (cols.length >= 3) {
      row.classList.add('columns-recent-cards-row');
      cols.forEach((col) => {
        const h3 = col.querySelector(':scope > h3');
        if (!h3) return;
        const picture = h3.querySelector('picture');
        const link = h3.querySelector('a');
        if (picture) {
          const imgWrapper = document.createElement('div');
          imgWrapper.classList.add('columns-card-image');
          imgWrapper.append(picture);
          col.prepend(imgWrapper);
        }
        if (link) {
          h3.textContent = '';
          h3.append(link);
          h3.classList.add('columns-card-title');
        }
        const h4 = col.querySelector(':scope > h4');
        if (h4) h4.classList.add('columns-card-description');
      });
    }
  });
}

export default function decorate(block) {
  block.classList.add('wknd-columns');

  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  decorateFeaturedArticle(block);
  decorateRecentArticles(block);
  decorateWhereToGo(block);
  decorateAllArticles(block);
}
