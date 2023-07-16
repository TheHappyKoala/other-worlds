const getRandomFloatInRange = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

const getRandomInteger = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1) + min);

const clamp = (x: number, min: number, max: number): number => {
  if (x < min) {
    return min;
  }
  if (x > max) {
    return max;
  }

  return x;
};

export = {
  getRandomFloatInRange,
  getRandomInteger,
  clamp,
};
