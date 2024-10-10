/**
 * RubyGarage.
 * https://rubygarage.org/
 *
 * Copyright (c) 2016 RubyGarage.
 * Licensed under the MIT license.
 */

interface HoltWintersResult {
  augumentedDataset: number[];
  alpha: number;
  beta: number;
  gamma: number;
  period: number;
  mse: number;
  sse: number;
  mpe: number;
}

/**
 * Returns augmented dataset, seasonal coefficients and errors.
 *
 * @param {number[]} data - input data
 * @param {number} m - extrapolated future data points
 *
 * @returns {HoltWintersResult}
 */
function getAugumentedDataset(data: number[], m: number): HoltWintersResult {
  const initialparams: number[] = [0.0, 0.1, 0.2, 0.4, 0.6, 0.8, 1.0];
  let alpha: number = 0, beta: number = 0, gamma: number = 0, period: number = 0;
  let prediction: number[] = [];
  let err: number = Infinity;

  // TODO: rewrite this bruteforce with Levenberg-Marquardt equation
  initialparams.forEach((a) => {
    initialparams.forEach((b) => {
      initialparams.forEach((g) => {
        for (let p = 1; p < data.length / 2; p++) {
          const currentPrediction = getForecast(data, a, b, g, p, m);
          let error: number | undefined;
          if (currentPrediction) {
            error = mse(data, currentPrediction, p);
          }

          if (error !== undefined && err > error) {
            err = error;
            alpha = a;
            beta = b;
            gamma = g;
            period = p;
            prediction = currentPrediction ?? [];
          }
        }
      });
    });
  });

  const augumentedDataset = [...prediction];

  for (let i = 0; i < data.length; i++) {
    augumentedDataset[i] = data[i];
  }

  return {
    augumentedDataset,
    alpha,
    beta,
    gamma,
    period,
    mse: mse(data, prediction, period),
    sse: sse(data, prediction, period),
    mpe: mpe(data, prediction, period)
  };
}

function getForecast(data: number[], alpha: number, beta: number, gamma: number, period: number, m: number): number[] | undefined {
  let seasons: number, seasonal: number[], st1: number, bt1: number;

  if (!validArgs(data, alpha, beta, gamma, period, m)) {
    return undefined;
  }

  seasons = Math.floor(data.length / period);
  st1 = data[0];
  bt1 = initialTrend(data, period);
  seasonal = seasonalIndices(data, period, seasons);

  return calcHoltWinters(
    data,
    st1,
    bt1,
    alpha,
    beta,
    gamma,
    seasonal,
    period,
    m
  );
}

function mse(origin: number[], data: number[], period: number): number {
  return sse(origin, data, period) / (origin.length - period);
}

function sse(origin: number[], data: number[], period: number): number {
  let sum = 0;
  for (let i = period; i < origin.length; i++) {
    sum += Math.pow(data[i] - origin[i], 2);
  }
  return sum;
}

function mpe(origin: number[], data: number[], period: number): number {
  let sum = 0;
  for (let i = period; i < origin.length; i++) {
    sum += (data[i] - origin[i]) / origin[i];
  }
  return Math.abs(sum / (origin.length - period));
}

function validArgs(data: number[], alpha: number, beta: number, gamma: number, period: number, m: number): boolean {
  if (!data.length) {
    return false;
  }
  if (m <= 0) {
    return false;
  }
  if (m > period) {
    return false;
  }
  if (alpha < 0.0 || alpha > 1.0) {
    return false;
  }
  if (beta < 0.0 || beta > 1.0) {
    return false;
  }
  if (gamma < 0.0 || gamma > 1.0) {
    return false;
  }
  return true;
}

function initialTrend(data: number[], period: number): number {
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += (data[period + i] - data[i]);
  }
  return sum / (period * period);
}

function seasonalIndices(data: number[], period: number, seasons: number): number[] {
  const savg: number[] = new Array(seasons).fill(0);
  const obsavg: number[] = new Array(data.length);
  const si: number[] = new Array(period).fill(0);

  for (let i = 0; i < seasons; i++) {
    for (let j = 0; j < period; j++) {
      savg[i] += data[(i * period) + j];
    }
    savg[i] /= period;
  }

  for (let i = 0; i < seasons; i++) {
    for (let j = 0; j < period; j++) {
      obsavg[(i * period) + j] = data[(i * period) + j] / savg[i];
    }
  }

  for (let i = 0; i < period; i++) {
    for (let j = 0; j < seasons; j++) {
      si[i] += obsavg[(j * period) + i];
    }
    si[i] /= seasons;
  }

  return si;
}

function calcHoltWinters(
  data: number[],
  st1: number,
  bt1: number,
  alpha: number,
  beta: number,
  gamma: number,
  seasonal: number[],
  period: number,
  m: number
): number[] {
  const len = data.length;
  const st: number[] = new Array(len);
  const bt: number[] = new Array(len);
  const it: number[] = new Array(len);
  const ft: number[] = new Array(len).fill(0);

  st[1] = st1;
  bt[1] = bt1;

  for (let i = 0; i < period; i++) {
    it[i] = seasonal[i];
  }

  for (let i = 2; i < len; i++) {
    if (i - period >= 0) {
      st[i] = ((alpha * data[i]) / it[i - period]) +
        ((1.0 - alpha) * (st[i - 1] + bt[i - 1]));
    } else {
      st[i] = (alpha * data[i]) + ((1.0 - alpha) *
        (st[i - 1] + bt[i - 1]));
    }

    bt[i] = (gamma * (st[i] - st[i - 1])) +
      ((1 - gamma) * bt[i - 1]);

    if (i - period >= 0) {
      it[i] = ((beta * data[i]) / st[i]) +
        ((1.0 - beta) * it[i - period]);
    }

    if (i + m >= period) {
      ft[i + m] = (st[i] + (m * bt[i])) *
        it[i - period + m];
    }
  }

  return ft;
}

export default getAugumentedDataset;
