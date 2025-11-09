import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function RevenueChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Aucune donnée de revenus disponible
      </div>
    )
  }

  const formatRevenue = (value) => {
    return `${value.toLocaleString()} FCFA`
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis 
          dataKey="date" 
          className="text-gray-600 dark:text-gray-400"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          className="text-gray-600 dark:text-gray-400"
          style={{ fontSize: '12px' }}
          tickFormatter={formatRevenue}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
          formatter={formatRevenue}
          labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
        />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          name="Revenus"
          stroke="#10b981" 
          fillOpacity={1} 
          fill="url(#colorRevenue)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
