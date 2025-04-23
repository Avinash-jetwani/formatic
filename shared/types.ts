export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'SUPER_ADMIN' | 'CLIENT';
  createdAt: Date;
  updatedAt: Date;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  clientId: string;
  slug: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormField {
  id: string;
  formId: string;
  type: 'TEXT' | 'DROPDOWN' | 'CHECKBOX' | 'RADIO' | 'FILE';
  label: string;
  placeholder?: string;
  required: boolean;
  order: number;
  options?: string[];
}

export interface Submission {
  id: string;
  formId: string;
  data: Record<string, any>;
  createdAt: Date;
}
