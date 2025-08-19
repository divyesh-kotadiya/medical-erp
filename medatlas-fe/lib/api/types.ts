/**
 * Success Response for client side API
 */
export interface SuccessResponse<T> {
  success: boolean;
  results: T;
}

/**
 * Error Response for client side API
 */
export interface ErrorResponse {
  isError: boolean;
  statusCode: number;
  message: string;
  results: undefined;
}

/**
 * Client response type
 */
export type ClientResponse<T> = SuccessResponse<T> | ErrorResponse;

/**
 * Client async wrapper handler function
 */
export type AsyncHandler<T, R> = (param: T) => Promise<ClientResponse<R>>;

/**
 * Client async wrapper return function
 */
export type AsyncReturn<T, R> = (param: T) => Promise<ClientResponse<R>>;

/**
 * Pagination response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Common API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  statusCode?: number;
}
