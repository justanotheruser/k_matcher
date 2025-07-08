from k_matcher.domain.question_result import QuestionResult, filter_matches, group_by_min_answer
from k_matcher.domain.answer import Answer, AnswerEnum


def test_filter_question_results():
    combined_results = [
        QuestionResult(question="k1", answer_a=Answer(answer=AnswerEnum.NEED), answer_b=Answer(answer=AnswerEnum.NEED)),
        QuestionResult(question="k2", answer_a=Answer(answer=AnswerEnum.NEED), answer_b=Answer(answer=AnswerEnum.YES)),
        QuestionResult(question="k3", answer_a=Answer(answer=AnswerEnum.YES), answer_b=Answer(answer=AnswerEnum.NEED)),
        QuestionResult(question="k4", answer_a=Answer(answer=AnswerEnum.YES), answer_b=Answer(answer=AnswerEnum.YES)),
        QuestionResult(question="k5", answer_a=Answer(answer=AnswerEnum.NEED), answer_b=Answer(answer=AnswerEnum.MAYBE)),
        QuestionResult(question="k6", answer_a=Answer(answer=AnswerEnum.MAYBE), answer_b=Answer(answer=AnswerEnum.NEED)),
        QuestionResult(question="k7", answer_a=Answer(answer=AnswerEnum.YES), answer_b=Answer(answer=AnswerEnum.MAYBE)),
        QuestionResult(question="k8", answer_a=Answer(answer=AnswerEnum.MAYBE), answer_b=Answer(answer=AnswerEnum.YES)),
        QuestionResult(question="k9", answer_a=Answer(answer=AnswerEnum.MAYBE), answer_b=Answer(answer=AnswerEnum.MAYBE)),
        QuestionResult(question="k10", answer_a=Answer(answer=AnswerEnum.NO_DESIRE), answer_b=Answer(answer=AnswerEnum.NEED)),
        QuestionResult(question="k11", answer_a=Answer(answer=AnswerEnum.NEED), answer_b=Answer(answer=AnswerEnum.NO_DESIRE)),
        # cutoff point
        QuestionResult(question="k12", answer_a=Answer(answer=AnswerEnum.NO_DESIRE), answer_b=Answer(answer=AnswerEnum.YES)),
        QuestionResult(question="k13", answer_a=Answer(answer=AnswerEnum.YES), answer_b=Answer(answer=AnswerEnum.NO_DESIRE)),
        QuestionResult(question="k14", answer_a=Answer(answer=AnswerEnum.MAYBE), answer_b=Answer(answer=AnswerEnum.NO_DESIRE)),
        QuestionResult(question="k15", answer_a=Answer(answer=AnswerEnum.NO_DESIRE), answer_b=Answer(answer=AnswerEnum.MAYBE)),
        QuestionResult(question="k16", answer_a=Answer(answer=AnswerEnum.NO_DESIRE), answer_b=Answer(answer=AnswerEnum.MAYBE)),
        QuestionResult(question="k17", answer_a=Answer(answer=AnswerEnum.MAYBE), answer_b=Answer(answer=AnswerEnum.NO_DESIRE)),
        QuestionResult(question="k17", answer_a=Answer(answer=AnswerEnum.NO_DESIRE), answer_b=Answer(answer=AnswerEnum.NO_DESIRE)),
        QuestionResult(question="k18", answer_a=Answer(answer=AnswerEnum.NEVER), answer_b=Answer(answer=AnswerEnum.NEED)),
        QuestionResult(question="k18", answer_a=Answer(answer=AnswerEnum.NEED), answer_b=Answer(answer=AnswerEnum.NEVER)),
        QuestionResult(question="k19", answer_a=Answer(answer=AnswerEnum.NEVER), answer_b=Answer(answer=AnswerEnum.YES)),
        QuestionResult(question="k20", answer_a=Answer(answer=AnswerEnum.YES), answer_b=Answer(answer=AnswerEnum.NEVER)),
        QuestionResult(question="k21", answer_a=Answer(answer=AnswerEnum.NEVER), answer_b=Answer(answer=AnswerEnum.MAYBE)),
        QuestionResult(question="k22", answer_a=Answer(answer=AnswerEnum.MAYBE), answer_b=Answer(answer=AnswerEnum.NEVER)),
        QuestionResult(question="k23", answer_a=Answer(answer=AnswerEnum.NEVER), answer_b=Answer(answer=AnswerEnum.NO_DESIRE)),
        QuestionResult(question="k24", answer_a=Answer(answer=AnswerEnum.NO_DESIRE), answer_b=Answer(answer=AnswerEnum.NEVER)),
        QuestionResult(question="k25", answer_a=Answer(answer=AnswerEnum.NEVER), answer_b=Answer(answer=AnswerEnum.NEVER)),

    ]
    matches = filter_matches(combined_results)
    for result in matches:
        print(result)
    matched_questions = set(match.question for match in matches)
    assert matched_questions == {"k1", "k2", "k3", "k4", "k5", "k6", "k7", "k8", "k9", "k10", "k11"}


def test_group_question_results_by_min_answer():
    matches = [
        QuestionResult(question="need_1", answer_a=Answer(answer=AnswerEnum.NEED), answer_b=Answer(answer=AnswerEnum.NEED)),
        QuestionResult(question="yes_1", answer_a=Answer(answer=AnswerEnum.NEED), answer_b=Answer(answer=AnswerEnum.YES)),
        QuestionResult(question="need_2", answer_a=Answer(answer=AnswerEnum.NEED), answer_b=Answer(answer=AnswerEnum.NEED)),
        QuestionResult(question="maybe_1", answer_a=Answer(answer=AnswerEnum.NEED), answer_b=Answer(answer=AnswerEnum.MAYBE)),
        QuestionResult(question="yes_2", answer_a=Answer(answer=AnswerEnum.NEED), answer_b=Answer(answer=AnswerEnum.YES)),
        QuestionResult(question="yes_3", answer_a=Answer(answer=AnswerEnum.YES), answer_b=Answer(answer=AnswerEnum.NEED)),
        QuestionResult(question="maybe_2", answer_a=Answer(answer=AnswerEnum.MAYBE), answer_b=Answer(answer=AnswerEnum.NEED)),
        QuestionResult(question="maybe_3", answer_a=Answer(answer=AnswerEnum.YES), answer_b=Answer(answer=AnswerEnum.MAYBE)),
        QuestionResult(question="yes_4", answer_a=Answer(answer=AnswerEnum.YES), answer_b=Answer(answer=AnswerEnum.YES)),
        QuestionResult(question="no_desire_1", answer_a=Answer(answer=AnswerEnum.NO_DESIRE), answer_b=Answer(answer=AnswerEnum.NEED)),
        QuestionResult(question="maybe_4", answer_a=Answer(answer=AnswerEnum.MAYBE), answer_b=Answer(answer=AnswerEnum.NEED)),
        QuestionResult(question="no_desire_2", answer_a=Answer(answer=AnswerEnum.NEED), answer_b=Answer(answer=AnswerEnum.NO_DESIRE)),
        QuestionResult(question="maybe_5", answer_a=Answer(answer=AnswerEnum.MAYBE), answer_b=Answer(answer=AnswerEnum.YES)),
        QuestionResult(question="maybe_6", answer_a=Answer(answer=AnswerEnum.MAYBE), answer_b=Answer(answer=AnswerEnum.MAYBE)),
    ]
    grouped_matches = group_by_min_answer(matches)
    grouped_matches_as_sets = {
        key: set(qr.question for qr in value_list) for key, value_list in grouped_matches.items()
    }
    expected_result = {
        AnswerEnum.NEED: set(("need_1", "need_2")),
        AnswerEnum.YES: set(("yes_1", "yes_2", "yes_3", "yes_4")),
        AnswerEnum.MAYBE: set(("maybe_1", "maybe_2", "maybe_3", "maybe_4", "maybe_5", "maybe_6")),
        AnswerEnum.NO_DESIRE: set(("no_desire_1", "no_desire_2"))
    }
    assert grouped_matches_as_sets == expected_result