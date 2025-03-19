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

document.addEventListener('DOMContentLoaded', function() {
 // Get the form element
 const addMedicationForm = document.getElementById('addMedicationForm');
 
 // Add event listener for form submission
 addMedicationForm.addEventListener('submit', function(event) {
     // Prevent the default form submission
     event.preventDefault();
     
     // Get form input values
     const medicationName = document.getElementById('newMedicationName').value.trim();
     const medicationStock = parseInt(document.getElementById('newMedicationStock').value);
     const medicationThreshold = parseInt(document.getElementById('newMedicationThreshold').value);
     const medicationExpiry = document.getElementById('newMedicationExpiry').value;
     
     // Validate inputs
     if (!medicationName || isNaN(medicationStock) || isNaN(medicationThreshold) || !medicationExpiry) {
         alert('Please fill in all fields correctly.');
         return;
     }
     
     // Create a medication object
     const medicationData = {
         name: medicationName,
         stock: medicationStock,
         threshold: medicationThreshold,
         expiryDate: medicationExpiry,
         dateAdded: new Date().toISOString()
     };
     
     // Get existing medications from localStorage or initialize empty array
     let medications = [];
     try {
         const storedMedications = localStorage.getItem('medications');
         medications = storedMedications ? JSON.parse(storedMedications) : [];
         
         // Ensure medications is an array
         if (!Array.isArray(medications)) {
             medications = [];
         }
     } catch (error) {
         console.error('Error reading from localStorage:', error);
         medications = [];
     }
     
     // Add new medication to the array
     medications.push(medicationData);
     
     // Save updated medications array back to localStorage
     try {
         localStorage.setItem('medications', JSON.stringify(medications));
         console.log('Medication saved successfully:', medicationData);
         console.log('Current medications in storage:', medications);
         
         // Show success message
         alert('Medication added successfully!');
         
         // Reset the form
         addMedicationForm.reset();
         
         // Update medication list if displayed on the same page
         updateMedicationList();
     } catch (error) {
         console.error('Error saving to localStorage:', error);
         alert('Error saving medication. Please try again.');
     }
 });
 
 // Initial load of medications list
 updateMedicationList();
 
 // Add a test button to verify storage (for debugging)
 const formActions = document.querySelector('.form-actions');
 if (formActions) {
     const testButton = document.createElement('button');
     testButton.type = 'button';
     testButton.className = 'btn-test';
     testButton.textContent = 'Test Storage';
     testButton.style.marginLeft = '10px';
     
     testButton.addEventListener('click', function() {
         const medications = JSON.parse(localStorage.getItem('medications')) || [];
         console.log('Current medications in storage:', medications);
         alert(`Found ${medications.length} medications in storage. Check console for details.`);
     });
     
     formActions.appendChild(testButton);
 }
});

// Function to display medications
function updateMedicationList() {
 // Look for existing medication list element
 let medicationListElement = document.getElementById('medicationList');
 
 // If it doesn't exist, create one
 if (!medicationListElement) {
     const formContainer = document.querySelector('.add-medication-form');
     if (formContainer) {
         medicationListElement = document.createElement('div');
         medicationListElement.id = 'medicationList';
         medicationListElement.className = 'medication-list';
         
         const listTitle = document.createElement('h3');
         listTitle.textContent = 'Current Medications';
         medicationListElement.appendChild(listTitle);
         
         formContainer.parentNode.insertBefore(medicationListElement, formContainer.nextSibling);
     }
 }
 
 if (medicationListElement) {
     // Get medications from localStorage
     let medications = [];
     try {
         medications = JSON.parse(localStorage.getItem('medications')) || [];
     } catch (error) {
         console.error('Error reading from localStorage:', error);
         medications = [];
     }
     
     // Clear current list (except the title)
     const listTitle = medicationListElement.querySelector('h3');
     medicationListElement.innerHTML = '';
     if (listTitle) {
         medicationListElement.appendChild(listTitle);
     }
     
     if (medications.length === 0) {
         const noMedsMessage = document.createElement('p');
         noMedsMessage.textContent = 'No medications in the inventory';
         medicationListElement.appendChild(noMedsMessage);
         return;
     }
     
     // Create a table for medications
     const table = document.createElement('table');
     table.className = 'medications-table';
     
     // Create table header
     const tableHeader = document.createElement('thead');
     tableHeader.innerHTML = `
         <tr>
             <th>Name</th>
             <th>Stock</th>
             <th>Threshold</th>
             <th>Expiry Date</th>
             <th>Actions</th>
         </tr>
     `;
     table.appendChild(tableHeader);
     
     // Create table body
     const tableBody = document.createElement('tbody');
     medications.forEach((medication, index) => {
         const row = document.createElement('tr');
         
         // Format expiry date
         const expiryDate = new Date(medication.expiryDate);
         const formattedExpiry = expiryDate.toLocaleDateString();
         
         // Create status class based on stock vs threshold
         const stockStatus = medication.stock <= medication.threshold ? 'low-stock' : 'in-stock';
         
         row.innerHTML = `
             <td>${medication.name}</td>
             <td class="${stockStatus}">${medication.stock}</td>
             <td>${medication.threshold}</td>
             <td>${formattedExpiry}</td>
             <td>
                 <button class="btn-edit" data-index="${index}">Edit</button>
                 <button class="btn-delete" data-index="${index}">Delete</button>
             </td>
         `;
         
         tableBody.appendChild(row);
     });
     
     table.appendChild(tableBody);
     medicationListElement.appendChild(table);
     
     // Add CSS for the table
     const style = document.createElement('style');
     style.textContent = `
         .medications-table {
             width: 100%;
             border-collapse: collapse;
             margin-top: 20px;
         }
         .medications-table th, .medications-table td {
             padding: 8px;
             border: 1px solid #ddd;
             text-align: left;
         }
         .medications-table th {
             background-color: #f2f2f2;
         }
         .low-stock {
             color: red;
             font-weight: bold;
         }
         .in-stock {
             color: green;
         }
         .btn-edit, .btn-delete {
             margin-right: 5px;
             padding: 3px 8px;
             cursor: pointer;
         }
     `;
     document.head.appendChild(style);
     
     // Add event listeners for edit and delete buttons
     attachMedicationActionListeners();
 }
}

// Attach event listeners to medication action buttons
function attachMedicationActionListeners() {
 // Delete button listeners
 document.querySelectorAll('.btn-delete').forEach(button => {
     button.addEventListener('click', function() {
         const index = parseInt(this.getAttribute('data-index'));
         deleteMedication(index);
     });
 });
 
 // Edit button listeners
 document.querySelectorAll('.btn-edit').forEach(button => {
     button.addEventListener('click', function() {
         const index = parseInt(this.getAttribute('data-index'));
         editMedication(index);
     });
 });
}

// Function to delete a medication
function deleteMedication(index) {
 if (confirm('Are you sure you want to delete this medication?')) {
     let medications = JSON.parse(localStorage.getItem('medications')) || [];
     medications.splice(index, 1);
     localStorage.setItem('medications', JSON.stringify(medications));
     updateMedicationList();
 }
}

// Function to edit a medication
function editMedication(index) {
 // Get medications array
 const medications = JSON.parse(localStorage.getItem('medications')) || [];
 const medication = medications[index];
 
 // Fill the form with existing data
 document.getElementById('newMedicationName').value = medication.name;
 document.getElementById('newMedicationStock').value = medication.stock;
 document.getElementById('newMedicationThreshold').value = medication.threshold;
 document.getElementById('newMedicationExpiry').value = medication.expiryDate;
 
 // Change the form's behavior to update instead of add
 const form = document.getElementById('addMedicationForm');
 const submitButton = form.querySelector('.btn-submit');
 
 // Store the original text
 const originalButtonText = submitButton.textContent;
 
 // Change button text
 submitButton.textContent = 'Update Medication';
 
 // Create a function to handle the update
 const updateHandler = function(event) {
     event.preventDefault();
     
     // Get updated values
     const updatedName = document.getElementById('newMedicationName').value.trim();
     const updatedStock = parseInt(document.getElementById('newMedicationStock').value);
     const updatedThreshold = parseInt(document.getElementById('newMedicationThreshold').value);
     const updatedExpiry = document.getElementById('newMedicationExpiry').value;
     
     // Validate inputs
     if (!updatedName || isNaN(updatedStock) || isNaN(updatedThreshold) || !updatedExpiry) {
         alert('Please fill in all fields correctly.');
         return;
     }
     
     // Update the medication
     medications[index] = {
         name: updatedName,
         stock: updatedStock,
         threshold: updatedThreshold,
         expiryDate: updatedExpiry,
         dateAdded: medication.dateAdded, // Keep the original date added
         lastUpdated: new Date().toISOString()
     };
     
     // Save back to localStorage
     localStorage.setItem('medications', JSON.stringify(medications));
     
     // Reset the form and button
     form.reset();
     submitButton.textContent = originalButtonText;
     
     // Remove this special event handler
     form.removeEventListener('submit', updateHandler);
     
     // Add back the original event handler (it will be re-added by the DOMContentLoaded event)
     // but we need to manually trigger the update
     updateMedicationList();
     
     alert('Medication updated successfully!');
 };
 
 // Remove any existing event listeners and add the update handler
 form.removeEventListener('submit', updateHandler); // Just in case
 form.addEventListener('submit', updateHandler);
}