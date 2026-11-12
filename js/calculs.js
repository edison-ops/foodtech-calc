
function afficherCalculateur() {
    const section = document.getElementById("calculateur");

    section.scrollIntoView({
        behavior: "smooth"
    });
}

function calculerRendement() {

    // Recuperer les masses saisies
    const initiale = Number(
        document.getElementById("masseInitiale").value
    );

    const finale = Number(
        document.getElementById("masseFinale").value
    );

    const resultat = document.getElementById("resultat");

    // Verifier les valeurs
    if (
        document.getElementById("masseInitiale").value === "" ||
        document.getElementById("masseFinale").value === ""
    ) {
        resultat.textContent = "Veuillez remplir les deux champs.";
        return;
    }

    if (initiale <= 0 || finale <= 0) {
        resultat.textContent = "Les masses doivent être supérieures à zéro.";
        return;
    }

    // Effectuer le calcul
    const rendement = (finale / initiale) * 100;
    enregistrerHistorique(
    "Rendement",
    `${initiale} kg → ${finale} kg`,
    `${rendement.toFixed(2)} %`
);

    // Afficher le resultat
    resultat.innerHTML =
        "Rendement obtenu : <strong>" +
        rendement.toFixed(2) +
        " %</strong>";

    if (rendement > 100) {
        resultat.innerHTML +=
            "<br>Attention : vérifiez les ajouts de matière et les mesures.";
    }
}



function afficherQuantite() {
    const section = document.getElementById("quantite");

    section.scrollIntoView({
        behavior: "smooth"
    });
}

function calculerQuantite() {

    const masseFinale = Number(
        document.getElementById("masseSouhaitee").value
    );

    const rendement = Number(
        document.getElementById("rendementPrevu").value
    );

    const resultat = document.getElementById("resultatQuantite");

    if (
        document.getElementById("masseSouhaitee").value === "" ||
        document.getElementById("rendementPrevu").value === ""
    ) {
        resultat.textContent = "Veuillez remplir tous les champs.";
        return;
    }

    if (masseFinale <= 0 || rendement <= 0) {
        resultat.textContent =
            "Les deux valeurs doivent être supérieures à zéro.";
        return;
    }

    const masseInitiale = (masseFinale * 100) / rendement;
enregistrerHistorique(
    "Quantité de matière première",
    `Masse souhaitée : ${masseFinale} kg ; rendement : ${rendement} %`,
    `${((masseFinale * 100) / rendement).toFixed(2)} kg`
);
    resultat.innerHTML =
        "Masse initiale nécessaire : <strong>" +
        masseInitiale.toLocaleString("fr-FR", {
            maximumFractionDigits: 2
        }) +
        " kg</strong>";
}


// AFFICHER LE CALCULATEUR DE BILAN
function afficherBilan() {
    document.getElementById("bilan").scrollIntoView({
        behavior: "smooth"
    });
}

// CALCULER LE BILAN MATIÈRE
function calculerBilan() {

    let initiale = Number(
        document.getElementById("masseBilanInitiale").value
    );

    let finale = Number(
        document.getElementById("masseBilanFinale").value
    );

    let resultat = document.getElementById("resultatBilan");

    if (
        document.getElementById("masseBilanInitiale").value === "" ||
        document.getElementById("masseBilanFinale").value === "" ||
        initiale <= 0 ||
        finale < 0
    ) {
        resultat.innerHTML =
            "Veuillez entrer des masses valides.";
        return;
    }

    let difference = initiale - finale;
    let pourcentage = (difference / initiale) * 100;
    enregistrerHistorique(
    "Bilan matière",
    `${initiale} kg → ${finale} kg`,
    `${difference.toFixed(2)} kg (${pourcentage.toFixed(2)} %)`
);

    resultat.innerHTML = `
        <h3>Résultats du bilan</h3>
        <p>Différence apparente : ${difference.toFixed(2)} kg</p>
        <p>Différence apparente : ${pourcentage.toFixed(2)} %</p>
        <small>
            Cette différence n'est pas nécessairement une perte réelle.
            Elle peut inclure l'eau évaporée ou les coproduits.
        </small>
    `;
}


// ENREGISTRER UN CALCUL
function enregistrerHistorique(type, donnees, resultat) {

    let historique = JSON.parse(
        localStorage.getItem("foodtechHistorique") || "[]"
    );

    historique.unshift({
        date: new Date().toLocaleString("fr-FR"),
        type: type,
        donnees: donnees,
        resultat: resultat
    });

    localStorage.setItem(
        "foodtechHistorique",
        JSON.stringify(historique)
    );

    afficherHistorique();
}


// AFFICHER L'HISTORIQUE
function afficherHistorique() {

    let historique = JSON.parse(
        localStorage.getItem("foodtechHistorique") || "[]"
    );

    let tableau = document.getElementById("tableHistorique");

    if (!tableau) return;

    if (historique.length === 0) {
        tableau.innerHTML = `
            <tr>
                <td colspan="4">Aucun calcul enregistré.</td>
            </tr>
        `;
        return;
    }

    tableau.innerHTML = historique.map(item => `
        <tr>
            <td>${item.date}</td>
            <td>${item.type}</td>
            <td>${item.donnees}</td>
            <td>${item.resultat}</td>
        </tr>
    `).join("");
}


// EFFACER L'HISTORIQUE
function effacerHistorique() {

    if (confirm("Voulez-vous vraiment effacer l'historique ?")) {
        localStorage.removeItem("foodtechHistorique");
        afficherHistorique();
    }
}


// CHARGER L'HISTORIQUE AU DEMARRAGE
document.addEventListener("DOMContentLoaded", afficherHistorique);


// EXPORTER L'HISTORIQUE AU FORMAT CSV
function exporterHistorique() {

    let historique = JSON.parse(
        localStorage.getItem("foodtechHistorique") || "[]"
    );

    if (historique.length === 0) {
        alert("Aucun calcul à exporter.");
        return;
    }

    let lignes = [
        ["Date", "Type", "Données", "Résultat"],
        ...historique.map(item => [
            item.date,
            item.type,
            item.donnees,
            item.resultat
        ])
    ];

    let contenu = "\uFEFF" + lignes
        .map(ligne =>
            ligne.map(valeur =>
                `"${String(valeur).replace(/"/g, '""')}"`
            ).join(";")
        )
        .join("\n");

    let fichier = new Blob(
        [contenu],
        { type: "text/csv;charset=utf-8;" }
    );

    let lien = document.createElement("a");
    let url = URL.createObjectURL(fichier);

    lien.href = url;
    lien.download = "FOODTECH_CALC_Historique.csv";
    lien.click();

    URL.revokeObjectURL(url);
}


// ACTIVER LE SERVICE WORKER
if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker.register("./service-worker.js")
            .then(() => {
                console.log("FOODTECH CALC est prêt !");
            })
            .catch(error => {
                console.error("Erreur PWA :", error);
            });

    });

}