"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/mutations";
import NextImage from "next/image";

import { normalizeDigits } from "@/lib/digits";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { sendOtp, sendOtpPending, verifyOtp, verifyOtpPending } = useAuth();

  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^09\d{9}$/.test(phone)) {
      setError("شماره موبایل معتبر نیست. نمونه: ۰۹۱۲۳۴۵۶۷۸۹");
      return;
    }
    try {
      await sendOtp(phone);
      setStep("code");
    } catch {
      setError("ارسال کد با خطا مواجه شد. دوباره تلاش کنید.");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (code.length !== 5) {
      setError("کد تأیید باید ۵ رقم باشد.");
      return;
    }
    try {
      await verifyOtp({ phone, code });
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes("ادمین")
          ? err.message
          : "کد وارد شده نادرست یا منقضی شده است.",
      );
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-background px-4"
    >
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <NextImage
            src="/logo.png"
            alt="PetMeal"
            width={220}
            height={52}
            priority
            className="h-16 mb-4 w-auto object-contain"
          />
          <h1 className="text-xl font-bold text-foreground">
            ورود به پنل مدیریت
          </h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            {step === "phone"
              ? "شماره موبایل ادمین را وارد کنید"
              : `کد تأیید پیامک‌شده به ${phone} را وارد کنید`}
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm text-center">
              {error}
            </div>
          )}

          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <input
                type="tel"
                inputMode="numeric"
                dir="ltr"
                maxLength={11}
                placeholder="09123456789"
                value={phone}
                onChange={(e) =>
                  setPhone(
                    normalizeDigits(e.target.value)
                      .replace(/\D/g, "")
                      .slice(0, 11),
                  )
                }
                className="w-full text-center tracking-widest rounded-2xl border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="submit"
                disabled={sendOtpPending}
                className="w-full rounded-2xl bg-primary text-primary-foreground py-3 font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {sendOtpPending && <Loader2 className="w-4 h-4 animate-spin" />}
                ارسال کد تأیید
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                dir="ltr"
                maxLength={5}
                placeholder="-----"
                value={code}
                onChange={(e) =>
                  setCode(normalizeDigits(e.target.value).slice(0, 5))
                }
                className="w-full text-center text-lg tracking-[0.5em] rounded-2xl border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="submit"
                disabled={verifyOtpPending}
                className="w-full rounded-2xl bg-primary text-primary-foreground py-3 font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {verifyOtpPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                ورود
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setCode("");
                  setError(null);
                }}
                className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                تغییر شماره موبایل
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-muted-foreground text-sm mt-6">
          پنل مدیریت • دسترسی محافظت‌شده
        </p>
      </div>
    </div>
  );
}
