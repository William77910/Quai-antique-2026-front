// Fonction d'initialisation qui s'exécute une fois que les éléments sont disponibles
function initSignin() {
  //Récupérer les input
  const mailInput = document.getElementById("EmailInput");
  const passwordInput = document.getElementById("PasswordInput");
  const btnSignin = document.getElementById("btnSignin");

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
    //Ici, les informations sont factis pour le moment, il faudra appeler l'API pour vérifier les infos en BDD

    if (mailInput.value == "test@mail.com" && passwordInput.value == "123") {
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
  }
}

// Exécuter l'initialisation immédiatement
initSignin();
