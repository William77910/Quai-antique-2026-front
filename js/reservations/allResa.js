async function initAllResa(tryCount = 0) {
  const allReservationsContainer = document.querySelector(".allreservations");
  if (!allReservationsContainer) {
    if (tryCount < 10) {
      setTimeout(() => initAllResa(tryCount + 1), 30);
    }
    return;
  }

  try {
    const token = getToken ? getToken() : "";
    const response = await fetch(`${globalThis.apiUrl}reservation`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { "X-AUTH-TOKEN": token }),
      },
    });

    if (response.status === 401) {
      allReservationsContainer.innerHTML = 
        '<p class="text-danger">Authentification requise. Veuillez vous reconnecter.</p>';
      return;
    }

    if (!response.ok) {
      allReservationsContainer.innerHTML = 
        '<p class="text-danger">Erreur lors du chargement des réservations.</p>';
      return;
    }

    const reservations = await response.json();

    // Vérifier si l'utilisateur est admin
    const userRole = typeof getRole === "function" ? getRole() : null;
    const isAdmin = userRole === "ROLE_ADMIN" || userRole === "admin";

    if (!Array.isArray(reservations) || reservations.length === 0) {
      allReservationsContainer.innerHTML = 
        '<p class="text-muted">Aucune réservation pour le moment.</p>';
      return;
    }

    const html = reservations
      .map((resa) => {
        const allergy = resa.allergy && resa.allergy.trim() !== "" 
          ? resa.allergy 
          : "Pas d'allergie";
        const userInfo = isAdmin && resa.user 
          ? `${sanitizeHtml(resa.user.firstName || '')} ${sanitizeHtml(resa.user.lastName || '')}`
          : '';
        
        if (isAdmin) {
          return `<a href="#">
            <span><strong>${userInfo}</strong></span>
            <span>${sanitizeHtml(resa.reservationDate || "-")}</span>
            <span>${sanitizeHtml(resa.hour || "-")}</span>
            <span>${sanitizeHtml(String(resa.guestNumber || "-"))} personnes</span>
            <span>${sanitizeHtml(allergy)}</span>
          </a>`;
        } else {
          return `<a href="#">
            <span>${sanitizeHtml(resa.reservationDate || "-")}</span>
            <span>${sanitizeHtml(resa.hour || "-")}</span>
            <span>${sanitizeHtml(String(resa.guestNumber || "-"))} personnes</span>
            <span>${sanitizeHtml(allergy)}</span>
          </a>`;
        }
      })
      .join("");

    allReservationsContainer.innerHTML = html;
  } catch (error) {
    allReservationsContainer.innerHTML = 
      `<p class="text-danger">Erreur réseau: ${sanitizeHtml(error.message)}</p>`;
  }
}

// Charger les réservations lorsque le DOM est prêt
// Note: Ceci est appelé depuis un script classique, pas un module ES,
// donc on ne peut pas utiliser top-level await
initAllResa();
