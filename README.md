# VibePlanner (Vibe Coding Planner)

A Model Context Protocol (MCP) server & Next.js dashboard designed as a guided planner for vibe-coding beginners and pros alike.

VibePlanner helps you bridge the gap between "vibe-coding" (AI-assisted rapid development) and disciplined project management. It tracks your progress through the **5 Phases of Vibe Coding**, seamlessly integrating with AI assistants like Cursor, Claude Desktop, and others via the Model Context Protocol.

## 🚀 The 5 Phases of Vibe Coding

VibePlanner guides you through a structured development pipeline:

1.  **💡 Ideation & Requirements**: Define your vision, brainstorm features, and gather initial requirements.
2.  **🏗️ Architecture & Design**: Plan your tech stack, design the system architecture, and map out the user flow.
3.  **💻 Implementation**: Build the core features with the help of AI assistants, tracking every task and milestone.
4.  **🧪 Testing & QA**: Verify functionality, fix bugs, and ensure a high-quality user experience.
5.  **🚀 Deployment & Review**: Ship your application and gather feedback for the next iteration.

## ✨ Features

-   **MCP-Native**: First-class integration with AI coding assistants. Let your AI agent manage your tasks for you.
-   **Kanban Board**: Visual task management with swimlanes (TODO, IN_PROGRESS, REVIEW, DONE).
-   **Process Pipeline**: A visual stepper that automatically tracks which phase of the development lifecycle you're in.
-   **Multi-Language (i18n)**: Full support for English and Korean.
-   **Dark/Light Mode**: Beautifully designed UI that respects your system theme.
-   **Analytics**: Monitor project health, task distribution, and completion rates.
-   **Security**: Manage API keys and authorized users through the built-in admin dashboard.

---

## 🛠️ Deployment Guide

### Option 1: Quick Start with Docker (Recommended)

The easiest way to get the full stack (MCP Server + Web Dashboard) running.

```bash
# 1. Clone the repository
git clone https://github.com/hartkimin/Dev_progress_mcp.git
cd Dev_progress_mcp

# 2. Build and run with Docker Compose
docker-compose up -d --build
```
*The dashboard will be available at [http://localhost:3002](http://localhost:3002).*

### Option 2: Manual Installation (Development)

**Prerequisites**: Node.js 20+ and npm.

#### 1. Core MCP Server Setup
```bash
# From the project root
npm install
npm run build
```

#### 2. Web Dashboard Setup
```bash
cd web
npm install
npm run dev
```

### ⚙️ Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `DP_API_KEY` | Secret key used by the MCP Server to authenticate. | (Required) |
| `PORT` | Port number for the Web Dashboard. | `3000` (Dev) / `3002` (Docker) |
| `DB_PATH` | Path to the SQLite database file. | `./database.sqlite` |

---

## 🤖 Usage Guide

### 1. Generate an API Key
- Open the [Web Dashboard](http://localhost:3002).
- Navigate to **Settings > API Keys**.
- Create a new secret key (e.g., "My Cursor Key").
- **Copy and save this key immediately.** You will need it for your MCP client.

### 2. Configure Your MCP Client

#### For Claude Desktop
Add this to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "vibe-planner": {
      "command": "node",
      "args": ["/absolute/path/to/Dev_progress_mcp/dist/index.js"],
      "env": {
        "DP_API_KEY": "YOUR_GENERATED_KEY"
      }
    }
  }
}
```

#### For Cursor
- Go to **Cursor Settings > MCP**.
- Click **+ Add New MCP Server**.
- Name: `vibe-planner`
- Type: `command`
- Command: `node /absolute/path/to/Dev_progress_mcp/dist/index.js`
- Set Environment Variable: `DP_API_KEY=YOUR_GENERATED_KEY`

### 3. Start Vibe Coding!
Now you can ask your AI assistant:
- *"VibePlanner에서 새 프로젝트 'AI 챗봇'을 만들어줘."*
- *"현재 진행 중인 프로젝트 목록을 보여줘."*
- *"Architecture 단계에 'DB 스키마 설계' 작업을 추가해줘."*
- *"칸반 보드 상태를 확인해줄래?"*

---

## 📸 Screenshots

### Dashboard Overview
![Dashboard Overview](./assets/dashboard_overview.png)

### Kanban & Process Stepper
![Kanban Board](./assets/kanban_board.png)

## 📄 License

ISC License. Built with ❤️ for the Vibe Coding community.
