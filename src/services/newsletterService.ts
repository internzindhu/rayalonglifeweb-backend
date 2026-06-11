import prisma from '../config/database';
import { parsePagination, toPrismaSkipTake, buildMeta, PaginatedResult } from '../utils/pagination';

export async function subscribe(email: string) {
  return prisma.newsletterSubscriber.upsert({
    where:  { email },
    update: {},
    create: { email },
  });
}

export async function listSubscribers(
  query: { page?: string; limit?: string },
): Promise<PaginatedResult<unknown>> {
  const pagination = parsePagination(query.page, query.limit);
  const { skip, take } = toPrismaSkipTake(pagination);

  const [records, total] = await Promise.all([
    prisma.newsletterSubscriber.findMany({ orderBy: { created_at: 'desc' }, skip, take }),
    prisma.newsletterSubscriber.count(),
  ]);

  return { data: records, meta: buildMeta(total, pagination) };
}
