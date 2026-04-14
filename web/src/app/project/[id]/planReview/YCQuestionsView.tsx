'use client';

import YCQuestionsCard from './YCQuestionsCard';

export default function YCQuestionsView({ projectId }: { projectId: string }) {
    return (
        <div className="w-full px-1 py-2">
            <YCQuestionsCard projectId={projectId} />
        </div>
    );
}
