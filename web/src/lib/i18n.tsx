'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ko' | 'zh' | 'ja';

export const SUPPORTED_LANGUAGES: Language[] = ['ko', 'en', 'zh', 'ja'];

interface TranslationEntry {
    en: string;
    ko: string;
    zh: string;
    ja: string;
}

interface Translations {
    [key: string]: TranslationEntry;
}

const translations: Translations = {
    // General
    'workspace': { en: 'Workspace', ko: '워크스페이스', zh: '工作区', ja: 'ワークスペース' },
    'integrations': { en: 'Integrations', ko: '연동기능', zh: '集成', ja: '連携機能' },
    'settings': { en: 'Settings', ko: '설정', zh: '设置', ja: '設定' },
    'loading': { en: 'Loading...', ko: '불러오는 중...', zh: '加载中...', ja: '読み込み中...' },

    // Sidebar
    'dashboard': { en: 'Dashboard', ko: '대시보드', zh: '仪表板', ja: 'ダッシュボード' },
    'recentActivity': { en: 'Recent Activity', ko: '최근 활동', zh: '最近活动', ja: '最近のアクティビティ' },
    'users': { en: 'Users', ko: '사용자', zh: '用户', ja: 'ユーザー' },
    'apiKeys': { en: 'API Keys', ko: 'API 자격증명', zh: 'API 密钥', ja: 'API キー' },
    'analytics': { en: 'Analytics', ko: '통계', zh: '统计', ja: '分析' },
    'adminDeveloper': { en: 'Admin Developer', ko: '관리자 계정', zh: '管理员账号', ja: '管理者アカウント' },
    'proTierActive': { en: 'Pro Tier Active', ko: '프로 요금제 활성', zh: '专业版已启用', ja: 'プロプラン有効' },
    'expandSidebar': { en: 'Expand Sidebar', ko: '사이드바 열기', zh: '展开侧边栏', ja: 'サイドバーを開く' },
    'collapseSidebar': { en: 'Collapse Sidebar', ko: '사이드바 닫기', zh: '收起侧边栏', ja: 'サイドバーを閉じる' },

    // Project View Tabs
    'tabKanban': { en: 'Kanban', ko: '칸반보드', zh: '看板', ja: 'カンバン' },
    'tabCalendar': { en: 'Calendar', ko: '캘린더', zh: '日历', ja: 'カレンダー' },
    'tabIssueTracker': { en: 'Issues', ko: '이슈 트래커', zh: '问题跟踪', ja: '課題トラッカー' },
    'tabArchitecture': { en: 'Architecture', ko: '아키텍처', zh: '架构', ja: 'アーキテクチャ' },
    'tabDatabase': { en: 'DB Schema', ko: 'DB 설계', zh: '数据库结构', ja: 'DB スキーマ' },
    'tabApiSpec': { en: 'API Spec', ko: 'API 명세', zh: 'API 规范', ja: 'API 仕様' },
    'tabCodeReview': { en: 'Code Review', ko: '코드 리뷰', zh: '代码审查', ja: 'コードレビュー' },
    'tabTest': { en: 'Tests', ko: '테스트', zh: '测试', ja: 'テスト' },
    'tabEnvironment': { en: 'Infra', ko: '환경/인프라', zh: '环境/基础设施', ja: '環境/インフラ' },
    'tabDeploy': { en: 'Deploy', ko: '배포', zh: '部署', ja: 'デプロイ' },
    'tabAIContext': { en: 'AI Context', ko: 'AI 컨텍스트', zh: 'AI 上下文', ja: 'AI コンテキスト' },
    'tabDecision': { en: 'Decisions', ko: '의사결정', zh: '决策', ja: '意思決定' },
    'tabChangelog': { en: 'Changelog', ko: '변경이력', zh: '变更日志', ja: '変更履歴' },
    'catProject': { en: 'Project', ko: '프로젝트', zh: '项目', ja: 'プロジェクト' },
    'catDesign': { en: 'Design', ko: '설계', zh: '设计', ja: '設計' },
    'catDevelopment': { en: 'Development', ko: '개발', zh: '开发', ja: '開発' },
    'catAi': { en: 'AI Management', ko: 'AI 관리', zh: 'AI 管理', ja: 'AI 管理' },

    // Phase-centric Nav Groups
    'navGroupOverview':   { en: 'Overview',  ko: '개요', zh: '概览', ja: '概要' },
    'navGroupIdeation':   { en: 'Ideation',  ko: '기획', zh: '构思', ja: '企画' },
    'navGroupDesign':     { en: 'Design',    ko: '설계', zh: '设计', ja: '設計' },
    'navGroupBuild':      { en: 'Build',     ko: '개발', zh: '开发', ja: '開発' },
    'navGroupQa':         { en: 'QA',        ko: '품질', zh: '质量', ja: '品質' },
    'navGroupDeploy':     { en: 'Deploy',    ko: '배포', zh: '部署', ja: 'デプロイ' },

    // Ideation Phase Tabs
    'tabYcQuestions':     { en: 'YC Questions', ko: 'YC 질문', zh: 'YC 问题', ja: 'YC 質問' },
    'tabPlanReviewHub':   { en: 'Plan Reviews', ko: 'Plan Review', zh: 'Plan Review', ja: 'Plan Review' },

    // Calendar
    'calToday': { en: 'Today', ko: '오늘', zh: '今天', ja: '今日' },
    'calMoreItems': { en: 'more', ko: '개 더보기', zh: '更多', ja: '件さらに' },
    'calTasks': { en: 'tasks', ko: '개 태스크', zh: '个任务', ja: '件のタスク' },
    'monthNames': { en: 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec', ko: '1월,2월,3월,4월,5월,6월,7월,8월,9월,10월,11월,12월', zh: '1月,2月,3月,4月,5月,6月,7月,8月,9月,10月,11月,12月', ja: '1月,2月,3月,4月,5月,6月,7月,8月,9月,10月,11月,12月' },
    'dayNames': { en: 'Sun,Mon,Tue,Wed,Thu,Fri,Sat', ko: '일,월,화,수,목,금,토', zh: '日,一,二,三,四,五,六', ja: '日,月,火,水,木,金,土' },

    // Notifications
    'notifNewTask': { en: 'New Task', ko: '새 태스크 등록', zh: '新任务', ja: '新規タスク' },
    'notifStarted': { en: 'Started', ko: '진행 시작', zh: '已开始', ja: '開始' },
    'notifReview': { en: 'Review Requested', ko: '리뷰 요청', zh: '请求审查', ja: 'レビュー依頼' },
    'notifDone': { en: 'Completed', ko: '완료됨', zh: '已完成', ja: '完了' },
    'notifUpdate': { en: 'Updated', ko: '업데이트', zh: '已更新', ja: '更新' },
    'noNotifications': { en: 'No notifications.', ko: '알림이 없습니다.', zh: '暂无通知。', ja: '通知はありません。' },

    // Time Ago
    'timeJustNow': { en: 'Just now', ko: '방금 전', zh: '刚刚', ja: 'たった今' },
    'timeMinAgo': { en: 'm ago', ko: '분 전', zh: '分钟前', ja: '分前' },
    'timeHourAgo': { en: 'h ago', ko: '시간 전', zh: '小时前', ja: '時間前' },
    'timeDayAgo': { en: 'd ago', ko: '일 전', zh: '天前', ja: '日前' },

    // Activity View
    'activityTitle': { en: 'Recent Activity', ko: '최근 활동', zh: '最近活动', ja: '最近のアクティビティ' },
    'noActivityItems': { en: 'No activity recorded yet.', ko: '아직 활동 내역이 없습니다.', zh: '尚无活动记录。', ja: 'まだアクティビティはありません。' },

    // Language Picker
    'langKorean': { en: 'Korean', ko: '한국어', zh: '韩语', ja: '韓国語' },
    'langEnglish': { en: 'English', ko: '영어', zh: '英语', ja: '英語' },
    'langChinese': { en: 'Chinese', ko: '중국어', zh: '中文', ja: '中国語' },
    'langJapanese': { en: 'Japanese', ko: '일본어', zh: '日语', ja: '日本語' },
    'chooseLanguage': { en: 'Choose Language', ko: '언어 선택', zh: '选择语言', ja: '言語を選択' },

    // Theme Toggle & TopNav
    'lightMode': { en: 'Light Mode', ko: '라이트 모드', zh: '浅色模式', ja: 'ライトモード' },
    'darkMode': { en: 'Dark Mode', ko: '다크 모드', zh: '深色模式', ja: 'ダークモード' },
    'systemTheme': { en: 'System Theme', ko: '시스템 테마', zh: '跟随系统', ja: 'システムテーマ' },
    'changeTheme': { en: 'Change Theme', ko: '테마 변경', zh: '切换主题', ja: 'テーマ変更' },
    'languageToggle': { en: 'Change Language', ko: '언어 변경', zh: '切换语言', ja: '言語を変更' },
    'profileSettings': { en: 'Profile Settings', ko: '프로필 설정', zh: '个人资料设置', ja: 'プロフィール設定' },
    'billing': { en: 'Billing & Plan', ko: '결제 및 요금제', zh: '账单与套餐', ja: '請求とプラン' },
    'signOut': { en: 'Sign Out', ko: '로그아웃', zh: '退出登录', ja: 'サインアウト' },
    'profileSettingsSubtitle': { en: 'Manage your personal information, preferences, and security settings.', ko: '개인 정보, 환경설정 및 보안 설정을 관리합니다.', zh: '管理您的个人信息、偏好设置与安全设置。', ja: '個人情報、環境設定、セキュリティ設定を管理します。' },
    'profileName': { en: 'Full Name', ko: '이름설정', zh: '姓名', ja: '氏名' },
    'profileEmail': { en: 'Email Address', ko: '이메일 주소', zh: '电子邮件', ja: 'メールアドレス' },
    'saveChanges': { en: 'Save Changes', ko: '변경사항 저장', zh: '保存更改', ja: '変更を保存' },
    'billingSubtitle': { en: 'Manage your subscription plan, payment methods, and billing history.', ko: '구독 요금제, 결제 수단 및 결제 내역을 관리합니다.', zh: '管理您的订阅套餐、支付方式与账单历史。', ja: 'サブスクリプションプラン、支払い方法、請求履歴を管理します。' },
    'currentPlan': { en: 'Current Plan', ko: '현재 요금제', zh: '当前套餐', ja: '現在のプラン' },
    'proPlanDesc': { en: 'You are on the Pro plan with all premium features unlocked.', ko: '프리미엄 기능이 모두 포함된 Pro 요금제를 사용 중입니다.', zh: '您正在使用 Pro 套餐,所有高级功能均已解锁。', ja: 'すべてのプレミアム機能が利用可能な Pro プランをご利用中です。' },
    'paymentMethod': { en: 'Payment Method', ko: '결제 수단', zh: '支付方式', ja: '支払い方法' },
    'updatePayment': { en: 'Update Payment Method', ko: '결제 수단 업데이트', zh: '更新支付方式', ja: '支払い方法を更新' },
    'invoiceHistory': { en: 'Invoice History', ko: '청구 내역', zh: '账单历史', ja: '請求履歴' },
    'signedOutMsg': { en: 'You have been signed out successfully.', ko: '성공적으로 로그아웃 되었습니다.', zh: '您已成功退出登录。', ja: '正常にサインアウトしました。' },

    // Settings (Security & Notifications)
    'generalSettings': { en: 'General', ko: '일반', zh: '通用', ja: '一般' },
    'security': { en: 'Security', ko: '보안', zh: '安全', ja: 'セキュリティ' },
    'notifications': { en: 'Notifications', ko: '알림', zh: '通知', ja: '通知' },
    'profileInfo': { en: 'Profile Information', ko: '프로필 정보', zh: '个人资料', ja: 'プロフィール情報' },
    'securitySettings': { en: 'Security Settings', ko: '보안 설정', zh: '安全设置', ja: 'セキュリティ設定' },
    'password': { en: 'Password', ko: '비밀번호', zh: '密码', ja: 'パスワード' },
    'twoFactorAuth': { en: 'Two-Factor Authentication (2FA)', ko: '2단계 인증 (2FA)', zh: '双重验证 (2FA)', ja: '二段階認証 (2FA)' },
    'enable': { en: 'Enable', ko: '활성화', zh: '启用', ja: '有効化' },
    'notificationPreferences': { en: 'Notification Preferences', ko: '알림 환경설정', zh: '通知偏好', ja: '通知設定' },
    'emailAlerts': { en: 'Email Alerts', ko: '이메일 알림', zh: '邮件提醒', ja: 'メール通知' },
    'appAlerts': { en: 'In-App Notifications', ko: '앱 내 알림', zh: '应用内通知', ja: 'アプリ内通知' },
    'criticalAlerts': { en: 'Critical Security Alerts', ko: '중요 보안 알림', zh: '重要安全警报', ja: '重要なセキュリティ通知' },
    'markAllAsRead': { en: 'Mark all as read', ko: '모두 읽음 처리', zh: '全部标为已读', ja: 'すべて既読にする' },
    'viewAllNotifications': { en: 'View Notification Settings', ko: '알림 설정 보기', zh: '查看通知设置', ja: '通知設定を見る' },


    // Activity Page
    'noActivityYet': { en: 'No activity yet.', ko: '활동 내역이 없습니다.', zh: '暂无活动。', ja: 'アクティビティはまだありません。' },
    'activitySubtitle': { en: 'Track recent progress, updates, and events across all your workspaces.', ko: '모든 워크스페이스에 걸친 최근 진행 상황, 업데이트 및 이벤트를 추적합니다.', zh: '跟踪所有工作区的最新进展、更新与事件。', ja: 'すべてのワークスペースの最新の進捗、更新、イベントを追跡します。' },
    'viewProject': { en: 'View Project', ko: '프로젝트 보기', zh: '查看项目', ja: 'プロジェクトを見る' },

    // Dashboard
    'developerConsole': { en: 'VibePlanner Dashboard', ko: 'VibePlanner 대시보드', zh: 'VibePlanner 仪表板', ja: 'VibePlanner ダッシュボード' },
    'developerConsoleSubtitle': { en: 'Real-time synchronization with MCP local context. Track your coding progress effortlessly.', ko: 'MCP 로컬 컨텍스트와 실시간 동기화. 코딩 진행 상황을 쉽게 추적하세요.', zh: '与 MCP 本地上下文实时同步,轻松跟踪您的编码进度。', ja: 'MCP ローカルコンテキストとリアルタイム同期。コーディングの進捗を簡単に追跡できます。' },
    'activeProjects': { en: 'Active Projects', ko: '진행 중인 프로젝트', zh: '进行中的项目', ja: '進行中のプロジェクト' },
    'project': { en: 'Project', ko: '프로젝트', zh: '项目', ja: 'プロジェクト' },
    'projects': { en: 'Projects', ko: '프로젝트', zh: '项目', ja: 'プロジェクト' },
    'noProjectsFound': { en: 'No Projects Found', ko: '프로젝트를 찾을 수 없습니다', zh: '未找到项目', ja: 'プロジェクトが見つかりません' },
    'getStartedByCreatingProject': { en: 'Get started by creating a project via the MCP tool from your AI assistant.', ko: 'AI 어시스턴트의 MCP 도구를 통해 프로젝트를 생성하여 시작하세요.', zh: '通过 AI 助手的 MCP 工具创建项目以开始。', ja: 'AI アシスタントの MCP ツールでプロジェクトを作成して始めましょう。' },
    'noDescriptionProvided': { en: 'No description provided.', ko: '설명이 제공되지 않았습니다.', zh: '未提供说明。', ja: '説明はありません。' },

    // Admin & Settings Pages
    'mcpIntegrations': { en: 'MCP Integrations', ko: 'MCP 연동', zh: 'MCP 集成', ja: 'MCP 連携' },
    'mcpIntegrationsSubtitle': { en: 'View and manage Model Context Protocol features currently active in your VibePlanner server.', ko: 'VibePlanner 서버에서 현재 활성화된 Model Context Protocol 기능을 확인하고 관리합니다.', zh: '查看并管理当前在 VibePlanner 服务器中激活的 Model Context Protocol 功能。', ja: 'VibePlanner サーバーで現在有効な Model Context Protocol 機能を確認・管理します。' },
    'availableCapabilities': { en: 'Available Capabilities', ko: '사용 가능한 기능', zh: '可用功能', ja: '利用可能な機能' },
    'adminUsers': { en: 'Admin Users', ko: '관리자 계정', zh: '管理员账号', ja: '管理者アカウント' },
    'adminUsersSubtitle': { en: 'Manage the active members in this VibePlanner deployment.', ko: '이 VibePlanner 배포에 참여 중인 활성 멤버를 관리합니다.', zh: '管理此 VibePlanner 部署中的活跃成员。', ja: 'この VibePlanner デプロイメントのアクティブメンバーを管理します。' },
    'addUser': { en: 'Add new user', ko: '새 사용자 추가', zh: '添加新用户', ja: '新規ユーザーを追加' },
    'userName': { en: 'Name', ko: '이름', zh: '姓名', ja: '名前' },
    'userEmail': { en: 'Email', ko: '이메일', zh: '电子邮件', ja: 'メール' },
    'userNamePlaceholder': { en: 'e.g., Alice Developer', ko: '예: 홍길동', zh: '例如:张三', ja: '例:山田太郎' },
    'userEmailPlaceholder': { en: 'e.g., alice@example.com', ko: '예: hong@example.com', zh: '例如:zhang@example.com', ja: '例:yamada@example.com' },
    'addUserButton': { en: 'Add User', ko: '추가하기', zh: '添加用户', ja: '追加する' },
    'userId': { en: 'User ID', ko: '사용자 ID', zh: '用户 ID', ja: 'ユーザー ID' },
    'userRole': { en: 'Role', ko: '권한', zh: '角色', ja: '権限' },
    'userActions': { en: 'Actions', ko: '작업', zh: '操作', ja: '操作' },
    'owner': { en: 'Owner', ko: '소유자', zh: '所有者', ja: 'オーナー' },
    'member': { en: 'Member', ko: '멤버', zh: '成员', ja: 'メンバー' },
    'removeUser': { en: 'Remove user', ko: '사용자 제거', zh: '移除用户', ja: 'ユーザーを削除' },
    'cannotDeleteOwner': { en: 'The default admin owner cannot be deleted.', ko: '기본 관리자 소유자는 삭제할 수 없습니다.', zh: '无法删除默认管理员所有者。', ja: 'デフォルトの管理者オーナーは削除できません。' },
    'confirmDeleteUser': { en: 'Are you sure you want to delete this user? All their API keys will be revoked.', ko: '이 사용자를 삭제하시겠습니까? 관련 API 키가 모두 취소됩니다.', zh: '确定要删除此用户吗?其所有 API 密钥将被撤销。', ja: 'このユーザーを削除しますか?関連する API キーはすべて失効します。' },
    'failedToDeleteUser': { en: 'Failed to delete user.', ko: '사용자 삭제에 실패했습니다.', zh: '删除用户失败。', ja: 'ユーザーの削除に失敗しました。' },
    'failedToCreateUser': { en: 'Failed to create user', ko: '사용자 생성에 실패했습니다', zh: '创建用户失败', ja: 'ユーザーの作成に失敗しました' },
    'apiKeysSubtitle': { en: 'Manage your secret API keys. Use these keys to authenticate external MCP clients, CI/CD pipelines, or custom scripts to your VibePlanner server.', ko: '비밀 API 키를 관리합니다. 이 키를 사용하여 외부 MCP 클라이언트 등을 VibePlanner 서버에 인증하세요.', zh: '管理您的密钥 API 密钥。使用这些密钥对外部 MCP 客户端、CI/CD 流水线或自定义脚本进行身份验证。', ja: 'シークレット API キーを管理します。これらのキーを使用して外部 MCP クライアント等を VibePlanner サーバーに認証します。' },
    'createSecretKey': { en: 'Create new secret key', ko: '새 비밀 키 생성', zh: '创建新密钥', ja: '新規シークレットキーを作成' },
    'keyName': { en: 'Name', ko: '이름', zh: '名称', ja: '名前' },
    'keyNamePlaceholder': { en: 'e.g., Production Core API', ko: '예: 프로덕션 코어 API', zh: '例如:生产核心 API', ja: '例:本番コア API' },
    'createSecretKeyButton': { en: 'Create secret key', ko: '비밀 키 생성', zh: '创建密钥', ja: 'シークレットキーを作成' },
    'saveSecretKey': { en: 'Save your secret key', ko: '비밀 키 저장', zh: '保存您的密钥', ja: 'シークレットキーを保存' },
    'saveSecretKeyDesc': { en: "Please copy this key and save it somewhere safe. For security reasons, you won't be able to see it again after you leave this page.", ko: '이 키를 복사하여 안전한 곳에 저장하세요. 보안상의 이유로 이 페이지를 벗어나면 다시 볼 수 없습니다.', zh: '请复制此密钥并将其保存在安全的位置。出于安全考虑,离开此页面后将无法再次查看。', ja: 'このキーをコピーして安全な場所に保存してください。セキュリティ上の理由により、このページを離れると再度表示できません。' },
    'copy': { en: 'Copy', ko: '복사', zh: '复制', ja: 'コピー' },
    'secretKey': { en: 'Secret Key', ko: '비밀 키', zh: '密钥', ja: 'シークレットキー' },
    'created': { en: 'Created', ko: '생성일', zh: '创建时间', ja: '作成日' },
    'lastUsed': { en: 'Last Used', ko: '마지막 사용', zh: '最后使用', ja: '最終使用' },
    'noApiKeysGeneratedYet': { en: 'No API keys generated yet.', ko: '생성된 API 키가 없습니다.', zh: '尚未生成 API 密钥。', ja: 'まだ API キーが生成されていません。' },
    'never': { en: 'Never', ko: '사용 안함', zh: '从未使用', ja: '未使用' },
    'revokeKey': { en: 'Revoke key', ko: '키 취소', zh: '撤销密钥', ja: 'キーを失効' },
    'confirmRevokeKey': { en: 'Are you sure you want to revoke this key? Any integrations using it will instantly fail.', ko: '이 키를 취소하시겠습니까? 이를 사용하는 모든 연동이 즉시 실패합니다.', zh: '确定要撤销此密钥吗?使用此密钥的所有集成将立即失败。', ja: 'このキーを失効しますか?このキーを使用するすべての連携が即座に失敗します。' },
    'failedToGenerateKey': { en: 'Failed to generate key', ko: '키 생성에 실패했습니다', zh: '密钥生成失败', ja: 'キーの生成に失敗しました' },
    'failedToRevokeKey': { en: 'Failed to revoke key', ko: '키 취소에 실패했습니다', zh: '密钥撤销失败', ja: 'キーの失効に失敗しました' },
    'systemAnalytics': { en: 'System Analytics', ko: '시스템 통계', zh: '系统统计', ja: 'システム統計' },
    'systemAnalyticsSubtitle': { en: 'Monitor your workspace activities, project metrics, and system performance over time.', ko: '워크스페이스 활동, 프로젝트 지표 및 시스템 성능을 시간에 따라 모니터링합니다.', zh: '监控工作区活动、项目指标以及系统性能随时间的变化。', ja: 'ワークスペースのアクティビティ、プロジェクト指標、システムパフォーマンスを経時的に監視します。' },
    'backToDashboard': { en: 'Back to Dashboard', ko: '대시보드로 돌아가기', zh: '返回仪表板', ja: 'ダッシュボードに戻る' },
    'totalProjects': { en: 'Total Projects', ko: '전체 프로젝트', zh: '项目总数', ja: '全プロジェクト' },
    'registeredUsers': { en: 'Registered Users', ko: '등록된 사용자', zh: '已注册用户', ja: '登録ユーザー' },
    'totalTasks': { en: 'Total Tasks', ko: '전체 작업', zh: '任务总数', ja: '全タスク' },
    'avgCompletion': { en: 'Avg Completion', ko: '평균 완료율', zh: '平均完成率', ja: '平均完了率' },
    'taskPipelineDistribution': { en: 'Task Pipeline Distribution', ko: '작업 파이프라인 분포', zh: '任务管道分布', ja: 'タスクパイプライン分布' },
    'todoStatus': { en: 'To Do', ko: '할 일', zh: '待办', ja: '未着手' },
    'inProgressStatus': { en: 'In Progress', ko: '진행 중', zh: '进行中', ja: '進行中' },
    'completedStatus': { en: 'Completed', ko: '완료됨', zh: '已完成', ja: '完了' },

    // Integrations Text
    'clientConfiguration': { en: 'Client Configuration', ko: '클라이언트 구성', zh: '客户端配置', ja: 'クライアント設定' },
    'required': { en: 'REQUIRED', ko: '필수', zh: '必需', ja: '必須' },
    'clientConfigDesc': { en: "To enable automated task synchronization between your AI assistant (like Claude Desktop or Cursor) and VibePlanner, configure your client's mcp.json with the following settings.", ko: 'AI 어시스턴트(Claude Desktop, Cursor 등)와 VibePlanner 간의 자동 작업 동기화를 활성화하려면 클라이언트의 mcp.json에 다음 설정을 구성하세요.', zh: '要启用 AI 助手(如 Claude Desktop 或 Cursor)与 VibePlanner 之间的自动任务同步,请在客户端的 mcp.json 中配置以下设置。', ja: 'AI アシスタント(Claude Desktop や Cursor など)と VibePlanner の自動タスク同期を有効にするには、クライアントの mcp.json に以下の設定を構成してください。' },
    'localMcpServerStatus': { en: 'Local MCP Server Status', ko: '로컬 MCP 서버 상태', zh: '本地 MCP 服务器状态', ja: 'ローカル MCP サーバーの状態' },
    'mcpServerReady': { en: 'Ready to accept incoming standard I/O connections.', ko: '수신 표준 I/O 연결을 수락할 준비가 되었습니다.', zh: '已准备好接受传入的标准 I/O 连接。', ja: '標準 I/O 接続を受け付ける準備ができました。' },
    'mcpCapabilitiesDesc': { en: 'The VibePlanner MCP server exposes these autonomous tools to your AI agent.', ko: 'VibePlanner MCP 서버는 AI 에이전트에게 다음과 같은 자율 도구들을 제공합니다.', zh: 'VibePlanner MCP 服务器向您的 AI 代理公开以下自主工具。', ja: 'VibePlanner MCP サーバーは AI エージェントに以下の自律ツールを提供します。' },
    'toolListProjects': { en: 'Fetch all active kanban projects.', ko: '모든 활성 칸반 프로젝트를 가져옵니다.', zh: '获取所有活跃的看板项目。', ja: 'すべてのアクティブなカンバンプロジェクトを取得します。' },
    'toolCreateProject': { en: 'Initialize a new tracking board.', ko: '새로운 트래킹 보드를 초기화합니다.', zh: '初始化新的跟踪看板。', ja: '新しいトラッキングボードを初期化します。' },
    'toolGetKanbanBoard': { en: 'Retrieve accurate column layout.', ko: '정확한 열 레이아웃을 검색합니다.', zh: '获取准确的列布局。', ja: '正確な列レイアウトを取得します。' },
    'toolCreateTask': { en: 'Add new tasks to the TODO column.', ko: 'TODO 열에 새 작업을 추가합니다.', zh: '向 TODO 列添加新任务。', ja: 'TODO 列に新規タスクを追加します。' },
    'toolUpdateTaskStatus': { en: 'Move a task across swimlanes.', ko: '스윔레인 간 작업을 이동합니다.', zh: '在泳道之间移动任务。', ja: 'スイムレーン間でタスクを移動します。' },
    'toolUpdateTaskDetails': { en: 'Modify descriptions & work logs.', ko: '설명 및 작업 로그를 수정합니다.', zh: '修改说明与工作日志。', ja: '説明と作業ログを編集します。' },
    'toolGetProjectDocument': { en: 'Fetch a specific project document.', ko: '특정 프로젝트 문서를 가져옵니다.', zh: '获取特定的项目文档。', ja: '特定のプロジェクトドキュメントを取得します。' },
    'toolUpdateProjectDocument': { en: 'Update or create a project document.', ko: '프로젝트 문서를 업데이트하거나 생성합니다.', zh: '更新或创建项目文档。', ja: 'プロジェクトドキュメントを更新または作成します。' },
    'toolGetProjectDocumentVersions': { en: 'Retrieve document version history.', ko: '문서 버전 기록을 검색합니다.', zh: '获取文档版本历史。', ja: 'ドキュメントのバージョン履歴を取得します。' },
    'toolRestoreProjectDocumentVersion': { en: 'Restore a document to an older version.', ko: '문서를 이전 버전으로 복원합니다.', zh: '将文档恢复到旧版本。', ja: 'ドキュメントを以前のバージョンに復元します。' },
    'toolDeleteProject': { en: 'Delete a project and all related data.', ko: '프로젝트와 관련 데이터를 모두 삭제합니다.', zh: '删除项目及其所有相关数据。', ja: 'プロジェクトと関連データをすべて削除します。' },
    'toolDeleteTask': { en: 'Delete a task and its comments.', ko: '태스크와 댓글을 삭제합니다.', zh: '删除任务及其评论。', ja: 'タスクとコメントを削除します。' },
    'toolGetTask': { en: 'Retrieve detailed task information.', ko: '태스크 상세 정보를 조회합니다.', zh: '查询任务详细信息。', ja: 'タスクの詳細情報を取得します。' },
    'toolAddComment': { en: 'Add a comment to a task.', ko: '태스크에 코멘트를 추가합니다.', zh: '向任务添加评论。', ja: 'タスクにコメントを追加します。' },
    'toolGetComments': { en: 'Retrieve all comments on a task.', ko: '태스크의 모든 코멘트를 조회합니다.', zh: '获取任务的所有评论。', ja: 'タスクのすべてのコメントを取得します。' },
    'toolUpdateProject': { en: 'Update project name or description.', ko: '프로젝트 이름이나 설명을 수정합니다.', zh: '更新项目名称或说明。', ja: 'プロジェクト名や説明を更新します。' },
    'toolGetAnalytics': { en: 'Retrieve project & task analytics.', ko: '프로젝트 및 태스크 통계를 조회합니다.', zh: '获取项目与任务统计。', ja: 'プロジェクトとタスクの統計を取得します。' },
    'toolGetRecentTasks': { en: 'Fetch recently updated tasks.', ko: '최근 업데이트된 태스크를 조회합니다.', zh: '获取最近更新的任务。', ja: '最近更新されたタスクを取得します。' },
    'toolAppendProjectDocument': { en: 'Atomically append one item to an array document (ISSUE_TRACKER, CODE_REVIEW, TEST, DEPLOY).', ko: 'Array 기반 문서(ISSUE_TRACKER, CODE_REVIEW, TEST, DEPLOY)에 항목 1개를 원자적으로 추가합니다.', zh: '向数组文档(ISSUE_TRACKER、CODE_REVIEW、TEST、DEPLOY)原子地追加一项。', ja: '配列ドキュメント(ISSUE_TRACKER、CODE_REVIEW、TEST、DEPLOY)にアイテムを原子的に追加します。' },
    'toolSaveYcAnswers': { en: 'Save YC 6-Question answers for the Ideation phase.', ko: 'Ideation 단계의 YC 6가지 질문 응답을 저장합니다.', zh: '保存构思阶段的 YC 六大问题答案。', ja: '企画フェーズの YC 6 質問への回答を保存します。' },
    'toolGetYcAnswers': { en: 'Get the latest YC 6-Question answers for a project.', ko: '프로젝트의 최신 YC 6가지 질문 응답을 조회합니다.', zh: '获取项目最新的 YC 六大问题答案。', ja: 'プロジェクトの最新 YC 6 質問への回答を取得します。' },
    'toolSavePlanReview': { en: 'Save a Plan Review (kind: ceo/eng/design/devex). Writes DB row + MD snapshot.', ko: 'Plan Review를 저장합니다 (kind: ceo/eng/design/devex). DB 행 + MD 스냅샷이 함께 작성됩니다.', zh: '保存 Plan Review(类型:ceo/eng/design/devex)。写入 DB 行与 MD 快照。', ja: 'Plan Review を保存します(種類:ceo/eng/design/devex)。DB 行と MD スナップショットを書き込みます。' },
    'toolListPlanReviews': { en: 'List Plan Reviews for a project, optionally filtered by kind.', ko: '프로젝트의 Plan Review 목록을 조회합니다 (kind 필터 지원).', zh: '列出项目的 Plan Review(可按类型过滤)。', ja: 'プロジェクトの Plan Review 一覧を取得します(種類フィルタ対応)。' },
    'toolGetPlanReview': { en: 'Get a Plan Review by id.', ko: 'ID로 Plan Review를 단건 조회합니다.', zh: '按 ID 获取单个 Plan Review。', ja: 'ID で Plan Review を 1 件取得します。' },
    'toolCategoryProject': { en: 'Project Management', ko: '프로젝트 관리', zh: '项目管理', ja: 'プロジェクト管理' },
    'toolCategoryTask': { en: 'Task Management', ko: '태스크 관리', zh: '任务管理', ja: 'タスク管理' },
    'toolCategoryDocument': { en: 'Document Management', ko: '문서 관리', zh: '文档管理', ja: 'ドキュメント管理' },
    'toolCategoryAnalytics': { en: 'Analytics & Overview', ko: '분석 & 개요', zh: '分析与概览', ja: '分析と概要' },
    'toolCategoryPlanReview': { en: 'Plan Review (gstack)', ko: 'Plan Review (gstack)', zh: 'Plan Review (gstack)', ja: 'Plan Review (gstack)' },

    // Common actions (used by feature components)
    'common.save': { en: 'Save', ko: '저장', zh: '保存', ja: '保存' },
    'common.saving': { en: 'Saving...', ko: '저장 중...', zh: '保存中...', ja: '保存中...' },
    'common.loading': { en: 'Loading...', ko: '로딩 중...', zh: '加载中...', ja: '読み込み中...' },

    // YC 6 Questions (Ideation) — used by YCQuestionsCard
    'yc.title': { en: 'YC 6 Questions (Ideation)', ko: 'YC 6가지 질문 (Ideation)', zh: 'YC 六大问题(构思阶段)', ja: 'YC 6 質問(企画)' },
    'yc.q1': { en: 'Demand reality: who and how many asked for this?', ko: '수요 현실: 누가, 몇 명이 이걸 요청했나?', zh: '需求现实:谁提出的?有多少人?', ja: '需要の現実:誰が、何人がこれを求めたのか?' },
    'yc.q1.placeholder': { en: 'Specific users/teams and counts', ko: '구체적 사용자/팀명과 횟수', zh: '具体用户/团队与数量', ja: '具体的なユーザー/チームと件数' },
    'yc.q2': { en: 'What is actually broken about the status quo?', ko: '현상 유지의 진짜 문제는?', zh: '现状到底有什么问题?', ja: '現状の本当の問題は何か?' },
    'yc.q2.placeholder': { en: 'Pain points of the current way', ko: '지금 방식의 고통점', zh: '当前方式的痛点', ja: '現行方法の問題点' },
    'yc.q3': { en: 'Desperate specificity', ko: '절박한 구체성', zh: '迫切的具体性', ja: '切実な具体性' },
    'yc.q3.placeholder': { en: 'One most specific use case', ko: '가장 구체적인 유스케이스 1개', zh: '一个最具体的用例', ja: '最も具体的なユースケース 1 つ' },
    'yc.q4': { en: 'Narrowest wedge', ko: '가장 좁은 웨지', zh: '最窄切入点', ja: '最も狭いウェッジ' },
    'yc.q4.placeholder': { en: 'Minimal entry scope', ko: '최소 진입 범위', zh: '最小进入范围', ja: '最小限の参入範囲' },
    'yc.q5': { en: 'Observation', ko: '관찰', zh: '观察', ja: '観察' },
    'yc.q5.placeholder': { en: 'Evidence from real usage observation', ko: '실제 사용 관찰 증거', zh: '来自实际使用观察的证据', ja: '実使用の観察から得た証拠' },
    'yc.q6': { en: 'Future-fit', ko: 'Future-fit', zh: '未来契合度', ja: 'Future-fit' },
    'yc.q6.placeholder': { en: 'Still valid in 12 months?', ko: '1년 뒤에도 유효한가?', zh: '12 个月后仍然有效吗?', ja: '1 年後も有効か?' },

    // Plan Review — kind labels
    'planReview.kind.ceo': { en: 'CEO Review', ko: 'CEO 리뷰', zh: 'CEO 审查', ja: 'CEO レビュー' },
    'planReview.kind.eng': { en: 'Engineering Review', ko: '엔지니어링 리뷰', zh: '工程审查', ja: 'エンジニアリングレビュー' },
    'planReview.kind.design': { en: 'Design Review', ko: '디자인 리뷰', zh: '设计审查', ja: 'デザインレビュー' },
    'planReview.kind.devex': { en: 'DevEx Review', ko: 'DevEx 리뷰', zh: 'DevEx 审查', ja: 'DevEx レビュー' },

    // Plan Review — decision labels
    'planReview.decision.accept': { en: 'Accept', ko: '수락', zh: '接受', ja: '承認' },
    'planReview.decision.revise': { en: 'Revise', ko: '수정', zh: '修订', ja: '修正' },
    'planReview.decision.reject': { en: 'Reject', ko: '거절', zh: '拒绝', ja: '却下' },

    // Strategy Readiness (Overview dashboard widgets)
    'strategyReadinessTitle':    { en: 'Strategy Readiness',   ko: '전략 준비도', zh: '战略就绪度', ja: '戦略準備度' },
    'ycCompletionLabel':         { en: 'YC completion',        ko: 'YC 완료율', zh: 'YC 完成率', ja: 'YC 完了率' },
    'planReviewAvgLabel':        { en: 'Plan review avg',      ko: 'Plan Review 평균', zh: 'Plan Review 平均', ja: 'Plan Review 平均' },
    'ycMissingTop3Title':        { en: 'Top 3 projects missing YC answers', ko: 'YC 미응답 Top 3', zh: '缺少 YC 答案的前 3 个项目', ja: 'YC 未回答プロジェクト Top 3' },
    'recentPlanReviewsTitle':    { en: 'Recent Plan Reviews',  ko: '최근 Plan Review', zh: '最近的 Plan Review', ja: '最近の Plan Review' },
    'startIdeationCta':          { en: 'Start Ideation',       ko: 'Ideation 시작하기', zh: '开始构思', ja: '企画を開始' },
};

interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    /** @deprecated Use setLanguage. Retained for backward compatibility — cycles through supported languages. */
    toggleLanguage: () => void;
    t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function isSupportedLanguage(value: string | null): value is Language {
    return value !== null && (SUPPORTED_LANGUAGES as string[]).includes(value);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('ko');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setTimeout(() => setMounted(true), 0);
        const savedLang = localStorage.getItem('vibe-planner-language');
        if (isSupportedLanguage(savedLang)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('vibe-planner-language', lang);
    };

    const toggleLanguage = () => {
        const idx = SUPPORTED_LANGUAGES.indexOf(language);
        const next = SUPPORTED_LANGUAGES[(idx + 1) % SUPPORTED_LANGUAGES.length];
        setLanguage(next);
    };

    const t = (key: string): string => {
        if (!translations[key]) return key;
        return translations[key][language] || translations[key].en || key;
    };

    return (
        <I18nContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
            {/* mounted flag kept for potential hydration-sensitive consumers */}
            {mounted ? children : children}
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
