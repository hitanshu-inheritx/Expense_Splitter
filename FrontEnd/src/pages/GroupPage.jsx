import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlus, FaHandHoldingUsd, FaArrowLeft } from 'react-icons/fa';
import Navbar from '../components/common/Navbar';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import GroupDetails from '../components/group/GroupDetails';
import MemberList from '../components/group/MemberList';
import ExpenseList from '../components/group/ExpenseList';
import SettlementList from '../components/group/SettlementList';
import AddExpenseForm from '../components/forms/AddExpenseForm';
import SettlementForm from '../components/forms/SettlementForm';
import { useGroup } from '../context/GroupContext';
import { useAuth } from '../context/AuthContext';
import { groupService } from '../services/groupService';
import { generateGroupPDF } from '../utils/pdfGenerator';
import { toast } from 'react-toastify';

const GroupPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentGroup, expenses, settlements, loading, fetchGroupDetails, setCurrentGroup } = useGroup();
  
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses'); // expenses, settlements

  useEffect(() => {
    console.log('[GROUP PAGE] Loading group:', groupId);
    loadGroupData();
    
    return () => {
      console.log('[GROUP PAGE] Cleanup');
      setCurrentGroup(null);
    };
  }, [groupId]);

  const loadGroupData = async () => {
    try {
      await fetchGroupDetails(groupId);
    } catch (error) {
      console.error('[GROUP PAGE ERROR] Failed to load group:', error);
      toast.error('Failed to load group details');
      navigate('/dashboard');
    }
  };

  const handleUpdateGroup = async (groupData) => {
    try {
      console.log('[GROUP PAGE] Updating group');
      const response = await groupService.updateGroup(groupId, groupData);
      
      if (response.success) {
        await loadGroupData();
        return { success: true };
      }
    } catch (error) {
      console.error('[GROUP PAGE ERROR] Update failed:', error);
      toast.error(error.message || 'Failed to update group');
      return { success: false };
    }
  };

  const handleDeleteGroup = async () => {
    try {
      console.log('[GROUP PAGE] Deleting group');
      const response = await groupService.deleteGroup(groupId);
      
      if (response.success) {
        toast.success('Group deleted successfully');
        navigate('/dashboard');
        return { success: true };
      }
    } catch (error) {
      console.error('[GROUP PAGE ERROR] Delete failed:', error);
      toast.error(error.message || 'Failed to delete group');
      return { success: false };
    }
  };

  const handleInviteUsers = async () => {
    console.log('[GROUP PAGE] Users invited, reloading data');
    await loadGroupData();
  };

  const handleRemoveMember = async (userId) => {
    try {
      console.log('[GROUP PAGE] Removing member:', userId);
      const response = await groupService.removeMember(groupId, userId);
      
      if (response.success) {
        await loadGroupData();
        return { success: true };
      }
    } catch (error) {
      console.error('[GROUP PAGE ERROR] Remove member failed:', error);
      toast.error(error.message || 'Failed to remove member');
      return { success: false };
    }
  };

  const handleExpenseAdded = () => {
    console.log('[GROUP PAGE] Expense added, closing modal');
    setShowExpenseModal(false);
    loadGroupData();
  };

  const handleSettlementRecorded = () => {
    console.log('[GROUP PAGE] Settlement recorded, closing modal');
    setShowSettlementModal(false);
    loadGroupData();
  };

  const handleExportPDF = async () => {
    try {
      console.log('[GROUP PAGE] Exporting PDF');
      if (!currentGroup) return;

      await generateGroupPDF(
        currentGroup,
        expenses,
        settlements,
        currentGroup.members
      );
      
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('[GROUP PAGE ERROR] PDF export failed:', error);
      toast.error('Failed to export PDF');
    }
  };

  if (loading || !currentGroup) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Loader fullScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 mb-6 transition-colors"
          title="Back to dashboard"
        >
          <FaArrowLeft />
          <span>Back to Dashboard</span>
        </button>

        {/* Group Details */}
        <GroupDetails
          group={currentGroup}
          onUpdate={handleUpdateGroup}
          onDelete={handleDeleteGroup}
          onInvite={handleInviteUsers}
          onExportPDF={handleExportPDF}
        />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 my-6">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md"
            title="Add new expense"
          >
            <FaPlus />
            <span>Add Expense</span>
          </button>
          <button
            onClick={() => setShowSettlementModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow-md"
            title="Record settlement payment"
          >
            <FaHandHoldingUsd />
            <span>Record Settlement</span>
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Members */}
          <div className="lg:col-span-1">
            <MemberList group={currentGroup} onRemoveMember={handleRemoveMember} />
          </div>

          {/* Right Column - Expenses & Settlements */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 flex space-x-1">
              <button
                onClick={() => setActiveTab('expenses')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'expenses'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="View expenses"
              >
                Expenses ({expenses.length})
              </button>
              <button
                onClick={() => setActiveTab('settlements')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'settlements'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="View settlement history"
              >
                Settlements ({settlements.length})
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'expenses' ? (
              <ExpenseList expenses={expenses} />
            ) : (
              <SettlementList settlements={settlements} />
            )}
          </div>
        </div>
      </main>

      {/* Add Expense Modal */}
      <Modal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        title="Add Expense"
        size="medium"
      >
        <AddExpenseForm
          group={currentGroup}
          onSuccess={handleExpenseAdded}
          onCancel={() => setShowExpenseModal(false)}
        />
      </Modal>

      {/* Record Settlement Modal */}
      <Modal
        isOpen={showSettlementModal}
        onClose={() => setShowSettlementModal(false)}
        title="Record Settlement"
        size="medium"
      >
        <SettlementForm
          group={currentGroup}
          currentUserId={user._id}
          onSuccess={handleSettlementRecorded}
          onCancel={() => setShowSettlementModal(false)}
        />
      </Modal>
    </div>
  );
};

export default GroupPage;