const cron = require('node-cron');
const { schedulerLogger } = require('../utils/logger');
const sourcesModel = require('../database/models/sources');
const pipeline = require('./pipeline');

/**
 * Active cron jobs
 */
const jobs = new Map();

/**
 * Scheduler status
 */
let isRunning = false;

/**
 * Start the scheduler
 */
function start() {
    if (isRunning) {
        schedulerLogger.warn('Scheduler is already running');
        return;
    }

    const sources = sourcesModel.getAll(true); // Get enabled sources only

    for (const source of sources) {
        scheduleSource(source);
    }

    isRunning = true;
    schedulerLogger.info(`Scheduler started with ${sources.length} sources`);
}

/**
 * Schedule a single source
 * @param {Object} source - Source object
 */
function scheduleSource(source) {
    const { id, name, schedule } = source;

    // Validate cron expression
    if (!cron.validate(schedule)) {
        schedulerLogger.error(`Invalid cron expression for source ${name}: ${schedule}`);
        return;
    }

    // Stop existing job if any
    if (jobs.has(id)) {
        jobs.get(id).stop();
    }

    // Create new job
    const job = cron.schedule(schedule, async () => {
        schedulerLogger.info(`Running scheduled task for source: ${name}`);
        try {
            await pipeline.processSource(source);
        } catch (error) {
            schedulerLogger.error(`Scheduled task failed for source: ${name}`, error);
        }
    }, {
        scheduled: true,
        timezone: 'America/Argentina/Buenos_Aires' // Adjust as needed
    });

    jobs.set(id, job);
    schedulerLogger.debug(`Scheduled source: ${name} with schedule: ${schedule}`);
}

/**
 * Stop the scheduler
 */
function stop() {
    for (const [id, job] of jobs) {
        job.stop();
    }
    jobs.clear();
    isRunning = false;
    schedulerLogger.info('Scheduler stopped');
}

/**
 * Restart the scheduler (reload sources)
 */
function restart() {
    stop();
    start();
}

/**
 * Run a source manually (outside of schedule)
 * @param {number} sourceId - Source ID
 * @returns {Promise<Object>} Processing result
 */
async function runManually(sourceId) {
    const source = sourcesModel.getById(sourceId);
    if (!source) {
        throw new Error(`Source not found: ${sourceId}`);
    }

    schedulerLogger.info(`Running manual task for source: ${source.name}`);
    return pipeline.processSource(source);
}

/**
 * Run all enabled sources manually
 * @returns {Promise<Array>} Processing results
 */
async function runAll() {
    const sources = sourcesModel.getAll(true);
    const results = [];

    schedulerLogger.info(`Running all ${sources.length} enabled sources`);

    for (const source of sources) {
        try {
            const result = await pipeline.processSource(source);
            results.push(result);
        } catch (error) {
            results.push({
                source: source.name,
                error: error.message
            });
        }
    }

    return results;
}

/**
 * Get scheduler status
 * @returns {Object} Scheduler status
 */
function getStatus() {
    const status = {
        running: isRunning,
        jobsCount: jobs.size,
        jobs: []
    };

    for (const [id, job] of jobs) {
        const source = sourcesModel.getById(id);
        if (source) {
            status.jobs.push({
                id: id,
                name: source.name,
                schedule: source.schedule,
                enabled: source.enabled
            });
        }
    }

    return status;
}

/**
 * Update a source's schedule
 * @param {number} sourceId - Source ID
 * @param {string} schedule - New cron expression
 */
function updateSchedule(sourceId, schedule) {
    const source = sourcesModel.getById(sourceId);
    if (!source) {
        throw new Error(`Source not found: ${sourceId}`);
    }

    // Update in database
    sourcesModel.update(sourceId, { schedule });

    // Reschedule if running
    if (isRunning && source.enabled) {
        scheduleSource({ ...source, schedule });
    }
}

module.exports = {
    start,
    stop,
    restart,
    runManually,
    runAll,
    getStatus,
    updateSchedule,
    scheduleSource
};
