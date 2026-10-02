import Header from './components/Header.jsx';
import ValueColumn from './components/ValueColumn.jsx';
import QuoteForm from './components/QuoteForm.jsx';

/**
 * Page à écran partagé asymétrique.
 *
 * - En-tête fixe transversal.
 * - `main.layout` : empilement vertical sur mobile (valeur puis entonnoir),
 *   grille deux colonnes 50/50 sur desktop.
 */
export default function App() {
  return (
    <>
      <Header />
      <main className="layout">
        <ValueColumn />
        <QuoteForm />
      </main>
    </>
  );
}
