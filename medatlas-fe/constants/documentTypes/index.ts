export enum DocumentFileType {
  PDF = 'pdf',
  DOC = 'doc',
  DOCX = 'docx',
  JPG = 'jpg',
  JPEG = 'jpeg',
  PNG = 'png',
}

export const ALLOWED_FILE_TYPES: DocumentFileType[] = [
  DocumentFileType.PDF,
  DocumentFileType.DOC,
  DocumentFileType.DOCX,
  DocumentFileType.JPG,
  DocumentFileType.JPEG,
  DocumentFileType.PNG,
];

export enum DocumentCategory {
  LAB_RESULTS = 'Lab_Results',
  IMAGING = 'Imaging',
  CONSULTATION_NOTES = 'Consultation_Notes',
  PRESCRIPTIONS = 'Prescriptions',
}

export type DocumentCategoryType =
  | 'Lab_Results'
  | 'Imaging'
  | 'Consultation_Notes'
  | 'Prescriptions';

export const ALLOWED_CATEGORIES: DocumentCategoryType[] = [
  'Lab_Results',
  'Imaging',
  'Consultation_Notes',
  'Prescriptions',
];


export interface Document {
  _id: string;
  filename: string;
  fileType: DocumentFileType | 'unknown';
  category: DocumentCategoryType;
  patient?: string;
  uploader: string;
  size: number;
  createdAt: string;
  tags?: string[];
  priority?: 'high' | 'medium' | 'low';
}
