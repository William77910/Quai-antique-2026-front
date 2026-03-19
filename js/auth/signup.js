//Implémenter le JS de ma page

//Récupérer les éléments du DOM dont j'ai besoin
// Récupérer les input de la page signup.html par son input
const inputNom = document.getElementById("NomInput"); // Input pour le nom
const inputPrenom = document.getElementById("PrenomInput");
const inputMail = document.getElementById("EmailInput");
const inputGuestNumber = document.getElementById("GuestNumberInput");
const inputAllergy = document.getElementById("AllergyInput");
const inputPassword = document.getElementById("PasswordInput");
const inputValidationPassword = document.getElementById("ValidatePasswordInput");
const btnValidation = document.getElementById("btn-validation-inscription");
const formInscription = document.getElementById("formulaireInscription");


//ajouter un écouteur d'évennement au relachement d'une touche
inputNom.addEventListener("keyup", validateForm); // validateForm est une fonction à créer, elle validera tout le formulaire
inputPrenom.addEventListener("keyup", validateForm);
inputMail.addEventListener("keyup", validateForm);
inputGuestNumber.addEventListener("keyup", validateForm);
inputGuestNumber.addEventListener("change", validateForm);
inputAllergy.addEventListener("keyup", validateForm);
inputPassword.addEventListener("keyup", validateForm);
inputValidationPassword.addEventListener("keyup", validateForm);

btnValidation.addEventListener("click", InscrireUtilisateur);

//Fonction permettant de valider tout le formulaire
function validateForm() {
  //appel de la fonction validateRequired(ci-dessous)
  const nomOk = validateRequired(inputNom);
  const prenomOk = validateRequired(inputPrenom);
  const mailOk = validateMail(inputMail);
  const guestNumberOk = validateGuestNumber(inputGuestNumber);
  const passwordOk = validatePassword(inputPassword);
  const passwordConfirmOk = validateConfirmationPassword(inputPassword, inputValidationPassword);

  if (nomOk && prenomOk && mailOk && guestNumberOk && passwordOk && passwordConfirmOk) {
    btnValidation.disabled = false;
  } else {
    btnValidation.disabled = true;
  }
}

//fonction qui valide un champs requis
function validateRequired(input) {
  //si la valeur de l'input est différente d'un champs vide
  if (input.value === "") {
    //C'est pas ok
    //Ajout de la classe Bootstrap qui invalide l'input
    input.classList.remove("is-valid");
    //Ajout de la classe Bootstrap qui annule "la validation"
    input.classList.add("is-invalid");
    return false;
  }

  //C'est ok
  //Ajout de la classe Bootstrap qui valide l'input
  input.classList.add("is-valid");
  //Ajout de la classe Bootstrap qui annule "l'invalidation"
  input.classList.remove("is-invalid");
  return true;
}

//Fonction pour valider le mail
function validateMail(input) {
  //Définir mon regex (regex = expression régulière)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mailUser = input.value;
  //vérifier si le regex est respecté dans le mail
  if (mailUser.match(emailRegex)) {
    input.classList.add("is-valid");
    input.classList.remove("is-invalid");
    return true;
  } else {
    input.classList.remove("is-valid");
    input.classList.add("is-invalid");
    return false;
  }
}

//Fonction pour valider le nombre de couverts
function validateGuestNumber(input) {
  const guestNumber = Number.parseInt(input.value, 10);
  if (Number.isInteger(guestNumber) && guestNumber >= 1) {
    input.classList.add("is-valid");
    input.classList.remove("is-invalid");
    return true;
  }

  input.classList.remove("is-valid");
  input.classList.add("is-invalid");
  return false;
}

//Fonction pour valider le mot de passe
function validatePassword(input) {
  //Définir mon regex
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
  const passwordUser = input.value;
  if (passwordUser.match(passwordRegex)) {
    input.classList.add("is-valid");
    input.classList.remove("is-invalid");
    return true;
  } else {
    input.classList.remove("is-valid");
    input.classList.add("is-invalid");
    return false;
  }
}

//Fonction pour valider la confirmation du mot de passe
function validateConfirmationPassword(inputPwd, inputConfirmPwd) {
  //Pwd = Password
  if (inputPwd.value == inputConfirmPwd.value) {
    inputConfirmPwd.classList.add("is-valid");
    inputConfirmPwd.classList.remove("is-invalid");
    return true;
  } else {
    inputConfirmPwd.classList.remove("is-valid");
    inputConfirmPwd.classList.add("is-invalid");
    return false;
  }
}

function InscrireUtilisateur() {
  //Récupérer les données de "formInscritpion" dans une variable "dataForm"
  let dataForm = new FormData(formInscription);
  const guestNumberValue = dataForm.get("guestNumber");
  const guestNumberString = typeof guestNumberValue === "string" ? guestNumberValue : "1";
  const allergyValue = dataForm.get("allergy");
  const allergyString = typeof allergyValue === "string" ? allergyValue : "";

  let myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  let raw = JSON.stringify({
    "firstName": dataForm.get("prenom"),
    "lastName": dataForm.get("nom"),
    "email": dataForm.get("email"),
    "password": dataForm.get("mdp"),
    "guestNumber": Number.parseInt(guestNumberString, 10),
    "allergy": allergyString,
  });

  let requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch(apiUrl+"registration", requestOptions)
  // Récuprération de la réponse à la requête
    .then(async (response) => {
      // En cas d'erreur, on remonte le message backend pour faciliter le debug en prod.
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Erreur HTTP ${response.status}`);
      }

      return response.json();
    })
    // si l'inscription à fonctionné
    .then(result => {
      const firstNameValue = dataForm.get("prenom");
      const firstName = typeof firstNameValue === "string" ? firstNameValue : "";
      alert("Bravo " + firstName + " vous êtes bien inscrit, vous pouvez vous connecter.");
      // on redirige l'utilisateur vers lapage de connexion
      globalThis.location.hash = "/signin";
})
    .catch((error) => {
      console.error(error);
      alert("Erreur lors de l'inscription : " + error.message);
    });
}
