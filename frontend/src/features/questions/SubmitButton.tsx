import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectIsSubmitting, submitAnswers } from "./questionsSlice";

const SubmitButton = () => {
  const dispatch = useAppDispatch();
  const isSubmitting = useAppSelector(selectIsSubmitting);

  const handleSubmit = () => {
    dispatch(submitAnswers());
  };

  return (
    <div className="mt-8 text-center">
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors duration-200"
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
};

export default SubmitButton;
