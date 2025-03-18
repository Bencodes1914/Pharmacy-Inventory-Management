 const inventoryData = [
  {
      id: 1,
      name: "Cold & Flu Medicine (100mg)",
      stock: 3,
      threshold: 5,
      expiryDate: "2025-04-15",
      status: "critical" 
  },
  {
      id: 2,
      name: "Pain Relief Tablets",
      stock: 7,
      threshold: 5,
      expiryDate: "2025-05-20",
      status: "warning" 
  },
  {
      id: 3,
      name: "Allergy Relief Capsules",
      stock: 12,
      threshold: 8,
      expiryDate: "2025-06-10",
      status: "normal" 
  },
  {
      id: 4,
      name: "Cough Syrup",
      stock: 8,
      threshold: 5,
      expiryDate: "2025-05-15",
      status: "normal" 
  },
  {
      id: 5,
      name: "First Aid Antiseptic",
      stock: 4,
      threshold: 5,
      expiryDate: "2025-08-22",
      status: "warning" 
  },
  {
      id: 6,
      name: "Children's Fever Reducer",
      stock: 2,
      threshold: 5,
      expiryDate: "2025-04-30",
      status: "critical" 
  }
];

const expiringItems = [
  { date: "2025-04-15", items: ["Cold & Flu Medicine (100mg)"] },
  { date: "2025-04-30", items: ["Children's Fever Reducer"] },
  { date: "2025-05-15", items: ["Cough Syrup"] },
  { date: "2025-05-20", items: ["Pain Relief Tablets"] }
];

const inventoryTableBody = document.getElementById('inventoryTableBody');
const alertsList = document.getElementById('alertsList');
const calendarGrid = document.getElementById('calendarGrid');
const filterButtons = document.querySelectorAll('.filter-btn');
const reorderModal = document.getElementById('reorderModal');
const closeModal = document.getElementById('closeModal');
const cancelOrder = document.getElementById('cancelOrder');
const reorderForm = document.getElementById('reorderForm');
const toast = document.getElementById('toast');
const medicationNameInput = document.getElementById('medicationName');
const currentStockInput = document.getElementById('currentStock');
const orderQuantityInput = document.getElementById('orderQuantity');

document.addEventListener('DOMContentLoaded', function() {
  populateInventoryTable();
  populateAlertsList();
  populateCalendar(new Date());

  setupEventListeners();
});

function setupEventListeners() {
  filterButtons.forEach(button => {
      button.addEventListener('click', function() {
          const filter = this.getAttribute('data-filter');

          filterButtons.forEach(btn => btn.classList.remove('active'));
          this.classList.add('active');
 
          filterInventoryTable(filter);
      });
  });
  
  closeModal.addEventListener('click', closeReorderModal);
  cancelOrder.addEventListener('click', closeReorderModal);

  reorderForm.addEventListener('submit', function(e) {
      e.preventDefault();

      setTimeout(() => {
          closeReorderModal();
          showToast();
      }, 500);
  });

  document.getElementById('prevMonth').addEventListener('click', navigateCalendar);
  document.getElementById('nextMonth').addEventListener('click', navigateCalendar);
}

function populateInventoryTable(filter = 'all') {
  inventoryTableBody.innerHTML = '';
  
  const filteredInventory = filter === 'all' 
      ? inventoryData 
      : inventoryData.filter(item => item.status === filter);
  
  filteredInventory.forEach(item => {
      const row = document.createElement('tr');

      const expiryDate = new Date(item.expiryDate);
      const formattedDate = expiryDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
      });
      
      row.innerHTML = `
          <td>
              <span class="status-indicator status-${item.status}"></span>
              ${capitalizeFirstLetter(item.status)}
          </td>
          <td>${item.name}</td>
          <td>${item.stock}</td>
          <td>${item.threshold}</td>
          <td>${formattedDate}</td>
          <td>
              <button class="action-btn reorder-btn" data-id="${item.id}">Reorder</button>
          </td>
      `;
      
      inventoryTableBody.appendChild(row);
  });
  
  const reorderButtons = document.querySelectorAll('.reorder-btn');
  reorderButtons.forEach(button => {
      button.addEventListener('click', function() {
          const itemId = parseInt(this.getAttribute('data-id'));
          openReorderModal(itemId);
      });
  });
}

function filterInventoryTable(filter) {
  populateInventoryTable(filter);
}

function populateAlertsList() {
  alertsList.innerHTML = '';

  const criticalItems = inventoryData.filter(item => item.status === 'critical');
  criticalItems.forEach(item => {
      const alertItem = document.createElement('li');
      alertItem.className = 'alert-item';
      alertItem.innerHTML = `
          <div class="alert-title">Low Stock Alert</div>
          <div class="alert-info">${item.name} - ${item.stock} units remaining</div>
          <div class="alert-info">Below threshold of ${item.threshold}</div>
      `;
      alertsList.appendChild(alertItem);
  });

  const today = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(today.getDate() + 30);
  
  const expiringInThirtyDays = inventoryData.filter(item => {
      const expiryDate = new Date(item.expiryDate);
      return expiryDate <= thirtyDaysLater;
  });
  
  expiringInThirtyDays.forEach(item => {
      const alertItem = document.createElement('li');
      alertItem.className = 'alert-item expiring';
      
      const expiryDate = new Date(item.expiryDate);
      const formattedDate = expiryDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
      });
      
      alertItem.innerHTML = `
          <div class="alert-title">Expiring Inventory</div>
          <div class="alert-info">${item.name} - ${item.stock} units</div>
          <div class="alert-info">Expires on ${formattedDate}</div>
      `;
      alertsList.appendChild(alertItem);
  });
}

function populateCalendar(date) {
  calendarGrid.innerHTML = '';

  document.querySelector('.calendar-month').textContent = date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
  });

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  weekdays.forEach(day => {
      const dayElement = document.createElement('div');
      dayElement.className = 'calendar-day';
      dayElement.textContent = day;
      dayElement.style.fontWeight = 'bold';
      calendarGrid.appendChild(dayElement);
  });

  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'calendar-day';
      calendarGrid.appendChild(emptyDay);
  }

  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const dayElement = document.createElement('div');
      dayElement.className = 'calendar-day';
      dayElement.textContent = i;

      const currentDate = new Date(date.getFullYear(), date.getMonth(), i);
      const formattedDate = currentDate.toISOString().split('T')[0];
      
      const hasExpiring = expiringItems.some(item => item.date === formattedDate);
      if (hasExpiring) {
          dayElement.classList.add('has-expiring');

          const expiringItem = expiringItems.find(item => item.date === formattedDate);
          if (expiringItem) {
              dayElement.title = `Expiring: ${expiringItem.items.join(', ')}`;
          }
      }
      
      calendarGrid.appendChild(dayElement);
  }
}

function navigateCalendar() {
  const currentMonth = document.querySelector('.calendar-month').textContent;
  const date = new Date(currentMonth);
  
  if (this.id === 'prevMonth') {
      date.setMonth(date.getMonth() - 1);
  } else {
      date.setMonth(date.getMonth() + 1);
  }
  
  populateCalendar(date);
}

function openReorderModal(itemId) {
  const item = inventoryData.find(item => item.id === itemId);
  
  if (item) {
      medicationNameInput.value = item.name;
      currentStockInput.value = item.stock;
      orderQuantityInput.value = 10; 
      
      reorderModal.style.display = 'flex';
  }
}

function closeReorderModal() {
  reorderModal.style.display = 'none';
}

function showToast() {
  toast.style.display = 'block';
  
  setTimeout(() => {
      toast.style.display = 'none';
  }, 3000);
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}