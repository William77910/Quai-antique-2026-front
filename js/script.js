// Ces méthodes peuvent se trouver sur internet

// La connexion
//Variable pour stocker le cookie de connexion, ici c'est le cookie rentré à la main dans la page singnin.js
const tokenCookieName = "accesstoken";
const apiUrl = "http://localhost:8000/api/";

//Méthode pour placer le token en cookie
function setToken(token) {
  setCookie(tokenCookieName, token, 7); // Le token sera stocké pendant 7 jours
}
//Méthode pour récupérer le token en cookie
function getToken() {
  return getCookie(tokenCookieName);
}

//Méthode pour placer un cookie
function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

//Méthode pour récupérer un cookie
function getCookie(name) {
  let nameEQ = name + "=";
  let ca = document.cookie.split(";");
  for (const element of ca) {
    let c = element;
    while (c.startsWith(" ")) c = c.substring(1, c.length);
    if (c.startsWith(nameEQ)) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

//Méthode pour supprimer un cookie
function eraseCookie(name) {
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

//Fonction pour savoir si l'utilisateur est connecté ou non
function isConnected() {
  if (getToken() == null || getToken() == undefined) {
    return false;
  } else {
    return true;
  }
}

//Test de la connexion
/*
if(isConnected()){
  alert("Je suis connecté");
}
else{
  alert("Je ne suis pas connecté");
}
*/

// La déconnexion
//Récupérer le bouton déconnexion dans la variable signoutBtn
const signoutBtn = document.getElementById("signout-btn");
//Recupérer le cookie du rôle
const RoleCookieName = "role";
//Ajouter un écouteur d'évènement au clic sur le bouton déconnexion
signoutBtn.addEventListener("click", signout);
//Méthode pour déconnecter l'utilisateur
function signout() {
  //Supprimer le cookie de connexion
  eraseCookie(tokenCookieName);
  eraseCookie(RoleCookieName);
  //Rediriger l'utilisateur vers la page de connexion
  // Navigation via hash pour rester dans la SPA et éviter le 404 sur /
  window.location.hash = "/signin";
}

//Récupération du rôle de l'utilisateur
function getRole() {
  return getCookie(RoleCookieName);
}

/* Les différents rôles
disconnected
connected (admin, client)
  - admin
  - client
*/

//Fonction pour afficher et masquer les éléments selon le rôle
function showAndHideElementsForRoles() {
  //stockage de l'état de connexion de l'utilisateur dans une variable "userConnected"
  const userConnected = isConnected();
  // récupérer le rôle de l'utilisateur
  const role = getRole();
  // récupérer les éléments qui ont l'attribut "data-show"
  let allElementsToEdit = document.querySelectorAll("[data-show]");

  allElementsToEdit.forEach((element) => {
    // reset l'état avant d'appliquer les règles
    element.classList.remove("d-none");

    switch (element.dataset.show) {
      case "disconnected":
        if (userConnected) {
          element.classList.add("d-none"); // d-none = display none => class bootstrap
        }
        break;

      case "connected":
        if (!userConnected) {
          element.classList.add("d-none");
        }
        break;

      case "admin":
        if (!userConnected || role != "admin") {
          element.classList.add("d-none");
        }
        break;

      case "client":
        if (!userConnected || role != "client") {
          element.classList.add("d-none");
        }
        break;
    }
  });
}

//Fonction pour traiter le texte comme du texte pour éviter les injections html dans les formulaires
// (comme celui de l'édition de photo par example)
function sanitizeHtml(text){
  //création d'une constante qui contiendra une div
  const tempHtml = document.createElement('div');
  // le contenu de tempHtml sera du text
  tempHtml.textContent = text;
  //nous retournons du text donc si du code est tapé, il sera interprété comme du texte
  return tempHtml.innerHTML;
}

//Fonction pour récupérer les infos de l'utilisateur
function getInfosUser(){

  let myHeaders = new Headers();
  // Récupérer le token de l'api
  myHeaders.append("X-AUTH-TOKEN", getToken());

  let requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    };
  
  // envoi de la requête
  fetch(apiUrl+"account/me", requestOptions)
  // après la réponse
  .then(response =>{
    //si réponse ok
    if(response.ok){
      //on retourne le json
      return response.json();
    }
    //sinon
    else{
      console.log("Impossible de récupérer les informations utilisateur");
    }
  })
  // puis récupérer un result
  .then(result => {
    return result;
  })
  // s'il y a une erreur, récupérer l'erreur
  .catch(error =>{
    console.error("Erreur lors de la récupérations des données utilisateur", error);
  });
}