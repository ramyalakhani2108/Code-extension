import * as vscode from 'vscode';

export interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
    createdAt: Date;
    dueDate?: Date;
    reminder?: Date;
    priority: 'low' | 'medium' | 'high';
}

export class TodoTreeItem extends vscode.TreeItem {
    constructor(
        public readonly todo: TodoItem,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(todo.text, collapsibleState);
        
        this.tooltip = this.getTooltip();
        this.description = this.getDescription();
        this.contextValue = 'todoItem';
        this.iconPath = this.getIcon();
        
        // Add strike-through for completed todos
        if (todo.completed) {
            this.resourceUri = vscode.Uri.parse(`todo:${todo.id}`);
            this.command = {
                command: 'vscode.open',
                title: 'Open',
                arguments: [this.resourceUri]
            };
        }
    }

    private getTooltip(): string {
        let tooltip = `${this.todo.text}\n`;
        tooltip += `Created: ${this.todo.createdAt.toLocaleDateString()}\n`;
        tooltip += `Priority: ${this.todo.priority}\n`;
        tooltip += `Status: ${this.todo.completed ? 'Completed' : 'Pending'}`;
        
        if (this.todo.dueDate) {
            tooltip += `\nDue Date: ${this.todo.dueDate.toLocaleDateString()}`;
        }
        
        if (this.todo.reminder) {
            tooltip += `\nReminder: ${this.todo.reminder.toLocaleString()}`;
        }
        
        return tooltip;
    }

    private getDescription(): string {
        if (this.todo.completed) {
            return '✓ Completed';
        }
        
        if (this.todo.dueDate) {
            const now = new Date();
            const timeDiff = this.todo.dueDate.getTime() - now.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            if (daysDiff < 0) {
                return '⚠️ Overdue';
            } else if (daysDiff === 0) {
                return '🔥 Due Today';
            } else if (daysDiff === 1) {
                return '📅 Due Tomorrow';
            } else if (daysDiff <= 7) {
                return `📅 Due in ${daysDiff} days`;
            }
        }
        
        return this.todo.priority === 'high' ? '🔴 High Priority' : 
               this.todo.priority === 'medium' ? '🟡 Medium Priority' : '';
    }

    private getIcon(): vscode.ThemeIcon {
        if (this.todo.completed) {
            return new vscode.ThemeIcon('check', new vscode.ThemeColor('charts.green'));
        }
        
        switch (this.todo.priority) {
            case 'high':
                return new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('charts.red'));
            case 'medium':
                return new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('charts.yellow'));
            default:
                return new vscode.ThemeIcon('circle-outline');
        }
    }
}

export class TodoTreeDataProvider implements vscode.TreeDataProvider<TodoTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TodoTreeItem | undefined | null | void> = new vscode.EventEmitter<TodoTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TodoTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private todos: TodoItem[] = [];
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.loadTodos();
        console.log(`📋 TodoTreeDataProvider initialized with ${this.todos.length} todos`);
    }

    refresh(): void {
        console.log('🔄 Refreshing todo tree view');
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: TodoTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TodoTreeItem): Thenable<TodoTreeItem[]> {
        console.log(`📋 getChildren called, element: ${element ? element.todo.text : 'root'}, todos count: ${this.todos.length}`);
        
        if (!element) {
            // Return root level todos grouped by status
            const pendingTodos = this.todos
                .filter(todo => !todo.completed)
                .sort((a, b) => {
                    // Sort by priority first, then by due date
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                        return priorityOrder[b.priority] - priorityOrder[a.priority];
                    }
                    if (a.dueDate && b.dueDate) {
                        return a.dueDate.getTime() - b.dueDate.getTime();
                    }
                    return a.createdAt.getTime() - b.createdAt.getTime();
                });

            const completedTodos = this.todos
                .filter(todo => todo.completed)
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

            const allTodos = [...pendingTodos, ...completedTodos];
            const treeItems = allTodos.map(todo => 
                new TodoTreeItem(todo, vscode.TreeItemCollapsibleState.None)
            );
            
            console.log(`📋 Returning ${treeItems.length} tree items (${pendingTodos.length} pending, ${completedTodos.length} completed)`);
            return Promise.resolve(treeItems);
        }
        console.log('📋 Returning empty array for non-root element');
        return Promise.resolve([]);
    }

    addTodo(text: string, priority: 'low' | 'medium' | 'high' = 'medium', dueDate?: Date): void {
        const newTodo: TodoItem = {
            id: Date.now().toString(),
            text,
            completed: false,
            createdAt: new Date(),
            dueDate,
            priority
        };

        this.todos.push(newTodo);
        this.saveTodos();
        this.refresh();
    }

    deleteTodo(todoId: string): void {
        this.todos = this.todos.filter(todo => todo.id !== todoId);
        this.saveTodos();
        this.refresh();
    }

    completeTodo(todoId: string): void {
        const todo = this.todos.find(t => t.id === todoId);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.refresh();
        }
    }

    editTodo(todoId: string, newText: string): void {
        const todo = this.todos.find(t => t.id === todoId);
        if (todo) {
            todo.text = newText;
            this.saveTodos();
            this.refresh();
        }
    }

    setReminder(todoId: string, reminderDate: Date): void {
        const todo = this.todos.find(t => t.id === todoId);
        if (todo) {
            todo.reminder = reminderDate;
            this.saveTodos();
            this.refresh();
            this.scheduleReminder(todo);
        }
    }

    private scheduleReminder(todo: TodoItem): void {
        if (!todo.reminder) {
            return;
        }

        const now = new Date();
        const timeUntilReminder = todo.reminder.getTime() - now.getTime();

        if (timeUntilReminder > 0) {
            setTimeout(() => {
                vscode.window.showInformationMessage(
                    `Reminder: ${todo.text}`,
                    'Mark Complete',
                    'Snooze 10 min',
                    'Dismiss'
                ).then(selection => {
                    if (selection === 'Mark Complete') {
                        this.completeTodo(todo.id);
                    } else if (selection === 'Snooze 10 min') {
                        const snoozeTime = new Date(Date.now() + 10 * 60 * 1000);
                        this.setReminder(todo.id, snoozeTime);
                    }
                });
            }, timeUntilReminder);
        }
    }

    private loadTodos(): void {
        const savedTodos = this.context.globalState.get<TodoItem[]>('todos', []);
        this.todos = savedTodos.map(todo => ({
            ...todo,
            createdAt: new Date(todo.createdAt),
            dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
            reminder: todo.reminder ? new Date(todo.reminder) : undefined
        }));

        // Add sample todos if none exist (for testing)
        if (this.todos.length === 0) {
            console.log('📋 No todos found, adding sample data');
            const sampleTodos: TodoItem[] = [
                {
                    id: 'sample-1',
                    text: 'Welcome to Todo Task Reminder! 🎉',
                    completed: false,
                    createdAt: new Date(),
                    priority: 'high'
                },
                {
                    id: 'sample-2',
                    text: 'Click the + button to add your own todos',
                    completed: false,
                    createdAt: new Date(),
                    priority: 'medium'
                },
                {
                    id: 'sample-3',
                    text: 'Right-click todos for more options',
                    completed: true,
                    createdAt: new Date(),
                    priority: 'low'
                }
            ];
            this.todos = sampleTodos;
            this.saveTodos();
        }

        console.log(`📋 Loaded ${this.todos.length} todos`);

        // Schedule reminders for existing todos
        this.todos.forEach(todo => {
            if (todo.reminder && !todo.completed) {
                this.scheduleReminder(todo);
            }
        });
    }

    private saveTodos(): void {
        this.context.globalState.update('todos', this.todos);
    }

    getTodos(): TodoItem[] {
        return this.todos;
    }

    getTodo(id: string): TodoItem | undefined {
        return this.todos.find(todo => todo.id === id);
    }
}