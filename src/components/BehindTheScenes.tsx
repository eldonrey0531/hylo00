import React, { useState, useEffect } from 'react';
import {
  Brain,
  Search,
  FileText,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Cpu,
  Database,
  Globe,
  PenTool,
  Zap,
} from 'lucide-react';

interface AgentLog {
  agentId: number;
  agentName: string;
  model: string;
  timestamp: string;
  input: any;
  output: any;
  searchQueries?: string[];
  decisions?: string[];
  reasoning?: string;
}

interface BehindTheScenesProps {
  formData: any;
  agentLogs: AgentLog[];
  isProcessing: boolean;
}

const BehindTheScenes: React.FC<BehindTheScenesProps> = ({
  formData,
  agentLogs,
  isProcessing,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    formData: true,
    agent1: false,
    agent2: false,
    agent3: false,
    agent4: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getAgentIcon = (agentId: number) => {
    switch (agentId) {
      case 1:
        return <Database className="h-5 w-5" />;
      case 2:
        return <Brain className="h-5 w-5" />;
      case 3:
        return <Globe className="h-5 w-5" />;
      case 4:
        return <PenTool className="h-5 w-5" />;
      default:
        return <Cpu className="h-5 w-5" />;
    }
  };

  const getAgentColor = (agentId: number) => {
    switch (agentId) {
      case 1:
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 2:
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 3:
        return 'text-green-600 bg-green-50 border-green-200';
      case 4:
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatFormData = () => {
    if (!formData) return null;

    const categories = [
      {
        name: 'Trip Details',
        data: formData.tripDetails,
        fields: [
          'location',
          'departDate',
          'returnDate',
          'plannedDays',
          'adults',
          'children',
          'budget',
          'currency',
        ],
      },
      {
        name: 'Travel Group',
        data: formData.groups,
        type: 'array',
      },
      {
        name: 'Travel Interests',
        data: formData.interests,
        type: 'array',
      },
      {
        name: 'Itinerary Inclusions',
        data: formData.inclusions,
        type: 'array',
        highlight: true,
      },
      {
        name: 'Experience Level',
        data: formData.experience,
        type: 'array',
      },
      {
        name: 'Trip Vibe',
        data: formData.vibes,
        type: 'array',
      },
      {
        name: 'Sample Days',
        data: formData.sampleDays,
        type: 'array',
      },
      {
        name: 'Dinner Choices',
        data: formData.dinnerChoices,
        type: 'array',
      },
      {
        name: 'Trip Nickname',
        data: formData.nickname,
        type: 'string',
      },
      {
        name: 'Contact Info',
        data: formData.contact,
        fields: ['name', 'email'],
      },
    ];

    return categories;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-2xl">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mb-2 ml-auto flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-all duration-200"
      >
        {isExpanded ? (
          <EyeOff className="h-5 w-5" />
        ) : (
          <Eye className="h-5 w-5" />
        )}
        <span className="font-bold">
          {isExpanded ? 'Hide' : 'Show'} Behind the Scenes
        </span>
      </button>

      {/* Main Panel */}
      {isExpanded && (
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-200 max-h-[80vh] overflow-hidden flex flex-col animate-slideIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-[#f68854] text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-6 w-6" />
                <h3 className="text-lg font-bold">AI Multi-Agent Workflow</h3>
              </div>
              {isProcessing && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span className="text-sm">Processing...</span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-4 space-y-4">
            {/* Gathered Form Data Section */}
            <div className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection('formData')}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <span className="font-bold text-gray-700">
                    Gathered Form Data
                  </span>
                </div>
                {expandedSections.formData ? (
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                )}
              </button>

              {expandedSections.formData && (
                <div className="p-4 bg-white space-y-3">
                  {formatFormData()?.map((category, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border ${
                        category.highlight
                          ? 'border-yellow-400 bg-yellow-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <h4 className="font-bold text-sm text-gray-700 mb-2 flex items-center">
                        {category.name}
                        {category.highlight && (
                          <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                            Critical for Inclusions
                          </span>
                        )}
                      </h4>

                      {category.type === 'array' &&
                        Array.isArray(category.data) && (
                          <div className="flex flex-wrap gap-2">
                            {category.data.length > 0 ? (
                              category.data.map((item: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-white border border-gray-300 rounded-full text-xs"
                                >
                                  {item}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 italic text-xs">
                                None selected
                              </span>
                            )}
                          </div>
                        )}

                      {category.type === 'string' && (
                        <span className="text-sm text-gray-600">
                          {category.data || (
                            <span className="italic text-gray-400">
                              Not provided
                            </span>
                          )}
                        </span>
                      )}

                      {category.fields && category.data && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {category.fields.map((field: string) => (
                            <div key={field} className="flex justify-between">
                              <span className="text-gray-500 capitalize">
                                {field}:
                              </span>
                              <span className="text-gray-700 font-medium">
                                {category.data[field] || '-'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Agent Logs */}
            {agentLogs.map((log) => (
              <div
                key={`agent-${log.agentId}`}
                className="border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(`agent${log.agentId}`)}
                  className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${getAgentColor(
                    log.agentId
                  )}`}
                >
                  <div className="flex items-center space-x-2">
                    {getAgentIcon(log.agentId)}
                    <div className="text-left">
                      <span className="font-bold">{log.agentName}</span>
                      <span className="text-xs block opacity-75">
                        {log.model}
                      </span>
                    </div>
                  </div>
                  {expandedSections[`agent${log.agentId}`] ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>

                {expandedSections[`agent${log.agentId}`] && (
                  <div className="p-4 bg-white space-y-3">
                    {/* Reasoning */}
                    {log.reasoning && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <h5 className="font-bold text-sm text-blue-700 mb-1 flex items-center">
                          <Brain className="h-4 w-4 mr-1" />
                          Reasoning
                        </h5>
                        <p className="text-xs text-blue-600">{log.reasoning}</p>
                      </div>
                    )}

                    {/* Decisions Made */}
                    {log.decisions && log.decisions.length > 0 && (
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <h5 className="font-bold text-sm text-purple-700 mb-2 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Key Decisions
                        </h5>
                        <ul className="space-y-1">
                          {log.decisions.map((decision, idx) => (
                            <li
                              key={idx}
                              className="text-xs text-purple-600 flex items-start"
                            >
                              <span className="mr-1">•</span>
                              <span>{decision}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Search Queries */}
                    {log.searchQueries && log.searchQueries.length > 0 && (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <h5 className="font-bold text-sm text-green-700 mb-2 flex items-center">
                          <Search className="h-4 w-4 mr-1" />
                          Web Searches Performed
                        </h5>
                        <ul className="space-y-1">
                          {log.searchQueries.map((query, idx) => (
                            <li
                              key={idx}
                              className="text-xs text-green-600 flex items-start"
                            >
                              <span className="mr-1">🔍</span>
                              <span>{query}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Output Preview */}
                    {log.output && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <h5 className="font-bold text-sm text-gray-700 mb-1">
                          Output Preview
                        </h5>
                        <div className="text-xs text-gray-600 max-h-32 overflow-y-auto">
                          {typeof log.output === 'object' ? (
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(log.output, null, 2)}
                            </pre>
                          ) : (
                            <p>{log.output.substring(0, 200)}...</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="text-xs text-gray-400 text-right">
                      Processed at: {log.timestamp}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* No Logs Yet */}
            {agentLogs.length === 0 && !isProcessing && (
              <div className="text-center py-8 text-gray-400">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No agent activity yet</p>
                <p className="text-xs">
                  Generate an itinerary to see the workflow
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BehindTheScenes;
