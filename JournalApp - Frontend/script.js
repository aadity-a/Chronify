/* ========= Config ========= */
const API_BASE = "http://localhost:8080";

/* ========= Utilities ========= */
const $ = (id) => document.getElementById(id);
const hasEl = (id) => !!$(id);

// Navigate (multi-page) or fallback to section toggle (single-page)
function goTo(sectionId, url) {
  if (url) {
    try { window.location.href = url; return; } catch (_) { }
  }
  const sections = ["login-section", "register-section", "dashboard", "admin-dashboard"];
  sections.forEach(s => hasEl(s) && ($(s).classList.add("hidden")));
  hasEl(sectionId) && $(sectionId).classList.remove("hidden");
}

// Ensure we have an auth token
function requireAuthOrRedirect() {
  const tok = sessionStorage.getItem("auth");
  if (!tok) {
    if (!hasEl("login-section") && !hasEl("register-section")) {
      goTo("login-section", "login.html");
    } else {
      showLogin();
    }
    return null;
  }
  return tok;
}

/* ========= Auth section toggles ========= */
function showRegister() {
  hasEl("login-section") && $("login-section").classList.add("hidden");
  hasEl("register-section") && $("register-section").classList.remove("hidden");
}
function showLogin() {
  hasEl("register-section") && $("register-section").classList.add("hidden");
  hasEl("login-section") && $("login-section").classList.remove("hidden");
}

/* ========= Login / Register ========= */
async function login() {
  const username = ($("login-username")?.value || "").trim();
  const password = ($("login-password")?.value || "").trim();
  if (!username || !password) return alert("Please enter username and password.");

  const token = btoa(username + ":" + password);

  try {
    const probe = await fetch(`${API_BASE}/journal`, { headers: { Authorization: `Basic ${token}` } });
    if (!(probe.ok || probe.status === 404)) throw new Error();

    sessionStorage.setItem("auth", token);
    sessionStorage.setItem("username", username);

    // Check admin capability
    const adminRes = await fetch(`${API_BASE}/admin/all-users`, { headers: { Authorization: `Basic ${token}` } });
    if (adminRes.ok) {
      // Admin
      if (hasEl("admin-dashboard")) {
        hasEl("login-section") && ($("login-section").classList.add("hidden"));
        $("admin-dashboard").classList.remove("hidden");
        loadAdminDashboard();
      } else {
        goTo("admin-dashboard", "admin-dashboard.html");
      }
    } else {
      // User
      if (hasEl("dashboard")) {
        loadDashboard();
      } else {
        goTo("dashboard", "dashboard.html");
      }
    }
  } catch {
    alert("Login failed!");
  }
}

async function register() {
  const userName = ($("register-username")?.value || "").trim();
  const password = ($("register-password")?.value || "").trim();
  if (!userName || !password) return alert("Please enter both username and password.");

  try {
    const res = await fetch(`${API_BASE}/public/create_user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName, password })
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      return alert("Registration failed" + (msg ? `: ${msg}` : "."));
    }
    alert("User registered! Login now.");
    if (!hasEl("login-section")) {
      goTo("login-section", "login.html");
    } else {
      showLogin();
    }
  } catch (e) {
    alert("An error occurred: " + e.message);
  }
}

function logout() {
  sessionStorage.clear();
  if (!hasEl("login-section")) {
    goTo("login-section", "login.html");
  } else {
    location.reload();
  }
}

/* ========= Dashboard (user) ========= */
function loadDashboard() {
  const tok = requireAuthOrRedirect();
  if (!tok) return;

  hasEl("login-section") && $("login-section").classList.add("hidden");
  hasEl("register-section") && $("register-section").classList.add("hidden");
  hasEl("dashboard") && $("dashboard").classList.remove("hidden");

  const userLbl = $("user-label");
  if (userLbl) userLbl.textContent = sessionStorage.getItem("username") || "";

  loadEntries();
}

// Load all entries for current user
async function loadEntries() {
  const tok = requireAuthOrRedirect();
  if (!tok) return;

  try {
    const res = await fetch(`${API_BASE}/journal`, { headers: { Authorization: `Basic ${tok}` } });
    const entries = res.ok ? await res.json() : [];
    const container = $("entries");
    if (!container) return;
    container.innerHTML = "";

    if (!entries || entries.length === 0) {
      const p = document.createElement("p");
      p.textContent = "No journal entries yet. Add your first one!";
      container.appendChild(p);
      return;
    }

    entries.forEach(e => container.appendChild(renderEntryCard(e)));
  } catch (err) {
    console.error("Error loading entries:", err);
  }
}

function renderEntryCard(entry) {
  const div = document.createElement("div");
  div.className = "entry";
  div.dataset.id = entry.id;

  const pId = document.createElement("p");
  const strongId = document.createElement("strong");
  strongId.textContent = "ID:";
  pId.appendChild(strongId);
  pId.appendChild(document.createTextNode(" " + entry.id));

  const pTitle = document.createElement("p");
  const strongTitle = document.createElement("strong");
  strongTitle.textContent = "Title:";
  const spanTitle = document.createElement("span");
  spanTitle.id = `title-${entry.id}`;
  spanTitle.textContent = entry.title;
  pTitle.appendChild(strongTitle);
  pTitle.appendChild(document.createTextNode(" "));
  pTitle.appendChild(spanTitle);

  const pContent = document.createElement("p");
  const strongContent = document.createElement("strong");
  strongContent.textContent = "Content:";
  const spanContent = document.createElement("span");
  spanContent.id = `content-${entry.id}`;
  spanContent.textContent = entry.content;
  pContent.appendChild(strongContent);
  pContent.appendChild(document.createTextNode(" "));
  pContent.appendChild(spanContent);

  const delBtn = document.createElement("button");
  delBtn.type = "button";
  delBtn.className = "entry-delete";
  delBtn.textContent = "Delete";
  delBtn.dataset.id = entry.id;

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "entry-edit";
  editBtn.textContent = "Edit";
  editBtn.dataset.id = entry.id;

  div.append(pId, pTitle, pContent, delBtn, editBtn);
  return div;
}

// Add entry
async function addEntry() {
  const tok = requireAuthOrRedirect();
  if (!tok) return;

  const title = ($("entry-title")?.value || "").trim();
  const content = ($("entry-content")?.value || "").trim();

  try {
    const res = await fetch(`${API_BASE}/journal`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${tok}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title, content })
    });
    if (res.ok) {
      $("entry-title") && ($("entry-title").value = "");
      $("entry-content") && ($("entry-content").value = "");
      loadEntries();
    } else {
      alert("Failed to add entry");
    }
  } catch {
    alert("Failed to add entry");
  }
}

// Delete entry
async function deleteEntry(id) {
  const tok = requireAuthOrRedirect();
  if (!tok) return;

  try {
    const res = await fetch(`${API_BASE}/journal/id/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Authorization: `Basic ${tok}` }
    });
    if (res.ok) {
      loadEntries();
    } else {
      throw new Error();
    }
  } catch (err) {
    console.error("Delete failed", err);
  }
}

// Start inline edit
function startEdit(id) {
  const titleEl = $(`title-${id}`);
  const contentEl = $(`content-${id}`);
  if (!titleEl || !contentEl) return;

  const parent = titleEl.closest(".entry");
  if (!parent) return;

  const oldTitle = titleEl.textContent || "";
  const oldContent = contentEl.textContent || "";

  titleEl.dataset.original = oldTitle;
  contentEl.dataset.original = oldContent;

  titleEl.innerHTML = "";
  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.id = `edit-title-${id}`;
  titleInput.value = oldTitle;
  titleEl.appendChild(titleInput);

  contentEl.innerHTML = "";
  const contentInput = document.createElement("textarea");
  contentInput.id = `edit-content-${id}`;
  contentInput.value = oldContent;
  contentEl.appendChild(contentInput);

  // swap buttons
  const editBtn = parent.querySelector(".entry-edit");
  if (editBtn) {
    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "entry-save";
    saveBtn.textContent = "Save";
    saveBtn.dataset.id = id;

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "entry-cancel";
    cancelBtn.textContent = "Cancel";
    cancelBtn.dataset.id = id;

    editBtn.replaceWith(saveBtn);
    parent.querySelector(".entry-delete")?.after(saveBtn); // ensure order
    saveBtn.after(cancelBtn);
  }
}

async function saveEdit(id) {
  const tok = requireAuthOrRedirect();
  if (!tok) return;

  const newTitle = ($(`edit-title-${id}`)?.value || "").trim();
  const newContent = ($(`edit-content-${id}`)?.value || "").trim();

  try {
    const res = await fetch(`${API_BASE}/journal/id/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Basic ${tok}` },
      body: JSON.stringify({ title: newTitle, content: newContent })
    });
    if (res.ok) {
      loadEntries();
    } else {
      throw new Error("Update failed");
    }
  } catch (e) {
    console.error("Update failed", e);
  }
}

function cancelEdit(id) {
  const titleEl = $(`title-${id}`);
  const contentEl = $(`content-${id}`);
  if (!titleEl || !contentEl) return;

  titleEl.textContent = titleEl.dataset.original || "";
  contentEl.textContent = contentEl.dataset.original || "";

  const parent = titleEl.closest(".entry");
  if (!parent) return;

  // restore edit button
  const saveBtn = parent.querySelector(".entry-save");
  const cancelBtn = parent.querySelector(".entry-cancel");
  if (saveBtn) {
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "entry-edit";
    editBtn.textContent = "Edit";
    editBtn.dataset.id = id;
    saveBtn.replaceWith(editBtn);
  }
  cancelBtn && cancelBtn.remove();
}

// Search entry by ID
async function searchEntryById() {
  const tok = requireAuthOrRedirect();
  if (!tok) return;

  const id = ($("searchId")?.value || "").trim();
  if (!id) return alert("Please enter an ID to search.");

  try {
    const res = await fetch(`${API_BASE}/journal/id/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Basic ${tok}` }
    });
    if (res.status === 404) throw new Error("No entry found with this ID.");
    if (!res.ok) throw new Error("Failed to fetch entry.");
    const entry = await res.json();

    const container = $("entries");
    if (!container) return;
    container.innerHTML = "";
    container.appendChild(renderEntryCard(entry));
  } catch (e) {
    alert(e.message);
  }
}

/* ========= Admin Dashboard ========= */
async function loadAdminDashboard() {
  const tok = requireAuthOrRedirect();
  if (!tok) return;

  try {
    const res = await fetch(`${API_BASE}/admin/all-users`, {
      headers: { Authorization: `Basic ${tok}` }
    });
    if (!res.ok) throw new Error("Failed to fetch admin data");
    const users = await res.json();
    renderAdminDashboard(users);
  } catch (err) {
    console.error("Error loading admin dashboard:", err);
    alert("Failed to load admin dashboard");
  }
}

function renderAdminDashboard(users) {
  const tbody = document.querySelector("#users-table tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  users.forEach((user, index) => {
    const tr = document.createElement("tr");

    const snoTd = document.createElement("td");
    snoTd.textContent = index + 1;
    tr.appendChild(snoTd);

    const usernameTd = document.createElement("td");
    usernameTd.textContent = user.userName;
    tr.appendChild(usernameTd);

    const entriesTd = document.createElement("td");
    if (user.journalEntries && user.journalEntries.length > 0) {
      const ol = document.createElement("ol");
      user.journalEntries.forEach(entry => {
        const li = document.createElement("li");
        const titleSpan = document.createElement("strong");
        titleSpan.textContent = entry.title + ": ";
        const contentSpan = document.createElement("span");
        contentSpan.textContent = entry.content;
        li.append(titleSpan, contentSpan);
        ol.appendChild(li);
      });
      entriesTd.appendChild(ol);
    } else {
      entriesTd.textContent = "No entries";
    }
    tr.appendChild(entriesTd);

    tbody.appendChild(tr);
  });

  if (hasEl("dashboard") && hasEl("admin-dashboard")) {
    $("dashboard").classList.add("hidden");
    $("admin-dashboard").classList.remove("hidden");
  }
}

async function createAdmin() {
  const tok = requireAuthOrRedirect();
  if (!tok) return;

  const username = ($("new-admin-username")?.value || "").trim();
  const password = ($("new-admin-password")?.value || "").trim();
  if (!username || !password) return alert("Please enter username and password");

  try {
    const res = await fetch(`${API_BASE}/admin/create-admin-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Basic ${tok}` },
      body: JSON.stringify({ userName: username, password, roles: ["ADMIN"] })
    });
    if (!res.ok) throw new Error("Failed to create admin");
    await res.json().catch(() => { });
    alert("Admin created successfully!");
    $("createAdminForm")?.reset();
    loadAdminDashboard();
  } catch (err) {
    console.error("Error creating admin:", err);
    alert("Failed to create admin");
  }
}

/* ========= Event bindings ========= */
document.addEventListener("DOMContentLoaded", () => {
  // Auth forms
  $("loginForm")?.addEventListener("submit", (e) => { e.preventDefault(); login(); });
  $("registerForm")?.addEventListener("submit", (e) => { e.preventDefault(); register(); });

  // Toggle links
  $("showLogin")?.addEventListener("click", (e) => { e.preventDefault(); showLogin(); });
  $("showRegister")?.addEventListener("click", (e) => { e.preventDefault(); showRegister(); });

  // Admin form
  $("createAdminForm")?.addEventListener("submit", (e) => { e.preventDefault(); createAdmin(); });

  // Dashboard buttons
  $("logoutBtn")?.addEventListener("click", logout);
  $("addEntryBtn")?.addEventListener("click", addEntry);
  $("searchBtn")?.addEventListener("click", searchEntryById);
  $("clearBtn")?.addEventListener("click", () => {
    $("searchId").value = "";   // reset the search box
    loadEntries();              // reload all entries
  });


  // Entries event delegation (Edit/Delete/Save/Cancel)
  $("entries")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.dataset.id || btn.closest(".entry")?.dataset.id;
    if (!id) return;
    if (btn.classList.contains("entry-delete")) return deleteEntry(id);
    if (btn.classList.contains("entry-edit")) return startEdit(id);
    if (btn.classList.contains("entry-save")) return saveEdit(id);
    if (btn.classList.contains("entry-cancel")) return cancelEdit(id);
  });

  // Auto-init per page
  if (hasEl("admin-dashboard")) {
    loadAdminDashboard();
  } else if (hasEl("dashboard")) {
    loadDashboard();
  } else if (hasEl("login-section")) {
    showLogin(); // default landing
  }
});
