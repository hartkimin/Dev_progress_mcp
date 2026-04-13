'use server';

import {
    saveYcAnswers as dbSaveYcAnswers,
    getLatestYcAnswers as dbGetLatestYcAnswers,
    savePlanReview as dbSavePlanReview,
    listPlanReviews as dbListPlanReviews,
    getPlanReview as dbGetPlanReview,
    type YcAnswer,
    type YcAnswersInput,
    type PlanReview,
    type PlanReviewInput,
} from '@/lib/db';

export type { YcAnswer, YcAnswersInput, PlanReview, PlanReviewInput };
export type PlanReviewKind = PlanReviewInput['kind'];
export type PlanReviewDecision = NonNullable<PlanReviewInput['decision']>;

export async function saveYCAnswers(projectId: string, answers: YcAnswersInput) {
    return dbSaveYcAnswers(projectId, answers);
}

export async function getLatestYCAnswers(projectId: string) {
    return dbGetLatestYcAnswers(projectId);
}

export async function savePlanReview(projectId: string, input: PlanReviewInput) {
    return dbSavePlanReview(projectId, input);
}

export async function listPlanReviews(projectId: string, kind?: PlanReviewKind) {
    return dbListPlanReviews(projectId, kind);
}

export async function getPlanReview(id: string) {
    return dbGetPlanReview(id);
}
