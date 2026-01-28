# Corrections - Problème de reconnexion après déconnexion

## 📋 Problème initial

Après déconnexion, lors du retour sur la page de connexion, il était nécessaire de rafraîchir manuellement la page (F5) pour pouvoir se reconnecter. Le formulaire de connexion ne répondait pas au clic sur le bouton "Connexion".

## 🔍 Analyse de la cause

Le problème venait de la gestion des scripts JavaScript dans une **Single Page Application (SPA)** :

1. **Scripts mis en cache** : Le navigateur mettait en cache le fichier `signin.js`, empêchant son rechargement
2. **Exécution immédiate** : Le code de `signin.js` s'exécutait immédiatement au chargement, avant que les éléments DOM ne soient disponibles
3. **Perte des événements** : Lors de la navigation SPA, le HTML était rechargé mais les événements n'étaient pas ré-attachés aux nouveaux éléments

## ✅ Solutions appliquées

### 1. Modifications dans `Router/router.js`

#### 🔧 Ajout de `return` après les redirections

**Ligne 42 et 49** - Ajout de `return;` après les redirections pour arrêter l'exécution :

```javascript
if (allRolesArray.includes("disconnected")) {
  if (isConnected()) {
    window.location.hash = "#/";
    return; // ✅ Arrête l'exécution après la redirection
  }
} else {
  const roleUser = getRole();
  if (!allRolesArray.includes(roleUser)) {
    window.location.hash = "#/signin";
    return; // ✅ Arrête l'exécution après la redirection
  }
}
```

**Pourquoi ?** Empêche le code de continuer à charger la page alors qu'on vient de rediriger.

---

#### 🔧 Suppression des anciens scripts

**Lignes 61-62** - Suppression des scripts dynamiques précédents :

```javascript
// Supprimer tous les anciens scripts dynamiques pour éviter les doublons
const oldScripts = document.querySelectorAll('script[data-dynamic="true"]');
oldScripts.forEach((script) => script.remove());
```

**Pourquoi ?** Évite d'avoir plusieurs copies du même script dans le DOM.

---

#### 🔧 Ajout d'un timestamp pour éviter le cache

**Ligne 70** - Ajout d'un paramètre timestamp à l'URL du script :

```javascript
scriptTag.setAttribute(
  "src",
  actualRoute.pathJS + "?t=" + new Date().getTime(),
);
```

**Pourquoi ?** Force le navigateur à recharger le script à chaque fois au lieu d'utiliser la version en cache.

---

#### 🔧 Marquage des scripts dynamiques

**Ligne 71** - Ajout d'un attribut pour identifier les scripts dynamiques :

```javascript
scriptTag.setAttribute("data-dynamic", "true");
```

**Pourquoi ?** Permet de retrouver et supprimer ces scripts lors du prochain changement de page.

---

#### 🔧 Attente du chargement du script

**Lignes 67-77** - Ajout d'un délai et attente du chargement complet :

```javascript
await new Promise((resolve) => {
  setTimeout(() => {
    var scriptTag = document.createElement("script");
    // ... configuration du script ...

    scriptTag.onload = () => resolve();
    scriptTag.onerror = () => resolve();

    document.querySelector("body").appendChild(scriptTag);
  }, 50); // Délai de 50ms pour stabiliser le DOM
});
```

**Pourquoi ?**

- Le `setTimeout(50ms)` laisse le temps au DOM de se stabiliser
- Le `onload` attend que le script soit complètement chargé avant de continuer

---

### 2. Modifications dans `js/auth/signin.js`

#### 🔧 Encapsulation dans une fonction d'initialisation

**Avant :**

```javascript
const mailInput = document.getElementById("EmailInput");
const passwordInput = document.getElementById("PasswordInput");
const btnSignin = document.getElementById("btnSignin");

btnSignin.addEventListener("click", checkCredentials);

function checkCredentials() {
  // ...
}
```

**Après :**

```javascript
function initSignin() {
  const mailInput = document.getElementById("EmailInput");
  const passwordInput = document.getElementById("PasswordInput");
  const btnSignin = document.getElementById("btnSignin");

  // Vérification de l'existence des éléments
  if (!btnSignin || !mailInput || !passwordInput) {
    console.error(
      "Les éléments du formulaire de connexion ne sont pas disponibles",
    );
    return;
  }

  btnSignin.addEventListener("click", checkCredentials);

  function checkCredentials() {
    // ...
  }
}

// Exécution de l'initialisation
initSignin();
```

**Pourquoi ?**

1. **Sécurité** : Vérifie que les éléments existent avant d'essayer d'y accéder
2. **Scope** : Les variables sont maintenant locales à la fonction, évitant les conflits
3. **Réexécution** : La fonction peut être appelée à chaque chargement du script

---

## 🎯 Résultat final

Maintenant, le processus fonctionne correctement :

1. **Déconnexion** → Supprime les cookies et redirige vers `/signin`
2. **Chargement de la page de connexion** :
   - Le HTML est chargé
   - Les anciens scripts sont supprimés
   - Le nouveau script `signin.js` est chargé avec un timestamp unique
   - Le DOM se stabilise (50ms)
   - Le script s'exécute et vérifie que les éléments existent
   - Les événements sont attachés aux éléments
3. **Connexion** → Fonctionne sans rafraîchissement manuel !

## 📚 Leçons apprises

1. **Dans une SPA, les scripts doivent être rechargés** à chaque navigation pour garantir que les événements sont correctement attachés
2. **Toujours vérifier l'existence des éléments DOM** avant d'y accéder
3. **Utiliser des timestamps** pour éviter les problèmes de cache du navigateur
4. **Nettoyer les ressources** (scripts, événements) avant d'en créer de nouvelles
5. **Ajouter des délais** peut être nécessaire pour laisser le DOM se stabiliser

## 🔗 Fichiers modifiés

- ✅ `Router/router.js` - Gestion du chargement des scripts
- ✅ `js/auth/signin.js` - Initialisation sécurisée du formulaire
