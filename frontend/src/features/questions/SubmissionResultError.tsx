import { useAppSelector } from "../../app/hooks";
import { selectSubmissionErrorMessage } from "./questionsSlice";

const SubmissionResultError = () => {
  const submissionErrorMessage = useAppSelector(selectSubmissionErrorMessage);

  return (
    <div className="flex justify-center">
      <div className="text-lg font-semibold p-6 rounded-lg max-w-2xl text-center bg-red-900/20 border border-red-500 text-red-300">
        {submissionErrorMessage || "Something went wrong"}
      </div>
    </div>
  );
};

export default SubmissionResultError;
