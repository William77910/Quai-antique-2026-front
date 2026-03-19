import Route from "./Route.js";
import { allRoutes, websiteName } from "./allRoutes.js";

// Création d'une route pour la page 404 (page introuvable)
const route404 = new Route("404", "Page introuvable", "pages/404.html", []);

const resolveRoleFromApiRoles = (roles) => {
  if (!Array.isArray(roles) || roles.length === 0) {
    return null;
  }

  const normalizedRoles = new Set(
    roles.map((role) => String(role).trim().toUpperCase()),
  );

  if (normalizedRoles.has("ROLE_ADMIN") || normalizedRoles.has("ADMIN")) {
    return "ROLE_ADMIN";
  }

  if (
    normalizedRoles.has("ROLE_USER") ||
    normalizedRoles.has("CLIENT") ||
    normalizedRoles.has("USER")
  ) {
    return "ROLE_USER";
  }

  return String(roles[0]);
};

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
  // Nettoyer proprement la page précédente (listeners, timers, etc.)
  if (typeof globalThis.__pageCleanup === "function") {
    try {
      globalThis.__pageCleanup();
    } catch (error) {
      console.error("Erreur pendant le nettoyage de page:", error);
    } finally {
      globalThis.__pageCleanup = undefined;
    }
  }

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
        return;
      }
    } else {
      // récupérer le rôle de l'utilisateur dans une variable
      let roleUser = getRole();
      // si le tableau allRolesArray ,e contient pas de rôle
      if (!allRolesArray.includes(roleUser)) {
        // Fallback: le cookie role peut être obsolète, on resynchronise via /account/me.
        if (isConnected() && typeof getInfosUser === "function") {
          try {
            const user = await getInfosUser();
            const resolvedRole = resolveRoleFromApiRoles(user?.roles || []);
            if (resolvedRole && typeof setCookie === "function") {
              const roleCookieName = globalThis.RoleCookieName || "role";
              setCookie(roleCookieName, resolvedRole, 7);
              roleUser = resolvedRole;
              showAndHideElementsForRoles();
            }
          } catch (error) {
            console.error("Impossible de resynchroniser le rôle depuis l'API", error);
          }
        }

        if (allRolesArray.includes(roleUser)) {
          // Le rôle est désormais à jour, on laisse passer.
        } else {
        // on redirige l'utilisateur vers la page de connexion
          window.location.hash = "#/signin";
          return;
        }
      }
    }
  }

  // Récupération du contenu HTML de la route
  const html = await fetch(actualRoute.pathHtml).then((data) => data.text());
  // Ajout du contenu HTML à l'élément avec l'ID "main-page"
  document.getElementById("main-page").innerHTML = html;

  // Supprimer tous les anciens scripts dynamiques pour éviter les doublons
  const oldScripts = document.querySelectorAll('script[data-dynamic="true"]');
  oldScripts.forEach((script) => script.remove());

  // Ajout du contenu JavaScript
  if (actualRoute.pathJS != "") {
    // Attendre un peu pour que le DOM soit prêt, puis charger le script
    await new Promise((resolve) => {
      setTimeout(() => {
        // Création d'une balise script avec un timestamp pour éviter le cache
        let scriptTag = document.createElement("script");
        scriptTag.setAttribute("type", "text/javascript");
        scriptTag.setAttribute(
          "src",
          actualRoute.pathJS + "?t=" + new Date().getTime(),
        );
        scriptTag.setAttribute("data-dynamic", "true"); // Marqueur pour identifier les scripts dynamiques

        // Attendre que le script soit chargé avant de continuer
        scriptTag.onload = () => resolve();
        scriptTag.onerror = () => {
          console.error(`Impossible de charger le script: ${scriptTag.src}`);
          resolve(); // Continuer même en cas d'erreur
        };

        // Ajout de la balise script au corps du document
        document.querySelector("body").appendChild(scriptTag);
      }, 50); // Petit délai pour laisser le DOM se stabiliser
    });
  }

  // Chargement du titre de la page
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
