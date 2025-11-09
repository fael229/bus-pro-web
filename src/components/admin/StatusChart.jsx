import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const STATUS_COLORS = {
  'En attente': '#f59e0b',
  'Confirmée': '#10b981',
  'Annulée': '#ef4444',
  'Expirée': '#6b7280'
}

export default function StatusChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Aucune donnée de statut disponible
      </div>
    )
  }

  const renderLabel = (entry) => {
    const percent = ((entry.value / data.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(0)
    return `${percent}%`
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#6b7280'} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value) => [`${value} réservations`]}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value) => <span className="text-sm">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
