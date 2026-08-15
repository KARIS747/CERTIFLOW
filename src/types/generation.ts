export interface GenerationJob {
  id: string;
  projectId: string;
  projectName: string;
  templateName: string;
  totalItems: number;
  completedItems: number;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'cancelled' | 'error';
  currentStudentName?: string;
  generatedFiles: { studentId: string; fileName: string; pdfBlobUrl?: string; pdfBytes?: Uint8Array }[];
  errors: { studentId: string; studentName: string; error: string }[];
  startedAt?: string;
  finishedAt?: string;
}
