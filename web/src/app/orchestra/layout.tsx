import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Orchestra',
    description: 'claude-orchestra daemon dashboard — Dreams, Ralph, Agent runs, Timeline.',
};

export default function OrchestraLayout({ children }: { children: React.ReactNode }) {
    return <div className="min-h-full">{children}</div>;
}
