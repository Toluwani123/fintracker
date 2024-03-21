import React from 'react';
import { Line } from 'react-chartjs-2';

const LineChart = ({ chartdata }) => {
  // Define the colors for the datasets
  const colors = [
    '#0047AB',  // Dark Blue
    '#9ACD32',  // Yellow-Green
    '#DE3163',  // Pink
    '#FF7F50',  // Coral
    '#40E0D0',  // Turquoise
    '#9370DB',  // MediumPurple
    '#FFD700',  // Gold
    '#2E8B57',  // SeaGreen
    '#CD5C5C',  // IndianRed
    '#1E90FF'   // DodgerBlue
  ];
  

  // Modify the datasets to include backgroundColor and borderColor properties
  const datasetsWithColors = chartdata.datasets.map((dataset, index) => ({
    ...dataset,
    backgroundColor: colors[index],  // You can set this to 'transparent' if you don't want a fill color
    borderColor: colors[index],
  }));

  // Modify the chartdata to use the updated datasets
  const updatedChartData = {
    ...chartdata,
    datasets: datasetsWithColors,
  };

  return (
    <Line 
      data={updatedChartData} 
      options={{
        layout: {
          padding: 10
        },
        plugins: {
          title: {
            display: true,
            text: 'How much you spend on each category'
          }
        }
      }}
    />
  );
}

export default LineChart;
