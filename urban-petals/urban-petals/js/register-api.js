function step1Next() {
  hideErr();
  const email = document.getElementById('rEmail').value.trim();
  const pass = document.getElementById('rPass').value;
  const pass2 = document.getElementById('rPass2').value;
  if (!email) { showErr('Please enter your email address.'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showErr('Please enter a valid email address.'); return; }
  if (pass.length < 8) { showErr('Password must be at least 8 characters.'); return; }
  if (pass !== pass2) { showErr('Passwords do not match.'); return; }
  goToStep(2);
}

async function step2Submit() {
  hideErr();
  const first = document.getElementById('rFirst').value.trim();
  const terms = document.getElementById('rTerms').checked;
  if (!first) { showErr('Please enter your first name.'); return; }
  if (!terms) { showErr('Please accept the Terms of Service to continue.'); return; }

  const email = document.getElementById('rEmail').value.trim();
  const pass = document.getElementById('rPass').value;
  const last = document.getElementById('rLast').value.trim();
  const phone = document.getElementById('rPhone').value.trim();
  const city = document.getElementById('rCity').value.trim();

  try {
    const result = await apiRequest('/auth/register', {
      method: 'POST',
      body: {
        firstName: first,
        lastName: last,
        email,
        password: pass,
        phone,
        city,
        avatar: selectedAvatar,
      },
    });

    saveUser(result.user);
    goToStep(3);
    document.getElementById('pane2').style.display = 'none';
    document.getElementById('stepper').style.display = 'none';
    document.getElementById('successScreen').classList.add('show');
  } catch (error) {
    showErr(error.message);
  }
}
