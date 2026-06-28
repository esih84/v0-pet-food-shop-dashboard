"use client";

import { Header } from "@/components/dashboard/header";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

export default function SmsPage() {
  return (
    <div className="flex flex-col" dir="rtl">
      <Header
        title="پیامک"
        description="مدیریت قالب‌های پیامک و ارسال انبوه."
      />
      <div className="flex-1 p-6">
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">
                این بخش به‌زودی فعال می‌شود
              </h3>
              <p className="max-w-md text-sm text-muted-foreground">
                سامانه‌ی ارسال پیامک و قالب‌ها در حال آماده‌سازی در سمت بک‌اند
                است. پس از افزودن سرویس پیامک، مدیریت قالب‌ها، ارسال آزمایشی و
                گزارش‌ها از همین‌جا در دسترس خواهد بود.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
