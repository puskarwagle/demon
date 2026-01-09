(function () {
    'use strict';

    const VENDURE_API_URL = 'http://localhost:3000/shop-api';

    // GraphQL query to fetch active promotions
    const PROMOTIONS_QUERY = `
        query GetActivePromotions {
            activePromotions {
                id
                name
                enabled
                couponCode
                actions {
                    code
                    args {
                        name
                        value
                    }
                }
            }
        }
    `;

    // GraphQL query to fetch products with variants
    const PRODUCTS_QUERY = `
        query GetProducts {
            products {
                items {
                    id
                    name
                    slug
                    description
                    featuredAsset {
                        preview
                    }
                    variants {
                        id
                        name
                        sku
                        priceWithTax
                        featuredAsset {
                            preview
                        }
                    }
                }
            }
        }
    `;

    // Fetch active promotions from Vendure Shop API
    async function fetchPromotions() {
        try {
            const response = await fetch(VENDURE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: PROMOTIONS_QUERY
                })
            });

            const result = await response.json();

            if (result.errors) {
                console.error('GraphQL errors fetching promotions:', result.errors);
                return {};
            }

            const promotions = result.data?.activePromotions || [];
            console.log('🎉 Fetched active promotions:', promotions);

            return parsePromotions(promotions);
        } catch (error) {
            console.error('Error fetching promotions:', error);
            return {};
        }
    }

    // Parse promotions and build a map of variant IDs to discounts
    function parsePromotions(promotions) {
        const variantDiscounts = {};

        promotions.forEach(promotion => {
            if (!promotion.enabled) return;

            promotion.actions.forEach(action => {
                // Handle percentage discount actions
                if (action.code === 'products_percentage_discount') {
                    let discountPercent = 0;
                    let variantIds = [];

                    action.args.forEach(arg => {
                        if (arg.name === 'discount') {
                            discountPercent = parseFloat(arg.value);
                        } else if (arg.name === 'productVariantIds') {
                            // Parse the JSON array of variant IDs
                            try {
                                variantIds = JSON.parse(arg.value);
                            } catch (e) {
                                console.error('Error parsing variant IDs:', e);
                            }
                        }
                    });

                    // Map each variant ID to this promotion
                    variantIds.forEach(variantId => {
                        variantDiscounts[variantId] = {
                            discountPercent: discountPercent,
                            discountType: 'percentage',
                            name: promotion.name,
                            couponCode: promotion.couponCode
                        };
                    });
                }

                // Handle order percentage discount (applies to whole order)
                else if (action.code === 'order_percentage_discount') {
                    let discountPercent = 0;

                    action.args.forEach(arg => {
                        if (arg.name === 'discount') {
                            discountPercent = parseFloat(arg.value);
                        }
                    });

                    console.log(`📦 Order-level discount: ${discountPercent}% - ${promotion.name}`);
                }

                // Handle buy X get Y free promotions
                else if (action.code === 'buy_x_get_y_free') {
                    let variantIds = [];

                    action.args.forEach(arg => {
                        if (arg.name === 'productVariantIds') {
                            try {
                                variantIds = JSON.parse(arg.value);
                            } catch (e) {
                                console.error('Error parsing BOGO variant IDs:', e);
                            }
                        }
                    });

                    // Mark these as special "BOGO" promotions
                    variantIds.forEach(variantId => {
                        variantDiscounts[variantId] = {
                            discountType: 'bogo',
                            name: promotion.name,
                            couponCode: promotion.couponCode
                        };
                    });

                    if (variantIds.length > 0) {
                        console.log(`🎁 BOGO promotion on variants: ${variantIds.join(', ')}`);
                    }
                }
            });
        });

        console.log('💰 Discounted variants:', variantDiscounts);
        return variantDiscounts;
    }

    // Fetch products from Vendure
    async function fetchProducts() {
        try {
            const response = await fetch(VENDURE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: PRODUCTS_QUERY
                })
            });

            const result = await response.json();

            if (result.errors) {
                console.error('GraphQL errors:', result.errors);
                return [];
            }

            return result.data.products.items;
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    }

    // Generate HTML for a single variant card
    function createVariantCard(product, variant, activePromotions = {}) {
        const price = variant.priceWithTax || 0;
        const formattedPrice = (price / 100).toFixed(2);

        // Check if this variant has an active promotion
        const promotion = activePromotions[variant.id];
        const hasDiscount = !!promotion;

        // Calculate discounted price if promotion exists
        let discountedPrice = price;
        let discountPercent = 0;
        let promotionLabel = 'Sale';

        if (hasDiscount) {
            if (promotion.discountType === 'percentage') {
                discountPercent = promotion.discountPercent;
                discountedPrice = Math.round(price * (1 - discountPercent / 100));
                promotionLabel = `${Math.round(discountPercent)}% OFF`;
            } else if (promotion.discountType === 'bogo') {
                promotionLabel = 'BOGO';
                // For BOGO, we don't change the display price, but show the badge
            }
        }
        const formattedDiscountedPrice = (discountedPrice / 100).toFixed(2);

        // Use variant image if available, otherwise use product image
        const imageUrl = variant.featuredAsset?.preview || product.featuredAsset?.preview || '../static/assets/imgs/shop/product-placeholder.jpg';
        const productUrl = `../product-details/${product.slug}.html`;

        // Display product name + variant name (avoid duplicates)
        const displayName = (variant.name && variant.name !== product.name)
            ? `${product.name} - ${variant.name}`
            : product.name;

        return `
            <div class="col-lg-1-5 col-md-4 col-12 col-sm-6">
                <div class="product-cart-wrap mb-30 wow animate__animated animate__fadeIn" data-wow-delay=".1s">
                    <div class="product-img-action-wrap">
                        <div class="product-img product-img-zoom">
                            <a href="${productUrl}">
                                <img class="default-img" src="${imageUrl}" alt="${displayName}" />
                                <img class="hover-img" src="${imageUrl}" alt="${displayName}" />
                            </a>
                        </div>
                        <div class="product-action-1">
                            <a aria-label="Add To Wishlist" class="action-btn" href="javascript:void(0)">
                                <i class="fi-rs-heart"></i>
                            </a>
                            <a aria-label="Compare" class="action-btn" href="javascript:void(0)">
                                <i class="fi-rs-shuffle"></i>
                            </a>
                            <a aria-label="Quick view" class="action-btn" data-bs-toggle="modal" data-bs-target="#quickViewModal">
                                <i class="fi-rs-eye"></i>
                            </a>
                        </div>
                        ${hasDiscount ? `
                        <div class="product-badges product-badges-position product-badges-mrg">
                            <span class="sale">${promotionLabel}</span>
                        </div>
                        ` : ''}
                    </div>
                    <div class="product-content-wrap">
                        <div class="product-category">
                            <a href="${productUrl}">Product</a>
                        </div>
                        <h2><a href="${productUrl}">${displayName}</a></h2>
                        <div class="product-rate-cover">
                            <div class="product-rate d-inline-block">
                                <div class="product-rating" style="width: 80%"></div>
                            </div>
                            <span class="font-small ml-5 text-muted"></span>
                        </div>
                        <div>
                            <span class="font-small text-muted">${variant.sku || ''}</span>
                        </div>
                        <div class="product-card-bottom">
                            <div class="product-price">
                                ${hasDiscount && promotion.discountType === 'percentage' ? `
                                    <span style="color: #3BB77E; font-weight: 700;">$${formattedDiscountedPrice}</span>
                                    <span class="old-price">$${formattedPrice}</span>
                                ` : hasDiscount && promotion.discountType === 'bogo' ? `
                                    <span>$${formattedPrice}</span>
                                    <span style="font-size: 10px; color: #3BB77E; display: block;">Buy 1 Get 1 Free</span>
                                ` : `
                                    <span>$${formattedPrice}</span>
                                `}
                            </div>
                            <div class="add-cart">
                                <a class="add add-to-cart-btn" href="#" data-variant-id="${variant.id}">
                                    <i class="fi-rs-shopping-cart mr-5"></i>Add
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Render products to the page (each variant as a separate card)
    function renderProducts(products, activePromotions = {}) {
        const productsListContainer = document.getElementById('products-list');

        if (!productsListContainer) {
            console.error('Products list container not found');
            return;
        }

        if (products.length === 0) {
            productsListContainer.innerHTML = '<div class="col-12"><p class="text-center">No products available</p></div>';
            return;
        }

        // Flatten: create a card for each variant of each product
        const variantCards = [];
        products.forEach(product => {
            if (product.variants && product.variants.length > 0) {
                product.variants.forEach(variant => {
                    variantCards.push(createVariantCard(product, variant, activePromotions));
                });
            }
        });

        if (variantCards.length === 0) {
            productsListContainer.innerHTML = '<div class="col-12"><p class="text-center">No product variants available</p></div>';
            return;
        }

        productsListContainer.innerHTML = variantCards.join('');

        // Attach event listeners to Add to Cart buttons
        attachCartEventListeners();
    }

    // Attach event listeners to all Add to Cart buttons
    function attachCartEventListeners() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

        addToCartButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                const variantId = this.getAttribute('data-variant-id');

                if (window.VendureCart && window.VendureCart.handleAddToCartClick) {
                    window.VendureCart.handleAddToCartClick(event, variantId);
                } else {
                    console.error('VendureCart not loaded');
                    alert('Cart functionality not available');
                }
            });
        });
    }

    // Initialize - Load products when page is ready
    async function init() {
        console.log('Loading products and promotions from Vendure...');

        // Fetch promotions and products in parallel
        const [activePromotions, products] = await Promise.all([
            fetchPromotions(),
            fetchProducts()
        ]);

        const totalVariants = products.reduce((sum, p) => sum + (p.variants?.length || 0), 0);
        const discountedVariants = Object.keys(activePromotions).length;

        console.log(`Fetched ${products.length} products with ${totalVariants} total variants`);
        console.log(`Found active promotions affecting ${discountedVariants} variants`);

        renderProducts(products, activePromotions);
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
