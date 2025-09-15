export enum IncidentType {
  UNAUTHORIZED_ACCESS = 'Unauthorized Access',
  DATA_LOSS = 'Data Loss',
  IMPROPER_DISCLOSURE = 'Improper Disclosure',
  OTHER = 'Other',
}

export enum IncidentStatus {
  OPEN = 'OPEN',
  IN_REVIEW = 'IN_REVIEW',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
}

export enum WorkflowStep {
  INITIAL_ASSESSMENT = 'INITIAL_ASSESSMENT',
  RISK_ANALYSIS = 'RISK_ANALYSIS',
  MITIGATION = 'MITIGATION',
  NOTIFICATION = 'NOTIFICATION',
  RESOLUTION = 'RESOLUTION',
}

export interface Attachment {
  _id: string;
  name: string;
  url: string;
}
