/**
 * Échappement des caractères sensibles HTML.
 *
 * Empêche l'injection de balises/scripts depuis les champs libres (description,
 * adresse, nom de fichier…) avant leur intégration au payload transmis au CRM.
 * Le remplacement est appliqué à `&` en premier pour ne pas double-échapper les
 * entités produites pour les autres caractères.
 */
const CORRESPONDANCES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * @param {unknown} valeur
 * @returns {string} Chaîne échappée (chaîne vide si `valeur` n'est pas une chaîne).
 */
export function echapperHtml(valeur) {
  if (typeof valeur !== 'string') return '';
  return valeur.replace(/[&<>"']/g, (caractere) => CORRESPONDANCES[caractere]);
}
