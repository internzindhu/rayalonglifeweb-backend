import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';
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

export async function deleteSubscriber(id: string): Promise<void> {
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { id } });
  if (!existing) throw new AppError(`Newsletter subscriber with id "${id}" not found.`, 404);
  await prisma.newsletterSubscriber.delete({ where: { id } });
}
