'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Upload, Download, Trash2, FileText, AlertTriangle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addAttachment,
  deleteAttachment,
  downloadAttachment,
  fetchIncidentById,
  selectIncidentsError,
  selectIncidentsLoading,
  selectSelectedIncident,
} from '@/store/slices/incidents';
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

      await dispatch(
        addAttachment({
          id: incident._id,
          file: formData,
        }),
      ).unwrap();

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
        }),
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
      dispatch(
        deleteAttachment({
          incidentId: incident._id,
          attachmentId: deleteTarget,
        }),
      );
    }
    setDeleteTarget(null);
  };

  if (loading && !incident) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !incident) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 flex items-center justify-center">
        <div className="bg-card rounded-xl shadow-card p-8 max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">Error loading incident</h3>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => router.push('/incidents')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
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
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 flex items-center justify-center">
        <div className="bg-card rounded-xl shadow-card p-8 max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-muted">
              <AlertTriangle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">Incident not found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The incident you're looking for doesn't exist.
            </p>
            <button
              onClick={() => router.push('/incidents')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
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
          <div className="bg-card rounded-xl shadow-card p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Attachments</h1>
                <p className="text-muted-foreground mt-1">ID: {incident._id}</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-destructive/10 border-l-4 border-destructive p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-destructive"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-card rounded-xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6 pb-2 border-b border-border">
            Manage Attachments
          </h2>
          <div className="mb-8 p-4 bg-muted/50 rounded-lg border border-border">
            <h3 className="text-md font-medium text-foreground mb-4">Upload New Attachment</h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <label
                htmlFor="file-upload"
                className="flex-shrink-0 flex items-center px-4 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-background hover:bg-muted cursor-pointer transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                Select File
              </label>
              <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} />

              {file && (
                <div className="flex-grow flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="text-sm text-muted-foreground truncate">{file.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUploadAttachment}
                      disabled={uploading}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
                    >
                      {uploading ? 'Uploading...' : 'Upload File'}
                    </button>
                    <button
                      onClick={() => setFile(null)}
                      className="inline-flex items-center px-3 py-2 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            {!file && <p className="text-xs text-muted-foreground mt-2">Supported formats: .csv</p>}
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
            <h3 className="text-md font-medium text-foreground mb-4">Attached Files</h3>
            {incident.attachments && incident.attachments.length > 0 ? (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-3 border-b border-border hidden md:grid grid-cols-12">
                  <div className="col-span-6 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    File Name
                  </div>
                  <div className="col-span-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </div>
                  <div className="col-span-2 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
                    Actions
                  </div>
                </div>
                <ul className="divide-y divide-border">
                  {incident.attachments.map((attachment: Attachment) => (
                    <li
                      key={attachment._id}
                      className="px-4 py-4 flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="md:col-span-6 flex items-center">
                        <FileText className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
                        <span className="text-sm font-medium text-foreground truncate">
                          {attachment.name}
                        </span>
                      </div>
                      <div className="md:col-span-4 flex items-center">
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                          {attachment.name.split('.').pop()?.toUpperCase() || 'FILE'}
                        </span>
                      </div>
                      <div className="md:col-span-2 flex justify-end space-x-2">
                        <button
                          onClick={() => handleDownloadAttachment(attachment)}
                          className="text-primary hover:text-primary/80 p-1 rounded-md hover:bg-primary/10 transition-colors"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(attachment._id)}
                          className="text-destructive hover:text-destructive/80 p-1 rounded-md hover:bg-destructive/10 transition-colors"
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
              <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-sm font-medium text-foreground">No attachments</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get started by uploading a new file.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
