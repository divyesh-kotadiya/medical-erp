'use client';

import CustomDropdown from '@/components/layout/Dropdown/Dropdown';
import {
  FileText,
  Search,
  File,
  X,
  Calendar,
  User,
  HardDrive,
  Tag,
  Download,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  Trash2,
  FileImage,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  deleteDocument,
  downloadDocument,
  fetchDocuments,
  uploadDocument,
} from '@/store/slices/documents';
import { DocumentCategory, DocumentCategoryType, Document } from '@/constants/documentTypes';
import Image from 'next/image';

function Tooltip({ text }: { text: string }) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!tooltipRef.current) return;
    if (visible) {
      gsap.fromTo(
        tooltipRef.current,
        { opacity: 0, y: 10, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power3.out' }
      );
    } else {
      gsap.to(tooltipRef.current, {
        opacity: 0,
        y: 10,
        scale: 0.95,
        duration: 0.2,
        ease: 'power3.in',
      });
    }
  }, [visible]);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span className="cursor-pointer">
        {text.length > 10 ? text.slice(0, 10) + '…' : text}
      </span>
      {visible && text.length > 10 && (
        <div
          ref={tooltipRef}
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-foreground text-background text-xs rounded-lg px-3 py-1 shadow-lg whitespace-nowrap z-20"
        >
          {text}
        </div>
      )}
    </div>
  );
}

export default function DocumentsPage() {
  const dispatch = useAppDispatch();
  const { items: documents, loading, error, page, totalPages } = useAppSelector(
    (state) => state.documents
  );
  const [limit] = useState(13);

  const { currentOrganization } = useAppSelector((state) => state.organizations);
  const { user } = useAppSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [filterCategory, setFilterCategory] = useState<'All Categories' | DocumentCategoryType>('All Categories');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'create'>('view');
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | 'doc' | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');

  const sidebarRef = useRef<HTMLDivElement>(null);
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  const previewRef = useRef<HTMLImageElement>(null);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (!currentOrganization?.id) return;
    const categoryParam = filterCategory === 'All Categories' ? null : filterCategory;
    dispatch(
      fetchDocuments({
        tenantId: currentOrganization.id,
        page,
        limit,
        category: categoryParam,
      })
    );
  }, [dispatch, currentOrganization, filterCategory, page, limit]);

  const handlePrevPage = () => {
    if (page > 1) {
      dispatch(
        fetchDocuments({
          tenantId: currentOrganization?.id!,
          page: page - 1,
          limit,
          category: filterCategory === 'All Categories' ? undefined : filterCategory,
        })
      );
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      dispatch(
        fetchDocuments({
          tenantId: currentOrganization?.id!,
          page: page + 1,
          limit,
          category: filterCategory === 'All Categories' ? undefined : filterCategory,
        })
      );
    }
  };

  useEffect(() => {
    if (sidebarOpen) {
      gsap.fromTo(
        sidebarRef.current,
        { x: '100%', opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }
      );
    }
  }, [sidebarOpen]);

  useEffect(() => {
    if (tableBodyRef.current) {
      gsap.fromTo(
        tableBodyRef.current.querySelectorAll('tr'),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05 }
      );
    }
  }, [documents, searchTerm, filterCategory]);

  useEffect(() => {
    if (previewType === 'image' && previewSrc && previewRef.current) {
      gsap.fromTo(
        previewRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, [previewSrc, previewType]);

  const categoryOptions = [
    { label: 'Prescriptions', value: DocumentCategory.PRESCRIPTIONS },
    { label: 'Lab Results', value: DocumentCategory.LAB_RESULTS },
    { label: 'Imaging', value: DocumentCategory.IMAGING },
    { label: 'Consultation Notes', value: DocumentCategory.CONSULTATION_NOTES },
  ];

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.patient && doc.patient.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      filterCategory === 'All Categories' || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    return +new Date(b.createdAt) - +new Date(a.createdAt);
  });

  const handleDelete = (doc: Document) => {
    dispatch(deleteDocument(doc._id));
    if (selectedDocument?._id === doc._id) {
      setSelectedDocument(null);
      setSidebarOpen(false);
    }
  };

  const handleFileChange = (file?: File) => {
    if (!file) return;
    setUploadedFileName(file.name);
    if (file.type.startsWith('image/')) {
      setPreviewType('image');
      const reader = new FileReader();
      reader.onload = () => setPreviewSrc(reader.result as string);
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      setPreviewType('pdf');
      setPreviewSrc(null);
    } else if (file.type.includes('word')) {
      setPreviewType('doc');
      setPreviewSrc(null);
    } else {
      setPreviewType(null);
      setPreviewSrc(null);
    }
  };

  const onSubmit = (data: any) => {
    const file = data.file?.[0];
    if (!file || !currentOrganization?.id || !user?.id) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tenantId', currentOrganization.id);
    formData.append('createdBy', user.id);
    formData.append('category', filterCategory as string);
    dispatch(uploadDocument(formData))
      .unwrap()
      .then(() => {
        reset();
        setPreviewSrc(null);
        setPreviewType(null);
        setUploadedFileName('');
        setSidebarOpen(false);
      });
  };

  const handleDownload = (doc: Document) => {
    dispatch(downloadDocument(doc._id));
  };

  const openCreateSidebar = () => {
    setSidebarMode('create');
    setSidebarOpen(true);
    setSelectedDocument(null);
  };

  const openViewSidebar = (doc: Document) => {
    setSelectedDocument(doc);
    setSidebarOpen(true);
    setSidebarMode('view');
  };

  return (
    <div className="min-h-screen  p-4 md:p-8">
      <div className="max-w-[90vw] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Document Management</h1>
          <p className="text-muted-foreground">Manage and organize all your documents in one place</p>
        </div>

        <div className="bg-card rounded-xl shadow-card p-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1 w-full">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search documents..."
                className="w-full pl-10 pr-4 py-2.5 border border-input rounded-lg outline-none focus:ring-2 focus:ring-primary transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="relative">
              <CustomDropdown
                buttonClassName="flex items-center gap-2 py-2.5 px-4 bg-background border border-input rounded-lg hover:bg-secondary transition text-foreground"
                value={filterCategory}
                options={[{ label: 'All Categories', value: 'All Categories' }, ...categoryOptions]}
                onChange={(val: string) => setFilterCategory(val as DocumentCategoryType | 'All Categories')}>
                <Filter className="h-4 w-4" />
                <span>Category</span>
              </CustomDropdown>
            </div>
            
            <button
              onClick={openCreateSidebar}
              className="flex items-center gap-2 py-2.5 px-4 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition shadow-card hover:shadow-elevated"
            >
              <Plus className="h-4 w-4" />
              <span>Create Document</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className={`${sidebarOpen ? 'lg:w-2/3' : 'w-full'} transition-all duration-300`}>
            <div className="bg-card rounded-xl shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Select</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Document</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Username</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Uploaded</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Size</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody ref={tableBodyRef} className="divide-y divide-border">
                    {loading && (
                      <tr>
                        <td colSpan={9} className="text-center py-10">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                          </div>
                          <p className="mt-2 text-muted-foreground">Loading documents...</p>
                        </td>
                      </tr>
                    )}
                    {error && (
                      <tr>
                        <td colSpan={9} className="text-center py-10">
                          <div className="text-danger bg-danger/10 py-3 px-4 rounded-lg inline-block">
                            {error}
                          </div>
                        </td>
                      </tr>
                    )}
                    {sortedDocuments.length === 0 && !loading && !error && (
                      <tr>
                        <td colSpan={9} className="text-center py-10">
                          <div className="text-muted-foreground">
                            <File className="mx-auto h-12 w-12 text-muted-foreground/50" />
                            <p className="mt-2">No documents found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                    {sortedDocuments.map((doc) => (
                      <tr
                        key={doc._id}
                        className="hover:bg-secondary transition cursor-pointer"
                        onClick={() => openViewSidebar(doc)}
                      >
                        <td className="px-4 py-3">
                          <input type="checkbox" className="h-4 w-4 text-primary rounded focus:ring-primary" />
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          <Tooltip text={doc.filename} />
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          <Tooltip text={doc?.createdBy?.name || ''} />
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          <Tooltip text={doc?.createdBy?.email || ''} />
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {doc?.fileType || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {doc.size ? `${(doc.size / (1024 * 1024)).toFixed(2)} MB` : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent dark:text-white">
                            {doc.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(doc);
                              }}
                              className="text-success hover:text-success/80"
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(doc);
                              }}
                              className="text-danger hover:text-danger-hover"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex items-center justify-between border-t border-border bg-card px-4 py-3 sm:px-6">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className={`relative inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary ${
                      page === 1 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    className={`relative ml-3 inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary ${
                      page === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(page * limit, documents.length)}
                      </span>{' '}
                      of <span className="font-medium">{documents.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-card" aria-label="Pagination">
                      <button
                        onClick={handlePrevPage}
                        disabled={page === 1}
                        className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-muted-foreground ring-1 ring-inset ring-border hover:bg-secondary focus:z-20 focus:outline-offset-0 ${
                          page === 1 ? 'cursor-not-allowed opacity-50' : ''
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-foreground ring-1 ring-inset ring-border hover:bg-secondary focus:outline-offset-0">
                        Page {page} of {totalPages || 1}
                      </span>
                      <button
                        onClick={handleNextPage}
                        disabled={page === totalPages}
                        className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-muted-foreground ring-1 ring-inset ring-border hover:bg-secondary focus:z-20 focus:outline-offset-0 ${
                          page === totalPages ? 'cursor-not-allowed opacity-50' : ''
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {sidebarOpen && (
            <div
              ref={sidebarRef}
              className="lg:w-1/3 bg-card rounded-xl shadow-elevated border border-border flex flex-col overflow-hidden"
            >
              <div className="bg-gradient-primary p-5 text-primary-foreground dark:text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">
                    {sidebarMode === 'view' ? 'Document Details' : 'Create Document'}
                  </h2>
                  <button
                    onClick={() =>
                      gsap.to(sidebarRef.current, {
                        x: '100%',
                        opacity: 0,
                        duration: 0.3,
                        onComplete: () => setSidebarOpen(false),
                      })
                    }
                    className="p-2 rounded-full hover:bg-primary/30 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {sidebarMode === 'view' && selectedDocument ? (
                  <div className="space-y-6">
                    <div className="bg-secondary rounded-xl p-4 border border-border">
                      <div className="flex items-center space-x-4">
                        {selectedDocument.fileType === 'image' ? (
                          <div className="bg-primary/10 p-3 rounded-lg">
                            <FileImage className="h-8 w-8 text-primary" />
                          </div>
                        ) : (
                          <div className="bg-accent/10 p-3 rounded-lg">
                            <FileText className="h-8 w-8 text-accent" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-lg text-foreground">{selectedDocument.filename}</h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedDocument.size ? `${(selectedDocument.size / 1024 / 1024).toFixed(2)} MB` : '—'}
                          </p>
                        </div>
                      </div>

                      {previewType === 'image' && previewSrc && (
                        <div className="border border-border rounded-lg overflow-hidden">
                          <Image
                            ref={previewRef}
                            src={previewSrc}
                            alt={selectedDocument.filename}
                            width={500}
                            height={300}
                            className="w-full h-auto object-contain"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground text-lg border-b border-border pb-2">Document Information</h4>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-background border border-border rounded-lg p-4 shadow-card">
                          <div className="flex items-center space-x-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                              <Calendar className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Uploaded Date</p>
                              <p className="font-medium text-foreground">
                                {new Date(selectedDocument.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-background border border-border rounded-lg p-4 shadow-card">
                          <div className="flex items-center space-x-3">
                            <div className="bg-accent/10 p-2 rounded-lg">
                              <User className="h-5 w-5 text-accent" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Uploaded By</p>
                              <p className="font-medium text-foreground">{selectedDocument?.createdBy?.name || 'Unknown'}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-background border border-border rounded-lg p-4 shadow-card">
                          <div className="flex items-center space-x-3">
                            <div className="bg-success/10 p-2 rounded-lg">
                              <HardDrive className="h-5 w-5 text-success" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">File Type</p>
                              <p className="font-medium text-foreground">{selectedDocument.fileType}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-background border border-border rounded-lg p-4 shadow-card">
                          <div className="flex items-center space-x-3">
                            <div className="bg-warning/10 p-2 rounded-lg">
                              <Tag className="h-5 w-5 text-warning" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Category</p>
                              <p className="font-medium text-foreground">{selectedDocument.category}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <button
                        onClick={() => handleDownload(selectedDocument)}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition shadow-card hover:shadow-elevated flex-1"
                      >
                        <Download className="h-5 w-5" />
                        <span>Download</span>
                      </button>
                      <button
                        onClick={() => handleDelete(selectedDocument)}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-danger text-danger-foreground rounded-lg hover:bg-danger-hover transition shadow-card hover:shadow-elevated flex-1"
                      >
                        <Trash2 className="h-5 w-5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Upload Document
                      </label>
                      <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-secondary hover:bg-secondary/80 transition">
                        <input
                          type="file"
                          className="hidden"
                          id="file-upload"
                          {...register('file', { required: true, onChange: (e) => handleFileChange(e.target.files?.[0]) })}
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          {previewType === 'image' && previewSrc ? (
                            <div className="flex justify-center mb-4">
                              <Image
                                src={previewSrc}
                                alt="Preview"
                                width={200}
                                height={150}
                                className="max-h-40 object-contain rounded-lg border border-border"
                              />
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex justify-center">
                                <div className="bg-primary/10 p-4 rounded-full">
                                  <File className="h-10 w-10 text-primary" />
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium text-primary">Click to upload</span> or drag and drop
                              </div>
                              <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, JPG, PNG up to 10MB</p>
                            </div>
                          )}
                        </label>
                        {uploadedFileName && (
                          <p className="mt-3 text-sm text-muted-foreground bg-background py-2 px-3 rounded-lg inline-block">
                            {uploadedFileName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className='z-0'>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Category
                      </label>
                      <CustomDropdown
                        value={filterCategory}
                        menuClassName="z-999"
                        options={[{ label: 'All Categories', value: 'All Categories' }, ...categoryOptions]}
                        onChange={(val) => setFilterCategory(val as DocumentCategoryType | 'All Categories')}
                        buttonClassName="w-full py-3 text-sm bg-background border border-input rounded-lg hover:bg-secondary transition"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition shadow-card hover:shadow-elevated"
                      >
                        Upload Document
                      </button>
                      <button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        className="px-4 py-3 border border-input rounded-lg hover:bg-secondary transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}