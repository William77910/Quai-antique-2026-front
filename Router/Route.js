export default class Route {
    constructor(url, title, pathHtml, authorize, pathJS = "") {
      this.url = url;
      this.title = title;
      this.pathHtml = pathHtml;
      this.pathJS = pathJS;
      this.authorize = authorize;
    }

    getUrl() {
      return this.url;  // Retourne l'URL de la route
    }

    isAuthorized(userRole) {  // Vérifie si l'utilisateur a le droit d'accéder à la route
      if (this.authorize.length === 0) return true;  // Si aucune autorisation n'est spécifiée, tout le monde peut accéder
      return this.authorize.includes(userRole);  // Vérifie si le rôle de l'utilisateur est inclus dans les autorisations de la route
    }
}

/** Cas d'autorisation d'accès
 * [] -> Tout le monde peut y accéder
 * ["disconnected"] -> Réservé aux utilisateurs déconnectés
 * ["client"] -> Réservé aux clients
 * ["admin"] -> Réservé aux administrateurs
 * ["admin", "client"] -> Réservé aux administrateurs et aux clients
 */