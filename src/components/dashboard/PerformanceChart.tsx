import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PerformanceChartProps {
  activeTab: string;
}

const PerformanceChart = ({ activeTab }: PerformanceChartProps) => {
  // Sample data for the chart
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  const overallScores = [65, 70, 75, 80, 78, 85];
  const mathScores = [60, 65, 70, 75, 78, 82];
  const scienceScores = [70, 72, 68, 75, 80, 85];
  const socialScores = [65, 70, 72, 78, 80, 88];
  const languageScores = [75, 72, 75, 80, 82, 85];

  const chartData = {
    labels,
    datasets: activeTab === 'overall' 
      ? [
          {
            label: 'Overall Score',
            data: overallScores,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.3,
            fill: true,
          },
        ]
      : [
          {
            label: 'Mathematics',
            data: mathScores,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.3,
            fill: false,
          },
          {
            label: 'Science',
            data: scienceScores,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.3,
            fill: false,
          },
          {
            label: 'Social',
            data: socialScores,
            borderColor: 'rgb(168, 85, 247)',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            tension: 0.3,
            fill: false,
          },
          {
            label: 'Languages',
            data: languageScores,
            borderColor: 'rgb(245, 158, 11)',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.3,
            fill: false,
          },
        ],
  };

  // Chart options with improved text visibility
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#111827',
        bodyColor: '#4B5563',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${context.raw}%`;
          },
        },
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        beginAtZero: true,
        max: 100,
        grid: {
          drawBorder: false,
          color: '#E5E7EB',
        },
        ticks: {
          callback: function (value: number | string) {
            return value + '%';
          },
        },
      },
      x: {
        type: 'category' as const,
        grid: {
          display: false,
        },
      },
    },
    elements: {
      point: {
        radius: 0,
        hoverRadius: 6,
        hoverBorderWidth: 2,
      },
      line: {
        borderWidth: 2,
      },
    },
  };
  
  

  return (
    <div className="w-full h-full">
      <Line 
        options={options} 
        data={chartData}
      />
    </div>
  );
};

export default PerformanceChart;
