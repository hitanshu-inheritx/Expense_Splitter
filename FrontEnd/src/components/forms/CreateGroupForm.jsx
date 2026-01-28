import { useState } from 'react';
import { FaUsers, FaAlignLeft } from 'react-icons/fa';
import { useGroup } from '../../context/GroupContext';
import { validateGroupName } from '../../utils/validators';

const CreateGroupForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { createGroup } = useGroup();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required';
    } else if (!validateGroupName(formData.name)) {
      newErrors.name = 'Group name must be at least 3 characters';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[CREATE GROUP FORM] Form submitted');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      console.log('[CREATE GROUP FORM] Validation errors:', validationErrors);
      return;
    }

    setLoading(true);
    const result = await createGroup(formData);

    if (result.success) {
      console.log('[CREATE GROUP FORM] Group created successfully');
      onSuccess();
    } else {
      console.log('[CREATE GROUP FORM] Failed to create group');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Group Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Group Name *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaUsers className="text-gray-400" />
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
            placeholder="e.g., Goa Trip 2024"
            title="Enter group name (min 3 characters)"
          />
        </div>
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description (Optional)
        </label>
        <div className="relative">
          <div className="absolute top-3 left-3 pointer-events-none">
            <FaAlignLeft className="text-gray-400" />
          </div>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={3}
            placeholder="Add a description for your group"
            title="Enter group description (optional)"
          />
        </div>
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
          {loading ? 'Creating...' : 'Create Group'}
        </button>
      </div>
    </form>
  );
};

export default CreateGroupForm;