import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api';

export default function usePlacementPortal() {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [employerJobs, setEmployerJobs] = useState([]);
  const [applicants, setApplicants] = useState({});
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortOrder, setSortOrder] = useState('recommended');
  const [category, setCategory] = useState('All roles');
  const [workMode, setWorkMode] = useState('');
  const [modal, setModal] = useState('');
  const [applyJob, setApplyJob] = useState(null);
  const [pendingApply, setPendingApply] = useState(null);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [authReady, setAuthReady] = useState(false);

  const loadJobs = useCallback(async (requestedPage = 1) => {
    if (requestedPage === 1) setLoading(true);
    else setLoadingMore(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('page', String(requestedPage));
      if (sortOrder === 'recent') params.set('sort', 'recent');
      if (search) params.set('search', search);
      if (category !== 'All roles') params.set('category', category);
      if (workMode) params.set('workMode', workMode);
      const result = await api(`/jobs?${params}`);
      setJobs((previous) => requestedPage === 1 ? result.jobs : [...previous, ...result.jobs]);
      setPage(requestedPage);
      setHasMore(requestedPage < result.pagination.pages);
    } catch (err) {
      setError(err.message);
    } finally {
      if (requestedPage === 1) setLoading(false);
      else setLoadingMore(false);
    }
  }, [search, category, workMode, sortOrder]);

  const loadUserData = useCallback(async (activeUser) => {
    if (!activeUser) return;
    try {
      if (activeUser.role === 'student') {
        const [applicationResult, savedResult] = await Promise.all([api('/applications/mine'), api('/saved')]);
        setApplications(applicationResult.applications);
        setSavedJobs(savedResult.jobs);
      } else {
        const result = await api('/jobs/mine');
        setEmployerJobs(result.jobs);
        const entries = await Promise.all(result.jobs.map(async (job) => {
          const data = await api(`/jobs/${job._id}/applications`);
          return [job._id, data.applications];
        }));
        setApplicants(Object.fromEntries(entries));
      }
    } catch (err) {
      setNotice(err.message);
    }
  }, []);

  useEffect(() => { loadJobs(); }, [loadJobs]);
  useEffect(() => {
    api('/auth/me').then((result) => {
      setUser(result.user);
      return loadUserData(result.user);
    }).catch((err) => {
      if (err.message !== 'Please sign in to continue.' && err.message !== 'Your session has expired. Please sign in again.') setNotice(err.message);
    }).finally(() => setAuthReady(true));
  }, [loadUserData]);

  const appliedIds = useMemo(() => new Set(applications.map((application) => application.job?._id)), [applications]);
  const savedIds = useMemo(() => new Set(savedJobs.map((job) => job._id)), [savedJobs]);

  const onAuthSuccess = (nextUser) => {
    setUser(nextUser);
    setModal('');
    loadUserData(nextUser);
    if (pendingApply && nextUser.role === 'student') {
      setApplyJob(pendingApply);
      setPendingApply(null);
    } else if (pendingApply) {
      setPendingApply(null);
      setNotice('You need a student account to apply for an opportunity.');
    }
  };

  const beginApply = (job) => {
    if (user?.role === 'employer') return setNotice('Switch to a student account to apply for opportunities.');
    if (appliedIds.has(job._id)) return;
    if (!user) {
      setPendingApply(job);
      setModal('login');
      return;
    }
    setApplyJob(job);
  };

  const signOut = async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
      setUser(null);
      setApplications([]);
      setSavedJobs([]);
      setEmployerJobs([]);
      setApplicants({});
      return true;
    } catch (err) {
      setNotice(err.message);
      return false;
    }
  };

  const saveJob = async (job) => {
    if (!user) return setModal('login');
    if (user.role !== 'student') return setNotice('Saved opportunities are available with a student account.');
    try {
      if (savedIds.has(job._id)) {
        await api(`/saved/${job._id}`, { method: 'DELETE' });
        setSavedJobs((previous) => previous.filter((saved) => saved._id !== job._id));
      } else {
        await api(`/saved/${job._id}`, { method: 'POST' });
        setSavedJobs((previous) => [job, ...previous]);
      }
    } catch (err) {
      setNotice(err.message);
    }
  };

  const changeApplicationStatus = async (id, status, jobId) => {
    try {
      await api(`/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setApplicants((previous) => ({
        ...previous,
        [jobId]: previous[jobId].map((application) => application._id === id ? { ...application, status } : application)
      }));
    } catch (err) {
      setNotice(err.message);
    }
  };

  const changeListingStatus = (id, status) => {
    setEmployerJobs((previous) => previous.map((job) => job._id === id ? { ...job, status } : job));
  };

  const onJobCreated = (job) => {
    setEmployerJobs((previous) => [{ ...job, applicationCount: 0 }, ...previous]);
    setApplicants((previous) => ({ ...previous, [job._id]: [] }));
    setNotice('Your opportunity is live. Thanks for helping someone take a first step!');
  };

  const onApplicationSubmitted = (job) => {
    setApplications((previous) => [{
      _id: `new-${job._id}`,
      job,
      status: 'submitted',
      createdAt: new Date().toISOString()
    }, ...previous]);
    setNotice('Application submitted! Fingers crossed for your next step.');
  };

  return {
    user, jobs, applications, savedJobs, employerJobs, applicants, authReady,
    search, setSearch, searchInput, setSearchInput, sortOrder, setSortOrder, category, setCategory,
    workMode, setWorkMode, modal, setModal, applyJob, setApplyJob,
    notice, setNotice, loading, loadingMore, hasMore, page, error, loadJobs, loadUserData,
    appliedIds, savedIds, onAuthSuccess, beginApply, signOut, saveJob,
    changeApplicationStatus, changeListingStatus, onJobCreated, onApplicationSubmitted
  };
}
