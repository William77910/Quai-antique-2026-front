async function initReserver(tryCount = 0) {
  let form = document.getElementById("reserverForm");
  let nomInput = document.getElementById("NomInput");
  let prenomInput = document.getElementById("PrenomInput");
  let allergieInput = document.getElementById("AllergieInput");
  let nbConvivesInput = document.getElementById("NbConvivesInput");
  let dateInput = document.getElementById("DateInput");
  let selectHour = document.getElementById("selectHour");
  let cancelBtn = document.getElementById("cancelReserverBtn");
  const status = document.getElementById("reserverStatus");

  if (
    !form ||
    !nomInput ||
    !prenomInput ||
    !allergieInput ||
    !nbConvivesInput ||
    !dateInput ||
    !selectHour ||
    !cancelBtn ||
    !status
  ) {
    if (tryCount < 10) {
      setTimeout(() => initReserver(tryCount + 1), 30);
    }
    return;
  }

  // Cloner le formulaire pour retirer tous les anciens event listeners
  const formClone = form.cloneNode(true);
  form.parentNode.replaceChild(formClone, form);
  form = formClone;

  // Réassigner les références après le clonage
  nomInput = form.querySelector("#NomInput");
  prenomInput = form.querySelector("#PrenomInput");
  allergieInput = form.querySelector("#AllergieInput");
  nbConvivesInput = form.querySelector("#NbConvivesInput");
  dateInput = form.querySelector("#DateInput");
  selectHour = form.querySelector("#selectHour");
  cancelBtn = form.querySelector("#cancelReserverBtn");

  const setStatus = (message, type = "info") => {
    status.classList.remove("d-none", "text-success", "text-danger", "text-muted");
    if (type === "success") {
      status.classList.add("text-success");
    } else if (type === "error") {
      status.classList.add("text-danger");
    } else {
      status.classList.add("text-muted");
    }
    status.textContent = message;
  };

  const getSelectedService = () => {
    const selected = document.querySelector('input[name="serviceChoisi"]:checked');
    return selected ? selected.value : "Soir";
  };

  const loadUserInfos = async () => {
    if (typeof getInfosUser !== "function") {
      return;
    }

    const user = await getInfosUser();
    if (!user) {
      return;
    }

    nomInput.value = user.lastName || "";
    prenomInput.value = user.firstName || "";
    allergieInput.value = user.allergy || "";
    nbConvivesInput.value = user.guestNumber ?? "";
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!dateInput.value) {
      setStatus("Merci de choisir une date.", "error");
      return;
    }

    const nbConvives = Number(nbConvivesInput.value || 0);
    if (nbConvives < 1) {
      setStatus("Le nombre de convives doit être supérieur à 0.", "error");
      return;
    }

    setStatus("Enregistrement en cours...", "info");

    try {
      const payload = {
        reservationDate: dateInput.value,
        service: getSelectedService(),
        hour: selectHour.value,
        guestNumber: nbConvives,
      };

      if (allergieInput.value && allergieInput.value.trim() !== "") {
        payload.allergy = allergieInput.value;
      }

      const token = getToken ? getToken() : "";
      const response = await fetch(`${globalThis.apiUrl}reservation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "X-AUTH-TOKEN": token }),
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        setStatus("Authentification requise. Veuillez vous reconnecter.", "error");
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        setStatus(`Erreur: ${error.message || "Impossible d'enregistrer la réservation"}`, "error");
        return;
      }

      setStatus("Réservation enregistrée avec succès! Redirection...", "success");
      
      setTimeout(() => {
        globalThis.location.hash = "#/allResa";
      }, 1000);
    } catch (error) {
      setStatus(`Erreur réseau: ${error.message}`, "error");
    }
  });

  cancelBtn.addEventListener("click", () => {
    form.reset();
    loadUserInfos();
    setStatus("Saisie annulée.", "info");
  });

  await loadUserInfos();
}

// Initialiser le formulaire lorsque le DOM est prêt
// Note: Ceci est appelé depuis un script classique, pas un module ES,
// donc on ne peut pas utiliser top-level await
initReserver();
