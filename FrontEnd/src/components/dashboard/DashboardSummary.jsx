import { useEffect, useState } from 'react';
import { FaWallet, FaArrowUp, FaArrowDown, FaBalanceScale } from 'react-icons/fa';
import { dashboardService } from '../../services/dashboardService';
import { formatCurrency } from '../../utils/helpers';
import Loader from '../common/Loader';

const DashboardSummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      console.log('[DASHBOARD SUMMARY] Fetching dashboard summary');
      setLoading(true);
      const response = await dashboardService.getDashboardSummary();
      
      if (response.success) {
        setSummary(response.data);
        console.log('[DASHBOARD SUMMARY] Summary loaded');
      }
    } catch (error) {
      console.error('[DASHBOARD SUMMARY ERROR]', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!summary) {
    return null;
  }

  const stats = [
    {
      title: 'You Get Back',
      value: summary.totalToReceive,
      icon: FaArrowUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Total amount others owe you',
    },
    {
      title: 'You Owe',
      value: summary.totalOwed,
      icon: FaArrowDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Total amount you owe others',
    },
    {
      title: 'Net Balance',
      value: summary.netBalance,
      icon: FaBalanceScale,
      color: summary.netBalance >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: summary.netBalance >= 0 ? 'bg-green-100' : 'bg-red-100',
      description: summary.netBalance >= 0 ? 'You are in profit' : 'You are in deficit',
    },
    {
      title: 'Total Groups',
      value: summary.groupCount,
      icon: FaWallet,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
      description: 'Groups you are part of',
      isCount: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          title={stat.description}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`text-2xl ${stat.color}`} />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
          <p className={`text-2xl font-bold ${stat.color}`}>
            {stat.isCount ? stat.value : formatCurrency(stat.value)}
          </p>
          <p className="text-xs text-gray-500 mt-2">{stat.description}</p>
        </div>
      ))}
    </div>
  );
};

export default DashboardSummary;