from pydantic import BaseModel

from k_matcher.domain.enums import AnswerEnum


class AnswerBase:
    question_id: int
    answer: AnswerEnum
    if_forced: bool


class Answer(BaseModel):
    answer: AnswerEnum
    if_forced: bool = False

    def __eq__(self, other):
        if not isinstance(other, Answer):
            return NotImplemented
        return self.answer == other.answer

    def __lt__(self, other):
        if not isinstance(other, Answer):
            return NotImplemented
        return self.answer.value < other.answer.value

    @staticmethod
    def from_answer_base(answer_base: AnswerBase) -> 'Answer':
        return Answer(answer=answer_base.answer, if_forced=answer_base.if_forced)
