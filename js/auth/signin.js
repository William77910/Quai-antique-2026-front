// Fonction d'initialisation qui s'exécute une fois que les éléments sont disponibles
function initSignin() {
  //Récupérer les input
  const mailInput = document.getElementById("EmailInput");
  const passwordInput = document.getElementById("PasswordInput");
  const btnSignin = document.getElementById("btnSignin");
  const signinForm = document.getElementById("signinForm");

  // Vérifier que les éléments existent avant d'attacher les événements
  if (!btnSignin || !mailInput || !passwordInput) {
    console.error(
      "Les éléments du formulaire de connexion ne sont pas disponibles",
    );
    return;
  }

  //Ecouteur d'évennement
  btnSignin.addEventListener("click", checkCredentials); // execute la fonction "checkCredentials" au click sur le bouton"

  function checkCredentials() {
    // cette fonction vérifie le mail et le password
    // transformation de "signinForm en dataForm"
    let dataForm = new FormData(signinForm);

    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    let raw = JSON.stringify({
      //   "firstName": dataForm.get("nom"),
      //   "lastName": dataForm.get("prenom"),
      username: dataForm.get("email"),
      password: dataForm.get("mdp"),
    });

    let requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(apiUrl+"login", requestOptions)
      // Récuprération de la réponse à la requête
      .then((response) => {
        // si la réponse est "ok"
        if (response.ok) {
          // on retourne la réponse du json
          return response.json();
          // sinon, message d'erreur
        } else {
          mailInput.classList.add("is-invalid");
          passwordInput.classList.add("is-invalid");
        }
      })
      // si l'inscription à fonctionné
      .then((result) => {
        const token = result.apiToken;
        // placer le token en cookie
        setToken(token);
        //placer le role en cookie
        setCookie(RoleCookieName, result.roles[0], 7);
        // si ok, on redirige vers la page d'accueil
        window.location.hash = "#/";
      })
      .catch((error) => console.error(error));
  }

  //Ici, les informations sont factis pour le moment, il faudra appeler l'API pour vérifier les infos en BDD
  /*if (mailInput.value == "test@mail.com" && passwordInput.value == "123") {
      //Récupération du jeton de connexion (token)
      // ici on met un token au hazard pour la simulation
      const token = "oieuyvcfcueoifbeycujehfcenfe";

      //Placer ce token en cookies
      setToken(token);

      // Ajout d'un cookie pour le rôle
      setCookie(RoleCookieName, "admin", 7);

      //Rediriger vers l'accueil via le routeur hash (évite un appel HTTP / qui tombe en 404)
      window.location.hash = "#/";
    } else {
      mailInput.classList.add("is-invalid");
      passwordInput.classList.add("is-invalid");
    }
  }*/
}

// Appeler la fonction d'initialisation quand la page est chargée
initSignin();
