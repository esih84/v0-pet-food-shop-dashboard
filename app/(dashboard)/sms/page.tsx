'use client'

import { useState } from 'react'
import { AlertCircle, ArrowUpRight, BarChart3, FileText, MessageCircle, Plus, Search, Send, X } from 'lucide-react'
import { useSMSStats, useSMSTemplates, useCreateSMSTemplate, useUpdateSMSTemplate, useDeleteSMSTemplate, useSendTestSMS } from '@/lib/hooks/use-sms'

export default function SMSManagement() {
  const [activeTab, setActiveTab] = useState<'templates' | 'stats'>('templates')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<'all' | 'order' | 'customer' | 'promotion' | 'reminder'>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [testPhoneNumber, setTestPhoneNumber] = useState('')

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    content: '',
    category: 'order' as const,
  })

  // Queries and mutations
  const { data: templates, isLoading, error } = useSMSTemplates()
  const { data: stats } = useSMSStats()
  const createMutation = useCreateSMSTemplate()
  const updateMutation = useUpdateSMSTemplate(selectedTemplate?.id || '')
  const deleteMutation = useDeleteSMSTemplate()
  const sendTestMutation = useSendTestSMS()

  // Filter templates
  const filteredTemplates = templates?.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory
    return matchesSearch && matchesCategory
  }) || []

  // Handle create template
  const handleCreate = async () => {
    if (!formData.name || !formData.content) {
      alert('Please fill in all fields')
      return
    }
    await createMutation.mutateAsync(formData)
    setFormData({ name: '', title: '', content: '', category: 'order' })
    setShowCreateModal(false)
  }

  // Handle update template
  const handleUpdate = async () => {
    if (!formData.name || !formData.content) {
      alert('Please fill in all fields')
      return
    }
    await updateMutation.mutateAsync(formData)
    setShowEditModal(false)
  }

  // Handle delete template
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  // Handle send test SMS
  const handleSendTest = async () => {
    if (!testPhoneNumber || !selectedTemplate) {
      alert('Please enter a phone number')
      return
    }
    await sendTestMutation.mutateAsync({
      templateId: selectedTemplate.id,
      phoneNumber: testPhoneNumber,
    })
    setShowTestModal(false)
    setTestPhoneNumber('')
    alert('Test SMS sent successfully!')
  }

  // Open edit modal
  const handleEdit = (template: any) => {
    setSelectedTemplate(template)
    setFormData({
      name: template.name,
      title: template.title,
      content: template.content,
      category: template.category,
    })
    setShowEditModal(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <MessageCircle className="w-10 h-10 text-blue-400" />
              SMS Management
            </h1>
            <p className="text-gray-400 mt-2">Manage SMS templates and send communications</p>
          </div>
          <button
            onClick={() => {
              setSelectedTemplate(null)
              setFormData({ name: '', title: '', content: '', category: 'order' })
              setShowCreateModal(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg flex items-center gap-2 font-semibold transition"
          >
            <Plus className="w-5 h-5" />
            New Template
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-3 font-semibold transition ${
              activeTab === 'templates'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Templates
            </div>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-3 font-semibold transition ${
              activeTab === 'stats'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Statistics
            </div>
          </button>
        </div>

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div>
            {/* Search and Filters */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="order">Order</option>
                <option value="customer">Customer</option>
                <option value="promotion">Promotion</option>
                <option value="reminder">Reminder</option>
              </select>
            </div>

            {/* Templates Grid */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4" />
                <p className="text-gray-400">Loading templates...</p>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-400">Error loading templates</h3>
                  <p className="text-red-300 text-sm">{error?.message}</p>
                </div>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No templates found</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold">{template.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            template.active
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-600/20 text-gray-400'
                          }`}>
                            {template.active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 capitalize">
                            {template.category}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{template.title}</p>
                      </div>
                    </div>

                    {/* Content Preview */}
                    <div className="bg-slate-900/50 rounded-lg p-3 mb-4 border border-slate-700">
                      <p className="text-gray-300 text-sm line-clamp-2">{template.content}</p>
                    </div>

                    {/* Variables */}
                    {template.variables.length > 0 && (
                      <div className="mb-4">
                        <p className="text-gray-400 text-xs font-semibold mb-2">VARIABLES USED:</p>
                        <div className="flex flex-wrap gap-2">
                          {template.variables.map((variable) => (
                            <span key={variable} className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded">
                              {`{{${variable}}}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setSelectedTemplate(template)
                          setShowTestModal(true)
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition"
                      >
                        <Send className="w-4 h-4" />
                        Send Test
                      </button>
                      <button
                        onClick={() => handleEdit(template)}
                        className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-semibold transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg text-sm font-semibold transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div>
            {stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Stats Cards */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-lg p-6">
                  <p className="text-gray-400 text-sm font-semibold mb-2">TOTAL SENT</p>
                  <p className="text-4xl font-bold mb-2">{stats.totalSent.toLocaleString()}</p>
                  <p className="text-green-400 text-sm flex items-center gap-1">
                    <ArrowUpRight className="w-4 h-4" />
                    Success Rate: {stats.successRate}%
                  </p>
                </div>

                <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-lg p-6">
                  <p className="text-gray-400 text-sm font-semibold mb-2">TODAY SENT</p>
                  <p className="text-4xl font-bold">{stats.todaysSent}</p>
                  <p className="text-blue-400 text-sm mt-2">This Month: {stats.thisMonthsSent}</p>
                </div>

                <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-lg p-6">
                  <p className="text-gray-400 text-sm font-semibold mb-2">FAILED</p>
                  <p className="text-4xl font-bold text-red-400">{stats.totalFailed}</p>
                  <p className="text-gray-400 text-sm mt-2">Failure Rate: {(100 - stats.successRate).toFixed(1)}%</p>
                </div>

                <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-lg p-6">
                  <p className="text-gray-400 text-sm font-semibold mb-2">DELIVERY TIME</p>
                  <p className="text-4xl font-bold text-purple-400">{stats.averageDeliveryTime}</p>
                  <p className="text-gray-400 text-sm mt-2">Average Response</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4" />
                <p className="text-gray-400">Loading statistics...</p>
              </div>
            )}

            {/* Additional Stats */}
            {stats && (
              <>
                {/* Templates by Category */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-4">Messages by Category</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Order</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${(stats.templates.order / stats.totalSent) * 100}%` }}
                            />
                          </div>
                          <span className="font-semibold">{stats.templates.order}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Customer</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${(stats.templates.customer / stats.totalSent) * 100}%` }}
                            />
                          </div>
                          <span className="font-semibold">{stats.templates.customer}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Promotion</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500"
                              style={{ width: `${(stats.templates.promotion / stats.totalSent) * 100}%` }}
                            />
                          </div>
                          <span className="font-semibold">{stats.templates.promotion}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Reminder</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-500"
                              style={{ width: `${(stats.templates.reminder / stats.totalSent) * 100}%` }}
                            />
                          </div>
                          <span className="font-semibold">{stats.templates.reminder}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Credits */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-4">SMS Credits</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300 font-semibold">Credit Usage</span>
                        <span className="text-orange-400 font-bold">{stats.credits.percentageUsed.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-orange-500"
                          style={{ width: `${stats.credits.percentageUsed}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm mt-4">
                        <div className="bg-slate-900/50 rounded p-3">
                          <p className="text-gray-400 text-xs mb-1">Total Credits</p>
                          <p className="font-bold text-lg">{stats.credits.total.toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-900/50 rounded p-3">
                          <p className="text-gray-400 text-xs mb-1">Used</p>
                          <p className="font-bold text-lg text-orange-400">{stats.credits.used.toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-900/50 rounded p-3">
                          <p className="text-gray-400 text-xs mb-1">Remaining</p>
                          <p className="font-bold text-lg text-green-400">{stats.credits.remaining.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Template */}
                <div className="mt-6 bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-4">Top Performing Template</h3>
                  <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                    <div>
                      <p className="font-semibold text-lg">{stats.topTemplate.name}</p>
                      <p className="text-gray-400 text-sm">
                        {stats.topTemplate.sent} sent, {stats.topTemplate.failed} failed
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-400">{stats.topTemplate.sent}</p>
                      <p className="text-gray-400 text-xs">messages sent</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800">
              <h2 className="text-2xl font-bold">
                {showEditModal ? 'Edit Template' : 'Create New Template'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setShowEditModal(false)
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Template Name</label>
                <input
                  type="text"
                  placeholder="e.g., Order Confirmation"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Title</label>
                <input
                  type="text"
                  placeholder="e.g., Your Order is Confirmed"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="order">Order</option>
                  <option value="customer">Customer</option>
                  <option value="promotion">Promotion</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Message Content
                  <span className="text-gray-400 text-xs ml-2">Use {'{{'}'variable{'}}'} for dynamic values</span>
                </label>
                <textarea
                  placeholder="e.g., Hi {{customerName}}, your order #{{orderId}} has been confirmed..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
                <p className="text-sm text-blue-300">
                  💡 Tip: Use variable placeholders like {'{{'}'customerName{'}}'} in your message. They'll be automatically extracted and shown as required fields when using this template.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end p-6 border-t border-slate-700 bg-slate-800/50">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setShowEditModal(false)
                }}
                className="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={showEditModal ? handleUpdate : handleCreate}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded-lg font-semibold transition"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Test Modal */}
      {showTestModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold">Send Test SMS</h2>
              <button
                onClick={() => setShowTestModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-gray-400 text-sm font-semibold mb-2">Template</p>
                <p className="font-semibold">{selectedTemplate.name}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={testPhoneNumber}
                  onChange={(e) => setTestPhoneNumber(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
                <p className="text-sm text-blue-300">
                  This will send a test SMS to the provided number using the default values for template variables.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end p-6 border-t border-slate-700 bg-slate-800/50">
              <button
                onClick={() => setShowTestModal(false)}
                className="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSendTest}
                disabled={sendTestMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {sendTestMutation.isPending ? 'Sending...' : 'Send Test'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
