(function () {
    'use strict';

    const VENDURE_API_URL = 'http://localhost:3000/shop-api';

    // GraphQL query to get active order with full details
    const GET_ACTIVE_ORDER_QUERY = `
        query GetActiveOrder {
            activeOrder {
                id
                code
                totalQuantity
                subTotal
                subTotalWithTax
                total
                totalWithTax
                shipping
                shippingWithTax
                lines {
                    id
                    quantity
                    linePrice
                    linePriceWithTax
                    unitPrice
                    unitPriceWithTax
                    productVariant {
                        id
                        name
                        sku
                        product {
                            id
                            name
                            slug
                            featuredAsset {
                                preview
                            }
                        }
                        featuredAsset {
                            preview
                        }
                    }
                }
            }
        }
    `;

    // GraphQL mutation to remove line from order
    const REMOVE_ORDER_LINE_MUTATION = `
        mutation RemoveOrderLine($lineId: ID!) {
            removeOrderLine(orderLineId: $lineId) {
                ... on Order {
                    id
                    totalQuantity
                    lines {
                        id
                    }
                }
                ... on ErrorResult {
                    errorCode
                    message
                }
            }
        }
    `;

    // GraphQL mutation to adjust line quantity
    const ADJUST_ORDER_LINE_MUTATION = `
        mutation AdjustOrderLine($lineId: ID!, $quantity: Int!) {
            adjustOrderLine(orderLineId: $lineId, quantity: $quantity) {
                ... on Order {
                    id
                    totalQuantity
                    lines {
                        id
                        quantity
                        linePriceWithTax
                    }
                }
                ... on ErrorResult {
                    errorCode
                    message
                }
            }
        }
    `;

    // Fetch active order
    async function getActiveOrder() {
        try {
            const response = await fetch(VENDURE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    query: GET_ACTIVE_ORDER_QUERY
                })
            });

            const result = await response.json();

            if (result.errors) {
                console.error('GraphQL errors:', result.errors);
                return null;
            }

            return result.data.activeOrder;

        } catch (error) {
            console.error('Error fetching active order:', error);
            return null;
        }
    }

    // Remove order line
    async function removeOrderLine(lineId) {
        try {
            const response = await fetch(VENDURE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    query: REMOVE_ORDER_LINE_MUTATION,
                    variables: { lineId: lineId }
                })
            });

            const result = await response.json();

            if (result.errors) {
                console.error('GraphQL errors:', result.errors);
                return { success: false, error: result.errors[0].message };
            }

            const data = result.data.removeOrderLine;

            if (data.errorCode) {
                return { success: false, error: data.message };
            }

            return { success: true, order: data };

        } catch (error) {
            console.error('Error removing order line:', error);
            return { success: false, error: error.message };
        }
    }

    // Adjust order line quantity
    async function adjustOrderLine(lineId, quantity) {
        try {
            const response = await fetch(VENDURE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    query: ADJUST_ORDER_LINE_MUTATION,
                    variables: { lineId: lineId, quantity: quantity }
                })
            });

            const result = await response.json();

            if (result.errors) {
                console.error('GraphQL errors:', result.errors);
                return { success: false, error: result.errors[0].message };
            }

            const data = result.data.adjustOrderLine;

            if (data.errorCode) {
                return { success: false, error: data.message };
            }

            return { success: true, order: data };

        } catch (error) {
            console.error('Error adjusting order line:', error);
            return { success: false, error: error.message };
        }
    }

    // Format price
    function formatPrice(price) {
        return (price / 100).toFixed(2);
    }

    // Create cart line HTML
    function createCartLineHTML(line) {
        const variant = line.productVariant;
        const product = variant.product;
        const imageUrl = variant.featuredAsset?.preview || product.featuredAsset?.preview || '../static/assets/imgs/shop/product-placeholder.jpg';
        const productName = variant.name && variant.name !== product.name
            ? `${product.name} - ${variant.name}`
            : product.name;
        const unitPrice = formatPrice(line.unitPriceWithTax);
        const lineTotal = formatPrice(line.linePriceWithTax);

        return `
            <tr class="cart-line" data-line-id="${line.id}">
                <td class="custome-checkbox pl-30">
                    <input class="form-check-input" type="checkbox" name="checkbox" value="">
                    <label class="form-check-label"><span></span></label>
                </td>
                <td class="image product-thumbnail pt-40">
                    <img src="${imageUrl}" alt="${productName}">
                </td>
                <td class="product-des product-name">
                    <h6 class="mb-5"><a class="product-name mb-10 text-heading" href="../product-details/${product.slug}.html">${productName}</a></h6>
                    <div class="product-rate-cover">
                        <div class="product-rate d-inline-block">
                            <div class="product-rating" style="width:90%"></div>
                        </div>
                        <span class="font-small ml-5 text-muted"></span>
                    </div>
                </td>
                <td class="price" data-title="Price">
                    <h4 class="text-body">$${unitPrice}</h4>
                </td>
                <td class="text-center detail-info" data-title="Stock">
                    <div class="detail-extralink mr-15">
                        <div class="detail-qty border radius">
                            <a href="#" class="qty-down" data-line-id="${line.id}"><i class="fi-rs-angle-small-down"></i></a>
                            <span class="qty-val">${line.quantity}</span>
                            <a href="#" class="qty-up" data-line-id="${line.id}"><i class="fi-rs-angle-small-up"></i></a>
                        </div>
                    </div>
                </td>
                <td class="price" data-title="Price">
                    <h4 class="text-brand">$${lineTotal}</h4>
                </td>
                <td class="action text-center" data-title="Remove">
                    <a href="#" class="text-body remove-line" data-line-id="${line.id}"><i class="fi-rs-trash"></i></a>
                </td>
            </tr>
        `;
    }

    // Render cart
    function renderCart(order) {
        const cartContainer = document.getElementById('cart-container');

        if (!cartContainer) {
            console.error('Cart container not found');
            return;
        }

        if (!order || !order.lines || order.lines.length === 0) {
            // Show empty cart
            cartContainer.innerHTML = `
                <div class="col-xl-8 col-lg-10 col-md-12 m-auto text-center">
                    <p class="mb-20"><img src="../static/assets/imgs/page/empty.png" alt="" class="hover-up" /></p>
                    <h1 class="display-2 mb-30">Your Cart is Empty.</h1>
                    <p class="font-lg text-grey-700 mb-30">
                        Add something to make us happy :)<br />
                        Start<a href="../shop/index.html"> <span> shopping</span></a> or <a href="../dashboard/index.html"><span>login</span></a> to view products in your cart
                    </p>
                    <a class="btn btn-default submit-auto-width font-xs hover-up mt-30" href="../index.html"><i class="fi-rs-home mr-5"></i> Back To Home Page</a>
                </div>
            `;
            return;
        }

        // Show cart with items
        const linesHTML = order.lines.map(line => createCartLineHTML(line)).join('');
        const subtotal = formatPrice(order.subTotalWithTax);
        const shipping = formatPrice(order.shippingWithTax || 0);
        const total = formatPrice(order.totalWithTax);

        cartContainer.innerHTML = `
            <div class="col-lg-8">
                <div class="mb-50">
                    <h1 class="heading-2 mb-10">Your Cart</h1>
                    <div class="d-flex justify-content-between">
                        <h6 class="text-body">There are <span class="text-brand">${order.totalQuantity}</span> products in your cart</h6>
                    </div>
                </div>
                <div class="table-responsive shopping-summery">
                    <table class="table table-wishlist">
                        <thead>
                            <tr class="main-heading">
                                <th class="custome-checkbox start pl-30">
                                    <input class="form-check-input" type="checkbox" name="checkbox" value="">
                                    <label class="form-check-label"><span></span></label>
                                </th>
                                <th scope="col" colspan="2">Product</th>
                                <th scope="col">Unit Price</th>
                                <th scope="col">Quantity</th>
                                <th scope="col">Subtotal</th>
                                <th scope="col" class="end">Remove</th>
                            </tr>
                        </thead>
                        <tbody id="cart-items">
                            ${linesHTML}
                        </tbody>
                    </table>
                </div>
                <div class="divider-2 mb-30"></div>
                <div class="cart-action d-flex justify-content-between">
                    <a class="btn" href="../shop/index.html"><i class="fi-rs-arrow-left mr-10"></i>Continue Shopping</a>
                    <a class="btn  mr-10 mb-sm-15" href="#" id="update-cart"><i class="fi-rs-refresh mr-10"></i>Update Cart</a>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="border p-md-4 cart-totals ml-30">
                    <div class="table-responsive">
                        <table class="table no-border">
                            <tbody>
                                <tr>
                                    <td class="cart_total_label">
                                        <h6 class="text-muted">Subtotal</h6>
                                    </td>
                                    <td class="cart_total_amount">
                                        <h4 class="text-brand text-end">$${subtotal}</h4>
                                    </td>
                                </tr>
                                <tr>
                                    <td scope="col" colspan="2">
                                        <div class="divider-2 mt-10 mb-10"></div>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="cart_total_label">
                                        <h6 class="text-muted">Shipping</h6>
                                    </td>
                                    <td class="cart_total_amount">
                                        <h5 class="text-heading text-end">${shipping === '0.00' ? 'Free' : '$' + shipping}</h5>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="cart_total_label">
                                        <h6 class="text-muted">Total</h6>
                                    </td>
                                    <td class="cart_total_amount">
                                        <h4 class="text-brand text-end">$${total}</h4>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <a href="../checkout/index.html" class="btn mb-20 w-100">Proceed To CheckOut<i class="fi-rs-sign-out ml-15"></i></a>
                </div>
            </div>
        `;

        // Attach event listeners
        attachCartEventListeners();
    }

    // Attach event listeners
    function attachCartEventListeners() {
        // Remove buttons
        document.querySelectorAll('.remove-line').forEach(btn => {
            btn.addEventListener('click', async function(e) {
                e.preventDefault();
                const lineId = this.getAttribute('data-line-id');

                if (confirm('Remove this item from cart?')) {
                    const result = await removeOrderLine(lineId);
                    if (result.success) {
                        // Reload cart
                        loadCart();
                        // Update header cart count
                        if (window.VendureCart) {
                            window.VendureCart.updateCartCount(result.order.totalQuantity);
                        }
                    } else {
                        alert('Failed to remove item: ' + result.error);
                    }
                }
            });
        });

        // Quantity up buttons
        document.querySelectorAll('.qty-up').forEach(btn => {
            btn.addEventListener('click', async function(e) {
                e.preventDefault();
                const lineId = this.getAttribute('data-line-id');
                const qtySpan = this.previousElementSibling;
                const currentQty = parseInt(qtySpan.textContent);

                const result = await adjustOrderLine(lineId, currentQty + 1);
                if (result.success) {
                    loadCart();
                } else {
                    alert('Failed to update quantity: ' + result.error);
                }
            });
        });

        // Quantity down buttons
        document.querySelectorAll('.qty-down').forEach(btn => {
            btn.addEventListener('click', async function(e) {
                e.preventDefault();
                const lineId = this.getAttribute('data-line-id');
                const qtySpan = this.nextElementSibling;
                const currentQty = parseInt(qtySpan.textContent);

                if (currentQty > 1) {
                    const result = await adjustOrderLine(lineId, currentQty - 1);
                    if (result.success) {
                        loadCart();
                    } else {
                        alert('Failed to update quantity: ' + result.error);
                    }
                }
            });
        });
    }

    // Load and render cart
    async function loadCart() {
        console.log('Loading cart...');
        const order = await getActiveOrder();
        console.log('Active order:', order);
        renderCart(order);

        // Update header cart count
        if (order && window.VendureCart) {
            window.VendureCart.updateCartCount(order.totalQuantity);
        }
    }

    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadCart);
    } else {
        loadCart();
    }

})();
