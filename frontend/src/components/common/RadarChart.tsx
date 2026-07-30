import React from 'react';
import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

interface RadarChartProps {
  data: {
    subject: string;
    score: number;
    fullMark?: number;
  }[];
}

export const RadarChartComponent: React.FC<RadarChartProps> = ({ data }) => {
  const formattedData = data.map((d) => ({
    subject: d.subject,
    score: d.score,
    fullMark: d.fullMark || 100,
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar data={formattedData}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
          <Radar
            name="Candidate Performance"
            dataKey="score"
            stroke="#818cf8"
            fill="#6366f1"
            fillOpacity={0.4}
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
};
