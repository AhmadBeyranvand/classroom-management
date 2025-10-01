'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';

interface SettingsData {
  absence_deduction: string;
}

export default function SettingsPanel() {
  const [settings, setSettings] = useState<SettingsData>({ absence_deduction: '0.5' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      setSaving(true);
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });

      if (response.ok) {
        setSettings(prev => ({ ...prev, [key]: value }));
      }
    } catch (error) {
      console.error('Error updating setting:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-lg">در حال بارگذاری تنظیمات...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            تنظیمات نمره‌دهی
          </CardTitle>
          <CardDescription>
            مدیریت نحوه محاسبه نمرات و کسر نمره غیبت‌ها
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="absenceDeduction">
              میزان کسر نمره برای هر غیبت غیر موجه
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="absenceDeduction"
                type="number"
                step="0.1"
                min="0"
                max="20"
                value={settings.absence_deduction}
                onChange={(e) => setSettings({ ...settings, absence_deduction: e.target.value })}
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">نمره از 20</span>
              <Button
                onClick={() => updateSetting('absence_deduction', settings.absence_deduction)}
                disabled={saving}
                size="sm"
              >
                {saving ? 'در حال ذخیره...' : 'ذخیره'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              به ازای هر غیبت غیر موجه، این مقدار از نمره نهایی دانش‌آموز کسر خواهد شد.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>نحوه محاسبه نمره نهایی</CardTitle>
          <CardDescription>
            فرمول محاسبه نمره نهایی دانش‌آموزان
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>نمره پایه:</strong> (میانگین نمره کلاسی + میانگین نمره تمرین) ÷ 2</p>
            <p><strong>نمره نهایی:</strong> نمره پایه - (تعداد غیبت‌های غیر موجه × {settings.absence_deduction})</p>
            <p className="text-muted-foreground">
              نمره نهایی هرگز کمتر از 0 نخواهد بود.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}