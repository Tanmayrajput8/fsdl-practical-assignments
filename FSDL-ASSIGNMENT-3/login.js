/**
 * Login / Register page - Luxe Fashion India
 * Indian mobile (10 digits), email, gender, password. Validates and stores in localStorage.
 */

const USERS_STORAGE_KEY = 'luxe-fashion-users';
const CURRENT_USER_KEY = 'luxe-fashion-current-user';

// Indian mobile: 10 digits (strip +91, spaces, leading 0)
function normalizeIndianMobile(input) {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  return digits;
}

function isValidIndianMobile(input) {
  const normalized = normalizeIndianMobile(input);
  return normalized.length === 10 && /^[6-9]\d{9}$/.test(normalized);
}

function getUsers() {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function setCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

// ========== REGISTER ==========
document.getElementById('registerForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const form = this;
  const name = document.getElementById('regName').value.trim();
  const numberRaw = document.getElementById('regNumber').value.trim();
  const number = normalizeIndianMobile(numberRaw);
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const gender = document.querySelector('input[name="regGender"]:checked');
  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regConfirmPassword').value;

  form.querySelectorAll('.form-control, .form-check-input').forEach(el => el.classList.remove('is-invalid'));
  document.getElementById('genderError').classList.remove('d-block');

  let valid = true;

  if (name.length < 2) {
    document.getElementById('regName').classList.add('is-invalid');
    valid = false;
  }
  if (!isValidIndianMobile(numberRaw)) {
    document.getElementById('regNumber').classList.add('is-invalid');
    document.getElementById('regNumber').nextElementSibling.textContent = 'Please enter a valid 10-digit Indian mobile number (e.g. 98765 43210).';
    valid = false;
  }
  if (!email) {
    document.getElementById('regEmail').classList.add('is-invalid');
    valid = false;
  }
  if (!gender) {
    document.getElementById('genderError').classList.add('d-block');
    valid = false;
  }
  if (password.length < 6) {
    document.getElementById('regPassword').classList.add('is-invalid');
    valid = false;
  }
  if (password !== confirmPassword) {
    document.getElementById('regConfirmPassword').classList.add('is-invalid');
    valid = false;
  }

  if (!valid) return;

  const users = getUsers();
  if (users.some(u => u.email === email)) {
    document.getElementById('regEmail').classList.add('is-invalid');
    document.getElementById('regEmail').nextElementSibling.textContent = 'This email is already registered.';
    return;
  }

  const user = { name, number, email, gender: gender.value, password };
  users.push(user);
  saveUsers(users);
  setCurrentUser({ name, email, number, gender: gender.value });
  window.location.href = 'index.html';
});

// ========== LOGIN ==========
document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;

  document.getElementById('loginEmail').classList.remove('is-invalid');
  document.getElementById('loginPassword').classList.remove('is-invalid');

  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    document.getElementById('loginEmail').classList.add('is-invalid');
    document.getElementById('loginPassword').classList.add('is-invalid');
    document.getElementById('loginPassword').nextElementSibling.textContent = 'Invalid email or password. Please try again.';
    return;
  }

  setCurrentUser({ name: user.name, email: user.email, number: user.number, gender: user.gender });
  window.location.href = 'index.html';
});
