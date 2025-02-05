/* ===================== */
/* VARIABLES GLOBALES */
/* ===================== */
let allWorks = []; 
const gallery = document.querySelector('.gallery');
const filtre = document.querySelector(".filtre");
const photoGallery = document.querySelector('.photo-gallery');

/* ===================== */
/* FONCTIONS D'ACCÈS À L'API */
/* ===================== */

//Récupère les travaux depuis l'API et met à jour l'affichage
async function getWorks() {
    try {
        const response = await fetch('http://localhost:5678/api/works');
        if (!response.ok) {
            throw new Error("Erreur lors de l'appel à l'API pour les travaux");
        }
        allWorks = await response.json(); // Stocke la liste des travaux récupérés

        displayWorks(allWorks);      // Affiche dans le portfolio principal
        displayWorksModal(allWorks); // Affiche dans la modale
    } catch (error) {
        console.error("Erreur lors de la récupération des travaux :", error);
    }
}

//Récupère les catégories depuis l'API et crée les boutons de filtre
async function getFiltre() {
    try {
        const response = await fetch('http://localhost:5678/api/categories');
        if (!response.ok) {
            throw new Error("Erreur lors de l'appel à l'API pour les catégories");
        }
        const categories = await response.json(); // Liste des catégories récupérées

        // Ajoute une catégorie "Tous" en première position
        categories.unshift({ id: 0, name: "Tous" });
        while (filtre.firstChild) {
            filtre.removeChild(filtre.firstChild);
        }
        

        categories.forEach(category => {
            const bouton = document.createElement("button");
            bouton.classList.add("categorie-filtre");
            bouton.textContent = category.name;
            bouton.id = `filter-${category.id}`;

            filtre.appendChild(bouton); // Insère le bouton dans le conteneur
        });

        initializeFilterButtons(); // Configure les événements sur les boutons de filtre
    } catch (error) {
        console.error("Erreur lors de la récupération des catégories :", error);
    }
}

/* ===================== */
/* FONCTIONS D'AFFICHAGE */
/* ===================== */

//Affiche les travaux dans le portfolio principal
function displayWorks(works) {
    while (gallery.firstChild) {
        gallery.removeChild(gallery.firstChild);  
    }
    works.forEach(work => {
        const figure = createWorkFigure(work);
        gallery.appendChild(figure);
    });
}

//Affiche les travaux dans la modale
function displayWorksModal(works) {
    while (photoGallery.firstChild) {
        photoGallery.removeChild(photoGallery.firstChild);  
    }
    works.forEach(work => {
        const modalFigure = createModalWorkFigure(work);
        photoGallery.appendChild(modalFigure);
    });
}

/* ===================== */
/* FONCTIONS DE CRÉATION D'ÉLÉMENTS */
/* ===================== */

//Crée un élément <figure> pour un travail à afficher dans le portfolio
function createWorkFigure(work) {
    const figure = document.createElement("figure");
    figure.id = work.categoryId; // On peut utiliser l'ID de la catégorie si besoin

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;
    figure.appendChild(img);

    const figCaption = document.createElement("figcaption");
    figCaption.textContent = work.title;
    figure.appendChild(figCaption);

    return figure;
}

//Crée un élément pour un travail dans la modale, avec un bouton pour supprimer le travail
function createModalWorkFigure(work) {
    const div = document.createElement("div");
    div.classList.add("photo-item");

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;
    div.appendChild(img);

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.innerHTML = '<i class="fa-solid fa-trash-can"></i>';

    // Ajoute un événement pour supprimer le travail lors du clic sur le bouton
    deleteButton.addEventListener("click", async (e) => {
        e.stopPropagation(); // Empêche la fermeture accidentelle de la modale
        if (confirm("Confirmer la suppression ?")) {
            const response = await fetch(`http://localhost:5678/api/works/${work.id}`, {
                method: "DELETE",
                headers: { Authorization: "Bearer " + localStorage.getItem("token") }
            });
            if (response.ok) {
                div.remove(); // Supprime l'élément dans la modale
                // Supprime également le travail dans le portfolio principal
                document.querySelector(`.gallery img[src="${work.imageUrl}"]`)?.parentElement.remove();
                alert("Projet supprimé !");
            } else {
                alert("Erreur lors de la suppression.");
            }
        }
    });

    div.appendChild(deleteButton);
    return div;
}

/* ===================== */
/* FONCTIONS DE GESTION DES FILTRES */
/* ===================== */

//Configure les événements sur les boutons de filtre
function initializeFilterButtons() {
    const buttons = document.querySelectorAll(".categorie-filtre");
    if (buttons.length === 0) return;

    // Active le bouton "Tous" par défaut
    const defaultButton = document.getElementById("filter-0");
    if (defaultButton) {
        defaultButton.classList.add("active");
    }

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            // Désactive tous les boutons
            buttons.forEach(btn => btn.classList.remove("active"));
            // Active le bouton cliqué
            button.classList.add("active");

            // Filtre les travaux selon l'ID de la catégorie
            const categoryId = parseInt(button.id.replace("filter-", ""));
            if (categoryId === 0) {
                displayWorks(allWorks); // Affiche tous les travaux
            } else {
                const filteredWorks = allWorks.filter(work => work.categoryId === categoryId);
                displayWorks(filteredWorks);
            }
        });
    });
}

/* ===================== */
/* FONCTIONS DE GESTION DE LA CONNEXION */
/* ===================== */

//Configure l'affichage selon que l'utilisateur soit connecté ou non
function initializeLoginButton() {
    const loginButton = document.getElementById("login-button");
    const dynamicLogin = document.getElementById("dynamic-login");
    const pageSophie = document.getElementById("Page-Sophie");
    const editButton = document.getElementById("edit-button");
    const filtreButton = document.getElementById("filtre"); 
    const editionMode = document.getElementById("editionMode");
    const headerNav = document.querySelector("header");
    
    const token = localStorage.getItem("token");

    if (token) {
        // L'utilisateur est connecté
        updateLogin(loginButton, "logout", () => logout(dynamicLogin, pageSophie, loginButton));
        editButton.style.display = "block";
        filtreButton.style.display = "none";
        editionMode.style.display = "flex";  
    } else {
        // L'utilisateur n'est pas connecté
        updateLogin(loginButton, "login", () => showLoginPage(dynamicLogin, pageSophie));
        editButton.style.display = "none";
        filtreButton.style.display = "flex";
        editionMode.style.display = "none"; 
    }

    // Ces lignes s'appliquent toujours, donc on les met hors du if/else
    dynamicLogin.style.display = "none";
    pageSophie.style.display = "block";

    // Modifier la position du header en fonction de la connexion
    if (token) {
        headerNav.style.position = "absolute";  // Assure que le positionnement est pris en compte
        headerNav.style.top = "47px";
    } else {
        headerNav.style.position = "absolute"; 
        headerNav.style.top = "0";
    }
    
}

// Ajoute un événement de clic pour afficher/cacher le formulaire et modifier le style du bouton
document.getElementById("login-button").addEventListener("click", function (event) {
    event.preventDefault(); // Empêche le rechargement de la page si c'est un lien
    
    const dynamicLogin = document.getElementById("dynamic-login");
    const loginButton = document.getElementById("login-button");

    // Bascule l'affichage du formulaire de connexion
    if (dynamicLogin.style.display === "none" || dynamicLogin.style.display === "") {
        dynamicLogin.style.display = "block";
        loginButton.style.fontWeight = "700"; // Gras
    } else {
        dynamicLogin.style.display = "none";
        loginButton.style.fontWeight = "400"; // Normal
    }
});

//Met à jour le libellé et le comportement du bouton de connexion/déconnexion
function updateLogin(button, text, onClick) {
    button.textContent = text;
    button.href = "#login";

    // Supprime les anciens gestionnaires d'événements pour éviter les doublons
    const newButton = button.cloneNode(true);
    button.replaceWith(newButton);
    newButton.addEventListener('click', (event) => {
        event.preventDefault();
        onClick();
    });
}

//Déconnecte l'utilisateur en supprimant le token et actualise l'affichage
function logout(dynamicLogin, pageSophie, loginButton) {
    localStorage.removeItem("token");
    alert("Vous êtes déconnecté.");
    initializeLoginButton();
}

//Affiche la page de connexion et masque le contenu principal
function showLoginPage(dynamicLogin, pageSophie) {
    dynamicLogin.style.display = "block";
    pageSophie.style.display = "none";

    // Mettre le bouton "Login" en gras
    const loginButton = document.getElementById("login-button");
    loginButton.style.fontWeight = "700";
}

//Ajoute l'événement de soumission sur le formulaire de connexion
function addLoginFormHandler() {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault(); // Empêche le rechargement de la page

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const loginData = { email, password };

        try {
            // Envoie une requête à l'API pour tenter la connexion
            const response = await fetch("http://localhost:5678/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginData),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("token", data.token); // Stocke le token de connexion
                alert("Connexion réussie !");
                window.location.href = "index.html"; // Redirige vers la page d'accueil
            } else if (response.status === 401 || response.status === 404) {
                alert("Erreur dans l’identifiant ou le mot de passe");
            } else {
                throw new Error("Une erreur inattendue s'est produite.");
            }
        } catch (error) {
            console.error("Erreur lors de la connexion :", error);
            alert("Impossible de se connecter. Veuillez réessayer plus tard.");
        }
    });
}

/* ===================== */
/* FONCTIONS DE GESTION DE LA MODALE */
/* ===================== */

//Configure les événements pour ouvrir et fermer la modale
function setupModalEvents() {
    const modal = document.getElementById("modal");
    const modifyButton = document.getElementById("edit-button");
    const closeButton = document.querySelector(".close-button");
    const addPhoto = document.querySelector(".add-photo-button");
    const blockAddPhoto = document.getElementById ("add-photo-content");
    const galleryContent = document.getElementById ("gallery-content"); 
    const backGallery = document.getElementById ("back-to-gallery"); 

    // Ouvre la modale quand l'utilisateur clique sur "Modifier"
    modifyButton.addEventListener("click", () => {
        modal.classList.add("visible");
        blockAddPhoto.classList.add("hidden");
    });

    // Affiche le menu d'ajout de photo dans la modale
    addPhoto.addEventListener("click", () => {
        galleryContent.classList.add("hidden");
        blockAddPhoto.classList.remove("hidden");
        blockAddPhoto.classList.add("visible");
    });

    // Reviens le menu de galery photo dans la modale
    backGallery.addEventListener("click", () => {
        galleryContent.classList.remove("hidden");
        blockAddPhoto.classList.remove("visible");
        blockAddPhoto.classList.add("hidden");
    });

    // Ferme la modale quand l'utilisateur clique sur la croix
    closeButton.addEventListener("click", () => {
        galleryContent.classList.remove("hidden");
        blockAddPhoto.classList.remove("visible");
        blockAddPhoto.classList.add("hidden");
        modal.classList.remove("visible");
    });

    // Ferme la modale si l'utilisateur clique en dehors du contenu
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            galleryContent.classList.remove("hidden");
            blockAddPhoto.classList.remove("visible");
            blockAddPhoto.classList.add("hidden");
            modal.classList.remove("visible");;
        }
    });    
}

/* ===================== */
/* GESTION DU FORMULAIRE D'AJOUT DE PHOTO */
/* ===================== */

// Gestion de la soumission du formulaire d'ajout de photo
function setupAddPhotoForm() {
    const addPhotoForm = document.getElementById("addPhotoForm");
    const photoInput = document.getElementById("photoInput");
    const titleInput = document.getElementById("titleInput");
    const categorySelect = document.getElementById("categorySelect");
    const photoPreview = document.getElementById("photoPreview");

    // Charger les catégories dans le formulaire
    async function loadCategories() {
        try {
            const response = await fetch('http://localhost:5678/api/categories');
            if (!response.ok) throw new Error('Erreur lors de la récupération des catégories');
            const categories = await response.json();
            categories.forEach(category => {
                const option = document.createElement("option");
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        } catch (error) {
            console.error(error);
        }
    }
    
    // Ajoute une option vide par défaut
    categorySelect.innerHTML = '<option value=""> </option>';

    // Charger les catégories dès le chargement de la page
    loadCategories();

    // Aperçu de l'image sélectionnée
    photoInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
    
        if (file) {
            const reader = new FileReader();
    
            reader.onload = (e) => {
                photoPreview.src = e.target.result; // Met à jour la source de l'image
                photoPreview.style.display = "block"; // Affiche l'aperçu
                document.querySelector('.upload-content').style.display = "none"; // Masque le conteneur
            };
    
            reader.readAsDataURL(file); // Lit le contenu du fichier
        } else {
            photoPreview.style.display = "none"; // Cache l'aperçu si aucun fichier
            photoPreview.src = "";
            document.querySelector('.upload-content').style.display = "flex"; // Réaffiche le conteneur
        }
    });
    

    // Gérer la soumission du formulaire
    addPhotoForm.addEventListener("submit", async (event) => {
        event.preventDefault();
    
        const formData = new FormData();
        const file = photoInput.files[0];
    
        if (!file) {
            alert("Veuillez sélectionner une image.");
            return;
        }
    
        formData.append("image", file);
        formData.append("title", titleInput.value);
        formData.append("category", categorySelect.value);
    
        try {
            const response = await fetch('http://localhost:5678/api/works', {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            });
    
            if (response.ok) {
                alert("Photo ajoutée avec succès !");
                addPhotoForm.reset(); // Réinitialiser le formulaire
                photoPreview.style.display = "none"; // Cache l'aperçu
                document.querySelector('.upload-content').style.display = "flex"; // Réaffiche le conteneur
                getWorks(); // Met à jour la galerie
            } else {
                alert("Erreur lors de l'ajout de la photo.");
            }
        } catch (error) {
            console.error("Erreur lors de la requête :", error);
            alert("Une erreur s'est produite.");
        }
    });
    
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("addPhotoForm");
    const submitButton = document.querySelector(".validate-button");
    const requiredFields = form.querySelectorAll("input[required], select[required]");

    // Fonction pour vérifier si tous les champs requis sont remplis
    const checkFormCompletion = () => {
        let isComplete = true;

        requiredFields.forEach((field) => {
            if (!field.value.trim()) {
                isComplete = false;
            }
        });

        submitButton.disabled = !isComplete; // Désactive ou active le bouton
    };

    // Ajoutez un écouteur d'événements pour chaque champ requis
    requiredFields.forEach((field) => {
        field.addEventListener("input", checkFormCompletion); // Vérifie à chaque saisie
    });

    // Initialisation : désactive le bouton au chargement
    checkFormCompletion();
});

/* ===================== */
/* FONCTION D'INITIALISATION GLOBALE */
/* ===================== */

//Charge les filtres et les travaux au démarrage
function initializePage() {
    getFiltre();
    getWorks();
}

/* ===================== */
/* EVENEMENT PRINCIPAL AU CHARGEMENT DU DOM */
/* ===================== */
document.addEventListener("DOMContentLoaded", () => {
    initializePage();
    initializeLoginButton();
    addLoginFormHandler();
    setupModalEvents();
    setupAddPhotoForm(); 
});
