# Entonnoir CRM Artisan — Demande de dépannage

Application **React + Vite** : page à **écran partagé asymétrique** intégrant un
parcours multi-étapes, reliée au CRM via l'Edge Function `ingestion-lead`.

## Démarrage

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de production dans dist/
npm run preview  # prévisualisation du build
```

## Structure de la page

- **En-tête fixe** (fond clair) : logo « AD » + « Artisan Démo » à gauche, numéro
  `05 00 00 00 00` avec icône téléphone à droite.
- **`main.layout`** : colonnes empilées sur mobile (`flex-col`), grille 50/50 sur
  desktop (`lg:grid-cols-2`).
- **Colonne gauche** (`bg-slate-900`, texte blanc) : badge de géolocalisation,
  titre H1 (point final rouge), paragraphe de réassurance, 3 arguments (icônes
  rouges) et carte portfolio « avant / après » (masquée < 768 px).
- **Colonne droite** (`bg-slate-50`) : surtitre rouge, titre « Obtenez votre devis
  gratuit », carte blanche contenant le **stepper** (Besoin → Détails → Contact) et
  l'étape courante, puis la mention de confidentialité.

> Le projet **n'utilise pas Tailwind** : les classes décrites (`bg-slate-900`,
> `lg:grid-cols-2`, `min-h-44px`…) sont traduites dans `src/styles/global.css`.
> Toutes les cibles tactiles respectent une hauteur minimale de **44 px**.

## Parcours & gestion d'état (`src/components/QuoteForm.jsx`)

1. **Besoin** — 3 cartes cliquables (gyrophare, clé à molette, bouclier) ; un clic
   enregistre le type d'intervention et avance **immédiatement** à l'étape 2.
2. **Détails** — description, photo, adresse, code postal/ville, cases « eau
   coupée » et « urgence ». « Suivant » est **désactivé** tant que description,
   adresse et code postal ne sont pas remplis.
3. **Contact** — nom, e-mail, téléphone. « Envoyer l'Alerte ».

## Sécurité client

- **Validation** (`src/lib/validation.js`) : e-mail strict ; téléphone français
  `^0[1-9]([-. ]?[0-9]{2}){4}$`.
- **Sanitization** (`src/lib/sanitize.js`) : échappement HTML (`& < > " '`) de la
  `description` et des champs fusionnés avant construction du payload.
- **Anti double-soumission** : bouton désactivé + indicateur de chargement
  (`isLoading`).
- **Opacité des erreurs** : message générique en cas de rejet ; jamais l'objet
  d'erreur brut ni le jeton dans l'UI ou la console (`src/lib/ingestion.js`).

## Connexion au CRM

`envoyerLead()` exécute un `fetch` **POST** vers `VITE_INGESTION_LEAD_URL` avec
l'en-tête `X-Funnel-Token`. Payload `{ nom, email, telephone, description, urgence }` :
`urgence` ← étape Besoin, `description` ← étape Détails (contexte + saisie,
échappés), le reste ← étape Contact.

### Configuration

Copiez `.env.example` en `.env.local` :

```
VITE_INGESTION_LEAD_URL=https://ykepcefnjurwdenmexgl.supabase.co/functions/v1/ingestion-lead
VITE_FUNNEL_TOKEN=<jeton de l'entonnoir>
```

Le jeton doit correspondre au secret `FUNNEL_SECRET_TOKEN` de l'Edge Function.

## Structure

```
src/
├── App.jsx                       # en-tête + layout (écran partagé)
├── main.jsx
├── styles/global.css
├── lib/
│   ├── ingestion.js              # fetch POST + X-Funnel-Token
│   ├── sanitize.js               # échappement HTML
│   └── validation.js             # regex e-mail / téléphone
└── components/
    ├── Header.jsx                # en-tête fixe
    ├── ValueColumn.jsx           # colonne gauche (valeur + portfolio)
    ├── QuoteForm.jsx             # colonne droite (orchestration 3 étapes)
    ├── Stepper.jsx
    ├── StepBesoin.jsx            # étape 1
    ├── StepDetails.jsx           # étape 2
    ├── StepContact.jsx           # étape 3
    └── icons.jsx
```
