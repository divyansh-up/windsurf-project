import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { ScoreBundle } from '@/lib/analytics';

export function AnalyticsRadar({ scores, compare }: { scores: ScoreBundle; compare?: ScoreBundle }) {
  const data = [
    { metric: 'Accuracy', value: scores.accuracy, compare: compare?.accuracy ?? 0 },
    { metric: 'Clarity', value: scores.clarity, compare: compare?.clarity ?? 0 },
    { metric: 'Confidence', value: scores.confidence, compare: compare?.confidence ?? 0 },
    { metric: 'Communication', value: scores.communication, compare: compare?.communication ?? 0 },
  ];

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: '#374151', fontSize: 12 }} />
          <PolarRadiusAxis domain={[0, 100]} tickCount={6} tick={{ fill: '#9ca3af', fontSize: 10 }} />
          <Tooltip />
          <Legend />
          <Radar name="This Session" dataKey="value" stroke="#22D3EE" fill="#22D3EE" fillOpacity={0.35} />
          {compare && (
            <Radar name="Previous" dataKey="compare" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.2} />
          )}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
