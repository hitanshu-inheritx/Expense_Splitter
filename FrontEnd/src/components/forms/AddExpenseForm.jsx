import { useState } from 'react';
import { FaReceipt, FaDollarSign, FaUsers } from 'react-icons/fa';
import { useGroup } from '../../context/GroupContext';
import { validateExpenseName, validateAmount } from '../../utils/validators';

const AddExpenseForm = ({ group, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    paidBy: '',
    splitAmong: [],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { addExpense } = useGroup();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleMemberToggle = (userId) => {
    setFormData((prev) => {
      const isSelected = prev.splitAmong.includes(userId);
      return {
        ...prev,
        splitAmong: isSelected
          ? prev.splitAmong.filter((id) => id !== userId)
          : [...prev.splitAmong, userId],
      };
    });
    if (errors.splitAmong) {
      setErrors((prev) => ({ ...prev, splitAmong: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Expense name is required';
    } else if (!validateExpenseName(formData.name)) {
      newErrors.name = 'Please enter a valid expense name';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (!validateAmount(formData.amount)) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.paidBy) {
      newErrors.paidBy = 'Please select who paid';
    }

    if (formData.splitAmong.length === 0) {
      newErrors.splitAmong = 'Please select at least one member to split with';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[ADD EXPENSE FORM] Form submitted');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      console.log('[ADD EXPENSE FORM] Validation errors:', validationErrors);
      return;
    }

    setLoading(true);
    const result = await addExpense(group._id, {
      ...formData,
      amount: parseFloat(formData.amount),
    });

    if (result.success) {
      console.log('[ADD EXPENSE FORM] Expense added successfully');
      onSuccess();
    } else {
      console.log('[ADD EXPENSE FORM] Failed to add expense');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Expense Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Expense Name *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaReceipt className="text-gray-400" />
          </div>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className={`block w-full pl-10 pr-3 py-2 border ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
            placeholder="e.g., Dinner at restaurant"
            title="Enter expense name"
          />
        </div>
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Amount */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          Amount (₹) *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaDollarSign className="text-gray-400" />
          </div>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.amount}
            onChange={handleChange}
            className={`block w-full pl-10 pr-3 py-2 border ${
              errors.amount ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
            placeholder="0.00"
            title="Enter expense amount"
          />
        </div>
        {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
      </div>

      {/* Paid By */}
      <div>
        <label htmlFor="paidBy" className="block text-sm font-medium text-gray-700 mb-1">
          Paid By *
        </label>
        <select
          id="paidBy"
          name="paidBy"
          value={formData.paidBy}
          onChange={handleChange}
          className={`block w-full px-3 py-2 border ${
            errors.paidBy ? 'border-red-500' : 'border-gray-300'
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
          title="Select who paid for this expense"
        >
          <option value="">Select member</option>
          {group.members.map((member) => (
            <option key={member.user._id} value={member.user._id}>
              {member.user.username}
            </option>
          ))}
        </select>
        {errors.paidBy && <p className="mt-1 text-sm text-red-600">{errors.paidBy}</p>}
      </div>

      {/* Split Among */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Split Among * (Select members)
        </label>
        <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
          <div className="space-y-2">
            {group.members.map((member) => (
              <label
                key={member.user._id}
                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                title={`Toggle ${member.user.username} in split`}
              >
                <input
                  type="checkbox"
                  checked={formData.splitAmong.includes(member.user._id)}
                  onChange={() => handleMemberToggle(member.user._id)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{member.user.username}</span>
              </label>
            ))}
          </div>
        </div>
        {errors.splitAmong && <p className="mt-1 text-sm text-red-600">{errors.splitAmong}</p>}
        {formData.splitAmong.length > 0 && (
          <p className="mt-2 text-sm text-gray-600">
            Split among {formData.splitAmong.length} member{formData.splitAmong.length !== 1 ? 's' : ''}
            {formData.amount && ` - ₹${(parseFloat(formData.amount) / formData.splitAmong.length).toFixed(2)} each`}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Adding...' : 'Add Expense'}
        </button>
      </div>
    </form>
  );
};

export default AddExpenseForm;