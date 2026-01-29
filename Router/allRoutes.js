import Route from "./Route.js";

//Définir ici vos routes
export const allRoutes = [
    new Route("/", "Accueil", "pages/home.html",[]),
    new Route("/Galerie", "La Galerie", "pages/galerie.html", [], "js/galerie.js"),
    new Route("/signin", "Connexion", "pages/auth/signin.html", ["disconnected"], "js/auth/signin.js"),
    new Route("/signup", "Inscription", "pages/auth/signup.html", ["disconnected"], "js/auth/signup.js"),
    new Route("/mentionslegales", "Mentions Legales", "pages/mentionslegales.html", []),
    new Route("/account", "Mon compte", "pages/auth/account.html", ["client", "admin"]),
    new Route("/editPassword", "Changement de mot de passe", "pages/auth/editPassword.html", ["client", "admin"], "js/auth/editPassword.js"),
    new Route("/allResa", "Vos réservations", "pages/reservations/allResa.html", ["client", "admin"], "js/reservations/allResa.js"),
    new Route("/reserver", "Réserver", "pages/reservations/reserver.html", ["client", "admin"], "js/reservations/reserver.js"),
];

/** Cas d'autorisation d'accès
 * [] -> Tout le monde peut y accéder
 * ["disconnected"] -> Réservé aux utilisateurs connéctés
 * ["client"] -> Réservé aux clients
 * ["admin"] -> Réservé aux administrateurs
 * ["admin", "client"] -> Réservé aux administrateurs et aux clients
 */

//Le titre s'affiche comme ceci : Route.titre - websitename
export const websiteName = "Quai Antique";