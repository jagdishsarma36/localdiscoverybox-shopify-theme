document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initCartDrawer();
  initFaqAccordions();
  initProductForm();
  initModals();
  initScarcityBars();
  initRegionFilters();
});

/* ==========================================================================
   Mobile Navigation Drawer
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.querySelector('[data-mobile-menu-toggle]');
  const drawer = document.querySelector('[data-mobile-nav-drawer]');
  const overlay = document.querySelector('[data-mobile-drawer-overlay]');
  const closeBtn = document.querySelector('[data-mobile-drawer-close]');

  if (!toggleBtn || !drawer || !overlay) return;

  const openNav = () => {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeNav = () => {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  toggleBtn.addEventListener('click', openNav);
  overlay.addEventListener('click', closeNav);
  if (closeBtn) closeBtn.addEventListener('click', closeNav);
}

/* ==========================================================================
   AJAX Cart & Cart Drawer
   ========================================================================== */
function initCartDrawer() {
  const drawer = document.querySelector('[data-cart-drawer]');
  const overlay = document.querySelector('[data-cart-drawer-overlay]');
  const openButtons = document.querySelectorAll('[data-cart-trigger]');
  const closeButtons = document.querySelectorAll('[data-cart-drawer-close]');

  if (!drawer || !overlay) return;

  window.openCart = function() {
    refreshCartDrawer();
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.closeCart = function() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.openCart();
    });
  });

  closeButtons.forEach(btn => {
    btn.addEventListener('click', window.closeCart);
  });

  overlay.addEventListener('click', window.closeCart);

  // Intercept standard add to cart forms
  document.addEventListener('submit', (e) => {
    const form = e.target;
    if (form.matches('[action*="/cart/add"]') || form.dataset.ajaxCartForm !== undefined) {
      e.preventDefault();
      const formData = new FormData(form);
      addToCartAjax(formData);
    }
  });
}

function updateCartCount(count) {
  const badges = document.querySelectorAll('[data-cart-count]');
  badges.forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  });
}

function addToCartAjax(formData) {
  const submitBtn = document.querySelector('[data-submit-button]');
  const originalText = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Adding to box...</span>`;
  }

  fetch('/cart/add.js', {
    method: 'POST',
    body: formData
  })
    .then(res => {
      if (!res.ok) throw new Error('Add to cart failed');
      return res.json();
    })
    .then(item => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
      window.openCart();
    })
    .catch(err => {
      console.warn('Shopify Cart API notice (falling back or demo):', err);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
      window.openCart();
    });
}

function refreshCartDrawer() {
  fetch('/cart.js')
    .then(res => res.json())
    .then(cart => {
      renderCartItems(cart);
      updateCartCount(cart.item_count);
      updateFreeShippingBar(cart.total_price);
    })
    .catch(err => {
      console.error('Error fetching cart:', err);
    });
}

function renderCartItems(cart) {
  const itemsContainer = document.querySelector('[data-cart-drawer-items]');
  const subtotalEl = document.querySelector('[data-cart-subtotal]');
  const checkoutBtn = document.querySelector('[data-cart-checkout-btn]');
  const emptyState = document.querySelector('[data-cart-empty-state]');

  if (!itemsContainer) return;

  if (cart.item_count === 0) {
    itemsContainer.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    if (checkoutBtn) checkoutBtn.disabled = true;
    if (subtotalEl) subtotalEl.textContent = '$0.00';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (checkoutBtn) checkoutBtn.disabled = false;
  if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price);

  let html = '';
  cart.items.forEach(item => {
    const isSubscription = item.selling_plan_allocation !== null;
    const planName = isSubscription ? item.selling_plan_allocation.selling_plan.name : '';
    const regionProp = item.properties && item.properties['Region'] ? item.properties['Region'] : '';

    html += `
      <div class="cart-item" data-key="${item.key}">
        <div class="cart-item-image">
          <img src="${item.featured_image ? item.featured_image.url : '/assets/box_hero.webp'}" alt="${escapeHtml(item.title)}">
        </div>
        <div class="cart-item-details">
          <h4 class="cart-item-title">${escapeHtml(item.product_title || item.title)}</h4>
          ${isSubscription ? `<span class="cart-item-selling-plan">★ ${escapeHtml(planName)}</span>` : ''}
          ${regionProp ? `<div class="cart-item-property">Region: <strong>${escapeHtml(regionProp)}</strong></div>` : ''}
          <div class="cart-item-bottom">
            <div class="quantity-controls">
              <button type="button" class="qty-btn" onclick="changeItemQty('${item.key}', ${item.quantity - 1})">-</button>
              <span class="qty-num">${item.quantity}</span>
              <button type="button" class="qty-btn" onclick="changeItemQty('${item.key}', ${item.quantity + 1})">+</button>
            </div>
            <div class="cart-item-price">${formatMoney(item.final_line_price)}</div>
          </div>
        </div>
      </div>
    `;
  });

  itemsContainer.innerHTML = html;
}

window.changeItemQty = function(lineKey, newQty) {
  fetch('/cart/change.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: lineKey, quantity: newQty })
  })
    .then(res => res.json())
    .then(cart => {
      renderCartItems(cart);
      updateCartCount(cart.item_count);
      updateFreeShippingBar(cart.total_price);
    });
};

function updateFreeShippingBar(totalCents) {
  const barContainer = document.querySelector('[data-free-shipping-container]');
  const barFill = document.querySelector('[data-free-shipping-fill]');
  const messageEl = document.querySelector('[data-free-shipping-text]');
  if (!barContainer || !barFill || !messageEl) return;

  const thresholdDollars = parseInt(barContainer.dataset.threshold || '50', 10);
  const thresholdCents = thresholdDollars * 100;
  const currentDollars = totalCents / 100;

  if (totalCents >= thresholdCents) {
    barFill.style.width = '100%';
    messageEl.innerHTML = `<strong>You unlocked FREE shipping!</strong> 🎉`;
  } else {
    const diff = ((thresholdCents - totalCents) / 100).toFixed(2);
    const pct = Math.min(100, Math.max(0, (totalCents / thresholdCents) * 100));
    barFill.style.width = `${pct}%`;
    messageEl.innerHTML = `Add <strong>$${diff}</strong> more for <strong>FREE shipping!</strong>`;
  }
}

function formatMoney(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[m]);
}

/* ==========================================================================
   Product Form & Subscription Selling Plans
   ========================================================================== */
function initProductForm() {
  const form = document.querySelector('[data-main-product-form]');
  if (!form) return;

  const qtyInput = form.querySelector('[data-qty-input]');
  const minusBtn = form.querySelector('[data-qty-minus]');
  const plusBtn = form.querySelector('[data-qty-plus]');
  const unitPriceEl = document.querySelector('[data-base-price]');
  const calculatedTotalEl = document.querySelector('[data-calculated-total]');
  const summaryQtyEl = document.querySelector('[data-summary-qty]');
  const sellingPlanInput = form.querySelector('[name="selling_plan"]');
  const regionSelect = form.querySelector('[name="properties[Region]"]');

  let basePriceCents = parseInt(form.dataset.basePrice || '5900', 10);

  const updateCalculations = () => {
    const qty = parseInt(qtyInput ? qtyInput.value : '1', 10);
    const total = (basePriceCents * qty) / 100;

    if (summaryQtyEl) {
      summaryQtyEl.textContent = `${qty} box${qty > 1 ? 'es' : ''}`;
    }
    if (calculatedTotalEl) {
      calculatedTotalEl.textContent = `$${total.toFixed(2)}`;
    }
  };

  if (minusBtn && qtyInput) {
    minusBtn.addEventListener('click', () => {
      let val = parseInt(qtyInput.value, 10) || 1;
      if (val > 1) {
        qtyInput.value = val - 1;
        updateCalculations();
      }
    });
  }

  if (plusBtn && qtyInput) {
    plusBtn.addEventListener('click', () => {
      let val = parseInt(qtyInput.value, 10) || 1;
      if (val < 5) {
        qtyInput.value = val + 1;
        updateCalculations();
      }
    });
  }

  // Radio switcher for One-Time vs Subscription Plans
  const purchaseOptions = form.querySelectorAll('[name="purchase_option"]');
  purchaseOptions.forEach(opt => {
    opt.addEventListener('change', () => {
      const parentLabels = form.querySelectorAll('.plan-option-label');
      parentLabels.forEach(lbl => lbl.classList.remove('selected'));
      opt.closest('.plan-option-label')?.classList.add('selected');

      if (opt.value === 'one_time') {
        if (sellingPlanInput) sellingPlanInput.value = '';
        basePriceCents = parseInt(form.dataset.basePrice || '5900', 10);
      } else {
        if (sellingPlanInput) sellingPlanInput.value = opt.value;
        const discountPrice = parseInt(opt.dataset.planPrice || form.dataset.basePrice || '5900', 10);
        basePriceCents = discountPrice;
      }
      updateCalculations();
    });
  });

  updateCalculations();
}

/* ==========================================================================
   Subscribe Page Direct Plan Chooser
   ========================================================================== */
window.chooseSubscriptionPlan = function(planId, planName, priceCents, cadence, mode) {
  const regionSelector = document.querySelector(`[data-plan-region="${planId}"]`);
  const selectedRegion = regionSelector ? regionSelector.value : (mode === 'rotating' ? 'Rotating Regions (All America)' : 'Southwest Virginia');

  // Add subscription product to cart
  const formData = new FormData();
  const subProductId = document.querySelector('[data-subscription-variant-id]')?.value || '';
  if (subProductId) {
    formData.append('id', subProductId);
  }
  formData.append('quantity', '1');
  formData.append('selling_plan', planId);
  formData.append('properties[Plan]', planName);
  formData.append('properties[Region]', selectedRegion);
  formData.append('properties[Cadence]', cadence);

  addToCartAjax(formData);
};

/* ==========================================================================
   FAQ Accordions
   ========================================================================== */
function initFaqAccordions() {
  document.querySelectorAll('[data-accordion-trigger]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      const isActive = item.classList.contains('active');

      // Close sibling accordions in same group if desired
      const parent = item.parentElement;
      if (parent) {
        parent.querySelectorAll('.accordion-item').forEach(sib => sib.classList.remove('active'));
      }

      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   Modals (Waitlist & Recommend A Brand)
   ========================================================================== */
function initModals() {
  const waitlistModal = document.querySelector('[data-waitlist-modal]');
  const recommendModal = document.querySelector('[data-recommend-modal]');

  window.openWaitlistModal = function(regionName) {
    if (!waitlistModal) return;
    const titleEl = waitlistModal.querySelector('[data-modal-region-title]');
    const hiddenInput = waitlistModal.querySelector('[data-modal-region-input]');
    if (titleEl) titleEl.textContent = regionName || 'Upcoming Region';
    if (hiddenInput) hiddenInput.value = regionName || '';
    waitlistModal.classList.add('open');
  };

  window.openRecommendModal = function(regionName) {
    if (!recommendModal) return;
    const titleEl = recommendModal.querySelector('[data-modal-region-title]');
    const hiddenInput = recommendModal.querySelector('[data-modal-region-input]');
    if (titleEl) titleEl.textContent = regionName || 'Your State';
    if (hiddenInput) hiddenInput.value = regionName || '';
    recommendModal.classList.add('open');
  };

  window.closeModal = function(modalEl) {
    if (modalEl) modalEl.classList.remove('open');
  };

  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      window.closeModal(modal);
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        window.closeModal(overlay);
      }
    });
  });

  // Handle Waitlist Form submission
  const waitlistForm = document.querySelector('[data-waitlist-form]');
  if (waitlistForm) {
    waitlistForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const successBox = waitlistForm.querySelector('[data-form-success]');
      const formFields = waitlistForm.querySelector('[data-form-fields]');
      if (formFields) formFields.style.display = 'none';
      if (successBox) successBox.style.display = 'block';
    });
  }

  // Handle Recommend Form submission
  const recommendForm = document.querySelector('[data-recommend-form]');
  if (recommendForm) {
    recommendForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const successBox = recommendForm.querySelector('[data-form-success]');
      const formFields = recommendForm.querySelector('[data-form-fields]');
      if (formFields) formFields.style.display = 'none';
      if (successBox) successBox.style.display = 'block';
    });
  }
}

/* ==========================================================================
   Scarcity Bars
   ========================================================================== */
function initScarcityBars() {
  document.querySelectorAll('[data-scarcity-bar]').forEach(bar => {
    const total = parseInt(bar.dataset.total || '100', 10);
    const remaining = parseInt(bar.dataset.remaining || '34', 10);
    const claimedPct = Math.round(((total - remaining) / total) * 100);
    const fill = bar.querySelector('.scarcity-bar-fill');
    if (fill) {
      setTimeout(() => {
        fill.style.width = `${claimedPct}%`;
      }, 300);
    }
  });
}

/* ==========================================================================
   Region Directory Filters
   ========================================================================== */
function initRegionFilters() {
  const tabs = document.querySelectorAll('[data-region-filter]');
  const cards = document.querySelectorAll('[data-region-status]');

  if (!tabs.length || !cards.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('btn-coral', 'btn-sun'));
      tab.classList.add('btn-coral');

      const filter = tab.dataset.regionFilter;
      cards.forEach(card => {
        if (filter === 'all' || card.dataset.regionStatus === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}
