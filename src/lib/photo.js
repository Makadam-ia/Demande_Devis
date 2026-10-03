/**
 * Préparation de la photo du problème avant transmission à l'Edge Function
 * `ingestion-lead`.
 *
 * Une photo prise au téléphone pèse plusieurs mégaoctets ; encodée en Base64
 * elle croît encore d'environ 33 %. Le corps d'une requête Edge Function étant
 * plafonné (~5 Mo), l'image est d'abord **redimensionnée** (1600 px sur le plus
 * grand côté) puis **compressée** en WebP (repli JPEG) jusqu'à ~300 Ko, avant
 * encodage en Base64 pur. Alignement sur la compression des médias du CRM
 * (`flow-plumber/src/lib/medias.ts`).
 *
 * Aucun détail interne (objet d'erreur brut, jeton) n'est journalisé ici.
 */

const COTE_MAX = 1600;
const CIBLE_OCTETS = 300 * 1024;
const EXT_IMAGE = /\.(jpe?g|png|webp|heic|heif|avif)$/i;

/** `true` si le fichier est très probablement une image. */
export function estImage(fichier) {
  return fichier.type.startsWith('image/') || EXT_IMAGE.test(fichier.name);
}

/** Décode le fichier en respectant l'orientation EXIF quand le navigateur le permet. */
async function decoder(fichier) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(fichier, { imageOrientation: 'from-image' });
    } catch {
      /* repli sur <img> ci-dessous */
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(fichier);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image illisible sur cet appareil.'));
    };
    img.src = url;
  });
}

const versBlob = (canvas, mime, qualite) =>
  new Promise((resolve) => canvas.toBlob(resolve, mime, qualite));

/**
 * Redimensionne à 1600 px sur le plus grand côté et compresse en WebP
 * (repli JPEG), qualité dégressive jusqu'à ~300 Ko.
 *
 * @returns {Promise<Blob>}
 */
async function compresser(fichier) {
  const source = await decoder(fichier);
  const largeur = 'naturalWidth' in source ? source.naturalWidth : source.width;
  const hauteur = 'naturalHeight' in source ? source.naturalHeight : source.height;
  const ratio = Math.min(1, COTE_MAX / Math.max(largeur, hauteur));

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(largeur * ratio));
  canvas.height = Math.max(1, Math.round(hauteur * ratio));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Compression impossible sur cet appareil.');
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  if ('close' in source) source.close();

  const webpOk = canvas.toDataURL('image/webp').startsWith('data:image/webp');
  const mime = webpOk ? 'image/webp' : 'image/jpeg';

  let blob = null;
  for (const qualite of [0.8, 0.75, 0.65]) {
    blob = await versBlob(canvas, mime, qualite);
    if (blob && blob.size <= CIBLE_OCTETS) break;
  }
  if (!blob) throw new Error("Compression de l'image impossible.");
  return blob;
}

/** Encode un Blob en Base64 **pur** (sans le préfixe `data:...;base64,`). */
function blobVersBase64(blob) {
  return new Promise((resolve, reject) => {
    const lecteur = new FileReader();
    lecteur.onload = () => {
      const resultat = String(lecteur.result);
      const virgule = resultat.indexOf(',');
      resolve(virgule >= 0 ? resultat.slice(virgule + 1) : resultat);
    };
    lecteur.onerror = () => reject(new Error('Encodage de la photo impossible.'));
    lecteur.readAsDataURL(blob);
  });
}

/**
 * Prépare la photo pour le transport : compression puis Base64 pur.
 *
 * @param {File} fichier
 * @returns {Promise<{ base64: string, nom: string, type: string }>}
 *          `base64` est du Base64 pur (sans préfixe `data:`), `type` le type
 *          MIME du blob compressé (WebP ou JPEG).
 */
export async function preparerPhoto(fichier) {
  if (!estImage(fichier)) {
    throw new Error('Formats acceptés : JPEG, PNG, WebP, HEIC/HEIF.');
  }
  const blob = await compresser(fichier);
  const base64 = await blobVersBase64(blob);
  return { base64, nom: fichier.name, type: blob.type || 'image/jpeg' };
}
