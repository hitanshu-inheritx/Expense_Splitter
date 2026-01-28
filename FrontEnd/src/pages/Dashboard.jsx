import { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import Navbar from '../components/common/Navbar';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import DashboardSummary from '../components/dashboard/DashboardSummary';
import GroupCard from '../components/dashboard/GroupCard';
import CreateGroupForm from '../components/forms/CreateGroupForm';
import { useGroup } from '../context/GroupContext';

const Dashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { groups, loading, fetchGroups } = useGroup();

  useEffect(() => {
    console.log('[DASHBOARD] Component mounted');
    fetchGroups();
  }, []);

  const handleGroupCreated = () => {
    console.log('[DASHBOARD] Group created, closing modal');
    setShowCreateModal(false);
    fetchGroups();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your group expenses</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md"
            title="Create a new group"
          >
            <FaPlus />
            <span>Create Group</span>
          </button>
        </div>

        {/* Summary Cards */}
        <DashboardSummary />

        {/* Groups Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Groups</h2>
          
          {loading ? (
            <Loader />
          ) : groups.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaPlus className="text-3xl text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No groups yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first group to start splitting expenses with friends and family.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  title="Create your first group"
                >
                  <FaPlus />
                  <span>Create Your First Group</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <GroupCard key={group._id} group={group} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Group Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Group"
        size="medium"
      >
        <CreateGroupForm onSuccess={handleGroupCreated} onCancel={() => setShowCreateModal(false)} />
      </Modal>
    </div>
  );
};

export default Dashboard;