'use client';

import YCQuestionsCard from './YCQuestionsCard';

export default function YCQuestionsView({ projectId }: { projectId: string }) {
    return (
        <div className="max-w-4xl mx-auto">
            <YCQuestionsCard projectId={projectId} />
        </div>
    );
}
