# Entonnoir CRM Artisan — Formulaire de demande de dépannage

Application **React + Vite** : un formulaire monolithique de demande de dépannage,
relié au CRM via l'Edge Function d'ingestion de leads `ingestion-lead`.

## Démarrage

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de production dans dist/
npm run preview  # prévisualisation du build
```

## Formulaire monolithique

L'interface est un **formulaire vertical unique** : tous les champs sont visibles
d'un seul tenant, dans une carte centrée sur fond clair. Ni disposition en
colonnes, ni navigation par étapes.

Champs (dans l'ordre) :
1. **Nom du contact** (input text)
2. **Numéro de téléphone** (input tel)
3. **Adresse e-mail** (input email)
4. **Adresse de l'intervention** (input text, placeholder « N°, Rue... »)
5. **Code Postal et Ville** (input text, placeholder « Ex: 34540 Balaruc-les-Bains »)
6. **Catégorie de l'urgence** (select)
7. **Description détaillée** (textarea)
8. **Photo du problème** (zone de dépôt + avertissement « Important : photographiez
   l'installation complète avec un mètre de recul… »)
9. Case à cocher **« L'arrivée d'eau générale est coupée (compteur fermé). »**
10. Case à cocher **« Intervention d'urgence requise (J'accepte la facturation des
    frais de déplacement inhérents). »**

Bouton de soumission rouge **« Envoyer l'Alerte »**.

## Connexion au CRM

La soumission (`src/components/DemandeDepannage.jsx`) appelle `envoyerLead()`
(`src/lib/ingestion.js`) qui exécute un `fetch` **POST** vers l'Edge Function
`ingestion-lead`.

- **En-tête** : `X-Funnel-Token` (jeton de l'entonnoir).
- **Corps JSON** (5 champs attendus par le backend) :

  | champ         | source dans le formulaire                                              |
  | ------------- | --------------------------------------------------------------------- |
  | `nom`         | Nom du contact                                                         |
  | `email`       | Adresse e-mail                                                         |
  | `telephone`   | Numéro de téléphone                                                    |
  | `urgence`     | Catégorie de l'urgence (select)                                        |
  | `description` | Description détaillée **précédée d'un bloc de contexte** (adresse de l'intervention, code postal, état des cases à cocher, nom du fichier photo) |

> Le backend ne dispose d'aucun champ pour l'adresse, le code postal, la photo ni
> les cases à cocher : ces valeurs sont fondues dans `description` afin de ne pas
> être perdues. La **photo** n'est pas transmise telle quelle (le payload est un
> JSON textuel sans emplacement média) — seul son nom de fichier est consigné.

### Configuration

Copiez `.env.example` en `.env.local` et renseignez :

```
VITE_INGESTION_LEAD_URL=https://ykepcefnjurwdenmexgl.supabase.co/functions/v1/ingestion-lead
VITE_FUNNEL_TOKEN=<jeton de l'entonnoir>
```

Ces valeurs ont un repli dans le code (`src/lib/ingestion.js`) : en l'absence de
`.env.local`, l'URL par défaut pointe vers le projet Supabase du CRM et le jeton
est vide. **Renseignez le jeton avant la mise en production** (il doit correspondre
au secret `FUNNEL_SECRET_TOKEN` de l'Edge Function).

## Structure

```
src/
├── App.jsx                     # carte de formulaire centrée
├── main.jsx                    # point d'entrée React
├── styles/global.css           # styles du formulaire monolithique
├── lib/
│   └── ingestion.js            # fetch POST + X-Funnel-Token
└── components/
    └── DemandeDepannage.jsx    # formulaire vertical + mapping du payload
```
