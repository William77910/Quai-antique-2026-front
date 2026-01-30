const galerieImage = document.getElementById("allImages");

//Récupérer les informations des images
let titre = "titre";
let imgSource = "./images/semifreddo-4343511_640.jpg";
let alt = "Semifreddo";

//Création d'une varaible pour stocker les infos de l'image
let monImage = getImage(titre, imgSource, alt);

galerieImage.innerHTML = monImage;

function getImage(titre, urlImage, alt) {
  // appel de la fonction de sécurité
  titre = sanitizeHtml(titre);
  urlImage = sanitizeHtml(urlImage);
  alt = sanitizeHtml(alt);
  // affichage de l'image
  return `<div class="col p-3">
      <div class="image-card text-white">
        <img class="w-100 rounded" src="${urlImage}" alt="${alt}"/>
        <p class="titre-image">${titre}</p>
        <div class="action-image-buttons" data-show="admin">
          <button type="button"
            class="btn btn-outline-light" data-bs-toggle="modal" data-bs-target="#EditionPhotoModal">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button type="button" class="btn btn-outline-light" data-bs-toggle="modal" data-bs-target="#DeletePhotoModal">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>`;
}
