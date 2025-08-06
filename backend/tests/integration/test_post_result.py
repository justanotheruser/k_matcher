from fastapi.testclient import TestClient


def test_post_answers_foreign_key_error(test_client: TestClient):
    # No question with id 0 in test database
    test_data = {"answers": [{"question_id": 0, "answer": 0, "if_forced": False}]}
    response = test_client.post("/result", json=test_data)
    assert response.status_code == 400
    assert response.json() == {"detail": "Foreign key constraint violated"}
