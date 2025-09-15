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
  Workflow
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import CustomDropdown from '@/components/layout/Dropdown/Dropdown';
import { 
  fetchIncidentById, 
  selectIncidentsError, 
  selectIncidentsLoading, 
  selectSelectedIncident, 
  updateIncidentStatus, 
  updateIncidentStep 
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
    dispatch(updateIncidentStatus({
      id: incident._id,
      status: newStatus,
    }));
  };

  const handleStepChange = (newStep: string) => {
    if (!incident) return;
    setCurrentStep(newStep as WorkflowStep);
    dispatch(updateIncidentStep({
      id: incident._id,
      step: newStep,
      completedBy: user?.id,
    }));
  };

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case IncidentStatus.OPEN: return 'bg-red-100 text-red-800 border border-red-200';
      case IncidentStatus.IN_REVIEW: return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case IncidentStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800 border border-blue-200';
      case IncidentStatus.RESOLVED: return 'bg-green-100 text-green-800 border border-green-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusIcon = (status: IncidentStatus) => {
    switch (status) {
      case IncidentStatus.OPEN: return <AlertTriangle className="h-5 w-5" />;
      case IncidentStatus.IN_REVIEW: return <Clock className="h-5 w-5" />;
      case IncidentStatus.IN_PROGRESS: return <Clock className="h-5 w-5" />;
      case IncidentStatus.RESOLVED: return <CheckCircle className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
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
          
          <div className="flex flex-col md:flex-row md:items-center justify-between bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center mb-4 md:mb-0">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Incident Details</h1>
                <p className="text-gray-600 mt-1">ID: {incident._id}</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className={`px-4 py-2 inline-flex items-center text-sm leading-5 font-semibold rounded-full ${getStatusColor(incident.status as IncidentStatus)}`}>
                {getStatusIcon(incident.status as IncidentStatus)}
                <span className="ml-2">{incident.status}</span>
              </span>
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Incident Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <p className="text-gray-900 font-medium text-lg">{incident.title}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-line">{incident.description || 'No description provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                <Workflow className="h-5 w-5 text-gray-700 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Workflow Configuration</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Step</label>
                  <CustomDropdown
                    label=""
                    options={Object.values(WorkflowStep).map((s) => ({ 
                      label: s as string,  
                      value: s as string 
                    }))}
                    value={currentStep}
                    onChange={handleStepChange}
                    placeholder="Select step"
                  />
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-md font-medium text-gray-900 mb-3">Workflow Progress</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-medium text-gray-900">
                    {Object.values(WorkflowStep).indexOf(incident.currentStep as WorkflowStep) + 1} of {Object.values(WorkflowStep).length} steps
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${((Object.values(WorkflowStep).indexOf(incident.currentStep as WorkflowStep) + 1) / Object.values(WorkflowStep).length) * 100}%` }}
                  ></div>
                </div>
                
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {Object.values(WorkflowStep).map((step, index) => (
                    <div 
                      key={step} 
                      className={`text-xs text-center p-2 rounded-lg ${
                        index <= Object.values(WorkflowStep).indexOf(incident.currentStep as WorkflowStep)
                          ? 'bg-primary text-white font-medium'
                          : 'bg-gray-100 text-gray-500'
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
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Incident Metadata</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Reported By</p>
                    <p className="text-sm text-gray-500 mt-1">{incident.reportedBy || 'Unknown'}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Created At</p>
                    <p className="text-sm text-gray-500 mt-1">{new Date(incident.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Updated At</p>
                    <p className="text-sm text-gray-500 mt-1">{new Date(incident.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Type</p>
                    <p className="text-sm text-gray-500 mt-1">{incident.incidentType}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Current Status</h2>
              <div className="flex flex-col items-center py-4">
                <span className={`px-4 py-3 inline-flex items-center text-sm leading-5 font-semibold rounded-lg ${getStatusColor(incident.status as IncidentStatus)} mb-3`}>
                  {getStatusIcon(incident.status as IncidentStatus)}
                  <span className="ml-2">{incident.status}</span>
                </span>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">Current Step</p>
                  <p className="text-sm text-gray-600 mt-1 bg-gray-100 px-3 py-1 rounded-md inline-block">{incident.currentStep}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}