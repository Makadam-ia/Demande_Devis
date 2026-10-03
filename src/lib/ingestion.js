/**
 * Transmission d'un lead vers l'Edge Function `ingestion-lead` du CRM.
 *
 * Le backend attend un POST JSON avec l'en-tête `X-Funnel-Token`. Le corps porte
 * les champs du lead (`nom`, `email`, `telephone`, `adresse`, `codePostalVille`,
 * `description`, `urgence`) et, lorsqu'une photo a été choisie, ses données
 * compressées encodées en Base64 pur (`photo_base64`, `photo_nom`,
 * `photo_type`). L'Edge Function dépose le binaire dans le module Storage et le
 * rattache à l'intervention.
 *
 * Sécurité : cette fonction ne journalise **rien** (ni jeton, ni erreur brute) et
 * n'expose aucun détail serveur. Elle ne renvoie qu'un booléen `ok`, l'UI
 * affichant un message générique via `MESSAGE_ERREUR`.
 */

import { preparerPhoto } from './photo.js';

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
    adresse: (lead.adresse ?? '').trim(),
    codePostalVille: (lead.codePostalVille ?? '').trim(),
    description: lead.description.trim(),
    urgence: lead.urgence.trim(),
  };
}

/**
 * Compose les champs photo du payload à partir du fichier choisi (optionnel).
 *
 * Isolé pour qu'une photo illisible ou trop lourde ne fasse **jamais** échouer
 * l'envoi : le lead part alors sans pièce jointe plutôt que d'être perdu.
 *
 * @param {File | null | undefined} fichier
 * @returns {Promise<{ photo_base64?: string, photo_nom?: string, photo_type?: string }>}
 */
async function champsPhoto(fichier) {
  if (!fichier) return {};
  try {
    const { base64, nom, type } = await preparerPhoto(fichier);
    return { photo_base64: base64, photo_nom: nom, photo_type: type };
  } catch {
    // Photo illisible/volumineuse : le lead est transmis sans photo.
    return {};
  }
}

/**
 * Envoie le lead.
 *
 * @param {{
 *   nom: string,
 *   email: string,
 *   telephone: string,
 *   adresse?: string,
 *   codePostalVille?: string,
 *   description: string,
 *   urgence: string,
 *   photo?: File | null,
 * }} lead
 * @returns {Promise<{ ok: boolean }>} `ok` vaut vrai pour tout statut HTTP 2xx.
 *          Aucun message d'erreur n'est propagé (opacité côté client).
 */
export async function envoyerLead(lead) {
  try {
    const payload = {
      ...construirePayload(lead),
      ...(await champsPhoto(lead.photo)),
    };
    const reponse = await fetch(URL_INGESTION, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Funnel-Token': JETON_ENTONNOIR,
      },
      body: JSON.stringify(payload),
    });
    return { ok: reponse.ok };
  } catch {
    // Aucun log : ni l'objet d'erreur brut, ni le jeton ne doivent fuiter.
    return { ok: false };
  }
}
