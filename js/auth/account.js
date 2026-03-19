function initAccountPage(tryCount = 0) {
	const accountForm = document.getElementById("accountForm");
	const nomInput = document.getElementById("NomInput");
	const prenomInput = document.getElementById("PrenomInput");
	const allergieInput = document.getElementById("AllergieInput");
	const nbConvivesInput = document.getElementById("NbConvivesInput");
	const accountStatus = document.getElementById("accountStatus");
	const accountApiInfo = document.getElementById("accountApiInfo");

	if (
		!accountForm ||
		!nomInput ||
		!prenomInput ||
		!allergieInput ||
		!nbConvivesInput
	) {
		if (tryCount < 10) {
			setTimeout(() => initAccountPage(tryCount + 1), 30);
		}
		return;
	}

	if (typeof getInfosUser !== "function" || typeof getToken !== "function") {
		return;
	}

	const setStatus = (message, type = "info") => {
		if (!accountStatus) {
			return;
		}

		accountStatus.classList.remove("d-none", "text-success", "text-danger", "text-muted");
		if (type === "success") {
			accountStatus.classList.add("text-success");
		} else if (type === "error") {
			accountStatus.classList.add("text-danger");
		} else {
			accountStatus.classList.add("text-muted");
		}

		accountStatus.textContent = message;
	};

	if (accountApiInfo) {
		accountApiInfo.textContent = `API utilisée: ${globalThis.apiUrl || "(non définie)"}`;
	}

	getInfosUser().then((user) => {
		if (!user) {
			setStatus("Impossible de charger vos données depuis l'API.", "error");
			return;
		}

		nomInput.value = user.lastName || "";
		prenomInput.value = user.firstName || "";
		allergieInput.value = user.allergy || "";
		nbConvivesInput.value = user.guestNumber ?? "";
		setStatus("Données chargées depuis l'API.", "success");
	});

	accountForm.addEventListener("submit", async (event) => {
		event.preventDefault();

		const token = getToken();
		if (!token) {
			setStatus("Session expirée. Reconnectez-vous.", "error");
			return;
		}

		const payload = {
			firstName: prenomInput.value,
			lastName: nomInput.value,
			allergy: allergieInput.value,
			guestNumber: Number(nbConvivesInput.value || 0),
		};

		setStatus("Enregistrement en cours...", "info");

		try {
			const response = await fetch((globalThis.apiUrl || "") + "account/edit", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					"X-AUTH-TOKEN": token,
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				setStatus("Échec de l'enregistrement. Vérifiez les champs.", "error");
				return;
			}

			setStatus("Compte mis à jour avec succès.", "success");
		} catch (error) {
			console.error(error);
			setStatus("Erreur réseau pendant l'enregistrement.", "error");
		}
	});
}

initAccountPage();
