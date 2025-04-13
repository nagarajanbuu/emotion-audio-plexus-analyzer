
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { EmotionResult } from '@/types/emotion';

interface EmotionChartProps {
  emotionData: EmotionResult;
}

const EMOTION_COLORS = {
  happy: '#4CAF50',
  sad: '#2196F3',
  neutral: '#9E9E9E',
  angry: '#F44336',
  fear: '#673AB7',
};

const EmotionChart = ({ emotionData }: EmotionChartProps) => {
  const [chartData, setChartData] = useState<Array<{ name: string; value: number }>>([]);
  
  useEffect(() => {
    // Format the emotion data for the chart
    const formattedData = emotionData.emotions.map(item => ({
      name: item.emotion.charAt(0).toUpperCase() + item.emotion.slice(1),
      value: Math.round(item.score * 100),
    }));
    
    setChartData(formattedData);
  }, [emotionData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-2 border rounded-md text-xs shadow-sm">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-lg border p-6 shadow-sm h-full transition-all duration-300 animate-fade-in">
      <h2 className="text-xl font-medium mb-6">Emotion Visualization</h2>
      
      <div className="w-full h-[250px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              animationDuration={1000}
              animationBegin={200}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={EMOTION_COLORS[entry.name.toLowerCase() as keyof typeof EMOTION_COLORS] || '#ccc'}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        {Object.entries(EMOTION_COLORS).map(([emotion, color]) => (
          <div key={emotion} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs capitalize">{emotion}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmotionChart;
