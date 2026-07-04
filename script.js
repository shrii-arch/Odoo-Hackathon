// 1. DYNAMIC DATABASE: Load existing users from browser memory, or start empty
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = null; // Stores the currently logged-in user session

// 2. INTERFACE MANAGER: Switches between Sign In and Sign Up forms
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

// 3. REGISTRATION CONTROLLER: Saves new accounts dynamically
function handleRegister(event) {
    event.preventDefault(); // Prevents the browser from refreshing the page

    const empId = document.getElementById('reg-id').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const role = document.getElementById('reg-role').value;

    // Validation: Prevent duplicate accounts
    const userExists = users.some(user => user.email === email || user.empId === empId);
    if (userExists) {
        alert("An account with this Email or Employee ID already exists!");
        return;
    }

    // Creating a fresh, dynamic user profile object
    const newUser = {
        empId: empId,
        email: email,
        password: password,
        role: role,
        attendance: [], 
        leaves: []      
    };

    // Push the new user to our array and update browser's localStorage database
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    alert("Registration Successful! Please Sign In.");
    event.target.reset(); // Clears form inputs
    showAuthForm('login'); // Shifts view to login automatically
}

// 4. LOGIN CONTROLLER: Validates credentials and routes roles
function handleLogin(event) {
    event.preventDefault(); 

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // Scan database array for matching user credentials
    const matchedUser = users.find(user => user.email === email && user.password === password);

    if (!matchedUser) {
        alert("Invalid Email or Password!");
        return;
    }

    // Set the session state to the logged-in user
    currentUser = matchedUser;

    // Hide Login Panel
    document.getElementById('auth-container').style.display = 'none';

    // Role-Based Access Control Rule
    if (currentUser.role === "Admin") {
        document.getElementById('admin-container').style.display = 'block';
    } else {
        document.getElementById('employee-container').style.display = 'block';
        document.getElementById('emp-welcome-name').innerText = currentUser.empId;
    }
}

// 5. SESSION TERMINATION: Safe Logout
function logout() {
    currentUser = null;
    document.getElementById('employee-container').style.display = 'none';
    document.getElementById('admin-container').style.display = 'none';
    document.getElementById('auth-container').style.display = 'block';
}