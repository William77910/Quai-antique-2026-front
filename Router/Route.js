export default class Route {
    constructor(url, title, pathHtml, authorize, pathJS = "") {
      this.url = url;
      this.title = title;
      this.pathHtml = pathHtml;
      this.pathJS = pathJS;
      this.authorize = authorize;
    }
}

/** Cas d'autorisation d'accès
 * [] -> Tout le monde peut y accéder
 * ["disconnected"] -> Réservé aux utilisateurs connéctés
 * ["client"] -> Réservé aux clients
 * ["admin"] -> Réservé aux administrateurs
 * ["admin", "client"] -> Réservé aux administrateurs et aux clients
 */