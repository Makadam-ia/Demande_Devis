/**
 * Étape 3 — « Contact » : nom, e-mail, téléphone et envoi final.
 * Le bouton « Envoyer l'Alerte » est désactivé si les champs sont invalides ou
 * pendant l'envoi (prévention de la double soumission), avec un indicateur de
 * chargement visuel.
 *
 * @param {{
 *   contact: { nom: string, email: string, telephone: string },
 *   onChange: (champ: string, valeur: string) => void,
 *   onRetour: () => void,
 *   onEnvoyer: () => void,
 *   valide: boolean,
 *   isLoading: boolean,
 * }} props
 */
export default function StepContact({
  contact,
  onChange,
  onRetour,
  onEnvoyer,
  valide,
  isLoading,
}) {
  return (
    <div className="step">
      <h2 className="step__title">Vos coordonnées</h2>

      <label className="field">
        <span className="field__label">Nom</span>
        <input
          type="text"
          id="nom"
          name="nom"
          autoComplete="name"
          placeholder="Prénom et nom"
          value={contact.nom}
          onChange={(evenement) => onChange('nom', evenement.target.value)}
        />
      </label>

      <label className="field">
        <span className="field__label">E-mail</span>
        <input
          type="email"
          id="email"
          name="email"
          autoComplete="email"
          autoCapitalize="none"
          placeholder="vous@exemple.fr"
          value={contact.email}
          onChange={(evenement) => onChange('email', evenement.target.value)}
        />
      </label>

      <label className="field">
        <span className="field__label">Téléphone</span>
        <input
          type="tel"
          id="telephone"
          name="telephone"
          autoComplete="tel"
          inputMode="tel"
          placeholder="06 12 34 56 78"
          value={contact.telephone}
          onChange={(evenement) => onChange('telephone', evenement.target.value)}
        />
      </label>

      <div className="actions">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onRetour}
          disabled={isLoading}
        >
          Retour
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={onEnvoyer}
          disabled={!valide || isLoading}
        >
          {isLoading && <span className="spinner" aria-hidden="true" />}
          {isLoading ? 'Envoi en cours…' : "Envoyer l'Alerte"}
        </button>
      </div>
    </div>
  );
}
