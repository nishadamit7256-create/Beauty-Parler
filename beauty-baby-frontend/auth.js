// Auto-open modal on every page load
document.addEventListener("DOMContentLoaded", () => {
  const modalEl = document.getElementById("authModal");
  const authModal = new bootstrap.Modal(modalEl);
  authModal.show();

  // ----- Login -----
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success) {
        alert("Login successful ✅");
        // अगर आप login के बाद modal बंद करना चाहते हैं:
        bootstrap.Modal.getInstance(modalEl).hide();
        // Note: localStorage में user ना रखें ताकि अगली बार page चलाते ही modal फिर खुले
      } else {
        alert(data.msg || "Invalid credentials ❌");
      }
    } catch (err) {
      console.error(err);
      alert("Server error ❌");
    }
  });

  // ----- Register -----
  document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();

      if (data.success) {
        alert("Registration successful ✅ Please login.");
        document.getElementById("flipToggle").checked = false; // back to Login
      } else {
        alert(data.msg || "Registration failed ❌");
      }
    } catch (err) {
      console.error(err);
      alert("Server error ❌");
    }
  });

  // ----- Forgot Password -> open Change Password modal -----
  document.getElementById("forgotPasswordLink").addEventListener("click", (e) => {
    e.preventDefault();
    const cpModalEl = document.getElementById("changePasswordModal");
    const cpModal = new bootstrap.Modal(cpModalEl);
    cpModal.show();
  });

  // Remove old forgotPasswordLink modal open code
document.getElementById("changePasswordForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("cpEmail").value.trim();
  const newPassword = document.getElementById("cpNewPassword").value;
  const confirmPassword = document.getElementById("cpConfirmPassword").value;

  if (newPassword !== confirmPassword) {
    alert("Passwords do not match ❌");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword })
    });
    const data = await res.json();

    if (data.success) {
      alert("Password changed ✅ Please login again.");
      document.getElementById("flipLogin").checked = true; // back to login
    } else {
      alert(data.msg || "Could not change password ❌");
    }
  } catch (err) {
    console.error(err);
    alert("Server error ❌");
  }
});

});

