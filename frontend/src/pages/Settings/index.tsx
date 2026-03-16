import { useEffect, useState } from 'react';

import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Toggle } from '../../components/ui/Toggle';
import { api } from '../../services/api';
import type { Settings } from '../../types';

type SettingsForm = Omit<Settings, 'updated'>;

const defaultSettings: SettingsForm = {
  company_name: '',
  support_email: '',
  model_temperature: '0.30',
  auto_suggest_enabled: true,
};

export const SettingsPage = () => {
  const [form, setForm] = useState<SettingsForm>(defaultSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const response = await api.getSettings();
      const { updated: _updated, ...payload } = response.data;
      setForm(payload);
    };
    void fetchSettings();
  }, []);

  const onSave = async () => {
    setSaving(true);
    try {
      await api.updateSettings(form);
      window.alert('Settings saved');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight text-slate-900">Settings</h3>
        <p className="mt-1 text-sm text-slate-500">Manage company profile and AI behavior controls.</p>
      </div>
      <Card>
        <CardHeader>
          <h4 className="text-sm font-semibold text-slate-900">General</h4>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-slate-600">Company Name</label>
            <Input
              value={form.company_name}
              onChange={(e) => setForm((prev) => ({ ...prev, company_name: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-600">Support Email</label>
            <Input
              type="email"
              value={form.support_email}
              onChange={(e) => setForm((prev) => ({ ...prev, support_email: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-600">Model temperature</label>
            <Input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={form.model_temperature}
              onChange={(e) => setForm((prev) => ({ ...prev, model_temperature: e.target.value }))}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
            <div>
              <p className="text-sm font-medium text-slate-800">Auto-suggest replies</p>
              <p className="text-xs text-slate-500">Enable AI generated suggestions for new tickets</p>
            </div>
            <Toggle
              checked={form.auto_suggest_enabled}
              onChange={(checked) => setForm((prev) => ({ ...prev, auto_suggest_enabled: checked }))}
            />
          </div>
          <Button onClick={onSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
