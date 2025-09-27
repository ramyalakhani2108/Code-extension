# Todo Task Reminder - VS Code Extension

A powerful VS Code extension that helps you manage todos and set task reminders directly within your development environment. Features a dedicated side panel for easy access and smart notifications to keep you on track.

## Features

### 🎯 **Side Panel Integration**
- Dedicated activity bar icon for quick access
- Clean, intuitive tree view for managing todos
- Similar UX to popular extensions like GitLens and GitHub Copilot

### ✅ **Smart Todo Management**
- Add todos with different priority levels (High, Medium, Low)
- Set due dates with quick options (Today, Tomorrow, This week, Custom)
- Mark todos as complete/incomplete
- Edit todo text inline
- Delete todos with confirmation

### 🔔 **Smart Reminders & Notifications**
- Set custom reminders for any todo
- Quick reminder options (5 min, 15 min, 30 min, 1 hour, etc.)
- Smart notifications with action buttons (Complete, Snooze, Dismiss)
- Automatic overdue todo detection
- Hourly background checks for overdue tasks

### 🎨 **Visual Indicators**
- Color-coded priority levels (Red for High, Yellow for Medium)
- Status icons (✓ for completed, ⚠️ for overdue, 🔥 for due today)
- Rich tooltips with detailed information
- Smart sorting (priority first, then due date)

### 💾 **Persistent Storage**
- Todos are saved automatically to VS Code's global state
- Data persists across VS Code sessions
- No external dependencies required

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

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/your-username/todo-task-reminder/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/your-username/todo-task-reminder/discussions)
- 📧 **Email**: your-email@example.com

## Acknowledgments

- Inspired by productivity tools like GitLens and GitHub Copilot
- Built with the VS Code Extension API
- Icons from VS Code's built-in icon set

---

**Happy Coding! 🚀**

*Built with ❤️ for developers who want to stay organized while coding*
