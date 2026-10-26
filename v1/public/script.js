
const $ = id => document.getElementById(id);

const dialog = $("customerDialog");
const form = $("customerForm");
const table = $("customerTable");

let features = [];
let customers = [];
let editingId = null;
let toastTimer;

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }

  return data;
}

function safe(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[ch]);
}

function notify(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(
    () => $("toast").classList.remove("show"), 2500
  );
}

function configureVersion(info) {
  features = info.features || [];

  $("version").textContent = info.version;
  $("apiStatus").textContent = "Connected";
  document.querySelector(".status-dot").style.background = "#15945c";

  $("customerDirectory").hidden = !features.includes("view");
  $("customersNav").hidden = !features.includes("view");

  $("featureHeading").textContent = features.includes("update")
    ? "Customer directory"
    : features.includes("view")
      ? "Customer directory"
      : "Add customer";

  $("featureDescription").textContent = features.includes("update")
    ? "View and update customer information."
    : features.includes("view")
      ? "View and search your customer records."
      : "Register customer information in the CRM.";

  $("actionsHeading").hidden = !features.includes("update");
}

async function refreshCustomers() {
  if (!features.includes("view")) return;

  try {
    const search = $("searchInput").value.trim();
    customers = await api(
      `/api/customers?search=${encodeURIComponent(search)}`
    );

    $("totalCount").textContent = customers.length;
    $("emailCount").textContent =
      customers.filter(c => c.email).length;

    $("resultCount").textContent =
      `${customers.length} customer${customers.length === 1 ? "" : "s"}`;

    if (!customers.length) {
      table.innerHTML =
        '<tr><td colspan="4" class="empty">No customers found.</td></tr>';
      return;
    }

    table.innerHTML = customers.map(c => `
      <tr>
        <td><span class="customer-name">${safe(c.name)}</span></td>
        <td>${safe(c.email)}</td>
        <td>${safe(c.phone || "—")}</td>
        ${features.includes("update") ? `
          <td>
            <button class="action-btn"
              data-edit="${c.id}">Edit</button>
          </td>
        ` : ""}
      </tr>
    `).join("");
  } catch (error) {
    notify(error.message);
  }
}

function openForm(customer = null) {
  editingId = customer ? customer.id : null;
  form.reset();

  $("dialogTitle").textContent = customer
    ? "Update customer"
    : "Add customer";

  $("saveBtn").textContent = customer
    ? "Update customer"
    : "Save customer";

  $("formError").textContent = "";

  if (customer) {
    form.elements.name.value = customer.name;
    form.elements.email.value = customer.email;
    form.elements.phone.value = customer.phone || "";
  }

  dialog.showModal();
}

$("addBtn").addEventListener("click", () => openForm());

$("closeBtn").addEventListener("click", () => dialog.close());
$("cancelBtn").addEventListener("click", () => dialog.close());

$("searchInput").addEventListener("input", refreshCustomers);

table.addEventListener("click", event => {
  const button = event.target.closest("[data-edit]");
  if (!button) return;

  const customer = customers.find(
    c => c.id === Number(button.dataset.edit)
  );

  if (customer) openForm(customer);
});

form.addEventListener("submit", async event => {
  event.preventDefault();

  const payload = {
    name: form.elements.name.value.trim(),
    email: form.elements.email.value.trim(),
    phone: form.elements.phone.value.trim()
  };

  const button = $("saveBtn");
  button.disabled = true;
  $("formError").textContent = "";

  try {
    const isUpdate = editingId !== null;

    await api(
      isUpdate
        ? `/api/customers/${editingId}`
        : "/api/customers",
      {
        method: isUpdate ? "PUT" : "POST",
        body: JSON.stringify(payload)
      }
    );

    dialog.close();
    notify(isUpdate
      ? "Customer updated successfully!"
      : "Customer added successfully!");

    if (features.includes("view")) {
      await refreshCustomers();
    } else {
      $("customerSummary").textContent =
        "Customer saved successfully";
      $("totalCount").textContent = "Saved";
      $("emailCount").textContent = "Saved";
    }
  } catch (error) {
    $("formError").textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

async function initialize() {
  try {
    const info = await api("/api");
    configureVersion(info);

    if (features.includes("view")) {
      await refreshCustomers();
    } else {
      $("totalCount").textContent = "—";
      $("emailCount").textContent = "—";
    }
  } catch (error) {
    $("apiStatus").textContent = "Disconnected";
    notify("Unable to connect to the CRM backend.");
  }
}

initialize();
