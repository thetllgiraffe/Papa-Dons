const api = 'http://localhost:8080/admin';

function getTokenFromURL() {
  return new URLSearchParams(window.location.search).get('token');
}

async function signup() {
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const res = await fetch(`${api}/signup`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const response = await res.text();
  if (response == 'User created') {
    signinsection.classList.remove('hidden');
    signupsection.classList.add('hidden');
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';
    document.getElementById('signin-result').innerText = response;
  }
  if (response == 'User already exists') {
    document.getElementById('signup-result').innerText = response;
  }
}

async function signin() {
  try {
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;

    const res = await fetch(`${api}/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json(); // This may throw if response isn't valid JSON

    if (data.redirectTo) {
      window.location.href = data.redirectTo; // Redirect to account page
    } else {
      document.getElementById('signin-result').innerText = data.error;
      console.log(data.error)
    }
  } catch (err) {
    console.error('Sign-in error:', err);
  }
}

async function forgotPassword() {
  const email = document.getElementById('forgot-email').value;
  const res = await fetch(`${api}/forgot-password`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  document.getElementById('forgot-result').innerText = await res.text();
}

async function resetPassword() {
  const token = getTokenFromURL();
  if (!token) {
    alert('Missing reset token');
    return;
  }
  const password = document.getElementById('new-password').value;

  const res = await fetch(`${api}/reset-password/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });

  document.getElementById('reset-result').innerText = await res.text();
}

//client side routing on sign in page
//nav buttons for sign in, sign up, and password reset
const signinBtn = document.getElementById('signin');
const createAccountBtn = document.getElementById('create-account');
const forgotPasswordBtn = document.getElementById('forgot-password');
//form sections for each function
const signinsection = document.getElementById('signin-section');
const resetsection = document.getElementById('reset-section');
const forgotsection = document.getElementById('forgot-section');
const signupsection = document.getElementById('signup-section');
//event listeners to show and hide sections and push state to navigation history
signinBtn.addEventListener('click', () => {
  signinsection.classList.remove('hidden');
  signupsection.classList.add('hidden');
  document.getElementById('signup-email').value = '';
  document.getElementById('signup-password').value = '';
    history.pushState({}, '', '/admin');
});
createAccountBtn.addEventListener('click', () => {
  signupsection.classList.remove('hidden');
  signinsection.classList.add('hidden');
  document.getElementById('signin-email').value = '';
  document.getElementById('signin-password').value = '';
  history.pushState({}, '', '/admin/create_account');
});
forgotPasswordBtn.addEventListener('click', () => {
  signinsection.classList.add('hidden');
  forgotsection.classList.remove('hidden');
  history.pushState({}, '', '/admin/forgot_password');
});
// event listener for popstate to allow proper use of back button
window.addEventListener('popstate', function () {
  // Called when user clicks Back/Forward
  const path = window.location.pathname;
  if (path === '/admin/create_account') {
    signupsection.classList.remove('hidden');
    signinsection.classList.add('hidden');
  } else if (path === '/admin/forgot_password') {
    signinsection.classList.add('hidden');
    forgotsection.classList.remove('hidden');
  } else if (path === '/admin') {
    signinsection.classList.remove('hidden');
    signupsection.classList.add('hidden');
    forgotsection.classList.add('hidden')
  }
});
// if directed from email password reset link ? show reset password section : show normal sign in
window.onload = () => {
  const token = getTokenFromURL();
  if (token) {
    signinsection.classList.add('hidden');
    resetsection.classList.remove('hidden');
  } else {
    history.pushState({}, '', '/admin');
  }
};
