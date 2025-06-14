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
  document.getElementById('signup-result').innerText = await res.text();
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
    }
  } catch (err) {
    // Handles network errors, JSON errors, etc.
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

window.onload = () => {
  const token = getTokenFromURL();
  if (token) {
    document.getElementById('signin-section').classList.add('hidden');
    document.getElementById('reset-section').classList.remove('hidden');
  }
};