import { useState } from 'react'
import './App.css'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

const formatCurrency = (value, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)

const getApiErrorMessage = (data) => {
  if (Array.isArray(data.detail)) {
    return data.detail.map((item) => item.msg).join(' ')
  }

  return data.detail || 'Career analysis request failed.'
}

function App() {
  const [formData, setFormData] = useState({
    country: 'Turkey',
    education_level: 'Undergraduate',
    years_code: 4,
    years_code_pro: 1,
    technologies: 'python, fastapi, scikit-learn, react, pandas',
    current_salary: '',
    weekly_learning_hours: 8,
  })
  const [result, setResult] = useState(null)
  const [submittedProfile, setSubmittedProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value, type } = event.target
    let nextValue = value

    if (type === 'number' && value !== '') {
      nextValue = Number(value)
    }

    setFormData((previousFormData) => ({
      ...previousFormData,
      [name]: nextValue,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    setSubmittedProfile(null)

    try {
      if (Number(formData.years_code_pro) > Number(formData.years_code)) {
        throw new Error(
          'Professional experience cannot exceed total coding experience.',
        )
      }

      const technologies = formData.technologies
        .split(',')
        .map((technology) => technology.trim())
        .filter(Boolean)

      const payload = {
        country: formData.country,
        education_level: formData.education_level,
        years_code: formData.years_code,
        years_code_pro: formData.years_code_pro,
        technologies,
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/salary/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(getApiErrorMessage(data))
      }

      setResult(data)
      setSubmittedProfile({
        country: formData.country,
        educationLevel: formData.education_level,
        learningHours: formData.weekly_learning_hours,
        technologyCount: new Set(
          technologies.map((technology) => technology.toLowerCase()),
        ).size,
      })
    } catch (requestError) {
      const message =
        requestError instanceof TypeError
          ? 'Could not connect to the API. Make sure the FastAPI server is running on port 8000.'
          : requestError.message

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const hasRange = result && result.upper_salary > result.lower_salary

  const rangePosition = hasRange
    ? Math.min(
        100,
        Math.max(
          0,
          ((result.predicted_salary - result.lower_salary) /
            (result.upper_salary - result.lower_salary)) *
            100,
        ),
      )
    : 50

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="CodePath AI home">
          <span className="brand-mark" aria-hidden="true">
            CP
          </span>
          <span>
            <strong>CodePath AI</strong>
            <small>Career intelligence</small>
          </span>
        </a>

        <nav className="product-nav" aria-label="Main navigation">
          <a href="#analysis">Analysis</a>
          <a href="#career-modules">Intelligence layers</a>
          <a href="#roadmap">Roadmap</a>
        </nav>

        <div className="model-badge">
          <span className="model-badge__dot" aria-hidden="true" />
          ML + AI mentor
        </div>
      </header>

      <main id="top">
        <section className="intro" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">Personal career intelligence</p>
            <h1 id="page-title">
              Know where you stand. See what to build next.
            </h1>
          </div>
          <p className="intro__copy">
            CodePath AI turns your developer profile into a salary benchmark,
            skill-gap analysis, technology recommendations and a personalized
            30/60/90-day career plan.
          </p>
        </section>

        <section
          className="analysis-grid"
          id="analysis"
          aria-label="Career analysis workspace"
        >
          <form className="profile-card" onSubmit={handleSubmit}>
            <div className="card-heading">
              <div>
                <p className="step-label">01 · Your profile</p>
                <h2>Build your career analysis</h2>
              </div>
              <span className="required-note">Salary is optional</span>
            </div>

            <div className="field-grid">
              <label className="field field--full" htmlFor="country">
                <span>Country</span>
                <input
                  id="country"
                  name="country"
                  type="text"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="e.g. Turkey"
                  autoComplete="country-name"
                  required
                />
                <small>Use the English country name used in the survey.</small>
              </label>

              <label className="field field--full" htmlFor="education_level">
                <span>Education level</span>
                <span className="select-wrap">
                  <select
                    id="education_level"
                    name="education_level"
                    value={formData.education_level}
                    onChange={handleChange}
                    required
                  >
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Master">Master&apos;s degree</option>
                    <option value="PhD">PhD</option>
                    <option value="NoHigherEd">No higher education</option>
                    <option value="Other">Other</option>
                  </select>
                </span>
              </label>

              <label className="field" htmlFor="years_code">
                <span>Total coding</span>
                <span className="input-suffix">
                  <input
                    id="years_code"
                    name="years_code"
                    type="number"
                    min="0"
                    max="50"
                    value={formData.years_code}
                    onChange={handleChange}
                    required
                  />
                  <span>years</span>
                </span>
              </label>

              <label className="field" htmlFor="years_code_pro">
                <span>Professional</span>
                <span className="input-suffix">
                  <input
                    id="years_code_pro"
                    name="years_code_pro"
                    type="number"
                    min="0"
                    max="50"
                    value={formData.years_code_pro}
                    onChange={handleChange}
                    required
                  />
                  <span>years</span>
                </span>
              </label>

              <label className="field field--full" htmlFor="technologies">
                <span>Technologies you know</span>
                <textarea
                  id="technologies"
                  name="technologies"
                  rows="3"
                  value={formData.technologies}
                  onChange={handleChange}
                  placeholder="python, fastapi, react, docker"
                  aria-describedby="technologies-help"
                  required
                />
                <small id="technologies-help">
                  Separate each technology with a comma.
                </small>
              </label>

              <label className="field" htmlFor="current_salary">
                <span>Current salary</span>
                <span className="input-prefix">
                  <span>$</span>
                  <input
                    id="current_salary"
                    name="current_salary"
                    type="number"
                    min="0"
                    value={formData.current_salary}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </span>
              </label>

              <label className="field" htmlFor="weekly_learning_hours">
                <span>Weekly learning time</span>
                <span className="input-suffix">
                  <input
                    id="weekly_learning_hours"
                    name="weekly_learning_hours"
                    type="number"
                    min="1"
                    max="80"
                    value={formData.weekly_learning_hours}
                    onChange={handleChange}
                    required
                  />
                  <span>hours</span>
                </span>
              </label>
            </div>

            <button className="analyze-button" type="submit" disabled={loading}>
              <span>{loading ? 'Analyzing profile…' : 'Start career analysis'}</span>
              <span className="button-arrow" aria-hidden="true">
                →
              </span>
            </button>

            <p className="form-footnote">
              Salary intelligence is live. Skill and mentoring layers are the
              next model integrations.
            </p>
          </form>

          <section className="result-card" aria-labelledby="result-title">
            <div className="card-heading result-heading">
              <div>
                <p className="step-label step-label--light">02 · Career signals</p>
                <h2 id="result-title">Your career snapshot</h2>
              </div>
              <span className="currency-pill">Personalized report</span>
            </div>

            <div className="result-stage" aria-live="polite">
              {loading && (
                <div className="loading-state" role="status">
                  <span className="loading-ring" aria-hidden="true" />
                  <h3>Building your career snapshot</h3>
                  <p>Transforming your profile and running the salary model…</p>
                </div>
              )}

              {!loading && error && (
                <div className="error-state" role="alert">
                  <span className="error-symbol" aria-hidden="true">
                    !
                  </span>
                  <div>
                    <h3>We couldn&apos;t complete the analysis</h3>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {!loading && !error && !result && (
                <div className="empty-state">
                  <div className="signal-visual" aria-hidden="true">
                    <span className="signal-visual__core">AI</span>
                    <span className="signal-visual__orbit signal-visual__orbit--one" />
                    <span className="signal-visual__orbit signal-visual__orbit--two" />
                  </div>
                  <p className="empty-state__label">Your career, in context</p>
                  <h3>Your complete career map will live here.</h3>
                  <p>
                    Start with the live salary model. Every new intelligence
                    layer will join the same report without changing your flow.
                  </p>
                  <div className="output-preview" aria-hidden="true">
                    <span>Salary range</span>
                    <span>Skill benchmark</span>
                    <span>Tech recommendations</span>
                    <span>90-day roadmap</span>
                  </div>
                </div>
              )}

              {!loading && !error && result && (
                <div className="career-result">
                  <div className="analysis-progress">
                    <span>Analysis coverage</span>
                    <strong>1 of 4 layers live</strong>
                  </div>

                  <p className="result-kicker">Market compensation signal</p>
                  <p className="salary-value">
                    {formatCurrency(result.predicted_salary, result.currency)}
                  </p>
                  <p className="salary-context">
                    estimated annually for a{' '}
                    {submittedProfile?.educationLevel.toLowerCase()} profile in{' '}
                    {submittedProfile?.country}
                  </p>

                  <div className="range-panel">
                    <div className="range-panel__header">
                      <span>Model prediction range</span>
                      <strong>
                        {formatCurrency(result.lower_salary, result.currency)} –{' '}
                        {formatCurrency(result.upper_salary, result.currency)}
                      </strong>
                    </div>
                    <div className="range-track" aria-hidden="true">
                      <span
                        className="range-marker"
                        style={{ left: `${rangePosition}%` }}
                      />
                    </div>
                    <div className="range-labels">
                      <span>Lower</span>
                      <span>Prediction</span>
                      <span>Upper</span>
                    </div>
                  </div>

                  <div className="result-metrics">
                    <div>
                      <span>Technology breadth</span>
                      <strong>{submittedProfile?.technologyCount} listed</strong>
                    </div>
                    <div>
                      <span>Learning capacity</span>
                      <strong>{submittedProfile?.learningHours} h / week</strong>
                    </div>
                    <div>
                      <span>Salary model</span>
                      <strong>v{result.model_version}</strong>
                    </div>
                  </div>

                  <div className="module-queue">
                    <p>Next intelligence layers</p>
                    <div>
                      <span>Skill benchmark</span>
                      <small>Model connection pending</small>
                    </div>
                    <div>
                      <span>Technology recommendations</span>
                      <small>Recommendation engine pending</small>
                    </div>
                    <div>
                      <span>30/60/90-day career plan</span>
                      <small>AI mentor connection pending</small>
                    </div>
                  </div>

                  <div className="model-note">
                    <span aria-hidden="true">i</span>
                    <p>
                      Model v1 measures technology breadth, not the value of each
                      named technology. This is a survey-based estimate, not a
                      live market quote or job offer.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </section>

        <section className="product-map" id="career-modules">
          <div className="section-heading">
            <div>
              <p className="eyebrow">The complete product</p>
              <h2>Four intelligence layers, one career decision system.</h2>
            </div>
            <p>
              Each layer has a clear job. Machine learning produces the evidence;
              the AI mentor turns that evidence into an actionable plan.
            </p>
          </div>

          <div className="module-grid">
            <article className="module-card module-card--active">
              <div className="module-card__top">
                <span className="module-number">01</span>
                <span className="status status--live">Live</span>
              </div>
              <h3>Salary intelligence</h3>
              <p>
                Estimates annual compensation and presents uncertainty as a
                lower-to-upper range instead of one overconfident number.
              </p>
              <div className="module-outputs">
                <span>Point estimate</span>
                <span>Prediction range</span>
              </div>
            </article>

            <article className="module-card">
              <div className="module-card__top">
                <span className="module-number">02</span>
                <span className="status">Next</span>
              </div>
              <h3>Skill benchmark</h3>
              <p>
                Compares your technology breadth with similar developers and
                calculates how many complementary skills are missing.
              </p>
              <div className="module-outputs">
                <span>Peer comparison</span>
                <span>Missing skill count</span>
              </div>
            </article>

            <article className="module-card">
              <div className="module-card__top">
                <span className="module-number">03</span>
                <span className="status">Planned</span>
              </div>
              <h3>Technology recommender</h3>
              <p>
                Finds complementary technologies in similar and higher-salary
                profiles so recommendations come from data, not guesswork.
              </p>
              <div className="module-outputs">
                <span>Technology shortlist</span>
                <span>Learning priority</span>
              </div>
            </article>

            <article className="module-card" id="roadmap">
              <div className="module-card__top">
                <span className="module-number">04</span>
                <span className="status">Planned</span>
              </div>
              <h3>AI career mentor</h3>
              <p>
                Interprets every model output and creates a portfolio project,
                learning sequence and realistic 30/60/90-day roadmap.
              </p>
              <div className="module-outputs">
                <span>Portfolio project</span>
                <span>30/60/90 plan</span>
              </div>
            </article>
          </div>
        </section>

        <section className="system-flow" aria-label="CodePath AI system flow">
          <div className="system-flow__heading">
            <p className="eyebrow">System flow</p>
            <h2>Data first. Guidance second.</h2>
          </div>
          <div className="flow-step">
            <span>01</span>
            <strong>Developer profile</strong>
          </div>
          <div className="flow-step">
            <span>02</span>
            <strong>ML predictions</strong>
          </div>
          <div className="flow-step">
            <span>03</span>
            <strong>Recommendations</strong>
          </div>
          <div className="flow-step">
            <span>04</span>
            <strong>AI mentor report</strong>
          </div>
        </section>
      </main>

      <footer>
        <span>CodePath AI</span>
        <span>Machine learning evidence, translated into career action.</span>
      </footer>
    </div>
  )
}

export default App
