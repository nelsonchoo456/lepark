const { getAugumentedDataset } = require('./holtwinters.js');

// Function to generate random dates within a range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate mock maintenance tasks data with restricted intervals
function generateMockMaintenanceTasks(assetId, numberOfEntries) {
  console.log(`Generating ${numberOfEntries} mock maintenance entries for asset ${assetId}`);
  const startDate = new Date(2020, 0, 1);
  const endDate = new Date();

  const tasks = [];
  let lastCompletedDate = randomDate(startDate, endDate);

  for (let index = 0; index < numberOfEntries; index++) {
    const minInterval = 10; // Minimum interval in days
    const maxInterval = 200; // Maximum interval in days
    const interval = Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
    const completedDate = new Date(lastCompletedDate);
    completedDate.setDate(completedDate.getDate() + interval);

    tasks.push({
      id: `mt-${index + 1}`,
      assetId: assetId,
      title: `Maintenance Task #${index + 1}`,
      description: `Routine maintenance #${index + 1}`,
      taskStatus: 'COMPLETED', // Assuming all tasks are completed for this example
      taskType: 'INSPECTION', // Example task type
      taskUrgency: 'NORMAL', // Example task urgency
      createdAt: randomDate(startDate, endDate),
      updatedAt: randomDate(startDate, endDate),
      dueDate: randomDate(startDate, endDate),
      completedDate: completedDate,
      images: [],
      remarks: `Remarks for maintenance task #${index + 1}`,
      assignedStaffId: `staff-${index + 1}`,
      submittingStaffId: `staff-${index + 1}`,
      facilityId: `facility-${index + 1}`,
      parkAssetId: `asset-${index + 1}`,
      sensorId: `sensor-${index + 1}`,
      hubId: `hub-${index + 1}`,
      position: index + 1,
    });

    lastCompletedDate = completedDate;
  }

  tasks.sort((a, b) => a.completedDate - b.completedDate);

  console.log('Mock tasks generated and sorted by date');
  return tasks;
}

// Calculate intervals between maintenance dates in days
function calculateIntervals(maintenanceTasks) {
  console.log('Calculating intervals between maintenance dates');
  const sortedDates = maintenanceTasks.map((mt) => mt.completedDate).sort((a, b) => a - b);
  const intervals = sortedDates.slice(1).map((date, index) => (date - sortedDates[index]) / (1000 * 60 * 60 * 24));
  console.log('Intervals calculated:', intervals);
  return intervals;
}

// Predict future maintenance dates
function predictMaintenanceDates(maintenanceTasks, numberOfPredictions) {
  console.log(`Predicting ${numberOfPredictions} future maintenance dates`);
  const intervals = calculateIntervals(maintenanceTasks);

  console.log('Calling Holt-Winters algorithm');
  const result = getAugumentedDataset(intervals, numberOfPredictions);
  console.log('Holt-Winters algorithm completed');

  const lastMaintenanceDate = new Date(Math.max(...maintenanceTasks.map((mt) => mt.completedDate)));
  console.log('Last maintenance date:', lastMaintenanceDate);

  const predictedDates = result.augumentedDataset.slice(-numberOfPredictions).map((interval, index) => {
    const predictedDate = new Date(lastMaintenanceDate);
    predictedDate.setDate(predictedDate.getDate() + Math.round(interval));
    return predictedDate;
  });

  console.log('Predicted dates calculated');

  return {
    predictedDates,
    alpha: result.alpha,
    beta: result.beta,
    gamma: result.gamma,
    period: result.period,
    mse: result.mse,
  };
}

// New function to format date
function formatDate(date) {
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// New function to calculate interval
function calculateInterval(currentDate, previousDate) {
  if (!previousDate) return '-';
  const diffTime = Math.abs(currentDate - previousDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays.toString();
}

// Modified main execution
console.log('Starting mock maintenance prediction script');

const assetId = 'asset-001';
const mockTasks = generateMockMaintenanceTasks(assetId, 20);

console.log('\nPredicting future maintenance dates');
const predictions = predictMaintenanceDates(mockTasks, 5);

// Combine existing and predicted dates
const allDates = [
  ...mockTasks.map((mt) => ({ type: 'Existing', date: mt.completedDate })),
  ...predictions.predictedDates.map((date) => ({ type: 'Predicted', date })),
];

// Sort all dates
allDates.sort((a, b) => a.date - b.date);

// Print the table
console.log('\nMaintenance Dates Table:');
console.log('| Type      | Date           | Interval (days) |');
console.log('|-----------|----------------|-----------------|');

let previousDate = null;
allDates.forEach(({ type, date }) => {
  const formattedDate = formatDate(date);
  const interval = calculateInterval(date, previousDate);
  console.log(`| ${type.padEnd(9)} | ${formattedDate.padEnd(14)} | ${interval.padStart(15)} |`);
  previousDate = date;
});

console.log('\nScript execution completed');
