async function doSignIn() {
  hideErr();
  const email = document.getElementById('siEmail').value.trim();
  const pass = document.getElementById('siPass').value;
  const empId = document.getElementById('siEmpId').value.trim();

  if (!email || !pass) {
    showErr('Please enter your email and password.');
    return;
  }

  if (currentType === 'employee' && !empId) {
    showErr('Please enter your Employee ID.');
    return;
  }

  try {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: {
        email,
        password: pass,
        type: currentType,
        employeeId: empId,
      },
    });

    saveUser(result.user);
    showToast(currentType === 'employee' ? 'Welcome back! 👔' : 'Welcome back! 🌿');
    setTimeout(() => {
      window.location.href = currentType === 'employee' ? 'dashboard.html' : 'Homepage.html';
    }, 900);
  } catch (error) {
    showErr(error.message);
  }
}
