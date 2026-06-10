function validateSessionOnLoad() {
  const token = localStorage.getItem("sessionToken");

  if (!token) {
    document.body.style.display = "block";
    return;
  }

  fetch("https://script.google.com/macros/s/AKfycbwYhaIIxax9_IjEqW6KlK8p7l2eMiB7zDhEJwI350SeEl-3oxt4T1WNnHn0VyUgmlFz/exec", {
    method: "POST",
    body: JSON.stringify({
      action: "validateSession",
      sessionToken: token
    })
  })
  .then(res => res.json())
  .then(res => {
    if (!res.valid) {
      localStorage.clear();
      document.body.style.display = "block"; // 👈 show page ONLY if valid
    } else {
      window.location.href = "/qr-scanner-lubrican/scanner.html"
    }
  })
  .catch(() => {
    // fail-safe: if backend is unreachable, lock user out
    localStorage.clear();
    document.body.style.display = "block";
  });
}

validateSessionOnLoad();

console.log("login.js loaded");

document.getElementById("loginBtn").addEventListener("click", loginUser);

function loginUser() {
  showConfirmModal();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  

fetch("https://script.google.com/macros/s/AKfycbwYhaIIxax9_IjEqW6KlK8p7l2eMiB7zDhEJwI350SeEl-3oxt4T1WNnHn0VyUgmlFz/exec", {
  method: "POST",
  body: JSON.stringify({
    action: "login",
    username,
    password
  })
})
.then(r => r.json())
.then(res => {
  if (res.success) {

    localStorage.setItem("sessionToken", res.sessionToken);
    localStorage.setItem("username", res.username);
    localStorage.setItem("cbo", res.cbo);
    localStorage.setItem("role", res.role);

    window.location.href = "scanner.html";
  } else {
    showToast(res.message);
  }
  document.getElementById('activeModal').remove();
  document.getElementById("loginBtn").disabled = false;
  document.getElementById("loginBtn").style.opacity = "100%";
});
}

function showToast(message, duration = 3000) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

function showConfirmModal() {
  document.getElementById("loginBtn").disabled = true;
  document.getElementById("loginBtn").style.opacity = "50%";

  const modalBgd = document.createElement('div');
  modalBgd.className = "modal";
  modalBgd.style.display = "block";
  modalBgd.id = "activeModal";
  document.body.appendChild(modalBgd);
  
  const confModal = document.createElement('div');
  confModal.className = "modal-content";
  confModal.id = "fnlConfModal";
  confModal.style.display = "block";
  modalBgd.appendChild(confModal);
  
  confModal.innerHTML = `
      <div class="spinner"></div>
      <h3>Verifying...</h3>
  `;
}
