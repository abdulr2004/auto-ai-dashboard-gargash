import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import Papa from 'papaparse';

export default function AutoAIDashboard() {
  // Panel states
  const [recData, setRecData] = useState([]);
  const [leadData, setLeadData] = useState([]);
  const [partsData, setPartsData] = useState([]);
  const [roiData, setRoiData] = useState([]);

  // User search & segmentation
  const [searchId, setSearchId] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [userScore, setUserScore] = useState(null);
  const [segLoading, setSegLoading] = useState(false);

  // Loyalty scored dataset
  const [loyaltyRecords, setLoyaltyRecords] = useState([]);
  const loyaltyCsvUrl = 'https://raw.githubusercontent.com/abdulr2004/comployaltyscores/refs/heads/main/loyalty_scored_dataset.csv';

  // Load all panel data + loyalty dataset
  const loadAll = async () => {
    // Placeholder for real API calls
    setRecData([{ date: '2025-05-01', ctrLift: 2.1 }]);
    setLeadData([{ tier: 'High', sent: 120, converted: 48 }]);
    setPartsData([{ date: '2025-05-01', forecast: 50, actual: 48 }]);
    setRoiData([{ points: 5, lift: 1.2 }]);
    // Fetch loyalty scored CSV
    Papa.parse(loyaltyCsvUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => setLoyaltyRecords(results.data),
      error: (err) => console.error('CSV parse error:', err),
    });
  };

  useEffect(() => { loadAll(); }, []);

  // Handle user segmentation search
  const handleSearch = () => {
    if (!searchId || loyaltyRecords.length === 0) return;
    setSegLoading(true);
    // Find record by user ID or Email
    const rec = loyaltyRecords.find(r => r.userId === searchId || r.email === searchId);
    if (rec) {
      setUserProfile({ id: rec.userId, name: rec.name, email: rec.email });
      setUserScore(rec.score);
    } else {
      setUserProfile(null);
      setUserScore('Not found');
    }
    setSegLoading(false);
  };

  // Loading fallback
  if (!loyaltyRecords.length) return <div className="p-4">Loading data...</div>;

  // Card component
  const Card = ({ title, actions, children }) => (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="space-x-2">
          {actions?.map((act, i) => (
            <button key={i} onClick={act.onClick} className="text-sm px-2 py-1 bg-blue-100 rounded">
              {act.label}
            </button>
          ))}
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen space-y-6">
      {/* User Search & Segmentation */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-2">Search User & Segment</h2>
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="text"
            placeholder="Enter User ID or Email"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            className="border rounded p-2 flex-grow"
          />
          <button onClick={handleSearch} className="px-4 py-2 bg-blue-500 text-white rounded">
            {segLoading ? 'Searching...' : 'Get Segment'}
          </button>
        </div>
        {userProfile && (
          <div className="p-4 bg-gray-50 rounded">
            <p><strong>Name:</strong> {userProfile.name}</p>
            <p><strong>Email:</strong> {userProfile.email}</p>
            <p><strong>Segment Score:</strong> {userScore}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommendation CTR Lift */}
        <Card title="Recommendation CTR Lift" actions={[{ label: 'Refresh', onClick: loadAll }]}>  
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={recData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis unit="%" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="ctrLift" name="CTR Lift" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Lead-Score Tiers vs Conversions */}
        <Card title="Lead-Score Tiers vs Conversions" actions={[{ label: 'Refresh', onClick: loadAll }]}>  
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={leadData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tier" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sent" name="Leads Sent" barSize={20} fill="#8884d8" />
              <Bar dataKey="converted" name="Converted" barSize={20} fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Parts Usage Forecast vs Actual */}
        <Card title="Parts Usage: Forecast vs Actual" actions={[{ label: 'Refresh', onClick: loadAll }]}>  
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={partsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="forecast" name="Forecast" stroke="#82ca9d" />
              <Line type="monotone" dataKey="actual" name="Actual" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Loyalty Reward ROI */}
        <Card title="Loyalty Reward ROI" actions={[{ label: 'Refresh', onClick: loadAll }]}>  
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={roiData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="points" />
              <YAxis unit="%" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="lift" name="Repeat Rate Lift" stroke="#ffc658" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
