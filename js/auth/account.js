function initAccountPage(tryCount = 0) {
	const accountForm = document.getElementById("accountForm");
	const nomInput = document.getElementById("NomInput");
	const prenomInput = document.getElementById("PrenomInput");
	const allergieInput = document.getElementById("AllergieInput");
	const nbConvivesInput = document.getElementById("NbConvivesInput");
	const deleteAccountBtn = document.getElementById("deleteAccountBtn");
	const accountStatus = document.getElementById("accountStatus");
	const accountApiInfo = document.getElementById("accountApiInfo");

	// Si les éléments ne sont pas encore disponibles, réessayer après un court délai (max 10 tentatives)
	if (
		!accountForm ||
		!nomInput ||
		!prenomInput ||
		!allergieInput ||
		!nbConvivesInput ||
		!deleteAccountBtn
	) {
		if (tryCount < 10) {
			setTimeout(() => initAccountPage(tryCount + 1), 30);
		}
		return;
	}
	// Vérifie que les fonctions nécessaires sont disponibles avant de continuer
	if (typeof getInfosUser !== "function" || typeof getToken !== "function") {
		return;
	}

	// Évite les doubles listeners si initAccountPage est appelée plusieurs fois.
	if (accountForm.dataset.initialized === "1") {
		return;
	}
	accountForm.dataset.initialized = "1";

	let isDeletingAccount = false;

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

	// Affiche l'URL de l'API utilisée pour aider au debug et éviter les confusions en cas de mauvais paramétrage
	if (accountApiInfo) {
		accountApiInfo.textContent = `API utilisée: ${globalThis.apiUrl || "(non définie)"}`;
	}

	// Charger les données utilisateur depuis l'API pour pré-remplir le formulaire
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

	// Listener pour la soumission du formulaire de mise à jour du compte
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

	deleteAccountBtn.addEventListener("click", async () => {
		if (isDeletingAccount) {
			return;
		}

		const confirmed = globalThis.confirm("Voulez-vous vraiment supprimer votre compte ? Cette action est definitive.");
		if (!confirmed) {
			return;
		}

		const token = getToken();
		if (!token) {
			setStatus("Session expirée. Reconnectez-vous.", "error");
			return;
		}

		setStatus("Suppression du compte en cours...", "info");
		isDeletingAccount = true;
		deleteAccountBtn.disabled = true;

		try {
			const response = await fetch((globalThis.apiUrl || "") + "account/delete", {
				method: "DELETE",
				headers: {
					"X-AUTH-TOKEN": token,
				},
			});

			if (!response.ok) {
				setStatus("Échec de la suppression du compte.", "error");
				isDeletingAccount = false;
				deleteAccountBtn.disabled = false;
				return;
			}

			setStatus("Compte supprimé. Redirection...", "success");
			if (typeof signout === "function") {
				signout();
				return;
			}

			globalThis.location.hash = "/signin";
		} catch (error) {
			console.error(error);
			setStatus("Erreur réseau pendant la suppression du compte.", "error");
			isDeletingAccount = false;
			deleteAccountBtn.disabled = false;
		}
	});
}

initAccountPage();
