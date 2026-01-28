import { createContext, useState, useContext } from 'react';
import { groupService } from '../services/groupService';
import { expenseService } from '../services/expenseService';
import { settlementService } from '../services/settlementService';
import { toast } from 'react-toastify';

const GroupContext = createContext();

export const useGroup = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroup must be used within GroupProvider');
  }
  return context;
};

export const GroupProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchGroups = async () => {
    try {
      console.log('[GROUP CONTEXT] Fetching groups');
      setLoading(true);
      const response = await groupService.getMyGroups();
      
      if (response.success) {
        setGroups(response.data);
        console.log('[GROUP CONTEXT] Groups fetched:', response.data.length);
      }
    } catch (error) {
      console.error('[GROUP CONTEXT ERROR] Fetch groups failed:', error);
      toast.error(error.message || 'Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupDetails = async (groupId) => {
    try {
      console.log('[GROUP CONTEXT] Fetching group details:', groupId);
      setLoading(true);
      
      const [groupRes, expensesRes, settlementsRes] = await Promise.all([
        groupService.getGroupById(groupId),
        expenseService.getGroupExpenses(groupId),
        settlementService.getGroupSettlements(groupId),
      ]);
      
      if (groupRes.success) {
        setCurrentGroup(groupRes.data);
        console.log('[GROUP CONTEXT] Group details fetched');
      }
      
      if (expensesRes.success) {
        setExpenses(expensesRes.data);
        console.log('[GROUP CONTEXT] Expenses fetched:', expensesRes.data.length);
      }
      
      if (settlementsRes.success) {
        setSettlements(settlementsRes.data);
        console.log('[GROUP CONTEXT] Settlements fetched:', settlementsRes.data.length);
      }
    } catch (error) {
      console.error('[GROUP CONTEXT ERROR] Fetch group details failed:', error);
      toast.error(error.message || 'Failed to fetch group details');
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (groupData) => {
    try {
      console.log('[GROUP CONTEXT] Creating group');
      const response = await groupService.createGroup(groupData);
      
      if (response.success) {
        setGroups((prev) => [response.data, ...prev]);
        console.log('[GROUP CONTEXT] Group created');
        toast.success('Group created successfully!');
        return { success: true, data: response.data };
      }
    } catch (error) {
      console.error('[GROUP CONTEXT ERROR] Create group failed:', error);
      toast.error(error.message || 'Failed to create group');
      return { success: false, error };
    }
  };

  const updateGroup = async (groupId, groupData) => {
    try {
      console.log('[GROUP CONTEXT] Updating group:', groupId);
      const response = await groupService.updateGroup(groupId, groupData);
      
      if (response.success) {
        setCurrentGroup(response.data);
        setGroups((prev) =>
          prev.map((g) => (g._id === groupId ? response.data : g))
        );
        console.log('[GROUP CONTEXT] Group updated');
        toast.success('Group updated successfully!');
        return { success: true };
      }
    } catch (error) {
      console.error('[GROUP CONTEXT ERROR] Update group failed:', error);
      toast.error(error.message || 'Failed to update group');
      return { success: false, error };
    }
  };

  const addExpense = async (groupId, expenseData) => {
    try {
      console.log('[GROUP CONTEXT] Adding expense to group:', groupId);
      const response = await expenseService.addExpense(groupId, expenseData);
      
      if (response.success) {
        setExpenses((prev) => [response.data, ...prev]);
        await fetchGroupDetails(groupId); // Refresh to update balances
        console.log('[GROUP CONTEXT] Expense added');
        toast.success('Expense added successfully!');
        return { success: true };
      }
    } catch (error) {
      console.error('[GROUP CONTEXT ERROR] Add expense failed:', error);
      toast.error(error.message || 'Failed to add expense');
      return { success: false, error };
    }
  };

  const recordSettlement = async (groupId, settlementData) => {
    try {
      console.log('[GROUP CONTEXT] Recording settlement in group:', groupId);
      const response = await settlementService.recordSettlement(groupId, settlementData);
      
      if (response.success) {
        setSettlements((prev) => [response.data, ...prev]);
        await fetchGroupDetails(groupId); // Refresh to update balances
        console.log('[GROUP CONTEXT] Settlement recorded');
        toast.success('Settlement recorded successfully!');
        return { success: true };
      }
    } catch (error) {
      console.error('[GROUP CONTEXT ERROR] Record settlement failed:', error);
      toast.error(error.message || 'Failed to record settlement');
      return { success: false, error };
    }
  };

  const deleteGroup = async (groupId) => {
    try {
      console.log('[GROUP CONTEXT] Deleting group:', groupId);
      const response = await groupService.deleteGroup(groupId);
      
      if (response.success) {
        setGroups((prev) => prev.filter((g) => g._id !== groupId));
        console.log('[GROUP CONTEXT] Group deleted');
        toast.success('Group deleted successfully!');
        return { success: true };
      }
    } catch (error) {
      console.error('[GROUP CONTEXT ERROR] Delete group failed:', error);
      toast.error(error.message || 'Failed to delete group');
      return { success: false, error };
    }
  };

  const leaveGroup = async (groupId) => {
    try {
      console.log('[GROUP CONTEXT] Leaving group:', groupId);
      const response = await groupService.leaveGroup(groupId);
      
      if (response.success) {
        setGroups((prev) => prev.filter((g) => g._id !== groupId));
        console.log('[GROUP CONTEXT] Left group successfully');
        toast.success('You have left the group');
        return { success: true };
      }
    } catch (error) {
      console.error('[GROUP CONTEXT ERROR] Leave group failed:', error);
      toast.error(error.message || 'Failed to leave group');
      return { success: false, error };
    }
  };

  const value = {
    groups,
    currentGroup,
    expenses,
    settlements,
    loading,
    fetchGroups,
    fetchGroupDetails,
    createGroup,
    updateGroup,
    addExpense,
    recordSettlement,
    deleteGroup,
    leaveGroup,
    setCurrentGroup,
  };

  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
};