from pydantic import BaseModel
from collections import defaultdict
from k_matcher.domain.answer import Answer, AnswerEnum
import random


class QuestionResult(BaseModel):
    question: str
    answer_a: Answer
    answer_b: Answer

    def __str__(self) -> str:
        return f"{self.question}: ({self.answer_a.answer}, {self.answer_b.answer})"


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