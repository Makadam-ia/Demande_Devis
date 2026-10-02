import { UploadIcon } from './icons.jsx';

/**
 * Étape 2 — « Détails » : description, photo, localisation et cases d'alerte.
 * Le bouton « Suivant » reste inactif tant que les champs obligatoires
 * (description, adresse, code postal) ne sont pas remplis.
 *
 * @param {{
 *   champs: { description: string, adresse: string, codePostal: string },
 *   photoNom: string,
 *   apercu: string,
 *   onChange: (champ: string, valeur: string) => void,
 *   onPhoto: (fichier: File | null) => void,
 *   cases: { eauCoupee: boolean, urgence: boolean },
 *   onCase: (champ: string, valeur: boolean) => void,
 *   onRetour: () => void,
 *   onSuivant: () => void,
 *   suivantActif: boolean,
 * }} props
 */
export default function StepDetails({
  champs,
  photoNom,
  apercu,
  onChange,
  onPhoto,
  cases,
  onCase,
  onRetour,
  onSuivant,
  suivantActif,
}) {
  return (
    <div className="step">
      <h2 className="step__title">Précisez votre demande</h2>

      <label className="field">
        <span className="field__label">Description</span>
        <textarea
          id="description"
          name="description"
          rows={4}
          placeholder="Décrivez le problème ou le projet…"
          value={champs.description}
          onChange={(evenement) => onChange('description', evenement.target.value)}
        />
      </label>

      <div className="field">
        <span className="field__label">Photo du problème</span>
        <div className="notice">
          <strong>Important :</strong> photographiez l&apos;installation complète avec un
          mètre de recul (tuyaux, raccords), pas seulement la flaque d&apos;eau.
        </div>
        <div className="upload">
          {apercu && <img className="upload__preview" src={apercu} alt="Aperçu" />}
          <label className="upload__drop">
            <UploadIcon width={18} height={18} />
            <span>{photoNom || 'Prendre une photo ou choisir un fichier'}</span>
            <input
              type="file"
              id="photo"
              name="photo"
              accept="image/*"
              capture="environment"
              onChange={(evenement) => onPhoto(evenement.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      </div>

      <label className="field">
        <span className="field__label">Adresse</span>
        <input
          type="text"
          id="adresse"
          name="adresse"
          placeholder="N°, rue…"
          value={champs.adresse}
          onChange={(evenement) => onChange('adresse', evenement.target.value)}
        />
      </label>

      <label className="field">
        <span className="field__label">Code Postal / Ville</span>
        <input
          type="text"
          id="code_postal"
          name="code_postal"
          placeholder="Ex: 34540 Balaruc-les-Bains"
          value={champs.codePostal}
          onChange={(evenement) => onChange('codePostal', evenement.target.value)}
        />
      </label>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={cases.eauCoupee}
          onChange={(evenement) => onCase('eauCoupee', evenement.target.checked)}
        />
        <span>L&apos;arrivée d&apos;eau générale est coupée (compteur fermé).</span>
      </label>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={cases.urgence}
          onChange={(evenement) => onCase('urgence', evenement.target.checked)}
        />
        <span>
          Intervention d&apos;urgence requise (j&apos;accepte la facturation des frais de
          déplacement inhérents).
        </span>
      </label>

      <div className="actions">
        <button type="button" className="btn btn--ghost" onClick={onRetour}>
          Retour
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={onSuivant}
          disabled={!suivantActif}
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
