'use client';

import { useState, useEffect } from 'react';
import { Settings, BarChart3, Users, BookOpen, Languages, Activity, Shield, Database, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';

export default function AdminDialectsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/dialects/analytics?type=report');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8" />
            Dialect Management Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Admin dashboard for managing dialect comparison platform
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('dialects')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dialects'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Languages className="w-4 h-4 inline mr-2" />
              Dialects
            </button>
            <button
              onClick={() => setActiveTab('vocabulary')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'vocabulary'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Vocabulary
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Users
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'audit'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Audit Log
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'security'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              Security
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && <OverviewTab analytics={analytics} />}
            {activeTab === 'dialects' && <DialectsTab />}
            {activeTab === 'vocabulary' && <VocabularyTab />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'audit' && <AuditTab />}
            {activeTab === 'security' && <SecurityTab />}
          </>
        )}
      </div>
    </div>
  );
}

function OverviewTab({ analytics }: { analytics: any }) {
  if (!analytics) {
    return <div className="text-center py-12 text-gray-500">No analytics data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={BookOpen}
          title="Total Entries"
          value={analytics.system?.totalEntries || 0}
          color="blue"
        />
        <StatCard
          icon={Languages}
          title="Total Dialects"
          value={analytics.system?.totalDialects || 0}
          color="green"
        />
        <StatCard
          icon={Database}
          title="Total Variants"
          value={analytics.system?.totalVariants || 0}
          color="purple"
        />
        <StatCard
          icon={Activity}
          title="Total Annotations"
          value={analytics.system?.totalAnnotations || 0}
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Entries by Part of Speech
          </h3>
          <div className="space-y-3">
            {analytics.system?.entriesByPOS?.map((item: any) => (
              <div key={item.partOfSpeech} className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">{item.partOfSpeech}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Entries by Difficulty Level
          </h3>
          <div className="space-y-3">
            {analytics.system?.entriesByDifficulty?.map((item: any) => (
              <div key={item.difficultyLevel} className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300 capitalize">{item.difficultyLevel}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dialect Analytics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Dialect Analytics
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Dialect</th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Entries</th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Variants</th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Annotations</th>
                <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {analytics.dialects?.map((dialect: any) => (
                <tr key={dialect.dialectId} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">{dialect.dialectName}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{dialect.totalEntries}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{dialect.totalVariants}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{dialect.totalAnnotations}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {dialect.lastUpdated ? new Date(dialect.lastUpdated).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, color }: {
  icon: any;
  title: string;
  value: number;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function DialectsTab() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dialect Management</h3>
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Dialect
        </button>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search dialects..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
        Dialect management functionality coming soon
      </p>
    </div>
  );
}

function VocabularyTab() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Vocabulary Management</h3>
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Entry
        </button>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
        Vocabulary management functionality coming soon
      </p>
    </div>
  );
}

function UsersTab() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">User Management</h3>
      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
        User management functionality coming soon
      </p>
    </div>
  );
}

function AuditTab() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Audit Log</h3>
      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
        Audit log functionality coming soon
      </p>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Security Settings</h3>
      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
        Security settings functionality coming soon
      </p>
    </div>
  );
}
