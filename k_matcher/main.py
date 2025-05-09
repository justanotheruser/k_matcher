import csv
import os
from abc import ABC, abstractmethod

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
    def save_response(self, response: SurveySubmission) -> bool:
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
        self.responses = []
    
    def save_response(self, response: SurveySubmission) -> bool:
        self.responses.append(response)
        return True
    
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

@app.post("/api/submit-survey")
async def submit_survey(submission: SurveySubmission):
    # Validate that all questions exist
    for response in submission.responses:
        if not question_repo.get_question_by_id(response.question_id):
            raise HTTPException(status_code=400, 
                              detail=f"Question with ID {response.question_id} not found")
    
    success = response_repo.save_response(submission)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to save response")
    
    return {"status": "success"}

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
            .hidden {
                display: none;
            }
        </style>
    </head>
    <body>
        <h1>Sociological Survey</h1>
        
        <div id="survey-container">
            <div id="questions-container"></div>
            <button id="submit-btn" disabled>Submit Survey</button>
        </div>
        
        <div id="thank-you" class="hidden">
            <h2>Thank you for completing the survey!</h2>
        </div>
        
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
            
            // Submit survey
            async function submitSurvey() {
                const responses = Object.keys(answers).map(questionId => ({
                    question_id: parseInt(questionId),
                    answer: answers[questionId]
                }));
                
                try {
                    const response = await fetch('/api/submit-survey', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ responses })
                    });
                    
                    if (response.ok) {
                        document.getElementById('survey-container').classList.add('hidden');
                        document.getElementById('thank-you').classList.remove('hidden');
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
            });
        </script>
    </body>
    </html>
    """

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)