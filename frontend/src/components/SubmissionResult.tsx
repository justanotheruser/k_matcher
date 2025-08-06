import { useAppSelector } from "../app/hooks";
import {
  selectSubmissionResult,
  selectSubmissionSuccess,
} from "../features/questions/questionsSlice";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const SubmissionResult = () => {
  const submissionResult = useAppSelector(selectSubmissionResult);
  const isSubmissionSuccess = useAppSelector(selectSubmissionSuccess);

  if (!submissionResult) {
    return null;
  }

  return (
    <div className="flex justify-center">
      <div
        className={`text-lg font-semibold p-6 rounded-lg max-w-2xl text-center ${
          isSubmissionSuccess
            ? "bg-green-900/20 border border-green-500 text-green-300"
            : "bg-red-900/20 border border-red-500 text-red-300"
        }`}
      >
        Your code is: <span className="font-bold">{submissionResult.id}</span>
        <br />
        Give{" "}
        <a
          href={`${BACKEND_BASE_URL}/${submissionResult.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          this link
        </a>{" "}
        to your partner. Results will be available after both of you submit
        answers.
      </div>
    </div>
  );
};

export default SubmissionResult;
