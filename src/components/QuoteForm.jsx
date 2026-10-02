import { useState } from 'react';
import Stepper from './Stepper.jsx';
import StepBesoin from './StepBesoin.jsx';
import StepDetails from './StepDetails.jsx';
import StepContact from './StepContact.jsx';
import { CheckIcon } from './icons.jsx';
import { envoyerLead } from '../lib/ingestion.js';
import { emailValide, telephoneValide } from '../lib/validation.js';
import { echapperHtml } from '../lib/sanitize.js';

const ETAPES = ['Besoin', 'Détails', 'Contact'];

/** Message d'erreur unique et générique (opacité : jamais de détail serveur). */
const MESSAGE_ERREUR = 'Une erreur est survenue lors de la transmission. Veuillez réessayer.';

/**
 * Colonne droite (dynamique) : entonnoir en 3 étapes.
 *
 * Étape 1 (Besoin) → 2 (Détails) → 3 (Contact). Le payload final est transmis à
 * `envoyerLead` (fetch POST `X-Funnel-Token`) sous la forme
 * `{ nom, email, telephone, description, urgence }`, avec la `description`
 * **échappée** (anti-injection HTML).
 */
export default function QuoteForm() {
  const [etapeIndex, setEtapeIndex] = useState(0);
  const [besoin, setBesoin] = useState('');
  const [details, setDetails] = useState({ description: '', adresse: '', codePostal: '' });
  const [cases, setCases] = useState({ eauCoupee: false, urgence: false });
  const [photoNom, setPhotoNom] = useState('');
  const [apercu, setApercu] = useState('');
  const [contact, setContact] = useState({ nom: '', email: '', telephone: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState(false);

  const detailsValides =
    details.description.trim().length > 0 &&
    details.adresse.trim().length > 0 &&
    details.codePostal.trim().length > 0;

  const contactValide =
    contact.nom.trim().length > 0 &&
    emailValide(contact.email) &&
    telephoneValide(contact.telephone);

  const choisirBesoin = (valeur) => {
    setBesoin(valeur);
    setErreur('');
    setEtapeIndex(1); // passage immédiat à l'étape 2
  };

  const majDetail = (champ, valeur) =>
    setDetails((precedent) => ({ ...precedent, [champ]: valeur }));
  const majCase = (champ, valeur) =>
    setCases((precedent) => ({ ...precedent, [champ]: valeur }));
  const majContact = (champ, valeur) =>
    setContact((precedent) => ({ ...precedent, [champ]: valeur }));

  const choisirPhoto = (fichier) => {
    if (!fichier) {
      setPhotoNom('');
      setApercu('');
      return;
    }
    setPhotoNom(fichier.name);
    const lecteur = new FileReader();
    lecteur.onload = (evenement) => setApercu(evenement.target.result);
    lecteur.readAsDataURL(fichier);
  };

  /**
   * Compose la `description` transmise : bloc de contexte (adresse, cases,
   * photo) + saisie, chaque valeur libre échappée contre l'injection HTML.
   */
  const construireDescription = () => {
    const contexte = [
      `Adresse : ${echapperHtml(details.adresse.trim())}, ${echapperHtml(details.codePostal.trim())}`,
      `Arrivée d'eau générale coupée : ${cases.eauCoupee ? 'oui' : 'non'}`,
      `Intervention d'urgence confirmée : ${cases.urgence ? 'oui' : 'non'}`,
      `Photo du problème : ${photoNom ? echapperHtml(photoNom) : 'non fournie'}`,
    ];
    return `${contexte.join('\n')}\n\n${echapperHtml(details.description.trim())}`;
  };

  /** Envoi final. Prévient la double soumission (`isLoading`). */
  const envoyer = async () => {
    if (!contactValide || isLoading) return;
    setIsLoading(true);
    setErreur('');

    const resultat = await envoyerLead({
      nom: contact.nom,
      email: contact.email,
      telephone: contact.telephone,
      description: construireDescription(),
      urgence: besoin,
    });

    setIsLoading(false);
    if (resultat.ok) {
      setSucces(true);
    } else {
      setErreur(MESSAGE_ERREUR);
    }
  };

  const retour = () => {
    setErreur('');
    setEtapeIndex((index) => Math.max(0, index - 1));
  };

  const suivant = () => {
    if (!detailsValides) return;
    setErreur('');
    setEtapeIndex(2);
  };

  return (
    <section className="form" aria-label="Demande de devis">
      <div className="form__inner">
        <p className="form__eyebrow">Votre projet commence ici</p>
        <h2 className="form__title">Obtenez votre devis gratuit</h2>
        <p className="form__subtitle">
          3 questions, moins de 2 minutes. Votre demande est transmise directement à
          l&apos;artisan.
        </p>

        <div className="card">
          {succes ? (
            <div className="success" role="status">
              <span className="success__icon">
                <CheckIcon width={26} height={26} />
              </span>
              <h3 className="success__title">Demande transmise&nbsp;!</h3>
              <p className="success__text">
                Un artisan analyse votre demande et vous rappelle sous 2 heures.
              </p>
            </div>
          ) : (
            <>
              <Stepper etapes={ETAPES} indexActif={etapeIndex} />

              {etapeIndex === 0 && <StepBesoin onChoisir={choisirBesoin} />}

              {etapeIndex === 1 && (
                <StepDetails
                  champs={details}
                  photoNom={photoNom}
                  apercu={apercu}
                  onChange={majDetail}
                  onPhoto={choisirPhoto}
                  cases={cases}
                  onCase={majCase}
                  onRetour={retour}
                  onSuivant={suivant}
                  suivantActif={detailsValides}
                />
              )}

              {etapeIndex === 2 && (
                <StepContact
                  contact={contact}
                  onChange={majContact}
                  onRetour={retour}
                  onEnvoyer={envoyer}
                  valide={contactValide}
                  isLoading={isLoading}
                />
              )}

              {erreur && (
                <p className="error" role="alert">
                  {erreur}
                </p>
              )}
            </>
          )}
        </div>

        <p className="legal">
          Vos informations restent confidentielles et ne sont jamais revendues.
        </p>
      </div>
    </section>
  );
}

