// API Configuration
const API = 'http://localhost:3000/api/managers';

// DOM Elements
const tbody = document.getElementById('managers-tbody');
const form = document.getElementById('manager-form');
const managerIdInput = document.getElementById('manager-id');
const nameInput = document.getElementById('name');
const rankInput = document.getElementById('rank');
const departmentInput = document.getElementById('department');
const cancelBtn = document.getElementById('cancel-edit');
const submitBtn = document.getElementById('submit-btn');
const formTitle = document.getElementById('form-title');
const refreshBtn = document.getElementById('refresh-btn');
const loading = document.getElementById('loading');
const emptyState = document.getElementById('empty-state');
const managersTable = document.getElementById('managers-table');
const toast = document.getElementById('toast');
const modalOverlay = document.getElementById('modal-overlay');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');

// State
let currentDeleteId = null;
let isLoading = false;

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initializeRankOptions();
    fetchManagers();
    attachEventListeners();
});

// Event Listeners
function attachEventListeners() {
    form.addEventListener('submit', onSubmit);
    cancelBtn.addEventListener('click', resetForm);
    refreshBtn.addEventListener('click', fetchManagers);
    confirmDeleteBtn.addEventListener('click', confirmDelete);
    cancelDeleteBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
}

// Initialize rank dropdown options
function initializeRankOptions() {
    for (let i = 1; i <= 16; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `المرتبة ${i}`;
        rankInput.appendChild(option);
    }
}

// Fetch and display all managers
async function fetchManagers() {
    if (isLoading) return;

    try {
        setLoading(true);
        const response = await fetch(API);

        if (!response.ok) {
            throw new Error('فشل في جلب البيانات');
        }

        const managers = await response.json();
        displayManagers(managers);

    } catch (error) {
        console.error('Error fetching managers:', error);
        showToast('خطأ في جلب قائمة المديرين', 'error');
    } finally {
        setLoading(false);
    }
}

// Display managers in table
function displayManagers(managers) {
    tbody.innerHTML = '';

    if (managers.length === 0) {
        showEmptyState();
        return;
    }

    hideEmptyState();
    managers.forEach(manager => appendManagerRow(manager));
}

// Show/hide loading state
function setLoading(loading) {
    isLoading = loading;

    if (loading) {
        document.getElementById('loading').classList.remove('hidden');
        managersTable.classList.add('hidden');
        emptyState.classList.add('hidden');
        refreshBtn.querySelector('i').classList.add('fa-spin');
    } else {
        document.getElementById('loading').classList.add('hidden');
        managersTable.classList.remove('hidden');
        refreshBtn.querySelector('i').classList.remove('fa-spin');
    }
}

// Show/hide empty state
function showEmptyState() {
    emptyState.classList.remove('hidden');
    managersTable.classList.add('hidden');
}

function hideEmptyState() {
    emptyState.classList.add('hidden');
    managersTable.classList.remove('hidden');
}

// Create and append manager row
function appendManagerRow(manager) {
    const tr = document.createElement('tr');
    tr.dataset.id = manager._id;
    tr.style.opacity = '0';
    tr.style.transform = 'translateY(20px)';

    const initials = manager.name.split(' ').map(n => n[0]).join('').substring(0, 2);
    const formattedDate = new Date(manager.createdAt).toLocaleString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    tr.innerHTML = `
    <td>
      <div class="manager-name">
        <div class="manager-avatar">${initials}</div>
        <span>${manager.name}</span>
      </div>
    </td>
    <td>
      <span class="rank-badge">
        <i class="fas fa-star"></i>
        ${manager.rank}
      </span>
    </td>
    <td>${manager.department}</td>
    <td>${formattedDate}</td>
    <td>
      <div class="actions">
        <button class="action-btn edit-btn" onclick="startEdit('${manager._id}')" title="تعديل">
          <i class="fas fa-edit"></i>
        </button>
        <button class="action-btn delete-btn" onclick="showDeleteModal('${manager._id}')" title="حذف">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </td>
  `;

    tbody.appendChild(tr);

    // Animate row appearance
    setTimeout(() => {
        tr.style.transition = 'all 0.3s ease';
        tr.style.opacity = '1';
        tr.style.transform = 'translateY(0)';
    }, 50);
}

// Update existing manager row
function updateManagerRow(manager) {
    const tr = tbody.querySelector(`tr[data-id="${manager._id}"]`);
    if (!tr) return;

    const initials = manager.name.split(' ').map(n => n[0]).join('').substring(0, 2);

    // Update cells with animation
    tr.style.transform = 'scale(1.02)';
    tr.style.background = 'linear-gradient(135deg, #e6fffa, #b2f5ea)';

    setTimeout(() => {
        tr.children[0].querySelector('span').textContent = manager.name;
        tr.children[0].querySelector('.manager-avatar').textContent = initials;
        tr.children[1].querySelector('.rank-badge').innerHTML = `<i class="fas fa-star"></i> ${manager.rank}`;
        tr.children[2].textContent = manager.department;

        setTimeout(() => {
            tr.style.transform = 'scale(1)';
            tr.style.background = '';
        }, 300);
    }, 150);
}

// Remove manager row
function removeManagerRow(id) {
    const tr = tbody.querySelector(`tr[data-id="${id}"]`);
    if (!tr) return;

    tr.style.transition = 'all 0.3s ease';
    tr.style.transform = 'translateX(100%)';
    tr.style.opacity = '0';

    setTimeout(() => {
        tr.remove();

        // Check if table is empty
        if (tbody.children.length === 0) {
            showEmptyState();
        }
    }, 300);
}

// Form submission handler
async function onSubmit(e) {
    e.preventDefault();

    if (isLoading) return;

    const id = managerIdInput.value;
    const payload = {
        name: nameInput.value.trim(),
        rank: parseInt(rankInput.value),
        department: departmentInput.value.trim(),
    };

    // Validation
    if (!payload.name || !payload.rank || !payload.department) {
        showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }

    try {
        setSubmitLoading(true);

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API}/${id}` : API;

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(id ? 'فشل في تحديث البيانات' : 'فشل في إضافة المدير');
        }

        const manager = await response.json();

        if (id) {
            updateManagerRow(manager);
            showToast('تم تحديث بيانات المدير بنجاح', 'success');
        } else {
            hideEmptyState();
            appendManagerRow(manager);
            showToast('تم إضافة المدير بنجاح', 'success');
        }

        resetForm();

    } catch (error) {
        console.error('Error saving manager:', error);
        showToast(error.message, 'error');
    } finally {
        setSubmitLoading(false);
    }
}

// Set submit button loading state
function setSubmitLoading(loading) {
    if (loading) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>جاري الحفظ...</span>';
    } else {
        submitBtn.disabled = false;
        const isEdit = managerIdInput.value;
        submitBtn.innerHTML = `<i class="fas fa-save"></i> <span>${isEdit ? 'تحديث' : 'حفظ'}</span>`;
    }
}

// Start editing manager
async function startEdit(id) {
    try {
        setLoading(true);

        const response = await fetch(`${API}/${id}`);
        if (!response.ok) {
            throw new Error('المدير غير موجود');
        }

        const manager = await response.json();

        // Populate form
        managerIdInput.value = manager._id;
        nameInput.value = manager.name;
        rankInput.value = manager.rank;
        departmentInput.value = manager.department;

        // Update UI
        formTitle.textContent = 'تعديل المدير';
        formTitle.parentElement.querySelector('i').className = 'fas fa-edit';
        submitBtn.innerHTML = '<i class="fas fa-save"></i> <span>تحديث</span>';
        cancelBtn.classList.remove('hidden');

        // Scroll to form
        document.querySelector('.form-section').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

        // Focus on name input
        nameInput.focus();

    } catch (error) {
        console.error('Error fetching manager:', error);
        showToast('خطأ في جلب بيانات المدير', 'error');
    } finally {
        setLoading(false);
    }
}

// Show delete confirmation modal
function showDeleteModal(id) {
    currentDeleteId = id;
    modalOverlay.classList.remove('hidden');
    setTimeout(() => modalOverlay.classList.add('show'), 10);
}

// Close modal
function closeModal() {
    modalOverlay.classList.remove('show');
    setTimeout(() => {
        modalOverlay.classList.add('hidden');
        currentDeleteId = null;
    }, 300);
}

// Confirm delete
async function confirmDelete() {
    if (!currentDeleteId) return;

    try {
        const response = await fetch(`${API}/${currentDeleteId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('فشل في حذف المدير');
        }

        removeManagerRow(currentDeleteId);
        showToast('تم حذف المدير بنجاح', 'success');
        closeModal();

    } catch (error) {
        console.error('Error deleting manager:', error);
        showToast('خطأ في حذف المدير', 'error');
    }
}

// Reset form to initial state
function resetForm() {
    managerIdInput.value = '';
    form.reset();
    formTitle.textContent = 'إضافة مدير جديد';
    formTitle.parentElement.querySelector('i').className = 'fas fa-plus-circle';
    submitBtn.innerHTML = '<i class="fas fa-save"></i> <span>حفظ</span>';
    cancelBtn.classList.add('hidden');

    // Remove any validation styles
    [nameInput, rankInput, departmentInput].forEach(input => {
        input.style.borderColor = '';
        input.style.boxShadow = '';
    });
}

// Show toast notification
function showToast(message, type = 'success') {
    const toastIcon = toast.querySelector('.toast-icon');
    const toastMessage = toast.querySelector('.toast-message');

    // Set content
    toastMessage.textContent = message;

    // Set type
    toast.className = `toast ${type}`;
    if (type === 'success') {
        toastIcon.className = 'toast-icon fas fa-check-circle';
    } else {
        toastIcon.className = 'toast-icon fas fa-exclamation-circle';
    }

    // Show toast
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('show'), 10);

    // Hide after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 4000);
}

// Add input validation
nameInput.addEventListener('input', validateName);
departmentInput.addEventListener('input', validateDepartment);

function validateName() {
    const value = nameInput.value.trim();
    if (value.length < 2) {
        setInputError(nameInput, 'يجب أن يكون الاسم أكثر من حرفين');
    } else {
        setInputSuccess(nameInput);
    }
}

function validateDepartment() {
    const value = departmentInput.value.trim();
    if (value.length < 2) {
        setInputError(departmentInput, 'يجب أن يكون اسم القسم أكثر من حرفين');
    } else {
        setInputSuccess(departmentInput);
    }
}

function setInputError(input, message) {
    input.style.borderColor = '#e53e3e';
    input.style.boxShadow = '0 0 0 3px rgba(229, 62, 62, 0.1)';
    input.title = message;
}

function setInputSuccess(input) {
    input.style.borderColor = '#38a169';
    input.style.boxShadow = '0 0 0 3px rgba(56, 161, 105, 0.1)';
    input.title = '';
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape key to close modal or cancel edit
    if (e.key === 'Escape') {
        if (!modalOverlay.classList.contains('hidden')) {
            closeModal();
        } else if (!cancelBtn.classList.contains('hidden')) {
            resetForm();
        }
    }

    // Ctrl/Cmd + R to refresh
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        fetchManagers();
    }
});

// Add smooth scrolling for better UX
function smoothScrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Add loading animation to refresh button
refreshBtn.addEventListener('click', () => {
    refreshBtn.querySelector('i').classList.add('fa-spin');
    setTimeout(() => {
        refreshBtn.querySelector('i').classList.remove('fa-spin');
    }, 1000);
});

// Add form animation on focus
[nameInput, rankInput, departmentInput].forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.style.transform = 'translateY(-2px)';
    });

    input.addEventListener('blur', () => {
        input.parentElement.style.transform = 'translateY(0)';
    });
});

// Add table row hover effects
document.addEventListener('mouseover', (e) => {
    if (e.target.closest('tbody tr')) {
        const row = e.target.closest('tbody tr');
        row.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    }
});

document.addEventListener('mouseout', (e) => {
    if (e.target.closest('tbody tr')) {
        const row = e.target.closest('tbody tr');
        row.style.boxShadow = '';
    }
});

// Performance optimization: Debounce input validation
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to validation functions
nameInput.addEventListener('input', debounce(validateName, 300));
departmentInput.addEventListener('input', debounce(validateDepartment, 300));