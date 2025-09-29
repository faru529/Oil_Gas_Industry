import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function TwinChart({ data, fields }) {
  const timestamps = data.map(d => new Date(d.ts).toLocaleTimeString());

  const datasets = fields.map(field => ({
    label: field,
    data: data.map(d => d[field]),
    borderColor: '#' + Math.floor(Math.random()*16777215).toString(16),
    fill: false,
  }));

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto' }}>
      <Line data={{ labels: timestamps, datasets }} />
    </div>
  );
}

export default TwinChart;
