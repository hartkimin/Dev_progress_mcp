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
    'loading': { en: 'Loading...', ko: '불러오는 중...' },

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

    // Project View Tabs
    'tabKanban': { en: 'Kanban', ko: '칸반보드' },
    'tabCalendar': { en: 'Calendar', ko: '캘린더' },
    'tabIssueTracker': { en: 'Issues', ko: '이슈 트래커' },
    'tabArchitecture': { en: 'Architecture', ko: '아키텍처' },
    'tabDatabase': { en: 'DB Schema', ko: 'DB 설계' },
    'tabApiSpec': { en: 'API Spec', ko: 'API 명세' },
    'tabCodeReview': { en: 'Code Review', ko: '코드 리뷰' },
    'tabTest': { en: 'Tests', ko: '테스트' },
    'tabEnvironment': { en: 'Infra', ko: '환경/인프라' },
    'tabDeploy': { en: 'Deploy', ko: '배포' },
    'tabAIContext': { en: 'AI Context', ko: 'AI 컨텍스트' },
    'tabDecision': { en: 'Decisions', ko: '의사결정' },
    'tabChangelog': { en: 'Changelog', ko: '변경이력' },
    'catProject': { en: 'Project', ko: '프로젝트' },
    'catDesign': { en: 'Design', ko: '설계' },
    'catDevelopment': { en: 'Development', ko: '개발' },
    'catAi': { en: 'AI Management', ko: 'AI 관리' },

    // Calendar
    'calToday': { en: 'Today', ko: '오늘' },
    'calMoreItems': { en: 'more', ko: '개 더보기' },
    'calTasks': { en: 'tasks', ko: '개 태스크' },
    'monthNames': { en: 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec', ko: '1월,2월,3월,4월,5월,6월,7월,8월,9월,10월,11월,12월' },
    'dayNames': { en: 'Sun,Mon,Tue,Wed,Thu,Fri,Sat', ko: '일,월,화,수,목,금,토' },

    // Notifications
    'notifNewTask': { en: 'New Task', ko: '새 태스크 등록' },
    'notifStarted': { en: 'Started', ko: '진행 시작' },
    'notifReview': { en: 'Review Requested', ko: '리뷰 요청' },
    'notifDone': { en: 'Completed', ko: '완료됨' },
    'notifUpdate': { en: 'Updated', ko: '업데이트' },
    'noNotifications': { en: 'No notifications.', ko: '알림이 없습니다.' },

    // Time Ago
    'timeJustNow': { en: 'Just now', ko: '방금 전' },
    'timeMinAgo': { en: 'm ago', ko: '분 전' },
    'timeHourAgo': { en: 'h ago', ko: '시간 전' },
    'timeDayAgo': { en: 'd ago', ko: '일 전' },

    // Activity View
    'activityTitle': { en: 'Recent Activity', ko: '최근 활동' },
    'noActivityItems': { en: 'No activity recorded yet.', ko: '아직 활동 내역이 없습니다.' },

    // Language Picker
    'langKorean': { en: 'Korean', ko: '한국어' },
    'langEnglish': { en: 'English', ko: '영어' },

    // Theme Toggle & TopNav
    'lightMode': { en: 'Light Mode', ko: '라이트 모드' },
    'darkMode': { en: 'Dark Mode', ko: '다크 모드' },
    'systemTheme': { en: 'System Theme', ko: '시스템 테마' },
    'changeTheme': { en: 'Change Theme', ko: '테마 변경' },
    'languageToggle': { en: 'Switch to Korean', ko: 'Switch to English' },
    'profileSettings': { en: 'Profile Settings', ko: '프로필 설정' },
    'billing': { en: 'Billing & Plan', ko: '결제 및 요금제' },
    'signOut': { en: 'Sign Out', ko: '로그아웃' },
    'profileSettingsSubtitle': { en: 'Manage your personal information, preferences, and security settings.', ko: '개인 정보, 환경설정 및 보안 설정을 관리합니다.' },
    'profileName': { en: 'Full Name', ko: '이름설정' },
    'profileEmail': { en: 'Email Address', ko: '이메일 주소' },
    'saveChanges': { en: 'Save Changes', ko: '변경사항 저장' },
    'billingSubtitle': { en: 'Manage your subscription plan, payment methods, and billing history.', ko: '구독 요금제, 결제 수단 및 결제 내역을 관리합니다.' },
    'currentPlan': { en: 'Current Plan', ko: '현재 요금제' },
    'proPlanDesc': { en: 'You are on the Pro plan with all premium features unlocked.', ko: '프리미엄 기능이 모두 포함된 Pro 요금제를 사용 중입니다.' },
    'paymentMethod': { en: 'Payment Method', ko: '결제 수단' },
    'updatePayment': { en: 'Update Payment Method', ko: '결제 수단 업데이트' },
    'invoiceHistory': { en: 'Invoice History', ko: '청구 내역' },
    'signedOutMsg': { en: 'You have been signed out successfully.', ko: '성공적으로 로그아웃 되었습니다.' },

    // Settings (Security & Notifications)
    'generalSettings': { en: 'General', ko: '일반' },
    'security': { en: 'Security', ko: '보안' },
    'notifications': { en: 'Notifications', ko: '알림' },
    'profileInfo': { en: 'Profile Information', ko: '프로필 정보' },
    'securitySettings': { en: 'Security Settings', ko: '보안 설정' },
    'password': { en: 'Password', ko: '비밀번호' },
    'twoFactorAuth': { en: 'Two-Factor Authentication (2FA)', ko: '2단계 인증 (2FA)' },
    'enable': { en: 'Enable', ko: '활성화' },
    'notificationPreferences': { en: 'Notification Preferences', ko: '알림 환경설정' },
    'emailAlerts': { en: 'Email Alerts', ko: '이메일 알림' },
    'appAlerts': { en: 'In-App Notifications', ko: '앱 내 알림' },
    'criticalAlerts': { en: 'Critical Security Alerts', ko: '중요 보안 알림' },
    'markAllAsRead': { en: 'Mark all as read', ko: '모두 읽음 처리' },
    'viewAllNotifications': { en: 'View Notification Settings', ko: '알림 설정 보기' },


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
    'toolGetProjectDocument': { en: 'Fetch a specific project document.', ko: '특정 프로젝트 문서를 가져옵니다.' },
    'toolUpdateProjectDocument': { en: 'Update or create a project document.', ko: '프로젝트 문서를 업데이트하거나 생성합니다.' },
    'toolGetProjectDocumentVersions': { en: 'Retrieve document version history.', ko: '문서 버전 기록을 검색합니다.' },
    'toolRestoreProjectDocumentVersion': { en: 'Restore a document to an older version.', ko: '문서를 이전 버전으로 복원합니다.' },
    'toolDeleteProject': { en: 'Delete a project and all related data.', ko: '프로젝트와 관련 데이터를 모두 삭제합니다.' },
    'toolDeleteTask': { en: 'Delete a task and its comments.', ko: '태스크와 댓글을 삭제합니다.' },
    'toolGetTask': { en: 'Retrieve detailed task information.', ko: '태스크 상세 정보를 조회합니다.' },
    'toolAddComment': { en: 'Add a comment to a task.', ko: '태스크에 코멘트를 추가합니다.' },
    'toolGetComments': { en: 'Retrieve all comments on a task.', ko: '태스크의 모든 코멘트를 조회합니다.' },
    'toolUpdateProject': { en: 'Update project name or description.', ko: '프로젝트 이름이나 설명을 수정합니다.' },
    'toolGetAnalytics': { en: 'Retrieve project & task analytics.', ko: '프로젝트 및 태스크 통계를 조회합니다.' },
    'toolGetRecentTasks': { en: 'Fetch recently updated tasks.', ko: '최근 업데이트된 태스크를 조회합니다.' },
    'toolAppendProjectDocument': { en: 'Atomically append one item to an array document (ISSUE_TRACKER, CODE_REVIEW, TEST, DEPLOY).', ko: 'Array 기반 문서(ISSUE_TRACKER, CODE_REVIEW, TEST, DEPLOY)에 항목 1개를 원자적으로 추가합니다.' },
    'toolSaveYcAnswers': { en: 'Save YC 6-Question answers for the Ideation phase.', ko: 'Ideation 단계의 YC 6가지 질문 응답을 저장합니다.' },
    'toolGetYcAnswers': { en: 'Get the latest YC 6-Question answers for a project.', ko: '프로젝트의 최신 YC 6가지 질문 응답을 조회합니다.' },
    'toolSavePlanReview': { en: 'Save a Plan Review (kind: ceo/eng/design/devex). Writes DB row + MD snapshot.', ko: 'Plan Review를 저장합니다 (kind: ceo/eng/design/devex). DB 행 + MD 스냅샷이 함께 작성됩니다.' },
    'toolListPlanReviews': { en: 'List Plan Reviews for a project, optionally filtered by kind.', ko: '프로젝트의 Plan Review 목록을 조회합니다 (kind 필터 지원).' },
    'toolGetPlanReview': { en: 'Get a Plan Review by id.', ko: 'ID로 Plan Review를 단건 조회합니다.' },
    'toolCategoryProject': { en: 'Project Management', ko: '프로젝트 관리' },
    'toolCategoryTask': { en: 'Task Management', ko: '태스크 관리' },
    'toolCategoryDocument': { en: 'Document Management', ko: '문서 관리' },
    'toolCategoryAnalytics': { en: 'Analytics & Overview', ko: '분석 & 개요' },
    'toolCategoryPlanReview': { en: 'Plan Review (gstack)', ko: 'Plan Review (gstack)' },

    // Common actions (used by feature components)
    'common.save': { en: 'Save', ko: '저장' },
    'common.saving': { en: 'Saving...', ko: '저장 중...' },
    'common.loading': { en: 'Loading...', ko: '로딩 중...' },

    // YC 6 Questions (Ideation) — used by YCQuestionsCard
    'yc.title': { en: 'YC 6 Questions (Ideation)', ko: 'YC 6가지 질문 (Ideation)' },
    'yc.q1': { en: 'Demand reality: who and how many asked for this?', ko: '수요 현실: 누가, 몇 명이 이걸 요청했나?' },
    'yc.q1.placeholder': { en: 'Specific users/teams and counts', ko: '구체적 사용자/팀명과 횟수' },
    'yc.q2': { en: 'What is actually broken about the status quo?', ko: '현상 유지의 진짜 문제는?' },
    'yc.q2.placeholder': { en: 'Pain points of the current way', ko: '지금 방식의 고통점' },
    'yc.q3': { en: 'Desperate specificity', ko: '절박한 구체성' },
    'yc.q3.placeholder': { en: 'One most specific use case', ko: '가장 구체적인 유스케이스 1개' },
    'yc.q4': { en: 'Narrowest wedge', ko: '가장 좁은 웨지' },
    'yc.q4.placeholder': { en: 'Minimal entry scope', ko: '최소 진입 범위' },
    'yc.q5': { en: 'Observation', ko: '관찰' },
    'yc.q5.placeholder': { en: 'Evidence from real usage observation', ko: '실제 사용 관찰 증거' },
    'yc.q6': { en: 'Future-fit', ko: 'Future-fit' },
    'yc.q6.placeholder': { en: 'Still valid in 12 months?', ko: '1년 뒤에도 유효한가?' },

    // Plan Review — kind labels
    'planReview.kind.ceo': { en: 'CEO Review', ko: 'CEO 리뷰' },
    'planReview.kind.eng': { en: 'Engineering Review', ko: '엔지니어링 리뷰' },
    'planReview.kind.design': { en: 'Design Review', ko: '디자인 리뷰' },
    'planReview.kind.devex': { en: 'DevEx Review', ko: 'DevEx 리뷰' },

    // Plan Review — decision labels
    'planReview.decision.accept': { en: 'Accept', ko: '수락' },
    'planReview.decision.revise': { en: 'Revise', ko: '수정' },
    'planReview.decision.reject': { en: 'Reject', ko: '거절' },
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
