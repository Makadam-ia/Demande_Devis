/**
 * Règles de validation côté client.
 *
 * Volontairement strictes : l'e-mail doit respecter une forme complète et le
 * téléphone le format français à 10 chiffres commençant par 0.
 */

/** Adresse e-mail : partie locale + domaine avec au moins un point. */
export const REGEX_EMAIL =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

/** Téléphone français : 10 chiffres, séparateurs `-`, `.` ou espace optionnels. */
export const REGEX_TELEPHONE = /^0[1-9]([-. ]?[0-9]{2}){4}$/;

/** @returns {boolean} */
export const emailValide = (valeur) => REGEX_EMAIL.test((valeur ?? '').trim());

/** @returns {boolean} */
export const telephoneValide = (valeur) => REGEX_TELEPHONE.test((valeur ?? '').trim());
