import DemandeDepannage from './components/DemandeDepannage.jsx';

/**
 * Interface monolithique : une seule carte de formulaire, centrée.
 *
 * L'ancienne disposition « écran partagé » (proposition de valeur à gauche) et
 * le parcours de navigation par étapes (Besoin → Détails → Contact) ont été
 * supprimés au profit de ce formulaire vertical unique.
 */
export default function App() {
  return (
    <main className="page">
      <DemandeDepannage />
    </main>
  );
}

