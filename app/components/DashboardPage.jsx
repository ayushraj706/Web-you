'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Users,
  Zap,
  Clock,
  CheckCircle,
  Activity,
  Instagram,
  Send,
  Eye,
  Heart,
  BarChart3,
  ArrowUpRight
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for charts
const messageData = [
  { name: 'Mon', messages: 245, replies: 198 },
  { name: 'Tue', messages: 312, replies: 287 },
  { name: 'Wed', messages: 289, replies: 254 },
  { name: 'Thu', messages: 378, replies: 342 },
  { name: 'Fri', messages: 421, replies: 389 },
  { name: 'Sat', messages: 356, replies: 298 },
  { name: 'Sun', messages: 298, replies: 265 },
];

const engagementData = [
  { name: '00:00', value: 45 },
  { name: '04:00', value: 23 },
  { name: '08:00', value: 89 },
  { name: '12:00', value: 156 },
  { name: '16:00', value: 198 },
  { name: '20:00', value: 167 },
  { name: '24:00', value: 78 },
];

const webhookEvents = [
  { id: 1, type: 'message', source: 'Instagram', user: '@sarah_jones', time: '2 min ago', status: 'success' },
  { id: 2, type: 'story_mention', source: 'Instagram', user: '@mike_design', time: '5 min ago', status: 'success' },
  { id: 3, type: 'message', source: 'WhatsApp', user: '+1 234 567 8900', time: '8 min ago', status: 'success' },
  { id: 4, type: 'comment', source: 'Instagram', user: '@creative_studio', time: '12 min ago', status: 'pending' },
  { id: 5, type: 'message', source: 'Instagram', user: '@john_doe', time: '15 min ago', status: 'success' },
  { id: 6, type: 'follow', source: 'Instagram', user: '@new_follower', time: '20 min ago', status: 'success' },
];

export default function DashboardPage({ user }) {
  const [stats, setStats] = useState({
    totalMessages: 2847,
    activeSessions: 42,
    autoReplies: 1243,
    responseRate: 94.2
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setIsLoading(false), 800);
  }, []);

  const StatCard = ({ title, value, change, icon: Icon, trend, color }) => (
    <div className="card group hover:scale-105">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-${color}-50 group-hover:bg-${color}-100 transition-colors`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div className={`flex items-center space-x-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="font-medium">{change}</span>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-dark-900 mb-1">{value.toLocaleString()}</h3>
      <p className="text-sm text-dark-600">{title}</p>
    </div>
  );

  const WebhookEventRow = ({ event }) => (
    <div className="flex items-center justify-between py-3 border-b border-dark-100 last:border-0 hover:bg-dark-50 px-4 -mx-4 rounded-lg transition-colors">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
          <Instagram className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-dark-900">{event.user}</p>
          <p className="text-xs text-dark-500">{event.type.replace('_', ' ').toUpperCase()} • {event.source}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-xs text-dark-500">{event.time}</span>
        <span className={`badge ${event.status === 'success' ? 'badge-success' : 'badge-warning'}`}>
          {event.status}
        </span>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dark-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-primary rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'User'}! 👋</h1>
          <p className="text-white/90 text-lg">Here's what's happening with your Instagram and WhatsApp accounts today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Messages"
          value={stats.totalMessages}
          change="+12.5%"
          icon={MessageSquare}
          trend="up"
          color="primary"
        />
        <StatCard
          title="Active Sessions"
          value={stats.activeSessions}
          change="+8.2%"
          icon={Users}
          trend="up"
          color="green"
        />
        <StatCard
          title="Auto-Replies Sent"
          value={stats.autoReplies}
          change="+23.1%"
          icon={Zap}
          trend="up"
          color="purple"
        />
        <StatCard
          title="Response Rate"
          value={stats.responseRate + '%'}
          change="-2.4%"
          icon={Activity}
          trend="down"
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-dark-900">Message Activity</h3>
              <p className="text-sm text-dark-500">Weekly overview</p>
            </div>
            <button className="btn-secondary text-sm">
              <Eye className="w-4 h-4 mr-2" />
              View Report
            </button>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={messageData}>
              <defs>
                <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorReplies" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Area type="monotone" dataKey="messages" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorMessages)" />
              <Area type="monotone" dataKey="replies" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorReplies)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-primary-500"></div>
              <span className="text-sm text-dark-600">Messages</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-accent-purple"></div>
              <span className="text-sm text-dark-600">Replies</span>
            </div>
          </div>
        </div>

        {/* Engagement Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-dark-900">Engagement Over Time</h3>
              <p className="text-sm text-dark-500">Hourly distribution</p>
            </div>
            <button className="btn-secondary text-sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </button>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Webhook Events & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Webhook Events */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-dark-900">Recent Webhook Events</h3>
              <p className="text-sm text-dark-500">Live activity feed</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-soft"></div>
              <span className="font-medium">Live</span>
            </div>
          </div>
          <div className="space-y-0">
            {webhookEvents.map(event => (
              <WebhookEventRow key={event.id} event={event} />
            ))}
          </div>
          <button className="w-full mt-4 btn-ghost text-sm text-center">
            View All Events <ArrowUpRight className="w-4 h-4 inline ml-1" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-dark-900 mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full btn-primary justify-start">
              <Send className="w-4 h-4 mr-3" />
              Send Broadcast
            </button>
            <button className="w-full btn-secondary justify-start">
              <Activity className="w-4 h-4 mr-3" />
              View Analytics
            </button>
            <button className="w-full btn-secondary justify-start">
              <CheckCircle className="w-4 h-4 mr-3" />
              Auto-Reply Settings
            </button>
            <button className="w-full btn-secondary justify-start">
              <Clock className="w-4 h-4 mr-3" />
              Schedule Message
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-dark-200">
            <h4 className="text-sm font-semibold text-dark-900 mb-4">Platform Status</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Instagram className="w-4 h-4 text-pink-600" />
                  <span className="text-sm text-dark-600">Instagram API</span>
                </div>
                <span className="badge badge-success">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-dark-600">WhatsApp API</span>
                </div>
                <span className="badge badge-success">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
