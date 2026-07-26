/**
 * Utility for converting Persian/Arabic digits to English.
 * For inputs like the mobile number and verification code where the user might type
 * with a Persian keyboard and enter Persian (۰-۹) or Arabic (٠-٩) digits.
 */

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Converts Persian and Arabic digits to English digits (other characters untouched). */
export function toEnglishDigits(value: string): string {
  if (!value) return "";
  return value.replace(/[۰-۹٠-٩]/g, (ch) => {
    const persian = PERSIAN_DIGITS.indexOf(ch);
    if (persian > -1) return String(persian);
    const arabic = ARABIC_DIGITS.indexOf(ch);
    if (arabic > -1) return String(arabic);
    return ch;
  });
}

/** Converts the input to English and keeps only digits (strips spaces/dashes, etc.). */
export function normalizeDigits(value: string): string {
  return toEnglishDigits(value).replace(/\D/g, "");
}
