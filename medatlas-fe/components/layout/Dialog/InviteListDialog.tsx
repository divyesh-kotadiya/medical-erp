'use client';
import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import Loader from '@/components/loader';
import { fetchInvites } from '@/store/slices/invite';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { enqueueSnackbar } from 'notistack';

export default function InviteListDialog() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 5;
  const dispatch = useAppDispatch();

  const { invites, loading, error, totalPages, total } = useAppSelector((state) => state.invite);

  useEffect(() => {
    if (open) {
      dispatch(fetchInvites({ page, limit }));
    }
  }, [open, page, dispatch]);

  const handleClose = () => {
    setOpen(false);
    setPage(1);
  }
  useEffect(() => {
    if (error) {
      const message =
        typeof error === "string"
          ? error
          : error?.message;

      enqueueSnackbar(message, { variant: "error" });
    }
  }, [error]);
  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm text-white bg-gradient-primary transition"
      >
        <Users className="h-4 w-4" />
        View Invited Members
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-5xl rounded-xl bg-white p-6 shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Invited Members</h2>
              <button onClick={handleClose} className="text-gray-500 hover:text-gray-800">✕</button>
            </div>

            <p className="mb-4 text-sm text-gray-600">Total Invites: {total}</p>
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Email</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Role</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Invitation At</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Invitation Expires At</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center">
                        <Loader />
                      </td>
                    </tr>
                  ) : invites?.length ? (
                    invites?.map((invite) => (
                      <tr key={invite._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{invite.email}</td>
                        <td className="px-4 py-2">{invite.role}</td>
                        <td className="px-4 py-2">{new Date(invite.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-2">{new Date(invite.expiresAt).toLocaleString()}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${invite.accepted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {invite.accepted ? 'Accepted' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                        No invites found.
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
            <div className="flex items-center justify-between mt-4 text-sm">
              <button disabled={page === 1} onClick={() => setPage(prev => prev - 1)} className={`px-3 py-1 rounded-lg border ${page === 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'hover:bg-gray-100'}`}>
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(prev => prev + 1)} className={`px-3 py-1 rounded-lg border ${page === totalPages ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'hover:bg-gray-100'}`}>
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
