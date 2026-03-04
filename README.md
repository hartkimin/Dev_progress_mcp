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

## 🛠️ Installation

### 1. Clone & Core Setup

```bash
# Clone the repository
git clone https://github.com/hartkimin/Dev_progress_mcp.git
cd Dev_progress_mcp

# Install dependencies
npm install

# Build the MCP server
npm run build
```

### 2. Configure MCP Client

Add the following to your `mcp.json` configuration (e.g., in Claude Desktop or Cursor settings):

```json
{
  "mcpServers": {
    "vibe-planner": {
      "command": "node",
      "args": ["/absolute/path/to/Dev_progress_mcp/dist/index.js"],
      "env": {
        "DP_API_KEY": "your-secret-api-key"
      }
    }
  }
}
```

*Note: You can generate a `DP_API_KEY` in the Web Dashboard's API Keys section.*

### 3. Start the Web Dashboard

```bash
cd web
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see your dashboard.

## 🤖 Available MCP Tools

Your AI assistant can use these tools to manage your project autonomously:

-   `create_project`: Start a new tracking board.
-   `list_projects`: Fetch all active projects.
-   `create_task`: Add tasks to the pipeline (includes phase and category metadata).
-   `update_task_status`: Move tasks through the workflow.
-   `update_task_details`: Log work, update descriptions, and record "vibe" notes.
-   `get_kanban_board`: Retrieve a formatted Markdown view of the current state.

## 📸 Screenshots

### Dashboard Overview
![Dashboard Overview](./assets/dashboard_overview.png)

### Kanban & Process Stepper
![Kanban Board](./assets/kanban_board.png)

## 📄 License

ISC License. Built with ❤️ for the Vibe Coding community.
