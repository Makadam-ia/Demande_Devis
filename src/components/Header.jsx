import { PhoneIcon } from './icons.jsx';

/**
 * En-tête fixe, fond clair. Identité de l'artisan à gauche, numéro d'appel à
 * droite. La cible téléphonique respecte la hauteur minimale tactile (44 px).
 */
export default function Header() {
  return (
    <header className="header">
      <div className="header__brand">
        <span className="header__logo" aria-hidden="true">
          AD
        </span>
        <span className="header__name">Artisan Démo</span>
      </div>
      <a className="header__phone" href="tel:0500000000">
        <PhoneIcon width={18} height={18} />
        <span>05 00 00 00 00</span>
      </a>
    </header>
  );
}
