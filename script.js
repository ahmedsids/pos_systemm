// Menu Data - APNE PRICES YAHAN DALIYE
const menuItems = [
    { id: 1, name: "Chicken Tikka", price: 180, category: "chicken", popular: true },
    { id: 2, name: "Leg Piece", price: 120, category: "chicken" },
    { id: 3, name: "Beef Boti", price: 220, category: "beef", popular: true },
    { id: 4, name: "Paratha", price: 30, category: "bread" },
    { id: 5, name: "Raita", price: 40, category: "sides" },
    { id: 6, name: "Chicken Combo", price: 200, category: "combo", description: "Tikka + Paratha + Raita" },
    { id: 7, name: "Leg Combo", price: 150, category: "combo", description: "Leg + Paratha" },
    { id: 8, name: "Family Pack", price: 600, category: "combo", description: "4 Tikka + 4 Paratha + 2 Raita" }
];

let currentOrder = [];
let dailySales = 0;
let orderCounter = 0;
let itemCounter = 0;
let billNumber = 1;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadMenu();
    updateDateTime();
    setInterval(updateDateTime, 60000);
    loadDailyData();
});

// Load Menu Items
function loadMenu() {
    const menuGrid = document.getElementById('menu-items');
    menuGrid.innerHTML = '';
    
    menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
            ${item.popular ? '<span class="badge">BEST</span>' : ''}
            <h3>${item.name}</h3>
            ${item.description ? `<p class="desc">${item.description}</p>` : ''}
            <div class="menu-price">Rs:${item.price}</div>
            <button onclick="addToOrder(${item.id})">
                <i class="fas fa-plus"></i> ADD TO ORDER
            </button>
        `;
        menuGrid.appendChild(menuItem);
    });
}

// Add Item to Order
function addToOrder(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    const existingItem = currentOrder.find(i => i.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        currentOrder.push({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1
        });
    }
    
    updateOrderDisplay();
    playSound('add');
}

// Update Order Display
function updateOrderDisplay() {
    const orderTable = document.getElementById('order-table');
    orderTable.innerHTML = '';
    
    let subtotal = 0;
    
    currentOrder.forEach((item, index) => {
        const total = item.price * item.quantity;
        subtotal += total;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${item.name}</strong></td>
            <td>
                <div class="qty-controls">
                    <button onclick="changeQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQuantity(${index}, 1)">+</button>
                </div>
            </td>
            <td>Rs:${item.price}</td>
            <td><strong>Rs:${total}</strong></td>
            <td><button class="delete-btn" onclick="removeItem(${index})">🗑️</button></td>
        `;
        orderTable.appendChild(row);
    });
    
    const gst = subtotal * 0.05;
    const grandTotal = subtotal + gst;
    
    document.getElementById('subtotal').textContent = `Rs:${subtotal}`;
    document.getElementById('gst').textContent = `Rs:${gst.toFixed(2)}`;
    document.getElementById('grand-total').textContent = `Rs:${grandTotal.toFixed(2)}`;
}

// Change Quantity
function changeQuantity(index, change) {
    currentOrder[index].quantity += change;
    
    if (currentOrder[index].quantity <= 0) {
        currentOrder.splice(index, 1);
    }
    
    updateOrderDisplay();
}

// Remove Item
function removeItem(index) {
    currentOrder.splice(index, 1);
    updateOrderDisplay();
    playSound('remove');
}

// Print Bill
function printBill() {
    if (currentOrder.length === 0) {
        alert("Please add items to order first!");
        return;
    }
    
    const subtotal = parseFloat(document.getElementById('subtotal').textContent.replace('Rs:', ''));
    const gst = parseFloat(document.getElementById('gst').textContent.replace('Rs:', ''));
    const grandTotal = parseFloat(document.getElementById('grand-total').textContent.replace('Rs:', ''));
    
    // Update daily stats
    dailySales += grandTotal;
    orderCounter += 1;
    itemCounter += currentOrder.reduce((sum, item) => sum + item.quantity, 0);
    
    // Save to localStorage
    saveDailyData();
    
    // Create printable bill
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Bill #${billNumber}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .bill-header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 20px; }
                .bill-item { display: flex; justify-content: space-between; margin: 5px 0; }
                .total { font-size: 20px; font-weight: bold; margin-top: 20px; border-top: 2px solid #000; padding-top: 10px; }
                .thank-you { text-align: center; margin-top: 30px; font-style: italic; }
            </style>
        </head>
        <body>
            <div class="bill-header">
                <h1>🍗 CHICKEN TIKKA STALL</h1>
                <p>Bill No: ${billNumber}</p>
                <p>Date: ${new Date().toLocaleString()}</p>
            </div>
            
            <h3>Order Details:</h3>
            ${currentOrder.map(item => `
                <div class="bill-item">
                    <span>${item.name} x ${item.quantity}</span>
                    <span>Rs:${item.price * item.quantity}</span>
                </div>
            `).join('')}
            
            <div class="total">
                <div class="bill-item">
                    <span>Subtotal:</span>
                    <span>Rs:${subtotal}</span>
                </div>
                <div class="bill-item">
                    <span>GST (5%):</span>
                    <span>Rs:${gst.toFixed(2)}</span>
                </div>
                <div class="bill-item">
                    <span>GRAND TOTAL:</span>
                    <span>Rs:${grandTotal.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="thank-you">
                <p>Thank you for your order! 😊</p>
                <p>Visit again!</p>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
    
    // Increment bill number
    billNumber++;
    document.getElementById('bill-number').textContent = billNumber;
    
    // Update stats display
    updateStatsDisplay();
    
    // Clear current order
    currentOrder = [];
    updateOrderDisplay();
}

// New Order
function newOrder() {
    if (currentOrder.length > 0) {
        if (confirm("Current order will be cleared. Continue?")) {
            currentOrder = [];
            updateOrderDisplay();
        }
    }
}

// Payment Processing
function processPayment() {
    const grandTotal = document.getElementById('grand-total').textContent;
    alert(`Payment of ${grandTotal} received in CASH. Thank you!`);
    printBill();
}

function easypaisa() {
    const grandTotal = document.getElementById('grand-total').textContent;
    alert(`Please scan easypaisa QR code to pay ${grandTotal}`);
    printBill();
}

// Update Date & Time
function updateDateTime() {
    const now = new Date();
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('current-time').textContent = now.toLocaleTimeString('en-IN');
}

// Update Stats Display
function updateStatsDisplay() {
    document.getElementById('daily-sale').textContent = `RS:${dailySales.toFixed(2)}`;
    document.getElementById('order-count').textContent = orderCounter;
    document.getElementById('item-count').textContent = itemCounter;
}

// Save/Load Data
function saveDailyData() {
    const data = {
        dailySales,
        orderCounter,
        itemCounter,
        billNumber
    };
    localStorage.setItem('chickenStallData', JSON.stringify(data));
}

function loadDailyData() {
    const saved = localStorage.getItem('chickenStallData');
    if (saved) {
        const data = JSON.parse(saved);
        dailySales = data.dailySales || 0;
        orderCounter = data.orderCounter || 0;
        itemCounter = data.itemCounter || 0;
        billNumber = data.billNumber || 1001;
        updateStatsDisplay();
        document.getElementById('bill-number').textContent = billNumber;
    }
}

// Sound Effects
function playSound(type) {
    // Simple beep sounds - in real app, use actual sound files
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = type === 'add' ? 800 : 400;
    gainNode.gain.value = 0.1;
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl+P to print
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        printBill();
    }
    // Escape to clear
    if (e.key === 'Escape') {
        newOrder();
    }
    // Number keys for quick add (1-8)
    if (e.key >= '1' && e.key <= '8') {
        const index = parseInt(e.key) - 1;
        if (index < menuItems.length) {
            addToOrder(menuItems[index].id);
        }
    }
});