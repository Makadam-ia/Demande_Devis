import { ShieldCheckIcon, SirenIcon, WrenchIcon } from './icons.jsx';

/** Types d'intervention de l'étape 1 (icônes rouges). */
const INTERVENTIONS = [
  {
    value: 'Dépannage urgent',
    titre: 'Dépannage urgent',
    description: "Une panne, une fuite, une urgence à traiter aujourd'hui.",
    Icone: SirenIcon,
  },
  {
    value: "Projet d'installation",
    titre: "Projet d'installation",
    description: 'Un nouvel équipement, une rénovation, un chantier à chiffrer.',
    Icone: WrenchIcon,
  },
  {
    value: 'Entretien',
    titre: 'Entretien',
    description: "Une visite de contrôle ou un contrat d'entretien annuel.",
    Icone: ShieldCheckIcon,
  },
];

/**
 * Étape 1 — « Besoin ». Trois cartes cliquables verticales ; un clic enregistre
 * le type d'intervention et fait avancer immédiatement à l'étape 2.
 *
 * @param {{ onChoisir: (valeur: string) => void }} props
 */
export default function StepBesoin({ onChoisir }) {
  return (
    <div className="step">
      <h2 className="step__title">Quel type d&apos;intervention souhaitez-vous&nbsp;?</h2>
      <div className="choices">
        {INTERVENTIONS.map(({ value, titre, description, Icone }) => (
          <button
            key={value}
            type="button"
            className="choice"
            onClick={() => onChoisir(value)}
          >
            <span className="choice__icon">
              <Icone width={22} height={22} />
            </span>
            <span className="choice__body">
              <span className="choice__title">{titre}</span>
              <span className="choice__desc">{description}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
