//initialisation
getWorks();

//récupération des variables
const gallery = document.querySelector('.gallery');
console.log("je log ma constante : ",gallery);

async function getWorks(){
    try {
        const works = await fetch('http://localhost:5678/api/works');
console.log("retour de mon fetch : ",works);
const works2 = await works.json();
console.log("works2 : ",works2);

//Modifie le Dom
works2.forEach(work => {
    //<figure>
	//<img src="assets/images/abajour-tahina.png" alt="Abajour Tahina">
    //</img><figcaption>Abajour Tahina</figcaption>
	//</figure>
    const figure = document.createElement("figure");
    figure.id=works.categoryId;
    const img = document.createElement("img");
    img.src= work.imageUrl ;
    img.alt= work.title ;
    figure.appendChild(img);
    const figCaption = document.createElement("figcaption");
    figCaption.textContent = work.title;
    figure.appendChild(figCaption);

    gallery.appendChild(figure);

});
    } catch (error) {
        console.log(error);
    }
}

