from fastapi.testclient import TestClient


def test_get_questions(test_client: TestClient):
    response = test_client.get("/question_categories")
    assert response.status_code == 200
    assert response.json() == []
