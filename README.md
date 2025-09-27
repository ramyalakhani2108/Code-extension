# Todo Task Reminder - VS Code Extension

A powerful VS Code extension that helps you manage todos and set task reminders directly within your development environment. Features a dedicated side panel for easy access and smart notifications to keep you on track.

## ✨ Features

### � **Modern UI/UX Design**
- 🏗️ **Hierarchical Organization** - Tasks grouped by projects, priority, and status
- 📱 **Professional Interface** - Clean, modern design following VS Code guidelines  
- 🎯 **Interactive Detail View** - Click any task to open comprehensive details panel
- 💫 **Smart Visual Indicators** - Priority colors, status icons, and urgency badges
- 🚀 **Quick Actions** - Inline buttons and context menus for efficiency

### 🎯 **Professional Side Panel Integration**
- 📊 **Activity Bar Integration** - Dedicated sidebar like GitLens/GitHub extensions
- 🏷️ **Smart Grouping** - Automatic organization by urgency, projects, and completion
- 🎪 **Interactive Tree View** - Click to expand/collapse groups and view details
- 🎨 **VS Code Theme Support** - Adapts to your editor theme automatically

### ✅ **Advanced Todo Management**
- 📝 **Enhanced Creation Flow** - 4-step guided todo creation with project support
- 📁 **Project Organization** - Categorize and group tasks by project names
- ⭐ **Smart Priority System** - Visual priority levels (🔴 High, 🟡 Medium, ⚪ Low)
- 🔄 **Real-time Updates** - Instant refresh and synchronization
- ✏️ **Rich Editing** - Inline editing with comprehensive detail views

### 🔔 **Intelligent Reminders & Notifications**
- 🎯 **Natural Language Support** - "tomorrow at 2pm", "next Friday at 9am"
- ⏰ **Smart Quick Options** - Contextual time suggestions (5min, 1hr, tomorrow 9am)
- 💡 **AI-Powered Suggestions** - Intelligent reminder time recommendations
- 🔔 **Rich Notifications** - Action buttons (Complete, Snooze, Dismiss)
- ⚠️ **Overdue Detection** - Automatic identification with visual warnings

### 🎨 **Enhanced Visual Experience**
- 🌈 **Dynamic Icons** - Priority-based icons (🔥 urgent, ⚠️ overdue, ✅ completed)
- 📊 **Status Badges** - Real-time status indicators with emoji support
- 🎯 **Urgency Highlighting** - Visual emphasis for time-sensitive tasks
- 📅 **Smart Descriptions** - Contextual due date and priority information
- 🎪 **Welcome Screen** - Guided onboarding for new users

### �️ **Advanced Multi-Level Grouping & Filtering**
- 🏗️ **3-Level Deep Grouping** - Primary → Secondary → Tertiary organization
- 📅 **Smart Date Grouping** - Today → This Week → Future with intelligent sorting
- 🎯 **Status-Based Grouping** - Urgent → Overdue → Active → Completed
- ⭐ **Priority Grouping** - High → Medium → Low with visual hierarchy
- 📁 **Project Grouping** - Organize by project with task counts and urgency indicators
- 🔍 **Advanced Filtering** - Multi-criteria filtering with search functionality
- ⚡ **Quick Filters** - One-click filters for common views (Today, High Priority, Overdue)
- 🎨 **Custom Filter Builder** - Step-by-step guided filter creation
- 💾 **Persistent Settings** - Grouping and filter preferences saved automatically

### �💾 **Advanced Data Management**
- 📝 **Persistent Task Logging** - Automatic logging to `~/vscode-todo-tasks.txt`
- 🗂️ **Structured File Format** - Organized by date and project with proper indentation
- 💾 **Global State Storage** - Secure storage across VS Code sessions
- 📄 **Integrated Log Viewer** - One-click access to task history file
- 🔄 **Automatic Backup** - Continuous task logging for data safety

## 🚀 How to Use

### 🎯 **Getting Started**
1. **Find the Extension** - Look for the 📋 **Todo Manager** icon in the Activity Bar (left sidebar)
2. **Open the Panel** - Click the icon to open your todo management sidebar
3. **Add Your First Todo** - Click the `+` button or use the welcome prompt

### 📝 **Creating Todos**
- **Quick Add**: Use the `+` button in the toolbar for instant todo creation
- **Enhanced Creator**: Get guided 4-step creation with project assignment
- **Command Palette**: `Ctrl/Cmd+Shift+P` → "Todo: Add Todo"

### 🎪 **Navigating the Interface**
- **Hierarchical View**: Tasks are automatically grouped by:
  - 🔥 **Urgent Tasks** (high priority or due soon)
  - 📋 **Active Tasks** (normal priority pending tasks)  
  - 📁 **Projects** (when project names are assigned)
  - ✅ **Completed Tasks** (finished todos)

### 🔍 **Task Details & Management**
- **Click Task Name** - Opens comprehensive detail view with full task information and metadata
- **Smart Single Tab Management** - Prevents duplicate detail panels, reuses existing tabs
- **Enhanced Inline Action Buttons** - Quick access to common operations:
  - ✅ **Complete/Incomplete** - Toggle task completion status
  - ✏️ **Advanced Edit** - Modify task text AND priority in guided workflow
  - 🔔 **Set Reminder** - Add or update task reminders with smart suggestions
  - 🗑️ **Delete** - Remove task with confirmation
- **Right-Click Context Menu** - Additional options and quick filters
- **Visual Status Indicators** - Priority colors, completion status, and urgency badges

### ✏️ **Advanced Task Editing**
- **2-Step Edit Process**: First edit text, then optionally change priority
- **Smart Priority Selection**: Visual priority picker with descriptions
- **Flexible Workflow**: Edit text only, priority only, or both together
- **Real-time Updates**: Changes reflect immediately in sidebar and detail view
- **Validation**: Input validation prevents empty tasks and overly long descriptions

### ⏰ **Smart Reminders**
- **Natural Language**: Type "tomorrow at 2pm" or "next Friday"
- **Quick Options**: Choose from contextual suggestions
- **Smart Suggestions**: AI-powered time recommendations
- **Rich Notifications**: Get actionable reminder popups

### 📊 **Project Organization**
- **Assign Projects**: Add project names during todo creation
- **Auto-Grouping**: Tasks automatically group by project
- **Project Overview**: See task counts and urgency indicators
- **Cross-Project View**: Switch between project-focused and priority-focused views

### �️ **Advanced Grouping & Organization**
- **Multi-Level Grouping**: Click the 🗂️ **Change Grouping** button in toolbar
  - **Recommended**: Date → Status → Priority (Recent tasks first)
  - **Status Focus**: Status → Priority → Project
  - **Priority Focus**: Priority → Date → Project  
  - **Project Focus**: Project → Status → Priority
- **Dynamic Hierarchy**: Up to 3 levels deep with intelligent sorting
- **Visual Indicators**: Each group shows task counts, urgency, and completion stats

### 🔍 **Advanced Filtering System**
- **Quick Filters**: Use toolbar buttons for instant filtering
  - 📅 **Today's Tasks** - Focus on today's work
  - 🔥 **High Priority** - Show only urgent tasks
  - ⚠️ **Overdue Tasks** - Catch up on missed deadlines
- **Advanced Filter Builder**: Click 🔍 **Advanced Filter** for custom combinations
  - **Multi-Criteria**: Combine status, priority, date range, and project filters
  - **Search Integration**: Add text search within task names and projects
  - **Smart Presets**: Common filter combinations with one click
- **Filter Persistence**: Your filter preferences are automatically saved

### �📝 **Task Logging**
- **Automatic Logging**: All tasks are logged to `~/vscode-todo-tasks.txt`
- **Structured Format**: Organized by date and project with proper indentation
- **Quick Access**: Use "View Task Log" command or detail view button
- **Historical Tracking**: Complete audit trail of all todo activities

## Installation & Setup

### Prerequisites
- VS Code version 1.104.0 or higher
- Node.js and npm (for development)

### Development Setup
1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to build the extension
4. Press `F5` to launch a new VS Code window with the extension loaded

### From VSIX Package
1. Build the extension: `npm run package`
2. Install via Command Palette: "Extensions: Install from VSIX..."

## Usage

### Getting Started
1. After installation, look for the "Todo Task Manager" icon in the activity bar (left sidebar)
2. Click the icon to open the todo panel
3. Click the "+" button to add your first todo

### Adding Todos
1. Click the "Add Todo" button (+ icon) in the todo panel
2. Enter your todo text
3. Select priority level (High, Medium, Low)
4. Optionally set a due date
5. Your todo will appear in the list

### Managing Todos
- **Complete/Uncomplete**: Click the checkmark icon
- **Edit**: Click the edit icon and modify the text
- **Set Reminder**: Click the bell icon and choose when to be reminded
- **Delete**: Click the trash icon (requires confirmation)

### Reminder Options
- **Quick Options**: 5 min, 15 min, 30 min, 1 hour, 2 hours
- **Scheduled**: Tomorrow at 9 AM
- **Custom**: Set any date and time using standard formats

## Commands

All commands are accessible via the Command Palette (`Ctrl+Shift+P`):

- `todoManager.addTodo` - Add a new todo
- `todoManager.refreshTodos` - Refresh the todo list
- Context menu commands available on individual todos

## Extension Settings

This extension contributes the following settings:

Currently, all settings are managed through the UI. Future versions may include:
- Default priority level
- Reminder notification preferences
- Due date display format
- Auto-refresh intervals

## Requirements

- VS Code 1.104.0 or higher
- No external dependencies or services required
- Works entirely offline

## Technical Details

### Architecture
- **TypeScript**: Fully typed codebase for reliability
- **Webpack**: Bundled for optimal performance
- **VS Code Tree Data Provider**: Native integration with VS Code's UI
- **Global State Storage**: Persistent data storage without external databases

### Data Storage
- Todos are stored in VS Code's `globalState`
- Data persists across workspace changes and VS Code restarts
- No external dependencies or cloud storage required

## Development

### Building the Extension
```bash
npm run compile          # Compile TypeScript
npm run watch           # Watch mode for development
npm run package         # Create VSIX package
npm run lint            # Run ESLint
npm run test            # Run tests
```

### Testing
1. Press `F5` to launch Extension Development Host
2. The extension will be loaded in the new window
3. Test all features in the development environment

### Debugging
- Set breakpoints in TypeScript files
- Use VS Code's built-in debugger
- Console logs appear in the Extension Host output

## Known Issues

- Reminders only work while VS Code is running
- Maximum reminder scheduling limited by JavaScript setTimeout constraints
- No synchronization between multiple VS Code instances

## Roadmap & Future Features

### v1.1.0 (Planned)
- [ ] Import/Export todos
- [ ] Categories and tags
- [ ] Search and filter functionality
- [ ] Bulk operations

### v1.2.0 (Planned)
- [ ] Integration with VS Code tasks
- [ ] Markdown support in todo descriptions
- [ ] Recurring reminders
- [ ] Statistics and productivity insights

### v2.0.0 (Future)
- [ ] Team collaboration features
- [ ] Cloud synchronization
- [ ] Mobile companion app
- [ ] Advanced reporting

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/your-ramyalakhani2108/Code-extension/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/ramyalakhani2108/Code-extension/discussions)
- 📧 **Email**: lakhani.ramya.u@gmail.com

## Acknowledgments

- Inspired by productivity tools like GitLens and GitHub Copilot
- Built with the VS Code Extension API
- Icons from VS Code's built-in icon set

---

**Happy Coding! 🚀**

*Built with ❤️ for developers who want to stay organized while coding*
