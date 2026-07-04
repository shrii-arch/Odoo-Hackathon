// --- CENTRAL STATE & DATA STORAGE SEEDS ---
if (!localStorage.getItem('hrms_users')) {
    localStorage.setItem('hrms_users', JSON.stringify([
        { 
            email: "emp@odoo.com", 
            password: "Password123", 
            role: "Employee", 
            empId: "EMP01", 
            phone: "+91 98765 43210", 
            address: "Kolkata, West Bengal", 
            job: "Junior Software Engineer", 
            salary: "₹65,000 / month",
            documents: "Aadhar_Card.pdf, Offer_Letter.pdf"
        },
        { 
            email: "hr@odoo.com", 
            password: "Password123", 
            role: "HR", 
            empId: "HR01", 
            phone: "+91 99999 88888", 
            address: "New Town, Kolkata", 
            job: "Lead HR Specialist", 
            salary: "₹90,000 / month",
            documents: "NDA_Agreement.pdf"
        }
    ]));
}
if (!localStorage.getItem('hrms_attendance')) {
    localStorage.setItem('hrms_attendance', JSON.stringify([]));
}

let isSignUpMode = false;
let currentUser = null;

// Complete Selector Mappings Object
const UI = {
    authSection: document.getElementById('authSection'),
    employeeDashboard: document.getElementById('employeeDashboard'),
    adminDashboard: document.getElementById('adminDashboard'),
    authForm: document.getElementById('authForm'),
    authTitle: document.getElementById('authTitle'),
    authBtn: document.getElementById('authBtn'),
    toggleLink: document.getElementById('toggleAuthLink'),
    empIdGroup: document.getElementById('empIdGroup'),
    roleGroup: document.getElementById('roleGroup'),
    userStatus: document.getElementById('userStatus'),
    
    // Employee View Profile Management Elements
    lblEmpId: document.getElementById('lblEmpId'),
    lblEmail: document.getElementById('lblEmail'),
    lblPhone: document.getElementById('lblPhone'),
    lblAddress: document.getElementById('lblAddress'),
    lblJob: document.getElementById('lblJob'),
    lblSalary: document.getElementById('lblSalary'),
    lblDocs: document.getElementById('lblDocs'),
    profileViewMode: document.getElementById('profileViewMode'),
    profileEditForm: document.getElementById('profileEditForm'),
    
    // Employee Forms
    txtPhone: document.getElementById('txtPhone'),
    txtAddress: document.getElementById('txtAddress'),
    btnTriggerEdit: document.getElementById('btnTriggerEdit'),
    btnCancelEdit: document.getElementById('btnCancelEdit'),

    // Admin Panel Override Fields
    adminEmployeeSelector: document.getElementById('adminEmployeeSelector'),
    adminMasterEditForm: document.getElementById('adminMasterEditForm'),
    admEmpId: document.getElementById('admEmpId'),
    admPhone: document.getElementById('admPhone'),
    admAddress: document.getElementById('admAddress'),
    admJob: document.getElementById('admJob'),
    admSalary: document.getElementById('admSalary'),
    admDocs: document.getElementById('admDocs'),

    // Attendance Layout Setup
    attendanceStatusType: document.getElementById('attendanceStatusType'),
    checkInBtn: document.getElementById('checkInBtn'),
    checkOutBtn: document.getElementById('checkOutBtn'),
    myAttendanceTable: document.getElementById('myAttendanceTable'),
    adminAttendanceTable: document.getElementById('adminAttendanceTable'),
    employeeActivityFeed: document.getElementById('employeeActivityFeed')
};

// Interface Switcher Utility
UI.toggleLink.addEventListener('click', () => {
    isSignUpMode = !isSignUpMode;
    UI.authTitle.innerText = isSignUpMode ? "Register Account" : "Sign In";
    UI.authBtn.innerText = isSignUpMode ? "Sign Up" : "Sign In";
    UI.empIdGroup.style.display = isSignUpMode ? "block" : "none";
    UI.roleGroup.style.display = isSignUpMode ? "block" : "none";
    clearValidationEffects();
});

// Input Verification Engine
function runInputValidation(email, password, empId) {
    let isValid = true;
    clearValidationEffects();

    const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailFormat.test(email)) {
        triggerFieldInvalid('email', 'Please enter a valid corporate email address.');
        isValid = false;
    }
    if (password.length < 5) {
        triggerFieldInvalid('password', 'Password must be at least 5 characters long.');
        isValid = false;
    }
    if (isSignUpMode && !empId.trim()) {
        triggerFieldInvalid('empId', 'Employee ID configuration is required.');
        isValid = false;
    }
    return isValid;
}

function triggerFieldInvalid(fieldId, msg) {
    document.getElementById(fieldId).classList.add('invalid');
    document.getElementById(`${fieldId}Error`).innerText = msg;
}

function clearValidationEffects() {
    ['email', 'password', 'empId'].forEach(id => {
        const field = document.getElementById(id);
        if (field) field.classList.remove('invalid');
        const textLabel = document.getElementById(`${id}Error`);
        if (textLabel) textLabel.innerText = '';
    });
}

// Global Authentication Process
UI.authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role = UI.roleGroup.querySelector('select').value;
    const empId = document.getElementById('empId').value.trim();

    if (!runInputValidation(email, password, empId)) return;

    let dbUsers = JSON.parse(localStorage.getItem('hrms_users'));

    if (isSignUpMode) {
        if (dbUsers.some(u => u.email === email)) {
            triggerFieldInvalid('email', 'Profile with this email already exists.');
            return;
        }
        dbUsers.push({ 
            email, password, role, empId, 
            phone: "Not Set", address: "Not Set", 
            job: "Junior Developer", salary: "₹50,000 / month",
            documents: "Registration_Form.pdf"
        });
        localStorage.setItem('hrms_users', JSON.stringify(dbUsers));
        alert("Registration saved! Please sign in.");
        UI.toggleLink.click();
    } else {
        const userMatch = dbUsers.find(u => u.email === email && u.password === password);
        if (userMatch) {
            currentUser = userMatch;
            UI.userStatus.innerText = `Session: ${currentUser.email}`;
            UI.authSection.style.display = "none";
            
            if (currentUser.role === "Employee") {
                launchEmployeePortal();
            } else {
                launchAdminPortal();
            }
        } else {
            alert("Authentication Failure: Invalid credentials match.");
        }
    }
});

// 3.3.2 EMPLOYEE PROFILE EDIT (Limited Fields)
UI.btnTriggerEdit.addEventListener('click', () => {
    UI.txtPhone.value = currentUser.phone || '';
    UI.txtAddress.value = currentUser.address || '';
    UI.profileViewMode.style.display = "none";
    UI.profileEditForm.style.display = "block";
});

UI.btnCancelEdit.addEventListener('click', () => {
    UI.profileViewMode.style.display = "block";
    UI.profileEditForm.style.display = "none";
});

UI.profileEditForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let dbUsers = JSON.parse(localStorage.getItem('hrms_users'));
    let userIdx = dbUsers.findIndex(u => u.email === currentUser.email);
    
    if (userIdx !== -1) {
        dbUsers[userIdx].phone = UI.txtPhone.value.trim();
        dbUsers[userIdx].address = UI.txtAddress.value.trim();
        
        currentUser = dbUsers[userIdx];
        localStorage.setItem('hrms_users', JSON.stringify(dbUsers));
        
        renderProfilePanel();
        pushActivityLog("Profile phone and address updated.");
        UI.btnCancelEdit.click();
    }
});

function renderProfilePanel() {
    UI.lblEmpId.innerText = currentUser.empId || "N/A";
    UI.lblEmail.innerText = currentUser.email;
    UI.lblPhone.innerText = currentUser.phone || "Not Set";
    UI.lblAddress.innerText = currentUser.address || "Not Set";
    UI.lblJob.innerText = currentUser.job || "Corporate Specialist";
    UI.lblSalary.innerText = currentUser.salary || "₹75,000 / month";
    UI.lblDocs.innerText = currentUser.documents || "No Documents Uploaded";
}

// 3.3.2 ADMINISTRATIVE MASTER OVERRIDE HUB (Can Edit All Details)
function setupAdminProfileEditor() {
    let dbUsers = JSON.parse(localStorage.getItem('hrms_users'));
    UI.adminEmployeeSelector.innerHTML = "";
    
    let employeesOnly = dbUsers.filter(u => u.role === "Employee");
    
    if (employeesOnly.length === 0) {
        UI.adminEmployeeSelector.innerHTML = "<option>No employees found</option>";
        return;
    }
    
    employeesOnly.forEach(emp => {
        UI.adminEmployeeSelector.innerHTML += `<option value="${emp.email}">${emp.empId} - ${emp.email}</option>`;
    });

    UI.adminEmployeeSelector.addEventListener('change', populateAdminOverrideFields);
    populateAdminOverrideFields();
}

function populateAdminOverrideFields() {
    let dbUsers = JSON.parse(localStorage.getItem('hrms_users'));
    let targetEmail = UI.adminEmployeeSelector.value;
    let match = dbUsers.find(u => u.email === targetEmail);
    
    if (match) {
        UI.admEmpId.value = match.empId || "";
        UI.admPhone.value = match.phone || "";
        UI.admAddress.value = match.address || "";
        UI.admJob.value = match.job || "";
        UI.admSalary.value = match.salary || "";
        UI.admDocs.value = match.documents || "";
    }
}

UI.adminMasterEditForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let dbUsers = JSON.parse(localStorage.getItem('hrms_users'));
    let targetEmail = UI.adminEmployeeSelector.value;
    let idx = dbUsers.findIndex(u => u.email === targetEmail);
    
    if (idx !== -1) {
        // Admin updates absolutely ALL parameters comprehensively
        dbUsers[idx].empId = UI.admEmpId.value.trim();
        dbUsers[idx].phone = UI.admPhone.value.trim();
        dbUsers[idx].address = UI.admAddress.value.trim();
        dbUsers[idx].job = UI.admJob.value.trim();
        dbUsers[idx].salary = UI.admSalary.value.trim();
        dbUsers[idx].documents = UI.admDocs.value.trim();
        
        localStorage.setItem('hrms_users', JSON.stringify(dbUsers));
        alert(`Admin Success: All fields for ${targetEmail} have been fully overridden.`);
        setupAdminProfileEditor(); // Refresh selector display options
    }
});

function pushActivityLog(textMessage) {
    const timeStamp = new Date().toLocaleTimeString();
    UI.employeeActivityFeed.innerHTML = `<li class="activity-item">⏱️ [${timeStamp}] ${textMessage}</li>` + UI.employeeActivityFeed.innerHTML;
}

// 3.4 ATTENDANCE TRACKING
UI.checkInBtn.addEventListener('click', () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const requestedStatus = UI.attendanceStatusType.value;
    let records = JSON.parse(localStorage.getItem('hrms_attendance'));
    
    records.push({
        date: todayStr,
        status: requestedStatus,
        empId: currentUser.empId || "N/A",
        email: currentUser.email
    });
    
    localStorage.setItem('hrms_attendance', JSON.stringify(records));
    pushActivityLog(`Clock-in registered successfully as: [${requestedStatus}]`);
    UI.checkInBtn.disabled = true;
    UI.checkOutBtn.disabled = false;
    renderEmployeeTables();
});

UI.checkOutBtn.addEventListener('click', () => {
    pushActivityLog(`Clock-out sequence executed successfully.`);
    UI.checkInBtn.disabled = false;
    UI.checkOutBtn.disabled = true;
});

function renderEmployeeTables() {
    UI.myAttendanceTable.innerHTML = "";
    let logs = JSON.parse(localStorage.getItem('hrms_attendance'));
    const matchedLogs = logs.filter(log => log.email === currentUser.email);
    
    matchedLogs.forEach(item => {
        let badgeClass = item.status.toLowerCase().replace(' ', '-');
        UI.myAttendanceTable.innerHTML += `<tr>
            <td>${item.date}</td>
            <td><span class="status-badge ${badgeClass}">${item.status}</span></td>
        </tr>`;
    });
}

// MASTER DASHBOARD VIEW REVEALS
function launchEmployeePortal() {
    UI.employeeDashboard.style.display = "block";
    renderProfilePanel();
    renderEmployeeTables();
}

function launchAdminPortal() {
    UI.adminDashboard.style.display = "block";
    setupAdminProfileEditor();
    UI.adminAttendanceTable.innerHTML = "";
    let logs = JSON.parse(localStorage.getItem('hrms_attendance'));
    
    logs.forEach(item => {
        let badgeClass = item.status.toLowerCase().replace(' ', '-');
        UI.adminAttendanceTable.innerHTML += `<tr>
            <td><strong>${item.empId}</strong></td>
            <td>${item.email}</td>
            <td>${item.date}</td>
            <td><span class="status-badge ${badgeClass}">${item.status}</span></td>
        </tr>`;
    });
}

// Logout Engine
document.querySelectorAll('.logoutBtn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentUser = null;
        UI.userStatus.innerText = "Not logged in";
        UI.employeeDashboard.style.display = "none";
        UI.adminDashboard.style.display = "none";
        UI.authSection.style.display = "block";
        UI.authForm.reset();
        clearValidationEffects();
    });
});