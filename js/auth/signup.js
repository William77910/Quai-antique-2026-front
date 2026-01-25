//Implémenter le JS de ma page

//Récupérer les éléments du DOM dont j'ai besoin
// Récupérer les input de la page signup.html par son input
const inputNom = document.getElementById("NomInput"); // Input pour le nom
const inputPrenom = document.getElementById("PrenomInput");
const inputMail = document.getElementById("EmailInput");
const inputPassword = document.getElementById("PasswordInput");
const inputValidationPassword = document.getElementById("ValidatePasswordInput");
const btnValidation = document.getElementById("btn-validation-inscription");

//ajouter un écouteur d'évennement au relachement d'une touche
inputNom.addEventListener("keyup", validateForm); // validateForm est une fonction à créer, elle validera tout le formulaire
inputPrenom.addEventListener("keyup", validateForm);
inputMail.addEventListener("keyup", validateForm);
inputPassword.addEventListener("keyup", validateForm);
inputValidationPassword.addEventListener("keyup", validateForm);

btnValidation.addEventListener("click", InscrireUtilisateur);

//FOnction permettant de valider tout le formulaire
function validateForm(){
  //appel de la fonction validateRequired(ci-dessous)
  const nomOk = validateRequired(inputNom);
  const prenomOk = validateRequired(inputPrenom);
  const mailOk = validateMail(inputMail);
  const passwordOk = validatePassword(inputPassword);
  const passwordConfirmOk = validateConfirmationPassword(inputPassword, inputValidationPassword);

  if(nomOk && prenomOk && mailOk && passwordOk && passwordConfirmOk){
    btnValidation.disabled = false;
  }
  else{
    btnValidation.disabled = true;
  }
}

//fonction qui valide un champs requis
function validateRequired(input){
  //si la valeur de l'input est différente d'un champs vide
  if(input.value !=''){
    //C'est ok
    //Ajout de la classe Bootstrap qui valide l'input
    input.classList.add("is-valid");
    //Ajout de la classe Bootstrap qui annule "l'invalidation"
    input.classList.remove("is-invalid");
    return true;
  }
  //sinon
  else{
    //C'est pas ok
    //Ajout de la classe Bootstrap qui invalide l'input
    input.classList.remove("is-valid");
    //Ajout de la classe Bootstrap qui annule "la validation"
    input.classList.add("is-invalid");
    return false;
  }
}

//Fonction pour valider le mail
function validateMail(input){
  //Définir mon regex (regex = expression régulière)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mailUser = input.value;
    //vérifier si le regex est respecté dans le mail
    if(mailUser.match(emailRegex)){
        input.classList.add("is-valid");
        input.classList.remove("is-invalid"); 
        return true;
    }
    else{
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        return false;
    }
}

//Fonction pour valider le mot de passe
function validatePassword(input){
    //Définir mon regex
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
    const passwordUser = input.value;
    if(passwordUser.match(passwordRegex)){
        input.classList.add("is-valid");
        input.classList.remove("is-invalid"); 
        return true;
    }
    else{
        input.classList.remove("is-valid");
        input.classList.add("is-invalid");
        return false;
    }
}

//Fonction pour valider la confirmation du mot de passe
function validateConfirmationPassword(inputPwd, inputConfirmPwd){  //Pwd = Password
  if(inputPwd.value == inputConfirmPwd.value){
    inputConfirmPwd.classList.add("is-valid");
    inputConfirmPwd.classList.remove("is-invalid");
    return true;
  }
  else{
        inputConfirmPwd.classList.remove("is-valid");
        inputConfirmPwd.classList.add("is-invalid");
        return false;
    }
}

function InscrireUtilisateur(){
  let myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

let raw = JSON.stringify({
  "firstName": "Test 3 fetch",
  "lastName": "Teste 3 fetch",
  "email": "test3depuisquaiantique@mail.com",
  "password": "123"
});

let requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: raw,
  redirect: "follow"
};

fetch("http://127.0.0.1:8000/api/registration", requestOptions)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
}