import { useEffect, useState } from 'react';

import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Toggle } from '../../components/ui/Toggle';
import { useToast } from '../../components/ui/ToastProvider';
import { api } from '../../services/api';
import type { GmailIntegration, Settings } from '../../types';

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
  const [gmail, setGmail] = useState<GmailIntegration | null>(null);
  const [gmailEmail, setGmailEmail] = useState('');
  const [gmailPassword, setGmailPassword] = useState('');
  const [gmailLoading, setGmailLoading] = useState(false);
   const { showToast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      const response = await api.getSettings();
      const { updated: _updated, ...payload } = response.data;
      setForm(payload);
    };
    const fetchGmailStatus = async () => {
      const response = await api.getGmailStatus();
      setGmail(response.data.integration ?? null);
      if (response.data.integration) {
        setGmailEmail(response.data.integration.email);
      }
    };
    void fetchSettings();
    void fetchGmailStatus();
  }, []);

  const onSave = async () => {
    setSaving(true);
    try {
      await api.updateSettings(form);
      showToast('Settings saved', { variant: 'success' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save settings';
      showToast(message, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const connectGmail = async () => {
    if (!gmailEmail || !gmailPassword) {
      showToast('Enter Gmail and app password', { variant: 'error' });
      return;
    }
    setGmailLoading(true);
    try {
      await api.connectGmail({ email: gmailEmail, app_password: gmailPassword });
      const statusResponse = await api.getGmailStatus();
      setGmail(statusResponse.data.integration ?? null);
      setGmailPassword('');
      showToast('Gmail connected', { variant: 'success' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to connect Gmail';
      showToast(message, { variant: 'error' });
    } finally {
      setGmailLoading(false);
    }
  };

  const disconnectGmail = async () => {
    setGmailLoading(true);
    try {
      await api.disconnectGmail();
      setGmail(null);
      showToast('Gmail disconnected', { variant: 'info' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to disconnect Gmail';
      showToast(message, { variant: 'error' });
    } finally {
      setGmailLoading(false);
    }
  };

  const syncGmail = async () => {
    setGmailLoading(true);
    try {
      const response = await api.syncGmailTickets();
      const statusResponse = await api.getGmailStatus();
      setGmail(statusResponse.data.integration ?? null);
      showToast(
        `Sync done: ${response.data.created_tickets} created, ${response.data.skipped} skipped`,
        { variant: 'success' },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sync Gmail';
      showToast(message, { variant: 'error' });
    } finally {
      setGmailLoading(false);
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

      <Card>
        <CardHeader>
          <h4 className="text-sm font-semibold text-slate-900">Gmail Integration</h4>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-slate-600">Gmail Address</label>
            <Input
              type="email"
              value={gmailEmail}
              onChange={(e) => setGmailEmail(e.target.value)}
              placeholder="support@company.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-600">Gmail App Password</label>
            <Input
              type="password"
              value={gmailPassword}
              onChange={(e) => setGmailPassword(e.target.value)}
              placeholder="16-character app password"
            />
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <p className="font-medium text-slate-800">
              Status: {gmail?.is_active ? 'Connected' : 'Not connected'}
            </p>
            {gmail?.last_synced && (
              <p className="mt-1 text-slate-500">
                Last synced: {new Date(gmail.last_synced).toLocaleString()}
              </p>
            )}
            {gmail?.last_error && <p className="mt-1 text-red-600">{gmail.last_error}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={connectGmail} disabled={gmailLoading}>
              Connect Gmail
            </Button>
            <Button variant="secondary" onClick={syncGmail} disabled={gmailLoading || !gmail?.is_active}>
              Sync Inbox
            </Button>
            <Button variant="ghost" onClick={disconnectGmail} disabled={gmailLoading || !gmail?.is_active}>
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
