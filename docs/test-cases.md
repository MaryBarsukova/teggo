# Teggo — Manual Test Cases

## Auth
- [ ] TC-001: User can register with valid email and password
- [ ] TC-002: Registration fails with invalid email format
- [ ] TC-003: Registration fails if password is too short (under 6 chars)
- [ ] TC-004: User can sign in with correct credentials
- [ ] TC-005: Sign in fails with wrong password — friendly error shown
- [ ] TC-006: Unauthenticated user is redirected to /login
- [ ] TC-007: User can sign out — redirected to /login

## Today Screen
- [ ] TC-008: Today screen shows today's date and weekday
- [ ] TC-009: Streak pill shows current streak count
- [ ] TC-010: Heatmap shows last 14 days with correct opacity
- [ ] TC-011: Tasks for today are shown in chronological order
- [ ] TC-012: Completed task shows strikethrough and filled checkbox
- [ ] TC-013: Tapping checkbox marks task as done and updates streak
- [ ] TC-014: Focus mode toggle is visible and tappable
- [ ] TC-015: Turning on Focus mode opens task picker bottomsheet
- [ ] TC-016: Task picker shows max 3 selectable tasks
- [ ] TC-017: After selecting focus tasks and tapping Done — tasks split into "In focus" and "Other" sections
- [ ] TC-018: Turning off Focus mode shows all tasks flat again
- [ ] TC-019: FAB button opens Add Task bottomsheet
- [ ] TC-020: Long press on task opens context menu with Edit and Delete
- [ ] TC-021: Description is shown under task title when "Show description" is ON in settings
- [ ] TC-022: Description is hidden when "Show description" is OFF in settings

## Add / Edit Task
- [ ] TC-023: New task bottomsheet opens with empty fields and autofocus on title
- [ ] TC-024: Task can be saved with title only (all other fields optional)
- [ ] TC-025: Save is disabled when title is empty
- [ ] TC-026: Date pill opens date picker — selected date shown on pill
- [ ] TC-027: Time pill opens time picker — selected time shown on pill
- [ ] TC-028: Repeat pill opens repeat options
- [ ] TC-029: Selecting "Every week" shows day-of-week selector
- [ ] TC-030: Tag can be selected from existing tags
- [ ] TC-031: New tag can be created inline
- [ ] TC-032: Project can be assigned to task
- [ ] TC-033: Editing a task pre-fills all existing values
- [ ] TC-034: Changes are saved and reflected immediately in the list
- [ ] TC-035: Task title max length 200 chars is enforced
- [ ] TC-036: Description max length 2000 chars is enforced

## Tasks Screen
- [ ] TC-037: "In progress" tab shows all incomplete tasks chronologically
- [ ] TC-038: Overdue task date is shown in red
- [ ] TC-039: Task title is NOT red for overdue tasks — only the date
- [ ] TC-040: Search filters tasks by title in real time
- [ ] TC-041: Tag filter shows only tasks with selected tag
- [ ] TC-042: "All" filter shows all tasks regardless of tag
- [ ] TC-043: "Done" tab shows completed tasks grouped by completion date
- [ ] TC-044: Completed tasks show strikethrough and filled checkbox
- [ ] TC-045: Group headers show correct date label (Today / Yesterday / date)
- [ ] TC-046: FAB is present on "In progress" tab, absent on "Done" tab

## Projects Screen
- [ ] TC-047: Projects list shows all user projects with progress bar
- [ ] TC-048: Progress bar percentage matches done/total task ratio
- [ ] TC-049: Tapping project opens project detail screen
- [ ] TC-050: Project detail shows "In progress" and "Completed" sections
- [ ] TC-051: FAB inside project creates task assigned to that project
- [ ] TC-052: Long press on project card opens context menu
- [ ] TC-053: Edit project pre-fills name, color, description
- [ ] TC-054: Changing project color updates the dot and progress bar color
- [ ] TC-055: Delete project requires confirmation
- [ ] TC-056: Deleted project removes it from list — tasks remain but lose project assignment
- [ ] TC-057: "New project" button opens create project bottomsheet
- [ ] TC-058: Project name max length 100 chars is enforced

## Calendar Screen
- [ ] TC-059: Current month is shown by default
- [ ] TC-060: Today is highlighted with peach circle
- [ ] TC-061: Days with tasks show a dot below the number
- [ ] TC-062: Tapping a day selects it and shows its tasks below
- [ ] TC-063: Empty day shows friendly empty state message
- [ ] TC-064: Left/right arrows navigate between months
- [ ] TC-065: FAB creates task with selected date pre-filled
- [ ] TC-066: Task created from calendar appears in Today screen if date is today

## Settings Screen
- [ ] TC-067: "Show description" toggle changes display immediately across all screens
- [ ] TC-068: Language switch changes the entire UI language immediately
- [ ] TC-069: Dark mode toggle switches theme
- [ ] TC-070: User name and email are displayed correctly in profile row
- [ ] TC-071: Sign out works and redirects to /login
- [ ] TC-072: Delete account requires confirmation before proceeding

## PWA & Mobile
- [ ] TC-073: App can be installed on iOS via Safari "Add to Home Screen"
- [ ] TC-074: App can be installed on Android via Chrome install prompt
- [ ] TC-075: Installed app opens in standalone mode (no browser UI)
- [ ] TC-076: App theme color (#F0956E) is applied to iOS status bar
- [ ] TC-077: App works offline for viewing cached data
- [ ] TC-078: Tab bar is not covered by iPhone home indicator (safe area)
- [ ] TC-079: FAB is not covered by iPhone home indicator
- [ ] TC-080: Bottomsheets slide up correctly and don't go behind keyboard

## Streak
- [ ] TC-081: Completing first task creates streak of 1
- [ ] TC-082: Completing task on consecutive day increments streak
- [ ] TC-083: Skipping one day does not break streak (freeze rule)
- [ ] TC-084: Skipping two days in a row resets streak to 1
- [ ] TC-085: Heatmap opacity reflects number of tasks completed that day

## Data & Security
- [ ] TC-086: User A cannot see User B's tasks (open DevTools, check network requests)
- [ ] TC-087: Logging out and logging in as different user shows only that user's data
- [ ] TC-088: All Supabase errors show friendly messages, not raw error text
- [ ] TC-089: App does not crash when Supabase request fails — shows error state
