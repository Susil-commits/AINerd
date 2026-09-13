import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getParentChildren, addChild, getChildDetails, deleteParentData, type ChildItem } from '../lib/api'
import { supabase } from '../lib/supabase'
import MasteryRadar from '../components/MasteryRadar'
import './ParentDashboard.css'

interface SkillItem {
  skill_id: string
  name: string
  mastery_prob: number
}

export default function ParentDashboard() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [childrenList, setChildrenList] = useState<ChildItem[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [childDetails, setChildDetails] = useState<any>(null)
  const [skills, setSkills] = useState<SkillItem[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newChildEmail, setNewChildEmail] = useState('')
  const [newChildName, setNewChildName] = useState('')
  const [addError, setAddError] = useState('')
  const [addingChild, setAddingChild] = useState(false)
  const [liveIndicator, setLiveIndicator] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingData, setDeletingData] = useState(false)
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState('')
  const realtimeChannelRef = useRef<any>(null)

  const parentId = user?.id || '99999999-8888-7777-6666-555555555555'
  const parentEmail = user?.email || 'parent.sarah@veritas.dev'

  const handleDeleteData = async () => {
    setDeletingData(true)
    try {
      const res = await deleteParentData(parentId)
      setDeleteSuccessMsg(res.message || 'All activity data successfully purged.')
      setTimeout(() => {
        setShowDeleteModal(false)
        setDeleteSuccessMsg('')
        refreshChildren()
      }, 1200)
    } catch (err: any) {
      alert('Failed to delete data: ' + (err.response?.data?.detail || err.message))
    } finally {
      setDeletingData(false)
    }
  }

  // Fetch children list
  const refreshChildren = useCallback(async () => {
    try {
      const res = await getParentChildren(parentId)
      const list = res.children || []
      setChildrenList(list)
      if (list.length > 0 && (!selectedChildId || !list.some(c => c.student_id === selectedChildId))) {
        setSelectedChildId(list[0].student_id)
      }
    } catch (err) {
      console.warn('Could not load parent children:', err)
    }
  }, [parentId, selectedChildId])

  // Initial load
  useEffect(() => {
    document.title = 'Veritas — Parent Dashboard'
    refreshChildren()
  }, [refreshChildren])

  // Fetch selected child details & mastery
  const refreshChildDetails = useCallback(async (childId: string) => {
    try {
      const data = await getChildDetails(parentId, childId)
      setChildDetails(data)

      const skillMap: Record<string, string> = {}
      for (const s of data.all_skills ?? []) skillMap[s.id] = s.name

      const skillsArr: SkillItem[] = (data.mastery || []).map((row: any) => ({
        skill_id: row.skill_id,
        name: skillMap[row.skill_id] ?? row.skill_id,
        mastery_prob: row.mastery_prob,
      }))
      setSkills(skillsArr)
    } catch (err) {
      console.warn('Error loading child details:', err)
    }
  }, [parentId])

  useEffect(() => {
    if (selectedChildId) {
      refreshChildDetails(selectedChildId)
    }
  }, [selectedChildId, refreshChildDetails])

  // Real-time updates: Subscribe to Supabase Realtime + Polling fallback
  useEffect(() => {
    if (!selectedChildId) return

    // 1. Supabase Realtime subscription
    try {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current)
      }

      const channel = supabase
        .channel(`parent-radar-${selectedChildId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'learning_events',
            filter: `student_id=eq.${selectedChildId}`,
          },
          (payload) => {
            console.log('Realtime learning event received:', payload)
            setLiveIndicator(true)
            setTimeout(() => setLiveIndicator(false), 2000)
            refreshChildDetails(selectedChildId)
          }
        )
        .subscribe()

      realtimeChannelRef.current = channel
    } catch (err) {
      console.warn('Supabase realtime subscription failed:', err)
    }

    // 2. High-frequency polling fallback (every 3 seconds) for live demo responsiveness
    const pollTimer = setInterval(() => {
      refreshChildDetails(selectedChildId)
    }, 3000)

    return () => {
      clearInterval(pollTimer)
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current)
      }
    }
  }, [selectedChildId, refreshChildDetails])

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChildEmail) return
    setAddingChild(true)
    setAddError('')
    try {
      const res = await addChild(parentId, newChildEmail, newChildName)
      setShowAddModal(false)
      setNewChildEmail('')
      setNewChildName('')
      await refreshChildren()
      if (res.child?.student_id) {
        setSelectedChildId(res.child.student_id)
      }
    } catch (err: any) {
      setAddError(err?.response?.data?.detail || err?.message || 'Could not link child. Please try again.')
    } finally {
      setAddingChild(false)
    }
  }

  const selectedChild = childrenList.find((c) => c.student_id === selectedChildId)

  const avgMastery = skills.length
    ? Math.round((skills.reduce((a, s) => a + s.mastery_prob, 0) / skills.length) * 100)
    : 0

  return (
    <div className="parent-dashboard">
      {/* Top Navbar */}
      <header className="parent-navbar">
        <div className="parent-nav-left">
          <div className="parent-brand" onClick={() => navigate('/')}>
            <span className="brand-title">Veritas<span className="brand-dot">.</span></span>
            <span className="parent-badge">Parent Portal</span>
          </div>
          <div className={`live-pulse-badge ${liveIndicator ? 'live-pulse-badge--active' : ''}`}>
            <span className="pulse-dot" />
            <span>Live Radar Sync</span>
          </div>
        </div>

        <div className="parent-nav-right">
          <div className="parent-user-pill">
            <span className="parent-avatar">P</span>
            <span className="parent-email">{parentEmail}</span>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={async () => {
              await signOut()
              navigate('/')
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="parent-content">
        {/* Children Management Ribbon */}
        <section className="children-ribbon">
          <div className="ribbon-header">
            <div className="ribbon-title">
              <h3>Your Children</h3>
              <span className="children-count">{childrenList.length}</span>
            </div>
            <button
              className="btn btn-sm btn-outline-violet"
              onClick={() => setShowAddModal(true)}
              id="add-child-btn"
            >
              Add Child
            </button>
          </div>

          <div className="children-cards-list">
            {childrenList.map((child) => {
              const isSelected = child.student_id === selectedChildId
              return (
                <div
                  key={child.student_id}
                  className={`child-card ${isSelected ? 'child-card--active' : ''}`}
                  onClick={() => setSelectedChildId(child.student_id)}
                >
                  <div className="child-card-header">
                    <div className="child-avatar">S</div>
                    <div className="child-meta">
                      <h4>{child.student_name}</h4>
                      <p>{child.student_email}</p>
                    </div>
                  </div>
                  {child.has_fraction_gap && (
                    <div className="gap-pill">
                      <span>{child.fraction_alert_message}</span>
                    </div>
                  )}
                  <div className="child-card-footer">
                    <span>{child.session_count} sessions</span>
                    <span className="footer-link">
                      View Radar
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Selected Child Detailed View */}
        {selectedChild ? (
          <div className="child-detail-view">
            {/* Demo Highlight Banner */}
            {selectedChild.has_fraction_gap && (
              <div className="alert-banner">
                <div className="alert-content">
                  <h4>Inactivity Warning — Practice Gap Spotted</h4>
                  <p>
                    <strong>{selectedChild.student_name}</strong> has not practiced fractions in{' '}
                    <strong>{selectedChild.days_since_practice} days</strong>. Concept retention declines rapidly
                    without reinforcement. Start a practice session to guide them through fraction addition.
                  </p>
                </div>
                <button
                  className="btn btn-amber alert-action-btn"
                  onClick={() => {
                    sessionStorage.setItem(
                      'session',
                      JSON.stringify({
                        student_id: selectedChild.student_id,
                        student_name: selectedChild.student_name,
                      })
                    )
                    window.open('/student-session', '_blank')
                  }}
                >
                  Start Kid Session
                </button>
              </div>
            )}

            {/* Main Grid: Live Mastery Radar + Skill Breakdown */}
            <div className="radar-grid">
              <div className="radar-panel">
                <div className="panel-header">
                  <div>
                    <h3>Real-Time Mastery Radar</h3>
                    <p className="panel-sub">
                      Visualizing real-time skill progress and mastery. Watch this update live as your
                      child solves problems!
                    </p>
                  </div>
                  <div className="overall-badge">
                    <span>{avgMastery}% Overall</span>
                  </div>
                </div>

                <div className="radar-container">
                  {skills.length > 0 ? (
                    <MasteryRadar skills={skills} />
                  ) : (
                    <div className="radar-empty">Initializing skill radar…</div>
                  )}
                </div>
              </div>

              {/* Skills breakdown */}
              <div className="skills-panel">
                <div className="panel-header">
                  <h3>Curriculum Competencies</h3>
                  <span className="skills-badge">{skills.length} Math Competencies</span>
                </div>

                <div className="skills-list">
                  {skills.map((s) => {
                    const pct = Math.round(s.mastery_prob * 100)
                    const isFraction = s.name.toLowerCase().includes('fraction')
                    const level = pct >= 70 ? 'strong' : pct >= 40 ? 'developing' : 'needs-practice'
                    return (
                      <div
                        key={s.skill_id}
                        className={`skill-item skill-item--${level} ${isFraction ? 'skill-item--highlight' : ''}`}
                      >
                        <div className="skill-info">
                          <div className="skill-title-row">
                            <span className="skill-id-tag">{s.skill_id}</span>
                            <span className="skill-name-text">{s.name}</span>
                            {isFraction && <span className="fraction-tag">Target Focus</span>}
                          </div>
                          <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <div className="skill-percent">{pct}%</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Session History & Recent Problem Attempts */}
            <div className="history-section">
              <div className="panel-header">
                <div>
                  <h3>Session History & Problem Log</h3>
                  <p className="panel-sub">Recent Socratic dialogues and diagnostic work checks</p>
                </div>
              </div>

              <div className="history-grid">
                <div className="history-column">
                  <h4>Recent Sessions</h4>
                  {childDetails?.sessions?.length > 0 ? (
                    <div className="history-list">
                      {childDetails.sessions.map((sess: any, i: number) => (
                        <div key={sess.id || i} className="session-history-item">
                          <div className="session-icon">
                            <span className="session-bullet">•</span>
                          </div>
                          <div className="session-meta">
                            <span className="session-date">
                              {new Date(sess.started_at || Date.now()).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span className="session-tag">Math Tutoring Session</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-history">No sessions recorded yet. Launch a session to start learning!</div>
                  )}
                </div>

                <div className="history-column">
                  <h4>Recent Problem Diagnoses</h4>
                  {childDetails?.recent_events?.length > 0 ? (
                    <div className="events-list">
                      {childDetails.recent_events.map((evt: any, i: number) => (
                        <div key={evt.id || i} className="event-history-item">
                          <div className={`event-status ${evt.is_correct ? 'event-status--correct' : 'event-status--attempt'}`}>
                            <span className="status-text">{evt.is_correct ? 'Correct' : 'Needs Work'}</span>
                          </div>
                          <div className="event-info">
                            <h5>{evt.problems?.title || 'Math Practice'}</h5>
                            <p className="event-problem">{evt.problems?.text || 'Student worked through problem step.'}</p>
                            {evt.agent_response && (
                              <p className="event-tutor-guide">
                                <strong>Tutor guidance:</strong> {evt.agent_response}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-history">Problem attempts will appear here in real-time as your child practices.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Student Privacy & Parental Data Rights Card */}
            <div className="privacy-trust-card">
              <div className="privacy-trust-content">
                <div className="privacy-trust-header">
                  <span className="privacy-shield-icon">🛡️</span>
                  <div>
                    <h4>Student Data Privacy & Parental Control</h4>
                    <p>
                      In alignment with student privacy best practices, parents have full control over recorded learning history.
                      You can purge all past practice sessions, OCR diagnosis attempts, and child associations at any time.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-danger-outline"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete Activity Data
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-child-selected">
            <div className="no-child-card">
              <h3>No Child Linked Yet</h3>
              <p>Add your child’s email to start viewing their real-time math mastery radar and learning history.</p>
              <button className="btn btn-violet" onClick={() => setShowAddModal(true)}>
                Link Your First Child
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Add Child Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-box">
                <h3>Link Child to Your Dashboard</h3>
              </div>
              <button
                className="close-btn"
                onClick={() => setShowAddModal(false)}
                title="Close modal"
                aria-label="Close modal"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <p className="modal-sub">
              Enter your child's email address. Once linked, their practice sessions and skill mastery will sync to
              your dashboard in real-time.
            </p>

            <form onSubmit={handleAddChild} className="add-child-form">
              <div className="form-group">
                <label>Child's Email Address *</label>
                <input
                  type="email"
                  className="input modal-input"
                  placeholder="e.g. student.alex@veritas.dev"
                  value={newChildEmail}
                  onChange={(e) => setNewChildEmail(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="form-group">
                <label>Child's Name (Optional)</label>
                <input
                  type="text"
                  className="input modal-input"
                  placeholder="e.g. Alex"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                />
              </div>

              {addError && <p className="error-msg">{addError}</p>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowAddModal(false)}
                  disabled={addingChild}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-violet" disabled={addingChild}>
                  {addingChild ? 'Linking…' : 'Link Child'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Data Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-backdrop" onClick={() => !deletingData && setShowDeleteModal(false)}>
          <div className="modal-card modal-card--danger" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-box">
                <h3 className="text-danger">Purge Activity & Learning History</h3>
              </div>
              <button
                className="close-btn"
                onClick={() => !deletingData && setShowDeleteModal(false)}
                title="Close modal"
                disabled={deletingData}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <p className="modal-sub">
              Are you sure you want to permanently delete all tutoring session logs, problem diagnoses, and student event records? This action cannot be undone.
            </p>

            {deleteSuccessMsg && (
              <div className="success-banner">
                ✓ {deleteSuccessMsg}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingData}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteData}
                disabled={deletingData}
              >
                {deletingData ? 'Purging Records…' : 'Yes, Delete All Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
