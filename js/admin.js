//cette fonction gère la page d'administration, elle est appelée dans admin.html
function initAdminPage(tryCount = 0) {
  const adminPageRoot = document.getElementById("adminPageRoot");
  const adminEmail = document.getElementById("adminEmail");
  const adminFirstname = document.getElementById("adminFirstname");
  const adminLastname = document.getElementById("adminLastname");
  const adminRoles = document.getElementById("adminRoles");
  const adminCreatedAt = document.getElementById("adminCreatedAt");
  const apiBaseUrl = document.getElementById("apiBaseUrl");
  const tokenStatus = document.getElementById("tokenStatus");
  const browserInfo = document.getElementById("browserInfo");
  const currentTime = document.getElementById("currentTime");
  const accessAccount = document.getElementById("access-account");
  const accessReservations = document.getElementById("access-reservations");
  const logoutBtn = document.getElementById("logoutBtn");
  const backBtn = document.getElementById("backBtn");
  const filterName = document.getElementById("filterName");
  const filterDate = document.getElementById("filterDate");
  const filterService = document.getElementById("filterService");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");
  const adminResaStatus = document.getElementById("adminResaStatus");
  const adminReservationsBody = document.getElementById("adminReservationsBody");
  const adminUsersStatus = document.getElementById("adminUsersStatus");
  const adminUsersBody = document.getElementById("adminUsersBody");
  const adminMenuStatus = document.getElementById("adminMenuStatus");
  const adminFoodBody = document.getElementById("adminFoodBody");
  const adminCategoryBody = document.getElementById("adminCategoryBody");
  const addFoodBtn = document.getElementById("addFoodBtn");
  const addCategoryBtn = document.getElementById("addCategoryBtn");

  // Si les éléments ne sont pas encore disponibles, réessayer après un court délai (max 10 tentatives)
  if (
    !adminPageRoot ||
    !adminEmail ||
    !adminFirstname ||
    !adminLastname ||
    !adminRoles ||
    !adminCreatedAt ||
    !apiBaseUrl ||
    !tokenStatus ||
    !browserInfo ||
    !currentTime ||
    !accessAccount ||
    !accessReservations ||
    !logoutBtn ||
    !backBtn ||
    !filterName ||
    !filterDate ||
    !filterService ||
    !clearFiltersBtn ||
    !adminResaStatus ||
    !adminReservationsBody ||
    !adminUsersStatus ||
    !adminUsersBody ||
    !adminMenuStatus ||
    !adminFoodBody ||
    !adminCategoryBody ||
    !addFoodBtn ||
    !addCategoryBtn
  ) {
    if (tryCount < 10) {
      setTimeout(() => initAdminPage(tryCount + 1), 30);
    }
    return;
  }

  // Empêche les doubles initialisations (et donc les modales en double)
  if (adminPageRoot.dataset.initialized === "1") {
    return;
  }
  adminPageRoot.dataset.initialized = "1";

  let allReservations = [];
  let allUsers = [];
  let allFoods = [];
  let allCategories = [];
  let isDangerModalOpen = false;
  const cleanups = [];

  const registerCleanup = (cleanupFn) => {
    if (typeof cleanupFn === "function") {
      cleanups.push(cleanupFn);
    }
  };
// Méthode pour charger le contenu de la page en fonction de la route
  globalThis.__pageCleanup = () => {
    while (cleanups.length > 0) {
      const cleanupFn = cleanups.pop();
      try {
        cleanupFn();
      } catch (error) {
        console.error("Erreur dans un cleanup admin:", error);
      }
    }
  };

  const getHeaders = (withJson = true) => {
    const token = typeof getToken === "function" ? getToken() : "";
    return {
      ...(withJson && { "Content-Type": "application/json" }),
      ...(token && { "X-AUTH-TOKEN": token }),
    };
  };

  // Méthode pour afficher un message de statut dans la page d'administration
  const setStatus = (element, message, type = "muted") => {
    element.classList.remove("text-muted", "text-danger", "text-success");
    if (type === "error") {
      element.classList.add("text-danger");
    } else if (type === "success") {
      element.classList.add("text-success");
    } else {
      element.classList.add("text-muted");
    }
    element.textContent = message;
  };

  const getBootstrapModalClass = () => {
    if (!globalThis.bootstrap?.Modal) {
      return null;
    }
    return globalThis.bootstrap.Modal;
  };

  const buildOptionsHtml = (field) => {
    let optionsHtml = "";
    const options = Array.isArray(field.options) ? field.options : [];
    for (const opt of options) {
      const selected = String(opt.value) === String(field.value ?? "") ? " selected" : "";
      optionsHtml += `<option value="${sanitizeHtml(String(opt.value))}"${selected}>${sanitizeHtml(opt.label)}</option>`;
    }
    return optionsHtml;
  };

  const buildFieldHtml = (field) => {
    if (field.type === "select") {
      const optionsHtml = buildOptionsHtml(field);
      return `<div class="mb-3">
        <label class="form-label" for="${sanitizeHtml(field.name)}">${sanitizeHtml(field.label)}</label>
        <select class="form-select" id="${sanitizeHtml(field.name)}" name="${sanitizeHtml(field.name)}">${optionsHtml}</select>
      </div>`;
    }

    return `<div class="mb-3">
      <label class="form-label" for="${sanitizeHtml(field.name)}">${sanitizeHtml(field.label)}</label>
      <input class="form-control" id="${sanitizeHtml(field.name)}" name="${sanitizeHtml(field.name)}" type="${sanitizeHtml(field.type || "text")}" value="${sanitizeHtml(String(field.value ?? ""))}" ${field.required ? "required" : ""} />
    </div>`;
  };

  const openFormModal = ({ title, submitLabel, fields }) => {
    return new Promise((resolve) => {
      const ModalClass = getBootstrapModalClass();
      if (!ModalClass) {
        resolve(null);
        return;
      }

      const modalId = `adminModal-${Date.now()}`;
      let fieldsHtml = "";
      for (const field of fields) {
        fieldsHtml += buildFieldHtml(field);
      }

      const wrapper = document.createElement("div");
      wrapper.innerHTML = `<div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <form id="${modalId}-form">
              <div class="modal-header">
                <h5 class="modal-title">${sanitizeHtml(title)}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                ${fieldsHtml}
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                <button type="submit" class="btn btn-primary">${sanitizeHtml(submitLabel || "Enregistrer")}</button>
              </div>
            </form>
          </div>
        </div>
      </div>`;

      document.body.appendChild(wrapper);
      const modalEl = wrapper.firstElementChild;
      const formEl = modalEl.querySelector("form");
      const modal = new ModalClass(modalEl);
      let settled = false;

      formEl.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!formEl.checkValidity()) {
          formEl.reportValidity();
          return;
        }

        const values = {};
        for (const field of fields) {
          const input = formEl.querySelector(`[name="${field.name}"]`);
          values[field.name] = input ? input.value : "";
        }

        settled = true;
        modal.hide();
        resolve(values);
      });

      modalEl.addEventListener("hidden.bs.modal", () => {
        if (!settled) {
          resolve(null);
        }
        wrapper.remove();
      });

      modal.show();
    });
  };

  const openDangerConfirmModal = (message) => {
    return new Promise((resolve) => {
      if (isDangerModalOpen) {
        resolve(false);
        return;
      }

      const ModalClass = getBootstrapModalClass();
      if (!ModalClass) {
        resolve(false);
        return;
      }

      isDangerModalOpen = true;

      const modalId = `adminDangerModal-${Date.now()}`;
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `<div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title">Confirmation requise</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p>${sanitizeHtml(message)}</p>
              <p class="mb-1"><strong>Tapez SUPPRIMER pour confirmer :</strong></p>
              <input type="text" class="form-control" id="${modalId}-input" />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
              <button type="button" class="btn btn-danger" id="${modalId}-confirm" disabled>Supprimer</button>
            </div>
          </div>
        </div>
      </div>`;

      document.body.appendChild(wrapper);
      const modalEl = wrapper.firstElementChild;
      const inputEl = modalEl.querySelector(`#${modalId}-input`);
      const confirmBtn = modalEl.querySelector(`#${modalId}-confirm`);
      const modal = new ModalClass(modalEl);
      let settled = false;

      inputEl.addEventListener("input", () => {
        confirmBtn.disabled = inputEl.value.trim().toUpperCase() !== "SUPPRIMER";
      });

      confirmBtn.addEventListener("click", () => {
        settled = true;
        modal.hide();
        resolve(true);
      });

      modalEl.addEventListener("hidden.bs.modal", () => {
        isDangerModalOpen = false;
        if (!settled) {
          resolve(false);
        }
        wrapper.remove();
      });

      modal.show();
    });
  };

  const renderReservations = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      adminReservationsBody.innerHTML = "<tr><td colspan=\"7\" class=\"text-muted\">Aucune réservation trouvée.</td></tr>";
      return;
    }

    adminReservationsBody.innerHTML = items
      .map((resa) => {
        const userFirstName = resa.user?.firstName || "-";
        const userLastName = resa.user?.lastName || "-";
        const userEmail = resa.user?.email || "-";
        const allergy = resa.allergy && resa.allergy.trim() !== "" ? resa.allergy : "Aucune";

        return `<tr>
          <td><div><strong>${sanitizeHtml(userFirstName)} ${sanitizeHtml(userLastName)}</strong></div><small class="text-muted">${sanitizeHtml(userEmail)}</small></td>
          <td>${sanitizeHtml(resa.reservationDate || "-")}</td>
          <td>${sanitizeHtml(resa.service || "-")}</td>
          <td>${sanitizeHtml(resa.hour || "-")}</td>
          <td>${sanitizeHtml(String(resa.guestNumber ?? "-"))}</td>
          <td>${sanitizeHtml(allergy)}</td>
          <td><button class="btn btn-sm btn-outline-danger js-delete-resa" data-id="${sanitizeHtml(String(resa.id))}">Supprimer</button></td>
        </tr>`;
      })
      .join("");
  };

  const renderUsers = () => {
    if (!Array.isArray(allUsers) || allUsers.length === 0) {
      adminUsersBody.innerHTML = "<tr><td colspan=\"6\" class=\"text-muted\">Aucun utilisateur trouvé.</td></tr>";
      return;
    }

    adminUsersBody.innerHTML = allUsers
      .map((user) => {
        const roleLabel = (Array.isArray(user.roles) ? user.roles : []).join(", ");
        return `<tr>
          <td>${sanitizeHtml(String(user.id))}</td>
          <td>${sanitizeHtml(user.email || "-")}</td>
          <td>${sanitizeHtml((user.firstName || "") + " " + (user.lastName || ""))}</td>
          <td>${sanitizeHtml(roleLabel || "ROLE_USER")}</td>
          <td>${sanitizeHtml(String(user.guestNumber ?? "-"))}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary js-edit-user" data-id="${sanitizeHtml(String(user.id))}">Modifier</button>
            <button class="btn btn-sm btn-outline-danger js-delete-user" data-id="${sanitizeHtml(String(user.id))}">Supprimer</button>
          </td>
        </tr>`;
      })
      .join("");
  };

  const renderMenu = () => {
    adminFoodBody.innerHTML = allFoods.length
      ? allFoods
          .map((food) => `<tr>
            <td>${sanitizeHtml(String(food.id))}</td>
            <td>${sanitizeHtml(food.title || "-")}</td>
            <td>${sanitizeHtml(food.description || "-")}</td>
            <td>${sanitizeHtml(String(food.price || "-"))}</td>
            <td>
              <button class="btn btn-sm btn-outline-primary js-edit-food" data-id="${sanitizeHtml(String(food.id))}">Modifier</button>
              <button class="btn btn-sm btn-outline-danger js-delete-food" data-id="${sanitizeHtml(String(food.id))}">Supprimer</button>
            </td>
          </tr>`)
          .join("")
      : "<tr><td colspan=\"5\" class=\"text-muted\">Aucun plat trouvé.</td></tr>";

    adminCategoryBody.innerHTML = allCategories.length
      ? allCategories
          .map((category) => `<tr>
            <td>${sanitizeHtml(String(category.id))}</td>
            <td>${sanitizeHtml(category.title || "-")}</td>
            <td>
              <button class="btn btn-sm btn-outline-primary js-edit-category" data-id="${sanitizeHtml(String(category.id))}">Modifier</button>
              <button class="btn btn-sm btn-outline-danger js-delete-category" data-id="${sanitizeHtml(String(category.id))}">Supprimer</button>
            </td>
          </tr>`)
          .join("")
      : "<tr><td colspan=\"3\" class=\"text-muted\">Aucune catégorie trouvée.</td></tr>";
  };

  const applyResaFilters = () => {
    const name = (filterName.value || "").toLowerCase().trim();
    const date = (filterDate.value || "").trim();
    const service = (filterService.value || "").trim();

    const filtered = allReservations.filter((resa) => {
      const fullName = `${resa.user?.firstName || ""} ${resa.user?.lastName || ""}`.toLowerCase();
      const matchesName = !name || fullName.includes(name);
      const matchesDate = !date || (resa.reservationDate || "") === date;
      const matchesService = !service || (resa.service || "") === service;
      return matchesName && matchesDate && matchesService;
    });

    renderReservations(filtered);
    setStatus(adminResaStatus, `${filtered.length} réservation(s) affichée(s) sur ${allReservations.length}.`);
  };

  const loadReservations = async () => {
    setStatus(adminResaStatus, "Chargement des réservations...");
    try {
      const response = await fetch(`${globalThis.apiUrl}reservation`, { method: "GET", headers: getHeaders() });
      if (!response.ok) {
        setStatus(adminResaStatus, "Impossible de charger les réservations.", "error");
        return;
      }
      const data = await response.json();
      allReservations = Array.isArray(data) ? data : [];
      applyResaFilters();
    } catch (error) {
      setStatus(adminResaStatus, `Erreur réseau: ${error.message}`, "error");
    }
  };

  const loadUsers = async () => {
    setStatus(adminUsersStatus, "Chargement des comptes...");
    try {
      const response = await fetch(`${globalThis.apiUrl}admin/users`, { method: "GET", headers: getHeaders() });
      if (!response.ok) {
        setStatus(adminUsersStatus, "Impossible de charger les comptes.", "error");
        return;
      }
      const data = await response.json();
      allUsers = Array.isArray(data) ? data : [];
      renderUsers();
      setStatus(adminUsersStatus, `${allUsers.length} compte(s) chargé(s).`, "success");
    } catch (error) {
      setStatus(adminUsersStatus, `Erreur réseau: ${error.message}`, "error");
    }
  };

  const loadMenu = async () => {
    setStatus(adminMenuStatus, "Chargement de la carte...");
    try {
      const [foodsResp, categoriesResp] = await Promise.all([
        fetch(`${globalThis.apiUrl}food`, { method: "GET", headers: getHeaders() }),
        fetch(`${globalThis.apiUrl}category`, { method: "GET", headers: getHeaders() }),
      ]);

      if (!foodsResp.ok || !categoriesResp.ok) {
        setStatus(adminMenuStatus, "Impossible de charger la carte.", "error");
        return;
      }

      const foods = await foodsResp.json();
      const categories = await categoriesResp.json();
      allFoods = Array.isArray(foods) ? foods : [];
      allCategories = Array.isArray(categories) ? categories : [];
      renderMenu();
      setStatus(adminMenuStatus, `${allFoods.length} plat(s) et ${allCategories.length} catégorie(s).`, "success");
    } catch (error) {
      setStatus(adminMenuStatus, `Erreur réseau: ${error.message}`, "error");
    }
  };

  const deleteReservation = async (id) => {
    const confirmed = await openDangerConfirmModal("Voulez-vous supprimer cette réservation ? Cette action est irréversible.");
    if (!confirmed) {
      return;
    }

    const response = await fetch(`${globalThis.apiUrl}reservation/${id}`, {
      method: "DELETE",
      headers: getHeaders(false),
    });

    if (!response.ok) {
      setStatus(adminResaStatus, "Suppression impossible.", "error");
      return;
    }

    setStatus(adminResaStatus, "Réservation supprimée.", "success");
    await loadReservations();
  };

  const editUser = async (id) => {
    const user = allUsers.find((u) => String(u.id) === String(id));
    if (!user) {
      return;
    }

    const values = await openFormModal({
      title: `Modifier le compte #${user.id}`,
      submitLabel: "Enregistrer",
      fields: [
        { name: "email", label: "Email", type: "email", value: user.email || "", required: true },
        { name: "firstName", label: "Prénom", type: "text", value: user.firstName || "", required: true },
        { name: "lastName", label: "Nom", type: "text", value: user.lastName || "", required: true },
        { name: "guestNumber", label: "Nombre de convives", type: "number", value: String(user.guestNumber ?? 0), required: true },
        {
          name: "role",
          label: "Rôle",
          type: "select",
          value: (Array.isArray(user.roles) && user.roles.includes("ROLE_ADMIN")) ? "admin" : "user",
          options: [
            { value: "user", label: "Utilisateur" },
            { value: "admin", label: "Administrateur" },
          ],
        },
      ],
    });

    if (!values) {
      return;
    }

    const response = await fetch(`${globalThis.apiUrl}admin/users/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        guestNumber: Number(values.guestNumber),
        roles: values.role === "admin" ? ["ROLE_ADMIN", "ROLE_USER"] : ["ROLE_USER"],
      }),
    });

    if (!response.ok) {
      setStatus(adminUsersStatus, "Modification du compte impossible.", "error");
      return;
    }

    setStatus(adminUsersStatus, "Compte mis à jour.", "success");
    await loadUsers();
  };

  const deleteUser = async (id) => {
    const confirmed = await openDangerConfirmModal("Voulez-vous supprimer ce compte utilisateur ? Cette action est irréversible.");
    if (!confirmed) {
      return;
    }

    const response = await fetch(`${globalThis.apiUrl}admin/users/${id}`, {
      method: "DELETE",
      headers: getHeaders(false),
    });

    if (!response.ok) {
      setStatus(adminUsersStatus, "Suppression du compte impossible.", "error");
      return;
    }

    setStatus(adminUsersStatus, "Compte supprimé.", "success");
    await loadUsers();
  };

  const addFood = async () => {
    const values = await openFormModal({
      title: "Ajouter un plat",
      submitLabel: "Créer",
      fields: [
        { name: "title", label: "Titre", type: "text", value: "", required: true },
        { name: "description", label: "Description", type: "text", value: "", required: true },
        { name: "price", label: "Prix", type: "number", value: "0.00", required: true },
      ],
    });

    if (!values) {
      return;
    }

    const response = await fetch(`${globalThis.apiUrl}food`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        title: values.title,
        description: values.description,
        price: values.price,
      }),
    });

    if (!response.ok) {
      setStatus(adminMenuStatus, "Ajout du plat impossible.", "error");
      return;
    }

    setStatus(adminMenuStatus, "Plat ajouté.", "success");
    await loadMenu();
  };

  const editFood = async (id) => {
    const food = allFoods.find((f) => String(f.id) === String(id));
    if (!food) {
      return;
    }

    const values = await openFormModal({
      title: `Modifier le plat #${food.id}`,
      submitLabel: "Enregistrer",
      fields: [
        { name: "title", label: "Titre", type: "text", value: food.title || "", required: true },
        { name: "description", label: "Description", type: "text", value: food.description || "", required: true },
        { name: "price", label: "Prix", type: "number", value: String(food.price || "0.00"), required: true },
      ],
    });

    if (!values) {
      return;
    }

    const response = await fetch(`${globalThis.apiUrl}food/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({
        title: values.title,
        description: values.description,
        price: values.price,
      }),
    });

    if (!response.ok) {
      setStatus(adminMenuStatus, "Modification du plat impossible.", "error");
      return;
    }

    setStatus(adminMenuStatus, "Plat mis à jour.", "success");
    await loadMenu();
  };

  const deleteFood = async (id) => {
    const confirmed = await openDangerConfirmModal("Voulez-vous supprimer ce plat ? Cette action est irréversible.");
    if (!confirmed) {
      return;
    }

    const response = await fetch(`${globalThis.apiUrl}food/${id}`, {
      method: "DELETE",
      headers: getHeaders(false),
    });

    if (!response.ok) {
      setStatus(adminMenuStatus, "Suppression du plat impossible.", "error");
      return;
    }

    setStatus(adminMenuStatus, "Plat supprimé.", "success");
    await loadMenu();
  };

  const addCategory = async () => {
    const values = await openFormModal({
      title: "Ajouter une catégorie",
      submitLabel: "Créer",
      fields: [{ name: "title", label: "Titre", type: "text", value: "", required: true }],
    });

    if (!values) {
      return;
    }

    const response = await fetch(`${globalThis.apiUrl}category`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ title: values.title }),
    });

    if (!response.ok) {
      setStatus(adminMenuStatus, "Ajout de catégorie impossible.", "error");
      return;
    }

    setStatus(adminMenuStatus, "Catégorie ajoutée.", "success");
    await loadMenu();
  };

  const editCategory = async (id) => {
    const category = allCategories.find((c) => String(c.id) === String(id));
    if (!category) {
      return;
    }

    const values = await openFormModal({
      title: `Modifier la catégorie #${category.id}`,
      submitLabel: "Enregistrer",
      fields: [{ name: "title", label: "Titre", type: "text", value: category.title || "", required: true }],
    });

    if (!values) {
      return;
    }

    const response = await fetch(`${globalThis.apiUrl}category/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ title: values.title }),
    });

    if (!response.ok) {
      setStatus(adminMenuStatus, "Modification de catégorie impossible.", "error");
      return;
    }

    setStatus(adminMenuStatus, "Catégorie mise à jour.", "success");
    await loadMenu();
  };

  const deleteCategory = async (id) => {
    const confirmed = await openDangerConfirmModal("Voulez-vous supprimer cette catégorie ? Cette action est irréversible.");
    if (!confirmed) {
      return;
    }

    const response = await fetch(`${globalThis.apiUrl}category/${id}`, {
      method: "DELETE",
      headers: getHeaders(false),
    });

    if (!response.ok) {
      setStatus(adminMenuStatus, "Suppression de catégorie impossible.", "error");
      return;
    }

    setStatus(adminMenuStatus, "Catégorie supprimée.", "success");
    await loadMenu();
  };

  if (typeof getInfosUser === "function") {
    getInfosUser().then((user) => {
      if (user) {
        adminEmail.textContent = user.email || "-";
        adminFirstname.textContent = user.firstName || "-";
        adminLastname.textContent = user.lastName || "-";
        adminRoles.textContent = (Array.isArray(user.roles) ? user.roles : []).join(", ") || "ROLE_USER";
        adminCreatedAt.textContent = user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "-";
      }
    });
  }

  apiBaseUrl.textContent = globalThis.apiUrl || "(non configurée)";
  tokenStatus.textContent = typeof getToken === "function" && getToken() ? "Présent" : "Absent";
  browserInfo.textContent = navigator.userAgent.substring(0, 60) + "...";

  const updateTime = () => {
    currentTime.textContent = new Date().toLocaleString("fr-FR");
  };
  updateTime();
  const clockIntervalId = setInterval(updateTime, 1000);
  registerCleanup(() => clearInterval(clockIntervalId));

  // Nettoie les restes de modales si l'utilisateur change de page en plein milieu
  registerCleanup(() => {
    document.querySelectorAll(".modal.show").forEach((modalEl) => {
      modalEl.classList.remove("show");
      modalEl.setAttribute("aria-hidden", "true");
      modalEl.style.display = "none";
    });
    document.querySelectorAll(".modal-backdrop").forEach((backdrop) => backdrop.remove());
    document.body.classList.remove("modal-open");
    document.body.style.removeProperty("padding-right");
    document.body.style.removeProperty("overflow");
  });

  accessAccount.className = "badge bg-success";
  accessAccount.textContent = "Accordé";
  accessReservations.className = "badge bg-success";
  accessReservations.textContent = "Accordé";

  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    globalThis.location.hash = "#/";
  });

  backBtn.addEventListener("click", () => {
    globalThis.location.hash = "#/";
  });

  filterName.addEventListener("input", applyResaFilters);
  filterDate.addEventListener("change", applyResaFilters);
  filterService.addEventListener("change", applyResaFilters);

  clearFiltersBtn.addEventListener("click", () => {
    filterName.value = "";
    filterDate.value = "";
    filterService.value = "";
    applyResaFilters();
  });

  addFoodBtn.addEventListener("click", addFood);
  addCategoryBtn.addEventListener("click", addCategory);

  adminReservationsBody.addEventListener("click", (event) => {
    const button = event.target.closest(".js-delete-resa");
    if (button?.dataset.id) {
      deleteReservation(button.dataset.id);
    }
  });

  adminUsersBody.addEventListener("click", (event) => {
    const editButton = event.target.closest(".js-edit-user");
    const deleteButton = event.target.closest(".js-delete-user");
    if (editButton?.dataset.id) {
      editUser(editButton.dataset.id);
    }
    if (deleteButton?.dataset.id) {
      deleteUser(deleteButton.dataset.id);
    }
  });

  adminFoodBody.addEventListener("click", (event) => {
    const editButton = event.target.closest(".js-edit-food");
    const deleteButton = event.target.closest(".js-delete-food");
    if (editButton?.dataset.id) {
      editFood(editButton.dataset.id);
    }
    if (deleteButton?.dataset.id) {
      deleteFood(deleteButton.dataset.id);
    }
  });

  adminCategoryBody.addEventListener("click", (event) => {
    const editButton = event.target.closest(".js-edit-category");
    const deleteButton = event.target.closest(".js-delete-category");
    if (editButton?.dataset.id) {
      editCategory(editButton.dataset.id);
    }
    if (deleteButton?.dataset.id) {
      deleteCategory(deleteButton.dataset.id);
    }
  });

  loadReservations();
  loadUsers();
  loadMenu();
}

initAdminPage();
