import random
from collections import defaultdict
from typing import Sequence

from pydantic import BaseModel, RootModel
from typing_extensions import TypedDict

from k_matcher.domain.answer import Answer, AnswerBase, AnswerEnum


class QuestionResult(BaseModel):
    question_id: int
    answer_a: Answer
    answer_b: Answer

    def __str__(self) -> str:
        return f"{self.question_id}: ({self.answer_a.answer}, {self.answer_b.answer})"


def _is_match(result: QuestionResult) -> bool:
    answer_values = [result.answer_a.answer.value, result.answer_b.answer.value]
    if min(answer_values) <= AnswerEnum.NEVER.value:
        return False
    if max(answer_values) >= AnswerEnum.NEED.value:
        return True
    return all(map(lambda value: value > AnswerEnum.NO_DESIRE.value, answer_values))


def filter_matches(question_results: list[QuestionResult]) -> list[QuestionResult]:
    return list(filter(_is_match, question_results))


def group_by_min_answer(matches: list[QuestionResult]) -> dict[AnswerEnum, list[QuestionResult]]:
    result = defaultdict(list)
    for match in matches:
        min_answer_enum = min(match.answer_a, match.answer_b).answer
        result[min_answer_enum].append(match)
    for key in result.keys():
        random.shuffle(result[key])
    return result


def get_question_results(
    answers_a: Sequence[AnswerBase], answers_b: Sequence[AnswerBase], question_ids: set[int]
) -> list[QuestionResult]:
    answers_dict_a = {answer.question_id: Answer.from_answer_base(answer) for answer in answers_a}
    answers_dict_b = {answer.question_id: Answer.from_answer_base(answer) for answer in answers_b}
    return [
        QuestionResult(
            question_id=question_id,
            answer_a=answers_dict_a[question_id],
            answer_b=answers_dict_b[question_id],
        )
        for question_id in question_ids
    ]


class GradedMatch(TypedDict):
    min_answer: int
    matches: list[QuestionResult]


class MatchList(RootModel):
    root: list[GradedMatch]


def get_match(
    answers_a: Sequence[AnswerBase], answers_b: Sequence[AnswerBase], question_ids: set[int]
) -> MatchList:
    question_results = get_question_results(answers_a, answers_b, question_ids)
    grouped = group_by_min_answer(filter_matches(question_results))
    return MatchList(
        root=[
            GradedMatch(min_answer=min_answer.value, matches=matches)
            for min_answer, matches in grouped.items()
        ]
    )
