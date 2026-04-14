'use server';

import {
    saveYcAnswers as dbSaveYcAnswers,
    getLatestYcAnswers as dbGetLatestYcAnswers,
    savePlanReview as dbSavePlanReview,
    listPlanReviews as dbListPlanReviews,
    getPlanReview as dbGetPlanReview,
    getPlanReviewMarkdown as dbGetPlanReviewMarkdown,
    type YcAnswersInput,
    type PlanReviewInput,
} from '@/lib/db';

// NOTE: Do not re-export types from a 'use server' file — Turbopack chokes on
// non-async exports in server action modules. Import types directly from
// '@/lib/db' in consumer components.

export async function saveYCAnswers(projectId: string, answers: YcAnswersInput) {
    return dbSaveYcAnswers(projectId, answers);
}

export async function getLatestYCAnswers(projectId: string) {
    return dbGetLatestYcAnswers(projectId);
}

export async function savePlanReview(projectId: string, input: PlanReviewInput) {
    return dbSavePlanReview(projectId, input);
}

export async function listPlanReviews(projectId: string, kind?: PlanReviewInput['kind']) {
    return dbListPlanReviews(projectId, kind);
}

export async function getPlanReview(id: string) {
    return dbGetPlanReview(id);
}

export async function getPlanReviewMarkdown(id: string) {
    return dbGetPlanReviewMarkdown(id);
}
