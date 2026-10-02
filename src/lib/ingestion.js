/**
 * Transmission d'un lead vers l'Edge Function `ingestion-lead` du CRM.
 *
 * Le backend attend un POST JSON avec l'en-tête `X-Funnel-Token` et un corps
 * réduit à cinq champs : `nom`, `email`, `telephone`, `description`, `urgence`.
 *
 * Sécurité : cette fonction ne journalise **rien** (ni jeton, ni erreur brute) et
 * n'expose aucun détail serveur. Elle ne renvoie qu'un booléen `ok`, l'UI
 * affichant un message générique via `MESSAGE_ERREUR`.
 */

const URL_INGESTION =
  import.meta.env.VITE_INGESTION_LEAD_URL ??
  'https://ykepcefnjurwdenmexgl.supabase.co/functions/v1/ingestion-lead';

const JETON_ENTONNOIR = import.meta.env.VITE_FUNNEL_TOKEN ?? '';

/** Normalise le lead pour ne transmettre que les champs attendus par le backend. */
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
 * Envoie le lead.
 *
 * @param {{ nom: string, email: string, telephone: string, description: string, urgence: string }} lead
 * @returns {Promise<{ ok: boolean }>} `ok` vaut vrai pour tout statut HTTP 2xx.
 *          Aucun message d'erreur n'est propagé (opacité côté client).
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
    return { ok: reponse.ok };
  } catch {
    // Aucun log : ni l'objet d'erreur brut, ni le jeton ne doivent fuiter.
    return { ok: false };
  }
}
