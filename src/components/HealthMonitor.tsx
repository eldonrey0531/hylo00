/**
 * System Health Monitor Component
 *
 * Displays real-time health status of LLM providers and system resilience metrics
 */

import { useState, useEffect } from 'react';
import { resilientLLMService, SystemHealth, ProviderHealth } from '../services/resilientLLMService';
import { CircuitState } from '../utils/circuitBreaker';

interface HealthMonitorProps {
  refreshInterval?: number; // milliseconds
  showDetails?: boolean;
  className?: string;
}

export default function HealthMonitor({
  refreshInterval = 30000, // 30 seconds
  showDetails = false,
  className = '',
}: HealthMonitorProps) {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchHealth = async () => {
      try {
        const health = await resilientLLMService.getSystemHealth();
        setSystemHealth(health);
        setLastUpdate(new Date());
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch system health:', error);
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchHealth();

    // Set up periodic refresh
    intervalId = setInterval(fetchHealth, refreshInterval);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [refreshInterval]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'healthy':
        return '✅';
      case 'degraded':
        return '⚠️';
      case 'critical':
        return '❌';
      default:
        return '❓';
    }
  };

  const getCircuitStateColor = (state: CircuitState): string => {
    switch (state) {
      case CircuitState.CLOSED:
        return 'text-green-600';
      case CircuitState.HALF_OPEN:
        return 'text-yellow-600';
      case CircuitState.OPEN:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getCircuitStateIcon = (state: CircuitState): string => {
    switch (state) {
      case CircuitState.CLOSED:
        return '🟢';
      case CircuitState.HALF_OPEN:
        return '🟡';
      case CircuitState.OPEN:
        return '🔴';
      default:
        return '⚪';
    }
  };

  if (isLoading) {
    return (
      <div className={`p-4 bg-gray-50 rounded-lg border ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Loading system health...</span>
        </div>
      </div>
    );
  }

  if (!systemHealth) {
    return (
      <div className={`p-4 bg-red-50 rounded-lg border border-red-200 ${className}`}>
        <div className="flex items-center space-x-2">
          <span className="text-red-600">❌</span>
          <span className="text-sm text-red-800">Failed to load system health</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* System Status Header */}
      <div className={`p-4 rounded-t-lg border ${getStatusColor(systemHealth.status)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStatusIcon(systemHealth.status)}</span>
            <div>
              <h3 className="font-medium capitalize">AI System {systemHealth.status}</h3>
              <p className="text-xs opacity-75">
                {systemHealth.healthyProviders}/{systemHealth.totalProviders} providers available
              </p>
            </div>
          </div>
          {lastUpdate && (
            <div className="text-xs opacity-75">Updated {lastUpdate.toLocaleTimeString()}</div>
          )}
        </div>
      </div>

      {/* Provider Status */}
      <div className="p-4 space-y-3">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Provider Status</h4>

        <div className="grid gap-2">
          {systemHealth.providersHealth.map((provider: ProviderHealth) => (
            <div
              key={provider.name}
              className="flex items-center justify-between p-2 bg-gray-50 rounded border"
            >
              <div className="flex items-center space-x-2">
                <span className={getCircuitStateColor(provider.circuitState)}>
                  {getCircuitStateIcon(provider.circuitState)}
                </span>
                <span className="font-medium capitalize text-sm">{provider.name}</span>
                {provider.available ? (
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">
                    Available
                  </span>
                ) : (
                  <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded">
                    Unavailable
                  </span>
                )}
              </div>

              {showDetails && (
                <div className="flex items-center space-x-3 text-xs text-gray-600">
                  <span>Success: {provider.successRate.toFixed(1)}%</span>
                  <span>Errors: {provider.errorCount}</span>
                  {provider.responseTime > 0 && <span>Latency: {provider.responseTime}ms</span>}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-2 pt-2">
          <button
            onClick={() => resilientLLMService.reset()}
            className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
          >
            Reset System
          </button>
          <button
            onClick={() => window.location.reload()}
            className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
          >
            Refresh Page
          </button>
        </div>
      </div>

      {/* Circuit Breaker Legend */}
      {showDetails && (
        <div className="px-4 pb-4">
          <div className="text-xs text-gray-600 border-t pt-2">
            <div className="flex space-x-4">
              <span>🟢 Closed (Normal)</span>
              <span>🟡 Half-Open (Testing)</span>
              <span>🔴 Open (Failing)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
