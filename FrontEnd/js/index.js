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

/**
 * Récupère les travaux depuis l'API et met à jour l'affichage
 */
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

/**
 * Récupère les catégories depuis l'API et crée les boutons de filtre
 */
async function getFiltre() {
    try {
        const response = await fetch('http://localhost:5678/api/categories');
        if (!response.ok) {
            throw new Error("Erreur lors de l'appel à l'API pour les catégories");
        }
        const categories = await response.json(); // Liste des catégories récupérées

        // Ajoute une catégorie "Tous" en première position
        categories.unshift({ id: 0, name: "Tous" });
        filtre.innerHTML = ""; // Vide le conteneur pour éviter les doublons

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

/**
 * Affiche les travaux dans le portfolio principal
 */
function displayWorks(works) {
    gallery.innerHTML = ""; // Réinitialise la galerie
    works.forEach(work => {
        const figure = createWorkFigure(work);
        gallery.appendChild(figure);
    });
}

/**
 * Affiche les travaux dans la modale
 */
function displayWorksModal(works) {
    photoGallery.innerHTML = ""; // Vide le conteneur pour éviter les doublons
    works.forEach(work => {
        const modalFigure = createModalWorkFigure(work);
        photoGallery.appendChild(modalFigure);
    });
}

/* ===================== */
/* FONCTIONS DE CRÉATION D'ÉLÉMENTS */
/* ===================== */

/**
 * Crée un élément <figure> pour un travail à afficher dans le portfolio
 */
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

/**
 * Crée un élément pour un travail dans la modale, avec un bouton pour supprimer le travail
 */
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

/**
 * Configure les événements sur les boutons de filtre
 */
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

/**
 * Configure l'affichage selon que l'utilisateur soit connecté ou non
 */
function initializeLoginButton() {
    const loginButton = document.getElementById("login-button");
    const dynamicLogin = document.getElementById("dynamic-login");
    const pageSophie = document.getElementById("Page-Sophie");
    const editButton = document.getElementById("edit-button");
    const filtreButton = document.getElementById("filtre"); 
    const editionMode = document.getElementById("editionMode");
    const body = document.body;

    const token = localStorage.getItem("token");

    if (token) {
        // L'utilisateur est connecté
        updateLoginButtonState(loginButton, "logout", () => logout(dynamicLogin, pageSophie, loginButton));
        dynamicLogin.style.display = "none";
        pageSophie.style.display = "block";
        editButton.style.display = "block";
        filtreButton.style.display = "none";
        editionMode.style.display = "flex";
        body.style.marginTop = "97px";  
    } else {
        // L'utilisateur n'est pas connecté
        updateLoginButtonState(loginButton, "login", () => showLoginPage(dynamicLogin, pageSophie));
        dynamicLogin.style.display = "none";
        pageSophie.style.display = "block";
        editButton.style.display = "none";
        filtreButton.style.display = "flex";
        editionMode.style.display = "none";
        body.style.marginTop = "0";  
    }
}

/**
 * Met à jour le libellé et le comportement du bouton de connexion/déconnexion
 */
function updateLoginButtonState(button, text, onClickHandler) {
    button.textContent = text;
    button.href = "#login";
    button.onclick = (event) => {
        event.preventDefault();
        onClickHandler();
    };
}

/**
 * Déconnecte l'utilisateur en supprimant le token et actualise l'affichage
 */
function logout(dynamicLogin, pageSophie, loginButton) {
    localStorage.removeItem("token");
    alert("Vous êtes déconnecté.");
    initializeLoginButton();
}

/**
 * Affiche la page de connexion et masque le contenu principal
 */
function showLoginPage(dynamicLogin, pageSophie) {
    dynamicLogin.style.display = "block";
    pageSophie.style.display = "none";
}

/**
 * Ajoute l'événement de soumission sur le formulaire de connexion
 */
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
                alert("Email ou mot de passe incorrect.");
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

/**
 * Configure les événements pour ouvrir et fermer la modale
 */
function setupModalEvents() {
    const modal = document.getElementById("modal");
    const modifyButton = document.getElementById("edit-button");
    const closeButton = document.querySelector(".close-button");

    // Ouvre la modale quand l'utilisateur clique sur "Modifier"
    modifyButton.addEventListener("click", () => {
        modal.classList.add("visible");
    });

    // Ferme la modale quand l'utilisateur clique sur la croix
    closeButton.addEventListener("click", () => {
        modal.classList.remove("visible");
    });

    // Ferme la modale si l'utilisateur clique en dehors du contenu
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.classList.remove("visible");
        }
    });
}

/* ===================== */
/* FONCTION D'INITIALISATION GLOBALE */
/* ===================== */

/**
 * Charge les filtres et les travaux au démarrage
 */
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
});
