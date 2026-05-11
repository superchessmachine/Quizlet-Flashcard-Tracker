(() => {
  // Stop old tracker if already running
  if (window.quizletProgressTracker) {
    clearInterval(window.quizletProgressTracker.interval);
    console.log("Stopped previous Quizlet progress tracker.");
  }

  const SELECTOR = 'h3[data-testid="progress-header"]';
  const startTime = Date.now();

  const recentSamples = [];
  let firstSample = null;

  const parseProgress = () => {
    const el = document.querySelector(SELECTOR);
    if (!el) return null;

    const text = el.textContent.trim();
    const match = text.match(/(\d+)\s*\/\s*(\d+)/);
    if (!match) return null;

    return {
      current: Number(match[1]),
      total: Number(match[2])
    };
  };

  const formatDuration = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "unknown";

    seconds = Math.round(seconds);

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const formatTimeOnly = (timestampMs) => {
    if (!Number.isFinite(timestampMs)) return "unknown";

    return new Date(timestampMs).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  const getStats = (label, samples, current, total, now) => {
    const remaining = total - current;

    if (samples.length < 2) {
      return `${label}: not enough data`;
    }

    const oldest = samples[0];
    const newest = samples[samples.length - 1];

    const deltaDone = newest.current - oldest.current;
    const deltaTimeSec = (newest.time - oldest.time) / 1000;

    const ratePerSec = deltaTimeSec > 0 ? deltaDone / deltaTimeSec : 0;
    const ratePerMin = ratePerSec * 60;

    if (ratePerSec <= 0) {
      return `${label}: 0.00/min | ETA unknown`;
    }

    const etaSeconds = remaining / ratePerSec;
    const finishTime = formatTimeOnly(now + etaSeconds * 1000);

    return `${label}: ${ratePerMin.toFixed(2)}/min | ${formatDuration(etaSeconds)} left | done at ${finishTime}`;
  };

  const tick = () => {
    const progress = parseProgress();
    const now = Date.now();

    console.clear();
    console.log("Quizlet Progress Tracker");
    console.log("------------------------");

    if (!progress) {
      console.log("Progress not found.");
      return;
    }

    const sample = {
      time: now,
      current: progress.current,
      total: progress.total
    };

    if (!firstSample) firstSample = sample;

    recentSamples.push(sample);

    while (recentSamples.length > 0 && now - recentSamples[0].time > 5 * 60_000) {
      recentSamples.shift();
    }

    const samples30Sec = recentSamples.filter(s => now - s.time <= 30_000);
    const samples5Min = recentSamples;
    const samplesFull = [firstSample, sample];

    const percent = ((progress.current / progress.total) * 100).toFixed(2);
    const remaining = progress.total - progress.current;

    console.log(`${progress.current}/${progress.total} done (${percent}%) | ${remaining} left`);
    console.log(`Now: ${formatTimeOnly(now)}`);
    console.log("");
    console.log(getStats("30s", samples30Sec, progress.current, progress.total, now));
    console.log(getStats("5m", samples5Min, progress.current, progress.total, now));
    console.log(getStats("Avg", samplesFull, progress.current, progress.total, now));
    console.log("");
    console.log("Stop: clearInterval(window.quizletProgressTracker.interval)");
  };

  window.quizletProgressTracker = {
    interval: setInterval(tick, 1000),
    recentSamples,
    startedAt: startTime
  };

  tick();
})();
