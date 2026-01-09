(function () {
    'use strict';

    const VENDURE_API_URL = 'http://localhost:3000/shop-api';

    // GraphQL query to get active order with promotions and discounts
    const GET_ACTIVE_ORDER_QUERY = `
        query GetActiveOrder {
            activeOrder {
                id
                code
                state
                totalQuantity
                subTotal
                subTotalWithTax
                shippingWithTax
                totalWithTax
                discounts {
                    description
                    amount
                    amountWithTax
                    type
                }
                customer {
                    id
                    emailAddress
                    firstName
                    lastName
                }
                lines {
                    id
                    quantity
                    linePrice
                    linePriceWithTax
                    discountedLinePrice
                    discountedLinePriceWithTax
                    unitPrice
                    unitPriceWithTax
                    discountedUnitPrice
                    discountedUnitPriceWithTax
                    discounts {
                        description
                        amount
                        amountWithTax
                    }
                    productVariant {
                        id
                        name
                        sku
                        priceWithTax
                        product {
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
                promotions {
                    id
                    name
                    couponCode
                }
            }
        }
    `;

    // Mutation to set customer for order
    const SET_CUSTOMER_MUTATION = `
        mutation SetCustomerForOrder($input: CreateCustomerInput!) {
            setCustomerForOrder(input: $input) {
                ... on Order {
                    id
                    customer {
                        id
                        emailAddress
                    }
                }
                ... on ErrorResult {
                    errorCode
                    message
                }
            }
        }
    `;

    // Alternative mutation - set order custom fields with email
    const SET_ORDER_CUSTOM_FIELDS = `
        mutation SetOrderCustomFields($emailAddress: String!) {
            setOrderCustomFields(customFields: { guestEmail: $emailAddress }) {
                ... on Order {
                    id
                }
                ... on ErrorResult {
                    errorCode
                    message
                }
            }
        }
    `;

    // Mutation to set shipping address
    const SET_SHIPPING_ADDRESS_MUTATION = `
        mutation SetOrderShippingAddress($input: CreateAddressInput!) {
            setOrderShippingAddress(input: $input) {
                ... on Order {
                    id
                }
                ... on ErrorResult {
                    errorCode
                    message
                }
            }
        }
    `;

    // Mutation to set billing address
    const SET_BILLING_ADDRESS_MUTATION = `
        mutation SetOrderBillingAddress($input: CreateAddressInput!) {
            setOrderBillingAddress(input: $input) {
                ... on Order {
                    id
                }
                ... on ErrorResult {
                    errorCode
                    message
                }
            }
        }
    `;

    // Query to get eligible shipping methods
    const GET_SHIPPING_METHODS_QUERY = `
        query GetShippingMethods {
            eligibleShippingMethods {
                id
                name
                price
                priceWithTax
                description
            }
        }
    `;

    // Query to get eligible payment methods
    const GET_PAYMENT_METHODS_QUERY = `
        query GetPaymentMethods {
            eligiblePaymentMethods {
                id
                code
                name
                description
                isEligible
            }
        }
    `;

    // Mutation to set shipping method
    const SET_SHIPPING_METHOD_MUTATION = `
        mutation SetShippingMethod($shippingMethodId: [ID!]!) {
            setOrderShippingMethod(shippingMethodId: $shippingMethodId) {
                ... on Order {
                    id
                    shippingWithTax
                }
                ... on ErrorResult {
                    errorCode
                    message
                }
            }
        }
    `;

    // Mutation to transition order to ArrangingPayment
    const TRANSITION_TO_ARRANGING_PAYMENT = `
        mutation TransitionToArrangingPayment {
            transitionOrderToState(state: "ArrangingPayment") {
                ... on Order {
                    id
                    state
                }
                ... on OrderStateTransitionError {
                    errorCode
                    message
                    transitionError
                }
            }
        }
    `;

    // Mutation to add payment
    const ADD_PAYMENT_MUTATION = `
        mutation AddPaymentToOrder($input: PaymentInput!) {
            addPaymentToOrder(input: $input) {
                ... on Order {
                    id
                    code
                    state
                    totalWithTax
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

    // Set customer for order
    async function setCustomerForOrder(customerData) {
        try {
            const response = await fetch(VENDURE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    query: SET_CUSTOMER_MUTATION,
                    variables: { input: customerData }
                })
            });

            const result = await response.json();
            console.log('setCustomerForOrder response:', result);

            if (result.errors) {
                console.error('GraphQL errors:', result.errors);
                return { success: false, error: result.errors[0].message };
            }

            const data = result.data.setCustomerForOrder;
            if (data.errorCode) {
                console.error('Error code from mutation:', data.errorCode, data.message);
                return { success: false, error: data.message };
            }

            // Verify customer was actually set in the response
            console.log('Customer set successfully, order ID:', data.id);
            if (data.customer && data.customer.emailAddress) {
                console.log('Customer confirmed in mutation response:', data.customer.emailAddress);
                return { success: true, customer: data.customer };
            } else {
                console.warn('Mutation succeeded but customer field is missing or empty');
                return { success: true, warning: 'Customer field not confirmed' };
            }

        } catch (error) {
            console.error('Error setting customer:', error);
            return { success: false, error: error.message };
        }
    }

    // Set shipping address
    async function setShippingAddress(addressData) {
        try {
            const response = await fetch(VENDURE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    query: SET_SHIPPING_ADDRESS_MUTATION,
                    variables: { input: addressData }
                })
            });

            const result = await response.json();

            if (result.errors) {
                return { success: false, error: result.errors[0].message };
            }

            const data = result.data.setOrderShippingAddress;
            if (data.errorCode) {
                return { success: false, error: data.message };
            }

            return { success: true };

        } catch (error) {
            console.error('Error setting shipping address:', error);
            return { success: false, error: error.message };
        }
    }

    // Set billing address
    async function setBillingAddress(addressData) {
        try {
            const response = await fetch(VENDURE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    query: SET_BILLING_ADDRESS_MUTATION,
                    variables: { input: addressData }
                })
            });

            const result = await response.json();

            if (result.errors) {
                return { success: false, error: result.errors[0].message };
            }

            const data = result.data.setOrderBillingAddress;
            if (data.errorCode) {
                return { success: false, error: data.message };
            }

            return { success: true };

        } catch (error) {
            console.error('Error setting billing address:', error);
            return { success: false, error: error.message };
        }
    }

    // Get eligible shipping methods
    async function getShippingMethods() {
        try {
            const response = await fetch(VENDURE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    query: GET_SHIPPING_METHODS_QUERY
                })
            });

            const result = await response.json();

            if (result.errors) {
                console.error('GraphQL errors:', result.errors);
                return [];
            }

            return result.data.eligibleShippingMethods || [];

        } catch (error) {
            console.error('Error fetching shipping methods:', error);
            return [];
        }
    }

    // Get eligible payment methods
    async function getPaymentMethods() {
        try {
            const response = await fetch(VENDURE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    query: GET_PAYMENT_METHODS_QUERY
                })
            });

            const result = await response.json();

            if (result.errors) {
                console.error('GraphQL errors:', result.errors);
                return [];
            }

            return result.data.eligiblePaymentMethods || [];

        } catch (error) {
            console.error('Error fetching payment methods:', error);
            return [];
        }
    }

    // Set shipping method
    async function setShippingMethod(shippingMethodId) {
        try {
            const response = await fetch(VENDURE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    query: SET_SHIPPING_METHOD_MUTATION,
                    variables: { shippingMethodId: [shippingMethodId] }
                })
            });

            const result = await response.json();

            if (result.errors) {
                return { success: false, error: result.errors[0].message };
            }

            const data = result.data.setOrderShippingMethod;
            if (data.errorCode) {
                return { success: false, error: data.message };
            }

            return { success: true };

        } catch (error) {
            console.error('Error setting shipping method:', error);
            return { success: false, error: error.message };
        }
    }

    // Transition order to ArrangingPayment
    async function transitionToArrangingPayment() {
        try {
            const response = await fetch(VENDURE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    query: TRANSITION_TO_ARRANGING_PAYMENT
                })
            });

            const result = await response.json();

            if (result.errors) {
                return { success: false, error: result.errors[0].message };
            }

            const data = result.data.transitionOrderToState;
            if (data.errorCode) {
                return { success: false, error: data.message || data.transitionError };
            }

            return { success: true, order: data };

        } catch (error) {
            console.error('Error transitioning order:', error);
            return { success: false, error: error.message };
        }
    }

    // Add payment to order
    async function addPaymentToOrder(method, metadata = {}) {
        try {
            const response = await fetch(VENDURE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    query: ADD_PAYMENT_MUTATION,
                    variables: {
                        input: {
                            method: method,
                            metadata: metadata
                        }
                    }
                })
            });

            const result = await response.json();

            if (result.errors) {
                return { success: false, error: result.errors[0].message };
            }

            const data = result.data.addPaymentToOrder;
            if (data.errorCode) {
                return { success: false, error: data.message };
            }

            return { success: true, order: data };

        } catch (error) {
            console.error('Error adding payment:', error);
            return { success: false, error: error.message };
        }
    }

    // Format price
    function formatPrice(price) {
        return (price / 100).toFixed(2);
    }

    // Display order summary
    function displayOrderSummary(order) {
        const summaryContainer = document.getElementById('order-summary');

        if (!order || !order.lines || order.lines.length === 0) {
            summaryContainer.innerHTML = '<p class="text-center">No items in cart</p>';
            return;
        }

        const itemsHTML = order.lines.map(line => {
            const productName = line.productVariant.name || line.productVariant.product.name;
            const lineTotal = formatPrice(line.linePriceWithTax);
            return `
                <div class="table-responsive order_table mb-15">
                    <table class="table no-border">
                        <tbody>
                            <tr>
                                <td class="text_grey">${productName} × ${line.quantity}</td>
                                <td class="text-right">$${lineTotal}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
        }).join('');

        const subtotal = formatPrice(order.subTotalWithTax);
        const shipping = formatPrice(order.shippingWithTax || 0);
        const total = formatPrice(order.totalWithTax);

        summaryContainer.innerHTML = `
            ${itemsHTML}
            <div class="table-responsive order_table">
                <table class="table no-border">
                    <tbody>
                        <tr>
                            <td class="text_grey">Subtotal</td>
                            <td class="text-right">$${subtotal}</td>
                        </tr>
                        <tr>
                            <td class="text_grey">Shipping</td>
                            <td class="text-right">${shipping === '0.00' ? 'Free' : '$' + shipping}</td>
                        </tr>
                        <tr>
                            <td class="text_grey"><strong>Total</strong></td>
                            <td class="text-right"><strong class="text-brand">$${total}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    // Show error message
    function showError(message) {
        const errorDiv = document.getElementById('error-message');
        const successDiv = document.getElementById('success-message');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        successDiv.style.display = 'none';
    }

    // Show success message
    function showSuccess(message) {
        const errorDiv = document.getElementById('error-message');
        const successDiv = document.getElementById('success-message');
        successDiv.innerHTML = message;
        successDiv.style.display = 'block';
        errorDiv.style.display = 'none';
    }

    // Handle form submission
    async function handleCheckout(event) {
        event.preventDefault();

        const form = event.target;
        const submitBtn = document.getElementById('place-order-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Processing...';

        // Hide messages
        document.getElementById('error-message').style.display = 'none';
        document.getElementById('success-message').style.display = 'none';

        // Get form data
        const formData = new FormData(form);
        const fullName = formData.get('fullName');
        const emailAddress = formData.get('emailAddress');
        const phoneNumber = formData.get('phoneNumber');
        const streetLine1 = formData.get('streetLine1');
        const streetLine2 = formData.get('streetLine2');
        const city = formData.get('city');
        const province = formData.get('province');
        const postalCode = formData.get('postalCode');
        const countryCode = formData.get('countryCode');

        // Step 1: Set customer (only if not logged in)
        console.log('Setting customer with email:', emailAddress);
        const customerResult = await setCustomerForOrder({
            emailAddress: emailAddress,
            firstName: fullName.split(' ')[0],
            lastName: fullName.split(' ').slice(1).join(' ') || fullName,
            phoneNumber: phoneNumber
        });

        console.log('Customer result:', customerResult);

        // Ignore error if already logged in
        if (!customerResult.success && !customerResult.error.includes('already logged in')) {
            showError('Failed to set customer: ' + customerResult.error);
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Place Order<i class="fi-rs-sign-out ml-15"></i>';
            return;
        }

        // Verify customer was set by checking the order
        const orderAfterCustomer = await getActiveOrder();
        console.log('Order after setting customer:', orderAfterCustomer);
        if (!orderAfterCustomer.customer || !orderAfterCustomer.customer?.emailAddress) {
            console.error('Customer was not set on the order!');
            showError('Failed to set customer information on order. Please ensure you have an account or try again.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Place Order<i class="fi-rs-sign-out ml-15"></i>';
            return;
        }
        console.log('Customer verified on order:', orderAfterCustomer.customer);

        // Step 2: Set shipping address
        const addressData = {
            fullName: fullName,
            streetLine1: streetLine1,
            streetLine2: streetLine2,
            city: city,
            province: province,
            postalCode: postalCode,
            countryCode: countryCode,
            phoneNumber: phoneNumber
        };

        const shippingAddressResult = await setShippingAddress(addressData);

        if (!shippingAddressResult.success) {
            showError('Failed to set shipping address: ' + shippingAddressResult.error);
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Place Order<i class="fi-rs-sign-out ml-15"></i>';
            return;
        }

        // Debug: Check order state after shipping address
        let orderCheck = await getActiveOrder();
        console.log('Order state after shipping address:', orderCheck?.state);

        // Step 3: Set billing address (using same address for simplicity)
        const billingAddressResult = await setBillingAddress(addressData);

        if (!billingAddressResult.success) {
            showError('Failed to set billing address: ' + billingAddressResult.error);
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Place Order<i class="fi-rs-sign-out ml-15"></i>';
            return;
        }

        // Debug: Check order state after billing address
        orderCheck = await getActiveOrder();
        console.log('Order state after billing address:', orderCheck?.state);

        // Step 4: Get and set shipping method
        const shippingMethods = await getShippingMethods();

        if (shippingMethods.length === 0) {
            showError('No shipping methods available');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Place Order<i class="fi-rs-sign-out ml-15"></i>';
            return;
        }

        // Auto-select first shipping method
        const selectedShippingMethod = shippingMethods[0];
        const shippingResult = await setShippingMethod(selectedShippingMethod.id);

        if (!shippingResult.success) {
            showError('Failed to set shipping method: ' + shippingResult.error);
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Place Order<i class="fi-rs-sign-out ml-15"></i>';
            return;
        }

        // Debug: Check order state after shipping method - THIS IS CRITICAL!
        orderCheck = await getActiveOrder();
        console.log('Order state after shipping method:', orderCheck?.state);
        console.log('Full order details:', orderCheck);

        // Check if we need to manually transition to ArrangingPayment
        if (orderCheck?.state === 'AddingItems') {
            console.log('Order still in AddingItems state - attempting manual transition...');
            const transitionResult = await transitionToArrangingPayment();

            if (!transitionResult.success) {
                showError('Failed to transition to payment state: ' + transitionResult.error);
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Place Order<i class="fi-rs-sign-out ml-15"></i>';
                return;
            }

            console.log('Manual transition successful!');
        } else if (orderCheck?.state === 'ArrangingPayment') {
            console.log('Order automatically transitioned to ArrangingPayment - ready for payment!');
        } else {
            console.log('Unexpected order state:', orderCheck?.state);
        }

        // Step 5: Get eligible payment methods and add payment
        const paymentMethods = await getPaymentMethods();
        console.log('Available payment methods:', paymentMethods);

        if (paymentMethods.length === 0) {
            showError('No payment methods available');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Place Order<i class="fi-rs-sign-out ml-15"></i>';
            return;
        }

        // Use the first available payment method (should be dummy-payment-method or similar)
        const selectedPaymentMethod = paymentMethods[0];
        console.log('Using payment method:', selectedPaymentMethod.code);

        const paymentResult = await addPaymentToOrder(selectedPaymentMethod.code, {
            paymentMethod: selectedPaymentMethod.name,
            transactionId: 'TEST-' + Date.now()
        });

        if (!paymentResult.success) {
            showError('Payment failed: ' + paymentResult.error);
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Place Order<i class="fi-rs-sign-out ml-15"></i>';
            return;
        }

        // Success!
        const orderCode = paymentResult.order.code;
        showSuccess(`
            <h4>Order Placed Successfully!</h4>
            <p>Your order code is: <strong>${orderCode}</strong></p>
            <p>Total: <strong>$${formatPrice(paymentResult.order.totalWithTax)}</strong></p>
            <a href="../index.html" class="btn btn-sm btn-success mt-10">Continue Shopping</a>
        `);

        // Update cart count to 0
        if (window.VendureCart) {
            window.VendureCart.updateCartCount(0);
        }

        // Disable form
        form.reset();
        submitBtn.style.display = 'none';
    }

    // Initialize
    async function init() {
        console.log('Loading checkout page...');

        // Load and display order
        const order = await getActiveOrder();
        console.log('Active order:', order);

        if (!order || !order.lines || order.lines.length === 0) {
            window.location.href = '../cart/index.html';
            return;
        }

        displayOrderSummary(order);

        // Attach form handler
        const form = document.getElementById('checkout-form');
        if (form) {
            form.addEventListener('submit', handleCheckout);
        }
    }

    // Run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
