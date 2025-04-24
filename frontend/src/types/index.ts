export interface Form {
  id: string;
  title: string;
  description?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  fields?: Array<any>;
}

export interface Submission {
  id: string;
  formId: string;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  form?: {
    id: string;
    title: string;
    published: boolean;
  };
} 