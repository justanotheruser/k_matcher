import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import NotFound from "./components/NotFound";
import Questionnaire from "./features/questions/Questionnaire";
import ResultView from "./features/results/ResultView";

function MainApp() {
  return <Questionnaire />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Main app route */}
        <Route path="/" element={<MainApp />} />

        {/* Result route - accepts any string as resultId */}
        <Route path="/:resultId" element={<ResultView />} />

        {/* 404 route */}
        <Route path="/not_found" element={<NotFound />} />

        {/* Catch all other routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
