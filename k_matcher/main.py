import csv
import os
from abc import ABC, abstractmethod
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

from k_matcher.config import load_config


# Data Models
class Question(BaseModel):
    id: int
    question: str
    description: str

class Response(BaseModel):
    question_id: int
    answer: bool  # True for Yes, False for No

class SurveySubmission(BaseModel):
    responses: list[Response]
    matching_question_ids: list[int] = []
    id: str | None = None

# Repository Layer
class QuestionRepository(ABC):
    @abstractmethod
    def get_all_questions(self) -> list[Question]:
        pass
    
    @abstractmethod
    def get_question_by_id(self, question_id: int) -> Question | None:
        pass

class ResponseRepository(ABC):
    @abstractmethod
    def save_response(self, response: SurveySubmission) -> str:
        pass
    
    @abstractmethod
    def get_response(self, _id: str) -> SurveySubmission | None:
        pass

    @abstractmethod
    def get_all_responses(self) -> list[SurveySubmission]:
        pass

class CSVQuestionRepository(QuestionRepository):
    def __init__(self, csv_file_path: str):
        self.csv_file_path = csv_file_path
        self._ensure_csv_exists()
        
    def _ensure_csv_exists(self):
        """Create a sample CSV file if it doesn't exist"""
        if not os.path.exists(self.csv_file_path):
            with open(self.csv_file_path, "w", newline="") as f:
                writer = csv.writer(f)
                writer.writerow(["id", "question", "description"])
                writer.writerow([1, "Do you enjoy outdoor activities?", 
                                "Activities like hiking, camping, etc."])
                writer.writerow([2, "Do you regularly use public transportation?", 
                                "Bus, train, subway, etc."])
                writer.writerow([3, "Do you prefer remote work?", 
                                "Working from home rather than an office"])
        
    def get_all_questions(self) -> list[Question]:
        questions = []
        try:
            with open(self.csv_file_path, 'r') as f:
                reader = csv.reader(f)
                next(reader)  # Skip header
                for row in reader:
                    questions.append(Question(
                        id=int(row[0]),
                        question=row[1],
                        description=row[2]
                    ))
        except Exception as e:
            print(f"Error reading CSV: {e}")
        return questions
    
    def get_question_by_id(self, question_id: int) -> Question | None:
        questions = self.get_all_questions()
        for question in questions:
            if question.id == question_id:
                return question
        return None

class InMemoryResponseRepository(ResponseRepository):
    def __init__(self):
        self.responses: dict[str, SurveySubmission] = {}
    
    def save_response(self, submission: SurveySubmission) -> str:
        submission_id = str(uuid4())
        self.responses[submission_id] = SurveySubmission(
            responses=submission.responses, 
            id=submission_id
        )
        return submission_id
    
    def get_response(self, _id: str) -> SurveySubmission | None:
        return self.responses.get(_id)

    def get_all_responses(self) -> list[SurveySubmission]:
        return self.responses

# FastAPI application
app = FastAPI()

# Initialize repositories
question_repo = CSVQuestionRepository("questions.csv")
response_repo = InMemoryResponseRepository()

# API routes
@app.get("/api/questions", response_model=list[Question])
async def get_questions():
    return question_repo.get_all_questions()

@app.get("/api/questions/{question_id}", response_model=Question)
async def get_question(question_id: int):
    question = question_repo.get_question_by_id(question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question

@app.get("/api/{code}")
async def check_survey(code: str):
    submission = response_repo.get_response(code)
    if not submission:
        return {"status": "not_found"}
    if not submission.matching_question_ids:
        return {"status": "not_ready"}
    questions = [question_repo.get_question_by_id(question_id) for question_id in submission.matching_question_ids]
    return {"status": "ready", "matches": questions}


@app.post("/api/submit-survey")
async def submit_survey(submission: SurveySubmission, code: str | None):
    # Validate that all questions exist
    for response in submission.responses:
        if not question_repo.get_question_by_id(response.question_id):
            raise HTTPException(status_code=400, 
                              detail=f"Question with ID {response.question_id} not found")
    
    if code and code != "":
        first_submission = response_repo.get_response(code)
        if first_submission is None:
            submission_id = response_repo.save_response(submission)
            return {"status": "code_not_found", "submission_id": submission_id}
        else:
            question_ids = find_matches(first_submission, submission)
            response_repo.responses[code].matching_question_ids = question_ids
            questions = [question_repo.get_question_by_id(question_id) for question_id in question_ids]
            return {"status": "matching_completed", "matches": questions}
    else:  
        submission_id = response_repo.save_response(submission)
        return {"status": "saved", "submission_id": submission_id}


def find_matches(first_submission: SurveySubmission, second_submission: SurveySubmission) -> list[int]:
    first_submission_yes = set(
        question.question_id
        for question in first_submission.responses
        if question.answer
    )
    second_submission_yes = set(
        question.question_id
        for question in second_submission.responses
        if question.answer 
    )
    return list(first_submission_yes.intersection(second_submission_yes))
        

@app.get("api/survey/{survey_id}")
async def survey_result(survey_id: str):
    response_repo.get_all_responses

# HTML for the frontend
@app.get("/", response_class=HTMLResponse)
async def get_html():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sociological Survey</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            .question-container {
                margin-bottom: 20px;
                padding: 15px;
                border: 1px solid #ddd;
                border-radius: 5px;
            }
            .matching-result-container {
                margin-bottom: 20px;
                padding: 15px;
                border: 1px solid #ddd;
                border-radius: 5px;
            }
            .question-title {
                font-weight: bold;
                margin-bottom: 5px;
            }
            .question-description {
                color: #666;
                margin-bottom: 10px;
            }
            .options {
                display: flex;
                gap: 10px;
            }
            button {
                padding: 8px 16px;
                cursor: pointer;
            }
            #submit-btn {
                margin-top: 20px;
                padding: 10px 20px;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }
            #submit-btn:disabled {
                background-color: #cccccc;
                cursor: not-allowed;
            }
            #code-not-found {
                color: red;
            }
            .hidden {
                display: none;
            }
        </style>
    </head>
    <body>
        <h1>Опросник</h1>

        <div id="survey-container">
            <div>
                <label for="code">Код для сравнения:</label>
                <input type="text" id="code" name="code">
            </div>
            <button id="check-btn">Проверить</button>
            <div id="questions-container"></div>
            <button id="submit-btn" disabled>Submit Survey</button>
        </div>
        
        <div id="code-not-found" class="hidden">
            <h3>Введённый код не найден</h3>
        </div>

        <div id="thank-you" class="hidden">
            <h2><div id="your-code">Ваш код: </div></h2>
            Передайте его партнёру для прохождения опроса и поиска совпадений
        </div>

        <div id="matching-result-container" class="hidden" ></div>
        
        <script>
            let questions = [];
            let answers = {};
            
            // Fetch questions from API
            async function fetchQuestions() {
                try {
                    const response = await fetch('/api/questions');
                    questions = await response.json();
                    renderQuestions();
                } catch (error) {
                    console.error('Error fetching questions:', error);
                }
            }
            
            // Render questions to the page
            function renderQuestions() {
                const container = document.getElementById('questions-container');
                
                questions.forEach(question => {
                    const questionDiv = document.createElement('div');
                    questionDiv.className = 'question-container';
                    questionDiv.setAttribute('data-id', question.id);
                    
                    const titleDiv = document.createElement('div');
                    titleDiv.className = 'question-title';
                    titleDiv.textContent = question.question;
                    
                    const descriptionDiv = document.createElement('div');
                    descriptionDiv.className = 'question-description';
                    descriptionDiv.textContent = question.description;
                    
                    const optionsDiv = document.createElement('div');
                    optionsDiv.className = 'options';
                    
                    const yesBtn = document.createElement('button');
                    yesBtn.textContent = 'Yes';
                    yesBtn.onclick = () => selectAnswer(question.id, true, yesBtn, noBtn);
                    
                    const noBtn = document.createElement('button');
                    noBtn.textContent = 'No';
                    noBtn.onclick = () => selectAnswer(question.id, false, noBtn, yesBtn);
                    
                    optionsDiv.appendChild(yesBtn);
                    optionsDiv.appendChild(noBtn);
                    
                    questionDiv.appendChild(titleDiv);
                    questionDiv.appendChild(descriptionDiv);
                    questionDiv.appendChild(optionsDiv);
                    
                    container.appendChild(questionDiv);
                });
            }
            
            function renderMatchingResult() {
                const container = document.getElementById('matching-result-container');
                
                questions.forEach(question => {
                    const questionDiv = document.createElement('div');
                    questionDiv.className = 'question-container';
                    questionDiv.setAttribute('data-id', question.id);
                    
                    const titleDiv = document.createElement('div');
                    titleDiv.className = 'question-title';
                    titleDiv.textContent = question.question;
                    
                    const descriptionDiv = document.createElement('div');
                    descriptionDiv.className = 'question-description';
                    descriptionDiv.textContent = question.description;
                    
                    questionDiv.appendChild(titleDiv);
                    questionDiv.appendChild(descriptionDiv);
                    container.appendChild(questionDiv);
                });

                container.classList.remove("hidden")
                
            }

            // Handle answer selection
            function selectAnswer(questionId, answer, selectedBtn, otherBtn) {
                answers[questionId] = answer;
                
                selectedBtn.style.backgroundColor = '#4CAF50';
                selectedBtn.style.color = 'white';
                
                otherBtn.style.backgroundColor = '';
                otherBtn.style.color = '';
                
                // Enable submit button if all questions are answered
                if (Object.keys(answers).length === questions.length) {
                    document.getElementById('submit-btn').disabled = false;
                }
            }
            
            // Check survey
            async function checkSurvey() {
                code = document.getElementById('code').value
                const response = await fetch('/api/' + code)
                if (response.ok) {
                    const data = await response.json()
                    console.log(data)
                    if (data['status'] == 'ready') {
                        questions = data['matches']
                        renderMatchingResult()
                    } else {
                        alert("Пока нет двух результатов для этого кода")
                    }
                }
            }

            // Submit survey
            async function submitSurvey() {
                const responses = Object.keys(answers).map(questionId => ({
                    question_id: parseInt(questionId),
                    answer: answers[questionId]
                }));
                
                try {
                    code = document.getElementById('code').value
                    console.log('Code: ' + code)
                    request_path = '/api/submit-survey?code=' + code
                    const response = await fetch(request_path, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ responses })
                    });
                    
                    if (response.ok) {
                        const data = await response.json()
                        console.log(data)
                        document.getElementById('survey-container').classList.add('hidden');
                        
                        if (data['status'] == 'code_not_found') {
                            document.getElementById('code-not-found').classList.remove('hidden');
                            document.getElementById('your-code').textContent += data['submission_id']
                            document.getElementById('thank-you').classList.remove('hidden');
                        } else if (data['status'] == 'saved') {
                            document.getElementById('your-code').textContent += data['submission_id']
                            document.getElementById('thank-you').classList.remove('hidden');
                        } else {
                            questions = data['matches']
                            renderMatchingResult()
                        }
                        

                    } else {
                        console.error('Error submitting survey');
                    }
                } catch (error) {
                    console.error('Error submitting survey:', error);
                }
            }
            
            // Initialize
            document.addEventListener('DOMContentLoaded', () => {
                fetchQuestions();
                document.getElementById('submit-btn').addEventListener('click', submitSurvey);
                document.getElementById('check-btn').addEventListener('click', checkSurvey);
            });
        </script>
    </body>
    </html>
    """

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)