// --- CENTRAL LOCAL STORAGE INITIALIZATION ENGINE ---
if (!localStorage.getItem('hrms_users')) {
    localStorage.setItem('hrms_users', JSON.stringify([
        { email: "emp@odoo.com", password: "Password123", role: "Employee", empId: "EMP01" },
        { email: "hr@odoo.com", password: "Password123", role: "HR", empId: "HR01" }
    ]));
}
if (!localStorage.getItem('hrms_attendance')) {
    localStorage.setItem('hrms_attendance', JSON.stringify([]));
}

let isSignUpMode = false;
let currentUser = null;

// Element Layout Selectors Matrix
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
    empEmailDisplay: document.getElementById('empEmailDisplay'),
    todayStatus: document.getElementById('todayStatus'),
    checkInBtn: document.getElementById('checkInBtn'),
    checkOutBtn: document.getElementById('checkOutBtn'),
    myAttendanceTable: document.getElementById('myAttendanceTable'),
    adminAttendanceTable: document.getElementById('adminAttendanceTable')
};

// Interface Switcher (Sign In vs Sign Up Screen)
UI.toggleLink.addEventListener('click', () => {
    isSignUpMode = !isSignUpMode;
    UI.authTitle.innerText = isSignUpMode ? "Register Account" : "Sign In";
    UI.authBtn.innerText = isSignUpMode ? "Sign Up" : "Sign In";
    UI.empIdGroup.style.display = isSignUpMode ? "block" : "none";
    UI.roleGroup.style.display = isSignUpMode ? "block" : "none";
    clearValidationEffects();
});

// Input Validator Framework
function runInputValidation(email, password, empId) {
    let isValid = true;
    clearValidationEffects();

    const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailFormat.test(email)) {
        triggerFieldInvalid('email', 'Please provide a valid corporate email structure.');
        isValid = false;
    }
    if (password.length < 5) {
        triggerFieldInvalid('password', 'Security rule: Minimum 5 characters required.');
        isValid = false;
    }
    if (isSignUpMode && !empId.trim()) {
        triggerFieldInvalid('empId', 'Operational rule: Employee ID is mandatory.');
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
        const inputField = document.getElementById(id);
        if (inputField) inputField.classList.remove('invalid');
        const textLabel = document.getElementById(`${id}Error`);
        if (textLabel) textLabel.innerText = '';
    });
}

// Session Authentication Form Submission
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
            triggerFieldInvalid('email', 'This email identity matches an existing profile.');
            return;
        }
        dbUsers.push({ email, password, role, empId });
        localStorage.setItem('hrms_users', JSON.stringify(dbUsers));
        alert("Registration successfully stored! Switching to login view.");
        UI.toggleLink.click();
    } else {
        const verifiedProfile = dbUsers.find(u => u.email === email && u.password === password);
        if (verifiedProfile) {
            currentUser = verifiedProfile;
            UI.userStatus.innerText = `Active Session: ${currentUser.email}`;
            UI.authSection.style.display = "none";
            
            if (currentUser.role === "Employee") {
                launchEmployeeView();
            } else {
                launchAdminView();
            }
        } else {
            alert("Security exception: Access denied. Verification mismatch.");
        }
    }
});

// Logout Reset Module
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

// Employee Workspace Execution
function launchEmployeeView() {
    UI.employeeDashboard.style.display = "block";
    UI.empEmailDisplay.innerText = currentUser.email;
    renderEmployeeLogs();
}

UI.checkInBtn.addEventListener('click', () => {
    const todayStr = new Date().toISOString().split('T')[0];
    let attendanceLogs = JSON.parse(localStorage.getItem('hrms_attendance'));
    
    attendanceLogs.push({
        date: todayStr,
        status: "Present",
        empId: currentUser.empId || "N/A",
        email: currentUser.email
    });
    
    localStorage.setItem('hrms_attendance', JSON.stringify(attendanceLogs));
    UI.todayStatus.innerText = "Present";
    UI.todayStatus.className = "status-badge present";
    UI.checkInBtn.disabled = true;
    UI.checkOutBtn.disabled = false;
    renderEmployeeLogs();
});

function renderEmployeeLogs() {
    UI.myAttendanceTable.innerHTML = "";
    let attendanceLogs = JSON.parse(localStorage.getItem('hrms_attendance'));
    const matchedLogs = attendanceLogs.filter(log => log.email === currentUser.email);
    
    matchedLogs.forEach(item => {
        UI.myAttendanceTable.innerHTML += `<tr>
            <td>${item.date}</td>
            <td><span class="status-badge present">${item.status}</span></td>
        </tr>`;
    });
}

// Admin Workspace Execution
function launchAdminView() {
    UI.adminDashboard.style.display = "block";
    UI.adminAttendanceTable.innerHTML = "";
    let attendanceLogs = JSON.parse(localStorage.getItem('hrms_attendance'));
    
    attendanceLogs.forEach(item => {
        UI.adminAttendanceTable.innerHTML += `<tr>
            <td>${item.empId}</td>
            <td>${item.email}</td>
            <td><span class="status-badge present">${item.status}</span></td>
        </tr>`;
    });
}