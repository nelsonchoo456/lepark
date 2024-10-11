const cron = require('node-cron');
const SequestrationHistoryService = require('./services/SequestrationHistoryService');

// Schedule the task to run at 12am each day
cron.schedule('0 0 * * *', async () => {
  console.log('Generating sequestration history report...');
  await SequestrationHistoryService.generateSequestrationHistory();
  console.log('Sequestration history report generated.');
});