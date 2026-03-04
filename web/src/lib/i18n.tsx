'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ko';

interface Translations {
    [key: string]: {
        en: string;
        ko: string;
    };
}

const translations: Translations = {
    // General
    'workspace': { en: 'Workspace', ko: '워크스페이스' },
    'integrations': { en: 'Integrations', ko: '연동기능' },
    'settings': { en: 'Settings', ko: '설정' },

    // Sidebar
    'dashboard': { en: 'Dashboard', ko: '대시보드' },
    'recentActivity': { en: 'Recent Activity', ko: '최근 활동' },
    'users': { en: 'Users', ko: '사용자' },
    'apiKeys': { en: 'API Keys', ko: 'API 자격증명' },
    'analytics': { en: 'Analytics', ko: '통계' },
    'adminDeveloper': { en: 'Admin Developer', ko: '관리자 계정' },
    'proTierActive': { en: 'Pro Tier Active', ko: '프로 요금제 활성' },
    'expandSidebar': { en: 'Expand Sidebar', ko: '사이드바 열기' },
    'collapseSidebar': { en: 'Collapse Sidebar', ko: '사이드바 닫기' },

    // Theme Toggle & TopNav
    'lightMode': { en: 'Light Mode', ko: '라이트 모드' },
    'darkMode': { en: 'Dark Mode', ko: '다크 모드' },
    'systemTheme': { en: 'System Theme', ko: '시스템 테마' },
    'changeTheme': { en: 'Change Theme', ko: '테마 변경' },
    'languageToggle': { en: 'Switch to Korean', ko: 'Switch to English' },

    // Activity Page
    'noActivityYet': { en: 'No activity yet.', ko: '활동 내역이 없습니다.' },
    'activitySubtitle': { en: 'Track recent progress, updates, and events across all your workspaces.', ko: '모든 워크스페이스에 걸친 최근 진행 상황, 업데이트 및 이벤트를 추적합니다.' },
    'viewProject': { en: 'View Project', ko: '프로젝트 보기' },

    // Dashboard
    'developerConsole': { en: 'VibePlanner Dashboard', ko: 'VibePlanner 대시보드' },
    'developerConsoleSubtitle': { en: 'Real-time synchronization with MCP local context. Track your coding progress effortlessly.', ko: 'MCP 로컬 컨텍스트와 실시간 동기화. 코딩 진행 상황을 쉽게 추적하세요.' },
    'activeProjects': { en: 'Active Projects', ko: '진행 중인 프로젝트' },
    'project': { en: 'Project', ko: '프로젝트' },
    'projects': { en: 'Projects', ko: '프로젝트' },
    'noProjectsFound': { en: 'No Projects Found', ko: '프로젝트를 찾을 수 없습니다' },
    'getStartedByCreatingProject': { en: 'Get started by creating a project via the MCP tool from your AI assistant.', ko: 'AI 어시스턴트의 MCP 도구를 통해 프로젝트를 생성하여 시작하세요.' },
    'noDescriptionProvided': { en: 'No description provided.', ko: '설명이 제공되지 않았습니다.' },

    // Admin & Settings Pages
    'mcpIntegrations': { en: 'MCP Integrations', ko: 'MCP 연동' },
    'mcpIntegrationsSubtitle': { en: 'View and manage Model Context Protocol features currently active in your VibePlanner server.', ko: 'VibePlanner 서버에서 현재 활성화된 Model Context Protocol 기능을 확인하고 관리합니다.' },
    'availableCapabilities': { en: 'Available Capabilities', ko: '사용 가능한 기능' },
    'adminUsers': { en: 'Admin Users', ko: '관리자 계정' },
    'adminUsersSubtitle': { en: 'Manage the active members in this VibePlanner deployment.', ko: '이 VibePlanner 배포에 참여 중인 활성 멤버를 관리합니다.' },
    'addUser': { en: 'Add new user', ko: '새 사용자 추가' },
    'userName': { en: 'Name', ko: '이름' },
    'userEmail': { en: 'Email', ko: '이메일' },
    'userNamePlaceholder': { en: 'e.g., Alice Developer', ko: '예: 홍길동' },
    'userEmailPlaceholder': { en: 'e.g., alice@example.com', ko: '예: hong@example.com' },
    'addUserButton': { en: 'Add User', ko: '추가하기' },
    'userId': { en: 'User ID', ko: '사용자 ID' },
    'userRole': { en: 'Role', ko: '권한' },
    'userActions': { en: 'Actions', ko: '작업' },
    'owner': { en: 'Owner', ko: '소유자' },
    'member': { en: 'Member', ko: '멤버' },
    'removeUser': { en: 'Remove user', ko: '사용자 제거' },
    'cannotDeleteOwner': { en: 'The default admin owner cannot be deleted.', ko: '기본 관리자 소유자는 삭제할 수 없습니다.' },
    'confirmDeleteUser': { en: 'Are you sure you want to delete this user? All their API keys will be revoked.', ko: '이 사용자를 삭제하시겠습니까? 관련 API 키가 모두 취소됩니다.' },
    'failedToDeleteUser': { en: 'Failed to delete user.', ko: '사용자 삭제에 실패했습니다.' },
    'failedToCreateUser': { en: 'Failed to create user', ko: '사용자 생성에 실패했습니다' },
    'apiKeysSubtitle': { en: 'Manage your secret API keys. Use these keys to authenticate external MCP clients, CI/CD pipelines, or custom scripts to your VibePlanner server.', ko: '비밀 API 키를 관리합니다. 이 키를 사용하여 외부 MCP 클라이언트 등을 VibePlanner 서버에 인증하세요.' },
    'createSecretKey': { en: 'Create new secret key', ko: '새 비밀 키 생성' },
    'keyName': { en: 'Name', ko: '이름' },
    'keyNamePlaceholder': { en: 'e.g., Production Core API', ko: '예: 프로덕션 코어 API' },
    'createSecretKeyButton': { en: 'Create secret key', ko: '비밀 키 생성' },
    'saveSecretKey': { en: 'Save your secret key', ko: '비밀 키 저장' },
    'saveSecretKeyDesc': { en: "Please copy this key and save it somewhere safe. For security reasons, you won't be able to see it again after you leave this page.", ko: '이 키를 복사하여 안전한 곳에 저장하세요. 보안상의 이유로 이 페이지를 벗어나면 다시 볼 수 없습니다.' },
    'copy': { en: 'Copy', ko: '복사' },
    'secretKey': { en: 'Secret Key', ko: '비밀 키' },
    'created': { en: 'Created', ko: '생성일' },
    'lastUsed': { en: 'Last Used', ko: '마지막 사용' },
    'noApiKeysGeneratedYet': { en: 'No API keys generated yet.', ko: '생성된 API 키가 없습니다.' },
    'never': { en: 'Never', ko: '사용 안함' },
    'revokeKey': { en: 'Revoke key', ko: '키 취소' },
    'confirmRevokeKey': { en: 'Are you sure you want to revoke this key? Any integrations using it will instantly fail.', ko: '이 키를 취소하시겠습니까? 이를 사용하는 모든 연동이 즉시 실패합니다.' },
    'failedToGenerateKey': { en: 'Failed to generate key', ko: '키 생성에 실패했습니다' },
    'failedToRevokeKey': { en: 'Failed to revoke key', ko: '키 취소에 실패했습니다' },
    'systemAnalytics': { en: 'System Analytics', ko: '시스템 통계' },
    'systemAnalyticsSubtitle': { en: 'Monitor your workspace activities, project metrics, and system performance over time.', ko: '워크스페이스 활동, 프로젝트 지표 및 시스템 성능을 시간에 따라 모니터링합니다.' },
    'backToDashboard': { en: 'Back to Dashboard', ko: '대시보드로 돌아가기' },
    'totalProjects': { en: 'Total Projects', ko: '전체 프로젝트' },
    'registeredUsers': { en: 'Registered Users', ko: '등록된 사용자' },
    'totalTasks': { en: 'Total Tasks', ko: '전체 작업' },
    'avgCompletion': { en: 'Avg Completion', ko: '평균 완료율' },
    'taskPipelineDistribution': { en: 'Task Pipeline Distribution', ko: '작업 파이프라인 분포' },
    'todoStatus': { en: 'To Do', ko: '할 일' },
    'inProgressStatus': { en: 'In Progress', ko: '진행 중' },
    'completedStatus': { en: 'Completed', ko: '완료됨' },

    // Integrations Text
    'clientConfiguration': { en: 'Client Configuration', ko: '클라이언트 구성' },
    'required': { en: 'REQUIRED', ko: '필수' },
    'clientConfigDesc': { en: "To enable automated task synchronization between your AI assistant (like Claude Desktop or Cursor) and VibePlanner, configure your client's mcp.json with the following settings.", ko: 'AI 어시스턴트(Claude Desktop, Cursor 등)와 VibePlanner 간의 자동 작업 동기화를 활성화하려면 클라이언트의 mcp.json에 다음 설정을 구성하세요.' },
    'localMcpServerStatus': { en: 'Local MCP Server Status', ko: '로컬 MCP 서버 상태' },
    'mcpServerReady': { en: 'Ready to accept incoming standard I/O connections.', ko: '수신 표준 I/O 연결을 수락할 준비가 되었습니다.' },
    'mcpCapabilitiesDesc': { en: 'The VibePlanner MCP server exposes these autonomous tools to your AI agent.', ko: 'VibePlanner MCP 서버는 AI 에이전트에게 다음과 같은 자율 도구들을 제공합니다.' },
    'toolListProjects': { en: 'Fetch all active kanban projects.', ko: '모든 활성 칸반 프로젝트를 가져옵니다.' },
    'toolCreateProject': { en: 'Initialize a new tracking board.', ko: '새로운 트래킹 보드를 초기화합니다.' },
    'toolGetKanbanBoard': { en: 'Retrieve accurate column layout.', ko: '정확한 열 레이아웃을 검색합니다.' },
    'toolCreateTask': { en: 'Add new tasks to the TODO column.', ko: 'TODO 열에 새 작업을 추가합니다.' },
    'toolUpdateTaskStatus': { en: 'Move a task across swimlanes.', ko: '스윔레인 간 작업을 이동합니다.' },
    'toolUpdateTaskDetails': { en: 'Modify descriptions & work logs.', ko: '설명 및 작업 로그를 수정합니다.' },
};

interface I18nContextType {
    language: Language;
    toggleLanguage: () => void;
    t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('ko'); // Default to Korean as user speaks it mostly
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setTimeout(() => setMounted(true), 0);
        const savedLang = localStorage.getItem('vibe-planner-language') as Language;
        if (savedLang && (savedLang === 'en' || savedLang === 'ko')) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLanguage(savedLang);
        }
    }, []);

    const toggleLanguage = () => {
        const newLang = language === 'en' ? 'ko' : 'en';
        setLanguage(newLang);
        localStorage.setItem('vibe-planner-language', newLang);
    };

    const t = (key: string): string => {
        if (!translations[key]) return key;
        return translations[key][language] || key;
    };

    // Return essentially a blank/untranslated shell until mounted to avoid hydration mismatch
    // (though context value can just match initial state). We render children normally.
    return (
        <I18nContext.Provider value={{ language, toggleLanguage, t }}>
            {/* If not mounted, the text might flash, but hydration is safer this way when just passing context */}
            {children}
        </I18nContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
}
