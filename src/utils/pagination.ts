// Pagination helpers shared across services

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Convert raw page/limit query values into safe integers.
 * Defaults: page=1, limit=defaultLimit; cap: limit≤1000.
 */
export function parsePagination(
  rawPage: unknown,
  rawLimit: unknown,
  defaultLimit = 20,
): PaginationParams {
  const page = Math.max(1, parseInt(String(rawPage ?? '1'), 10) || 1);
  const limit = Math.min(1000, Math.max(1, parseInt(String(rawLimit ?? String(defaultLimit)), 10) || defaultLimit));
  return { page, limit };
}

/** Convert page+limit into the prisma skip/take pair */
export function toPrismaSkipTake(params: PaginationParams): { skip: number; take: number } {
  return {
    skip: (params.page - 1) * params.limit,
    take: params.limit,
  };
}

/** Build the meta object returned alongside every paginated response */
export function buildMeta(total: number, params: PaginationParams): PaginationMeta {
  const totalPages = Math.ceil(total / params.limit);
  return {
    total,
    page: params.page,
    limit: params.limit,
    totalPages,
    hasNextPage: params.page < totalPages,
    hasPrevPage: params.page > 1,
  };
}
