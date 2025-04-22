import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCw, Zap } from 'lucide-react';
import { useGPS } from '../context/GPSContext';
import './ControlPanel.css';

const ControlPanel: React.FC = () => {
  const { spoofedPosition, updatePosition, isTransmitting, setIsTransmitting } = useGPS();
  const [latitude, setLatitude] = useState(spoofedPosition?.lat.toString() || '');
  const [longitude, setLongitude] = useState(spoofedPosition?.lng.toString() || '');
  const [altitude, setAltitude] = useState('0');
  const [speed, setSpeed] = useState('0');
  const [resetConfirmation, setResetConfirmation] = useState(0);
  
  useEffect(() => {
    if (spoofedPosition) {
      setLatitude(spoofedPosition.lat.toString());
      setLongitude(spoofedPosition.lng.toString());
    }
  }, [spoofedPosition]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      updatePosition({ lat, lng });
      logAction('coordinates_updated', { lat, lng, altitude, speed });
    }
  };
  
  const toggleTransmission = () => {
    setIsTransmitting(!isTransmitting);
    logAction('transmission_toggled', { status: !isTransmitting });
  };

  const handleResetSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setResetConfirmation(value);
    
    if (value === 100) {
      logAction('system_reset_initiated', {});
      // Implement actual reset logic here
      setTimeout(() => {
        setResetConfirmation(0);
      }, 1000);
    }
  };

  const logAction = (action: string, data: any) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      action,
      data
    };
    
    // Send log to server
    fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(logEntry)
    });
  };
  
  return (
    <div className="control-panel">
      <div className="panel-section coordinates">
        <h3>GPS Coordinates</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Latitude</label>
              <input 
                type="text" 
                value={latitude} 
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="37.7749"
              />
            </div>
            <div className="form-group">
              <label>Longitude</label>
              <input 
                type="text" 
                value={longitude} 
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="-122.4194"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Altitude (m)</label>
              <input 
                type="text" 
                value={altitude} 
                onChange={(e) => setAltitude(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Speed (km/h)</label>
              <input 
                type="text" 
                value={speed} 
                onChange={(e) => setSpeed(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="update-btn">Update Location</button>
          </div>
        </form>
      </div>
      
      <div className="panel-section transmission">
        <h3>Transmission Control</h3>
        <div className="transmission-status">
          <div className={`status-indicator ${isTransmitting ? 'active' : 'inactive'}`}></div>
          <span>Status: {isTransmitting ? 'Transmitting' : 'Idle'}</span>
        </div>
        
        <div className="transmission-controls">
          <button 
            className={`control-btn ${isTransmitting ? 'stop' : 'start'}`}
            onClick={toggleTransmission}
          >
            {isTransmitting ? <Pause size={18} /> : <Play size={18} />}
            <span>{isTransmitting ? 'Stop Transmission' : 'Start Transmission'}</span>
          </button>
          
          <div className="reset-control">
            <label>Reset Device (slide to confirm)</label>
            <input
              type="range"
              min="0"
              max="100"
              value={resetConfirmation}
              onChange={handleResetSlider}
              className="reset-slider"
            />
          </div>
          
          <button className="control-btn boost">
            <Zap size={18} />
            <span>Boost Signal</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;