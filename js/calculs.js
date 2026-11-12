
// ==========================================
// FOODTECH CALC - JAVASCRIPT
// Version 1.1
// ==========================================

// 1. OUTILS GENERAUX

const CLE_HISTORIQUE = "foodtechHistorique";

function obtenirNombre(id) {
    const element = document.getElementById(id);

    if (!element || element.value.trim() === "") {
        return NaN;
    }

    return Number(element.value);
}

function nombreValide(valeur) {
    return Number.isFinite(valeur);
}

function afficherErreur(id, message) {
    const zone = document.getElementById(id);

    if (zone) {
        zone.innerHTML =
            `<p class="error-message">${message}</p>`;
    }
}

function afficherResultat(id, contenu) {
    const zone = document.getElementById(id);

    if (zone) {
        zone.innerHTML = contenu;
    }
}

function formaterNombre(nombre, decimales = 4) {
    return Number(nombre).toLocaleString("fr-FR", {
        maximumFractionDigits: decimales
    });
}

// 2. NAVIGATION

function afficherSection(id) {
    const section = document.getElementById(id);

    if (section) {
        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

function afficherCalculateur() {
    afficherSection("calculateur");
}

function afficherBilan() {
    afficherSection("bilan");
}

function afficherQuantite() {
    afficherSection("quantite");
}

function afficherDilution() {
    afficherSection("dilution");
}

function afficherFormulation() {
    afficherSection("formulation");
}

// 3. HISTORIQUE

function lireHistorique() {
    try {
        const historique = JSON.parse(
            localStorage.getItem(CLE_HISTORIQUE) || "[]"
        );

        return Array.isArray(historique) ? historique : [];
    } catch (erreur) {
        return [];
    }
}

function enregistrerHistorique(type, donnees, resultat) {
    const historique = lireHistorique();

    historique.unshift({
        date: new Date().toLocaleString("fr-FR"),
        type: type,
        donnees: donnees,
        resultat: resultat
    });

    // Conserver les 100 opérations les plus récentes.
    localStorage.setItem(
        CLE_HISTORIQUE,
        JSON.stringify(historique.slice(0, 100))
    );

    afficherHistorique();
}

function securiserTexte(texte) {
    return String(texte).replace(/[&<>"']/g, caractere => {
        const correspondances = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return correspondances[caractere];
    });
}

function afficherHistorique() {
    const historique = lireHistorique();
    const tableau = document.getElementById("listeHistorique");
    const compteur = document.getElementById("nombreHistorique");

    if (compteur) {
        compteur.textContent = historique.length;
    }

    if (!tableau) return;

    if (historique.length === 0) {
        tableau.innerHTML = `
            <tr>
                <td colspan="4">Aucun calcul enregistré.</td>
            </tr>
        `;
        return;
    }

    tableau.innerHTML = historique.map(operation => `
        <tr>
            <td>${securiserTexte(operation.date)}</td>
            <td>${securiserTexte(operation.type)}</td>
            <td>${securiserTexte(operation.donnees)}</td>
            <td>${securiserTexte(operation.resultat)}</td>
        </tr>
    `).join("");
}

function effacerHistorique() {
    if (!confirm("Voulez-vous vraiment effacer tout l'historique ?")) {
        return;
    }

    localStorage.removeItem(CLE_HISTORIQUE);
    afficherHistorique();
}

// 4. EXPORTATION CSV

function telechargerCSV(nomFichier, contenu) {
    const blob = new Blob(
        ["\uFEFF" + contenu],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const lien = document.createElement("a");

    lien.href = url;
    lien.download = nomFichier;

    document.body.appendChild(lien);
    lien.click();
    lien.remove();

    URL.revokeObjectURL(url);
}

function valeurCSV(valeur) {
    return `"${String(valeur).replace(/"/g, '""')}"`;
}

function exporterHistorique() {
    const historique = lireHistorique();

    if (historique.length === 0) {
        alert("Aucun historique à exporter.");
        return;
    }

    const lignes = [
        ["Date", "Type de calcul", "Données", "Résultat"],
        ...historique.map(operation => [
            operation.date,
            operation.type,
            operation.donnees,
            operation.resultat
        ])
    ];

    const contenu = lignes
        .map(ligne => ligne.map(valeurCSV).join(";"))
        .join("\n");

    telechargerCSV("FOODTECH_CALC_Historique.csv", contenu);
}

// 5. CALCUL DU RENDEMENT

function calculerRendement() {
    const initiale = obtenirNombre("masseInitiale");
    const finale = obtenirNombre("masseFinale");

    if (
        !nombreValide(initiale) ||
        !nombreValide(finale) ||
        initiale <= 0 ||
        finale < 0
    ) {
        afficherErreur(
            "resultatRendement",
            "Veuillez saisir une masse initiale positive et une masse finale positive ou nulle."
        );
        return;
    }

    const rendement = (finale / initiale) * 100;
    const perte = initiale - finale;

    const resultat = `
        <p>Rendement : <strong>${formaterNombre(rendement)} %</strong></p>
        <p>Masse initiale : ${formaterNombre(initiale)} kg</p>
        <p>Masse finale : ${formaterNombre(finale)} kg</p>
        <p>Différence de masse : ${formaterNombre(perte)} kg</p>
    `;

    afficherResultat("resultatRendement", resultat);

    enregistrerHistorique(
        "Calcul du rendement",
        `Masse initiale : ${initiale} kg ; masse finale : ${finale} kg`,
        `Rendement : ${formaterNombre(rendement)} %`
    );
}

// 6. BILAN MATIERE

function calculerBilan() {
    const entree = obtenirNombre("masseEntree");
    const produit = obtenirNombre("masseProduit");
    const sousProduits = obtenirNombre("masseSousProduits");

    if (
        !nombreValide(entree) ||
        !nombreValide(produit) ||
        !nombreValide(sousProduits) ||
        entree <= 0 ||
        produit < 0 ||
        sousProduits < 0
    ) {
        afficherErreur(
            "resultatBilan",
            "Vérifiez les masses saisies. La masse entrante doit être positive et les sorties positives ou nulles."
        );
        return;
    }

    const sorties = produit + sousProduits;

    if (sorties > entree) {
        afficherErreur(
            "resultatBilan",
            "Les masses sortantes dépassent la masse entrante. Vérifiez vos données."
        );
        return;
    }

    const pertes = entree - sorties;
    const tauxPertes = (pertes / entree) * 100;
    const tauxRecuperation = (sorties / entree) * 100;

    const resultat = `
        <p>Masse entrante : <strong>${formaterNombre(entree)} kg</strong></p>
        <p>Total des sorties : ${formaterNombre(sorties)} kg</p>
        <p>Produit principal : ${formaterNombre(produit)} kg</p>
        <p>Sous-produits : ${formaterNombre(sousProduits)} kg</p>
        <p>Écart non comptabilisé : ${formaterNombre(pertes)} kg</p>
        <p>Taux de récupération : ${formaterNombre(tauxRecuperation)} %</p>
        <p>Écart rapporté à l'entrée : ${formaterNombre(tauxPertes)} %</p>
    `;

    afficherResultat("resultatBilan", resultat);

    enregistrerHistorique(
        "Bilan matière",
        `Entrée : ${entree} kg ; produit : ${produit} kg ; sous-produits : ${sousProduits} kg`,
        `Écart : ${formaterNombre(pertes)} kg`
    );
}

// 7. QUANTITE DE MATIERE PREMIERE

function calculerQuantite() {
    const cible = obtenirNombre("masseCible");
    const rendement = obtenirNombre("rendementConnu");

    if (
        !nombreValide(cible) ||
        !nombreValide(rendement) ||
        cible <= 0 ||
        rendement <= 0 ||
        rendement > 100
    ) {
        afficherErreur(
            "resultatQuantite",
            "La masse souhaitée doit être positive et le rendement doit être supérieur à 0 % et inférieur ou égal à 100 %."
        );
        return;
    }

    const masseInitiale = (cible * 100) / rendement;

    const resultat = `
        <p>Masse de produit souhaitée : ${formaterNombre(cible)} kg</p>
        <p>Rendement : ${formaterNombre(rendement)} %</p>
        <p>Matière première nécessaire :
        <strong>${formaterNombre(masseInitiale)} kg</strong></p>
    `;

    afficherResultat("resultatQuantite", resultat);

    enregistrerHistorique(
        "Quantité de matière première",
        `Masse cible : ${cible} kg ; rendement : ${rendement} %`,
        `${formaterNombre(masseInitiale)} kg nécessaires`
    );
}

// 8. CONCENTRATION ET DILUTION

function calculerDilution() {
    const c1 = obtenirNombre("concentrationInitiale");
    const c2 = obtenirNombre("concentrationFinale");
    const v2 = obtenirNombre("volumeFinal");

    if (
        !nombreValide(c1) ||
        !nombreValide(c2) ||
        !nombreValide(v2) ||
        c1 <= 0 ||
        c2 <= 0 ||
        v2 <= 0 ||
        c2 > c1
    ) {
        afficherErreur(
            "resultatDilution",
            "Vérifiez les données : C1, C2 et V2 doivent être positifs, et C2 ne doit pas dépasser C1."
        );
        return;
    }

    const v1 = (c2 * v2) / c1;
    const volumeSolvant = v2 - v1;

    const resultat = `
        <p>Volume de solution initiale à prélever :
        <strong>${formaterNombre(v1)} L</strong></p>
        <p>Volume de solvant à ajouter :
        <strong>${formaterNombre(volumeSolvant)} L</strong></p>
        <p>Volume final : ${formaterNombre(v2)} L</p>
        <p>Relation utilisée : C1 × V1 = C2 × V2</p>
        <p class="notice">
            Cette estimation suppose une conservation de la quantité
            de soluté et des volumes additifs.
        </p>
    `;

    afficherResultat("resultatDilution", resultat);

    enregistrerHistorique(
        "Concentration et dilution",
        `C1 : ${c1} ; C2 : ${c2} ; V2 : ${v2} L`,
        `V1 : ${formaterNombre(v1)} L ; solvant : ${formaterNombre(volumeSolvant)} L`
    );
}

// 9. FORMULATION ALIMENTAIRE

let derniereFormulationCalculee = null;

function obtenirLignesIngredients() {
    return document.querySelectorAll("#lignesIngredients tr");
}

function mettreAJourBoutonsSuppression() {
    const lignes = obtenirLignesIngredients();

    lignes.forEach(ligne => {
        const bouton = ligne.querySelector(".ingredient-delete-button");

        if (bouton) {
            bouton.disabled = lignes.length <= 2;
        }
    });
}

function ajouterIngredient() {
    const tableau = document.getElementById("lignesIngredients");

    if (!tableau) return;

    const ligne = document.createElement("tr");

    ligne.innerHTML = `
        <td>
            <input type="text"
                class="ingredient-nom"
                placeholder="Nom de l'ingrédient">
        </td>
        <td>
            <input type="number"
                class="ingredient-pourcentage"
                min="0"
                max="100"
                step="any"
                placeholder="Exemple : 20">
        </td>
        <td>
            <button type="button"
                class="ingredient-delete-button">
                Supprimer
            </button>
        </td>
    `;

    ligne.querySelector(".ingredient-delete-button")
        .addEventListener("click", function () {
            supprimerIngredient(this);
        });

    tableau.appendChild(ligne);

    mettreAJourBoutonsSuppression();

    derniereFormulationCalculee = null;

    afficherResultat(
        "resultatFormulation",
        "Ajoutez les pourcentages des ingrédients puis lancez le calcul."
    );

    document.getElementById("validationFormulation").textContent = "";
}

function supprimerIngredient(bouton) {
    const lignes = obtenirLignesIngredients();

    if (lignes.length <= 2) {
        alert("Une formulation doit contenir au minimum deux ingrédients.");
        return;
    }

    bouton.closest("tr").remove();

    mettreAJourBoutonsSuppression();

    derniereFormulationCalculee = null;

    afficherResultat(
        "resultatFormulation",
        "La composition a été modifiée. Relancez le calcul."
    );
}

function initialiserFormulation() {
    const tableau = document.getElementById("lignesIngredients");

    if (!tableau) return;

    if (tableau.children.length === 0) {
        ajouterIngredient();
        ajouterIngredient();
    }

    mettreAJourBoutonsSuppression();

    document.getElementById("ajouterIngredient")
        ?.addEventListener("click", ajouterIngredient);

    document.getElementById("calculerFormulation")
        ?.addEventListener("click", calculerFormulation);

    document.getElementById("reinitialiserFormulation")
        ?.addEventListener("click", reinitialiserFormulation);

    document.getElementById("exporterFormulationCSV")
        ?.addEventListener("click", exporterFormulationCSV);
}

function calculerFormulation() {
    const nom = document.getElementById("nomFormulation").value.trim();
    const masseLot = obtenirNombre("masseLotFormulation");
    const unite = document.getElementById("uniteMasseFormulation").value;

    const lignes = obtenirLignesIngredients();

    if (!nom) {
        afficherErreur(
            "resultatFormulation",
            "Veuillez donner un nom à votre formulation."
        );
        return;
    }

    if (!nombreValide(masseLot) || masseLot <= 0) {
        afficherErreur(
            "resultatFormulation",
            "La masse totale du lot doit être strictement positive."
        );
        return;
    }

    if (lignes.length < 2) {
        afficherErreur(
            "resultatFormulation",
            "Ajoutez au minimum deux ingrédients."
        );
        return;
    }

    const ingredients = [];
    let sommePourcentages = 0;

    for (const ligne of lignes) {
        const nomIngredient = ligne
            .querySelector(".ingredient-nom").value.trim();

        const champPourcentage = ligne
            .querySelector(".ingredient-pourcentage");

        const pourcentage = Number(champPourcentage.value);

        if (!nomIngredient) {
            afficherErreur(
                "resultatFormulation",
                "Tous les ingrédients doivent avoir un nom."
            );
            return;
        }

        if (
            champPourcentage.value.trim() === "" ||
            !nombreValide(pourcentage) ||
            pourcentage <= 0 ||
            pourcentage > 100
        ) {
            afficherErreur(
                "resultatFormulation",
                "Chaque pourcentage doit être supérieur à 0 et inférieur ou égal à 100."
            );
            return;
        }

        sommePourcentages += pourcentage;

        ingredients.push({
            nom: nomIngredient,
            pourcentage: pourcentage
        });
    }

    const tolerance = 0.01;

    if (Math.abs(sommePourcentages - 100) > tolerance) {
        afficherErreur(
            "resultatFormulation",
            `La somme des pourcentages est de ${formaterNombre(sommePourcentages, 4)} %. Elle doit être égale à 100 % (tolérance : 0,01 point).`
        );

        document.getElementById("validationFormulation").textContent =
            "Aucune masse n'a été calculée. Corrigez la composition.";

        derniereFormulationCalculee = null;
        return;
    }

    const resultats = ingredients.map(ingredient => ({
        nom: ingredient.nom,
        pourcentage: ingredient.pourcentage,
        masse: (ingredient.pourcentage * masseLot) / 100
    }));

    const sommeMasses = resultats.reduce(
        (total, ingredient) => total + ingredient.masse,
        0
    );

    const ecart = masseLot - sommeMasses;

    derniereFormulationCalculee = {
        nom,
        masseLot,
        unite,
        sommePourcentages,
        ingredients: resultats
    };

    const lignesHTML = resultats.map(ingredient => `
        <tr>
            <td>${securiserTexte(ingredient.nom)}</td>
            <td>${formaterNombre(ingredient.pourcentage)} %</td>
            <td>${formaterNombre(ingredient.masse, 6)} ${unite}</td>
        </tr>
    `).join("");

    const resultat = `
        <h3>Résultat : ${securiserTexte(nom)}</h3>
        <p>Masse demandée : <strong>${formaterNombre(masseLot)} ${unite}</strong></p>
        <p>Total des pourcentages : <strong>${formaterNombre(sommePourcentages, 4)} %</strong></p>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Ingrédient</th>
                        <th>Pourcentage</th>
                        <th>Masse calculée</th>
                    </tr>
                </thead>
                <tbody>${lignesHTML}</tbody>
            </table>
        </div>

        <p>Somme des masses calculées :
        <strong>${formaterNombre(sommeMasses, 6)} ${unite}</strong></p>

        <p>Écart par rapport au lot demandé :
        ${formaterNombre(ecart, 6)} ${unite}</p>

        <p class="notice">
            Les masses sont calculées sur la base des pourcentages
            massiques saisis. Les résultats ne valident pas à eux seuls
            la sécurité, la stabilité ou la conformité réglementaire
            du produit.
        </p>
    `;

    afficherResultat("resultatFormulation", resultat);

    document.getElementById("validationFormulation").innerHTML = `
        <p class="success-message">
            Composition mathématiquement valide : total proche de 100 %.
        </p>
    `;

    enregistrerHistorique(
        "Formulation alimentaire",
        `${nom} ; lot : ${masseLot} ${unite} ; total : ${formaterNombre(sommePourcentages, 4)} %`,
        `${resultats.length} ingrédients calculés`
    );
}

function reinitialiserFormulation() {
    document.getElementById("nomFormulation").value = "";
    document.getElementById("masseLotFormulation").value = "";
    document.getElementById("uniteMasseFormulation").value = "kg";

    const tableau = document.getElementById("lignesIngredients");
    tableau.innerHTML = "";

    ajouterIngredient();
    ajouterIngredient();

    document.getElementById("validationFormulation").textContent = "";

    afficherResultat(
        "resultatFormulation",
        "La formulation a été réinitialisée."
    );

    derniereFormulationCalculee = null;
}

function exporterFormulationCSV() {
    if (!derniereFormulationCalculee) {
        alert("Veuillez d'abord calculer une formulation valide.");
        return;
    }

    const formule = derniereFormulationCalculee;

    const lignes = [
        ["Formulation", formule.nom],
        ["Masse du lot", formule.masseLot + " " + formule.unite],
        ["Total des pourcentages", formule.sommePourcentages + " %"],
        [],
        ["Ingrédient", "Pourcentage (%)", `Masse (${formule.unite})`],
        ...formule.ingredients.map(ingredient => [
            ingredient.nom,
            ingredient.pourcentage,
            ingredient.masse
        ])
    ];

    const contenu = lignes
        .map(ligne => ligne.map(valeurCSV).join(";"))
        .join("\n");

    telechargerCSV("FOODTECH_CALC_Formulation.csv", contenu);
}

// 10. INITIALISATION DE L'APPLICATION

function initialiserApplication() {
    afficherHistorique();
    initialiserFormulation();

    console.log("FOODTECH CALC est prêt !");
}

document.addEventListener(
    "DOMContentLoaded",
    initialiserApplication
);

// 11. SERVICE WORKER

if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
        navigator.serviceWorker.register("service-worker.js")
            .then(function () {
                console.log("Service Worker enregistré.");
            })
            .catch(function (erreur) {
                console.error(
                    "Erreur Service Worker :",
                    erreur
                );
            });
    });
}
