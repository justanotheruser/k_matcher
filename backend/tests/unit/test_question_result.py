from k_matcher.domain.answer import Answer, AnswerEnum
from k_matcher.domain.question_result import (
    QuestionResult,
    filter_matches,
    group_by_min_answer,
)


def test_filter_question_results():
    combined_results = [
        QuestionResult(
            question_id=hash("k1"),
            answer_a=Answer(answer=AnswerEnum.NEED),
            answer_b=Answer(answer=AnswerEnum.NEED),
        ),
        QuestionResult(
            question_id=hash("k2"),
            answer_a=Answer(answer=AnswerEnum.NEED),
            answer_b=Answer(answer=AnswerEnum.YES),
        ),
        QuestionResult(
            question_id=hash("k3"),
            answer_a=Answer(answer=AnswerEnum.YES),
            answer_b=Answer(answer=AnswerEnum.NEED),
        ),
        QuestionResult(
            question_id=hash("k4"),
            answer_a=Answer(answer=AnswerEnum.YES),
            answer_b=Answer(answer=AnswerEnum.YES),
        ),
        QuestionResult(
            question_id=hash("k5"),
            answer_a=Answer(answer=AnswerEnum.NEED),
            answer_b=Answer(answer=AnswerEnum.MAYBE),
        ),
        QuestionResult(
            question_id=hash("k6"),
            answer_a=Answer(answer=AnswerEnum.MAYBE),
            answer_b=Answer(answer=AnswerEnum.NEED),
        ),
        QuestionResult(
            question_id=hash("k7"),
            answer_a=Answer(answer=AnswerEnum.YES),
            answer_b=Answer(answer=AnswerEnum.MAYBE),
        ),
        QuestionResult(
            question_id=hash("k8"),
            answer_a=Answer(answer=AnswerEnum.MAYBE),
            answer_b=Answer(answer=AnswerEnum.YES),
        ),
        QuestionResult(
            question_id=hash("k9"),
            answer_a=Answer(answer=AnswerEnum.MAYBE),
            answer_b=Answer(answer=AnswerEnum.MAYBE),
        ),
        QuestionResult(
            question_id=hash("k10"),
            answer_a=Answer(answer=AnswerEnum.NO_DESIRE),
            answer_b=Answer(answer=AnswerEnum.NEED),
        ),
        QuestionResult(
            question_id=hash("k11"),
            answer_a=Answer(answer=AnswerEnum.NEED),
            answer_b=Answer(answer=AnswerEnum.NO_DESIRE),
        ),
        # cutoff point
        QuestionResult(
            question_id=hash("k12"),
            answer_a=Answer(answer=AnswerEnum.NO_DESIRE),
            answer_b=Answer(answer=AnswerEnum.YES),
        ),
        QuestionResult(
            question_id=hash("k13"),
            answer_a=Answer(answer=AnswerEnum.YES),
            answer_b=Answer(answer=AnswerEnum.NO_DESIRE),
        ),
        QuestionResult(
            question_id=hash("k14"),
            answer_a=Answer(answer=AnswerEnum.MAYBE),
            answer_b=Answer(answer=AnswerEnum.NO_DESIRE),
        ),
        QuestionResult(
            question_id=hash("k15"),
            answer_a=Answer(answer=AnswerEnum.NO_DESIRE),
            answer_b=Answer(answer=AnswerEnum.MAYBE),
        ),
        QuestionResult(
            question_id=hash("k16"),
            answer_a=Answer(answer=AnswerEnum.NO_DESIRE),
            answer_b=Answer(answer=AnswerEnum.MAYBE),
        ),
        QuestionResult(
            question_id=hash("k17"),
            answer_a=Answer(answer=AnswerEnum.MAYBE),
            answer_b=Answer(answer=AnswerEnum.NO_DESIRE),
        ),
        QuestionResult(
            question_id=hash("k17"),
            answer_a=Answer(answer=AnswerEnum.NO_DESIRE),
            answer_b=Answer(answer=AnswerEnum.NO_DESIRE),
        ),
        QuestionResult(
            question_id=hash("k18"),
            answer_a=Answer(answer=AnswerEnum.NEVER),
            answer_b=Answer(answer=AnswerEnum.NEED),
        ),
        QuestionResult(
            question_id=hash("k18"),
            answer_a=Answer(answer=AnswerEnum.NEED),
            answer_b=Answer(answer=AnswerEnum.NEVER),
        ),
        QuestionResult(
            question_id=hash("k19"),
            answer_a=Answer(answer=AnswerEnum.NEVER),
            answer_b=Answer(answer=AnswerEnum.YES),
        ),
        QuestionResult(
            question_id=hash("k20"),
            answer_a=Answer(answer=AnswerEnum.YES),
            answer_b=Answer(answer=AnswerEnum.NEVER),
        ),
        QuestionResult(
            question_id=hash("k21"),
            answer_a=Answer(answer=AnswerEnum.NEVER),
            answer_b=Answer(answer=AnswerEnum.MAYBE),
        ),
        QuestionResult(
            question_id=hash("k22"),
            answer_a=Answer(answer=AnswerEnum.MAYBE),
            answer_b=Answer(answer=AnswerEnum.NEVER),
        ),
        QuestionResult(
            question_id=hash("k23"),
            answer_a=Answer(answer=AnswerEnum.NEVER),
            answer_b=Answer(answer=AnswerEnum.NO_DESIRE),
        ),
        QuestionResult(
            question_id=hash("k24"),
            answer_a=Answer(answer=AnswerEnum.NO_DESIRE),
            answer_b=Answer(answer=AnswerEnum.NEVER),
        ),
        QuestionResult(
            question_id=hash("k25"),
            answer_a=Answer(answer=AnswerEnum.NEVER),
            answer_b=Answer(answer=AnswerEnum.NEVER),
        ),
    ]
    matches = filter_matches(combined_results)
    for result in matches:
        print(result)
    matched_questions = set(match.question_id for match in matches)
    assert matched_questions == {
        hash(k) for k in ("k1", "k2", "k3", "k4", "k5", "k6", "k7", "k8", "k9", "k10", "k11")
    }


def test_group_question_results_by_min_answer():
    matches = [
        QuestionResult(
            question_id=hash("need_1"),
            answer_a=Answer(answer=AnswerEnum.NEED),
            answer_b=Answer(answer=AnswerEnum.NEED),
        ),
        QuestionResult(
            question_id=hash("yes_1"),
            answer_a=Answer(answer=AnswerEnum.NEED),
            answer_b=Answer(answer=AnswerEnum.YES),
        ),
        QuestionResult(
            question_id=hash("need_2"),
            answer_a=Answer(answer=AnswerEnum.NEED),
            answer_b=Answer(answer=AnswerEnum.NEED),
        ),
        QuestionResult(
            question_id=hash("maybe_1"),
            answer_a=Answer(answer=AnswerEnum.NEED),
            answer_b=Answer(answer=AnswerEnum.MAYBE),
        ),
        QuestionResult(
            question_id=hash("yes_2"),
            answer_a=Answer(answer=AnswerEnum.NEED),
            answer_b=Answer(answer=AnswerEnum.YES),
        ),
        QuestionResult(
            question_id=hash("yes_3"),
            answer_a=Answer(answer=AnswerEnum.YES),
            answer_b=Answer(answer=AnswerEnum.NEED),
        ),
        QuestionResult(
            question_id=hash("maybe_2"),
            answer_a=Answer(answer=AnswerEnum.MAYBE),
            answer_b=Answer(answer=AnswerEnum.NEED),
        ),
        QuestionResult(
            question_id=hash("maybe_3"),
            answer_a=Answer(answer=AnswerEnum.YES),
            answer_b=Answer(answer=AnswerEnum.MAYBE),
        ),
        QuestionResult(
            question_id=hash("yes_4"),
            answer_a=Answer(answer=AnswerEnum.YES),
            answer_b=Answer(answer=AnswerEnum.YES),
        ),
        QuestionResult(
            question_id=hash("no_desire_1"),
            answer_a=Answer(answer=AnswerEnum.NO_DESIRE),
            answer_b=Answer(answer=AnswerEnum.NEED),
        ),
        QuestionResult(
            question_id=hash("maybe_4"),
            answer_a=Answer(answer=AnswerEnum.MAYBE),
            answer_b=Answer(answer=AnswerEnum.NEED),
        ),
        QuestionResult(
            question_id=hash("no_desire_2"),
            answer_a=Answer(answer=AnswerEnum.NEED),
            answer_b=Answer(answer=AnswerEnum.NO_DESIRE),
        ),
        QuestionResult(
            question_id=hash("maybe_5"),
            answer_a=Answer(answer=AnswerEnum.MAYBE),
            answer_b=Answer(answer=AnswerEnum.YES),
        ),
        QuestionResult(
            question_id=hash("maybe_6"),
            answer_a=Answer(answer=AnswerEnum.MAYBE),
            answer_b=Answer(answer=AnswerEnum.MAYBE),
        ),
    ]
    grouped_matches = group_by_min_answer(matches)
    grouped_matches_as_sets = {
        key: set(qr.question_id for qr in value_list) for key, value_list in grouped_matches.items()
    }
    expected_result = {
        AnswerEnum.NEED: set((hash("need_1"), hash("need_2"))),
        AnswerEnum.YES: set((hash(k) for k in ("yes_1", "yes_2", "yes_3", "yes_4"))),
        AnswerEnum.MAYBE: set(
            (hash(k) for k in ("maybe_1", "maybe_2", "maybe_3", "maybe_4", "maybe_5", "maybe_6"))
        ),
        AnswerEnum.NO_DESIRE: set((hash(k) for k in ("no_desire_1", "no_desire_2"))),
    }
    assert grouped_matches_as_sets == expected_result
