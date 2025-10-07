export interface PikPakTask {
  id: string;
  kind: string;
  name: string;
  file_size: string;
  phase: 'PHASE_TYPE_COMPLETE' | 'PHASE_TYPE_RUNNING' | 'PHASE_TYPE_ERROR' | 'PHASE_TYPE_PENDING';
  params: {
    url: string;
  };
  progress: number;
  message: string;
  created_time: string;
  file_id?: string;
  file_name?: string;
}

// Frontend-specific Task type, extending the API response
export interface Task extends PikPakTask {
  isFetchingLink?: boolean;
  downloadUrl?: string;
}
