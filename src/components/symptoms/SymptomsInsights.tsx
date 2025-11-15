import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSymptomsStore } from '@/hooks/useSymptomsStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export const SymptomsInsights = () => {
  const { symptoms } = useSymptomsStore();

  // Group by day and calculate average severity
  const dailyData = symptoms.reduce((acc, symptom) => {
    const day = symptom.protocolDay;
    if (!acc[day]) {
      acc[day] = { day, totalSeverity: 0, count: 0 };
    }
    acc[day].totalSeverity += symptom.severity;
    acc[day].count += 1;
    return acc;
  }, {} as Record<number, { day: number; totalSeverity: number; count: number }>);

  const chartData = Object.values(dailyData)
    .map(({ day, totalSeverity, count }) => ({
      day: `Day ${day}`,
      severity: Math.round((totalSeverity / count) * 10) / 10,
    }))
    .sort((a, b) => parseInt(a.day.split(' ')[1]) - parseInt(b.day.split(' ')[1]));

  // Group by symptom type
  const symptomCounts = symptoms.reduce((acc, symptom) => {
    const type = symptom.type.toLowerCase();
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSymptoms = Object.entries(symptomCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (symptoms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Symptoms Insights</CardTitle>
          <CardDescription>Track your patterns over time</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Start logging symptoms to see insights and patterns
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Symptoms Insights</CardTitle>
        <CardDescription>Your symptom patterns over time</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {chartData.length > 1 && (
          <div>
            <h3 className="font-semibold mb-3">Average Severity Over Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis domain={[0, 10]} className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="severity"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {topSymptoms.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Most Frequent Symptoms</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topSymptoms}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="type" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Summary</h3>
          <ul className="space-y-1 text-sm">
            <li>Total symptoms logged: {symptoms.length}</li>
            <li>Days tracked: {Object.keys(dailyData).length}</li>
            <li>Unique symptom types: {Object.keys(symptomCounts).length}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
