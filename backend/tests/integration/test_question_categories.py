from fastapi.testclient import TestClient


def test_get_question_categories__empty(test_client: TestClient):
    response = test_client.get("/question_categories")
    assert response.status_code == 200
    assert response.json() == []


def test_get_question_categories__success(test_client: TestClient, fill_db_with_questions):
    response = test_client.get("/question_categories")
    assert response.status_code == 200
    assert response.json() == [
        {"id": 1, "name": "category_1", "description": None},
        {"id": 2, "name": "category_2", "description": None},
    ]
