export interface Task {
  task_id: number;
  lead_id: number;
  account_number: string;
  customer_name: string;
  task_type_id: number;
  task_status_type_id: number;
  assigned_to: number;
  target_dtm: string;
  modified_dtm: string;
  status: number;
  company_id?: number;
}

export interface TaskCount {
  count: number;
}

export interface AssociatedUser {
  user_id: number;
  full_name: string;
}

export interface TaskFilter {
  filterType: 'today' | 'escalation';
  bank?: string;
  task_type_id?: number;
  assignee?: number;
} 