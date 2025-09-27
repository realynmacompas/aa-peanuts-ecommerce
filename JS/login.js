

document.addEventListener("DOMContentLoaded", () => {


// -------------------- TABS LOGIC --------------------
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

loginTab.onclick = () => {
  loginTab.classList.add('active');
  signupTab.classList.remove('active');
  loginForm.classList.add('active');
  signupForm.classList.remove('active');
};

signupTab.onclick = () => {
  signupTab.classList.add('active');
  loginTab.classList.remove('active');
  signupForm.classList.add('active');
  loginForm.classList.remove('active');
};

// -------------------- PASSWORD SHOW/HIDE --------------------
const toggleIcons = document.querySelectorAll(".toggle-password");
toggleIcons.forEach(function (icon) {
  icon.addEventListener("click", function () {
    const targetId = icon.getAttribute("data-target");
    const passwordInput = document.getElementById(targetId);
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    icon.src = isPassword ? "../IMG/eye-solid.svg" : "../IMG/eye-slash-solid.svg";
  });
});

// -------------------- DOM ELEMENTS --------------------
const signupName = document.getElementById("signupName");
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");
const confirmPassword = document.getElementById("confirm-password");

const usernameError = document.getElementById("usernameError");
const emailError = document.getElementById("emailError");
const passwordHelp = document.getElementById("passwordHelp");
const confirmPasswordGroup = document.getElementById("confirmPasswordGroup");
const passwordError = document.getElementById("password-error");
const signupButton = document.getElementById("signup");

const checkLength = document.getElementById("check-length");
const checkUppercase = document.getElementById("check-uppercase");
const checkLowercase = document.getElementById("check-lowercase");
const checkNumber = document.getElementById("check-number");
const checkSpecial = document.getElementById("check-special");

// -------------------- VALIDATION FLAGS --------------------
let usernameValid = false;
let emailValid = false;
let passwordsMatch = false;
let strongPassword = false;

// -------------------- PASSWORD STRENGTH CHECK --------------------
function updatePasswordRequirements(password) {
  passwordHelp.classList.remove("hidden");

  
  const hasLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[\W_]/.test(password);

  checkLength.textContent = hasLength ? "✅" : "❌";
  checkUppercase.textContent = hasUppercase ? "✅" : "❌";
  checkLowercase.textContent = hasLowercase ? "✅" : "❌";
  checkNumber.textContent = hasNumber ? "✅" : "❌";
  checkSpecial.textContent = hasSpecial ? "✅" : "❌";


  strongPassword = hasLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;


  if (strongPassword) {
    passwordHelp.textContent = "✅ Password is strong!";
    confirmPasswordGroup.classList.remove("hidden");
  } 

  else {
    passwordHelp.innerHTML = `
      Password must be at least <span id="check-length">${hasLength ? "✅" : "❌"}</span> 8 characters and include 
      <span id="check-uppercase">${hasUppercase ? "✅" : "❌"}</span> uppercase, 
      <span id="check-lowercase">${hasLowercase ? "✅" : "❌"}</span> lowercase, 
      <span id="check-number">${hasNumber ? "✅" : "❌"}</span> number, and 
      <span id="check-special">${hasSpecial ? "✅" : "❌"}</span> special character.
    `;
    confirmPasswordGroup.classList.add("hidden");
  }

  validatePasswords();
}
// -------------------- CONFIRM PASSWORD VALIDATION --------------------
function validatePasswords() {
  if (confirmPassword.value === '' || signupPassword.value === '') {
    passwordError.textContent = '';
    passwordsMatch = false;
  } else if (signupPassword.value !== confirmPassword.value) {
    passwordError.textContent = "Passwords Do Not Match!";
    passwordsMatch = false;
  } else {
    passwordError.textContent = "";
    passwordsMatch = true;
  }
  updateSignupButtonState();
}

// -------------------- EMAIL FORMAT CHECK --------------------
function isValidEmailFormat(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@((gmail|yahoo|outlook)\.com|[a-zA-Z0-9.-]+\.(edu|gov|ph))$/;
  return emailRegex.test(email);
}

// -------------------- USERNAME & EMAIL AVAILABILITY --------------------
function validateField(type, value, errorElement) {
  fetch("../PHP/checksignup_cred.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `type=${type}&value=${encodeURIComponent(value)}`
  })
    .then(res => res.text())
    .then(response => {
      if (response === 'taken') {
        errorElement.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} Already Taken!`;
        if (type === 'username') usernameValid = false;
        if (type === 'email') emailValid = false;
      } else {
        errorElement.textContent = '';
        if (type === 'username') usernameValid = true;
        if (type === 'email') emailValid = true;
      }
      updateSignupButtonState();
    });
}

// -------------------- SIGNUP BUTTON ENABLE/DISABLE --------------------
function updateSignupButtonState() {
  signupButton.disabled = !(usernameValid && emailValid && passwordsMatch && strongPassword);
}

// -------------------- SIGNUP EVENT LISTENERS --------------------
signupName.addEventListener("input", () => {
  validateField("username", signupName.value, usernameError);
});

signupEmail.addEventListener("input", () => {
  const email = signupEmail.value.trim();

  if (email === '') {
    emailError.textContent = '';
    emailValid = false;
    updateSignupButtonState();
    return;
  }

  if (!isValidEmailFormat(email)) {
    emailError.textContent = "Invalid Email Format!";
    emailValid = false;
    updateSignupButtonState();
    return;
  }

  validateField("email", email, emailError);
});



signupPassword.addEventListener("input", () => {
 const password = signupPassword.value;
  if (password === '') {
   passwordHelp.classList.add("hidden"); 
    confirmPasswordGroup.classList.add("hidden");
  } else {
   passwordHelp.classList.remove("hidden");
    confirmPasswordGroup.classList.remove("hidden");
 updatePasswordRequirements(password);
  }
});


confirmPassword.addEventListener("input", validatePasswords);

signupForm.addEventListener("submit", function (e) {
  if (!strongPassword || !passwordsMatch) {
    e.preventDefault();
  }
});

// -------------------- SUCCESS MODAL --------------------
window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const signupSuccess = urlParams.get('signup');

  if (signupSuccess === 'success') {
    document.getElementById('successModal').classList.remove('hidden');
  }

  const proceedBtn = document.getElementById('proceedLoginBtn');
  if (proceedBtn) {
    proceedBtn.onclick = () => {
      window.location.href = '../PAGES/login.html';
    };
  }
};

// -------------------- LOGIN LOGIC --------------------
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const errorMessage = document.getElementById("loginError");

  fetch("../PHP/login.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
  })
    
    .then(res => res.text())
    .then(response => {
      const role = response.trim().toLowerCase();

      if (role === "admin") {
        window.location.href = "../ADMIN_PHP/admin.php"; // Admin panel
      } else if (role === "regular" || role === "reseller") {
        window.location.href = "../PAGES/home.html"; // Normal user homepage
      } else {
        errorMessage.textContent = "Credential/s are/is incorrect.";
      }
    })
    .catch(error => {
      console.error("Login error:", error);
      errorMessage.textContent = "Something went wrong.";
    });
     });
});
