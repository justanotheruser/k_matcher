import { useAppSelector } from "../../app/hooks";
import { selectSubmissionResult } from "./questionsSlice";

const SubmissionResultSuccess = () => {
  const submissionResult = useAppSelector(selectSubmissionResult);

  if (!submissionResult) {
    return null;
  }

  return (
    <div className="flex justify-center">
      <div className="text-lg font-semibold p-6 rounded-lg max-w-2xl text-center bg-green-900/20 border border-green-500 text-green-300">
        Your code is: <span className="font-bold">{submissionResult.id}</span>
        <br />
        Give{" "}
        <a
          href={`/${submissionResult.id}`}
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

export default SubmissionResultSuccess;
