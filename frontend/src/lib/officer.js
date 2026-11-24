// Officer dashboard helpers: SAMPLE data (invented, for demonstration only) and CSV export.

export const SAMPLE_MIN_GROUP = 5

// Every number below is INVENTED for demonstration. The UI must show a "SAMPLE DATA" ribbon whenever this is displayed.
export const SAMPLE_STATS = {
  min_group: SAMPLE_MIN_GROUP,
  district: null,
  suppressed: false,
  sample: true,
  total_students: 240,
  average_fit: 46,
  top_skill_gaps: [
    { key: 'english_basic', count: 118 },
    { key: 'ms_excel', count: 96 },
    { key: 'electrical_fault_finding', count: 74 },
    { key: 'communication', count: 69 },
    { key: 'cnc_basics', count: 51 },
    { key: 'networking_basics', count: 44 },
    { key: 'billing_pos', count: 31 },
    { key: 'solar_basics', count: 22 },
  ],
  top_careers: [
    { key: 'electrician', count: 62 },
    { key: 'copa_operator', count: 48 },
    { key: 'mechanical_fitter', count: 41 },
    { key: 'it_helpdesk', count: 33 },
    { key: 'retail_sales_associate', count: 27 },
    { key: 'welder', count: 21 },
  ],
  by_education: [
    { key: 'iti', count: 120 },
    { key: 'class12', count: 64 },
    { key: 'diploma', count: 38 },
    { key: 'class10', count: 18 },
  ],
  by_district: [
    { key: 'pune', count: 132 },
    { key: 'nashik', count: 58 },
    { key: 'satara', count: 31 },
    { key: 'solapur', count: 19 },
  ],
}

// Wrap a CSV field safely (quotes, commas, newlines, and spreadsheet formula characters).
export function csvField(v) {
  let s = String(v ?? '')
  if (/^[=+\-@]/.test(s)) s = "'" + s
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

// sections: [{ title, rows: [[label, count], ...] }]
export function toCsv(sections, { sample, minGroup }) {
  const lines = []
  if (sample) lines.push('SAMPLE DATA - invented numbers for demonstration only')
  lines.push(`Groups smaller than ${minGroup} are hidden`)
  for (const sec of sections) {
    lines.push('')
    lines.push(csvField(sec.title))
    for (const [label, count] of sec.rows) lines.push(`${csvField(label)},${csvField(count)}`)
  }
  return lines.join('\r\n') + '\r\n'
}
