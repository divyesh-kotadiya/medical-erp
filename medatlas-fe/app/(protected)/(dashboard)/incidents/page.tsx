"use client";
import { useState, useEffect } from "react";
import { X, Filter, AlertCircle, CheckCircle, Clock, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import CustomDropdown from "@/components/layout/Dropdown/Dropdown";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchIncidents,
  selectIncidents,
  selectIncidentsError,
  selectIncidentsLoading,
  selectIncidentsPagination,
  clearError,
} from "@/store/slices/incidents";
import { IncidentStatus, IncidentType, WorkflowStep } from "@/constants/Incidents";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import TableSkeleton from "@/components/ui/TableSkeleton";

export default function IncidentsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const incidents = useAppSelector(selectIncidents);
  const loading = useAppSelector(selectIncidentsLoading);
  const error = useAppSelector(selectIncidentsError);
  const pagination = useAppSelector(selectIncidentsPagination);
  const { tenant } = useAppSelector((state) => state.auth);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  const [tempStatus, setTempStatus] = useState("");
  const [tempStep, setTempStep] = useState("");
  const [tempType, setTempType] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [stepFilter, setStepFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const hasActiveFilters = statusFilter || stepFilter || typeFilter;

  useEffect(() => {
    if (tenant?.id) {
      dispatch(
        fetchIncidents({
          tenantId: tenant.id,
          status: statusFilter || undefined,
          step: stepFilter || undefined,
          incidentType: typeFilter || undefined,
          page,
          limit,
        })
      );
    }
  }, [tenant, statusFilter, stepFilter, typeFilter, page, limit, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const clearAllFilters = () => {
    setStatusFilter("");
    setStepFilter("");
    setTypeFilter("");
    setTempStatus("");
    setTempStep("");
    setTempType("");
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

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case IncidentStatus.OPEN:
        return "bg-red-100 text-red-800";
      case IncidentStatus.IN_REVIEW:
        return "bg-yellow-100 text-yellow-800";
      case IncidentStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-800";
      case IncidentStatus.RESOLVED:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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

  const getTypeColor = (type: IncidentType) => {
    switch (type) {
      case IncidentType.UNAUTHORIZED_ACCESS:
        return "bg-purple-100 text-purple-800";
      case IncidentType.DATA_LOSS:
        return "bg-orange-100 text-orange-800";
      case IncidentType.IMPROPER_DISCLOSURE:
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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

  return (
    <div className="min-h-[100vh] shadow-inner rounded-md">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Incident Management</h1>
            <p className="text-gray-600 mt-2">Track and manage security incidents</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {hasActiveFilters && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-100">
                <span>Filters applied</span>
                <button onClick={clearAllFilters} className="ml-1 hover:text-blue-900 flex items-center">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-700">Filters</span>
              {showFilters ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 transition-all duration-300 ease-in-out">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Incidents</h3>
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
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <TableSkeleton rows={limit} cols={5} />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <Table
                pagination={{
                  page,
                  totalPages: pagination.totalPages,
                  setPage,
                }}
              >
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-900 py-4">Incident</TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    <TableHead className="font-semibold text-gray-900">Current Step</TableHead>
                    <TableHead className="font-semibold text-gray-900">Type</TableHead>
                    <TableHead className="font-semibold text-gray-900">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.length > 0 ? (
                    incidents.map((incident) => (
                      <TableRow
                        key={incident._id}
                        className="hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleRowClick(incident._id)}
                        onMouseEnter={() => router.prefetch(`/incidents/${incident._id}`)}
                      >
                        <TableCell className="py-4">
                          <div className="font-medium text-gray-900">{incident.title}</div>
                          <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {incident.description?.substring(0, 80)}
                            {incident.description && incident.description.length > 80 ? "..." : ""}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full ${getStatusColor(
                              incident.status as IncidentStatus
                            )}`}
                          >
                            {getStatusIcon(incident.status as IncidentStatus)}
                            <span className="ml-1">{incident.status}</span>
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">{incident.currentStep}</TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full ${getTypeColor(
                              incident.incidentType as IncidentType
                            )}`}
                          >
                            {getTypeIcon(incident.incidentType as IncidentType)}
                            <span className="ml-1">{incident.incidentType}</span>
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(incident.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <Filter className="h-12 w-12 text-gray-300 mb-4" />
                          <p className="text-lg font-medium text-gray-400">No incidents found</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Try adjusting your filters or create a new incident
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
