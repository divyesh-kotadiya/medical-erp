'use client'
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSubmittedTimesheets, approveTimesheet, rejectTimesheet } from '@/store/slices/timesheets';
import { Check, X } from 'lucide-react';
import Table from '@/components/common/Table';

export const ApprovalsList = () => {
  const dispatch = useAppDispatch();
  const { submittedList, loading } = useAppSelector((s) => s.timesheets);
  const { currentOrganization } = useAppSelector((state) => state.organizations)
  
  useEffect(() => {
    dispatch(fetchSubmittedTimesheets({}));
  }, [dispatch, currentOrganization?.id]);

  const handleApprove = async (id: string) => {
    await dispatch(approveTimesheet({ timesheetId: id, approvedBy: 'admin', }));
    dispatch(fetchSubmittedTimesheets({}));
  };
  
  const handleReject = async (id: string) => {
    const reason = window.prompt('Reason for rejection?') || '';
    await dispatch(rejectTimesheet({ timesheetId: id, rejectedBy: 'admin', reason }));
    dispatch(fetchSubmittedTimesheets({}));
  };

  const getStatusBadge = (status: string) => {
    let badgeClass = '';
    
    switch(status.toLowerCase()) {
      case 'submitted':
        badgeClass = 'bg-warning/10 text-warning';
        break;
      case 'approved':
        badgeClass = 'bg-success/10 text-success';
        break;
      case 'rejected':
        badgeClass = 'bg-destructive/10 text-destructive';
        break;
      default:
        badgeClass = 'bg-muted text-muted-foreground';
    }
    
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
        {status}
      </span>
    );
  };

  const columns = [
    {
      key: 'staffId.name',
      label: 'User',
      render: (value: any, row: any) => value || '—'
    },
    {
      key: 'staffId.email',
      label: 'Email',
      render: (value: any, row: any) => value || '—'
    },
    {
      key: 'period',
      label: 'Period',
      render: (value: any, row: any) => {
        return `${new Date(row.periodStart).toLocaleDateString()} - ${new Date(row.periodEnd).toLocaleDateString()}`;
      }
    },
    {
      key: 'hours',
      label: 'Hours',
      className: 'font-medium text-primary'
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: any, row: any) => getStatusBadge(value)
    }
  ];

  const actions = [
    {
      icon: <Check className="h-4 w-4" />,
      onClick: (row: any) => handleApprove(row._id),
      tooltip: 'Approve',
      className: 'text-success hover:text-success/80'
    },
    {
      icon: <X className="h-4 w-4" />,
      onClick: (row: any) => handleReject(row._id),
      tooltip: 'Reject',
      className: 'text-destructive hover:text-destructive/80'
    }
  ];

  return (
    <div className="bg-card rounded-2xl shadow-card p-6">
      <h2 className="text-xl font-semibold mb-4 text-foreground">Submitted Timesheets</h2>
      <Table
        columns={columns}
        data={submittedList || []}
        loading={loading}
        emptyMessage="No submissions"
        actions={actions}
        keyExtractor={(row) => row._id}
      />
    </div>
  );
};

export default ApprovalsList;