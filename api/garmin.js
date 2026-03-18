const { GarminConnect } = require('garmin-connect');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const email    = process.env.GARMIN_EMAIL;
  const password = process.env.GARMIN_PASSWORD;

  if (!email || !password) {
    return res.status(500).json({ ok: false, error: 'Garmin credentials not configured.' });
  }

  try {
    const gc = new GarminConnect({ username: email, password });
    await gc.login();

    // Use today in US Eastern time so it matches your Garmin app
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

    const [summaryRes, sleepRes, stressRes] = await Promise.allSettled([
      gc.getUserSummary(today),
      gc.getSleepData(today),
      gc.getStressData(today),
    ]);

    const s  = summaryRes.status  === 'fulfilled' ? (summaryRes.value  || {}) : {};
    const sl = sleepRes.status    === 'fulfilled' ? (sleepRes.value    || {}) : {};
    const st = stressRes.status   === 'fulfilled' ? (stressRes.value   || {}) : {};

    const sleepDTO = sl.dailySleepDTO || {};
    const sleepSec = sleepDTO.sleepTimeSeconds || null;

    return res.json({
      ok:              true,
      date:            today,
      steps:           s.totalSteps            ?? 0,
      stepsGoal:       s.dailyStepGoal         ?? 10000,
      caloriesBurned:  Math.round(s.totalKilocalories  ?? 0),
      activeCalories:  Math.round(s.activeKilocalories ?? 0),
      restingHR:       s.restingHeartRate       ?? null,
      sleep: {
        seconds:    sleepSec,
        hours:      sleepSec ? Math.round(sleepSec / 360) / 10 : null,
        score:      sleepDTO.sleepScores?.overall?.value ?? null,
        deepSec:    sleepDTO.deepSleepSeconds   ?? null,
        remSec:     sleepDTO.remSleepSeconds    ?? null,
        lightSec:   sleepDTO.lightSleepSeconds  ?? null,
      },
      stress: {
        avg:  st.avgStressLevel ?? null,
        max:  st.maxStressLevel ?? null,
      },
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
};
