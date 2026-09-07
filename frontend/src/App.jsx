import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { translations } from './i18n'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '')

const localeByLanguage = {
  en: 'en-US',
  tr: 'tr-TR',
}

const formatCurrency = (value, currency = 'USD', language = 'en') =>
  new Intl.NumberFormat(localeByLanguage[language], {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)

const getApiErrorMessage = (data, fallbackMessage) => {
  if (Array.isArray(data.detail)) {
    return data.detail.map((item) => item.msg).join(' ')
  }

  return data.detail || fallbackMessage
}

const normalizeTechnologyName = (value) =>
  value.toLocaleLowerCase('en-US').replace(/[\s._/-]/g, '')

const TechnologyCombobox = ({
  options,
  selectedTechnologies,
  onChange,
  loading,
  loadError,
  t,
}) => {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const containerRef = useRef(null)

  const filteredOptions = useMemo(() => {
    const selectedNames = new Set(
      selectedTechnologies.map((technology) => technology.toLowerCase()),
    )
    const normalizedQuery = normalizeTechnologyName(query)

    return options.filter((technology) => {
      const isAlreadySelected = selectedNames.has(technology.toLowerCase())
      const matchesQuery = normalizeTechnologyName(technology).includes(
        normalizedQuery,
      )

      return !isAlreadySelected && matchesQuery
    })
  }, [options, query, selectedTechnologies])

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
    }
  }, [])

  const addTechnology = (technology) => {
    onChange([...selectedTechnologies, technology])
    setQuery('')
    setHighlightedIndex(0)
  }

  const removeTechnology = (technologyToRemove) => {
    onChange(
      selectedTechnologies.filter(
        (technology) => technology !== technologyToRemove,
      ),
    )
  }

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setIsOpen(true)
      setHighlightedIndex((currentIndex) =>
        Math.max(
          0,
          Math.min(currentIndex + 1, filteredOptions.length - 1),
        ),
      )
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightedIndex((currentIndex) => Math.max(currentIndex - 1, 0))
    }

    if (
      event.key === 'Enter' &&
      isOpen &&
      filteredOptions[highlightedIndex]
    ) {
      event.preventDefault()
      addTechnology(filteredOptions[highlightedIndex])
    }

    if (
      event.key === 'Backspace' &&
      query === '' &&
      selectedTechnologies.length > 0
    ) {
      removeTechnology(selectedTechnologies.at(-1))
    }

    if (event.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className="technology-combobox" ref={containerRef}>
      <div
        className={`technology-combobox__control${isOpen ? ' is-open' : ''}`}
        onClick={() => setIsOpen(true)}
      >
        <div className="technology-combobox__chips">
          {selectedTechnologies.map((technology) => (
            <span className="technology-chip" key={technology}>
              {technology}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  removeTechnology(technology)
                }}
                aria-label={t.removeTechnology(technology)}
              >
                ×
              </button>
            </span>
          ))}
          <input
            id="technologies"
            className="technology-combobox__input"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setHighlightedIndex(0)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedTechnologies.length === 0
                ? t.technologiesPlaceholder
                : t.addTechnology
            }
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-controls="technology-options"
            aria-describedby="technologies-help"
            autoComplete="off"
          />
        </div>
        <span className="technology-combobox__chevron" aria-hidden="true">
          ⌄
        </span>
      </div>

      <div className="technology-combobox__meta">
        <small id="technologies-help">
          {loadError || t.technologiesHelp}
        </small>
        {selectedTechnologies.length > 0 && (
          <button type="button" onClick={() => onChange([])}>
            {t.clearTechnologies}
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className="technology-combobox__menu"
          id="technology-options"
          role="listbox"
          aria-label={t.availableTechnologies}
        >
          {loading && (
            <p className="technology-combobox__empty">
              {t.loadingTechnologies}
            </p>
          )}

          {!loading && filteredOptions.length === 0 && (
            <p className="technology-combobox__empty">
              {loadError ? t.catalogUnavailable : t.noTechnologyResults}
            </p>
          )}

          {!loading &&
            filteredOptions.map((technology, index) => (
              <button
                className={`technology-combobox__option${
                  index === highlightedIndex ? ' is-highlighted' : ''
                }`}
                type="button"
                role="option"
                aria-selected="false"
                key={technology}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => addTechnology(technology)}
              >
                <span>{technology}</span>
                <span aria-hidden="true">+</span>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}

const RoadmapPhaseCard = ({ day, phase, t }) => (
  <article className="roadmap-phase">
    <div className="roadmap-phase__topline">
      <span>{day}</span>
      <span aria-hidden="true">&#8594;</span>
    </div>
    <h3>{phase.title}</h3>
    <p className="roadmap-phase__objective">{phase.objective}</p>
    <ol className="roadmap-actions">
      {phase.actions.map((action) => (
        <li key={action}>{action}</li>
      ))}
    </ol>
    <div className="roadmap-deliverable">
      <span>{t.deliverable}</span>
      <p>{phase.deliverable}</p>
    </div>
  </article>
)

function App() {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = window.localStorage.getItem('codepath-language')

    if (savedLanguage === 'tr' || savedLanguage === 'en') {
      return savedLanguage
    }

    return window.navigator.language.toLowerCase().startsWith('tr') ? 'tr' : 'en'
  })
  const [formData, setFormData] = useState({
    country: 'Turkey',
    education_level: 'Undergraduate',
    years_code: 4,
    years_code_pro: 1,
    technologies: ['Python', 'FastAPI', 'React.js', 'Docker'],
    current_salary: '',
    weekly_learning_hours: 8,
  })
  const [result, setResult] = useState(null)
  const [submittedProfile, setSubmittedProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [technologyOptions, setTechnologyOptions] = useState([])
  const [technologyCatalogLoading, setTechnologyCatalogLoading] = useState(true)
  const [technologyCatalogError, setTechnologyCatalogError] = useState(false)
  const t = translations[language]
  const locale = localeByLanguage[language]

  useEffect(() => {
    window.localStorage.setItem('codepath-language', language)
    document.documentElement.lang = language
  }, [language])

  useEffect(() => {
    const controller = new AbortController()

    const loadTechnologyCatalog = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/recommendations/catalog`,
          { signal: controller.signal },
        )
        const data = await response.json()

        if (!response.ok) {
          throw new Error('Technology catalog could not be loaded.')
        }

        setTechnologyOptions(data.technologies)
        setTechnologyCatalogError(false)
      } catch (catalogError) {
        if (catalogError.name !== 'AbortError') {
          setTechnologyCatalogError(true)
        }
      } finally {
        if (!controller.signal.aborted) {
          setTechnologyCatalogLoading(false)
        }
      }
    }

    loadTechnologyCatalog()

    return () => controller.abort()
  }, [])

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
          t.experienceError,
        )
      }

      const technologies = formData.technologies

      if (technologies.length === 0) {
        throw new Error(t.technologyRequired)
      }

      const careerPayload = {
        country: formData.country,
        education_level: formData.education_level,
        years_code: formData.years_code,
        years_code_pro: formData.years_code_pro,
        technologies,
        current_salary:
          formData.current_salary === '' ? null : formData.current_salary,
        weekly_learning_hours: formData.weekly_learning_hours,
        language,
      }

      const careerResponse = await fetch(
        `${API_BASE_URL}/api/v1/career/analyze`,
        {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(careerPayload),
        },
      )

      const careerData = await careerResponse.json()

      if (!careerResponse.ok) {
        throw new Error(getApiErrorMessage(careerData, t.apiError))
      }

      setResult({
        salary: careerData.salary,
        skill: careerData.skills,
        recommendation: careerData.recommendations,
        mentorStatus: careerData.mentor_status,
        mentorReport: careerData.mentor_report,
        mentorMessage: careerData.mentor_message,
        mentorModel: careerData.mentor_model,
      })
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
          ? t.connectionError
          : requestError.message

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const hasRange =
    result && result.salary.upper_salary > result.salary.lower_salary

  const rangePosition = hasRange
    ? Math.min(
        100,
        Math.max(
          0,
          ((result.salary.predicted_salary - result.salary.lower_salary) /
            (result.salary.upper_salary - result.salary.lower_salary)) *
            100,
        ),
      )
    : 50

  const skillScaleMaximum = result
    ? Math.max(
        result.skill.upper_benchmark,
        result.skill.actual_skills,
        result.skill.expected_skills,
      ) + 3
    : 1

  const skillMarkerPosition = result
    ? Math.min(100, (result.skill.actual_skills / skillScaleMaximum) * 100)
    : 0

  const skillBandStart = result
    ? (result.skill.lower_benchmark / skillScaleMaximum) * 100
    : 0

  const skillBandWidth = result
    ? ((result.skill.upper_benchmark - result.skill.lower_benchmark) /
        skillScaleMaximum) *
      100
    : 0

  const displayedRecommendations = result
    ? result.recommendation.recommendations
    : []

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label={t.homeLabel}>
          <span className="brand-mark" aria-hidden="true">
            CP
          </span>
          <span>
            <strong>CodePath AI</strong>
            <small>{t.brandSubtitle}</small>
          </span>
        </a>

        <nav className="product-nav" aria-label={t.navigationLabel}>
          <a href="#analysis">{t.navAnalysis}</a>
          <a href="#career-modules">{t.navLayers}</a>
          <a href={result?.mentorReport ? '#mentor-report' : '#roadmap'}>
            {t.navRoadmap}
          </a>
        </nav>

        <div className="topbar-actions">
          <div className="language-switch" aria-label={t.languageLabel}>
            <button
              type="button"
              className={language === 'tr' ? 'is-active' : ''}
              onClick={() => setLanguage('tr')}
              aria-pressed={language === 'tr'}
            >
              TR
            </button>
            <button
              type="button"
              className={language === 'en' ? 'is-active' : ''}
              onClick={() => setLanguage('en')}
              aria-pressed={language === 'en'}
            >
              EN
            </button>
          </div>
          <div className="model-badge">
            <span className="model-badge__dot" aria-hidden="true" />
            {t.modelBadge}
          </div>
        </div>
      </header>

      <main id="top">
        <section className="intro" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">{t.introEyebrow}</p>
            <h1 id="page-title">{t.introTitle}</h1>
          </div>
          <p className="intro__copy">{t.introCopy}</p>
        </section>

        <section
          className="analysis-grid"
          id="analysis"
          aria-label={t.workspaceLabel}
        >
          <form className="profile-card" onSubmit={handleSubmit}>
            <div className="card-heading">
              <div>
                <p className="step-label">{t.profileStep}</p>
                <h2>{t.profileTitle}</h2>
              </div>
              <span className="required-note">{t.salaryOptional}</span>
            </div>

            <div className="field-grid">
              <label className="field field--full" htmlFor="country">
                <span>{t.country}</span>
                <input
                  id="country"
                  name="country"
                  type="text"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder={t.countryPlaceholder}
                  autoComplete="country-name"
                  required
                />
                <small>{t.countryHelp}</small>
              </label>

              <label className="field field--full" htmlFor="education_level">
                <span>{t.educationLevel}</span>
                <span className="select-wrap">
                  <select
                    id="education_level"
                    name="education_level"
                    value={formData.education_level}
                    onChange={handleChange}
                    required
                  >
                    <option value="Undergraduate">{t.undergraduate}</option>
                    <option value="Master">{t.master}</option>
                    <option value="PhD">{t.phd}</option>
                    <option value="NoHigherEd">{t.noHigherEducation}</option>
                    <option value="Other">{t.other}</option>
                  </select>
                </span>
              </label>

              <label className="field" htmlFor="years_code">
                <span>{t.totalCoding}</span>
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
                  <span>{t.years}</span>
                </span>
              </label>

              <label className="field" htmlFor="years_code_pro">
                <span>{t.professional}</span>
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
                  <span>{t.years}</span>
                </span>
              </label>

              <div className="field field--full">
                <label htmlFor="technologies">{t.technologies}</label>
                <TechnologyCombobox
                  options={technologyOptions}
                  selectedTechnologies={formData.technologies}
                  onChange={(technologies) =>
                    setFormData((previousFormData) => ({
                      ...previousFormData,
                      technologies,
                    }))
                  }
                  loading={technologyCatalogLoading}
                  loadError={
                    technologyCatalogError ? t.technologyCatalogError : ''
                  }
                  t={t}
                />
              </div>

              <label className="field" htmlFor="current_salary">
                <span>{t.currentSalary}</span>
                <span className="input-prefix">
                  <span>$</span>
                  <input
                    id="current_salary"
                    name="current_salary"
                    type="number"
                    min="0"
                    value={formData.current_salary}
                    onChange={handleChange}
                    placeholder={t.optional}
                  />
                </span>
              </label>

              <label className="field" htmlFor="weekly_learning_hours">
                <span>{t.weeklyLearningTime}</span>
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
                  <span>{t.hours}</span>
                </span>
              </label>
            </div>

            <button className="analyze-button" type="submit" disabled={loading}>
              <span>{loading ? t.analyzing : t.startAnalysis}</span>
              <span className="button-arrow" aria-hidden="true">
                →
              </span>
            </button>

            <p className="form-footnote">{t.formFootnote}</p>
          </form>

          <section className="result-card" aria-labelledby="result-title">
            <div className="card-heading result-heading">
              <div>
                <p className="step-label step-label--light">{t.signalsStep}</p>
                <h2 id="result-title">{t.snapshotTitle}</h2>
              </div>
              <span className="currency-pill">{t.personalizedReport}</span>
            </div>

            <div className="result-stage" aria-live="polite">
              {loading && (
                <div className="loading-state" role="status">
                  <span className="loading-ring" aria-hidden="true" />
                  <h3>{t.loadingTitle}</h3>
                  <p>{t.loadingCopy}</p>
                </div>
              )}

              {!loading && error && (
                <div className="error-state" role="alert">
                  <span className="error-symbol" aria-hidden="true">
                    !
                  </span>
                  <div>
                    <h3>{t.errorTitle}</h3>
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
                  <p className="empty-state__label">{t.emptyLabel}</p>
                  <h3>{t.emptyTitle}</h3>
                  <p>{t.emptyCopy}</p>
                  <div className="output-preview" aria-hidden="true">
                    <span>{t.salaryRange}</span>
                    <span>{t.skillBenchmark}</span>
                    <span>{t.techRecommendations}</span>
                    <span>{t.ninetyDayRoadmap}</span>
                  </div>
                </div>
              )}

              {!loading && !error && result && (
                <div className="career-result">
                  <div className="analysis-progress">
                    <span>{t.analysisCoverage}</span>
                    <strong>
                      {result.mentorStatus === 'completed'
                        ? t.layersComplete
                        : t.layersPartial}
                    </strong>
                  </div>

                  <p className="result-kicker">{t.marketCompensation}</p>
                  <p className="salary-value">
                    {formatCurrency(
                      result.salary.predicted_salary,
                      result.salary.currency,
                      language,
                    )}
                  </p>
                  <p className="salary-context">
                    {t.salaryContext(
                      t.educationValues[submittedProfile?.educationLevel],
                      submittedProfile?.country,
                    )}
                  </p>

                  <div className="range-panel">
                    <div className="range-panel__header">
                      <span>{t.predictionRange}</span>
                      <strong>
                        {formatCurrency(
                          result.salary.lower_salary,
                          result.salary.currency,
                          language,
                        )}{' '}
                        –{' '}
                        {formatCurrency(
                          result.salary.upper_salary,
                          result.salary.currency,
                          language,
                        )}
                      </strong>
                    </div>
                    <div className="range-track" aria-hidden="true">
                      <span
                        className="range-marker"
                        style={{ left: `${rangePosition}%` }}
                      />
                    </div>
                    <div className="range-labels">
                      <span>{t.lower}</span>
                      <span>{t.prediction}</span>
                      <span>{t.upper}</span>
                    </div>
                  </div>

                  <section
                    className="skill-benchmark-panel"
                    aria-labelledby="skill-benchmark-title"
                  >
                    <div className="skill-benchmark-heading">
                      <div>
                        <p className="result-kicker">{t.peerBenchmark}</p>
                        <h3 id="skill-benchmark-title">
                          {t.positions[result.skill.position]}
                        </h3>
                      </div>
                      <span className="live-pill">{t.live}</span>
                    </div>

                    <div className="skill-score-grid">
                      <div>
                        <span>{t.yourTechnologies}</span>
                        <strong>{result.skill.actual_skills}</strong>
                      </div>
                      <div>
                        <span>{t.peerMedian}</span>
                        <strong>{result.skill.expected_skills}</strong>
                      </div>
                      <div className="skill-gap-score">
                        <span>{t.skillGap}</span>
                        <strong>{result.skill.skill_gap}</strong>
                      </div>
                    </div>

                    <div className="skill-range">
                      <div className="skill-range__track" aria-hidden="true">
                        <span
                          className="skill-range__typical"
                          style={{
                            left: `${skillBandStart}%`,
                            width: `${skillBandWidth}%`,
                          }}
                        />
                        <span
                          className="skill-range__marker"
                          style={{ left: `${skillMarkerPosition}%` }}
                        />
                      </div>
                      <div className="skill-range__labels">
                        <span>
                          {t.yourPosition}: {result.skill.actual_skills}
                        </span>
                        <span>
                          {t.typical}: {result.skill.lower_benchmark}–
                          {result.skill.upper_benchmark}
                        </span>
                      </div>
                    </div>

                    <p className="cohort-context">
                      {t.cohortContext(
                        result.skill.cohort_size.toLocaleString(locale),
                        t.benchmarkLevels[result.skill.benchmark_level],
                      )}
                    </p>
                  </section>

                  <section
                    className="recommendation-panel"
                    aria-labelledby="recommendation-title"
                  >
                    <div className="recommendation-heading">
                      <div>
                        <p className="result-kicker">{t.dataBackedMoves}</p>
                        <h3 id="recommendation-title">
                          {result.skill.skill_gap > 0
                            ? t.closeGap(result.skill.skill_gap)
                            : t.strongToolkit}
                        </h3>
                      </div>
                      <span className="live-pill">{t.live}</span>
                    </div>

                    <p className="recommendation-intro">
                      {t.recommendationIntro}
                    </p>

                    <div className="recommendation-list">
                      {displayedRecommendations.map((recommendation, index) => (
                        <article
                          className="recommendation-item"
                          key={recommendation.technology}
                        >
                          <span className="recommendation-rank">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <div className="recommendation-copy">
                            <h4>{recommendation.technology}</h4>
                            <div className="recommendation-signals">
                              <span>
                                {t.stackFit}{' '}
                                {Math.round(recommendation.similarity_score * 100)}%
                              </span>
                              <span>
                                {t.salarySignal}{' '}
                                {Math.round(recommendation.salary_score * 100)}{' '}
                                {t.percentile}
                              </span>
                            </div>
                            <div
                              className="recommendation-track"
                              aria-hidden="true"
                            >
                              <span
                                style={{
                                  width: `${Math.round(
                                    recommendation.final_score * 100,
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="priority-score">
                            <strong>
                              {Math.round(recommendation.final_score * 100)}
                            </strong>
                            <span>{t.priority}</span>
                          </div>
                        </article>
                      ))}
                    </div>

                    {result.recommendation.ignored_technologies.length > 0 && (
                      <p className="ignored-technologies">
                        {t.ignoredTechnologies(
                          result.recommendation.ignored_technologies.join(', '),
                        )}
                      </p>
                    )}
                  </section>

                  <div className="result-meta-grid">
                    <div>
                      <span>{t.learningCapacity}</span>
                      <strong>
                        {submittedProfile?.learningHours} {t.perWeek}
                      </strong>
                    </div>
                    <div>
                      <span>{t.salaryModel}</span>
                      <strong>v{result.salary.model_version}</strong>
                    </div>
                    <div>
                      <span>{t.benchmark}</span>
                      <strong>v{result.skill.benchmark_version}</strong>
                    </div>
                    <div>
                      <span>{t.recommender}</span>
                      <strong>v{result.recommendation.model_version}</strong>
                    </div>
                  </div>

                  <div className="module-queue">
                    <p>{t.finalLayer}</p>
                    <div>
                      <span>{t.careerPlan}</span>
                      <small
                        className={
                          result.mentorStatus === 'completed'
                            ? 'mentor-state mentor-state--ready'
                            : 'mentor-state mentor-state--unavailable'
                        }
                      >
                        {result.mentorStatus === 'completed'
                          ? t.mentorCompleted
                          : t.mentorUnavailable}
                      </small>
                    </div>
                  </div>

                  <div className="model-note">
                    <span aria-hidden="true">i</span>
                    <p>{t.modelNote}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </section>

        {result?.mentorReport && (
          <section className="mentor-report" id="mentor-report">
            <div className="mentor-report__header">
              <div>
                <p className="eyebrow">{t.mentorEyebrow}</p>
                <h2>{t.mentorTitle}</h2>
              </div>
              <div className="mentor-model">
                <span className="model-badge__dot" aria-hidden="true" />
                <span>{t.generatedBy}</span>
                <strong>{result.mentorModel}</strong>
              </div>
            </div>

            <div className="mentor-summary">
              <span>{t.mentorSummary}</span>
              <p>{result.mentorReport.summary}</p>
            </div>

            <div className="mentor-insight-grid">
              <article className="mentor-insight-card mentor-insight-card--strengths">
                <div className="mentor-insight-card__heading">
                  <span>+</span>
                  <h3>{t.strengths}</h3>
                </div>
                <ul>
                  {result.mentorReport.strengths.map((strength) => (
                    <li key={strength}>{strength}</li>
                  ))}
                </ul>
              </article>

              <article className="mentor-insight-card mentor-insight-card--risks">
                <div className="mentor-insight-card__heading">
                  <span>!</span>
                  <h3>{t.risks}</h3>
                </div>
                {result.mentorReport.risks.length > 0 ? (
                  <ul>
                    {result.mentorReport.risks.map((risk) => (
                      <li key={risk}>{risk}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mentor-empty-copy">{t.noRisks}</p>
                )}
              </article>
            </div>

            <div className="mentor-strategy-grid">
              <article className="learning-stack-card">
                <p className="result-kicker">{t.learningStack}</p>
                <h3>{t.recommendedSequence}</h3>
                <div className="learning-stack-list">
                  {result.mentorReport.recommended_technologies.length > 0 ? (
                    result.mentorReport.recommended_technologies.map(
                      (technology, index) => (
                        <span key={technology}>
                          <small>{String(index + 1).padStart(2, '0')}</small>
                          {technology}
                        </span>
                      ),
                    )
                  ) : (
                    <p className="mentor-empty-copy">{t.noSkillGap}</p>
                  )}
                </div>
              </article>

              <article className="salary-strategy-card">
                <p className="result-kicker">{t.salaryStrategy}</p>
                <h3>{t.turnEvidenceIntoLeverage}</h3>
                <ol>
                  {result.mentorReport.salary_strategy.map((strategy) => (
                    <li key={strategy}>{strategy}</li>
                  ))}
                </ol>
              </article>
            </div>

            <div className="roadmap-heading">
              <div>
                <p className="eyebrow">{t.actionPlan}</p>
                <h2>{t.roadmapTitle}</h2>
              </div>
              <p>{t.roadmapCopy(submittedProfile?.learningHours)}</p>
            </div>

            <div className="roadmap-grid">
              <RoadmapPhaseCard
                day={t.day30}
                phase={result.mentorReport.roadmap_30_days}
                t={t}
              />
              <RoadmapPhaseCard
                day={t.day60}
                phase={result.mentorReport.roadmap_60_days}
                t={t}
              />
              <RoadmapPhaseCard
                day={t.day90}
                phase={result.mentorReport.roadmap_90_days}
                t={t}
              />
            </div>
          </section>
        )}

        {result && result.mentorStatus !== 'completed' && (
          <section className="mentor-unavailable" id="mentor-report">
            <span aria-hidden="true">!</span>
            <div>
              <p className="eyebrow">{t.mentorEyebrow}</p>
              <h2>{t.mentorUnavailable}</h2>
              <p>{result.mentorMessage || t.mentorUnavailableCopy}</p>
            </div>
          </section>
        )}

        <section className="product-map" id="career-modules">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t.completeProduct}</p>
              <h2>{t.productTitle}</h2>
            </div>
            <p>{t.productCopy}</p>
          </div>

          <div className="module-grid">
            <article className="module-card module-card--active">
              <div className="module-card__top">
                <span className="module-number">01</span>
                <span className="status status--live">{t.live}</span>
              </div>
              <h3>{t.salaryIntelligence}</h3>
              <p>{t.salaryModuleCopy}</p>
              <div className="module-outputs">
                <span>{t.pointEstimate}</span>
                <span>{t.predictionRangeOutput}</span>
              </div>
            </article>

            <article className="module-card module-card--active module-card--skill">
              <div className="module-card__top">
                <span className="module-number">02</span>
                <span className="status status--live">{t.live}</span>
              </div>
              <h3>{t.skillBenchmark}</h3>
              <p>{t.skillModuleCopy}</p>
              <div className="module-outputs">
                <span>{t.peerComparison}</span>
                <span>{t.missingSkillCount}</span>
              </div>
            </article>

            <article className="module-card module-card--active module-card--recommendation">
              <div className="module-card__top">
                <span className="module-number">03</span>
                <span className="status status--live">{t.live}</span>
              </div>
              <h3>{t.technologyRecommender}</h3>
              <p>{t.recommenderModuleCopy}</p>
              <div className="module-outputs">
                <span>{t.technologyShortlist}</span>
                <span>{t.learningPriority}</span>
              </div>
            </article>

            <article className="module-card module-card--active module-card--mentor" id="roadmap">
              <div className="module-card__top">
                <span className="module-number">04</span>
                <span className="status status--live">{t.live}</span>
              </div>
              <h3>{t.aiCareerMentor}</h3>
              <p>{t.mentorModuleCopy}</p>
              <div className="module-outputs">
                <span>{t.portfolioProject}</span>
                <span>{t.planOutput}</span>
              </div>
            </article>
          </div>
        </section>

        <section className="system-flow" aria-label={t.systemFlow}>
          <div className="system-flow__heading">
            <p className="eyebrow">{t.systemFlow}</p>
            <h2>{t.flowTitle}</h2>
          </div>
          <div className="flow-step">
            <span>01</span>
            <strong>{t.developerProfile}</strong>
          </div>
          <div className="flow-step">
            <span>02</span>
            <strong>{t.mlPredictions}</strong>
          </div>
          <div className="flow-step">
            <span>03</span>
            <strong>{t.recommendations}</strong>
          </div>
          <div className="flow-step">
            <span>04</span>
            <strong>{t.mentorReport}</strong>
          </div>
        </section>
      </main>

      <footer>
        <span>CodePath AI</span>
        <span>{t.footerCopy}</span>
      </footer>
    </div>
  )
}

export default App
