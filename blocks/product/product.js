/**
 * Loads and decorates the product block.
 * Expects authored content with a single cell containing the API URL.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  block.classList.add('wknd-product');

  // Extract the API URL from the authored block content
  const link = block.querySelector('a');
  const apiUrl = link ? link.href : block.textContent.trim();

  block.textContent = '';

  // Show loading state
  const loader = document.createElement('p');
  loader.classList.add('product-loading');
  loader.textContent = 'Loading products…';
  block.append(loader);

  try {
    const resp = await fetch(apiUrl);
    if (!resp.ok) throw new Error(`API error: ${resp.status}`);
    const data = await resp.json();
    const { products } = data;

    // Remove loader
    loader.remove();

    // Build product grid
    const grid = document.createElement('ul');
    grid.classList.add('product-grid');

    products.forEach((product) => {
      grid.append(createProductCard(product));
    });

    block.append(grid);
  } catch (err) {
    loader.textContent = 'Unable to load products. Please try again later.';
    /* eslint-disable-next-line no-console */
    console.error('Product block fetch error:', err);
  }
}

const STAR_SVG = '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01z"/></svg>';

/**
 * Renders a star rating using inline SVGs.
 * @param {number} rating - Rating value (0–5)
 * @returns {string} HTML string of filled/empty star SVGs
 */
function renderStars(rating) {
  const full = Math.round(rating);
  return Array.from({ length: 5 }, (_, i) => `<span class="product-star${i < full ? ' filled' : ''}">${STAR_SVG}</span>`).join('');
}

/**
 * Creates a single product card element.
 * @param {object} product - Product object from the API
 * @returns {HTMLElement}
 */
function createProductCard(product) {
  const card = document.createElement('li');
  card.classList.add('product-card');

  const discount = Math.round(product.discountPercentage);
  const discountedPrice = (product.price * (1 - product.discountPercentage / 100)).toFixed(2);

  card.innerHTML = `
    <div class="product-card-image">
      ${discount > 0 ? `<span class="product-badge">-${discount}%</span>` : ''}
      <img src="${product.thumbnail}" alt="${product.title}" loading="lazy" width="300" height="300">
    </div>
    <div class="product-card-body">
      <p class="product-category">${product.category}</p>
      <h3 class="product-title">${product.title}</h3>
      <div class="product-rating">
        <span class="product-stars">${renderStars(product.rating)}</span>
        <span class="product-rating-value">${product.rating.toFixed(1)}</span>
      </div>
      <div class="product-price">
        ${discount > 0 ? `<span class="product-price-original">$${product.price.toFixed(2)}</span>` : ''}
        <span class="product-price-current">$${discount > 0 ? discountedPrice : product.price.toFixed(2)}</span>
      </div>
    </div>
  `;
  return card;
}
