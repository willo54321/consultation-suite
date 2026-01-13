import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Inbox,
  Map,
  Bot,
  ClipboardList,
} from 'lucide-react';
import { setApiKey } from '@/api/client';

interface LayoutProps {
  children: ReactNode;
  projectId?: string;
  projectName?: string;
}

export default function Layout({ children, projectId, projectName }: LayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem('admin_api_key');
    setIsAuthenticated(!!key);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_api_key');
    router.push('/login');
  };

  // Simplified navigation - focused on core features
  const navItems = projectId
    ? [
        // Overview
        { href: `/projects/${projectId}`, icon: LayoutDashboard, label: 'Dashboard', section: 'main' },

        // Content & Configuration
        { href: `/projects/${projectId}/documents`, icon: FileText, label: 'Documents', section: 'content' },
        { href: `/projects/${projectId}/interactive-map`, icon: Map, label: 'Interactive Map', section: 'content' },

        // Engagement Tools
        { href: `/projects/${projectId}/chatbot`, icon: Bot, label: 'AI Chatbot', section: 'engagement' },
        { href: `/projects/${projectId}/feedback-form`, icon: ClipboardList, label: 'Feedback Form', section: 'engagement' },

        // Query Management
        { href: `/projects/${projectId}/queries`, icon: Inbox, label: 'Query Inbox', section: 'management' },
        { href: `/projects/${projectId}/conversations`, icon: MessageSquare, label: 'Conversations', section: 'management' },

        // Settings
        { href: `/projects/${projectId}/settings`, icon: Settings, label: 'Settings', section: 'settings' },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <h1 className="text-lg font-semibold">Consultation AI</h1>
        <div className="w-10" />
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50
            w-64 bg-white border-r border-gray-200
            transform lg:transform-none transition-transform
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="h-full flex flex-col">
            {/* Logo */}
            <div className="p-4 border-b border-gray-200">
              <Link href="/" className="text-xl font-bold text-primary-700">
                Consultation AI
              </Link>
            </div>

            {/* Project name */}
            {projectName && (
              <div className="p-4 border-b border-gray-200">
                <p className="text-sm text-gray-500">Current Project</p>
                <p className="font-medium truncate">{projectName}</p>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {!projectId && (
                <Link
                  href="/"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  <LayoutDashboard size={20} />
                  All Projects
                </Link>
              )}

              {projectId && (
                <>
                  {/* Main */}
                  {navItems.filter(i => i.section === 'main').map((item) => {
                    const isActive = router.asPath === item.href || router.asPath.startsWith(item.href + '/');
                    return (
                      <Link key={item.href} href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                        <item.icon size={20} />{item.label}
                      </Link>
                    );
                  })}

                  {/* Content Section */}
                  <div className="pt-4 pb-1">
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Content</p>
                  </div>
                  {navItems.filter(i => i.section === 'content').map((item) => {
                    const isActive = router.asPath === item.href || router.asPath.startsWith(item.href + '/');
                    return (
                      <Link key={item.href} href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                        <item.icon size={20} />{item.label}
                      </Link>
                    );
                  })}

                  {/* Engagement Section */}
                  <div className="pt-4 pb-1">
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Engagement</p>
                  </div>
                  {navItems.filter(i => i.section === 'engagement').map((item) => {
                    const isActive = router.asPath === item.href || router.asPath.startsWith(item.href + '/');
                    return (
                      <Link key={item.href} href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                        <item.icon size={20} />{item.label}
                      </Link>
                    );
                  })}

                  {/* Management Section */}
                  <div className="pt-4 pb-1">
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Management</p>
                  </div>
                  {navItems.filter(i => i.section === 'management').map((item) => {
                    const isActive = router.asPath === item.href || router.asPath.startsWith(item.href + '/');
                    return (
                      <Link key={item.href} href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                        <item.icon size={20} />{item.label}
                      </Link>
                    );
                  })}

                  {/* Settings Section */}
                  <div className="pt-4 pb-1">
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">System</p>
                  </div>
                  {navItems.filter(i => i.section === 'settings').map((item) => {
                    const isActive = router.asPath === item.href || router.asPath.startsWith(item.href + '/');
                    return (
                      <Link key={item.href} href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                        <item.icon size={20} />{item.label}
                      </Link>
                    );
                  })}
                </>
              )}
            </nav>

            {/* Back to projects */}
            {projectId && (
              <div className="p-4 border-t border-gray-200">
                <Link
                  href="/"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  ← All Projects
                </Link>
              </div>
            )}

            {/* Logout */}
            {isAuthenticated && (
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 w-full"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-h-screen">
          <div className="max-w-7xl mx-auto p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
