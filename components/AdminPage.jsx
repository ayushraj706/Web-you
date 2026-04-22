'use client';

import React, { useState } from 'react';
import {
  Shield,
  Key,
  Globe,
  Zap,
  Database,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  Upload,
  Trash2,
  Download,
  Settings,
  Lock,
  Unlock,
  Power,
  BarChart3,
  FileText,
  Webhook
} from 'lucide-react';

export default function AdminPage() {
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);
  const [webhookEnabled, setWebhookEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  
  const [settings, setSettings] = useState({
    instagramApiKey: 'EAAG...xYz12',
    whatsappApiKey: 'WAAPI...abc45',
    webhookUrl: 'https://api.yourdomain.com/webhook',
    webhookSecret: 'whsec_...xyz789',
    autoReplyDelay: '2',
    maxMessagesPerDay: '1000',
    rateLimitWindow: '60'
  });

  const [uploadedFiles, setUploadedFiles] = useState([
    { id: 1, name: 'customer_data.csv', size: '2.4 MB', date: '2024-01-15', type: 'csv' },
    { id: 2, name: 'template_responses.json', size: '156 KB', date: '2024-01-14', type: 'json' },
    { id: 3, name: 'analytics_report.pdf', size: '4.8 MB', date: '2024-01-13', type: 'pdf' },
  ]);

  const handleSaveSettings = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 3000);
    }, 1500);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setSaveStatus('copied');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map((file, index) => ({
      id: uploadedFiles.length + index + 1,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      date: new Date().toISOString().split('T')[0],
      type: file.name.split('.').pop()
    }));
    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };

  const handleDeleteFile = (id) => {
    setUploadedFiles(uploadedFiles.filter(file => file.id !== id));
  };

  const ToggleSwitch = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between p-4 bg-dark-50 rounded-xl hover:bg-dark-100 transition-colors">
      <div className="flex-1">
        <h4 className="font-medium text-dark-900 mb-1">{label}</h4>
        <p className="text-sm text-dark-600">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
          enabled ? 'bg-primary-500' : 'bg-dark-300'
        }`}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const StatusIndicator = ({ status, label }) => (
    <div className="flex items-center space-x-2">
      <div className={`w-2.5 h-2.5 rounded-full ${status ? 'bg-green-500 animate-pulse-soft' : 'bg-red-500'}`}></div>
      <span className="text-sm text-dark-700">{label}</span>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 mb-2">Admin Control Panel</h1>
          <p className="text-dark-600">Manage system settings, API keys, and automations</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
            <StatusIndicator status={true} label="System Online" />
          </div>
          <button className="btn-primary">
            <Shield className="w-4 h-4 mr-2" />
            Security Logs
          </button>
        </div>
      </div>

      {/* Save Status Alert */}
      {saveStatus && (
        <div className={`p-4 rounded-xl flex items-center space-x-3 animate-slide-down ${
          saveStatus === 'saved' ? 'bg-green-50 border border-green-200' :
          saveStatus === 'copied' ? 'bg-blue-50 border border-blue-200' :
          'bg-yellow-50 border border-yellow-200'
        }`}>
          {saveStatus === 'saved' ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">Settings saved successfully!</span>
            </>
          ) : saveStatus === 'copied' ? (
            <>
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-medium">Copied to clipboard!</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5 text-yellow-600 animate-spin" />
              <span className="text-yellow-800 font-medium">Saving changes...</span>
            </>
          )}
        </div>
      )}

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Power className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-dark-600">Auto-Reply Bot</p>
              <p className="text-lg font-bold text-dark-900">{autoReplyEnabled ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Webhook className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-dark-600">Webhook Status</p>
              <p className="text-lg font-bold text-dark-900">{webhookEnabled ? 'Connected' : 'Disconnected'}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-dark-600">Analytics</p>
              <p className="text-lg font-bold text-dark-900">{analyticsEnabled ? 'Tracking' : 'Paused'}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Database className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-dark-600">Database</p>
              <p className="text-lg font-bold text-dark-900">98.2% Healthy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Keys Configuration */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Key className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-dark-900">API Configuration</h3>
              <p className="text-sm text-dark-600">Manage your Instagram and WhatsApp API keys</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Instagram API Key</label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={settings.instagramApiKey}
                  onChange={(e) => setSettings({ ...settings, instagramApiKey: e.target.value })}
                  className="input pr-20 font-mono text-sm"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                  <button
                    onClick={() => handleCopy(settings.instagramApiKey)}
                    className="p-1.5 hover:bg-dark-100 rounded transition-colors"
                    title="Copy"
                  >
                    <Copy className="w-4 h-4 text-dark-600" />
                  </button>
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="p-1.5 hover:bg-dark-100 rounded transition-colors"
                    title={showApiKey ? 'Hide' : 'Show'}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4 text-dark-600" /> : <Eye className="w-4 h-4 text-dark-600" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">WhatsApp API Key</label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={settings.whatsappApiKey}
                  onChange={(e) => setSettings({ ...settings, whatsappApiKey: e.target.value })}
                  className="input pr-20 font-mono text-sm"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                  <button
                    onClick={() => handleCopy(settings.whatsappApiKey)}
                    className="p-1.5 hover:bg-dark-100 rounded transition-colors"
                  >
                    <Copy className="w-4 h-4 text-dark-600" />
                  </button>
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="p-1.5 hover:bg-dark-100 rounded transition-colors"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4 text-dark-600" /> : <Eye className="w-4 h-4 text-dark-600" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-dark-200">
              <button className="btn-secondary w-full justify-center">
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate Keys
              </button>
            </div>
          </div>
        </div>

        {/* Webhook Configuration */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Globe className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-dark-900">Webhook Settings</h3>
              <p className="text-sm text-dark-600">Configure webhook endpoints and secrets</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Webhook URL</label>
              <input
                type="text"
                value={settings.webhookUrl}
                onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                className="input font-mono text-sm"
                placeholder="https://api.yourdomain.com/webhook"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 mb-2">Webhook Secret</label>
              <div className="relative">
                <input
                  type={showWebhookSecret ? 'text' : 'password'}
                  value={settings.webhookSecret}
                  onChange={(e) => setSettings({ ...settings, webhookSecret: e.target.value })}
                  className="input pr-20 font-mono text-sm"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                  <button
                    onClick={() => handleCopy(settings.webhookSecret)}
                    className="p-1.5 hover:bg-dark-100 rounded transition-colors"
                  >
                    <Copy className="w-4 h-4 text-dark-600" />
                  </button>
                  <button
                    onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                    className="p-1.5 hover:bg-dark-100 rounded transition-colors"
                  >
                    {showWebhookSecret ? <EyeOff className="w-4 h-4 text-dark-600" /> : <Eye className="w-4 h-4 text-dark-600" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-dark-200 flex space-x-2">
              <button className="btn-secondary flex-1 justify-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                Test Webhook
              </button>
              <button className="btn-secondary flex-1 justify-center">
                <FileText className="w-4 h-4 mr-2" />
                View Logs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Automation Controls */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Zap className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-dark-900">Automation Controls</h3>
            <p className="text-sm text-dark-600">Manage automated responses and system behaviors</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ToggleSwitch
            enabled={autoReplyEnabled}
            onChange={setAutoReplyEnabled}
            label="Auto-Reply Bot"
            description="Automatically respond to incoming messages"
          />
          <ToggleSwitch
            enabled={webhookEnabled}
            onChange={setWebhookEnabled}
            label="Webhook Events"
            description="Receive real-time webhook notifications"
          />
          <ToggleSwitch
            enabled={analyticsEnabled}
            onChange={setAnalyticsEnabled}
            label="Analytics Tracking"
            description="Track user interactions and engagement"
          />
          <ToggleSwitch
            enabled={true}
            onChange={() => {}}
            label="Message Encryption"
            description="End-to-end encryption for all messages"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-2">Auto-Reply Delay (seconds)</label>
            <input
              type="number"
              value={settings.autoReplyDelay}
              onChange={(e) => setSettings({ ...settings, autoReplyDelay: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-2">Max Messages/Day</label>
            <input
              type="number"
              value={settings.maxMessagesPerDay}
              onChange={(e) => setSettings({ ...settings, maxMessagesPerDay: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-2">Rate Limit Window (min)</label>
            <input
              type="number"
              value={settings.rateLimitWindow}
              onChange={(e) => setSettings({ ...settings, rateLimitWindow: e.target.value })}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* File Management */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-dark-900">File Management</h3>
              <p className="text-sm text-dark-600">Upload and manage system files</p>
            </div>
          </div>
          <label className="btn-primary cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        <div className="space-y-2">
          {uploadedFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-dark-50 rounded-lg hover:bg-dark-100 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white border border-dark-200 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-dark-600" />
                </div>
                <div>
                  <p className="font-medium text-dark-900 text-sm">{file.name}</p>
                  <p className="text-xs text-dark-500">{file.size} • {file.date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-dark-200 rounded-lg transition-colors">
                  <Download className="w-4 h-4 text-dark-600" />
                </button>
                <button
                  onClick={() => handleDeleteFile(file.id)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-3">
        <button className="btn-secondary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </button>
        <button onClick={handleSaveSettings} className="btn-primary">
          <Save className="w-4 h-4 mr-2" />
          Save All Changes
        </button>
      </div>
    </div>
  );
}
