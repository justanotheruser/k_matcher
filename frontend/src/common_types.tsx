export const GradeAnswerEnum = {
  Never: "Never",
  NoDesire: "No desire",
  Maybe: "Maybe",
  Yes: "Yes",
  Need: "Need",
} as const;
export type GradeAnswer =
  (typeof GradeAnswerEnum)[keyof typeof GradeAnswerEnum];
export const GRADE_ANSWERS = [
  GradeAnswerEnum.Never,
  GradeAnswerEnum.NoDesire,
  GradeAnswerEnum.Maybe,
  GradeAnswerEnum.Yes,
  GradeAnswerEnum.Need,
];

// Convert answers to backend format
export const answerGradeToNumber = {
  [GradeAnswerEnum.Never]: 0,
  [GradeAnswerEnum.NoDesire]: 1,
  [GradeAnswerEnum.Maybe]: 2,
  [GradeAnswerEnum.Yes]: 3,
  [GradeAnswerEnum.Need]: 4,
};

// Convert answers from backend format
export const numberToAnswerGrade = {
  0: GradeAnswerEnum.Never,
  1: GradeAnswerEnum.NoDesire,
  2: GradeAnswerEnum.Maybe,
  3: GradeAnswerEnum.Yes,
  4: GradeAnswerEnum.Need,
};
