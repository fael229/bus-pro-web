import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function ReservationsChart({ data, type = 'line' }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Aucune donnée disponible
      </div>
    )
  }

  const ChartComponent = type === 'line' ? LineChart : BarChart

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ChartComponent data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis 
          dataKey="date" 
          className="text-gray-600 dark:text-gray-400"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          className="text-gray-600 dark:text-gray-400"
          style={{ fontSize: '12px' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
          labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
        />
        <Legend />
        {type === 'line' ? (
          <>
            <Line 
              type="monotone" 
              dataKey="reservations" 
              name="Réservations"
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="confirmees" 
              name="Confirmées"
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
            />
          </>
        ) : (
          <>
            <Bar dataKey="reservations" name="Réservations" fill="#3b82f6" />
            <Bar dataKey="confirmees" name="Confirmées" fill="#10b981" />
          </>
        )}
      </ChartComponent>
    </ResponsiveContainer>
  )
}
