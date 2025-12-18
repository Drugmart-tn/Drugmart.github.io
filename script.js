// Global Variables
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Update cart count
    updateCartCount();
    
    // Initialize mobile menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            mobileMenuBtn.innerHTML = navMenu.classList.contains('active') ? 
                '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
    }
    
    // Setup product quantity controls
    setupQuantityControls();
    
    // Setup add to cart buttons
    setupAddToCartButtons();
    
    // Setup category navigation
    setupCategoryNavigation();
    
    // Setup FAQ accordion
    setupFAQ();
    
    // Setup checkout if on cart page
    if (document.getElementById('checkoutBtn')) {
        setupCheckout();
    }
    
    // Load cart if on cart page
    if (document.getElementById('cartItems')) {
        loadCart();
        updateCartSummary();
    }
    
    // Setup theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-theme');
            const icon = this.querySelector('.fa-moon');
            if (icon) {
                icon.classList.toggle('fa-sun');
            }
        });
    }
    
    // Create particles for hero section
    if (document.getElementById('heroParticles')) {
        createParticles();
    }
});

// Quantity Controls
function setupQuantityControls() {
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            const isMinus = this.classList.contains('minus');
            const quantityElement = document.querySelector(`.quantity[data-id="${id}"]`);
            
            if (quantityElement) {
                let quantity = parseInt(quantityElement.textContent);
                
                if (isMinus && quantity > 1) {
                    quantity--;
                } else if (!isMinus && quantity < 10) {
                    quantity++;
                }
                
                quantityElement.textContent = quantity;
                
                // Update cart if item is already in cart
                const cartItem = cart.find(item => item.id == id);
                if (cartItem) {
                    cartItem.quantity = quantity;
                    saveCart();
                    updateCartCount();
                }
            }
        });
    });
}

// Add to Cart
function setupAddToCartButtons() {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            const name = this.dataset.name;
            const price = parseFloat(this.dataset.price);
            const quantityElement = document.querySelector(`.quantity[data-id="${id}"]`);
            const quantity = quantityElement ? parseInt(quantityElement.textContent) : 1;
            
            addToCart(id, name, price, quantity);
            
            // Update button appearance
            this.innerHTML = '<i class="fas fa-check"></i> Added to Cart';
            this.classList.add('added');
            
            // Reset after 2 seconds
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Cart';
                this.classList.remove('added');
            }, 2000);
        });
    });
}

function addToCart(id, name, price, quantity) {
    const existingItem = cart.find(item => item.id == id);
    
    if (existingItem) {
        existingItem.quantity = quantity;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            quantity: quantity
        });
    }
    
    saveCart();
    updateCartCount();
    showNotification(`${name} added to cart!`, 'success');
}

// Cart Functions
function loadCart() {
    const container = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (cart.length === 0) {
        if (emptyCart) emptyCart.style.display = 'block';
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }
    
    if (emptyCart) emptyCart.style.display = 'none';
    if (checkoutBtn) checkoutBtn.disabled = false;
    
    cart.forEach(item => {
        const cartItem = createCartItem(item);
        container.appendChild(cartItem);
    });
}

function createCartItem(item) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    
    // Determine product image based on ID
    let imageSrc = 'images/';
    switch(parseInt(item.id)) {
        case 1: imageSrc += 'green_leaves.jpg'; break;
        case 2: imageSrc += 'purple_water.jpg'; break;
        case 3: imageSrc += 'white_pills.jpg'; break;
        case 4: imageSrc += 'sugar_sachets.jpg'; break;
        case 5: imageSrc += 'wellness_bundle.jpg'; break;
        case 6: imageSrc += 'premium_leaves.jpg'; break;
        default: imageSrc = '';
    }
    
    div.innerHTML = `
        <div class="cart-item-image">
            <img src="${imageSrc}" alt="${item.name}" onerror="this.style.display='none'">
        </div>
        <div class="cart-item-details">
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-price">$${item.price.toFixed(2)} × ${item.quantity}</div>
            <div class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    return div;
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id != id);
    saveCart();
    loadCart();
    updateCartSummary();
    updateCartCount();
    showNotification('Item removed from cart', 'warning');
}

function updateCartSummary() {
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');
    
    if (!subtotalElement || !shippingElement || !totalElement) return;
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 50 ? 0 : 5;
    const total = subtotal + shipping;
    
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    shippingElement.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;
}

function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Category Navigation
function setupCategoryNavigation() {
    const categoryLinks = document.querySelectorAll('.category-link');
    
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active link
            categoryLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Scroll to category
            const targetId = this.getAttribute('href').substring(1);
            if (targetId === 'all') {
                // Show all categories
                document.querySelectorAll('.product-category').forEach(cat => {
                    cat.style.display = 'block';
                });
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // Show specific category and scroll to it
                document.querySelectorAll('.product-category').forEach(cat => {
                    cat.style.display = 'none';
                });
                const targetCategory = document.getElementById(targetId);
                if (targetCategory) {
                    targetCategory.style.display = 'block';
                    targetCategory.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

// FAQ Accordion
function setupFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const icon = this.querySelector('i');
            
            // Toggle current answer
            answer.classList.toggle('active');
            
            // Rotate icon
            if (icon) {
                icon.style.transform = answer.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0)';
            }
            
            // Close other answers
            faqQuestions.forEach(q => {
                if (q !== this) {
                    const otherAnswer = q.nextElementSibling;
                    const otherIcon = q.querySelector('i');
                    otherAnswer.classList.remove('active');
                    if (otherIcon) {
                        otherIcon.style.transform = 'rotate(0)';
                    }
                }
            });
        });
    });
}

// Checkout System
function setupCheckout() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    const checkoutModal = document.getElementById('checkoutModal');
    const closeModal = document.querySelector('.close-modal');
    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    const eftDetails = document.getElementById('eftDetails');
    const checkoutForm = document.getElementById('checkoutForm');
    
    if (checkoutBtn && checkoutModal) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                showNotification('Your cart is empty!', 'error');
                return;
            }
            checkoutModal.style.display = 'flex';
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            checkoutModal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === checkoutModal) {
            checkoutModal.style.display = 'none';
        }
    });
    
    // Show EFT details when EFT option is selected
    paymentOptions.forEach(option => {
        option.addEventListener('change', function() {
            if (this.value === 'eft') {
                eftDetails.style.display = 'block';
            } else {
                eftDetails.style.display = 'none';
            }
        });
    });
    
    // Handle form submission
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                address: document.getElementById('address').value,
                apartment: document.getElementById('apartment').value,
                city: document.getElementById('city').value,
                zip: document.getElementById('zip').value,
                phone: document.getElementById('phone').value,
                payment: document.querySelector('input[name="payment"]:checked').value
            };
            
            // Validate form
            if (!formData.name || !formData.email || !formData.address || !formData.city || !formData.zip || !formData.phone) {
                showNotification('Please fill all required fields', 'error');
                return;
            }
            
            // Process order
            processOrder(formData);
        });
    }
}

function processOrder(formData) {
    const orderId = 'WE-' + Math.floor(Math.random() * 1000000);
    
    // Clear cart
    cart = [];
    saveCart();
    updateCartCount();
    
    // Close checkout modal
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.style.display = 'none';
    }
    
    // Show confirmation
    const confirmationModal = document.getElementById('confirmationModal');
    const orderIdElement = document.getElementById('orderId');
    
    if (confirmationModal && orderIdElement) {
        orderIdElement.textContent = orderId;
        confirmationModal.style.display = 'flex';
    }
    
    // Update cart page if open
    if (document.getElementById('cartItems')) {
        loadCart();
        updateCartSummary();
    }
    
    // Show success message
    showNotification(`Order #${orderId} confirmed! Thank you for your purchase.`, 'success');
}

// Particles Animation
function createParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;
    
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 4 + 1;
        const duration = Math.random() * 15 + 10;
        const delay = Math.random() * 5;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: var(--primary);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            opacity: ${Math.random() * 0.3 + 0.1};
            animation: floatParticle ${duration}s linear ${delay}s infinite;
        `;
        
        container.appendChild(particle);
    }
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatParticle {
            0% {
                transform: translate(0, 0) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: ${Math.random() * 0.3 + 0.1};
            }
            90% {
                opacity: ${Math.random() * 0.3 + 0.1};
            }
            100% {
                transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Utility Functions
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'warning' ? 'fa-exclamation-triangle' : 'fa-exclamation-circle';
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success)' : 
                    type === 'warning' ? 'var(--warning)' : 'var(--danger)'};
        color: var(--bg-primary);
        padding: 1rem 1.5rem;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 3000;
        animation: slideIn 0.3s ease;
        box-shadow: var(--shadow);
        font-weight: bold;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Contact form (for contact.html)
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
            contactForm.reset();
        });
    }
});// Cart-specific functionality
function setupCheckout() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    const checkoutModal = document.getElementById('checkoutModal');
    const closeModal = document.querySelector('.close-modal');
    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    const eftDetails = document.getElementById('eftDetails');
    const checkoutForm = document.getElementById('checkoutForm');
    const continueShoppingBtn = document.getElementById('continueShopping');
    const printReceiptBtn = document.getElementById('printReceipt');
    
    // Checkout button click
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                showNotification('Your cart is empty! Add products first.', 'error');
                return;
            }
            
            // Update order review
            updateOrderReview();
            
            // Show checkout modal
            checkoutModal.style.display = 'flex';
        });
    }
    
    // Close modal
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            checkoutModal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === checkoutModal || e.target === document.getElementById('confirmationModal')) {
            checkoutModal.style.display = 'none';
            document.getElementById('confirmationModal').style.display = 'none';
        }
    });
    
    // Payment method toggle
    if (paymentOptions && eftDetails) {
        paymentOptions.forEach(option => {
            option.addEventListener('change', function() {
                if (this.value === 'eft') {
                    eftDetails.style.display = 'block';
                } else {
                    eftDetails.style.display = 'none';
                }
            });
        });
    }
    
    // Checkout form submission
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                apartment: document.getElementById('apartment').value,
                city: document.getElementById('city').value,
                zip: document.getElementById('zip').value,
                country: document.getElementById('country').value,
                payment: document.querySelector('input[name="payment"]:checked').value
            };
            
            // Validate form
            if (!formData.name || !formData.email || !formData.phone || 
                !formData.address || !formData.city || !formData.zip || !formData.country) {
                showNotification('Please fill all required fields', 'error');
                return;
            }
            
            // Process order
            processOrder(formData);
        });
    }
    
    // Continue shopping button
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', function() {
            document.getElementById('confirmationModal').style.display = 'none';
            window.location.href = 'products.html';
        });
    }
    
    // Print receipt button
    if (printReceiptBtn) {
        printReceiptBtn.addEventListener('click', function() {
            window.print();
        });
    }
}

function updateOrderReview() {
    const orderReview = document.getElementById('orderReview');
    if (!orderReview) return;
    
    let html = '';
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 50 ? 0 : 5;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;
    
    // Add cart items
    cart.forEach(item => {
        html += `
            <div class="order-review-item">
                <span>${item.name} (${item.quantity})</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `;
    });
    
    // Add totals
    html += `
        <div class="order-review-item">
            <span>Subtotal</span>
            <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="order-review-item">
            <span>Shipping</span>
            <span>${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</span>
        </div>
        <div class="order-review-item">
            <span>Tax (8%)</span>
            <span>$${tax.toFixed(2)}</span>
        </div>
        <div class="order-review-item">
            <strong>Total</strong>
            <strong>$${total.toFixed(2)}</strong>
        </div>
    `;
    
    orderReview.innerHTML = html;
}

function processOrder(formData) {
    // Generate order ID
    const orderId = 'WE-' + Date.now().toString().slice(-6);
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 50 ? 0 : 5;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    
    // Update confirmation modal
    document.getElementById('orderId').textContent = orderId;
    document.getElementById('paymentMethod').textContent = 
        formData.payment === 'cod' ? 'Cash on Delivery' : 'Electronic Funds Transfer';
    document.getElementById('orderTotal').textContent = `$${total.toFixed(2)}`;
    
    // Set delivery date (3-5 days from now)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    const formattedDate = deliveryDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
    });
    document.getElementById('deliveryDate').textContent = formattedDate;
    
    // Clear cart
    cart = [];
    saveCart();
    updateCartCount();
    
    // Close checkout modal and show confirmation
    document.getElementById('checkoutModal').style.display = 'none';
    document.getElementById('confirmationModal').style.display = 'flex';
    
    // Update cart display
    if (document.getElementById('cartItems')) {
        loadCart();
        updateCartSummary();
    }
    
    // Show success notification
    showNotification(`Order #${orderId} confirmed! Thank you for your purchase.`, 'success');
}

// Load cart when page loads
if (document.getElementById('cartItems')) {
    // Call setupCheckout after DOM loads
    setTimeout(() => {
        setupCheckout();
    }, 100);
}

// Update cart summary
function updateCartSummary() {
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (!subtotalElement || !shippingElement || !taxElement || !totalElement) return;
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 50 ? 0 : 5;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;
    
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    shippingElement.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    taxElement.textContent = `$${tax.toFixed(2)}`;
    totalElement.textContent = `$${total.toFixed(2)}`;
    
    // Enable/disable checkout button
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
    }
}