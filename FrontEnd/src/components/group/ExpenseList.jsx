import { FaReceipt, FaUser } from 'react-icons/fa';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

const ExpenseList = ({ expenses }) => {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Expenses</h2>
        <div className="text-center py-8">
          <FaReceipt className="text-4xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No expenses yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Expenses ({expenses.length})
      </h2>
      
      <div className="space-y-3">
        {expenses.map((expense) => (
          <div
            key={expense._id}
            className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{expense.name}</h3>
                <p className="text-sm text-gray-500">{formatDateTime(expense.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(expense.amount)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <FaUser className="text-xs" />
                <span>
                  Paid by <strong className="text-gray-900">{expense.paidBy.username}</strong>
                </span>
              </div>
              <span className="text-gray-500">
                Split among {expense.splitAmong.length} member{expense.splitAmong.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Split Details */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Split details:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {expense.splitAmong.map((split) => (
                  <div key={split.user._id} className="text-xs">
                    <span className="text-gray-700">{split.user.username}</span>
                    <span className="text-gray-500"> - </span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(split.share)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseList;