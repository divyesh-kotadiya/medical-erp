'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { enqueueSnackbar } from 'notistack';
import { fetchMyInvites, acceptInvite, rejectInvite } from '@/store/slices/invite';

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

  if (loading) return <div className="p-4 text-center">Loading invites...</div>;

  return (
    <div className="p-6 bg-background min-h-screen">
      <Card className="w-full max-w-5xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>My Invites</CardTitle>
        </CardHeader>
        <CardContent>
          {myInvites.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">No invites yet.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ORGANIZATION NAME</TableHead>
                    <TableHead>EMAIL</TableHead>
                    <TableHead>ROLE</TableHead>
                    <TableHead>SENT AT</TableHead>
                    <TableHead className="text-right">STATUS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myInvites.map((invite) => (
                    <TableRow key={invite.token}>
                      <TableCell>{invite?.tenantId?.name || invite.organizationName}</TableCell>
                      <TableCell>{invite.email}</TableCell>
                      <TableCell>{invite.role}</TableCell>
                      <TableCell>{new Date(invite.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="text-right flex gap-2 justify-end">
                        {invite.status === "ACCEPTED" ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            ACCEPTED
                          </span>
                        ) : invite.status === "REJECTED" ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            REJECTED
                          </span>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              disabled={processingToken === invite.token}
                              onClick={() => handleAccept(invite.token)}
                            >
                              {processingToken === invite.token ? 'Processing...' : 'Accept'}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={processingToken === invite.token}
                              onClick={() => handleReject(invite.token)}
                            >
                              {processingToken === invite.token ? 'Processing...' : 'Reject'}
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 text-sm">
                  <Button
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((prev) => prev - 1)}
                  >
                    Previous
                  </Button>
                  <span>
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitedListPage;
