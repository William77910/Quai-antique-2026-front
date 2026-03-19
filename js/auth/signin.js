// Fonction d'initialisation qui s'exécute une fois que les éléments sont disponibles
function initSignin() {
  //Récupérer les input
  const mailInput = document.getElementById("EmailInput");
  const passwordInput = document.getElementById("PasswordInput");
  const btnSignin = document.getElementById("btnSignin");
  const signinForm = document.getElementById("signinForm");
  const signinApiStatus = document.getElementById("signinApiStatus");
  const signinError = document.getElementById("signinError");

  // Vérifier que les éléments existent avant d'attacher les événements
  if (!btnSignin || !mailInput || !passwordInput || !signinForm) {
    console.error(
      "Les éléments du formulaire de connexion ne sont pas disponibles",
    );
    return;
  }

  const setErrorMessage = (message) => {
    if (!signinError) {
      return;
    }
    if (!message) {
      signinError.textContent = "";
      signinError.classList.add("d-none");
      return;
    }
    signinError.textContent = message;
    signinError.classList.remove("d-none");
  };

  const setApiStatus = (message, statusType = "info") => {
    if (!signinApiStatus) {
      return;
    }

    signinApiStatus.classList.remove(
      "text-muted",
      "text-success",
      "text-danger",
      "text-warning",
    );

    if (statusType === "success") {
      signinApiStatus.classList.add("text-success");
    } else if (statusType === "error") {
      signinApiStatus.classList.add("text-danger");
    } else if (statusType === "warning") {
      signinApiStatus.classList.add("text-warning");
    } else {
      signinApiStatus.classList.add("text-muted");
    }

    signinApiStatus.textContent = message;
  };

  const checkApiAvailability = async (alreadyRetried = false) => {
    const apiBaseUrl = globalThis.apiUrl;
    if (!apiBaseUrl) {
      setApiStatus("Configuration API absente côté front.", "error");
      return;
    }

    setApiStatus("Vérification de la connexion à l'API...", "info");

    try {
      // On vérifie le véritable endpoint d'authentification pour éviter
      // les faux positifs d'une route /api/ inexistante.
      const response = await fetch(apiBaseUrl + "login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "healthcheck@example.com",
          password: `healthcheck-${Date.now()}`,
        }),
      });
      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("text/html")) {
        // Cas typique: une ancienne valeur localStorage pointe vers le serveur front
        if (!alreadyRetried && localStorage.getItem("apiUrl")) {
          const fallbackApiUrl = globalThis.defaultApiUrl;
          localStorage.removeItem("apiUrl");
          globalThis.apiUrl = fallbackApiUrl;
          setApiStatus(
            "Ancienne URL API invalide détectée. Réinitialisation automatique en cours...",
            "warning",
          );
          await checkApiAvailability(true);
          return;
        }

        setApiStatus(
          "URL API mal configurée: cette adresse renvoie le front (HTML), pas le backend.",
          "error",
        );
      } else if (response.ok || response.status === 401 || response.status === 400) {
        setApiStatus("API détectée: vous pouvez tenter la connexion.", "success");
      } else {
        setApiStatus("API joignable mais réponse inattendue.", "warning");
      }
    } catch (error) {
      console.error("Impossible de joindre l'API au chargement", error);
      setApiStatus(
        "API non joignable pour le moment. Démarre le backend puis recharge la page.",
        "error",
      );
    }
  };

  //Ecouteur d'évennement
  btnSignin.addEventListener("click", checkCredentials); // execute la fonction "checkCredentials" au click sur le bouton"
  signinForm.addEventListener("submit", (event) => {
    event.preventDefault();
    checkCredentials();
  });

  checkApiAvailability();

  async function checkCredentials() {
    setErrorMessage("");

    const emailValue = (mailInput.value || "").trim();
    const passwordValue = passwordInput.value || "";

    if (!emailValue || !passwordValue) {
      mailInput.classList.add("is-invalid");
      passwordInput.classList.add("is-invalid");
      setErrorMessage("Merci de renseigner votre email et votre mot de passe.");
      return;
    }

    // cette fonction vérifie le mail et le password
    // transformation de "signinForm en dataForm"
    let dataForm = new FormData(signinForm);

    mailInput.classList.remove("is-invalid");
    passwordInput.classList.remove("is-invalid");

    const apiBaseUrl = globalThis.apiUrl;
    const roleCookieName = globalThis.RoleCookieName;

    if (!apiBaseUrl) {
      setErrorMessage("Configuration API introuvable côté front.");
      console.error("apiUrl est introuvable sur globalThis");
      return;
    }

    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let raw = JSON.stringify({
      // Certains backends attendent "username", d'autres "email"
      username: dataForm.get("email"),
      email: dataForm.get("email"),
      password: dataForm.get("mdp"),
    });

    let requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    try {
      const response = await fetch(apiBaseUrl + "login", requestOptions);
      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("text/html")) {
        setErrorMessage(
          "Configuration API invalide: la route de login renvoie du HTML au lieu de JSON.",
        );
        return;
      }

      if (!response.ok) {
        mailInput.classList.add("is-invalid");
        passwordInput.classList.add("is-invalid");
        setErrorMessage("Email ou mot de passe incorrect.");
        return;
      }

      const result = await response.json();
      const token = result?.apiToken || result?.token || result?.accessToken;

      if (!token) {
        console.error("Réponse de connexion invalide : token manquant", result);
        mailInput.classList.add("is-invalid");
        passwordInput.classList.add("is-invalid");
        setErrorMessage("Réponse serveur invalide : token manquant.");
        return;
      }

      // placer le token en cookie
      setToken(token);

      //placer le role en cookie si fourni
      if (Array.isArray(result?.roles) && result.roles.length > 0) {
        setCookie(roleCookieName || "role", result.roles[0], 7);
      }

      // si ok, on redirige vers la page d'accueil
      globalThis.location.hash = "#/";
    } catch (error) {
      console.error("Erreur réseau lors de la connexion", error);
      // Erreur technique: ne pas afficher l'erreur "identifiants invalides"
      mailInput.classList.remove("is-invalid");
      passwordInput.classList.remove("is-invalid");
      setErrorMessage("Impossible de joindre le serveur. Vérifie que l'API est démarrée.");
    }
  }

}

// Appeler la fonction d'initialisation quand la page est chargée
initSignin();
