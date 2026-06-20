// Psychometric type definitions

export interface ReliabilityMetrics {
  cronbachAlpha: number;
  splitHalfReliability: number;
  testRetestReliability: number;
  standardErrorMeasurement: number;
}

export interface ItemAnalysis {
  questionId: string;
  difficulty: number; // p-value
  discrimination: number; // point-biserial correlation
  itemTotalCorrelation: number;
  distractorAnalysis?: DistractorAnalysis[];
}

export interface DistractorAnalysis {
  option: string;
  proportionSelected: number;
  pointBiserial: number;
}

export interface ValidityMetrics {
  contentValidity: number;
  constructValidity: number;
  criterionValidity: number;
  faceValidity: number;
}

export interface PsychometricReport {
  reliability: ReliabilityMetrics;
  itemAnalysis: ItemAnalysis[];
  validity: ValidityMetrics;
  sampleSize: number;
  confidenceInterval: number;
}
