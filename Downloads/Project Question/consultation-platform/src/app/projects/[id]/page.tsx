'use client'

import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Users, MapPin, Inbox, Settings, Mail, LayoutDashboard, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { OverviewTab } from './overview'
import { StakeholderTab } from './stakeholders'
import { FeedbackTab } from './feedback'
import { EnquiriesTab } from './enquiries'
import { SettingsTab } from './settings'
import { MailingListTab } from './mailing-list'
import { AnalyticsTab } from './analytics'
import UserMenu from '@/components/UserMenu'

type Tab = 'overview' | 'stakeholders' | 'feedback' | 'analytics' | 'inbox' | 'mailing' | 'settings'

export default function ProjectPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', params.id],
    queryFn: () => fetch(`/api/projects/${params.id}`).then(r => r.json()),
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <div className="w-64 bg-white border-r border-slate-200 p-4">
          <div className="skeleton h-6 w-32 mb-6" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton h-10 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-8">
          <div className="skeleton h-8 w-64 mb-4" />
          <div className="skeleton h-4 w-96" />
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Project not found</h2>
          <p className="text-slate-600 mb-4">This project may have been deleted or you don't have access.</p>
          <Link href="/" className="btn-primary">
            <ArrowLeft size={18} aria-hidden="true" />
            Back to Projects
          </Link>
        </div>
      </div>
    )
  }

  // Calculate combined feedback count
  const feedbackCount = (project.mapMarkers?.length || 0) + (project.publicPins?.length || 0) + (project.feedbackForms?.length || 0)

  const tabs = [
    {
      id: 'overview' as Tab,
      label: 'Overview',
      icon: LayoutDashboard,
      count: 0,
    },
    {
      id: 'stakeholders' as Tab,
      label: 'Stakeholders',
      icon: Users,
      count: project.stakeholders?.length || 0,
    },
    {
      id: 'feedback' as Tab,
      label: 'Feedback',
      icon: MapPin,
      count: feedbackCount,
    },
    {
      id: 'analytics' as Tab,
      label: 'AI Analytics',
      icon: BarChart3,
      count: 0,
    },
    {
      id: 'inbox' as Tab,
      label: 'Inbox',
      icon: Inbox,
      count: project.enquiries?.length || 0,
    },
    {
      id: 'mailing' as Tab,
      label: 'Mailing List',
      icon: Mail,
      count: project.subscribers?.length || 0,
    },
    {
      id: 'settings' as Tab,
      label: 'Settings',
      icon: Settings,
      count: 0,
    },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Skip link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Left Sidebar Navigation */}
      <aside className="w-64 min-w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        {/* Project Header */}
        <div className="p-4 border-b border-slate-200">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-3"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            All Projects
          </Link>
          <h1 className="font-semibold text-slate-900 truncate" title={project.name}>
            {project.name}
          </h1>
          {project.description && (
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{project.description}</p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3" aria-label="Project sections">
          <ul className="space-y-1" role="tablist">
            {tabs.map(tab => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`${tab.id}-panel`}
                  id={`${tab.id}-tab`}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-green-50 text-green-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <tab.icon size={18} aria-hidden="true" className={activeTab === tab.id ? 'text-green-600' : ''} />
                  <span className="flex-1 text-left">{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        activeTab === tab.id
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                      aria-label={`${tab.count} ${tab.label.toLowerCase()}`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer with User Menu */}
        <div className="p-4 border-t border-slate-200 space-y-3">
          <UserMenu />
          <div className="text-xs text-slate-400">
            Last updated: {new Date(project.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <main id="main-content" className="flex-1 overflow-auto">
        <div
          role="tabpanel"
          id={`${activeTab}-panel`}
          aria-labelledby={`${activeTab}-tab`}
          className="h-full"
        >
          {activeTab === 'overview' && (
            <div className="p-6">
              <OverviewTab project={project} onNavigate={setActiveTab} />
            </div>
          )}
          {activeTab === 'stakeholders' && (
            <div className="p-6">
              <StakeholderTab projectId={params.id} stakeholders={project.stakeholders} />
            </div>
          )}
          {activeTab === 'feedback' && (
            <FeedbackTab projectId={params.id} project={project} />
          )}
          {activeTab === 'analytics' && (
            <div className="p-6">
              <AnalyticsTab projectId={params.id} />
            </div>
          )}
          {activeTab === 'inbox' && (
            <div className="p-6">
              <EnquiriesTab projectId={params.id} project={project} />
            </div>
          )}
          {activeTab === 'mailing' && (
            <div className="p-6">
              <MailingListTab projectId={params.id} />
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="p-6">
              <SettingsTab projectId={params.id} project={project} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
