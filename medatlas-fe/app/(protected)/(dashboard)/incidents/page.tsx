'use client';
import { useState, useEffect } from 'react';
import {
  X,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import CustomDropdown from '@/components/layout/Dropdown/Dropdown';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchIncidents,
  selectIncidents,
  selectIncidentsError,
  selectIncidentsLoading,
  selectIncidentsPagination,
  clearError,
} from '@/store/slices/incidents';
import { IncidentStatus, IncidentType, WorkflowStep } from '@/constants/Incidents';
import Button from '@/components/layout/Button/Button';
import Table from '@/components/common/Table';

export default function IncidentsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const incidents = useAppSelector(selectIncidents);
  const loading = useAppSelector(selectIncidentsLoading);
  const error = useAppSelector(selectIncidentsError);
  const pagination = useAppSelector(selectIncidentsPagination);
  const { currentOrganization } = useAppSelector((state) => state.organizations);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  const [tempStatus, setTempStatus] = useState('');
  const [tempStep, setTempStep] = useState('');
  const [tempType, setTempType] = useState('');

  const [statusFilter, setStatusFilter] = useState('');
  const [stepFilter, setStepFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const hasActiveFilters = statusFilter || stepFilter || typeFilter;

  useEffect(() => {
    if (currentOrganization?.id) {
      dispatch(
        fetchIncidents({
          tenantId: currentOrganization.id,
          status: statusFilter || undefined,
          step: stepFilter || undefined,
          incidentType: typeFilter || undefined,
          page,
          limit,
        }),
      );
    }
  }, [currentOrganization, statusFilter, stepFilter, typeFilter, page, limit, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const clearAllFilters = () => {
    setStatusFilter('');
    setStepFilter('');
    setTypeFilter('');
    setTempStatus('');
    setTempStep('');
    setTempType('');
    setPage(1);
  };

  const applyFilters = () => {
    if (pagination.total === 0) return;
    setStatusFilter(tempStatus);
    setStepFilter(tempStep);
    setTypeFilter(tempType);
    setPage(1);
    setShowFilters(false);
  };

  const handleRowClick = (id: string) => {
    router.push(`/incidents/${id}`);
  };

  const getStatusBadge = (status: IncidentStatus) => {
    let badgeClass = '';

    switch (status) {
      case IncidentStatus.OPEN:
        badgeClass = 'bg-destructive/10 text-destructive';
        break;
      case IncidentStatus.IN_REVIEW:
        badgeClass = 'bg-warning/10 text-warning';
        break;
      case IncidentStatus.IN_PROGRESS:
        badgeClass = 'bg-primary/10 text-primary';
        break;
      case IncidentStatus.RESOLVED:
        badgeClass = 'bg-success/10 text-success';
        break;
      default:
        badgeClass = 'bg-muted text-muted-foreground';
    }

    return (
      <span
        className={`px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full ${badgeClass}`}
      >
        {getStatusIcon(status)}
        <span className="ml-1">{status}</span>
      </span>
    );
  };

  const getStatusIcon = (status: IncidentStatus) => {
    switch (status) {
      case IncidentStatus.OPEN:
        return <AlertCircle className="h-4 w-4" />;
      case IncidentStatus.IN_REVIEW:
      case IncidentStatus.IN_PROGRESS:
        return <Clock className="h-4 w-4" />;
      case IncidentStatus.RESOLVED:
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: IncidentType) => {
    let badgeClass = '';

    switch (type) {
      case IncidentType.UNAUTHORIZED_ACCESS:
        badgeClass = 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
        break;
      case IncidentType.DATA_LOSS:
        badgeClass = 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
        break;
      case IncidentType.IMPROPER_DISCLOSURE:
        badgeClass = 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
        break;
      default:
        badgeClass = 'bg-muted text-muted-foreground';
    }

    return (
      <span
        className={`px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full ${badgeClass}`}
      >
        {getTypeIcon(type)}
        <span className="ml-1">{type}</span>
      </span>
    );
  };

  const getTypeIcon = (type: IncidentType) => {
    switch (type) {
      case IncidentType.UNAUTHORIZED_ACCESS:
        return <AlertCircle className="h-4 w-4" />;
      case IncidentType.DATA_LOSS:
      case IncidentType.IMPROPER_DISCLOSURE:
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Incident',
      render: (value: any, row: any) => (
        <div>
          <div className="font-medium text-foreground">{value}</div>
          <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {row.description?.substring(0, 80)}
            {row.description && row.description.length > 80 ? '...' : ''}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: any, row: any) => getStatusBadge(value as IncidentStatus),
    },
    {
      key: 'currentStep',
      label: 'Current Step',
    },
    {
      key: 'incidentType',
      label: 'Type',
      render: (value: any, row: any) => getTypeBadge(value as IncidentType),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value: any, row: any) => (
        <span className="text-sm text-muted-foreground">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-[100vh] bg-background">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Incident Management</h1>
            <p className="text-muted-foreground mt-2">Track and manage security incidents</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {hasActiveFilters && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm border border-primary/20">
                <span>Filters applied</span>
                <button
                  onClick={clearAllFilters}
                  className="ml-1 hover:text-primary flex items-center"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {showFilters ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-destructive/10 border-l-4 border-destructive p-4 rounded-lg shadow-sm">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {showFilters && (
          <div className="bg-card rounded-xl shadow-card border border-border p-6 mb-8 transition-all duration-300 ease-in-out">
            <h3 className="text-lg font-medium text-foreground mb-4">Filter Incidents</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CustomDropdown
                label="Status"
                options={Object.values(IncidentStatus).map((s) => ({ label: s, value: s }))}
                value={tempStatus}
                onChange={setTempStatus}
                placeholder="All Statuses"
              />
              <CustomDropdown
                label="Current Step"
                options={Object.values(WorkflowStep).map((s) => ({ label: s, value: s }))}
                value={tempStep}
                onChange={setTempStep}
                placeholder="All Steps"
              />
              <CustomDropdown
                label="Incident Type"
                options={Object.values(IncidentType).map((s) => ({ label: s, value: s }))}
                value={tempType}
                onChange={setTempType}
                placeholder="All Types"
              />
            </div>
            <div className="mt-6 pt-4 border-t border-border flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowFilters(false)}>
                Cancel
              </Button>
              <Button onClick={applyFilters}>Apply Filters</Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
            <div className="animate-pulse">
              <div className="h-12 bg-muted/50"></div>
              {[...Array(limit)].map((_, i) => (
                <div key={i} className="h-16 border-b border-border"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-xl shadow-card border border-border overflow-hidden">
            <Table
              columns={columns}
              data={incidents}
              loading={loading}
              error={error}
              pagination={{
                currentPage: page,
                totalPages: pagination.totalPages,
                onPageChange: setPage,
                itemsPerPage: limit,
                totalItems: pagination.total,
              }}
              onRowClick={(row) => handleRowClick(row._id)}
              keyExtractor={(row) => row._id}
              emptyMessage={
                <div className="flex flex-col items-center justify-center py-12">
                  <Filter className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No incidents found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try adjusting your filters or create a new incident
                  </p>
                </div>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
