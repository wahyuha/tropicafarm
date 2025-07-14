// Cart functionality with localStorage and TTL (7 days)
class Cart {
    constructor() {
        this.cartKey = 'tropicafarm_cart';
        this.cart = this.loadCart();
        this.setupEventListeners();
        this.updateCartUI();
    }

    // Load cart from localStorage with TTL check
    loadCart() {
        const cartData = localStorage.getItem(this.cartKey);
        if (!cartData) return [];

        try {
            const { items, timestamp } = JSON.parse(cartData);
            const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
            
            // If cart is older than 7 days, clear it
            if (Date.now() - timestamp > sevenDaysInMs) {
                this.clearCart();
                return [];
            }
            
            return items || [];
        } catch (e) {
            console.error('Error loading cart:', e);
            return [];
        }
    }

    // Save cart to localStorage with current timestamp
    saveCart() {
        const cartData = {
            items: this.cart,
            timestamp: Date.now()
        };
        localStorage.setItem(this.cartKey, JSON.stringify(cartData));
        this.updateCartUI();
    }

    // Add item to cart
    addItem(product) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += product.quantity || 1;
        } else {
            this.cart.push({
                ...product,
                quantity: product.quantity || 1,
                addedAt: Date.now()
            });
        }
        
        this.saveCart();
        this.showNotification('Item added to cart');
    }

    // Remove item from cart
    removeItem(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
    }

    // Update item quantity
    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.saveCart();
        }
    }

    // Clear the cart
    clearCart() {
        this.cart = [];
        localStorage.removeItem(this.cartKey);
        this.updateCartUI();
    }

    // Get cart total
    getTotal() {
        return this.cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    // Update cart UI
    updateCartUI() {
        // Badge
        const cartBadge = document.getElementById('cartBadge');
        // Drawer elements
        const cartItemsDrawer = document.getElementById('cartItemsDrawer');
        const cartSummaryDrawer = document.getElementById('cartSummaryDrawer');
        const emptyCartMessageDrawer = document.getElementById('emptyCartMessageDrawer');
        const cartTotalDrawer = document.getElementById('cartTotalDrawer');

        // Old dropdown elements (for backward compatibility, but not used)
        // const cartItems = document.getElementById('cartItems');
        // const cartSummary = document.getElementById('cartSummary');
        // const emptyCartMessage = document.getElementById('emptyCartMessage');
        // const cartTotal = document.getElementById('cartTotal');

        // Update badge
        if (cartBadge) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartBadge.textContent = totalItems;
            cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
        }

        // Update drawer cart items
        if (cartItemsDrawer) {
            if (this.cart.length === 0) {
                cartItemsDrawer.innerHTML = '<p class="text-gray-500 text-sm text-center py-4" id="emptyCartMessageDrawer">Your cart is empty</p>';
                if (cartSummaryDrawer) cartSummaryDrawer.classList.add('hidden');
                if (emptyCartMessageDrawer) emptyCartMessageDrawer.style.display = 'block';
            } else {
                cartItemsDrawer.innerHTML = this.cart.map(item => `
                    <div class="flex items-center py-3 border-b border-gray-100">
                        <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-cover rounded">
                        <div class="ml-3 flex-1">
                            <h4 class="text-sm font-medium text-gray-900 truncate">${item.name}</h4>
                            <div class="flex items-center justify-between mt-1">
                                <span class="text-sm text-gray-500">${item.quantity} x $${item.price.toFixed(2)}</span>
                                <span class="text-sm font-medium">$${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        </div>
                        <button onclick="cart.removeItem('${item.id}')" class="ml-2 text-gray-400 hover:text-red-500">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('');
                if (cartSummaryDrawer) cartSummaryDrawer.classList.remove('hidden');
                if (emptyCartMessageDrawer) emptyCartMessageDrawer.style.display = 'none';
            }
        }
        // Update drawer total
        if (cartTotalDrawer) {
            cartTotalDrawer.textContent = `$${this.getTotal().toFixed(2)}`;
        }
    }

    // Show notification
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-transform duration-300 translate-y-2 opacity-0';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Trigger reflow
        notification.offsetHeight;
        
        // Show notification
        notification.classList.remove('translate-y-2', 'opacity-0');
        notification.classList.add('translate-y-0', 'opacity-100');
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('translate-y-0', 'opacity-100');
            notification.classList.add('translate-y-2', 'opacity-0');
            
            // Remove from DOM after animation
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Setup event listeners
    setupEventListeners() {
        // Drawer logic
        const cartIcon = document.getElementById('headerCart');
        const cartDrawer = document.getElementById('cartDrawer');
        const cartOverlay = document.getElementById('cartOverlay');
        const closeCartDrawer = document.getElementById('closeCartDrawer');

        if (cartIcon && cartDrawer && cartOverlay) {
            cartIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                cartDrawer.classList.add('show');
                cartOverlay.classList.add('show');
                document.body.style.overflow = 'hidden';
            });
        }
        if (closeCartDrawer && cartDrawer && cartOverlay) {
            closeCartDrawer.addEventListener('click', () => {
                cartDrawer.classList.remove('show');
                cartOverlay.classList.remove('show');
                document.body.style.overflow = '';
            });
        }
        if (cartOverlay && cartDrawer) {
            cartOverlay.addEventListener('click', () => {
                cartDrawer.classList.remove('show');
                cartOverlay.classList.remove('show');
                document.body.style.overflow = '';
            });
        }
    }
}

// Initialize cart
const cart = new Cart();

// Expose cart to window for inline event handlers
window.cart = cart;

// Proceed to checkout
function proceedToCheckout() {
    if (cart.cart.length === 0) return;

    // Compose WhatsApp message
    let message = 'Hello TropicaFarm, I would like to place an order:%0A%0AItems:';
    cart.cart.forEach(item => {
        message += `%0A- ${item.name} x ${item.quantity} ($${(item.price * item.quantity).toFixed(2)})`;
    });
    message += `%0A%0ATotal: $${cart.getTotal().toFixed(2)}`;
    message += `%0A%0ACould you please provide information about shipment and payment options?`;

    // WhatsApp redirect
    const waUrl = `https://wa.me/6282246632200?text=${message}`;
    window.open(waUrl, '_blank');

    cart.clearCart();
}

// Make sure to update cart UI when page loads
document.addEventListener('DOMContentLoaded', () => {
    cart.updateCartUI();
});
