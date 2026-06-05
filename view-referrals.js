// Session Validators -----------------------
const token = localStorage.getItem("sessionToken");

if (!token) {
  window.location.href = "/qr-scanner-lubrican/index.html";
}

function checkSession() {
  const token = localStorage.getItem("sessionToken");

  if (!token) {
    window.location.href = "/qr-scanner-lubrican/index.html";
  }

  fetch("https://script.google.com/macros/s/AKfycbwYhaIIxax9_IjEqW6KlK8p7l2eMiB7zDhEJwI350SeEl-3oxt4T1WNnHn0VyUgmlFz/exec", {
    method: "POST",
    body: JSON.stringify({
      action: "validateSession",
      sessionToken: token
    })
  })
  .then(r => r.json())
  .then(res => {
    if (!res.valid) {
      localStorage.clear();
      window.location.href = "/qr-scanner-lubrican/index.html";
    }
  });
}

setInterval(checkSession, 300000); // every 5 min

function validateSessionOnLoad() {
  const token = localStorage.getItem("sessionToken");

  if (!token) {
    window.location.href = "/qr-scanner-lubrican/index.html";
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
      window.location.href = "/qr-scanner-lubrican/index.html";
    } else {
      document.body.style.display = "block"; // 👈 show page ONLY if valid
    }
  })
  .catch(() => {
    // fail-safe: if backend is unreachable, lock user out
    localStorage.clear();
    window.location.href = "/qr-scanner-lubrican/index.html";
  });
}

validateSessionOnLoad();

// DOM -------------------
document.addEventListener("DOMContentLoaded", () => {
  const userInfo = document.getElementById("userGreeting");

  if (userGreeting) {
document.getElementById("userGreeting").innerText =
  `Hello, ${localStorage.getItem("cbo") || "User"}!`;
  }

  // logout button
  document.getElementById("logoutBtn").addEventListener("click", logout);
  
  function logout() {
    localStorage.clear();
    window.location.href = "/qr-scanner-lubrican/index.html";
  }
});

// Hamburger Menue ---------------
const hamburger = document.getElementById("hamburger");
const sideMenu = document.getElementById("sideMenu");
const overlay = document.getElementById("overlay");
// open menu
hamburger.addEventListener("click", () => {
  sideMenu.classList.add("open");
  overlay.classList.add("show");
});

// close menu (click outside)
overlay.addEventListener("click", closeMenu);

// optional: clicking menu links closes it too
document.querySelectorAll(".sideMenu a").forEach(link => {
  link.addEventListener("click", closeMenu);
});

function closeMenu() {
  sideMenu.classList.remove("open");
  overlay.classList.remove("show");
}

// Main call ------------------------
let allSeeds = [];
const monthFilter = document.getElementById("monthFilter");
const tbody = document.getElementById("seedTableBody");
tbody.innerHTML = `
  <tr>
    <td colspan="8" style="text-align:center; padding:10px;">
      Loading...
    </td>
  </tr>
`;
fetch("https://script.google.com/macros/s/AKfycbwYhaIIxax9_IjEqW6KlK8p7l2eMiB7zDhEJwI350SeEl-3oxt4T1WNnHn0VyUgmlFz/exec", {
  method: "POST",
  body: JSON.stringify({
    action: "getReferrals",
    sessionToken: localStorage.getItem("sessionToken")
  })
})
.then(res => res.json())
.then(data => {

  console.log("PARSED DATA:", data); // 👈 now you will see seeds here

  if (!data.success || !Array.isArray(data.seeds) || !data.seeds) {
    showToast(data.message || "No referrals found or session invalid");
    const tbody = document.getElementById("seedTableBody");
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding:10px;">
          No Match
        </td>
      </tr>
    `;
    return;
  }

  allSeeds = data.seeds;
  monthFilter.dispatchEvent(new Event("change"));
  renderTable(allSeeds);
  
})
.catch(err => {
  console.error(err);
  showToast("Session Expired");
});

// toast function
function showToast(message, duration = 3000) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

// Render Table
function renderTable(seeds) {
  const tbody = document.getElementById("seedTableBody");

  tbody.innerHTML = "";

  if (seeds.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding:10px;">
          No Match
        </td>
      </tr>
    `;
    return;
  }

  seeds.forEach(seed => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${seed.seedId}</td>
      <td>${seed.name}</td>
      <td>${seed.pend}</td>
      <td>${seed.app}</td>
      <td>${seed.disap}</td>
      <td>${seed.carry}</td>
      <td>${seed.total}</td>
      <td>${seed.tier}</td>
    `;

    tbody.appendChild(row);
  });
}

// Filter event listener ----------------------
document.getElementById("monthFilter").addEventListener("change", function () {

  const selectedMonth = this.value;

  if (!selectedMonth) {
    renderTable(allSeeds);
    return;
  }

  const filtered = allSeeds.filter(seed =>
    seed.month === selectedMonth
  );

  renderTable(filtered);

});

  // Setting the default as current month
  const monthNames = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];
  
  const currentMonth = monthNames[new Date().getMonth()];  
  // Only set it if the option exists in the dropdown
  if ([...monthFilter.options].some(opt => opt.value === currentMonth)) {
    monthFilter.value = currentMonth;
  }
