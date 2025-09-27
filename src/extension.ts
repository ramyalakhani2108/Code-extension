// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TodoTreeDataProvider, TodoTreeItem } from './todoProvider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	try {
		console.log('🚀 Todo Task Reminder extension is activating...');
		console.log('📍 Extension path:', context.extensionPath);
		console.log('� Global storage path:', context.globalStorageUri?.fsPath);

		// Create the todo tree data provider
		const todoProvider = new TodoTreeDataProvider(context);
		console.log('✅ TodoTreeDataProvider created successfully');
		
		// Register the tree data provider FIRST
		const treeDataProviderDisposable = vscode.window.registerTreeDataProvider('todoTreeView', todoProvider);
		console.log('✅ Tree data provider registered for todoTreeView');
		context.subscriptions.push(treeDataProviderDisposable);

		// Create tree view with enhanced options
		const treeView = vscode.window.createTreeView('todoTreeView', {
			treeDataProvider: todoProvider,
			canSelectMany: false,
			showCollapseAll: true
		});
		console.log('✅ Tree view created successfully');
		context.subscriptions.push(treeView);

		// Force initial refresh to ensure data is loaded
		setTimeout(() => {
			console.log('🔄 Triggering initial refresh...');
			todoProvider.refresh();
		}, 100);

	// Register commands
	const commands = [
		// Add Todo Command
		vscode.commands.registerCommand('todoManager.addTodo', async () => {
			const text = await vscode.window.showInputBox({
				placeHolder: 'Enter todo text...',
				prompt: 'What do you want to remember?'
			});

			if (text && text.trim()) {
				// Ask for priority
				const priority = await vscode.window.showQuickPick(
					['high', 'medium', 'low'],
					{
						placeHolder: 'Select priority',
						canPickMany: false
					}
				);

				// Ask for due date
				const dueDateOption = await vscode.window.showQuickPick(
					['No due date', 'Today', 'Tomorrow', 'This week', 'Custom date'],
					{
						placeHolder: 'Set due date (optional)',
						canPickMany: false
					}
				);

				let dueDate: Date | undefined;
				if (dueDateOption && dueDateOption !== 'No due date') {
					const now = new Date();
					switch (dueDateOption) {
						case 'Today':
							dueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59);
							break;
						case 'Tomorrow':
							dueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59);
							break;
						case 'This week':
							const daysUntilSunday = 7 - now.getDay();
							dueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday, 23, 59);
							break;
						case 'Custom date':
							const dateString = await vscode.window.showInputBox({
								placeHolder: 'YYYY-MM-DD or MM/DD/YYYY',
								prompt: 'Enter due date'
							});
							if (dateString) {
								dueDate = new Date(dateString);
								if (isNaN(dueDate.getTime())) {
									vscode.window.showErrorMessage('Invalid date format');
									return;
								}
							}
							break;
					}
				}

				todoProvider.addTodo(text.trim(), priority as any || 'medium', dueDate);
				vscode.window.showInformationMessage(`Todo "${text.trim()}" added successfully!`);
			}
		}),

		// Delete Todo Command
		vscode.commands.registerCommand('todoManager.deleteTodo', async (item: TodoTreeItem) => {
			if (item) {
				const confirmation = await vscode.window.showWarningMessage(
					`Are you sure you want to delete "${item.todo.text}"?`,
					'Yes', 'No'
				);
				
				if (confirmation === 'Yes') {
					todoProvider.deleteTodo(item.todo.id);
					vscode.window.showInformationMessage('Todo deleted successfully!');
				}
			}
		}),

		// Complete Todo Command
		vscode.commands.registerCommand('todoManager.completeTodo', (item: TodoTreeItem) => {
			if (item) {
				todoProvider.completeTodo(item.todo.id);
				const status = item.todo.completed ? 'marked as pending' : 'completed';
				vscode.window.showInformationMessage(`Todo ${status}!`);
			}
		}),

		// Edit Todo Command
		vscode.commands.registerCommand('todoManager.editTodo', async (item: TodoTreeItem) => {
			if (item) {
				const newText = await vscode.window.showInputBox({
					value: item.todo.text,
					prompt: 'Edit todo text'
				});

				if (newText && newText.trim() && newText.trim() !== item.todo.text) {
					todoProvider.editTodo(item.todo.id, newText.trim());
					vscode.window.showInformationMessage('Todo updated successfully!');
				}
			}
		}),

		// Set Reminder Command
		vscode.commands.registerCommand('todoManager.setReminder', async (item: TodoTreeItem) => {
			if (item) {
				const reminderOptions = [
					'In 5 minutes',
					'In 15 minutes',
					'In 30 minutes',
					'In 1 hour',
					'In 2 hours',
					'Tomorrow at 9 AM',
					'Custom time'
				];

				const selectedOption = await vscode.window.showQuickPick(reminderOptions, {
					placeHolder: 'When should I remind you?'
				});

				if (selectedOption) {
					let reminderTime: Date;
					const now = new Date();

					switch (selectedOption) {
						case 'In 5 minutes':
							reminderTime = new Date(now.getTime() + 5 * 60 * 1000);
							break;
						case 'In 15 minutes':
							reminderTime = new Date(now.getTime() + 15 * 60 * 1000);
							break;
						case 'In 30 minutes':
							reminderTime = new Date(now.getTime() + 30 * 60 * 1000);
							break;
						case 'In 1 hour':
							reminderTime = new Date(now.getTime() + 60 * 60 * 1000);
							break;
						case 'In 2 hours':
							reminderTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
							break;
						case 'Tomorrow at 9 AM':
							reminderTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0);
							break;
						case 'Custom time':
							const customTime = await vscode.window.showInputBox({
								placeHolder: 'YYYY-MM-DD HH:MM or MM/DD/YYYY HH:MM',
								prompt: 'Enter reminder date and time'
							});
							if (customTime) {
								reminderTime = new Date(customTime);
								if (isNaN(reminderTime.getTime())) {
									vscode.window.showErrorMessage('Invalid date/time format');
									return;
								}
							} else {
								return;
							}
							break;
						default:
							return;
					}

					if (reminderTime <= now) {
						vscode.window.showErrorMessage('Reminder time must be in the future');
						return;
					}

					todoProvider.setReminder(item.todo.id, reminderTime);
					vscode.window.showInformationMessage(`Reminder set for ${reminderTime.toLocaleString()}`);
				}
			}
		}),

		// Refresh Command
		vscode.commands.registerCommand('todoManager.refreshTodos', () => {
			todoProvider.refresh();
			vscode.window.showInformationMessage('Todos refreshed!');
		}),

		// Open Panel Command
		vscode.commands.registerCommand('todoManager.openPanel', () => {
			vscode.commands.executeCommand('workbench.view.extension.todo-sidebar');
		})
	];

		// Add all commands to subscriptions
		commands.forEach(command => context.subscriptions.push(command));

		// Add tree view to subscriptions
		context.subscriptions.push(treeView);

		// Daily reminder check (runs every hour)
		const reminderInterval = setInterval(() => {
			checkOverdueTodos(todoProvider);
		}, 60 * 60 * 1000); // Check every hour

		context.subscriptions.push({
			dispose: () => clearInterval(reminderInterval)
		});

		console.log('🎉 Todo Task Reminder extension activated successfully!');
		
		// Show success message with better instructions
		vscode.window.showInformationMessage(
			'🎉 Todo Task Reminder activated! Look for the checklist (✓) icon in the left Activity Bar.',
			'Open Todo Panel',
			'Show Sample Data'
		).then(selection => {
			if (selection === 'Open Todo Panel') {
				vscode.commands.executeCommand('workbench.view.extension.todo-sidebar');
			} else if (selection === 'Show Sample Data') {
				// Force reveal the view and show sample data
				vscode.commands.executeCommand('workbench.view.extension.todo-sidebar');
				todoProvider.refresh();
			}
		});

	} catch (error) {
		console.error('❌ Error activating Todo Task Reminder extension:', error);
		vscode.window.showErrorMessage(`Failed to activate Todo Task Reminder: ${error}`);
	}
}

function checkOverdueTodos(todoProvider: TodoTreeDataProvider) {
	const todos = todoProvider.getTodos();
	const now = new Date();
	
	const overdueTodos = todos.filter(todo => 
		!todo.completed && 
		todo.dueDate && 
		todo.dueDate < now
	);

	if (overdueTodos.length > 0) {
		const message = overdueTodos.length === 1 
			? `You have 1 overdue todo: "${overdueTodos[0].text}"`
			: `You have ${overdueTodos.length} overdue todos`;

		vscode.window.showWarningMessage(
			message,
			'View Todos',
			'Dismiss'
		).then(selection => {
			if (selection === 'View Todos') {
				vscode.commands.executeCommand('workbench.view.extension.todo-sidebar');
			}
		});
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
