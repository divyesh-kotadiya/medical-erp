'use client';
import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import Loader from '@/components/Loading';
import { fetchInvites } from '@/store/slices/invite';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { enqueueSnackbar } from 'notistack';

export default function InviteListDialog() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 5;

  const dispatch = useAppDispatch();
  const { currentOrganization } = useAppSelector((state) => state.organizations);
  const { invites, loading, error, totalPages, total } = useAppSelector((state) => state.invite);

  useEffect(() => {
    if (currentOrganization?.id) {
      dispatch(fetchInvites({ page, limit }));
    }
  }, [dispatch, currentOrganization, page]);

  useEffect(() => {
    if (error) {
      const message = typeof error === 'string' ? error : error?.message || 'Something went wrong';
      enqueueSnackbar(message, { variant: 'error' });
    }
  }, [error]);

  const handleClose = () => {
    setOpen(false);
    setPage(1);
  };

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-primary-foreground bg-gradient-primary transition"
      >
        <Users className="h-4 w-4" />
        View Invited Members
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
          <div className="w-full max-w-5xl rounded-xl bg-card p-6 shadow-elevated border border-border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-foreground">Invited Members</h2>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <p className="mb-4 text-sm text-muted-foreground">Total Invites: {total || 0}</p>

            <div className="overflow-x-auto rounded-lg border border-border shadow-card">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-foreground">Email</th>
                    <th className="px-4 py-2 text-left font-medium text-foreground">Role</th>
                    <th className="px-4 py-2 text-left font-medium text-foreground">Tenant</th>
                    <th className="px-4 py-2 text-left font-medium text-foreground">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center">
                        <Loader />
                      </td>
                    </tr>
                  ) : invites?.length ? (
                    invites.map((invite) => (
                      <tr key={invite._id || invite.token} className="hover:bg-muted/50">
                        <td className="px-4 py-2 text-foreground">{invite.email}</td>
                        <td className="px-4 py-2 text-foreground">{invite.role}</td>
                        <td className="px-4 py-2 text-foreground">{invite.tenantId.name || '-'}</td>
                        <td className="px-4 py-2">
                          {(() => {
                            let bgClass = '';
                            let text = '';

                            switch (invite.status) {
                              case 'ACCEPTED':
                                bgClass = 'bg-success/10 text-success';
                                text = 'Accepted';
                                break;
                              case 'REJECTED':
                                bgClass = 'bg-destructive/10 text-destructive';
                                text = 'Rejected';
                                break;
                              default:
                                bgClass = 'bg-warning/10 text-warning';
                                text = 'PENDING';
                                break;
                            }

                            return (
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${bgClass}`}
                              >
                                {text}
                              </span>
                            );
                          })()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                        No invites found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 text-sm">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                  className={`px-3 py-1 rounded-lg border ${page === 1 ? 'text-muted-foreground border-border cursor-not-allowed' : 'hover:bg-muted text-foreground'}`}
                >
                  Previous
                </button>
                <span className="text-foreground">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                  className={`px-3 py-1 rounded-lg border ${page === totalPages ? 'text-muted-foreground border-border cursor-not-allowed' : 'hover:bg-muted text-foreground'}`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
