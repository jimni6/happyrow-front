export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly type?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isConflict(): boolean {
    return this.status === 409;
  }

  get isBadRequest(): boolean {
    return this.status === 400;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isRateLimited(): boolean {
    return this.status === 429;
  }
}

export async function throwApiError(response: Response): Promise<never> {
  const errorData = await response.json().catch(() => ({}));
  const message =
    errorData.detail ||
    errorData.message ||
    `HTTP error! status: ${response.status}`;
  throw new ApiError(message, response.status, errorData.type);
}
