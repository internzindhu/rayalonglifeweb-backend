// Questionnaire service — stores wellness questionnaire submissions and computed results

import prisma from '../config/database';
import { Prisma } from '@prisma/client';
import type { JsonValue } from '@prisma/client/runtime/library';
import { parsePagination, toPrismaSkipTake, buildMeta, PaginatedResult } from '../utils/pagination';

export interface CreateQuestionnaireDto {
  answers: JsonValue;
  result_type?: string;
}

export interface ListQuestionnaireQuery {
  page?: string;
  limit?: string;
}

export async function createSubmission(dto: CreateQuestionnaireDto) {
  return prisma.questionnaireSubmission.create({
    data: {
      answers:     dto.answers === null ? Prisma.JsonNull : dto.answers,
      result_type: dto.result_type ?? null,
    },
  });
}

export async function listSubmissions(
  query: ListQuestionnaireQuery,
): Promise<PaginatedResult<unknown>> {
  const pagination = parsePagination(query.page, query.limit);
  const { skip, take } = toPrismaSkipTake(pagination);

  const [submissions, total] = await Promise.all([
    prisma.questionnaireSubmission.findMany({
      orderBy: { created_at: 'desc' },
      skip,
      take,
    }),
    prisma.questionnaireSubmission.count(),
  ]);

  return { data: submissions, meta: buildMeta(total, pagination) };
}
