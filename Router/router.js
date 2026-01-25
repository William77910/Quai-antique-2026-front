import Route from "./Route.js";
import { allRoutes, websiteName } from "./allRoutes.js";

// Création d'une route pour la page 404 (page introuvable)
const route404 = new Route("404", "Page introuvable", "pages/404.html", []);

// Fonction pour récupérer la route correspondant à une URL donnée
const getRouteByUrl = (url) => {
  let currentRoute = null;
  // Parcours de toutes les routes pour trouver la correspondance
  allRoutes.forEach((element) => {
    // Correspondance stricte ou correspondance par fin d'URL (sous-dossier)
    if (element.url === url || url.endsWith(element.url)) {
      currentRoute = element;
    }
  });
  // Si aucune correspondance n'est trouvée, on retourne la route 404
  if (currentRoute != null) {
    return currentRoute;
  } else {
    return route404;
  }
};

// Fonction pour charger le contenu de la page
const LoadContentPage = async () => {
  // Extraire la route du hash (#/route) ou utiliser "/" par défaut
  const hash = window.location.hash.slice(1) || "/";
  // Récupération de l'URL actuelle
  const actualRoute = getRouteByUrl(hash);

  //Vérifier les droits d'accès à la page
  const allRolesArray = actualRoute.authorize;
  // si la taille du tableau "allRolesArray" est suppérieure à 0
  if (allRolesArray.length > 0) {
    // si le tableau contient un rôle déconnecté
    if (allRolesArray.includes("disconnected")) {
      // on le rejète
      if (isConnected()) {
        // et on le redirige vers la page accueil
        window.location.hash = "#/";
      }
    } else {
      // récupérer le rôle de l'utilisateur dans une variable
      const roleUser = getRole();
      // si le tableau allRolesArray ,e contient pas de rôle
      if (!allRolesArray.includes(roleUser)) {
        // on redirige l'utilisateur vers la page d'accueil
        window.location.hash = "#/";
      }
    }
  }

  // Récupération du contenu HTML de la route
  const html = await fetch(actualRoute.pathHtml).then((data) => data.text());
  // Ajout du contenu HTML à l'élément avec l'ID "main-page"
  document.getElementById("main-page").innerHTML = html;

  // Ajout du contenu JavaScript
  if (actualRoute.pathJS != "") {
    // Création d'une balise script
    var scriptTag = document.createElement("script");
    scriptTag.setAttribute("type", "text/javascript");
    scriptTag.setAttribute("src", actualRoute.pathJS);

    // Ajout de la balise script au corps du document
    document.querySelector("body").appendChild(scriptTag);
  }

  // Changement du titre de la page
  document.title = actualRoute.title + " - " + websiteName;

  //Afficher ou masquer les éléments en fonction du rôle
  // Appel de la fonction créée dans script.js
  showAndHideElementsForRoles();
};

// Fonction pour gérer les événements de routage (clic sur les liens)
const routeEvent = (event) => {
  event = event || window.event;
  event.preventDefault();
  // Mise à jour du hash et laisser window.onhashchange déclencher LoadContentPage
  window.location.hash = event.target.hash.slice(1) || "/";
};

// Gestion de l'événement de changement de hash (navigation SPA)
window.onhashchange = LoadContentPage;
// Assignation de la fonction routeEvent à la propriété route de la fenêtre
window.route = routeEvent;
// Gestion de l'événement de retour en arrière dans l'historique du navigateur
window.onpopstate = LoadContentPage;
// Chargement du contenu de la page au chargement initial
LoadContentPage();
