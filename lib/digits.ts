/**
 * ابزار تبدیل ارقام فارسی/عربی به انگلیسی.
 * برای ورودی‌هایی مثل شماره موبایل و کد تأیید که کاربر ممکن است با کیبورد
 * فارسی تایپ کند و ارقام فارسی (۰-۹) یا عربی (٠-٩) وارد شوند.
 */

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** ارقام فارسی و عربی را به ارقام انگلیسی تبدیل می‌کند (بقیه کاراکترها دست‌نخورده). */
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

/** ورودی را به انگلیسی تبدیل و فقط ارقام را نگه می‌دارد (حذف فاصله/خط تیره و…). */
export function normalizeDigits(value: string): string {
  return toEnglishDigits(value).replace(/\D/g, "");
}
