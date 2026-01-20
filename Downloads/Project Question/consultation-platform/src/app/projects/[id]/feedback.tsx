'use client'

import { useState } from 'react'
import { MapPin, MessageCircle, FileText } from 'lucide-react'
import { MapTab, PublicCommentsTab } from './map'
import { FormsTab } from './forms'

type SubTab = 'map' | 'comments' | 'forms'

export function FeedbackTab({ projectId, project }: { projectId: string; project: any }) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('map')

  const subTabs = [
    {
      id: 'map' as SubTab,
      label: 'Map',
      icon: MapPin,
      count: project.mapMarkers?.length || 0,
    },
    {
      id: 'comments' as SubTab,
      label: 'Public Comments',
      icon: MessageCircle,
      count: project.publicPins?.length || 0,
    },
    {
      id: 'forms' as SubTab,
      label: 'Forms',
      icon: FileText,
      count: project.feedbackForms?.length || 0,
    },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Sub-tab navigation */}
      <div className="border-b border-slate-200 bg-white px-6">
        <nav className="flex gap-1" aria-label="Feedback sections">
          {subTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeSubTab === tab.id
                  ? 'border-green-600 text-green-700'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <tab.icon size={16} aria-hidden="true" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeSubTab === tab.id
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Sub-tab content */}
      <div className="flex-1 overflow-auto">
        {activeSubTab === 'map' && (
          <MapTab projectId={projectId} project={project} />
        )}
        {activeSubTab === 'comments' && (
          <div className="p-6">
            <PublicCommentsTab projectId={projectId} project={project} />
          </div>
        )}
        {activeSubTab === 'forms' && (
          <div className="p-6">
            <FormsTab projectId={projectId} forms={project.feedbackForms || []} />
          </div>
        )}
      </div>
    </div>
  )
}
