import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, FileText } from 'lucide-react'
import { getMastery, getSummary } from '../lib/api'
import MasteryRadar from '../components/MasteryRadar'
import './Dashboard.css'

interface SkillMastery {
  skill_id: string
  name: string
  mastery_prob: number
}

export default function Dashboard() {
  const { studentId } = useParams<{ studentId: string }>()
  const navigate = useNavigate()
  const [skills, setSkills] = useState<SkillMastery[]>([])
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(true)
  const sessionId = sessionStorage.getItem('session')
    ? JSON.parse(sessionStorage.getItem('session')!).session_id
    : null
  const studentName = sessionStorage.getItem('session')
    ? JSON.parse(sessionStorage.getItem('session')!).student_name
    : 'Student'

  useEffect(() => {
    if (!studentId) return
    Promise.all([
      getMastery(studentId),
      sessionId ? getSummary(studentId, sessionId) : Promise.resolve(null),
    ]).then(([masteryData, summaryData]) => {
      // Build skills array with names from all_skills
      const skillMap: Record<string, string> = {}
      for (const s of masteryData.all_skills ?? []) skillMap[s.id] = s.name

      const skillsArr: SkillMastery[] = masteryData.mastery.map((row: any) => ({
        skill_id: row.skill_id,
        name: skillMap[row.skill_id] ?? row.skill_id,
        mastery_prob: row.mastery_prob,
      }))
      setSkills(skillsArr)
      if (summaryData?.summary) setSummary(summaryData.summary)
    }).finally(() => setLoading(false))
  }, [studentId, sessionId])

  const avgMastery = skills.length
    ? skills.reduce((a, s) => a + s.mastery_prob, 0) / skills.length
    : 0

  const strongSkills  = skills.filter(s => s.mastery_prob >= 0.7)
  const weakSkills    = skills.filter(s => s.mastery_prob < 0.4)

  return (
    <div className="dashboard">
      <header className="dash-header">
        <button className="btn btn-ghost" onClick={() => navigate('/session')}>
          <ArrowLeft size={16} /> Back to Session
        </button>
        <div>
          <h2>{studentName}'s Learning Dashboard</h2>
          <p className="dash-sub">Bayesian Knowledge Tracing — live mastery estimates</p>
        </div>
        <div className="dash-stats">
          <div className="dash-stat">
            <span>{Math.round(avgMastery * 100)}%</span>
            <label>Avg Mastery</label>
          </div>
          <div className="dash-stat">
            <span>{strongSkills.length}</span>
            <label>Strong Skills</label>
          </div>
          <div className="dash-stat">
            <span>{weakSkills.length}</span>
            <label>Need Work</label>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="dash-loading">Loading mastery data…</div>
      ) : (
        <div className="dash-content">
          <div className="dash-left">
            <MasteryRadar skills={skills} />

            {/* Skill breakdown cards */}
            <div className="skill-cards">
              {skills
                .sort((a, b) => a.mastery_prob - b.mastery_prob)
                .map(s => {
                  const pct = Math.round(s.mastery_prob * 100)
                  const level = pct >= 70 ? 'strong' : pct >= 40 ? 'developing' : 'weak'
                  return (
                    <div key={s.skill_id} className={`skill-card skill-card--${level}`}>
                      <div className="skill-card-top">
                        <span className="skill-name">{s.name}</span>
                        <span className="skill-pct">{pct}%</span>
                      </div>
                      <div className="skill-bar-track">
                        <div className="skill-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="skill-std">{s.skill_id}</span>
                    </div>
                  )
                })}
            </div>
          </div>

          <div className="dash-right">
            <div className="card summary-card">
              <h3><FileText size={18} /> Session Summary</h3>
              {summary ? (
                <p className="summary-text">{summary}</p>
              ) : (
                <p className="summary-empty">
                  Complete a tutoring session to generate an AI-written summary for teachers and parents.
                </p>
              )}
            </div>

            <div className="card recommendations-card">
              <h3><TrendingUp size={18} /> Recommendations</h3>
              {weakSkills.length === 0 ? (
                <p className="rec-good">🎉 All skills are developing or strong!</p>
              ) : (
                <ul className="rec-list">
                  {weakSkills.slice(0, 3).map(s => (
                    <li key={s.skill_id}>
                      <span className="badge badge-rose">Focus</span>
                      {s.name} — {Math.round(s.mastery_prob * 100)}% mastery
                    </li>
                  ))}
                </ul>
              )}
              {strongSkills.length > 0 && (
                <>
                  <h4 style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ready to advance</h4>
                  <ul className="rec-list">
                    {strongSkills.slice(0, 2).map(s => (
                      <li key={s.skill_id}>
                        <span className="badge badge-emerald">✓</span>
                        {s.name}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
