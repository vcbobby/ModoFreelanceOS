import React, { useState } from 'react';
import { CopilotDashboard } from './CopilotDashboard';
import { CopilotWorkspace } from './CopilotWorkspace';

interface CopilotMainViewProps {
  onUsage: (cost: number) => Promise<boolean>;
  userId?: string;
}

export const CopilotMainView: React.FC<CopilotMainViewProps> = ({ onUsage, userId }) => {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  if (activeProjectId) {
    return <CopilotWorkspace projectId={activeProjectId} onBack={() => setActiveProjectId(null)} userId={userId} onUsage={onUsage} />;
  }

  return <CopilotDashboard onUsage={onUsage} onOpenProject={(id) => setActiveProjectId(id)} userId={userId} />;
};
