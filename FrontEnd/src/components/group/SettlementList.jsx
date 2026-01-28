import { FaHandHoldingUsd, FaMoneyBillWave, FaCreditCard } from 'react-icons/fa';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

const SettlementList = ({ settlements }) => {
  if (!settlements || settlements.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Settlement History</h2>
        <div className="text-center py-8">
          <FaHandHoldingUsd className="text-4xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No settlements yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Settlement History ({settlements.length})
      </h2>
      
      <div className="space-y-3">
        {settlements.map((settlement) => (
          <div
            key={settlement._id}
            className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors bg-green-50"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <FaHandHoldingUsd className="text-green-600" />
                  <span className="font-semibold text-gray-900">
                    {settlement.paidBy.username}
                  </span>
                  <span className="text-gray-600">paid</span>
                  <span className="font-semibold text-gray-900">
                    {settlement.paidTo.username}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{formatDateTime(settlement.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(settlement.amount)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
              {settlement.paymentMode === 'cash' ? (
                <FaMoneyBillWave className="text-green-600" />
              ) : (
                <FaCreditCard className="text-blue-600" />
              )}
              <span className="capitalize">{settlement.paymentMode}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettlementList;