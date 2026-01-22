// Employees Page Handler
let employees = [];
let editingEmployeeId = null;

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is authenticated
    const token = api.getToken();
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // Initialize page
    initializePage();
});

async function initializePage() {
    // Set up event listeners (don't auto-load employees)
    setupEventListeners();
}

function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', () => {
        api.removeToken();
        window.location.href = '/login.html';
    });

    // Show Employees button (toggle functionality)
    const showEmployeesBtn = document.getElementById('showEmployeesBtn');
    showEmployeesBtn.addEventListener('click', async () => {
        const tableContainer = document.getElementById('tableContainer');
        const actionsColumn = document.getElementById('actionsColumn');
        const emptyState = document.getElementById('emptyState');
        
        // If table is visible, hide it
        if (tableContainer.style.display !== 'none') {
            tableContainer.style.display = 'none';
            actionsColumn.style.display = 'none';
            emptyState.style.display = 'block';
            showEmployeesBtn.innerHTML = '<span class="btn-icon">👁️</span> Show Employees';
        } else {
            // If table is hidden, show it (load employees)
            await loadEmployees();
        }
    });

    // Add Employee button
    const addEmployeeBtn = document.getElementById('addEmployeeBtn');
    addEmployeeBtn.addEventListener('click', async () => {
        await checkPermissionAndOpenModal('C', 'create');
    });

    // Employee form
    const employeeForm = document.getElementById('employeeForm');
    employeeForm.addEventListener('submit', handleEmployeeSubmit);

    // Modal close buttons
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancelBtn');
    const modal = document.getElementById('employeeModal');

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        resetEmployeeForm();
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        resetEmployeeForm();
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
            resetEmployeeForm();
        }
    });

    // Forbidden popup close button
    const closePopupBtn = document.getElementById('closePopupBtn');
    closePopupBtn.addEventListener('click', () => {
        hideForbiddenPopup();
    });
}

async function loadEmployees() {
    try {
        // Show loading state
        const showBtn = document.getElementById('showEmployeesBtn');
        showBtn.disabled = true;
        showBtn.innerHTML = '<span class="btn-icon">⏳</span> Loading...';
        
        // Hide empty state, show table container
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('tableContainer').style.display = 'block';
        document.getElementById('actionsColumn').style.display = 'block';
        
        showLoading();

        // Load employees
        employees = await api.get('/employees/employee-page');

        renderEmployees();
        
        // Reset button to "Hide Employees"
        showBtn.disabled = false;
        showBtn.innerHTML = '<span class="btn-icon">🙈</span> Hide Employees';
        
    } catch (error) {
        // Reset button
        const showBtn = document.getElementById('showEmployeesBtn');
        showBtn.disabled = false;
        showBtn.innerHTML = '<span class="btn-icon">👁️</span> Show Employees';
        
        if (error.status === 401 || error.message.includes('401') || error.message.includes('Unauthorized')) {
            showError('Session expired. Please login again.');
            setTimeout(() => {
                api.removeToken();
                window.location.href = '/login.html';
            }, 2000);
        } else if (error.status === 403 || error.message.includes('403') || error.message.includes('Forbidden')) {
            // Hide table, show empty state
            document.getElementById('tableContainer').style.display = 'none';
            document.getElementById('actionsColumn').style.display = 'none';
            document.getElementById('emptyState').style.display = 'block';
            showForbiddenPopup();
        } else {
            showError('Failed to load employees: ' + error.message);
            document.getElementById('tableContainer').style.display = 'none';
            document.getElementById('actionsColumn').style.display = 'none';
            document.getElementById('emptyState').style.display = 'block';
        }
    }
}

function renderEmployees() {
    const tbody = document.getElementById('employeesTableBody');
    const actionsBody = document.getElementById('actionsBody');
    
    if (employees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="loading">No employees found</td></tr>';
        actionsBody.innerHTML = '';
        return;
    }

    // Render table rows (without actions column)
    tbody.innerHTML = employees.map(employee => `
        <tr data-employee-id="${employee.emp_id}">
            <td>${escapeHtml(employee.emp_name)}</td>
            <td>${escapeHtml(employee.emp_phone)}</td>
            <td>${escapeHtml(employee.emp_gender)}</td>
        </tr>
    `).join('');

    // Render actions column (three dots for each row)
    actionsBody.innerHTML = employees.map(employee => `
        <div class="action-item" data-employee-id="${employee.emp_id}">
            <div class="dropdown">
                <span class="menu-icon" onclick="window.toggleDropdown(this)">⋮</span>
                <div class="dropdown-menu" id="menu-${employee.emp_id}">
                    <button type="button" onclick="window.editEmployee('${employee.emp_id}')" class="edit-btn">Edit</button>
                    <button type="button" onclick="window.deleteEmployee('${employee.emp_id}')" class="delete-btn">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

async function handleEmployeeSubmit(e) {
    e.preventDefault();
    
    const formErrorMessage = document.getElementById('formErrorMessage');
    formErrorMessage.classList.remove('show');

    const employeeId = document.getElementById('employeeId').value;
    const name = document.getElementById('empName').value.trim();
    const phone = document.getElementById('empPhone').value.trim();
    const gender = document.getElementById('empGender').value;

    try {
        if (editingEmployeeId) {
            // Update employee
            await api.put(`/employees/employee-page/${employeeId}`, {
                name,
                phone,
                gender
            });
            
            showSuccess('Employee updated successfully!');
        } else {
            // Create employee
            await api.post('/employees/employee-page', {
                name,
                phone,
                gender
            });
            
            showSuccess('Employee created successfully!');
        }

        // Close modal and reload employees if table is visible
        document.getElementById('employeeModal').classList.remove('show');
        resetEmployeeForm();
        
        // Reload employees if table is already shown
        if (document.getElementById('tableContainer').style.display !== 'none') {
            await loadEmployees();
        }
    } catch (error) {
        // Don't show forbidden on submit - permission was already checked on button click
        formErrorMessage.textContent = error.message || 'An error occurred';
        formErrorMessage.classList.add('show');
    }
}

async function editEmployee(employeeId) {
    const employee = employees.find(emp => emp.emp_id === employeeId);
    if (!employee) return;

    // Check permission first
    await checkPermissionAndEdit('U', 'update', employee);
}

async function deleteEmployee(employeeId) {
    // Check permission first
    try {
        // Make a test DELETE request to check permission
        // Use a dummy UUID that won't exist to just check permission
        await checkPermission('D', 'delete');
        
        // If permission check passes, proceed with confirmation and actual delete
        if (!confirm('Are you sure you want to delete this employee?')) {
            return;
        }

        await api.delete(`/employees/employee-page/${employeeId}`);
        showSuccess('Employee deleted successfully!');
        await loadEmployees();
    } catch (error) {
        if (error.status === 403 || error.message.includes('403') || error.message.includes('Forbidden')) {
            // Show forbidden popup
            showForbiddenPopup();
        } else {
            // Only show error if it's not a permission issue (might be 404 for dummy ID)
            if (error.status !== 404) {
                showError('Failed to delete employee: ' + error.message);
            }
        }
    }
    
    // Close dropdown
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('show');
    });
}

// Check permission before opening modal for Create
async function checkPermissionAndOpenModal(action, actionName) {
    try {
        await checkPermission(action, actionName);
        // If permission check passes, open modal
        openEmployeeModal();
    } catch (error) {
        // Permission check failed, popup already shown
    }
}

// Check permission before opening modal for Edit
async function checkPermissionAndEdit(action, actionName, employee) {
    try {
        await checkPermission(action, actionName);
        // If permission check passes, open edit modal
        editingEmployeeId = employee.emp_id;
        document.getElementById('employeeId').value = employee.emp_id;
        document.getElementById('empName').value = employee.emp_name;
        document.getElementById('empPhone').value = employee.emp_phone;
        document.getElementById('empGender').value = employee.emp_gender;
        document.getElementById('modalTitle').textContent = 'Edit Employee';
        document.getElementById('employeeModal').classList.add('show');
        
        // Close dropdown
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    } catch (error) {
        // Permission check failed, popup already shown
        // Close dropdown
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }
}

// Check permission by making a test request
async function checkPermission(action, actionName) {
    try {
        // Use a dummy UUID for testing (won't exist in DB)
        const dummyId = '00000000-0000-0000-0000-000000000000';
        
        if (action === 'C') {
            // Test Create permission with empty/invalid data
            // Permission is checked by middleware BEFORE validation
            // This will fail validation (400) but permission check happens first
            // If 403, no permission. If 400, has permission but validation failed (which is OK)
            try {
                await api.post('/employees/employee-page', {
                    name: '',
                    phone: '',
                    gender: ''
                });
            } catch (error) {
                // If 403, no permission
                if (error.status === 403 || error.message.includes('403') || error.message.includes('Forbidden')) {
                    showForbiddenPopup();
                    throw error;
                }
                // If 400 (validation error), permission is OK, continue
                // Any other error, assume permission OK
            }
        } else if (action === 'U') {
            // Test Update permission with dummy ID
            // Will get 404 (not found) or 403 (no permission)
            try {
                await api.put(`/employees/employee-page/${dummyId}`, {
                    name: 'test',
                    phone: '+919999999999',
                    gender: 'M'
                });
            } catch (error) {
                if (error.status === 403 || error.message.includes('403') || error.message.includes('Forbidden')) {
                    showForbiddenPopup();
                    throw error;
                }
                // 404 means permission OK but employee doesn't exist (expected)
                // Continue if not 403
            }
        } else if (action === 'D') {
            // Test Delete permission with dummy ID
            // Will get 404 (not found) or 403 (no permission)
            try {
                await api.delete(`/employees/employee-page/${dummyId}`);
            } catch (error) {
                if (error.status === 403 || error.message.includes('403') || error.message.includes('Forbidden')) {
                    showForbiddenPopup();
                    throw error;
                }
                // 404 means permission OK but employee doesn't exist (expected)
                // Continue if not 403
            }
        }
    } catch (error) {
        // Re-throw 403 errors
        if (error.status === 403 || error.message.includes('403') || error.message.includes('Forbidden')) {
            throw error;
        }
    }
}

function openEmployeeModal() {
    resetEmployeeForm();
    document.getElementById('modalTitle').textContent = 'Add Employee';
    document.getElementById('employeeModal').classList.add('show');
}

function hideEmployeeModal() {
    document.getElementById('employeeModal').classList.remove('show');
}

function resetEmployeeForm() {
    editingEmployeeId = null;
    document.getElementById('employeeForm').reset();
    document.getElementById('employeeId').value = '';
    document.getElementById('formErrorMessage').classList.remove('show');
}

function toggleDropdown(element) {
    // Close all other dropdowns
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (menu !== element.nextElementSibling) {
            menu.classList.remove('show');
        }
    });
    
    // Toggle current dropdown
    const menu = element.nextElementSibling;
    menu.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

function showLoading() {
    const tbody = document.getElementById('employeesTableBody');
    const actionsBody = document.getElementById('actionsBody');
    tbody.innerHTML = '<tr><td colspan="3" class="loading">Loading employees...</td></tr>';
    actionsBody.innerHTML = '';
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}

function showSuccess(message) {
    const successMessage = document.getElementById('successMessage');
    successMessage.textContent = message;
    successMessage.classList.add('show');
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 3000);
}

function showForbiddenPopup() {
    const popup = document.getElementById('forbiddenPopup');
    popup.classList.add('show');
}

function hideForbiddenPopup() {
    const popup = document.getElementById('forbiddenPopup');
    popup.classList.remove('show');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions available globally for onclick handlers
window.editEmployee = editEmployee;
window.deleteEmployee = deleteEmployee;
window.toggleDropdown = toggleDropdown;
