/**
 * Envoi d'un lead vers l'Edge Function `ingestion-lead` du CRM.
 *
 * Le contrat backend attend :
 * - une requête `POST` en JSON ;
 * - l'en-tête `X-Funnel-Token` portant le jeton de l'entonnoir (le formulaire
 *   est public, le jeton autorise la source et permet de rattacher le lead au
 *   bon locataire du CRM) ;
 * - un corps réduit à cinq champs : `nom`, `email`, `telephone`, `description`,
 *   `urgence`.
 *
 * L'URL de la fonction et le jeton sont configurables par variables
 * d'environnement Vite (`VITE_INGESTION_LEAD_URL`, `VITE_FUNNEL_TOKEN`) afin de
 * ne pas figer l'environnement de production dans le code. Une valeur par défaut
 * pointe vers le projet Supabase du CRM.
 */

const URL_INGESTION =
  import.meta.env.VITE_INGESTION_LEAD_URL ??
  'https://ykepcefnjurwdenmexgl.supabase.co/functions/v1/ingestion-lead';

const JETON_ENTONNOIR = import.meta.env.VITE_FUNNEL_TOKEN ?? '';

/**
 * Normalise le lead pour ne transmettre que les champs attendus par le backend.
 *
 * @param {{ nom: string, email: string, telephone: string, description: string, urgence: string }} lead
 * @returns {{ nom: string, email: string, telephone: string, description: string, urgence: string }}
 */
function construirePayload(lead) {
  return {
    nom: lead.nom.trim(),
    email: lead.email.trim().toLowerCase(),
    telephone: lead.telephone.trim(),
    description: lead.description.trim(),
    urgence: lead.urgence.trim(),
  };
}

/**
 * Transmet le lead au CRM.
 *
 * @param {{ nom: string, email: string, telephone: string, description: string, urgence: string }} lead
 * @returns {Promise<{ ok: true, data: unknown } | { ok: false, error: string }>}
 *          Résultat normalisé : jamais d'exception, le composant appelant décide
 *          de l'affichage (succès ou message d'erreur).
 */
export async function envoyerLead(lead) {
  try {
    const reponse = await fetch(URL_INGESTION, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Funnel-Token': JETON_ENTONNOIR,
      },
      body: JSON.stringify(construirePayload(lead)),
    });

    // Le corps peut être vide selon le code de statut : on tolère l'absence.
    let donnees = null;
    try {
      donnees = await reponse.json();
    } catch {
      donnees = null;
    }

    if (!reponse.ok) {
      const message =
        (donnees && (donnees.error || donnees.message)) ||
        `Erreur serveur (${reponse.status}).`;
      return { ok: false, error: message };
    }

    return { ok: true, data: donnees };
  } catch (erreur) {
    return {
      ok: false,
      error:
        "Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.",
    };
  }
}
