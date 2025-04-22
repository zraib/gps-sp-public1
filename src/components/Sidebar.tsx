import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Save, List, MapPin, FileText, Clock } from 'lucide-react';
import SavedLocations from './SavedLocations';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface LogEntry {
  timestamp: string;
  action: string;
  data: any;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const [activeTab, setActiveTab] = useState('locations');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch logs on mount and when new logs are added
  React.useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/logs');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server did not return JSON response');
      }

      // Check if response has a body
      const text = await response.text();
      if (!text) {
        setLogs([]);
        return;
      }

      // Parse the response text as JSON
      const data = JSON.parse(text);
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected array');
      }

      setLogs(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch logs');
      setLogs([]); // Reset logs on error
    }
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h2>GPS Spoofer</h2>
        <button className="toggle-btn" onClick={toggleSidebar}>
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <div className="sidebar-tabs">
        <button 
          className={`tab-btn ${activeTab === 'locations' ? 'active' : ''}`}
          onClick={() => setActiveTab('locations')}
        >
          <MapPin size={18} />
          <span>Locations</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'routes' ? 'active' : ''}`}
          onClick={() => setActiveTab('routes')}
        >
          <Clock size={18} />
          <span>Routes</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <FileText size={18} />
          <span>Logs</span>
        </button>
      </div>

      <div className="sidebar-content">
        {activeTab === 'locations' && <SavedLocations />}
        {activeTab === 'routes' && <div className="tab-content">Routes content</div>}
        {activeTab === 'logs' && (
          <div className="tab-content logs">
            {error ? (
              <div className="error-message">{error}</div>
            ) : logs.length === 0 ? (
              <div className="no-logs">No logs available</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="log-entry">
                  <span className="log-timestamp">{new Date(log.timestamp).toLocaleString()}</span>
                  <span className="log-action">{log.action}</span>
                  <span className="log-data">{JSON.stringify(log.data)}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        <button className="action-btn">
          <Save size={18} />
          <span>Save Current</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;