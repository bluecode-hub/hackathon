import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './saving.css';

interface Member {
  name: string;
  role: string;
  savings: number;
  attendance: number;
}

interface Stats {
  totalSavings: number;
  avgSavings: number;
  avgAttendance: number;
  excellentCount: number;
}

const Savings = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalSavings: 0,
    avgSavings: 0,
    avgAttendance: 0,
    excellentCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedSHG, setSelectedSHG] = useState<string>('');

  useEffect(() => {
    // Check if user is logged in and SHG is selected
    const shg = localStorage.getItem('selectedSHG');
    if (!shg) {
      navigate('/select-shg');
      return;
    }
    setSelectedSHG(shg);

    // Mock data - replace with actual API call
    setTimeout(() => {
      const mockMembers: Member[] = [
        { name: 'Lakshmi Devi', role: 'President', savings: 25000, attendance: 95 },
        { name: 'Saraswati Kumari', role: 'Secretary', savings: 23000, attendance: 92 },
        { name: 'Radha Bai', role: 'Treasurer', savings: 22000, attendance: 88 },
        { name: 'Meena Devi', role: 'Member', savings: 18000, attendance: 85 },
        { name: 'Geeta Kumari', role: 'Member', savings: 17500, attendance: 90 },
        { name: 'Sunita Devi', role: 'Member', savings: 16000, attendance: 82 },
        { name: 'Parvati Bai', role: 'Member', savings: 15500, attendance: 78 },
        { name: 'Anita Kumari', role: 'Member', savings: 14000, attendance: 88 },
        { name: 'Rekha Devi', role: 'Member', savings: 12000, attendance: 75 },
        { name: 'Kamala Bai', role: 'Member', savings: 10500, attendance: 70 }
      ];

      const totalSavings = mockMembers.reduce((sum, m) => sum + m.savings, 0);
      const avgSavings = totalSavings / mockMembers.length;
      const avgAttendance = Math.round(
        mockMembers.reduce((sum, m) => sum + m.attendance, 0) / mockMembers.length
      );
      const excellentCount = mockMembers.filter(m => m.attendance >= 90).length;

      setMembers(mockMembers);
      setStats({
        totalSavings,
        avgSavings: Math.round(avgSavings),
        avgAttendance,
        excellentCount
      });
      setLoading(false);
    }, 500);
  }, [navigate]);

  const formatCurrency = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getSavingsStatus = (savings: number): { label: string; color: string } => {
    if (savings >= 20000) return { label: 'Excellent', color: 'success' };
    if (savings >= 15000) return { label: 'Good', color: 'info' };
    if (savings >= 10000) return { label: 'Fair', color: 'warning' };
    return { label: 'Growing', color: 'secondary' };
  };

  const getAttendanceStatus = (attendance: number): { label: string; color: string } => {
    if (attendance >= 90) return { label: 'Excellent', color: 'success' };
    if (attendance >= 80) return { label: 'Good', color: 'info' };
    if (attendance >= 70) return { label: 'Fair', color: 'warning' };
    return { label: 'Needs Improvement', color: 'danger' };
  };

  const sortedByMembersSavings = [...members].sort((a, b) => b.savings - a.savings);
  const sortedByMembersAttendance = [...members].sort((a, b) => b.attendance - a.attendance);

  if (loading) {
    return (
      <div className="savings-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading savings and attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="savings-container">
      <div className="savings-wrapper">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <button className="back-btn" onClick={() => navigate('/dashboard')}>
              ← Back
            </button>
            <div>
              <h1 className="page-title">Savings & Attendance</h1>
              <p className="page-subtitle">{selectedSHG}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-value">{formatCurrency(stats.totalSavings)}</div>
            <div className="stat-label">Total Savings</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-value">{formatCurrency(stats.avgSavings)}</div>
            <div className="stat-label">Average Savings</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✓</div>
            <div className="stat-value">{stats.avgAttendance}%</div>
            <div className="stat-label">Avg Attendance</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-value">{stats.excellentCount}</div>
            <div className="stat-label">Excellent Attendance</div>
          </div>
        </div>

        {/* Savings Table */}
        <div className="section">
          <div className="section-header">
            <h3 className="section-title">Member Savings</h3>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Role</th>
                  <th>Savings Amount</th>
                  <th>Contribution %</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedByMembersSavings.map((member) => {
                  const percentage = ((member.savings / stats.totalSavings) * 100).toFixed(1);
                  const status = getSavingsStatus(member.savings);
                  return (
                    <tr key={member.name}>
                      <td><strong>{member.name}</strong></td>
                      <td><span className="badge badge-info">{member.role}</span></td>
                      <td><strong>{formatCurrency(member.savings)}</strong></td>
                      <td>{percentage}%</td>
                      <td>
                        <span className={`badge badge-${status.color}`}>{status.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="section">
          <div className="section-header">
            <h3 className="section-title">Attendance Summary</h3>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Role</th>
                  <th>Attendance Rate</th>
                  <th>Progress</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedByMembersAttendance.map((member) => {
                  const status = getAttendanceStatus(member.attendance);
                  return (
                    <tr key={member.name}>
                      <td><strong>{member.name}</strong></td>
                      <td><span className="badge badge-info">{member.role}</span></td>
                      <td>{member.attendance}%</td>
                      <td>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${member.attendance}%` }}></div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${status.color}`}>{status.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Savings;