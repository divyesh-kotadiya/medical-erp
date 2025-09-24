'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Upload,
  Download,
  Trash2,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addAttachment, deleteAttachment, downloadAttachment, fetchIncidentById, selectIncidentsError, selectIncidentsLoading, selectSelectedIncident } from '@/store/slices/incidents';
import { clearError } from '@/store/slices/timesheets';
import { Attachment } from '@/constants/Incidents';
import CenteredModal from '@/components/layout/Modal/Modal';

export default function AttachmentsPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const incident = useAppSelector(selectSelectedIncident);
  const loading = useAppSelector(selectIncidentsLoading);
  const error = useAppSelector(selectIncidentsError);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    const incidentId = params.id as string;
    if (incidentId) {
      dispatch(fetchIncidentById(incidentId));
    }
  }, [params.id, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  const handleDeleteClick = (attachmentId: string) => {
    setDeleteTarget(attachmentId);
  };


  const handleUploadAttachment = async () => {
    if (!file || !incident) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      await dispatch(addAttachment({
        id: incident._id,
        file: formData
      })).unwrap();

      setFile(null);

      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Failed to upload attachment:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadAttachment = async (attachment: Attachment) => {
    if (!incident) return;

    try {
      const resultAction = await dispatch(
        downloadAttachment({
          incidentId: incident._id,
          attachmentId: attachment._id,
        })
      );

      if (downloadAttachment.fulfilled.match(resultAction)) {
        const blob = resultAction.payload as Blob;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = attachment.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Download failed:', resultAction.payload);
      }
    } catch (error) {
      console.error('Unexpected error downloading timesheet:', error);
    }
  };

  const confirmDelete = () => {
    if (incident && deleteTarget) {
      dispatch(deleteAttachment({
        incidentId: incident._id,
        attachmentId: deleteTarget,
      }));
    }
    setDeleteTarget(null); // close modal after action
  };


  if (loading && !incident) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !incident) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Error loading incident</h3>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
            <button
              onClick={() => router.push('/incidents')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Back to Incidents
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
              <AlertTriangle className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Incident not found</h3>
            <p className="mt-2 text-sm text-gray-500">The incident you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/incidents')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Back to Incidents
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Attachments</h1>
                <p className="text-gray-600 mt-1">ID: {incident._id}</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">Manage Attachments</h2>
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-md font-medium text-gray-900 mb-4">Upload New Attachment</h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <label
                htmlFor="file-upload"
                className="flex-shrink-0 flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                Select File
              </label>
              <input
                id="file-upload"
                type="file"
                className="sr-only"
                onChange={handleFileChange}
              />

              {file && (
                <div className="flex-grow flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="text-sm text-gray-600 truncate">{file.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUploadAttachment}
                      disabled={uploading}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                    >
                      {uploading ? 'Uploading...' : 'Upload File'}
                    </button>
                    <button
                      onClick={() => setFile(null)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            {!file && (
              <p className="text-xs text-gray-500 mt-2">Supported formats: .csv</p>
            )}
          </div>
          <CenteredModal
            isOpen={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            message="Are you sure you want to delete this attachment?"
            buttonText="Yes, Delete"
            onButtonClick={confirmDelete}
            BtnVariants="danger"
          />

          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">Attached Files</h3>
            {incident.attachments && incident.attachments.length > 0 ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 hidden md:grid grid-cols-12">
                  <div className="col-span-6 text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</div>
                  <div className="col-span-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</div>
                  <div className="col-span-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</div>
                </div>
                <ul className="divide-y divide-gray-200">
                  {incident.attachments.map((attachment: Attachment) => (
                    <li key={attachment._id} className="px-4 py-4 flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 hover:bg-gray-50 transition-colors">
                      <div className="md:col-span-6 flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900 truncate">{attachment.name}</span>
                      </div>
                      <div className="md:col-span-4 flex items-center">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {attachment.name.split('.').pop()?.toUpperCase() || 'FILE'}
                        </span>
                      </div>
                      <div className="md:col-span-2 flex justify-end space-x-2">
                        <button
                          onClick={() => handleDownloadAttachment(attachment)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(attachment._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-sm font-medium text-gray-900">No attachments</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by uploading a new file.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}