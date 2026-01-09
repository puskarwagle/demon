(function () {
    'use strict';

    const VENDURE_API_URL = 'http://localhost:3000/shop-api';

    // GraphQL mutation to add item to cart
    const ADD_TO_CART_MUTATION = `
        mutation AddItemToOrder($variantId: ID!, $quantity: Int!) {
            addItemToOrder(productVariantId: $variantId, quantity: $quantity) {
                ... on Order {
                    id
                    code
                    totalQuantity
                    lines {
                        id
                        quantity
                    }
                }
                ... on ErrorResult {
                    errorCode
                    message
                }
            }
        }
    `;

    // GraphQL query to get active order
    const GET_ACTIVE_ORDER_QUERY = `
        query GetActiveOrder {
            activeOrder {
                id
                code
                totalQuantity
            }
        }
    `;

    // Add item to cart
    async function addToCart(variantId, quantity = 1) {
        try {
            const response = await fetch(VENDURE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important for session cookies
                body: JSON.stringify({
                    query: ADD_TO_CART_MUTATION,
                    variables: {
                        variantId: variantId,
                        quantity: quantity
                    }
                })
            });

            const result = await response.json();

            if (result.errors) {
                console.error('GraphQL errors:', result.errors);
                return { success: false, error: result.errors[0].message };
            }

            const data = result.data.addItemToOrder;

            // Check if it's an error result
            if (data.errorCode) {
                console.error('Add to cart error:', data.message);
                return { success: false, error: data.message };
            }

            // Success
            return {
                success: true,
                order: data,
                totalQuantity: data.totalQuantity
            };

        } catch (error) {
            console.error('Error adding to cart:', error);
            return { success: false, error: error.message };
        }
    }

    // Get active order (to get cart count)
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
            console.error('Error getting active order:', error);
            return null;
        }
    }

    // Update cart count in header
    function updateCartCount(count) {
        const cartCountElements = document.querySelectorAll('.pro-count');
        cartCountElements.forEach(element => {
            element.textContent = count || 0;
        });
    }

    // Initialize cart count on page load
    async function initCartCount() {
        const order = await getActiveOrder();
        if (order && order.totalQuantity) {
            updateCartCount(order.totalQuantity);
        }
    }

    // Handle add to cart button click
    function handleAddToCartClick(event, variantId) {
        event.preventDefault();

        const button = event.currentTarget;
        const originalText = button.innerHTML;

        // Disable button and show loading
        button.disabled = true;
        button.innerHTML = '<i class="fi-rs-loading"></i>Adding...';

        addToCart(variantId).then(result => {
            if (result.success) {
                // Update cart count
                updateCartCount(result.totalQuantity);

                // Show success message
                alert('Item added to cart!');

                // Reset button
                button.innerHTML = originalText;
                button.disabled = false;
            } else {
                // Show error
                alert('Failed to add item to cart: ' + (result.error || 'Unknown error'));

                // Reset button
                button.innerHTML = originalText;
                button.disabled = false;
            }
        });
    }

    // Expose functions globally
    window.VendureCart = {
        addToCart: addToCart,
        updateCartCount: updateCartCount,
        handleAddToCartClick: handleAddToCartClick,
        initCartCount: initCartCount
    };

    // Initialize cart count when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCartCount);
    } else {
        initCartCount();
    }

})();
