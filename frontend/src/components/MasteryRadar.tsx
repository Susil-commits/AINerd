import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  Tooltip
} from 'recharts'
import './MasteryRadar.css'

interface SkillMastery {
  skill_id: string
  name: string
  mastery_prob: number
}

interface Props {
  skills: SkillMastery[]
}

const SKILL_SHORT_NAMES: Record<string, string> = {
  '3.OA.A.1': 'Multiply',
  '3.OA.A.2': 'Divide',
  '3.OA.D.8': '2-Step WP',
  '4.NF.A.1': 'Equiv. Frac',
  '4.NF.B.3': 'Add Frac',
  '4.NF.B.4': 'Frac × Whole',
  '5.NF.B.7': 'Div. Frac',
  '6.EE.A.2': 'Expressions',
  '6.EE.B.7': '1-Step Eq',
  '7.EE.B.4': 'Multi-Step Eq',
}

const getMasteryLevel = (prob: number) => {
  if (prob >= 0.7) return { label: 'Strong', color: 'var(--emerald)' }
  if (prob >= 0.4) return { label: 'Developing', color: 'var(--amber)' }
  return { label: 'Needs work', color: 'var(--rose)' }
}

export default function MasteryRadar({ skills = [] }: Props) {
  const safeSkills = skills || []
  const data = safeSkills.map(s => ({
    subject: SKILL_SHORT_NAMES[s.skill_id] ?? s.skill_id,
    mastery: Math.round((s.mastery_prob ?? 0) * 100),
    fullMark: 100,
    name: s.name,
  }))

  return (
    <div className="mastery-container">
      <div className="mastery-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h3 className="mastery-title" style={{ margin: 0 }}>Skill Progress</h3>
        <span className="badge badge-emerald" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
          Live Progress Map
        </span>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="rgba(255,255,255,0.06)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontFamily: 'Inter' }}
          />
          <Radar
            name="Progress"
            dataKey="mastery"
            stroke="var(--violet)"
            fill="var(--violet)"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
            }}
            formatter={(value: any) => [`${value ?? 0}%`, 'Progress']}
          />
        </RadarChart>
      </ResponsiveContainer>

      <div className="mastery-bars">
        {safeSkills.map(s => {
          const level = getMasteryLevel(s.mastery_prob ?? 0)
          return (
            <div key={s.skill_id} className="mastery-bar-row">
              <div className="mastery-bar-label">
                <span>{s.name}</span>
                <span className="mastery-pct" style={{ color: level.color }}>
                  {Math.round((s.mastery_prob ?? 0) * 100)}%
                </span>
              </div>
              <div className="mastery-bar-track">
                <div
                  className="mastery-bar-fill"
                  style={{
                    width: `${Math.min(Math.max((s.mastery_prob ?? 0) * 100, 0), 100)}%`,
                    background: level.color,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
