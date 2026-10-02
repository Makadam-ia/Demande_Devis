import { useState } from 'react';
import { envoyerLead } from '../lib/ingestion.js';

/**
 * Formulaire monolithique vertical « Demande de Dépannage ».
 *
 * Interface unique (aucune étape, aucune colonne) : tous les champs sont
 * visibles d'un seul tenant dans une carte centrée. La soumission réutilise
 * `envoyerLead` (POST `fetch` vers l'Edge Function `ingestion-lead` du CRM, avec
 * l'en-tête `X-Funnel-Token`).
 *
 * Correspondance avec le payload backend `{ nom, email, telephone, description,
 * urgence }` :
 * - `nom`        ← « Nom du contact » ;
 * - `telephone`  ← « Numéro de téléphone » ;
 * - `email`      ← « Adresse e-mail » ;
 * - `urgence`    ← « Catégorie de l'urgence » (select) ;
 * - `description`← « Description détaillée », **précédée d'un bloc de contexte**
 *   (adresse d'intervention, code postal, cases cochées, photo) : le backend ne
 *   possède pas de champ dédié pour ces valeurs, les fondre dans `description`
 *   évite de les perdre.
 *
 * Note : la photo est collectée (aperçu local) mais **n'est pas transmise** —
 * le payload d'`ingestion-lead` est un JSON textuel sans emplacement média ; seul
 * le nom du fichier est consigné dans `description`.
 */

/** Catégories d'urgence proposées (reprises de l'ancien formulaire). */
const CATEGORIES = [
  'Fuite apparente ou sous un équipement',
  'Écoulement bloqué (bouchon)',
  "Panne d'eau chaude",
  'Dégât des eaux / Rupture franche',
  'Autre anomalie',
];

/** État initial du formulaire, réutilisé pour la réinitialisation. */
const ETAT_INITIAL = {
  nom: '',
  telephone: '',
  email: '',
  adresse: '',
  code_postal: '',
  categorie: '',
  description: '',
  eauCoupee: false,
  consentement: false,
};

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_TELEPHONE = /^(?:\+?\d[\d\s.-]{7,})$/;

export default function DemandeDepannage() {
  const [champs, setChamps] = useState(ETAT_INITIAL);
  const [photo, setPhoto] = useState(null);
  const [apercu, setApercu] = useState('');
  const [erreur, setErreur] = useState('');
  const [statut, setStatut] = useState('idle'); // idle | envoi | succes

  const maj = (champ, valeur) => setChamps((precedent) => ({ ...precedent, [champ]: valeur }));

  /** Mémorise le fichier photo et construit son aperçu local (data URL). */
  const choisirPhoto = (fichier) => {
    if (!fichier) {
      setPhoto(null);
      setApercu('');
      return;
    }
    setPhoto(fichier);
    const lecteur = new FileReader();
    lecteur.onload = (evenement) => setApercu(evenement.target.result);
    lecteur.readAsDataURL(fichier);
  };

  /** Valide les champs obligatoires ; renvoie le message d'erreur ou une chaîne vide. */
  const valider = () => {
    if (!champs.nom.trim()) return 'Merci d’indiquer le nom du contact.';
    if (!REGEX_TELEPHONE.test(champs.telephone.trim())) {
      return 'Merci d’indiquer un numéro de téléphone valide.';
    }
    if (!REGEX_EMAIL.test(champs.email.trim())) {
      return 'Merci d’indiquer une adresse e-mail valide.';
    }
    if (!champs.adresse.trim()) return 'Merci d’indiquer l’adresse de l’intervention.';
    if (!champs.code_postal.trim()) return 'Merci d’indiquer le code postal et la ville.';
    if (!champs.categorie) return 'Merci de sélectionner la catégorie de l’urgence.';
    if (champs.description.trim().length < 10) {
      return 'Merci de détailler le problème (10 caractères minimum).';
    }
    return '';
  };

  /** Compose la `description` transmise : contexte (adresse, alertes, photo) + saisie. */
  const construireDescription = () => {
    const contexte = [
      `Adresse de l'intervention : ${champs.adresse.trim()}, ${champs.code_postal.trim()}`,
      `Arrivée d'eau générale coupée : ${champs.eauCoupee ? 'oui' : 'non'}`,
      `Facturation des frais de déplacement acceptée : ${champs.consentement ? 'oui' : 'non'}`,
      `Photo du problème : ${photo ? photo.name : 'non fournie'}`,
    ];
    return `${contexte.join('\n')}\n\n${champs.description.trim()}`;
  };

  /** Soumission : validation puis transmission à l'Edge Function `ingestion-lead`. */
  const soumettre = async (evenement) => {
    evenement.preventDefault();
    const message = valider();
    if (message) {
      setErreur(message);
      return;
    }

    setErreur('');
    setStatut('envoi');

    const resultat = await envoyerLead({
      nom: champs.nom,
      email: champs.email,
      telephone: champs.telephone,
      description: construireDescription(),
      urgence: champs.categorie,
    });

    if (resultat.ok) {
      setStatut('succes');
    } else {
      setErreur(resultat.error);
      setStatut('idle');
    }
  };

  /** Réinitialise le formulaire après un envoi réussi. */
  const recommencer = () => {
    setChamps(ETAT_INITIAL);
    setPhoto(null);
    setApercu('');
    setErreur('');
    setStatut('idle');
  };

  const enEnvoi = statut === 'envoi';

  return (
    <div className="card">
      {statut === 'succes' ? (
        <div className="success" role="status">
          <h2 className="card__title">Alerte transmise</h2>
          <p className="success__text">
            Un technicien analyse la photo et vous rappelle immédiatement.
          </p>
          <button type="button" className="btn-retour" onClick={recommencer}>
            Nouvelle urgence
          </button>
        </div>
      ) : (
        <>
          <h2 className="card__title">Demande de Dépannage</h2>
          <form onSubmit={soumettre} noValidate>
            <div className="form-group">
              <label htmlFor="nom">Nom du contact :</label>
              <input
                type="text"
                id="nom"
                name="nom"
                autoComplete="name"
                value={champs.nom}
                onChange={(evenement) => maj('nom', evenement.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="telephone">Numéro de téléphone :</label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                autoComplete="tel"
                inputMode="tel"
                value={champs.telephone}
                onChange={(evenement) => maj('telephone', evenement.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Adresse e-mail :</label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                autoCapitalize="none"
                value={champs.email}
                onChange={(evenement) => maj('email', evenement.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="adresse">Adresse de l&apos;intervention :</label>
              <input
                type="text"
                id="adresse"
                name="adresse"
                placeholder="N°, Rue..."
                value={champs.adresse}
                onChange={(evenement) => maj('adresse', evenement.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="code_postal">Code Postal et Ville :</label>
              <input
                type="text"
                id="code_postal"
                name="code_postal"
                placeholder="Ex: 34540 Balaruc-les-Bains"
                value={champs.code_postal}
                onChange={(evenement) => maj('code_postal', evenement.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="categorie">Catégorie de l&apos;urgence :</label>
              <select
                id="categorie"
                name="categorie"
                value={champs.categorie}
                onChange={(evenement) => maj('categorie', evenement.target.value)}
                required
              >
                <option value="" disabled>
                  Sélectionnez une option...
                </option>
                {CATEGORIES.map((categorie) => (
                  <option key={categorie} value={categorie}>
                    {categorie}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description détaillée :</label>
              <textarea
                id="description"
                name="description"
                rows={5}
                placeholder="Apportez des précisions utiles au diagnostic..."
                value={champs.description}
                onChange={(evenement) => maj('description', evenement.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="photo">Photo du problème :</label>
              <div className="alert-box">
                <strong>Important :</strong> Photographiez l&apos;installation complète avec un mètre
                de recul (tuyaux, raccords). Ne photographiez pas uniquement la flaque d&apos;eau.
              </div>
              <div className="file-upload-wrapper">
                {apercu && <img id="photo-preview" src={apercu} alt="Aperçu de la photo" />}
                <label className="file-upload-container" htmlFor="photo">
                  <span className="file-upload-label">
                    {photo
                      ? 'Modifier la photo'
                      : 'Cliquez pour prendre une photo ou choisir un fichier'}
                  </span>
                  <input
                    type="file"
                    id="photo"
                    name="photo"
                    accept="image/*"
                    capture="environment"
                    onChange={(evenement) => choisirPhoto(evenement.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="eau_coupee"
                name="eau_coupee"
                checked={champs.eauCoupee}
                onChange={(evenement) => maj('eauCoupee', evenement.target.checked)}
              />
              <label htmlFor="eau_coupee">
                L&apos;arrivée d&apos;eau générale est coupée (compteur fermé).
              </label>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="consentement"
                name="consentement"
                checked={champs.consentement}
                onChange={(evenement) => maj('consentement', evenement.target.checked)}
              />
              <label htmlFor="consentement">
                Intervention d&apos;urgence requise (J&apos;accepte la facturation des frais de
                déplacement inhérents).
              </label>
            </div>

            {erreur && <p className="form-error">{erreur}</p>}

            <button type="submit" className="btn-primary" disabled={enEnvoi}>
              {enEnvoi ? 'Envoi en cours…' : "Envoyer l'Alerte"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

