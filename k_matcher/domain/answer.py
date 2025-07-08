from enum import Enum
from pydantic import BaseModel


class AnswerEnum(Enum):
	NEVER = 0
	NO_DESIRE = 1
	MAYBE = 2
	YES = 3
	NEED = 4


class Answer(BaseModel):
    answer: AnswerEnum
    if_forced: bool = False

    def __eq__(self, other: 'Answer'):
        if not isinstance(other, Answer):
            return NotImplemented
        return self.answer == other.answer
    
    def __lt__(self, other: 'Answer'):
        if not isinstance(other, Answer):
            return NotImplemented
        return self.answer.value < other.answer.value