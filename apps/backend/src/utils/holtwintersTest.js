const { getAugumentedDataset } = require('./holtwinters.js');

// Function to generate random dates within a range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate mock maintenance history data
function generateMockMaintenanceHistory(assetId, numberOfEntries) {
  console.log(`Generating ${numberOfEntries} mock maintenance entries for asset ${assetId}`);
  const startDate = new Date(2020, 0, 1);
  const endDate = new Date();

  const history = Array.from({ length: numberOfEntries }, (_, index) => ({
    id: `mh-${index + 1}`,
    assetId: assetId,
    maintenanceDate: randomDate(startDate, endDate),
    description: `Routine maintenance #${index + 1}`
  })).sort((a, b) => a.maintenanceDate - b.maintenanceDate);

  console.log('Mock history generated and sorted by date');
  return history;
}

// Calculate intervals between maintenance dates in days
function calculateIntervals(maintenanceHistory) {
  console.log('Calculating intervals between maintenance dates');
  const sortedDates = maintenanceHistory.map(mh => mh.maintenanceDate).sort((a, b) => a - b);
  const intervals = sortedDates.slice(1).map((date, index) =>
    (date - sortedDates[index]) / (1000 * 60 * 60 * 24)
  );
  console.log('Intervals calculated:', intervals);
  return intervals;
}

// Predict future maintenance dates
function predictMaintenanceDates(maintenanceHistory, numberOfPredictions) {
  console.log(`Predicting ${numberOfPredictions} future maintenance dates`);
  const intervals = calculateIntervals(maintenanceHistory);

  console.log('Calling Holt-Winters algorithm');
  const result = getAugumentedDataset(intervals, numberOfPredictions);
  console.log('Holt-Winters algorithm completed');

  const lastMaintenanceDate = new Date(Math.max(...maintenanceHistory.map(mh => mh.maintenanceDate)));
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
    mse: result.mse
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
const mockHistory = generateMockMaintenanceHistory(assetId, 20);

console.log('\nPredicting future maintenance dates');
const predictions = predictMaintenanceDates(mockHistory, 5);

// Combine existing and predicted dates
const allDates = [
  ...mockHistory.map(mh => ({ type: 'Existing', date: mh.maintenanceDate })),
  ...predictions.predictedDates.map(date => ({ type: 'Predicted', date }))
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
