import * as vscode from 'vscode';

export interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
    createdAt: Date;
    dueDate?: Date;
    reminder?: Date;
    priority: 'low' | 'medium' | 'high';
    projectName?: string;
}

export class TodoTreeItem extends vscode.TreeItem {
    constructor(
        public readonly todo: TodoItem,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly itemType: 'todo' | 'group' | 'project' = 'todo'
    ) {
        super(todo.text, collapsibleState);
        
        this.tooltip = this.getTooltip();
        this.description = this.getDescription();
        this.contextValue = this.getContextValue();
        this.iconPath = this.getIcon();
        
        // Add click command to open task details
        if (itemType === 'todo') {
            this.command = {
                command: 'todoManager.openTaskDetail',
                title: 'Open Task Details',
                arguments: [this.todo]
            };
        }
        
        // Add styling for completed todos
        if (todo.completed && itemType === 'todo') {
            this.resourceUri = vscode.Uri.parse(`completed-todo:${todo.id}`);
        }
    }

    private getContextValue(): string {
        if (this.itemType === 'group') {
            return 'todoGroup';
        } else if (this.itemType === 'project') {
            return 'todoProject';
        }
        return 'todoItem';
    }

    private getTooltip(): string {
        if (this.itemType !== 'todo') {
            return this.label as string;
        }
        
        let tooltip = `📝 ${this.todo.text}\n`;
        tooltip += `📅 Created: ${this.todo.createdAt.toLocaleDateString()}\n`;
        tooltip += `⭐ Priority: ${this.todo.priority.toUpperCase()}\n`;
        tooltip += `📊 Status: ${this.todo.completed ? '✅ Completed' : '⏳ Pending'}`;
        
        if (this.todo.projectName) {
            tooltip += `\n📁 Project: ${this.todo.projectName}`;
        }
        
        if (this.todo.dueDate) {
            const now = new Date();
            const isOverdue = this.todo.dueDate < now && !this.todo.completed;
            tooltip += `\n🗓️ Due: ${this.todo.dueDate.toLocaleDateString()}${isOverdue ? ' (OVERDUE!)' : ''}`;
        }
        
        if (this.todo.reminder) {
            tooltip += `\nReminder: ${this.todo.reminder.toLocaleString()}`;
        }
        
        return tooltip;
    }

    private getDescription(): string {
        if (this.itemType === 'group') {
            return this.getGroupDescription();
        } else if (this.itemType === 'project') {
            return this.getProjectDescription();
        }
        
        return this.getTodoDescription();
    }

    private getGroupDescription(): string {
        // For group items, we'll set the description when creating them
        return '';
    }

    private getProjectDescription(): string {
        // For project items, we'll set the description when creating them
        return '';
    }

    private getTodoDescription(): string {
        const parts: string[] = [];
        
        // Priority indicator (always first)
        const priorityEmoji = this.todo.priority === 'high' ? '🔴' : 
                             this.todo.priority === 'medium' ? '🟡' : '⚪';
        parts.push(priorityEmoji);
        
        // Status
        if (this.todo.completed) {
            parts.push('✅');
        } else {
            // Due date status
            if (this.todo.dueDate) {
                const now = new Date();
                const timeDiff = this.todo.dueDate.getTime() - now.getTime();
                const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                
                if (daysDiff < 0) {
                    parts.push('⚠️ OVERDUE');
                } else if (daysDiff === 0) {
                    parts.push('🔥 TODAY');
                } else if (daysDiff === 1) {
                    parts.push('📅 TOMORROW');
                } else if (daysDiff <= 3) {
                    parts.push(`📅 ${daysDiff}d`);
                } else if (daysDiff <= 7) {
                    parts.push(`📅 ${daysDiff}d`);
                }
            }
            
            // Reminder indicator
            if (this.todo.reminder) {
                parts.push('🔔');
            }
        }
        
        return parts.join(' ');
    }

    private getIcon(): vscode.ThemeIcon {
        if (this.itemType === 'group') {
            return this.getGroupIcon();
        } else if (this.itemType === 'project') {
            return new vscode.ThemeIcon('folder', new vscode.ThemeColor('charts.blue'));
        }
        
        return this.getTodoIcon();
    }

    private getGroupIcon(): vscode.ThemeIcon {
        // Icons will be set based on group type when creating the item
        return new vscode.ThemeIcon('list-unordered');
    }

    private getTodoIcon(): vscode.ThemeIcon {
        if (this.todo.completed) {
            return new vscode.ThemeIcon('check-all', new vscode.ThemeColor('charts.green'));
        }
        
        // Check if overdue
        if (this.todo.dueDate && this.todo.dueDate < new Date()) {
            return new vscode.ThemeIcon('warning', new vscode.ThemeColor('charts.red'));
        }
        
        // Priority-based icons
        switch (this.todo.priority) {
            case 'high':
                return new vscode.ThemeIcon('flame', new vscode.ThemeColor('charts.red'));
            case 'medium':
                return new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('charts.yellow'));
            default:
                return new vscode.ThemeIcon('circle-outline', new vscode.ThemeColor('charts.gray'));
        }
    }
}

export interface GroupingConfig {
    primary: 'status' | 'priority' | 'project' | 'date';
    secondary?: 'status' | 'priority' | 'project' | 'date';
    tertiary?: 'status' | 'priority' | 'project' | 'date';
}

export interface FilterConfig {
    status?: ('completed' | 'pending' | 'overdue')[];
    priority?: ('high' | 'medium' | 'low')[];
    projects?: string[];
    dateRange?: 'today' | 'thisWeek' | 'thisMonth' | 'overdue' | 'upcoming' | 'all';
    searchText?: string;
}

export class TodoTreeDataProvider implements vscode.TreeDataProvider<TodoTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TodoTreeItem | undefined | null | void> = new vscode.EventEmitter<TodoTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TodoTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private todos: TodoItem[] = [];
    private context: vscode.ExtensionContext;
    
    // Advanced grouping and filtering
    private currentGrouping: GroupingConfig = { primary: 'date', secondary: 'status', tertiary: 'priority' };
    private currentFilter: FilterConfig = { dateRange: 'all' };
    private filteredTodos: TodoItem[] = [];

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.loadTodos();
        this.updateFilteredTodos();
        console.log(`📋 TodoTreeDataProvider initialized with ${this.todos.length} todos`);
    }

    refresh(): void {
        console.log('🔄 Refreshing todo tree view');
        this.updateFilteredTodos();
        this._onDidChangeTreeData.fire();
    }

    // Advanced filtering and grouping methods
    updateFilteredTodos(): void {
        this.filteredTodos = this.applyFilters(this.todos);
        console.log(`🔍 Filtered ${this.filteredTodos.length} todos from ${this.todos.length} total`);
    }

    private applyFilters(todos: TodoItem[]): TodoItem[] {
        let filtered = [...todos];

        // Apply status filter
        if (this.currentFilter.status && this.currentFilter.status.length > 0) {
            filtered = filtered.filter(todo => {
                const status = this.getTodoStatus(todo);
                return this.currentFilter.status!.includes(status);
            });
        }

        // Apply priority filter
        if (this.currentFilter.priority && this.currentFilter.priority.length > 0) {
            filtered = filtered.filter(todo => 
                this.currentFilter.priority!.includes(todo.priority)
            );
        }

        // Apply project filter
        if (this.currentFilter.projects && this.currentFilter.projects.length > 0) {
            filtered = filtered.filter(todo => {
                const projectName = todo.projectName || 'No Project';
                return this.currentFilter.projects!.includes(projectName);
            });
        }

        // Apply date range filter
        if (this.currentFilter.dateRange && this.currentFilter.dateRange !== 'all') {
            filtered = filtered.filter(todo => this.matchesDateRange(todo, this.currentFilter.dateRange!));
        }

        // Apply search text filter
        if (this.currentFilter.searchText && this.currentFilter.searchText.trim()) {
            const searchText = this.currentFilter.searchText.toLowerCase();
            filtered = filtered.filter(todo => 
                todo.text.toLowerCase().includes(searchText) ||
                (todo.projectName && todo.projectName.toLowerCase().includes(searchText))
            );
        }

        return filtered;
    }

    private getTodoStatus(todo: TodoItem): 'completed' | 'pending' | 'overdue' {
        if (todo.completed) return 'completed';
        if (todo.dueDate && todo.dueDate < new Date()) return 'overdue';
        return 'pending';
    }

    private matchesDateRange(todo: TodoItem, range: string): boolean {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const weekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        switch (range) {
            case 'today':
                return (todo.dueDate && todo.dueDate >= today && todo.dueDate < tomorrow) ||
                       (todo.createdAt >= today && todo.createdAt < tomorrow);
            case 'thisWeek':
                return (todo.dueDate && todo.dueDate >= weekStart && todo.dueDate < weekEnd) ||
                       (todo.createdAt >= weekStart && todo.createdAt < weekEnd);
            case 'thisMonth':
                return (todo.dueDate && todo.dueDate >= monthStart && todo.dueDate <= monthEnd) ||
                       (todo.createdAt >= monthStart && todo.createdAt <= monthEnd);
            case 'overdue':
                return todo.dueDate ? todo.dueDate < now && !todo.completed : false;
            case 'upcoming':
                return todo.dueDate ? todo.dueDate > now : false;
            default:
                return true;
        }
    }

    // Grouping configuration methods
    setGrouping(config: GroupingConfig): void {
        this.currentGrouping = config;
        this.context.globalState.update('todoGrouping', config);
        this.refresh();
    }

    setFilter(config: FilterConfig): void {
        this.currentFilter = config;
        this.context.globalState.update('todoFilter', config);
        this.refresh();
    }

    getAvailableProjects(): string[] {
        const projects = new Set<string>();
        this.todos.forEach(todo => {
            if (todo.projectName) {
                projects.add(todo.projectName);
            } else {
                projects.add('No Project');
            }
        });
        return Array.from(projects).sort();
    }

    getCurrentGrouping(): GroupingConfig {
        return this.currentGrouping;
    }

    getCurrentFilter(): FilterConfig {
        return this.currentFilter;
    }

    getTreeItem(element: TodoTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TodoTreeItem): Thenable<TodoTreeItem[]> {
        console.log(`📋 getChildren called, element: ${element ? element.todo.text : 'root'}, todos count: ${this.todos.length}`);
        
        if (!element) {
            return this.getRootElements();
        }
        
        // Handle group children
        if (element.itemType === 'group') {
            return this.getGroupChildren(element);
        }
        
        // Handle project children
        if (element.itemType === 'project') {
            return this.getProjectChildren(element);
        }
        
        console.log('📋 Returning empty array for todo item');
        return Promise.resolve([]);
    }

    private async getRootElements(): Promise<TodoTreeItem[]> {
        const items: TodoTreeItem[] = [];
        
        // If no todos at all, show welcome message
        if (this.todos.length === 0) {
            const welcomeItem = this.createWelcomeItem();
            items.push(welcomeItem);
            return items;
        }

        // Use filtered todos for grouping
        const todosToGroup = this.filteredTodos;
        
        if (todosToGroup.length === 0) {
            const noResultsItem = this.createNoResultsItem();
            items.push(noResultsItem);
            return items;
        }

        // Apply advanced multi-level grouping
        const groupedItems = this.createAdvancedGrouping(todosToGroup);
        items.push(...groupedItems);
        
        console.log(`📋 Returning ${items.length} root elements with advanced grouping`);
        return items;
    }

    private createAdvancedGrouping(todos: TodoItem[]): TodoTreeItem[] {
        const primaryGroups = this.groupByLevel(todos, this.currentGrouping.primary);
        const items: TodoTreeItem[] = [];

        // Sort primary groups by priority (today's tasks first)
        const sortedPrimaryKeys = this.sortGroupKeys(Object.keys(primaryGroups), this.currentGrouping.primary);

        for (const primaryKey of sortedPrimaryKeys) {
            const primaryTodos = primaryGroups[primaryKey];
            const primaryItem = this.createGroupItem(primaryKey, this.currentGrouping.primary, primaryTodos);

            // Apply secondary grouping if specified
            if (this.currentGrouping.secondary) {
                const secondaryGroups = this.groupByLevel(primaryTodos, this.currentGrouping.secondary);
                const secondaryItems: TodoTreeItem[] = [];

                const sortedSecondaryKeys = this.sortGroupKeys(Object.keys(secondaryGroups), this.currentGrouping.secondary);

                for (const secondaryKey of sortedSecondaryKeys) {
                    const secondaryTodos = secondaryGroups[secondaryKey];
                    const secondaryItem = this.createGroupItem(secondaryKey, this.currentGrouping.secondary, secondaryTodos);

                    // Apply tertiary grouping if specified
                    if (this.currentGrouping.tertiary) {
                        const tertiaryGroups = this.groupByLevel(secondaryTodos, this.currentGrouping.tertiary);
                        const tertiaryItems: TodoTreeItem[] = [];

                        const sortedTertiaryKeys = this.sortGroupKeys(Object.keys(tertiaryGroups), this.currentGrouping.tertiary);

                        for (const tertiaryKey of sortedTertiaryKeys) {
                            const tertiaryTodos = tertiaryGroups[tertiaryKey];
                            const tertiaryItem = this.createGroupItem(tertiaryKey, this.currentGrouping.tertiary, tertiaryTodos);
                            
                            // Add actual todos at the deepest level
                            (tertiaryItem as any).groupTodos = this.sortTodos(tertiaryTodos);
                            tertiaryItems.push(tertiaryItem);
                        }
                        (secondaryItem as any).groupChildren = tertiaryItems;
                    } else {
                        // Add todos directly to secondary level
                        (secondaryItem as any).groupTodos = this.sortTodos(secondaryTodos);
                    }
                    secondaryItems.push(secondaryItem);
                }
                (primaryItem as any).groupChildren = secondaryItems;
            } else {
                // Add todos directly to primary level
                (primaryItem as any).groupTodos = this.sortTodos(primaryTodos);
            }

            items.push(primaryItem);
        }

        return items;
    }

    private groupByLevel(todos: TodoItem[], level: string): { [key: string]: TodoItem[] } {
        const groups: { [key: string]: TodoItem[] } = {};

        todos.forEach(todo => {
            let key: string;

            switch (level) {
                case 'status':
                    key = this.getStatusGroupKey(todo);
                    break;
                case 'priority':
                    key = this.getPriorityGroupKey(todo);
                    break;
                case 'project':
                    key = this.getProjectGroupKey(todo);
                    break;
                case 'date':
                    key = this.getDateGroupKey(todo);
                    break;
                default:
                    key = 'Other';
            }

            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(todo);
        });

        return groups;
    }

    private getStatusGroupKey(todo: TodoItem): string {
        if (todo.completed) return '✅ Completed';
        if (todo.dueDate && todo.dueDate < new Date() && !todo.completed) return '⚠️ Overdue';
        if (this.isUrgent(todo)) return '🔥 Urgent';
        return '📋 Active';
    }

    private getPriorityGroupKey(todo: TodoItem): string {
        switch (todo.priority) {
            case 'high': return '🔴 High Priority';
            case 'medium': return '🟡 Medium Priority';
            case 'low': return '⚪ Low Priority';
            default: return '⚪ Low Priority';
        }
    }

    private getProjectGroupKey(todo: TodoItem): string {
        return todo.projectName ? `📁 ${todo.projectName}` : '📝 No Project';
    }

    private getDateGroupKey(todo: TodoItem): string {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const thisWeekStart = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
        const nextWeekStart = new Date(thisWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

        // Use due date if available, otherwise use created date
        const compareDate = todo.dueDate || todo.createdAt;

        if (compareDate >= today && compareDate < tomorrow) {
            return '📅 Today';
        } else if (compareDate >= tomorrow && compareDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)) {
            return '📅 Tomorrow';
        } else if (compareDate >= yesterday && compareDate < today) {
            return '📅 Yesterday';
        } else if (compareDate >= thisWeekStart && compareDate < nextWeekStart) {
            return '📅 This Week';
        } else if (compareDate >= nextWeekStart && compareDate < new Date(nextWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000)) {
            return '📅 Next Week';
        } else if (compareDate < yesterday) {
            return '📅 Older';
        } else {
            return '📅 Future';
        }
    }

    private sortGroupKeys(keys: string[], level: string): string[] {
        const priorityOrder: { [key: string]: string[] } = {
            'status': ['🔥 Urgent', '⚠️ Overdue', '📋 Active', '✅ Completed'],
            'priority': ['🔴 High Priority', '🟡 Medium Priority', '⚪ Low Priority'],
            'date': ['⚠️ Overdue', '📅 Today', '📅 Tomorrow', '📅 Yesterday', '📅 This Week', '📅 Next Week', '📅 Future', '📅 Older'],
            'project': [] // Will be sorted alphabetically
        };

        if (level === 'project' || !priorityOrder[level]) {
            return keys.sort();
        }

        const order = priorityOrder[level];
        return keys.sort((a, b) => {
            const aIndex = order.indexOf(a);
            const bIndex = order.indexOf(b);
            
            if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            
            return aIndex - bIndex;
        });
    }

    private createGroupItem(key: string, level: string, todos: TodoItem[]): TodoTreeItem {
        const urgentCount = todos.filter(t => this.isUrgent(t)).length;
        const completedCount = todos.filter(t => t.completed).length;
        const overdueCount = todos.filter(t => t.dueDate && t.dueDate < new Date() && !t.completed).length;

        let description = `${todos.length} tasks`;
        if (urgentCount > 0) description += ` • ${urgentCount} urgent`;
        if (overdueCount > 0) description += ` • ${overdueCount} overdue`;
        if (completedCount > 0 && level !== 'status') description += ` • ${completedCount} done`;

        const groupTodo: TodoItem = {
            id: `group-${level}-${key}`,
            text: key,
            completed: false,
            createdAt: new Date(),
            priority: 'medium'
        };

        const item = new TodoTreeItem(groupTodo, vscode.TreeItemCollapsibleState.Expanded, 'group');
        item.description = description;
        (item as any).groupLevel = level;
        (item as any).groupKey = key;

        // Set appropriate icons based on group type
        item.iconPath = this.getGroupIcon(key, level);

        return item;
    }

    private getGroupIcon(key: string, level: string): vscode.ThemeIcon {
        if (key.includes('🔥') || key.includes('Urgent')) {
            return new vscode.ThemeIcon('flame', new vscode.ThemeColor('charts.red'));
        } else if (key.includes('⚠️') || key.includes('Overdue')) {
            return new vscode.ThemeIcon('warning', new vscode.ThemeColor('charts.red'));
        } else if (key.includes('✅') || key.includes('Completed')) {
            return new vscode.ThemeIcon('check-all', new vscode.ThemeColor('charts.green'));
        } else if (key.includes('📁') || level === 'project') {
            return new vscode.ThemeIcon('folder', new vscode.ThemeColor('charts.blue'));
        } else if (key.includes('🔴') || key.includes('High')) {
            return new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('charts.red'));
        } else if (key.includes('🟡') || key.includes('Medium')) {
            return new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('charts.yellow'));
        } else if (key.includes('📅') || level === 'date') {
            return new vscode.ThemeIcon('calendar', new vscode.ThemeColor('charts.purple'));
        } else {
            return new vscode.ThemeIcon('list-unordered', new vscode.ThemeColor('charts.blue'));
        }
    }

    private createNoResultsItem(): TodoTreeItem {
        const noResultsTodo: TodoItem = {
            id: 'no-results',
            text: '🔍 No tasks match your current filters',
            completed: false,
            createdAt: new Date(),
            priority: 'low'
        };

        const item = new TodoTreeItem(noResultsTodo, vscode.TreeItemCollapsibleState.None, 'group');
        item.iconPath = new vscode.ThemeIcon('search', new vscode.ThemeColor('charts.gray'));
        item.command = {
            command: 'todoManager.clearFilters',
            title: 'Clear Filters'
        };
        return item;
    }

    private getProjectGroups(todos: TodoItem[]): { [key: string]: TodoItem[] } {
        const groups: { [key: string]: TodoItem[] } = {};
        
        todos.forEach(todo => {
            const projectName = todo.projectName || '';
            if (!groups[projectName]) {
                groups[projectName] = [];
            }
            groups[projectName].push(todo);
        });
        
        // Sort todos within each project
        Object.keys(groups).forEach(projectName => {
            groups[projectName] = this.sortTodos(groups[projectName]);
        });
        
        return groups;
    }

    private sortTodos(todos: TodoItem[]): TodoItem[] {
        return todos.sort((a, b) => {
            // Sort by priority first
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            
            // Then by due date
            if (a.dueDate && b.dueDate) {
                return a.dueDate.getTime() - b.dueDate.getTime();
            }
            if (a.dueDate) return -1;
            if (b.dueDate) return 1;
            
            // Finally by creation date
            return a.createdAt.getTime() - b.createdAt.getTime();
        });
    }

    private isUrgent(todo: TodoItem): boolean {
        if (todo.priority === 'high') return true;
        
        if (todo.dueDate) {
            const now = new Date();
            const timeDiff = todo.dueDate.getTime() - now.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            return daysDiff <= 1; // Due today or overdue
        }
        
        return false;
    }

    private createProjectItem(projectName: string, todos: TodoItem[]): TodoTreeItem {
        const urgentCount = todos.filter(t => this.isUrgent(t)).length;
        const description = urgentCount > 0 ? `${todos.length} tasks • ${urgentCount} urgent` : `${todos.length} tasks`;
        
        const projectTodo: TodoItem = {
            id: `project-${projectName}`,
            text: projectName,
            completed: false,
            createdAt: new Date(),
            priority: 'medium',
            projectName: projectName
        };
        
        const item = new TodoTreeItem(projectTodo, vscode.TreeItemCollapsibleState.Expanded, 'project');
        item.description = description;
        (item as any).projectTodos = todos; // Store todos for children
        return item;
    }

    private createStatusGroup(label: string, todos: TodoItem[], groupType: string): TodoTreeItem {
        const groupTodo: TodoItem = {
            id: `group-${groupType}`,
            text: label,
            completed: false,
            createdAt: new Date(),
            priority: 'medium'
        };
        
        const item = new TodoTreeItem(groupTodo, vscode.TreeItemCollapsibleState.Expanded, 'group');
        (item as any).groupTodos = todos; // Store todos for children
        (item as any).groupType = groupType; // Store group type
        
        // Set appropriate icon
        if (groupType === 'urgent') {
            item.iconPath = new vscode.ThemeIcon('flame', new vscode.ThemeColor('charts.red'));
        } else if (groupType === 'completed') {
            item.iconPath = new vscode.ThemeIcon('check-all', new vscode.ThemeColor('charts.green'));
        } else {
            item.iconPath = new vscode.ThemeIcon('list-unordered', new vscode.ThemeColor('charts.blue'));
        }
        
        return item;
    }

    private createWelcomeItem(): TodoTreeItem {
        const welcomeTodo: TodoItem = {
            id: 'welcome',
            text: '🎉 Welcome! Click + to add your first todo',
            completed: false,
            createdAt: new Date(),
            priority: 'low'
        };
        
        const item = new TodoTreeItem(welcomeTodo, vscode.TreeItemCollapsibleState.None, 'group');
        item.iconPath = new vscode.ThemeIcon('star', new vscode.ThemeColor('charts.yellow'));
        item.command = {
            command: 'todoManager.addTodo',
            title: 'Add Todo'
        };
        return item;
    }

    private async getGroupChildren(element: TodoTreeItem): Promise<TodoTreeItem[]> {
        // Check if this group has child groups (multi-level grouping)
        const childGroups = (element as any).groupChildren as TodoTreeItem[] || [];
        if (childGroups.length > 0) {
            return childGroups;
        }

        // Otherwise, return the todos in this group
        const todos = (element as any).groupTodos as TodoItem[] || [];
        return todos.map(todo => new TodoTreeItem(todo, vscode.TreeItemCollapsibleState.None, 'todo'));
    }

    private async getProjectChildren(element: TodoTreeItem): Promise<TodoTreeItem[]> {
        const todos = (element as any).projectTodos as TodoItem[] || [];
        return todos.map(todo => new TodoTreeItem(todo, vscode.TreeItemCollapsibleState.None, 'todo'));
    }

    addTodo(text: string, priority: 'low' | 'medium' | 'high' = 'medium', dueDate?: Date, projectName?: string): void {
        const newTodo: TodoItem = {
            id: Date.now().toString(),
            text,
            completed: false,
            createdAt: new Date(),
            dueDate,
            priority,
            projectName
        };

        this.todos.push(newTodo);
        this.saveTodos();
        this.logTaskToFile(newTodo);
        this.updateFilteredTodos();
        this.refresh();
    }

    deleteTodo(todoId: string): void {
        this.todos = this.todos.filter(todo => todo.id !== todoId);
        this.saveTodos();
        this.updateFilteredTodos();
        this.refresh();
    }

    completeTodo(todoId: string): void {
        const todo = this.todos.find(t => t.id === todoId);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.updateFilteredTodos();
            this.refresh();
        }
    }

    editTodo(todoId: string, newText: string): void {
        const todo = this.todos.find(t => t.id === todoId);
        if (todo) {
            todo.text = newText;
            this.saveTodos();
            this.updateFilteredTodos();
            this.refresh();
        }
    }

    setReminder(todoId: string, reminderDate: Date): void {
        const todo = this.todos.find(t => t.id === todoId);
        if (todo) {
            todo.reminder = reminderDate;
            this.saveTodos();
            this.updateFilteredTodos();
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

        // Load saved grouping and filter settings
        const savedGrouping = this.context.globalState.get<GroupingConfig>('todoGrouping');
        if (savedGrouping) {
            this.currentGrouping = savedGrouping;
        }

        const savedFilter = this.context.globalState.get<FilterConfig>('todoFilter');
        if (savedFilter) {
            this.currentFilter = savedFilter;
        }

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

    private async logTaskToFile(todo: TodoItem): Promise<void> {
        try {
            const fs = require('fs').promises;
            const path = require('path');
            const os = require('os');
            
            // Create tasks log file in user's home directory
            const logFilePath = path.join(os.homedir(), 'vscode-todo-tasks.txt');
            
            // Format the date for grouping
            const dateStr = todo.createdAt.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Read existing content or create empty
            let content = '';
            try {
                content = await fs.readFile(logFilePath, 'utf8');
            } catch (error) {
                // File doesn't exist, start with empty content
                content = '# Todo Tasks Log\n# Generated by VS Code Todo Task Reminder Extension\n\n';
            }
            
            // Parse and organize content
            const updatedContent = this.insertTaskIntoLog(content, todo, dateStr);
            
            // Write back to file
            await fs.writeFile(logFilePath, updatedContent, 'utf8');
            console.log(`📄 Task logged to file: ${logFilePath}`);
            
        } catch (error) {
            console.error('❌ Error logging task to file:', error);
            vscode.window.showErrorMessage(`Failed to log task to file: ${error}`);
        }
    }

    private insertTaskIntoLog(content: string, todo: TodoItem, dateStr: string): string {
        const lines = content.split('\n');
        const dateHeader = `${dateStr}'s tasks:`;
        const projectHeader = todo.projectName ? `#${todo.projectName}` : '#General';
        const taskLine = `- ${todo.text}`;
        
        // Find or create date section
        let dateIndex = lines.findIndex(line => line === dateHeader);
        
        if (dateIndex === -1) {
            // Date section doesn't exist, add it at the end
            lines.push('', dateHeader, '');
            dateIndex = lines.length - 2;
        }
        
        // Find or create project section within the date
        let projectIndex = -1;
        for (let i = dateIndex + 1; i < lines.length; i++) {
            if (lines[i] === projectHeader) {
                projectIndex = i;
                break;
            }
            // If we hit another date section or end of file, stop looking
            if (lines[i].endsWith("'s tasks:") && i !== dateIndex) {
                break;
            }
        }
        
        if (projectIndex === -1) {
            // Project section doesn't exist, create it
            let insertIndex = dateIndex + 1;
            
            // Find the right place to insert (after existing projects but before next date)
            for (let i = dateIndex + 1; i < lines.length; i++) {
                if (lines[i].endsWith("'s tasks:")) {
                    insertIndex = i;
                    break;
                }
                if (lines[i].startsWith('#') || lines[i].startsWith('-')) {
                    insertIndex = i + 1;
                }
            }
            
            lines.splice(insertIndex, 0, '', projectHeader);
            projectIndex = insertIndex + 1;
        }
        
        // Add the task after the project header
        let taskInsertIndex = projectIndex + 1;
        
        // Find the right place to insert the task
        for (let i = projectIndex + 1; i < lines.length; i++) {
            if (lines[i].startsWith('#') || lines[i].endsWith("'s tasks:")) {
                taskInsertIndex = i;
                break;
            }
            if (lines[i].startsWith('-')) {
                taskInsertIndex = i + 1;
            }
        }
        
        lines.splice(taskInsertIndex, 0, taskLine);
        
        return lines.join('\n');
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