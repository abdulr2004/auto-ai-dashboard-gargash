// src/pages/Dashboard.jsx
import KMeans from 'ml-kmeans'
import React, { useState, useEffect } from 'react'
import Papa from 'papaparse'
import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

const loyaltyUrl =
  'https://raw.githubusercontent.com/abdulr2004/comployaltyscores/refs/heads/main/loyalty_scored_dataset.csv'
const outreachUrl =
  'https://raw.githubusercontent.com/Prudhvivarma0/Data/refs/heads/main/final_outreach_list.csv'
const churnUrl =
  'https://raw.githubusercontent.com/Darth-Freljord/Gargash-Hackathon-CltAltElite/refs/heads/main/augmented_car_bababababa_updated.csv'

export default function Dashboard() {
  // raw records
  const [loyaltyRecords, setLoyalty] = useState([])
  const [outreachRecords, setOutreach] = useState([])
  const [churnRecords, setChurn] = useState([])
  // histogram data
  const [histogramData, setHistogramData] = useState([])
  // KPI metrics
  const [avgLoyalty, setAvgLoyalty] = useState(0)
  const [avgChurnRate, setAvgChurnRate] = useState(0)
  const [avgCLV, setAvgCLV] = useState(0)
  // user lookup
  const [searchId, setSearchId] = useState('')
  const [userProfile, setUserProfile] = useState(null)
  const [kmeansModel, setKMeansModel] = useState(null)

  // helper: fetch & parse CSV
  const fetchCsv = async (url, setter) => {
    const res = await fetch(url)
    const text = await res.text()
    const { data, errors } = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    })
    if (errors.length) console.warn('CSV parse errors', errors)
    setter(data)
  }

  // load all three datasets
  useEffect(() => {
    fetchCsv(loyaltyUrl, setLoyalty)
    fetchCsv(outreachUrl, setOutreach)
    fetchCsv(churnUrl, setChurn)
  }, [])

  // compute KPIs once data is loaded
  useEffect(() => {
    if (loyaltyRecords.length) {
      const sum = loyaltyRecords.reduce(
        (acc, r) => acc + parseFloat(r.predicted_loyalty_score || 0),
        0
      )
      setAvgLoyalty((sum / loyaltyRecords.length).toFixed(2))
    }
    if (outreachRecords.length) {
      const sumClv = outreachRecords.reduce(
        (acc, r) => acc + parseFloat(r.CLV_12m || 0),
        0
      )
      setAvgCLV((sumClv / outreachRecords.length).toFixed(2))
    }
    if (churnRecords.length) {
      const sumCh = churnRecords.reduce(
        (acc, r) => acc + parseFloat(r.churn_risk_predicted || 0),
        0
      )
      setAvgChurnRate((sumCh / churnRecords.length).toFixed(2))
    }
  }, [loyaltyRecords, outreachRecords, churnRecords])

  // build churn histogram
  useEffect(() => {
    if (!churnRecords.length) return
    const bins = Array.from({ length: 10 }, (_, i) => ({
      bin: `${(i * 0.1).toFixed(1)}–${((i + 1) * 0.1).toFixed(1)}`,
      count: 0,
    }))
    churnRecords.forEach(r => {
      const val = parseFloat(r.churn_risk_predicted)
      if (!isNaN(val) && val >= 0 && val <= 1) {
        bins[Math.min(Math.floor(val * 10), 9)].count += 1
      }
    })
    setHistogramData(bins)
  }, [churnRecords])

  // global distributions
  const tierCounts = loyaltyRecords.reduce((acc, r) => {
    const tier = r.loyalty_tier || 'Unknown'
    acc[tier] = (acc[tier] || 0) + 1
    return acc
  }, {})
  const tierData = Object.entries(tierCounts).map(([tier, count]) => ({
    tier,
    count,
  }))

  const segmentCounts = outreachRecords.reduce((acc, r) => {
    const seg = r.segment || 'Unknown'
    acc[seg] = (acc[seg] || 0) + 1
    return acc
  }, {})
  const segmentData = Object.entries(segmentCounts).map(([segment, count]) => ({
    segment,
    count,
  }))

  const scatterData = outreachRecords.map(r => ({
    x: parseFloat(r.CreditRisk) || 0,
    y: parseFloat(r.CLV_12m) || 0,
    segment: r.segment,
  }))

  // handle user lookup
  const handleSearch = () => {
    const id = searchId.trim()
    if (!id) return
    const l = loyaltyRecords.find(r => r.customer_id === id)
    const o = outreachRecords.find(r => r.customer_id === id)
    const c = churnRecords.find(r => r.customer_id === id)
    if (!l && !o && !c) {
      setUserProfile({ notFound: true })
      return
    }
    // compute composite health score
    const scores = []
    if (l && l.predicted_loyalty_score)
      scores.push(parseFloat(l.predicted_loyalty_score))
    if (o && o.LeadScore) scores.push(parseFloat(o.LeadScore))
    if (c && c.churn_risk_predicted)
      scores.push(1 - parseFloat(c.churn_risk_predicted))
    const health =
      scores.length > 0
        ? ((scores.reduce((a, b) => a + b, 0) / scores.length) * 20).toFixed(1)
        : null
    setUserProfile({ l, o, c, health })
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50">
      {/* KPI Bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <h4 className="font-semibold">Avg Loyalty Score</h4>
          <p className="text-2xl">{avgLoyalty}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h4 className="font-semibold">Avg CLV₁₂ₘ</h4>
          <p className="text-2xl">{avgCLV}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h4 className="font-semibold">Avg Churn Rate</h4>
          <p className="text-2xl">{avgChurnRate}</p>
        </div>
      </div>

      {/* Global Distributions */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Loyalty Tier Breakdown</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={tierData}>
              <XAxis dataKey="tier" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Customer Segments</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={segmentData}>
              <XAxis dataKey="segment" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Churn Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={histogramData}>
              <XAxis dataKey="bin" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">CLV vs. CreditRisk</h3>
          <ResponsiveContainer width="100%" height={150}>
            <ScatterChart>
              <CartesianGrid />
              <XAxis dataKey="x" name="CreditRisk" />
              <YAxis dataKey="y" name="CLV₁₂ₘ" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={scatterData} fill="#f59e0b" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Lookup */}
      <div className="bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold">Lookup Customer</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Enter customer_id"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Search
          </button>
        </div>
        {userProfile && (
          <div className="mt-4 space-y-2">
            {userProfile.notFound ? (
              <p>No records found for that ID.</p>
            ) : (
              <>
                <p>
                  <strong>Health Score:</strong> {userProfile.health} / 100
                </p>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                  {JSON.stringify(userProfile, null, 2)}
                </pre>
              </>
            )}
          </div>
        )}
      </div>
      {/* User Profile & Feature Breakdown */}
        {userProfile && !userProfile.notFound && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Health Score */}
            <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4">
            <h4 className="text-indigo-800 font-semibold">Health Score</h4>
            <p className="text-3xl">{userProfile.health ?? '–'}</p>
            </div>

            {/* Loyalty */}
            <div className="bg-green-50 border-l-4 border-green-600 p-4">
            <h4 className="text-green-800 font-semibold">Loyalty Score</h4>
            <p className="text-2xl">{userProfile.l?.predicted_loyalty_score}</p>
            <p className="text-sm text-gray-600">{userProfile.l?.loyalty_tier} tier</p>
            </div>

            {/* Lead */}
            <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4">
            <h4 className="text-yellow-800 font-semibold">Lead Score</h4>
            <p className="text-2xl">{userProfile.o?.LeadScore}</p>
            <p className="text-sm text-gray-600">{userProfile.o?.segment}</p>
            </div>

            {/* Churn */}
            <div className="bg-red-50 border-l-4 border-red-600 p-4">
            <h4 className="text-red-800 font-semibold">Churn Risk</h4>
            <p className="text-2xl">{userProfile.c?.churn_risk_predicted}</p>
            <p className="text-sm text-gray-600">1 = highest risk</p>
            </div>
        </div>
        )}

    </div>
  )
}
