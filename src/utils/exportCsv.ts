import { AppState } from '../types';

export function exportStudyDataAsCsv(state: AppState) {
  // We'll prepare a clean CSV of all study tasks and focus sessions with metadata
  const rows: string[] = [];

  // 1. Tasks Sheet
  rows.push('--- STUDY QUEST TASKS ---');
  rows.push('Task_ID,Date,Subject,Topic,Duration_Minutes,Priority,Completed,Completed_At');
  state.tasks.forEach((t) => {
    rows.push(
      [
        escapeCsv(t.id),
        escapeCsv(t.date),
        escapeCsv(t.subject),
        escapeCsv(t.topic),
        t.durationMinutes,
        escapeCsv(t.priority),
        t.completed ? 'YES' : 'NO',
        escapeCsv(t.completedAt || ''),
      ].join(',')
    );
  });

  rows.push('');
  // 2. Focus Sessions Sheet
  rows.push('--- FOCUS SESSIONS LOG ---');
  rows.push('Session_ID,Date,Duration_Minutes,Mode,Subject');
  state.focusSessions.forEach((s) => {
    rows.push(
      [
        escapeCsv(s.id),
        escapeCsv(s.date),
        s.durationMinutes,
        escapeCsv(s.mode),
        escapeCsv(s.subject || 'General Focus'),
      ].join(',')
    );
  });

  rows.push('');
  // 3. Garden Blooms Sheet
  rows.push('--- VIRTUAL GARDEN HARVEST ---');
  rows.push('Flower_ID,Flower_Type,Growth_Stage,Subject,Planted_Date,Quiz_Question');
  state.garden.forEach((f) => {
    rows.push(
      [
        escapeCsv(f.id),
        escapeCsv(f.type),
        escapeCsv(f.stage),
        escapeCsv(f.subject),
        escapeCsv(f.plantedAt),
        escapeCsv(f.questionAnswered || ''),
      ].join(',')
    );
  });

  rows.push('');
  // 4. Summary Key Metrics
  rows.push('--- SUMMARY STATS ---');
  rows.push('Metric,Value');
  rows.push(`Total_Stars,${state.stars}`);
  rows.push(`Current_Streak_Days,${state.streak}`);
  rows.push(`Mascot_Name,${escapeCsv(state.settings.petName)}`);
  rows.push(`Mascot_Type,${escapeCsv(state.settings.petType)}`);
  rows.push(`Total_Tasks_Done,${state.tasks.filter((t) => t.completed).length}`);
  rows.push(`Total_Garden_Blooms,${state.garden.length}`);
  rows.push(`Export_Timestamp,${new Date().toISOString()}`);

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', `study_quest_garden_data_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function escapeCsv(val: string): string {
  if (val === undefined || val === null) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
