export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: ValidationError[];
  timestamp: Date;
}
