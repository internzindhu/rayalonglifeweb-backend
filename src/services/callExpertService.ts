import prisma from '../config/database';
import { parsePagination, toPrismaSkipTake, buildMeta, PaginatedResult } from '../utils/pagination';

export interface CreateCallExpertDto {
  phone: string;
  name: string;
  email: string;
  scheduled_date?: string;
  scheduled_slot?: string;
}

export async function createCallExpert(dto: CreateCallExpertDto) {
  return prisma.callAnExpertForm.create({
    data: {
      phone:          dto.phone,
      name:           dto.name,
      email:          dto.email,
      scheduled_date: dto.scheduled_date ?? null,
      scheduled_slot: dto.scheduled_slot ?? null,
    },
  });
}

export async function listCallExperts(
  query: { page?: string; limit?: string },
): Promise<PaginatedResult<unknown>> {
  const pagination = parsePagination(query.page, query.limit);
  const { skip, take } = toPrismaSkipTake(pagination);

  const [records, total] = await Promise.all([
    prisma.callAnExpertForm.findMany({ orderBy: { created_at: 'desc' }, skip, take }),
    prisma.callAnExpertForm.count(),
  ]);

  return { data: records, meta: buildMeta(total, pagination) };
}
