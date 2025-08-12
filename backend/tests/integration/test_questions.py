from fastapi.testclient import TestClient


def test_get_questions__none(test_client: TestClient):
    response = test_client.get("/questions")
    assert response.status_code == 200
    assert response.json() == []


def test_get_all_questions(test_client: TestClient, fill_db_with_questions):
    response = test_client.get("/questions")
    assert response.status_code == 200
    assert response.json() == [
        {"id": 1, "text": "text 1", "category_id": 1},
        {"id": 2, "text": "text 2", "category_id": 2},
        {"id": 3, "text": "text 3", "category_id": 2},
        {"id": 4, "text": "text 4", "category_id": 1},
    ]


def test_get_questions_by_category(test_client: TestClient, fill_db_with_questions):
    response = test_client.get("/questions?category_id=2")
    assert response.status_code == 200
    assert response.json() == [
        {"id": 2, "text": "text 2", "category_id": 2},
        {"id": 3, "text": "text 3", "category_id": 2},
    ]
