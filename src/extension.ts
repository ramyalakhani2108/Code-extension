// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TodoTreeDataProvider, TodoTreeItem } from './todoProvider';

// Helper function for user-friendly reminder picker
async function showSmartReminderPicker(): Promise<Date | undefined> {
	const now = new Date();
	
	// Smart quick options with context
	const quickOptions = [
		{ label: '⚡ In 5 minutes', description: 'Quick reminder', value: 5 * 60 * 1000 },
		{ label: '⏰ In 15 minutes', description: 'Short break reminder', value: 15 * 60 * 1000 },
		{ label: '☕ In 30 minutes', description: 'Coffee break reminder', value: 30 * 60 * 1000 },
		{ label: '🕐 In 1 hour', description: 'Hourly reminder', value: 60 * 60 * 1000 },
		{ label: '🕕 In 2 hours', description: 'Extended reminder', value: 2 * 60 * 60 * 1000 },
		{ label: '🌅 Tomorrow at 9 AM', description: 'Start of workday', value: 'tomorrow9am' },
		{ label: '📅 Choose specific date', description: 'Custom date and time', value: 'custom' },
		{ label: '🎯 Smart suggestions', description: 'AI-powered suggestions', value: 'smart' }
	];

	const selected = await vscode.window.showQuickPick(quickOptions, {
		placeHolder: '⏰ When should I remind you about this todo?',
		matchOnDescription: true,
		ignoreFocusOut: true
	});

	if (!selected) {
		return undefined;
	}

	// Handle quick time options
	if (typeof selected.value === 'number') {
		return new Date(now.getTime() + selected.value);
	}

	// Handle tomorrow 9 AM
	if (selected.value === 'tomorrow9am') {
		const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0);
		return tomorrow;
	}

	// Handle smart suggestions
	if (selected.value === 'smart') {
		return await showSmartSuggestions();
	}

	// Handle custom date/time picker
	if (selected.value === 'custom') {
		return await showAdvancedDateTimePicker();
	}

	return undefined;
}

// Smart suggestions based on context
async function showSmartSuggestions(): Promise<Date | undefined> {
	const now = new Date();
	const currentHour = now.getHours();
	
	const suggestions = [];
	
	// Morning suggestions (6 AM - 12 PM)
	if (currentHour >= 6 && currentHour < 12) {
		suggestions.push(
			{ label: '🌅 End of morning (12 PM)', date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0) },
			{ label: '🍽️ Lunch time (1 PM)', date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13, 0) },
			{ label: '🌆 End of workday (5 PM)', date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0) }
		);
	}
	// Afternoon suggestions (12 PM - 6 PM)
	else if (currentHour >= 12 && currentHour < 18) {
		suggestions.push(
			{ label: '🌆 End of workday (5 PM)', date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0) },
			{ label: '🌙 Evening (7 PM)', date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 0) },
			{ label: '🌅 Tomorrow morning (9 AM)', date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0) }
		);
	}
	// Evening/Night suggestions (6 PM - 6 AM)
	else {
		suggestions.push(
			{ label: '🌅 Tomorrow morning (9 AM)', date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0) },
			{ label: '🍽️ Tomorrow lunch (1 PM)', date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 13, 0) },
			{ label: '🌆 Tomorrow evening (5 PM)', date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 17, 0) }
		);
	}

	// Add weekend suggestions if it's a weekday
	const dayOfWeek = now.getDay();
	if (dayOfWeek >= 1 && dayOfWeek <= 5) {
		const daysUntilWeekend = 6 - dayOfWeek; // Saturday
		suggestions.push({
			label: '🎮 This weekend (Saturday 10 AM)',
			date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilWeekend, 10, 0)
		});
	}

	const selected = await vscode.window.showQuickPick(
		suggestions.map(s => ({
			label: s.label,
			description: s.date.toLocaleString(),
			date: s.date
		})),
		{
			placeHolder: '🎯 Choose a smart reminder time',
			ignoreFocusOut: true
		}
	);

	return selected?.date;
}

// Custom date/time picker with step-by-step UX
async function showCustomDateTimePicker(): Promise<Date | undefined> {
	// Step 1: Choose date
	const dateOptions = [
		{ label: '📅 Today', value: 'today' },
		{ label: '📅 Tomorrow', value: 'tomorrow' },
		{ label: '📅 Day after tomorrow', value: 'dayafter' },
		{ label: '📅 This weekend (Saturday)', value: 'weekend' },
		{ label: '📅 Next week (Monday)', value: 'nextweek' },
		{ label: '📝 Type specific date', value: 'custom' }
	];

	const selectedDate = await vscode.window.showQuickPick(dateOptions, {
		placeHolder: '📅 Step 1/2: Choose the date',
		ignoreFocusOut: true
	});

	if (!selectedDate) {
		return undefined;
	}

	let targetDate: Date;
	const now = new Date();

	switch (selectedDate.value) {
		case 'today':
			targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			break;
		case 'tomorrow':
			targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
			break;
		case 'dayafter':
			targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);
			break;
		case 'weekend':
			const daysUntilSaturday = 6 - now.getDay();
			targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSaturday);
			break;
		case 'nextweek':
			const daysUntilNextMonday = 8 - now.getDay();
			targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilNextMonday);
			break;
		case 'custom':
			const dateInput = await vscode.window.showInputBox({
				placeHolder: 'YYYY-MM-DD (e.g., 2025-12-25)',
				prompt: '📅 Enter date in YYYY-MM-DD format',
				validateInput: (value) => {
					const date = new Date(value);
					if (isNaN(date.getTime())) {
						return 'Invalid date format. Use YYYY-MM-DD';
					}
					if (date < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
						return 'Date cannot be in the past';
					}
					return null;
				}
			});
			if (!dateInput) {
				return undefined;
			}
			targetDate = new Date(dateInput);
			break;
		default:
			return undefined;
	}

	// Step 2: Choose time
	const timeOptions = [
		{ label: '🌅 Morning (9:00 AM)', hour: 9, minute: 0 },
		{ label: '☕ Mid-morning (10:30 AM)', hour: 10, minute: 30 },
		{ label: '🌞 Noon (12:00 PM)', hour: 12, minute: 0 },
		{ label: '🍽️ Lunch (1:00 PM)', hour: 13, minute: 0 },
		{ label: '☕ Afternoon (3:00 PM)', hour: 15, minute: 0 },
		{ label: '🌆 End of workday (5:00 PM)', hour: 17, minute: 0 },
		{ label: '🌙 Evening (7:00 PM)', hour: 19, minute: 0 },
		{ label: '⏰ Custom time', hour: -1, minute: -1 }
	];

	const selectedTime = await vscode.window.showQuickPick(timeOptions, {
		placeHolder: '⏰ Step 2/2: Choose the time',
		ignoreFocusOut: true
	});

	if (!selectedTime) {
		return undefined;
	}

	let finalDateTime: Date;

	if (selectedTime.hour === -1) {
		// Custom time input
		const timeInput = await vscode.window.showInputBox({
			placeHolder: 'HH:MM (e.g., 14:30 for 2:30 PM)',
			prompt: '⏰ Enter time in 24-hour format (HH:MM)',
			validateInput: (value) => {
				const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
				if (!timeRegex.test(value)) {
					return 'Invalid time format. Use HH:MM (24-hour format)';
				}
				return null;
			}
		});
		if (!timeInput) {
			return undefined;
		}
		const [hour, minute] = timeInput.split(':').map(Number);
		finalDateTime = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), hour, minute);
	} else {
		finalDateTime = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), selectedTime.hour, selectedTime.minute);
	}

	// Validate that the time is in the future
	if (finalDateTime <= now) {
		vscode.window.showErrorMessage('⚠️ Reminder time must be in the future!');
		return undefined;
	}

	return finalDateTime;
}

// Advanced date/time picker with calendar-like interface
async function showAdvancedDateTimePicker(): Promise<Date | undefined> {
	// First, show a more intuitive date picker
	const dateInput = await vscode.window.showInputBox({
		placeHolder: 'YYYY-MM-DD (e.g., 2025-12-31) or use shortcuts like "today", "tomorrow", "monday"',
		prompt: '📅 Enter a date or use natural language',
		ignoreFocusOut: true,
		validateInput: (value) => {
			if (!value) return 'Please enter a date';
			
			const input = value.trim().toLowerCase();
			
			// Handle natural language shortcuts
			if (['today', 'tomorrow', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(input)) {
				return null;
			}
			
			// Handle relative dates
			if (input.match(/^(next|this)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/)) {
				return null;
			}
			
			// Handle "in X days" format
			if (input.match(/^in\s+\d+\s+days?$/)) {
				return null;
			}
			
			// Validate standard date format
			const date = new Date(value);
			if (isNaN(date.getTime())) {
				return 'Invalid date format. Use YYYY-MM-DD or natural language like "tomorrow", "next friday"';
			}
			
			const now = new Date();
			if (date < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
				return 'Date cannot be in the past';
			}
			
			return null;
		}
	});

	if (!dateInput) {
		return undefined;
	}

	// Parse the date input
	const targetDate = parseNaturalDate(dateInput.trim());
	if (!targetDate) {
		vscode.window.showErrorMessage('Could not parse the date. Please try again.');
		return undefined;
	}

	// Now show an enhanced time picker
	const timeOptions = [
		{ label: '🌅 6:00 AM - Early morning', time: '06:00' },
		{ label: '☕ 8:00 AM - Morning coffee', time: '08:00' },
		{ label: '🌅 9:00 AM - Start of workday', time: '09:00' },
		{ label: '☕ 10:30 AM - Mid-morning break', time: '10:30' },
		{ label: '🌞 12:00 PM - Lunch time', time: '12:00' },
		{ label: '🍽️ 1:00 PM - After lunch', time: '13:00' },
		{ label: '☕ 3:00 PM - Afternoon break', time: '15:00' },
		{ label: '🏢 5:00 PM - End of workday', time: '17:00' },
		{ label: '🌆 6:00 PM - Evening', time: '18:00' },
		{ label: '🍽️ 7:00 PM - Dinner time', time: '19:00' },
		{ label: '🌙 9:00 PM - Night', time: '21:00' },
		{ label: '🛏️ 11:00 PM - Before bed', time: '23:00' },
		{ label: '⏰ Custom time', time: 'custom' }
	];

	const selectedTime = await vscode.window.showQuickPick(timeOptions, {
		placeHolder: `⏰ Choose time for ${targetDate.toLocaleDateString()}`,
		ignoreFocusOut: true,
		matchOnDescription: true
	});

	if (!selectedTime) {
		return undefined;
	}

	let finalTime = selectedTime.time;

	if (selectedTime.time === 'custom') {
		const customTime = await vscode.window.showInputBox({
			placeHolder: '14:30 (for 2:30 PM), 09:15 (for 9:15 AM), etc.',
			prompt: '⏰ Enter time in HH:MM format (24-hour)',
			ignoreFocusOut: true,
			validateInput: (value) => {
				if (!value) return 'Please enter a time';
				const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
				if (!timeRegex.test(value)) {
					return 'Invalid time format. Use HH:MM (24-hour format). Examples: 09:30, 14:15, 23:45';
				}
				return null;
			}
		});
		
		if (!customTime) {
			return undefined;
		}
		
		finalTime = customTime;
	}

	// Combine date and time
	const [hour, minute] = finalTime.split(':').map(Number);
	const finalDateTime = new Date(
		targetDate.getFullYear(),
		targetDate.getMonth(),
		targetDate.getDate(),
		hour,
		minute,
		0,
		0
	);

	// Final validation
	const now = new Date();
	if (finalDateTime <= now) {
		vscode.window.showErrorMessage('⚠️ The selected date and time must be in the future!');
		return undefined;
	}

	return finalDateTime;
}

// Parse natural language dates
function parseNaturalDate(input: string): Date | null {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	
	const lower = input.toLowerCase().trim();
	
	switch (lower) {
		case 'today':
			return today;
		case 'tomorrow':
			return new Date(today.getTime() + 24 * 60 * 60 * 1000);
		case 'monday':
		case 'tuesday':
		case 'wednesday':
		case 'thursday':
		case 'friday':
		case 'saturday':
		case 'sunday':
			return getNextWeekday(lower);
		default:
			break;
	}
	
	// Handle "next [weekday]" or "this [weekday]"
	const weekdayMatch = lower.match(/^(next|this)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/);
	if (weekdayMatch) {
		const [, modifier, weekday] = weekdayMatch;
		const targetDate = getNextWeekday(weekday);
		if (modifier === 'next') {
			targetDate.setDate(targetDate.getDate() + 7);
		}
		return targetDate;
	}
	
	// Handle "in X days"
	const daysMatch = lower.match(/^in\s+(\d+)\s+days?$/);
	if (daysMatch) {
		const days = parseInt(daysMatch[1]);
		return new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
	}
	
	// Try to parse as standard date
	const date = new Date(input);
	if (!isNaN(date.getTime())) {
		return date;
	}
	
	return null;
}

// Get next occurrence of a weekday
function getNextWeekday(weekdayName: string): Date {
	const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
	const targetDay = weekdays.indexOf(weekdayName.toLowerCase());
	
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const currentDay = today.getDay();
	
	let daysUntilTarget = targetDay - currentDay;
	if (daysUntilTarget <= 0) {
		daysUntilTarget += 7; // Next week
	}
	
	return new Date(today.getTime() + daysUntilTarget * 24 * 60 * 60 * 1000);
}

// Format reminder time for user-friendly display
function formatReminderTime(date: Date): string {
	const now = new Date();
	const diffMs = date.getTime() - now.getTime();
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

	// If it's today
	if (date.toDateString() === now.toDateString()) {
		if (diffHours === 0) {
			return `in ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} (${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`;
		} else if (diffHours < 24) {
			return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''} (${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`;
		}
	}

	// If it's tomorrow
	const tomorrow = new Date(now);
	tomorrow.setDate(tomorrow.getDate() + 1);
	if (date.toDateString() === tomorrow.toDateString()) {
		return `tomorrow at ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
	}

	// For other dates
	return date.toLocaleString([], {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

// Format date for display
function formatDate(date: Date): string {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);
	
	const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	
	if (targetDate.getTime() === today.getTime()) {
		return 'today';
	} else if (targetDate.getTime() === tomorrow.getTime()) {
		return 'tomorrow';
	} else {
		const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
		if (diffDays > 0 && diffDays <= 7) {
			return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
		}
		return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
	}
}

// Enhanced todo creator with better UX flow
interface TodoCreatorResult {
	text: string;
	priority: 'low' | 'medium' | 'high';
	dueDate?: Date;
	projectName?: string;
}

async function showEnhancedTodoCreator(): Promise<TodoCreatorResult | undefined> {
	// Step 1: Get todo text with better prompts
	const text = await vscode.window.showInputBox({
		placeHolder: 'What do you need to do? (e.g., "Review pull request", "Call team meeting")',
		prompt: '📝 Step 1/3: Describe your todo',
		ignoreFocusOut: true,
		validateInput: (value) => {
			if (!value || value.trim().length === 0) {
				return 'Todo text cannot be empty';
			}
			if (value.trim().length > 200) {
				return 'Todo text is too long (max 200 characters)';
			}
			return null;
		}
	});

	if (!text || !text.trim()) {
		return undefined;
	}

	// Step 2: Choose priority with visual indicators
	const priorityOptions = [
		{ 
			label: '🟢 Low Priority', 
			description: 'No rush, can be done later',
			detail: 'For tasks that are nice to have but not urgent',
			value: 'low' as const
		},
		{ 
			label: '🟡 Medium Priority', 
			description: 'Normal priority, should be done soon',
			detail: 'For regular tasks that need attention',
			value: 'medium' as const
		},
		{ 
			label: '🔴 High Priority', 
			description: 'Urgent, needs immediate attention',
			detail: 'For critical tasks that cannot wait',
			value: 'high' as const
		}
	];

	const selectedPriority = await vscode.window.showQuickPick(priorityOptions, {
		placeHolder: '⚡ Step 2/3: How urgent is this todo?',
		ignoreFocusOut: true,
		matchOnDescription: true,
		matchOnDetail: true
	});

	if (!selectedPriority) {
		return undefined;
	}

	// Step 3: Choose due date with smart options
	const dueDateOptions = [
		{ label: '📅 No due date', description: 'Complete whenever convenient', value: 'none' },
		{ label: '🕐 Today', description: 'Due by end of today', value: 'today' },
		{ label: '📅 Tomorrow', description: 'Due by end of tomorrow', value: 'tomorrow' },
		{ label: '📅 This week', description: 'Due by end of this week', value: 'week' },
		{ label: '📅 Next week', description: 'Due by end of next week', value: 'nextweek' },
		{ label: '📝 Choose specific date', description: 'Custom due date', value: 'custom' }
	];

	const selectedDueDate = await vscode.window.showQuickPick(dueDateOptions, {
		placeHolder: '📅 Step 3/3: When should this be completed?',
		ignoreFocusOut: true,
		matchOnDescription: true
	});

	if (!selectedDueDate) {
		return undefined;
	}

	let dueDate: Date | undefined;
	const now = new Date();

	switch (selectedDueDate.value) {
		case 'none':
			dueDate = undefined;
			break;
		case 'today':
			dueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59);
			break;
		case 'tomorrow':
			dueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59);
			break;
		case 'week':
			const daysUntilSunday = 7 - now.getDay();
			dueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday, 23, 59);
			break;
		case 'nextweek':
			const daysUntilNextSunday = 14 - now.getDay();
			dueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilNextSunday, 23, 59);
			break;
		case 'custom':
			const customDate = await showAdvancedDateTimePicker();
			dueDate = customDate;
			break;
	}

	// Step 4: Choose project (NEW!)
	const projectOptions = [
		{ label: '📁 No Project', description: 'General task not tied to a specific project', value: undefined },
		{ label: '💼 Work', description: 'Work-related tasks', value: 'Work' },
		{ label: '🏠 Personal', description: 'Personal life tasks', value: 'Personal' },
		{ label: '💻 Development', description: 'Coding and development tasks', value: 'Development' },
		{ label: '📚 Learning', description: 'Education and skill development', value: 'Learning' },
		{ label: '🏥 Health', description: 'Health and fitness related tasks', value: 'Health' },
		{ label: '💰 Finance', description: 'Financial and budgeting tasks', value: 'Finance' },
		{ label: '🎨 Creative', description: 'Creative projects and hobbies', value: 'Creative' },
		{ label: '✏️ Custom Project', description: 'Create a new project category', value: 'custom' }
	];

	const selectedProject = await vscode.window.showQuickPick(projectOptions, {
		placeHolder: '📁 Step 4/4: Choose a project category (optional)',
		ignoreFocusOut: true,
		matchOnDescription: true
	});

	if (!selectedProject) {
		return undefined;
	}

	let projectName = selectedProject.value;

	// Handle custom project creation
	if (selectedProject.value === 'custom') {
		const customProject = await vscode.window.showInputBox({
			placeHolder: 'Enter project name (e.g., "Mobile App", "Website Redesign")',
			prompt: '📁 Create new project category',
			ignoreFocusOut: true,
			validateInput: (value) => {
				if (!value || value.trim().length === 0) {
					return 'Project name cannot be empty';
				}
				if (value.trim().length > 50) {
					return 'Project name is too long (max 50 characters)';
				}
				return null;
			}
		});
		
		if (!customProject) {
			return undefined;
		}
		
		projectName = customProject.trim();
	}

	return {
		text: text.trim(),
		priority: selectedPriority.value,
		dueDate,
		projectName
	};
}

// Generate beautiful HTML for task detail view
function generateTaskDetailHTML(todo: any): string {
	const now = new Date();
	const isOverdue = todo.dueDate && new Date(todo.dueDate) < now && !todo.completed;
	const priorityColor = todo.priority === 'high' ? '#ff4757' : 
						  todo.priority === 'medium' ? '#ffa502' : '#57606f';
	const statusIcon = todo.completed ? '✅' : (isOverdue ? '⚠️' : '⏳');
	const statusText = todo.completed ? 'Completed' : (isOverdue ? 'Overdue' : 'Active');
	const statusColor = todo.completed ? '#2ed573' : (isOverdue ? '#ff4757' : '#3742fa');

	return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Task Details</title>
			<style>
				body {
					font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
					margin: 0;
					padding: 20px;
					background: var(--vscode-editor-background);
					color: var(--vscode-editor-foreground);
					line-height: 1.6;
				}
				.task-header {
					background: var(--vscode-sideBar-background);
					border-radius: 8px;
					padding: 20px;
					margin-bottom: 20px;
					border-left: 4px solid ${priorityColor};
				}
				.task-title {
					font-size: 1.4em;
					font-weight: 600;
					margin: 0 0 10px 0;
					color: var(--vscode-editor-foreground);
				}
				.task-meta {
					display: flex;
					gap: 15px;
					flex-wrap: wrap;
					margin-top: 15px;
				}
				.meta-item {
					display: flex;
					align-items: center;
					gap: 5px;
					background: var(--vscode-input-background);
					padding: 5px 10px;
					border-radius: 15px;
					font-size: 0.9em;
				}
				.status-badge {
					background: ${statusColor}20;
					color: ${statusColor};
					font-weight: 500;
				}
				.priority-badge {
					background: ${priorityColor}20;
					color: ${priorityColor};
					font-weight: 500;
				}
				.actions {
					display: grid;
					grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
					gap: 10px;
					margin-top: 20px;
				}
				.btn {
					padding: 10px 15px;
					border: none;
					border-radius: 6px;
					cursor: pointer;
					font-weight: 500;
					transition: all 0.2s;
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 6px;
				}
				.btn-primary {
					background: var(--vscode-button-background);
					color: var(--vscode-button-foreground);
				}
				.btn-primary:hover {
					background: var(--vscode-button-hoverBackground);
				}
				.btn-secondary {
					background: var(--vscode-input-background);
					color: var(--vscode-input-foreground);
					border: 1px solid var(--vscode-input-border);
				}
				.btn-danger {
					background: #ff475720;
					color: #ff4757;
					border: 1px solid #ff475740;
				}
				.info-section {
					background: var(--vscode-sideBar-background);
					border-radius: 8px;
					padding: 15px;
					margin-top: 15px;
				}
				.info-title {
					font-weight: 600;
					margin-bottom: 10px;
					color: var(--vscode-editor-foreground);
				}
				.info-item {
					margin: 8px 0;
					display: flex;
					align-items: center;
					gap: 8px;
				}
				.emoji {
					font-size: 1.1em;
				}
			</style>
		</head>
		<body>
			<div class="task-header">
				<div class="task-title">${todo.text}</div>
				<div class="task-meta">
					<div class="meta-item status-badge">
						<span class="emoji">${statusIcon}</span>
						${statusText}
					</div>
					<div class="meta-item priority-badge">
						<span class="emoji">${todo.priority === 'high' ? '🔴' : todo.priority === 'medium' ? '🟡' : '⚪'}</span>
						${todo.priority.toUpperCase()} Priority
					</div>
					${todo.projectName ? `<div class="meta-item"><span class="emoji">📁</span>${todo.projectName}</div>` : ''}
				</div>
			</div>

			<div class="actions">
				${!todo.completed ? '<button class="btn btn-primary" onclick="completeTask()">✅ Mark Complete</button>' : '<button class="btn btn-secondary" onclick="completeTask()">↩️ Mark Incomplete</button>'}
				<button class="btn btn-secondary" onclick="editTask()">✏️ Edit</button>
				<button class="btn btn-secondary" onclick="setReminder()">🔔 Set Reminder</button>
				<button class="btn btn-danger" onclick="deleteTask()">🗑️ Delete</button>
			</div>

			<div class="info-section">
				<div class="info-title">📊 Task Information</div>
				<div class="info-item">
					<span class="emoji">📅</span>
					<strong>Created:</strong> ${new Date(todo.createdAt).toLocaleDateString()} at ${new Date(todo.createdAt).toLocaleTimeString()}
				</div>
				${todo.dueDate ? `<div class="info-item">
					<span class="emoji">🗓️</span>
					<strong>Due Date:</strong> ${new Date(todo.dueDate).toLocaleDateString()} at ${new Date(todo.dueDate).toLocaleTimeString()}
					${isOverdue ? '<span style="color: #ff4757; font-weight: bold;"> (OVERDUE!)</span>' : ''}
				</div>` : ''}
				${todo.reminder ? `<div class="info-item">
					<span class="emoji">🔔</span>
					<strong>Reminder:</strong> ${new Date(todo.reminder).toLocaleDateString()} at ${new Date(todo.reminder).toLocaleTimeString()}
				</div>` : ''}
				<div class="info-item">
					<span class="emoji">🆔</span>
					<strong>Task ID:</strong> ${todo.id}
				</div>
			</div>

			<div class="info-section">
				<div class="info-title">🎯 Quick Actions</div>
				<div style="display: flex; gap: 10px; flex-wrap: wrap;">
					<button class="btn btn-secondary" onclick="openTaskLog()">📄 View Task Log</button>
				</div>
			</div>

			<script>
				const vscode = acquireVsCodeApi();

				function completeTask() {
					vscode.postMessage({ command: 'complete' });
				}

				function editTask() {
					vscode.postMessage({ command: 'edit' });
				}

				function deleteTask() {
					vscode.postMessage({ command: 'delete' });
				}

				function setReminder() {
					vscode.postMessage({ command: 'setReminder' });
				}

				function openTaskLog() {
					vscode.postMessage({ command: 'openLog' });
				}
			</script>
		</body>
		</html>
	`;
}

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
		// Add Todo Command - Enhanced UX
		vscode.commands.registerCommand('todoManager.addTodo', async () => {
			const result = await showEnhancedTodoCreator();
			if (result) {
				todoProvider.addTodo(result.text, result.priority, result.dueDate, result.projectName);
				
				// Show success with contextual message
				const priorityEmoji = result.priority === 'high' ? '🔴' : result.priority === 'medium' ? '🟡' : '🟢';
				const dueDateStr = result.dueDate ? ` (due ${formatDate(result.dueDate)})` : '';
				
				vscode.window.showInformationMessage(
					`✅ ${priorityEmoji} Todo added: "${result.text}"${dueDateStr}`,
					'Add Another',
					'Set Reminder'
				).then(selection => {
					if (selection === 'Add Another') {
						vscode.commands.executeCommand('todoManager.addTodo');
					} else if (selection === 'Set Reminder') {
						// Find the newly added todo and set reminder
						const todos = todoProvider.getTodos();
						const newTodo = todos[todos.length - 1]; // Latest todo
						if (newTodo) {
							const treeItem = new TodoTreeItem(newTodo, vscode.TreeItemCollapsibleState.None);
							vscode.commands.executeCommand('todoManager.setReminder', treeItem);
						}
					}
				});
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

		// Edit Todo Command - Enhanced UX
		vscode.commands.registerCommand('todoManager.editTodo', async (item: TodoTreeItem) => {
			if (item) {
				const priorityEmoji = item.todo.priority === 'high' ? '🔴' : item.todo.priority === 'medium' ? '🟡' : '🟢';
				
				const newText = await vscode.window.showInputBox({
					value: item.todo.text,
					prompt: `✏️ Edit ${priorityEmoji} ${item.todo.priority} priority todo`,
					placeHolder: 'Update your todo description...',
					ignoreFocusOut: true,
					validateInput: (value) => {
						if (!value || value.trim().length === 0) {
							return 'Todo text cannot be empty';
						}
						if (value.trim().length > 200) {
							return 'Todo text is too long (max 200 characters)';
						}
						return null;
					}
				});

				if (newText && newText.trim() && newText.trim() !== item.todo.text) {
					todoProvider.editTodo(item.todo.id, newText.trim());
					vscode.window.showInformationMessage(
						`✅ Todo updated: "${newText.trim()}"`,
						'Edit Priority',
						'Set Reminder'
					).then(selection => {
						if (selection === 'Edit Priority') {
							// Future enhancement: Add priority editing
							vscode.window.showInformationMessage('Priority editing coming soon!');
						} else if (selection === 'Set Reminder') {
							vscode.commands.executeCommand('todoManager.setReminder', item);
						}
					});
				}
			}
		}),

		// Set Reminder Command - Enhanced UX
		vscode.commands.registerCommand('todoManager.setReminder', async (item: TodoTreeItem) => {
			if (item) {
				const reminderTime = await showSmartReminderPicker();
				if (reminderTime) {
					todoProvider.setReminder(item.todo.id, reminderTime);
					const timeStr = formatReminderTime(reminderTime);
					vscode.window.showInformationMessage(`⏰ Reminder set for ${timeStr}`, 'OK');
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
		}),

		// View Task Log Command
		vscode.commands.registerCommand('todoManager.viewTaskLog', async () => {
			try {
				const path = require('path');
				const os = require('os');
				const fs = require('fs').promises;
				
				const logFilePath = path.join(os.homedir(), 'vscode-todo-tasks.txt');
				
				// Check if file exists
				try {
					await fs.access(logFilePath);
				} catch (error) {
					vscode.window.showInformationMessage(
						'📄 No task log found yet. Add some todos to start logging!',
						'Add Todo'
					).then(selection => {
						if (selection === 'Add Todo') {
							vscode.commands.executeCommand('todoManager.addTodo');
						}
					});
					return;
				}
				
				// Open the file in VS Code
				const document = await vscode.workspace.openTextDocument(logFilePath);
				await vscode.window.showTextDocument(document, {
					preview: false,
					viewColumn: vscode.ViewColumn.Beside
				});
				
				vscode.window.showInformationMessage(
					`📄 Task log opened! Located at: ${logFilePath}`,
					'OK'
				);
				
			} catch (error) {
				console.error('❌ Error opening task log:', error);
				vscode.window.showErrorMessage(`Failed to open task log: ${error}`);
			}
		}),

		// Task Detail View Command
		vscode.commands.registerCommand('todoManager.openTaskDetail', async (todo: any) => {
			try {
				// Create a comprehensive task detail panel
				const panel = vscode.window.createWebviewPanel(
					'taskDetail',
					`📝 ${todo.text}`,
					vscode.ViewColumn.Beside,
					{
						enableScripts: true,
						retainContextWhenHidden: true
					}
				);

				// Generate the task detail HTML
				panel.webview.html = generateTaskDetailHTML(todo);

				// Handle messages from the webview
				panel.webview.onDidReceiveMessage(async (message) => {
					switch (message.command) {
						case 'complete':
							todoProvider.completeTodo(todo.id);
							panel.dispose();
							break;
						case 'edit':
							const newText = await vscode.window.showInputBox({
								prompt: 'Edit task text',
								value: todo.text,
								placeHolder: 'Enter task description...'
							});
							if (newText) {
								todoProvider.editTodo(todo.id, newText);
								panel.title = `📝 ${newText}`;
								panel.webview.html = generateTaskDetailHTML({...todo, text: newText});
							}
							break;
						case 'delete':
							const confirm = await vscode.window.showWarningMessage(
								'Are you sure you want to delete this task?',
								'Delete', 'Cancel'
							);
							if (confirm === 'Delete') {
								todoProvider.deleteTodo(todo.id);
								panel.dispose();
							}
							break;
						case 'setReminder':
							const reminderResult = await showSmartReminderPicker();
							if (reminderResult) {
								todoProvider.setReminder(todo.id, reminderResult);
								panel.webview.html = generateTaskDetailHTML({...todo, reminder: reminderResult});
							}
							break;
						case 'openLog':
							vscode.commands.executeCommand('todoManager.viewTaskLog');
							break;
					}
				});

			} catch (error) {
				console.error('❌ Error opening task detail:', error);
				vscode.window.showErrorMessage(`Failed to open task details: ${error}`);
			}
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
