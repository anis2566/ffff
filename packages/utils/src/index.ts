import {
  higherSecondaryLevels,
  LEVELS,
  primaryLevels,
  secondaryLevels,
} from "./constant";

export const generateTransactionIdFromObjectId = (objectId: string): string => {
  const hexPart = objectId.toString().slice(-8);
  const decimal = parseInt(hexPart, 16);

  // Ensure it's 8 digits by taking modulo and padding
  const eightDigit = (decimal % 100000000).toString().padStart(8, "0");
  return eightDigit;
};

export function getLevelByClassName(className: string): LEVELS {
  if (primaryLevels.includes(className)) {
    return LEVELS.Primary;
  }

  if (higherSecondaryLevels.includes(className)) {
    return LEVELS.HigherSecondary;
  }

  if (secondaryLevels.includes(className)) {
    return LEVELS.Secondary;
  }

  return LEVELS.Primary;
}

export function getGrade(obtainedMarks: number, totalMarks: number): string {
  if (obtainedMarks < 0 || totalMarks <= 0) {
    throw new Error("Invalid marks provided");
  }

  if (obtainedMarks > totalMarks) {
    throw new Error("Obtained marks cannot exceed total marks");
  }

  const percentage = (obtainedMarks / totalMarks) * 100;

  if (percentage >= 80) {
    return "A+";
  } else if (percentage >= 70) {
    return "A";
  } else if (percentage >= 60) {
    return "A-";
  } else if (percentage >= 50) {
    return "B";
  } else if (percentage >= 40) {
    return "C";
  } else if (percentage >= 33) {
    return "D";
  } else {
    return "F";
  }
}
