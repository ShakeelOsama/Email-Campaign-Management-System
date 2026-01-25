import React, { useState } from 'react';
import { Save, Mail, Shield, Bell, Palette } from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, Alert } from '../components/ui';

export function Settings() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    defaultFromName: '',
    defaultFromEmail: '',
    replyToEmail: '',
    sendingRateLimit: '14',
    enableBounceHandling: true,
    enableComplaintHandling: true,
    notifyOnCampaignComplete: true,
    notifyOnHighBounceRate: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to the backend
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">
          Configure your email campaign preferences
        </p>
      </div>

      {saved && (
        <Alert type="success" message="Settings saved successfully!" />
      )}

      {/* Default Email Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Default Email Settings</h2>
              <p className="text-sm text-gray-400">
                Set default values for new campaigns
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Default Sender Name"
              name="defaultFromName"
              placeholder="e.g., Your Company"
              value={settings.defaultFromName}
              onChange={handleChange}
            />
            <Input
              label="Default Sender Email"
              name="defaultFromEmail"
              type="email"
              placeholder="e.g., noreply@company.com"
              value={settings.defaultFromEmail}
              onChange={handleChange}
            />
          </div>
          <Input
            label="Reply-To Email"
            name="replyToEmail"
            type="email"
            placeholder="e.g., support@company.com"
            value={settings.replyToEmail}
            onChange={handleChange}
            helperText="Recipients will reply to this address"
          />
        </CardContent>
      </Card>

      {/* Sending Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Sending & Safety</h2>
              <p className="text-sm text-gray-400">
                Configure sending rates and safety features
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Sending Rate Limit"
            name="sendingRateLimit"
            type="number"
            value={settings.sendingRateLimit}
            onChange={handleChange}
            helperText="Maximum emails per second (based on your SES quota)"
          />
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="enableBounceHandling"
                checked={settings.enableBounceHandling}
                onChange={handleChange}
                className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-gray-900"
              />
              <div>
                <p className="text-white font-medium">Enable Bounce Handling</p>
                <p className="text-sm text-gray-400">
                  Automatically add bounced emails to suppression list
                </p>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="enableComplaintHandling"
                checked={settings.enableComplaintHandling}
                onChange={handleChange}
                className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-gray-900"
              />
              <div>
                <p className="text-white font-medium">Enable Complaint Handling</p>
                <p className="text-sm text-gray-400">
                  Automatically suppress emails that report spam
                </p>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Notifications</h2>
              <p className="text-sm text-gray-400">
                Configure when to receive notifications
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="notifyOnCampaignComplete"
              checked={settings.notifyOnCampaignComplete}
              onChange={handleChange}
              className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-gray-900"
            />
            <div>
              <p className="text-white font-medium">Campaign Completion</p>
              <p className="text-sm text-gray-400">
                Notify when a campaign finishes sending
              </p>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="notifyOnHighBounceRate"
              checked={settings.notifyOnHighBounceRate}
              onChange={handleChange}
              className="w-5 h-5 rounded bg-gray-800 border-gray-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-gray-900"
            />
            <div>
              <p className="text-white font-medium">High Bounce Rate Alert</p>
              <p className="text-sm text-gray-400">
                Notify when bounce rate exceeds 5%
              </p>
            </div>
          </label>
        </CardContent>
      </Card>

      {/* API Configuration Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <Palette className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">AWS Configuration</h2>
              <p className="text-sm text-gray-400">
                Your AWS SES configuration
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-800/50 rounded-xl">
            <p className="text-sm text-gray-400 mb-2">
              AWS credentials and SES configuration are managed through environment variables
              on the backend server:
            </p>
            <ul className="text-sm text-gray-500 space-y-1 font-mono">
              <li>• AWS_REGION</li>
              <li>• AWS_ACCESS_KEY_ID</li>
              <li>• AWS_SECRET_ACCESS_KEY</li>
              <li>• SQS_QUEUE_URL</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} leftIcon={<Save className="w-4 h-4" />}>
          Save Settings
        </Button>
      </div>
    </div>
  );
}
