'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { enqueueSnackbar } from 'notistack';
import { fetchMyInvites, acceptInvite, rejectInvite } from '@/store/slices/invite';

import { Check, X } from 'lucide-react';
import Table from '@/components/common/Table';

const InvitedListPage = () => {
  const dispatch = useAppDispatch();
  const { myInvites, loading, totalPages = 1 } = useAppSelector((state) => state.invite);

  const [processingToken, setProcessingToken] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 5;

  useEffect(() => {
    dispatch(fetchMyInvites({ page, limit }));
  }, [dispatch, page]);

  const handleAccept = async (token: string) => {
    setProcessingToken(token);
    try {
      await dispatch(acceptInvite(token)).unwrap();
      enqueueSnackbar('Invite accepted successfully', { variant: 'success' });
      dispatch(fetchMyInvites({ page, limit }));
    } catch {
      enqueueSnackbar('Failed to accept invite', { variant: 'error' });
    } finally {
      setProcessingToken(null);
    }
  };

  const handleReject = async (token: string) => {
    setProcessingToken(token);
    try {
      await dispatch(rejectInvite(token)).unwrap();
      enqueueSnackbar('Invite rejected', { variant: 'info' });
      dispatch(fetchMyInvites({ page, limit }));
    } catch {
      enqueueSnackbar('Failed to reject invite', { variant: 'error' });
    } finally {
      setProcessingToken(null);
    }
  };

  const columns = [
    {
      key: 'organizationName',
      label: 'ORGANIZATION NAME',
      render: (value: any, row: any) => row?.tenantId?.name || row.organizationName,
    },
    {
      key: 'email',
      label: 'EMAIL',
    },
    {
      key: 'role',
      label: 'ROLE',
    },
    {
      key: 'createdAt',
      label: 'SENT AT',
      render: (value: any) => new Date(value).toLocaleString(),
    },
    {
      key: 'status',
      label: 'STATUS',
      render: (value: any) => {
        if (value === 'ACCEPTED') {
          return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
              ACCEPTED
            </span>
          );
        } else if (value === 'REJECTED') {
          return (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-danger/10 text-danger">
              REJECTED
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
            PENDING
          </span>
        );
      },
    },
  ];

  const actions = [
    {
      icon: <Check className="h-4 w-4" />,
      onClick: (row: any) => handleAccept(row.token),
      tooltip: 'Accept',
      className: 'text-success hover:text-success/80',
      // Only show when status is PENDING
      show: (row: any) => row.status === 'PENDING',
    },
    {
      icon: <X className="h-4 w-4" />,
      onClick: (row: any) => handleReject(row.token),
      tooltip: 'Reject',
      className: 'text-danger hover:text-danger/80',
      // Only show when status is PENDING
      show: (row: any) => row.status === 'PENDING',
    },
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-background to-secondary min-h-screen">
      <div className="w-full max-w-full mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-foreground">My Invites</h1>
        <Table
          columns={columns}
          data={myInvites}
          loading={loading}
          error={null}
          pagination={{
            currentPage: page,
            totalPages: totalPages,
            onPageChange: setPage,
            itemsPerPage: limit,
            totalItems: myInvites.length,
          }}
          actions={actions}
          keyExtractor={(row) => row.token}
          emptyMessage="No invites yet."
          className="shadow-card border border-border"
        />
      </div>
    </div>
  );
};

export default InvitedListPage;
