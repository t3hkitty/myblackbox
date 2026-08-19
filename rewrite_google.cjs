const fs = require('fs');

let content = fs.readFileSync('src/services/googleDriveAuthEngine.js', 'utf8');

// 1. Import n8nEngine at top
content = "import { n8nEngine } from '@lorik/shared-kawaii-ui';\n" + content;

// 2. Replace syncTaskToGoogleTasks
const syncTaskTarget = /export async function syncTaskToGoogleTasks\([\s\S]*?return \{ success: true, localOnly: true, title: taskTitle, listName \};\n\}/;
const syncTaskReplacement = `export async function syncTaskToGoogleTasks(taskTitle, listName = 'blackbox', notes = '') {
  logSyncDiagnostic('PUSH_TASK_START', \`Dispatching task "\${taskTitle}" to n8n for list "\${listName}"\`, 'INFO');
  
  n8nEngine.fireAndForget('push-google-task', { taskTitle, listName, notes });
  
  logSyncDiagnostic('PUSH_TASK_SUCCESS', \`Task dispatched to n8n gateway successfully!\`, 'SUCCESS');
  return { success: true, localOnly: false, title: taskTitle, listName };
}`;
content = content.replace(syncTaskTarget, syncTaskReplacement);

// 3. Replace fetchTasksFromGoogleTasks
const fetchTasksTarget = /export async function fetchTasksFromGoogleTasks\([\s\S]*?return \[\];\n\}/;
const fetchTasksReplacement = `export async function fetchTasksFromGoogleTasks(listName = 'blackbox') {
  logSyncDiagnostic('PULL_TASKS_START', \`Requesting n8n to fetch tasks for list "\${listName}"\`, 'INFO');
  
  try {
    const items = await n8nEngine.triggerWorkflow('pull-google-tasks', { listName }, true);
    if (items && Array.isArray(items)) {
      logSyncDiagnostic('PULL_TASKS_SUCCESS', \`Fetched \${items.length} tasks from n8n for "\${listName}"!\`, 'SUCCESS', items);
      return items;
    }
  } catch(e) {
    logSyncDiagnostic('PULL_TASKS_EXCEPTION', \`n8n fetch exception: \${e.message}\`, 'ERROR');
  }
  
  return [];
}`;
content = content.replace(fetchTasksTarget, fetchTasksReplacement);

// 4. Replace fetchUserGoogleTaskLists
const fetchListsTarget = /export async function fetchUserGoogleTaskLists\(\) \{[\s\S]*?title: 'blackbox_braindump' \}\n  \];\n\}/;
const fetchListsReplacement = `export async function fetchUserGoogleTaskLists() {
  logSyncDiagnostic('FETCH_TASK_LISTS_START', 'Querying n8n for Google Task Lists', 'INFO');
  
  const lists = await n8nEngine.triggerWorkflow('fetch-google-task-lists', {}, true);
  if (lists && Array.isArray(lists)) {
      logSyncDiagnostic('FETCH_TASK_LISTS_SUCCESS', \`Retrieved \${lists.length} lists from n8n!\`, 'SUCCESS', lists);
      return lists;
  }
  
  // Fallback preset channels
  return [
    { id: 'l_default', title: 'My Tasks' },
    { id: 'l_bb', title: 'blackbox' },
    { id: 'l_round', title: 'roundtoit' }
  ];
}`;
content = content.replace(fetchListsTarget, fetchListsReplacement);

fs.writeFileSync('src/services/googleDriveAuthEngine.js', content);
console.log("Rewrote Google Engine!");
