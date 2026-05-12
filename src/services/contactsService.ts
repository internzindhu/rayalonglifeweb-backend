// Contacts service — handles general contact form submissions

import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';
import { parsePagination, toPrismaSkipTake, buildMeta, PaginatedResult } from '../utils/pagination';

export interface CreateContactDto {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export interface ListContactsQuery {
  page?: string;
  limit?: string;
}

export async function createContact(dto: CreateContactDto) {
  return prisma.contact.create({
    data: {
      name:    dto.name,
      email:   dto.email,
      phone:   dto.phone ?? null,
      subject: dto.subject ?? null,
      message: dto.message,
    },
  });
}

export async function listContacts(
  query: ListContactsQuery,
): Promise<PaginatedResult<unknown>> {
  const pagination = parsePagination(query.page, query.limit);
  const { skip, take } = toPrismaSkipTake(pagination);

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({ orderBy: { created_at: 'desc' }, skip, take }),
    prisma.contact.count(),
  ]);

  return { data: contacts, meta: buildMeta(total, pagination) };
}

export async function getContactById(id: string) {
  const contact = await prisma.contact.findUnique({ where: { id } });
  if (!contact) throw new AppError(`Contact with id "${id}" not found.`, 404);
  return contact;
}
