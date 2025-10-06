'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  FileText,
  Workflow,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import CustomDropdown from '@/components/layout/Dropdown/Dropdown';
import {
  fetchIncidentById,
  selectIncidentsError,
  selectIncidentsLoading,
  selectSelectedIncident,
  updateIncidentStatus,
  updateIncidentStep,
} from '@/store/slices/incidents';
import { clearError } from '@/store/slices/timesheets';
import { IncidentStatus, WorkflowStep } from '@/constants/Incidents';

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const incident = useAppSelector(selectSelectedIncident);
  const loading = useAppSelector(selectIncidentsLoading);
  const error = useAppSelector(selectIncidentsError);
  const { user } = useAppSelector((state) => state.auth);

  const [status, setStatus] = useState<IncidentStatus | ''>('');
  const [currentStep, setCurrentStep] = useState<WorkflowStep | ''>('');

  useEffect(() => {
    const incidentId = params.id as string;
    if (incidentId) {
      dispatch(fetchIncidentById(incidentId));
    }
  }, [params.id, dispatch]);

  useEffect(() => {
    if (incident) {
      setStatus(incident.status);
      setCurrentStep(incident.currentStep);
    }
  }, [incident]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleStatusChange = (newStatus: string) => {
    if (!incident) return;
    setStatus(newStatus as IncidentStatus);
    dispatch(
      updateIncidentStatus({
        id: incident._id,
        status: newStatus,
      }),
    );
  };

  const handleStepChange = (newStep: string) => {
    if (!incident) return;
    setCurrentStep(newStep as WorkflowStep);
    dispatch(
      updateIncidentStep({
        id: incident._id,
        step: newStep,
        completedBy: user?.id,
      }),
    );
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case IncidentStatus.OPEN:
        return 'bg-destructive/10 text-destructive border border-destructive/20';
      case IncidentStatus.IN_REVIEW:
        return 'bg-warning/10 text-warning border border-warning/20';
      case IncidentStatus.IN_PROGRESS:
        return 'bg-primary/10 text-primary border border-primary/20';
      case IncidentStatus.RESOLVED:
        return 'bg-success/10 text-success border border-success/20';
      default:
        return 'bg-muted text-muted-foreground border border-border';
    }
  };

  const getStatusIcon = (status: IncidentStatus) => {
    switch (status) {
      case IncidentStatus.OPEN:
        return <AlertTriangle className="h-5 w-5" />;
      case IncidentStatus.IN_REVIEW:
        return <Clock className="h-5 w-5" />;
      case IncidentStatus.IN_PROGRESS:
        return <Clock className="h-5 w-5" />;
      case IncidentStatus.RESOLVED:
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
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
          <div className="flex flex-col md:flex-row md:items-center justify-between bg-card rounded-xl shadow-card p-6">
            <div className="flex items-center mb-4 md:mb-0">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Incident Details</h1>
                <p className="text-muted-foreground mt-1">ID: {incident._id}</p>
              </div>
            </div>
            <div className="flex items-center">
              <span
                className={`px-4 py-2 inline-flex items-center text-sm leading-5 font-semibold rounded-full ${getStatusBadge(incident.status as IncidentStatus)}`}
              >
                {getStatusIcon(incident.status as IncidentStatus)}
                <span className="ml-2">{incident.status}</span>
              </span>
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-card rounded-xl shadow-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
                Incident Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Title</label>
                  <p className="text-foreground font-medium text-lg">{incident.title}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Description
                  </label>
                  <div className="bg-muted/50 p-4 rounded-lg border border-border">
                    <p className="text-foreground whitespace-pre-line">
                      {incident.description || 'No description provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl shadow-card p-6">
              <div className="flex items-center mb-4 pb-2 border-b border-border">
                <Workflow className="h-5 w-5 text-foreground mr-2" />
                <h2 className="text-lg font-semibold text-foreground">Workflow Configuration</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                  <CustomDropdown
                    label=""
                    options={Object.values(IncidentStatus).map((s) => ({
                      label: s as string,
                      value: s as string,
                    }))}
                    value={status}
                    onChange={handleStatusChange}
                    placeholder="Select status"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Current Step
                  </label>
                  <CustomDropdown
                    label=""
                    options={Object.values(WorkflowStep).map((s) => ({
                      label: s as string,
                      value: s as string,
                    }))}
                    value={currentStep}
                    onChange={handleStepChange}
                    placeholder="Select step"
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="text-md font-medium text-foreground mb-3">Workflow Progress</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="text-sm font-medium text-foreground">
                    {Object.values(WorkflowStep).indexOf(incident.currentStep as WorkflowStep) + 1}{' '}
                    of {Object.values(WorkflowStep).length} steps
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${((Object.values(WorkflowStep).indexOf(incident.currentStep as WorkflowStep) + 1) / Object.values(WorkflowStep).length) * 100}%`,
                    }}
                  ></div>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-2">
                  {Object.values(WorkflowStep).map((step, index) => (
                    <div
                      key={step}
                      className={`text-xs text-center p-2 rounded-lg ${
                        index <=
                        Object.values(WorkflowStep).indexOf(incident.currentStep as WorkflowStep)
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-xl shadow-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
                Incident Metadata
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-foreground">Reported By</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {incident.reportedBy || 'Unknown'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-foreground">Created At</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(incident.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-foreground">Updated At</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(incident.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-foreground">Type</p>
                    <p className="text-sm text-muted-foreground mt-1">{incident.incidentType}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl shadow-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
                Current Status
              </h2>
              <div className="flex flex-col items-center py-4">
                <span
                  className={`px-4 py-3 inline-flex items-center text-sm leading-5 font-semibold rounded-lg ${getStatusBadge(incident.status as IncidentStatus)} mb-3`}
                >
                  {getStatusIcon(incident.status as IncidentStatus)}
                  <span className="ml-2">{incident.status}</span>
                </span>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Current Step</p>
                  <p className="text-sm text-muted-foreground mt-1 bg-muted px-3 py-1 rounded-md inline-block">
                    {incident.currentStep}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
