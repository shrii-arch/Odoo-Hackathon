// 1. STATE INSTANTIATION (Dynamic Memory Database Arrays)
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = null; 

// 2. VIEW SWAP CONTROLLER: Controls visibility toggles for authentication forms
function showAuthForm(formType) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (formType === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

// 3. REGISTRATION MODULE: Captures and saves user models dynamically
function handleRegister(event) {
    event.preventDefault(); 

    const empId = document.getElementById('reg-id').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const role = document.getElementById('reg-role').value;

    const userExists = users.some(user => user.email === email || user.empId === empId);
    if (userExists) {
        alert("Registration Failed: Duplicate account parameters identified.");
        return;
    }

    const newUser = {
        empId: empId,
        email: email,
        password: password,
        role: role,
        phone: "",       
        address: "",     
        attendance: [], 
        leaves: []      
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    alert("Registration Successful! Please Sign In.");
    event.target.reset(); 
    showAuthForm('login'); 
}

// 4. GATEWAY ROUTER CONTROLLER: Validates profiles and instantiates dashboard layouts
function handleLogin(event) {
    event.preventDefault(); 

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const matchedUser = users.find(user => user.email === email && user.password === password);

    if (!matchedUser) {
        alert("Authentication Error: Invalid email or password credentials.");
        return;
    }

    currentUser = matchedUser;
    document.getElementById('auth-container').style.display = 'none';

    // 3.2 Route the views to display their complete data grids
    if (currentUser.role === "Admin") {
        document.getElementById('admin-container').style.display = 'block';
        renderAdminDashboard(); 
    } else {
        document.getElementById('employee-container').style.display = 'block';
        renderEmployeeDashboard(); 
    }
}

// 5. 3.2.1 EMPLOYEE VIEW RENDERING DATA LAYERS
function renderEmployeeDashboard() {
    if (!currentUser) return;

    // Set greeting strings
    document.getElementById('emp-welcome-name').innerText = currentUser.empId;
    
    // Mount profile data references onto form controls (Section 3.3 elements)
    document.getElementById('prof-id').innerText = currentUser.empId;
    document.getElementById('prof-email').innerText = currentUser.email;
    document.getElementById('prof-phone').value = currentUser.phone || "";
    document.getElementById('prof-address').value = currentUser.address || "";
}

// 6. 3.2.2 HR ADMIN VIEW RENDERING DATA LAYERS
function renderAdminDashboard() {
    const listContainer = document.getElementById('admin-employee-list');
    listContainer.innerHTML = ""; 

    const employeeOnlyList = users.filter(user => user.role === "Employee");
    
    // Set total count metric
    document.getElementById('admin-total-staff-count').innerText = employeeOnlyList.length;

    if (employeeOnlyList.length === 0) {
        listContainer.innerHTML = "<p class='no-data'>No employee user profiles registered within the system directory.</p>";
        return;
    }

    employeeOnlyList.forEach(emp => {
        const row = document.createElement('div');
        row.className = "management-row-card";
        row.innerHTML = `
            <div class="row-info">
                <p><strong>Staff ID:</strong> ${emp.empId} | <strong>Email:</strong> ${emp.email}</p>
                <p class="sub-text">Phone: ${emp.phone || "Not Specified"} | Address: ${emp.address || "Not Specified"}</p>
            </div>
            <div class="admin-edit-controls">
                <input type="text" id="admin-phone-${emp.empId}" placeholder="Modify Phone" value="${emp.phone || ""}">
                <input type="text" id="admin-address-${emp.empId}" placeholder="Modify Address" value="${emp.address || ""}">
                <button onclick="adminModifyUser('${emp.empId}')" class="admin-action-btn">Force Update</button>
            </div>
        `;
        listContainer.appendChild(row);
    });
}

// 7. PROFILE INTERACTION HANDLING (Section 3.3)
function updateEmployeeProfile(event) {
    event.preventDefault();

    const updatedPhone = document.getElementById('prof-phone').value;
    const updatedAddress = document.getElementById('prof-address').value;

    currentUser.phone = updatedPhone;
    currentUser.address = updatedAddress;

    const index = users.findIndex(user => user.empId === currentUser.empId);
    if (index !== -1) {
        users[index] = currentUser;
        localStorage.setItem('users', JSON.stringify(users)); 
        alert("Personal profile modifications successfully saved!");
        renderEmployeeDashboard(); 
    }
}

// 8. SESSION TERMINATION
function logout() {
    currentUser = null;
    document.getElementById('employee-container').style.display = 'none';
    document.getElementById('admin-container').style.display = 'none';
    document.getElementById('auth-container').style.display = 'block';
}
// 9. ADMIN PROFILE OVERRIDEPRIVILEGES (Section 3.3.2)
function adminModifyUser(empId) {
    const newPhone = document.getElementById(`admin-phone-${empId}`).value;
    const newAddress = document.getElementById(`admin-address-${empId}`).value;

    // Find the targeted employee in the database array
    const index = users.findIndex(user => user.empId === empId);
    if (index !== -1) {
        // Apply the Admin's forced changes
        users[index].phone = newPhone;
        users[index].address = newAddress;
        
        // Save back to browser disk storage
        localStorage.setItem('users', JSON.stringify(users));
        alert(`Administrative Override: Profile for Staff ID ${empId} has been updated.`);
        
        // Refresh the admin interface to show the new changes immediately
        renderAdminDashboard();
    }
}