from fastapi.testclient import TestClient


def test_post_answers__foreign_key_error(test_client: TestClient):
    # No question with id 0 in test database
    test_data = {"answers": [{"question_id": 0, "answer": 0, "if_forced": False}]}
    response = test_client.post("/results", json=test_data)
    assert response.status_code == 400
    assert response.json() == {"detail": "Foreign key constraint violated"}


def test_post_answers__unreleated_users(test_client: TestClient, fill_db_with_questions):
    # First user sends answers (no id in URL)
    test_data = {
        "answers": [
            {"question_id": 1, "answer": 0, "if_forced": False},
            {"question_id": 2, "answer": 1, "if_forced": True},
            {"question_id": 3, "answer": 3, "if_forced": False},
            {"question_id": 4, "answer": 4, "if_forced": False},
        ]
    }
    first_response = test_client.post("/results", json=test_data)
    assert first_response.status_code == 200
    first_response_json = first_response.json()
    assert first_response_json["matching_result"] is None
    first_result_id = first_response_json["id"]
    assert first_result_id is not None
    # Second user sends answers (also no id in URL)
    second_response = test_client.post("/results", json=test_data)
    assert second_response.status_code == 200
    second_response_json = second_response.json()
    assert second_response_json["matching_result"] is None
    second_result_id = second_response_json["id"]
    assert second_result_id is not None
    assert first_result_id != second_result_id


def test_post_answers__related_users(test_client: TestClient, fill_db_with_questions):
    # 1. First user sends answers (no id in URL)
    test_data = {
        "answers": [
            {"question_id": 1, "answer": 0, "if_forced": False},
            {"question_id": 2, "answer": 3, "if_forced": True},
            {"question_id": 3, "answer": 1, "if_forced": False},
            {"question_id": 4, "answer": 4, "if_forced": False},
        ]
    }
    first_response = test_client.post("/results", json=test_data)
    assert first_response.status_code == 200
    first_response_json = first_response.json()
    assert first_response_json["matching_result"] is None
    first_result_id = first_response_json["id"]
    assert first_result_id is not None

    # 2. Second user sends answers (id from repsponse to first user)
    test_data = {
        "partner_id": first_result_id,
        "answers": [
            {"question_id": 1, "answer": 1, "if_forced": False},
            {"question_id": 2, "answer": 4, "if_forced": False},
            {"question_id": 3, "answer": 3, "if_forced": False},
            {"question_id": 4, "answer": 3, "if_forced": False},
        ],
    }

    def validate_result(result_json):
        # Because questions in matches are shuffled, lets sort them before asserting
        for graded_match in result_json["matching_result"]:
            graded_match["matches"].sort(key=lambda q: q["question_id"])
        assert result_json["matching_result"] == [
            {
                "min_answer": 3,
                "matches": [
                    {
                        "question_id": 2,
                        "answer_a": {"answer": 3, "if_forced": True},
                        "answer_b": {"answer": 4, "if_forced": False},
                    },
                    {
                        "question_id": 4,
                        "answer_a": {"answer": 4, "if_forced": False},
                        "answer_b": {"answer": 3, "if_forced": False},
                    },
                ],
            }
        ]

    second_response = test_client.post("/results", json=test_data)
    assert second_response.status_code == 200
    validate_result(second_response.json())

    # 3. Now results are available via /results/<id>
    response = test_client.get(f"/results/{first_result_id}")
    assert response.status_code == 200
    validate_result(response.json())
