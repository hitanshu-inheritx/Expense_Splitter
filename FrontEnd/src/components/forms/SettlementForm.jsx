// import { useState, useEffect } from 'react';
// import { FaDollarSign, FaMoneyBillWave, FaCreditCard } from 'react-icons/fa';
// import { useGroup } from '../../context/GroupContext';
// import { settlementService } from '../../services/settlementService';
// import { formatCurrency } from '../../utils/helpers';

// const SettlementForm = ({ group, currentUserId, onSuccess, onCancel }) => {
//   const [settlementSummary, setSettlementSummary] = useState(null);
//   const [formData, setFormData] = useState({
//     paidTo: '',
//     amount: '',
//     paymentMode: 'cash',
//   });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [loadingSummary, setLoadingSummary] = useState(true);
//   const { recordSettlement } = useGroup();

//   useEffect(() => {
//     fetchSettlementSummary();
//   }, []);

//   const fetchSettlementSummary = async () => {
//     try {
//       console.log('[SETTLEMENT FORM] Fetching settlement summary');
//       setLoadingSummary(true);
//       const response = await settlementService.getSettlementSummary(group._id);
      
//       if (response.success) {
//         setSettlementSummary(response.data);
//         console.log('[SETTLEMENT FORM] Summary loaded:', response.data);
        
//         // Auto-fill if user owes someone
//         if (response.data.status === 'owes' && response.data.settlements.length > 0) {
//           const firstCreditor = response.data.settlements[0];
//           setFormData({
//             paidTo: firstCreditor.userId._id,
//             amount: Math.abs(response.data.balance).toFixed(2),
//             paymentMode: 'cash',
//           });
//         }
//       }
//     } catch (error) {
//       console.error('[SETTLEMENT FORM ERROR]', error);
//     } finally {
//       setLoadingSummary(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     if (errors[name]) {
//       setErrors((prev) => ({ ...prev, [name]: '' }));
//     }
//   };

//   const validate = () => {
//     const newErrors = {};

//     if (!formData.paidTo) {
//       newErrors.paidTo = 'Please select who you paid';
//     }

//     if (!formData.amount) {
//       newErrors.amount = 'Amount is required';
//     } else if (parseFloat(formData.amount) <= 0) {
//       newErrors.amount = 'Amount must be greater than 0';
//     }

//     return newErrors;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     console.log('[SETTLEMENT FORM] Form submitted');

//     const validationErrors = validate();
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       console.log('[SETTLEMENT FORM] Validation errors:', validationErrors);
//       return;
//     }

//     setLoading(true);
//     const result = await recordSettlement(group._id, {
//       ...formData,
//       amount: parseFloat(formData.amount),
//     });

//     if (result.success) {
//       console.log('[SETTLEMENT FORM] Settlement recorded successfully');
//       onSuccess();
//     } else {
//       console.log('[SETTLEMENT FORM] Failed to record settlement');
//       setLoading(false);
//     }
//   };

//   if (loadingSummary) {
//     return <div className="text-center py-4">Loading settlement details...</div>;
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       {/* Settlement Summary */}
//       {settlementSummary && (
//         <div className={`p-4 rounded-lg ${
//           settlementSummary.status === 'owes' ? 'bg-red-50' :
//           settlementSummary.status === 'gets' ? 'bg-green-50' :
//           'bg-gray-50'
//         }`}>
//           <p className="text-sm font-medium text-gray-700 mb-1">Your Status:</p>
//           <p className={`text-lg font-bold ${
//             settlementSummary.status === 'owes' ? 'text-red-600' :
//             settlementSummary.status === 'gets' ? 'text-green-600' :
//             'text-gray-600'
//           }`}>
//             {settlementSummary.message}
//           </p>
          
//           {settlementSummary.status === 'settled' && (
//             <p className="text-sm text-gray-600 mt-2">
//               All settled up! No payments needed.
//             </p>
//           )}
//         </div>
//       )}

//       {settlementSummary?.status !== 'settled' && (
//         <>
//           {/* Paid To */}
//           <div>
//             <label htmlFor="paidTo" className="block text-sm font-medium text-gray-700 mb-1">
//               Paid To *
//             </label>
//             <select
//               id="paidTo"
//               name="paidTo"
//               value={formData.paidTo}
//               onChange={handleChange}
//               className={`block w-full px-3 py-2 border ${
//                 errors.paidTo ? 'border-red-500' : 'border-gray-300'
//               } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
//               title="Select who you paid"
//             >
//               <option value="">Select member</option>
//               {group.members
//                 .filter((m) => m.user._id !== currentUserId)
//                 .map((member) => (
//                   <option key={member.user._id} value={member.user._id}>
//                     {member.user.username}
//                   </option>
//                 ))}
//             </select>
//             {errors.paidTo && <p className="mt-1 text-sm text-red-600">{errors.paidTo}</p>}
//           </div>

//           {/* Amount */}
//           <div>
//             <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
//               Amount (₹) *
//             </label>
//             <div className="relative">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <FaDollarSign className="text-gray-400" />
//               </div>
//               <input
//                 id="amount"
//                 name="amount"
//                 type="number"
//                 step="0.01"
//                 min="0.01"
//                 value={formData.amount}
//                 onChange={handleChange}
//                 className={`block w-full pl-10 pr-3 py-2 border ${
//                   errors.amount ? 'border-red-500' : 'border-gray-300'
//                 } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
//                 placeholder="0.00"
//                 title="Enter settlement amount"
//               />
//             </div>
//             {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
//           </div>

//           {/* Payment Mode */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Payment Mode *
//             </label>
//             <div className="grid grid-cols-2 gap-3">
//               <label
//                 className={`flex items-center justify-center space-x-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
//                   formData.paymentMode === 'cash'
//                     ? 'border-primary-600 bg-primary-50'
//                     : 'border-gray-300 hover:border-gray-400'
//                 }`}
//                 title="Select cash payment"
//               >
//                 <input
//                   type="radio"
//                   name="paymentMode"
//                   value="cash"
//                   checked={formData.paymentMode === 'cash'}
//                   onChange={handleChange}
//                   className="sr-only"
//                 />
//                 <FaMoneyBillWave className={formData.paymentMode === 'cash' ? 'text-primary-600' : 'text-gray-400'} />
//                 <span className={formData.paymentMode === 'cash' ? 'font-medium text-primary-600' : 'text-gray-700'}>
//                   Cash
//                 </span>
//               </label>

//               <label
//                 className={`flex items-center justify-center space-x-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
//                   formData.paymentMode === 'online'
//                     ? 'border-primary-600 bg-primary-50'
//                     : 'border-gray-300 hover:border-gray-400'
//                 }`}
//                 title="Select online payment"
//               >
//                 <input
//                   type="radio"
//                   name="paymentMode"
//                   value="online"
//                   checked={formData.paymentMode === 'online'}
//                   onChange={handleChange}
//                   className="sr-only"
//                 />
//                 <FaCreditCard className={formData.paymentMode === 'online' ? 'text-primary-600' : 'text-gray-400'} />
//                 <span className={formData.paymentMode === 'online' ? 'font-medium text-primary-600' : 'text-gray-700'}>
//                   Online
//                 </span>
//               </label>
//             </div>
//           </div>

//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
//             <p className="text-xs text-blue-800">
//               <strong>Note:</strong> Settlement is recorded only. Payment happens outside this app.
//             </p>
//           </div>
//         </>
//       )}

//       {/* Action Buttons */}
//       <div className="flex justify-end space-x-3 pt-4">
//         <button
//           type="button"
//           onClick={onCancel}
//           className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
//         >
//           Cancel
//         </button>
//         {settlementSummary?.status !== 'settled' && (
//           <button
//             type="submit"
//             disabled={loading}
//             className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//           >
//             {loading ? 'Recording...' : 'Record Settlement'}
//           </button>
//         )}
//       </div>
//     </form>
//   );
// };

// export default SettlementForm;























// import { useState, useEffect } from 'react';
// import { FaDollarSign, FaMoneyBillWave, FaCreditCard } from 'react-icons/fa';
// import { useGroup } from '../../context/GroupContext';
// import { settlementService } from '../../services/settlementService';
// import { formatCurrency } from '../../utils/helpers';

// const SettlementForm = ({ group, currentUserId, onSuccess, onCancel }) => {
//   const [settlementSummary, setSettlementSummary] = useState(null);
//   const [formData, setFormData] = useState({
//     paidTo: '',
//     amount: '',
//     paymentMode: 'cash',
//   });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [loadingSummary, setLoadingSummary] = useState(true);
//   const { recordSettlement } = useGroup();

//   useEffect(() => {
//     fetchSettlementSummary();
//   }, []);

//   const fetchSettlementSummary = async () => {
//     try {
//       console.log('[SETTLEMENT FORM] Fetching settlement summary');
//       setLoadingSummary(true);
//       const response = await settlementService.getSettlementSummary(group._id);
      
//       if (response.success) {
//         setSettlementSummary(response.data);
//         console.log('[SETTLEMENT FORM] Summary loaded:', response.data);
        
//         // Auto-fill if user owes someone
//         if (response.data.status === 'owes' && response.data.settlements.length > 0) {
//           const firstCreditor = response.data.settlements[0];
//           setFormData({
//             paidTo: firstCreditor.userId._id,
//             amount: Math.abs(response.data.balance).toFixed(2),
//             paymentMode: 'cash',
//           });
//         }
//       }
//     } catch (error) {
//       console.error('[SETTLEMENT FORM ERROR]', error);
//     } finally {
//       setLoadingSummary(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     if (errors[name]) {
//       setErrors((prev) => ({ ...prev, [name]: '' }));
//     }
//   };

//   const validate = () => {
//     const newErrors = {};

//     if (!formData.paidTo) {
//       newErrors.paidTo = 'Please select who you paid';
//     }

//     if (!formData.amount) {
//       newErrors.amount = 'Amount is required';
//     } else if (parseFloat(formData.amount) <= 0) {
//       newErrors.amount = 'Amount must be greater than 0';
//     }

//     return newErrors;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     console.log('[SETTLEMENT FORM] Form submitted');

//     const validationErrors = validate();
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       console.log('[SETTLEMENT FORM] Validation errors:', validationErrors);
//       return;
//     }

//     setLoading(true);
//     const result = await recordSettlement(group._id, {
//       ...formData,
//       amount: parseFloat(formData.amount),
//     });

//     if (result.success) {
//       console.log('[SETTLEMENT FORM] Settlement recorded successfully');
//       onSuccess();
//     } else {
//       console.log('[SETTLEMENT FORM] Failed to record settlement');
//       setLoading(false);
//     }
//   };

//   if (loadingSummary) {
//     return <div className="text-center py-4">Loading settlement details...</div>;
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       {/* Settlement Summary */}
//       {settlementSummary && (
//         <div className={`p-4 rounded-lg ${
//           settlementSummary.status === 'owes' ? 'bg-red-50' :
//           settlementSummary.status === 'gets' ? 'bg-green-50' :
//           'bg-gray-50'
//         }`}>
//           <p className="text-sm font-medium text-gray-700 mb-1">Your Status:</p>
//           <p className={`text-lg font-bold ${
//             settlementSummary.status === 'owes' ? 'text-red-600' :
//             settlementSummary.status === 'gets' ? 'text-green-600' :
//             'text-gray-600'
//           }`}>
//             {settlementSummary.message}
//           </p>
          
//           {settlementSummary.status === 'settled' && (
//             <p className="text-sm text-gray-600 mt-2">
//               All settled up! No payments needed.
//             </p>
//           )}
//         </div>
//       )}

//       {settlementSummary?.status !== 'settled' && (
//         <>
//           {/* Paid To */}
//           <div>
//             <label htmlFor="paidTo" className="block text-sm font-medium text-gray-700 mb-1">
//               Paid To *
//             </label>
//             <select
//               id="paidTo"
//               name="paidTo"
//               value={formData.paidTo}
//               onChange={handleChange}
//               className={`block w-full px-3 py-2 border ${
//                 errors.paidTo ? 'border-red-500' : 'border-gray-300'
//               } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
//               title="Select who you paid"
//             >
//               <option value="">Select member</option>
//               {group.members
//                 .filter((m) => m.user._id !== currentUserId)
//                 .map((member) => (
//                   <option key={member.user._id} value={member.user._id}>
//                     {member.user.username}
//                   </option>
//                 ))}
//             </select>
//             {errors.paidTo && <p className="mt-1 text-sm text-red-600">{errors.paidTo}</p>}
//           </div>

//           {/* Amount */}
//           <div>
//             <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
//               Amount (₹) *
//             </label>
//             <div className="relative">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <FaDollarSign className="text-gray-400" />
//               </div>
//               <input
//                 id="amount"
//                 name="amount"
//                 type="number"
//                 step="0.01"
//                 min="0.01"
//                 value={formData.amount}
//                 onChange={handleChange}
//                 className={`block w-full pl-10 pr-3 py-2 border ${
//                   errors.amount ? 'border-red-500' : 'border-gray-300'
//                 } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
//                 placeholder="0.00"
//                 title="Enter settlement amount"
//               />
//             </div>
//             {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
//           </div>

//           {/* Payment Mode */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Payment Mode *
//             </label>
//             <div className="grid grid-cols-2 gap-3">
//               <label
//                 className={`flex items-center justify-center space-x-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
//                   formData.paymentMode === 'cash'
//                     ? 'border-primary-600 bg-primary-50'
//                     : 'border-gray-300 hover:border-gray-400'
//                 }`}
//                 title="Select cash payment"
//               >
//                 <input
//                   type="radio"
//                   name="paymentMode"
//                   value="cash"
//                   checked={formData.paymentMode === 'cash'}
//                   onChange={handleChange}
//                   className="sr-only"
//                 />
//                 <FaMoneyBillWave className={formData.paymentMode === 'cash' ? 'text-primary-600' : 'text-gray-400'} />
//                 <span className={formData.paymentMode === 'cash' ? 'font-medium text-primary-600' : 'text-gray-700'}>
//                   Cash
//                 </span>
//               </label>

//               <label
//                 className={`flex items-center justify-center space-x-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
//                   formData.paymentMode === 'online'
//                     ? 'border-primary-600 bg-primary-50'
//                     : 'border-gray-300 hover:border-gray-400'
//                 }`}
//                 title="Select online payment"
//               >
//                 <input
//                   type="radio"
//                   name="paymentMode"
//                   value="online"
//                   checked={formData.paymentMode === 'online'}
//                   onChange={handleChange}
//                   className="sr-only"
//                 />
//                 <FaCreditCard className={formData.paymentMode === 'online' ? 'text-primary-600' : 'text-gray-400'} />
//                 <span className={formData.paymentMode === 'online' ? 'font-medium text-primary-600' : 'text-gray-700'}>
//                   Online
//                 </span>
//               </label>
//             </div>
//           </div>

//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
//             <p className="text-xs text-blue-800">
//               <strong>Note:</strong> Settlement is recorded only. Payment happens outside this app.
//             </p>
//           </div>
//         </>
//       )}

//       {/* Action Buttons */}
//       <div className="flex justify-end space-x-3 pt-4">
//         <button
//           type="button"
//           onClick={onCancel}
//           className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
//         >
//           Cancel
//         </button>
//         {settlementSummary?.status !== 'settled' && (
//           <button
//             type="submit"
//             disabled={loading}
//             className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//           >
//             {loading ? 'Recording...' : 'Record Settlement'}
//           </button>
//         )}
//       </div>
//     </form>
//   );
// };

// export default SettlementForm;












import { useState, useEffect } from 'react';
import { FaDollarSign, FaMoneyBillWave, FaCreditCard } from 'react-icons/fa';
import { useGroup } from '../../context/GroupContext';
import { settlementService } from '../../services/settlementService';
import { formatCurrency } from '../../utils/helpers';

const SettlementForm = ({ group, currentUserId, onSuccess, onCancel }) => {
  const [settlementSummary, setSettlementSummary] = useState(null);
  const [formData, setFormData] = useState({
    paidTo: '',
    amount: '',
    paymentMode: 'cash',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const { recordSettlement } = useGroup();

  useEffect(() => {
    fetchSettlementSummary();
  }, []);

  const fetchSettlementSummary = async () => {
    try {
      console.log('[SETTLEMENT FORM] Fetching settlement summary');
      setLoadingSummary(true);
      const response = await settlementService.getSettlementSummary(group._id);
      
      if (response.success) {
        setSettlementSummary(response.data);
        console.log('[SETTLEMENT FORM] Summary loaded:', response.data);
        
        // Auto-fill if user owes someone
        if (response.data.status === 'owes' && response.data.settlements.length > 0) {
          const firstCreditor = response.data.settlements[0];
          setFormData({
            paidTo: firstCreditor.userId._id,
            amount: Math.abs(response.data.balance).toFixed(2),
            paymentMode: 'cash',
          });
        }
      }
    } catch (error) {
      console.error('[SETTLEMENT FORM ERROR]', error);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.paidTo) {
      newErrors.paidTo = 'Please select who you paid';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[SETTLEMENT FORM] Form submitted');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      console.log('[SETTLEMENT FORM] Validation errors:', validationErrors);
      return;
    }

    setLoading(true);
    const result = await recordSettlement(group._id, {
      ...formData,
      amount: parseFloat(formData.amount),
    });

    if (result.success) {
      console.log('[SETTLEMENT FORM] Settlement recorded successfully');
      onSuccess();
    } else {
      console.log('[SETTLEMENT FORM] Failed to record settlement');
      setLoading(false);
    }
  };

  if (loadingSummary) {
    return <div className="text-center py-4">Loading settlement details...</div>;
  }

  // If user gets money, show message instead of form
  if (settlementSummary?.status === 'gets') {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-600 text-5xl mb-3">✓</div>
          <p className="text-lg font-bold text-green-600 mb-2">
            You Get Money!
          </p>
          <p className="text-gray-700 mb-4">
            {settlementSummary.message}
          </p>
          <p className="text-sm text-gray-600">
            You don't need to record a settlement. Wait for others to pay you.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Settlement Summary */}
      {settlementSummary && (
        <div className={`p-4 rounded-lg ${
          settlementSummary.status === 'owes' ? 'bg-red-50' :
          settlementSummary.status === 'gets' ? 'bg-green-50' :
          'bg-gray-50'
        }`}>
          <p className="text-sm font-medium text-gray-700 mb-1">Your Status:</p>
          <p className={`text-lg font-bold ${
            settlementSummary.status === 'owes' ? 'text-red-600' :
            settlementSummary.status === 'gets' ? 'text-green-600' :
            'text-gray-600'
          }`}>
            {settlementSummary.message}
          </p>
          
          {settlementSummary.status === 'settled' && (
            <p className="text-sm text-gray-600 mt-2">
              All settled up! No payments needed.
            </p>
          )}
        </div>
      )}

      {settlementSummary?.status !== 'settled' && (
        <>
          {/* Paid To */}
          <div>
            <label htmlFor="paidTo" className="block text-sm font-medium text-gray-700 mb-1">
              Paid To *
            </label>
            <select
              id="paidTo"
              name="paidTo"
              value={formData.paidTo}
              onChange={handleChange}
              className={`block w-full px-3 py-2 border ${
                errors.paidTo ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500`}
              title="Select who you paid"
            >
              <option value="">Select member</option>
              {group.members
                .filter((m) => m.user._id !== currentUserId)
                .map((member) => (
                  <option key={member.user._id} value={member.user._id}>
                    {member.user.username}
                  </option>
                ))}
            </select>
            {errors.paidTo && <p className="mt-1 text-sm text-red-600">{errors.paidTo}</p>}
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
                title="Enter settlement amount"
              />
            </div>
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Mode *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center justify-center space-x-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.paymentMode === 'cash'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                title="Select cash payment"
              >
                <input
                  type="radio"
                  name="paymentMode"
                  value="cash"
                  checked={formData.paymentMode === 'cash'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <FaMoneyBillWave className={formData.paymentMode === 'cash' ? 'text-primary-600' : 'text-gray-400'} />
                <span className={formData.paymentMode === 'cash' ? 'font-medium text-primary-600' : 'text-gray-700'}>
                  Cash
                </span>
              </label>

              <label
                className={`flex items-center justify-center space-x-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.paymentMode === 'online'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                title="Select online payment"
              >
                <input
                  type="radio"
                  name="paymentMode"
                  value="online"
                  checked={formData.paymentMode === 'online'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <FaCreditCard className={formData.paymentMode === 'online' ? 'text-primary-600' : 'text-gray-400'} />
                <span className={formData.paymentMode === 'online' ? 'font-medium text-primary-600' : 'text-gray-700'}>
                  Online
                </span>
              </label>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Settlement is recorded only. Payment happens outside this app.
            </p>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        {settlementSummary?.status !== 'settled' && (
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Recording...' : 'Record Settlement'}
          </button>
        )}
      </div>
    </form>
  );
};

export default SettlementForm;


