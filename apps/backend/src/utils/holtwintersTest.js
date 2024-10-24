const { getAugumentedDataset } = require('./holtwinters.js');

// Function to generate random dates within a range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate mock maintenance Task data
function generateMockMaintenanceTask(assetId, numberOfEntries) {
  console.log(`Generating ${numberOfEntries} mock maintenance entries for asset ${assetId}`);
  const startDate = new Date(2020, 0, 1);
  const endDate = new Date();

  const Task = Array.from({ length: numberOfEntries }, (_, index) => ({
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
    completedDate: randomDate(startDate, endDate),
    images: [],
    remarks: `Remarks for maintenance task #${index + 1}`,
    assignedStaffId: `staff-${index + 1}`,
    submittingStaffId: `staff-${index + 1}`,
    facilityId: `facility-${index + 1}`,
    parkAssetId: `asset-${index + 1}`,
    sensorId: `sensor-${index + 1}`,
    hubId: `hub-${index + 1}`,
    position: index + 1,
  })).sort((a, b) => a.completedDate - b.completedDate);

  console.log('Mock Task generated and sorted by date');
  return Task;
}

// Calculate intervals between maintenance dates in days
function calculateIntervals(maintenanceTask) {
  console.log('Calculating intervals between maintenance dates');
  const sortedDates = maintenanceTask.map((mh) => mh.completedDate).sort((a, b) => a - b);
  const intervals = sortedDates.slice(1).map((date, index) => (date - sortedDates[index]) / (1000 * 60 * 60 * 24));
  console.log('Intervals calculated:', intervals);
  return intervals;
}

// Predict future maintenance dates
function predictcompletedDates(maintenanceTask, numberOfPredictions) {
  console.log(`Predicting ${numberOfPredictions} future maintenance dates`);
  const intervals = calculateIntervals(maintenanceTask);

  console.log('Calling Holt-Winters algorithm');
  const result = getAugumentedDataset(intervals, numberOfPredictions);
  console.log('Holt-Winters algorithm completed');

  const lastcompletedDate = new Date(Math.max(...maintenanceTask.map((mh) => mh.completedDate)));
  console.log('Last maintenance date:', lastcompletedDate);

  const predictedDates = result.augumentedDataset.slice(-numberOfPredictions).map((interval, index) => {
    const predictedDate = new Date(lastcompletedDate);
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
const mockTask = generateMockMaintenanceTask(assetId, 20);

console.log('\nPredicting future maintenance dates');
const predictions = predictcompletedDates(mockTask, 5);

// Combine existing and predicted dates
const allDates = [
  ...mockTask.map((mh) => ({ type: 'Existing', date: mh.completedDate })),
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
