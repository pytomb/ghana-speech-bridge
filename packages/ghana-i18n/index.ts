/**
 * @ghana-speech-bridge/i18n
 *
 * Locale assets and domain packs for Ghanaian language support.
 * Import what you need — everything is tree-shakeable.
 *
 * Usage:
 *   import { getLocale, getDomainPack, SUPPORTED_LANGUAGES } from '@ghana-speech-bridge/i18n'
 *   const strings = getLocale('tw')
 *   const fintech = getDomainPack('fintech')
 */

export const SUPPORTED_LANGUAGES = [
  { code: "en",  name: "English",        native: "English",      reviewed: true  },
  { code: "tw",  name: "Twi (Asante)",   native: "Twi (Akan)",   reviewed: false },
  { code: "ee",  name: "Ewe",            native: "Ewe",          reviewed: false },
  { code: "gaa", name: "Ga",             native: "Gã",           reviewed: false },
  { code: "dag", name: "Dagbani",        native: "Dagbani",      reviewed: false },
] as const;

export type LangCode = typeof SUPPORTED_LANGUAGES[number]["code"];
export type DomainName = "fintech" | "healthcare" | "agriculture";

export async function getLocale(lang: LangCode) {
  return import(`./locales/${lang}.json`).then((m) => m.default);
}

export async function getDomainPack(domain: DomainName) {
  return import(`./domains/${domain}.json`).then((m) => m.default);
}

/** Quick check: is a locale file marked as reviewed by a native speaker? */
export async function isReviewed(lang: LangCode): Promise<boolean> {
  const locale = await getLocale(lang);
  return locale._meta?.reviewed === true;
}
