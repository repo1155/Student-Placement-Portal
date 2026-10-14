import {
  ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, Heart, MapPin, Search, Sparkles
} from 'lucide-react';
import Button from '../../components/Button';
import JobCard from '../../components/JobCard';

const categories = ['All roles', 'Engineering', 'Design', 'Marketing', 'Data & Analytics', 'Finance', 'People & Culture'];
const readinessUrl = 'https://www.naceweb.org/career-readiness/competencies/career-readiness-defined';

function Hero() {
  return <section className="hero">
    <div className="hero-copy">
      <div className="eyebrow"><span className="eyebrow-line" /> THE START OF SOMETHING GOOD</div>
      <h1>Your first step<br />changes <span className="hero-emphasis">everything.</span></h1>
      <p>Real opportunities. Teams that invest in you.<br className="desktop-break" /> A career that starts on your terms.</p>
      <div className="hero-cta">
        <button className="button button-primary" onClick={() => document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth' })}>Explore opportunities <ArrowDown size={16} /></button>
        <span className="hero-note"><span className="note-dot" /> New roles added weekly</span>
      </div>
      <div className="hero-proof">
        <div className="proof-avatars"><span>J</span><span>M</span><span>A</span><span>+</span></div>
        <span><strong>Made for your next move.</strong><br />Not just another job board.</span>
      </div>
    </div>
    <div className="hero-art" aria-label="Illustration of a student finding their way">
      <div className="art-sun" />
      <div className="art-circle circle-one" /><div className="art-circle circle-two" />
      <div className="art-path"><span>YOUR<br />NEXT<br /><b>CHAPTER</b></span><ArrowRight /></div>
      <div className="art-card art-card-top"><span className="art-card-mark">N</span><div><b>Notion</b><small>Software Intern</small></div><Check size={15} /></div>
      <div className="art-card art-card-bottom"><span className="art-card-mark figma-mark">F</span><div><b>Figma</b><small>Product Design Intern</small></div><ArrowUpRight size={15} /></div>
      <div className="hero-person"><div className="person-hair" /><div className="person-face" /><div className="person-body"><span /></div><div className="person-laptop">P.</div></div>
      <div className="art-spark spark-one">✳</div><div className="art-spark spark-two">✦</div>
      <div className="art-caption">a little closer<br />to what’s next</div>
    </div>
  </section>;
}

function OpportunitySearch({ searchInput, setSearchInput, onSearch, workMode, setWorkMode }) {
  return <div className="search-bar">
    <Search size={19} />
    <input
      value={searchInput}
      onChange={(event) => setSearchInput(event.target.value)}
      onKeyDown={(event) => event.key === 'Enter' && onSearch()}
      placeholder="Role, company, or a skill you love…"
      aria-label="Search opportunities"
    />
    <span className="search-divider" />
    <label className="mode-select"><MapPin size={16} />
      <select value={workMode} onChange={(event) => setWorkMode(event.target.value)} aria-label="Filter by work style">
        <option value="">Any work style</option><option>Remote</option><option>Hybrid</option><option>On-site</option>
      </select>
      <ChevronDown size={14} />
    </label>
    <Button onClick={onSearch}>Search roles <ArrowRight size={16} /></Button>
  </div>;
}

function EmptyResults({ isSaved, onClear }) {
  return <div className="empty-opportunities">
    <div className="empty-icon"><Search /></div>
    <h3>{isSaved ? 'No saved roles just yet.' : 'No roles match those filters.'}</h3>
    <p>{isSaved ? 'Tap the bookmark on a role to keep it close.' : 'Try a different search, or clear your filters.'}</p>
    <button onClick={onClear}>Clear filters <ArrowRight size={15} /></button>
  </div>;
}

export default function DiscoverPage({
  user, activeTab, setActiveTab, jobs, visibleJobs, savedJobs, savedIds, appliedIds,
  onSaveJob, onViewJob, searchInput, setSearchInput, setSearch, category, setCategory,
  workMode, setWorkMode, sortOrder, setSortOrder, error, onRetry, loading,
  loadingMore, hasMore, page, onLoadMore, onCreateJob, onRegister
}) {
  const isSaved = activeTab === 'Saved';

  return <main>
    <Hero />
    <section className="opportunity-section" id="opportunities">
      <div className="section-top">
        <div><div className="eyebrow"><span className="eyebrow-line" /> YOUR NEXT MOVE</div><h2>Find the work that<br /><span>feels like you.</span></h2></div>
        <div className="section-aside">
          <p>Meaningful work. Room to learn.<br />A team ready to meet you where you are.</p>
          <span className="open-count"><span /> {jobs.length} opportunities to explore</span>
        </div>
      </div>
      <OpportunitySearch
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onSearch={() => setSearch(searchInput)}
        workMode={workMode}
        setWorkMode={setWorkMode}
      />
      <div className="category-row">
        <div className="category-tabs">{categories.map((item) => <button key={item} className={category === item ? 'selected' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
        {user?.role === 'student' && <button className={`saved-filter ${isSaved ? 'active' : ''}`} onClick={() => setActiveTab(isSaved ? 'Discover' : 'Saved')}><Heart size={15} /> Saved <span>{savedJobs.length}</span></button>}
      </div>
      <div className="listings-heading">
        <div><span className="listing-counter">{isSaved ? savedJobs.length : jobs.length}</span> {isSaved ? 'saved for later' : 'roles worth a look'}</div>
        <label className="sort-button">Sort by
          <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} aria-label="Sort opportunities">
            <option value="recommended">Recommended</option><option value="recent">Recently added</option>
          </select>
          <ChevronDown size={15} />
        </label>
      </div>
      {error && <div className="error-banner" role="alert"><span>{error}</span><button onClick={onRetry}>Try again</button></div>}
      {loading ? <div className="loading-state"><span className="spinner" />Finding your next opportunity…</div> : visibleJobs.length ?
        <div className="jobs-grid">{visibleJobs.map((job, index) => <JobCard
          key={job._id}
          job={job}
          index={index}
          saved={savedIds.has(job._id)}
          applied={appliedIds.has(job._id)}
          onSave={onSaveJob}
          onView={onViewJob}
        />)}</div> :
        <EmptyResults isSaved={isSaved} onClear={() => {
          setSearch('');
          setSearchInput('');
          setCategory('All roles');
          setWorkMode('');
          setActiveTab('Discover');
        }} />}
      {!loading && !isSaved && hasMore && <div className="load-more-wrap">
        <Button variant="outline" disabled={loadingMore} onClick={() => onLoadMore(page + 1)}>{loadingMore ? 'Loading…' : 'Show more opportunities'} <ArrowDown size={15} /></Button>
      </div>}
      <div className="career-note">
        <div className="note-icon"><Sparkles size={17} /></div>
        <div><strong>More than experience. A place to grow.</strong><p>Build communication, teamwork, problem-solving, and career confidence with every role.</p></div>
        <a href={readinessUrl} target="_blank" rel="noreferrer">Explore career readiness <ArrowUpRight size={15} /></a>
      </div>
    </section>
    <section className="closing-cta">
      <div><div className="eyebrow"><span className="eyebrow-line" /> YOUR NEXT CHAPTER IS OUT THERE</div><h2>Good things start<br />with a <span>first step.</span></h2></div>
      <div>
        <p>Whether you’re finding your footing or finding your next teammate, you’re in the right place.</p>
        <Button variant="light" onClick={user?.role === 'employer' ? onCreateJob : user ? () => document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth' }) : onRegister}>
          {user?.role === 'employer' ? 'Post a role' : 'Get started today'} <ArrowRight size={16} />
        </Button>
      </div>
    </section>
  </main>;
}
