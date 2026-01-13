import { useState } from 'react';
import { useRouter } from 'next/router';
import { api, Project, Widget } from '@/api/client';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Building2,
  Users,
  Palette,
  LayoutGrid,
  Settings,
  Rocket,
  Upload,
  Plus,
  X
} from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: typeof Building2;
}

const STEPS: Step[] = [
  { id: 1, title: 'Project Details', description: 'Basic information about the consultation', icon: Building2 },
  { id: 2, title: 'Team Setup', description: 'Add team members and set roles', icon: Users },
  { id: 3, title: 'Branding', description: 'Customise colours and logo', icon: Palette },
  { id: 4, title: 'Widgets', description: 'Select widgets to enable', icon: LayoutGrid },
  { id: 5, title: 'Configuration', description: 'Set up AI chatbot and workflows', icon: Settings },
  { id: 6, title: 'Launch', description: 'Review and go live', icon: Rocket },
];

const WIDGET_OPTIONS = [
  { id: 'chatbot', name: 'AI Chatbot', description: 'Answer questions about the consultation' },
  { id: 'faq', name: 'FAQ', description: 'Common questions and answers' },
  { id: 'documents', name: 'Documents', description: 'Planning documents library' },
  { id: 'timeline', name: 'Timeline', description: 'Project milestones' },
  { id: 'form', name: 'Feedback Form', description: 'Collect stakeholder feedback' },
  { id: 'gallery', name: 'Gallery', description: 'Images and videos' },
  { id: 'comparison', name: 'Before/After', description: 'Image comparison slider' },
  { id: 'sitemap', name: 'Site Map', description: 'Interactive site plan' },
  { id: 'stats', name: 'Key Stats', description: 'Animated statistics' },
];

export default function NewProjectWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Project Details
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [description, setDescription] = useState('');
  const [consultationStart, setConsultationStart] = useState('');
  const [consultationEnd, setConsultationEnd] = useState('');

  // Step 2: Team
  const [teamMembers, setTeamMembers] = useState<{ email: string; role: string }[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('member');

  // Step 3: Branding
  const [primaryColor, setPrimaryColor] = useState('#7c3aed');
  const [logo, setLogo] = useState<File | null>(null);

  // Step 4: Widgets
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>(['chatbot', 'form', 'documents']);

  // Step 5: Configuration
  const [welcomeMessage, setWelcomeMessage] = useState('Hello! I\'m here to help answer your questions about this development proposal. What would you like to know?');
  const [contactEmail, setContactEmail] = useState('');

  const addTeamMember = () => {
    if (newMemberEmail) {
      setTeamMembers([...teamMembers, { email: newMemberEmail, role: newMemberRole }]);
      setNewMemberEmail('');
      setNewMemberRole('member');
    }
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const toggleWidget = (id: string) => {
    if (selectedWidgets.includes(id)) {
      setSelectedWidgets(selectedWidgets.filter(w => w !== id));
    } else {
      setSelectedWidgets([...selectedWidgets, id]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Create project
      const project = await api.post<Project>('/projects', {
        name: projectName,
        client: clientName,
        site_address: siteAddress,
        description,
        consultation_start_date: consultationStart,
        consultation_end_date: consultationEnd,
        contact_email: contactEmail,
        welcome_message: welcomeMessage,
        widget_config: {
          primaryColor,
          enabled_widgets: selectedWidgets
        }
      });

      // Create selected widgets
      for (const widgetType of selectedWidgets) {
        const widgetInfo = WIDGET_OPTIONS.find(w => w.id === widgetType);
        await api.post<Widget>(`/projects/${project.id}/widgets`, {
          type: widgetType,
          name: widgetInfo?.name || widgetType,
          config: {}
        });
      }

      // Redirect to project dashboard
      router.push(`/projects/${project.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return projectName.trim() !== '';
      case 2:
        return true; // Team is optional
      case 3:
        return true; // Branding has defaults
      case 4:
        return selectedWidgets.length > 0;
      case 5:
        return true;
      case 6:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Land North of High Street"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. ABC Developments Ltd"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Site Address</label>
              <input
                type="text"
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                placeholder="e.g. Land to the north of High Street, Anytown"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Start</label>
                <input
                  type="date"
                  value={consultationStart}
                  onChange={(e) => setConsultationStart(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Consultation End</label>
                <input
                  type="date"
                  value={consultationEnd}
                  onChange={(e) => setConsultationEnd(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex gap-3">
              <input
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="team@example.com"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="member">Team Member</option>
                <option value="manager">Account Manager</option>
                <option value="approver">Approver</option>
                <option value="client">Client (View Only)</option>
              </select>
              <button
                onClick={addTeamMember}
                className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {teamMembers.length > 0 ? (
              <div className="space-y-2">
                {teamMembers.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{member.email}</span>
                      <span className="ml-2 text-sm text-gray-500 capitalize">{member.role.replace('_', ' ')}</span>
                    </div>
                    <button onClick={() => removeTeamMember(index)} className="text-gray-400 hover:text-red-500">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No team members added yet</p>
                <p className="text-sm">You can add team members later</p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Colour</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-16 h-12 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg w-32"
                />
                <div className="flex gap-2">
                  {['#7c3aed', '#3b82f6', '#22c55e', '#f97316', '#ec4899'].map(color => (
                    <button
                      key={color}
                      onClick={() => setPrimaryColor(color)}
                      className="w-10 h-10 rounded-lg border-2 border-transparent hover:border-gray-300"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Drag and drop your logo here, or click to browse</p>
                <p className="text-sm text-gray-500 mt-1">PNG, SVG or JPG (max 2MB)</p>
                <input type="file" className="hidden" accept="image/*" />
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-medium text-gray-900 mb-4">Preview</h4>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: primaryColor }}></div>
                  <span className="font-semibold">{projectName || 'Your Project Name'}</span>
                </div>
                <button className="px-4 py-2 text-white rounded-lg" style={{ backgroundColor: primaryColor }}>
                  Primary Button
                </button>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {WIDGET_OPTIONS.map(widget => (
              <button
                key={widget.id}
                onClick={() => toggleWidget(widget.id)}
                className={`p-4 border-2 rounded-xl text-left transition-all ${
                  selectedWidgets.includes(widget.id)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{widget.name}</span>
                  {selectedWidgets.includes(widget.id) && (
                    <Check className="w-5 h-5 text-purple-600" />
                  )}
                </div>
                <p className="text-sm text-gray-500">{widget.description}</p>
              </button>
            ))}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="consultation@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">Displayed in the chatbot for complex queries</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">AI Chatbot Welcome Message</label>
              <textarea
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-medium text-blue-800 mb-2">Next Steps</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Upload planning documents to train the AI chatbot</li>
                <li>• Add FAQ content for the FAQ widget</li>
                <li>• Configure approval workflows for query responses</li>
                <li>• Customise feedback form fields</li>
              </ul>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <Rocket className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-green-800 mb-2">Ready to Launch!</h3>
              <p className="text-green-700">Your consultation project is ready to be created.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Summary</h4>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Project Name</dt>
                  <dd className="font-medium">{projectName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Client</dt>
                  <dd className="font-medium">{clientName || '-'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Team Members</dt>
                  <dd className="font-medium">{teamMembers.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Widgets</dt>
                  <dd className="font-medium">{selectedWidgets.length} enabled</dd>
                </div>
              </dl>
            </div>

            <p className="text-sm text-gray-500 text-center">
              You can change all settings after creation in the project settings.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Project</h1>
          <p className="text-gray-600">Set up a new consultation engagement project</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex-1 relative">
              {index > 0 && (
                <div
                  className={`absolute top-5 left-0 right-1/2 h-0.5 ${
                    currentStep > step.id ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                />
              )}
              {index < STEPS.length - 1 && (
                <div
                  className={`absolute top-5 left-1/2 right-0 h-0.5 ${
                    currentStep > step.id ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                />
              )}
              <div className="relative flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                    currentStep > step.id
                      ? 'bg-purple-600 text-white'
                      : currentStep === step.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-white border-2 border-gray-200 text-gray-400'
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`text-xs mt-2 ${currentStep === step.id ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
                  {step.title}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{STEPS[currentStep - 1].title}</h2>
            <p className="text-gray-600">{STEPS[currentStep - 1].description}</p>
          </div>
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => currentStep === 1 ? router.push('/') : setCurrentStep(currentStep - 1)}
            className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </button>

          {currentStep < 6 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Project'}
              <Rocket className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
