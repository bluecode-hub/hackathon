import { useState, useEffect } from 'react';
import { SHG_LIST, type SHG } from '.././data/mockData';
import './SHGSelection.css';

const SHGSelection = () => {
  const [shgs, setShgs] = useState<SHG[]>([]);
  const [selectedSHG, setSelectedSHG] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // simulate CSV/API load
    setTimeout(() => {
      setShgs(SHG_LIST);
      setLoading(false);
    }, 500);
  }, []);

  const handleCardClick = (shgName: string) => {
    setSelectedSHG(shgName);
  };

  const handleContinue = () => {
    if (selectedSHG) {
      localStorage.setItem('selectedSHG', selectedSHG);
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="select-container">
      <div className="select-box">
        <div className="select-header">
          <h1 className="select-title">Select Your SHG</h1>
          <p className="select-subtitle">Choose a Self-Help Group to manage</p>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading SHG data...</p>
          </div>
        ) : shgs.length === 0 ? (
          <div className="loading">
            <p>No SHG data available.</p>
          </div>
        ) : (
          <>
            <div className="shg-grid">
              {shgs.map((shg) => (
                <div
                  key={shg.name}
                  className={`shg-card ${selectedSHG === shg.name ? 'selected' : ''}`}
                  onClick={() => handleCardClick(shg.name)}
                >
                  <div className="shg-name">{shg.name}</div>
                  <div className="shg-info">
                    {shg.totalMembers} members · ₹{shg.totalSavings.toLocaleString('en-IN')} savings
                  </div>
                </div>
              ))}
            </div>
            {selectedSHG && (
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleContinue}>
                Continue to Dashboard
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SHGSelection;
