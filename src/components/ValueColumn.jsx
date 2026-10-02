import {
  ArrowRightIcon,
  ClockIcon,
  GiftIcon,
  MapPinIcon,
  ShieldIcon,
  StarIcon,
} from './icons.jsx';

/** Trois arguments de réassurance (icônes rouges). */
const ARGUMENTS = [
  { Icone: ClockIcon, libelle: 'Rappel sous 2 heures' },
  { Icone: ShieldIcon, libelle: 'Artisan assuré & certifié' },
  { Icone: GiftIcon, libelle: 'Devis gratuit' },
];

/**
 * Colonne gauche (statique) : proposition de valeur, réassurance et preuve
 * terrain. Fond bleu nuit profond, texte blanc.
 */
export default function ValueColumn() {
  return (
    <section className="value">
      <span className="value__badge">
        <MapPinIcon width={16} height={16} />
        Toulouse et alentours
      </span>

      <h1 className="value__title">
        Votre expert local du bâtiment<span className="value__dot">.</span>
      </h1>

      <p className="value__subtitle">
        Dépannage, installation, entretien. Un artisan qualifié vous rappelle sous 2 heures,
        devis gratuit et sans engagement.
      </p>

      <ul className="value__args">
        {ARGUMENTS.map(({ Icone, libelle }) => (
          <li key={libelle} className="arg">
            <Icone width={18} height={18} />
            <span>{libelle}</span>
          </li>
        ))}
      </ul>

      <PortfolioCard />
    </section>
  );
}

/**
 * Carte de réalisation (avant / après). Masquée sur très petits écrans
 * (`hidden md:block`).
 */
function PortfolioCard() {
  return (
    <figure className="portfolio">
      <div className="portfolio__head">
        <div>
          <span className="portfolio__eyebrow">
            <StarIcon width={14} height={14} />
            Une transformation réelle
          </span>
          <p className="portfolio__context">Rénovation complète • Toulouse</p>
        </div>
        <span className="portfolio__badge">Livré</span>
      </div>

      <div className="portfolio__media">
        <div className="portfolio__shot portfolio__shot--before">
          <span className="portfolio__tag">Avant</span>
        </div>
        <div className="portfolio__shot portfolio__shot--after">
          <span className="portfolio__tag portfolio__tag--after">Après</span>
        </div>
      </div>

      <figcaption className="portfolio__foot">
        <span>Salle de bain • 8 jours</span>
        <span className="portfolio__link">
          Voir le résultat
          <ArrowRightIcon width={16} height={16} />
        </span>
      </figcaption>
    </figure>
  );
}
