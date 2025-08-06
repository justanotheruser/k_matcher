import { useAppSelector } from "../app/hooks";
import {
  selectSubmissionResult,
  selectSubmissionSuccess,
} from "../features/questions/questionsSlice";
import SubmissionResultSuccess from "./SubmissionResultSuccess";
import SubmissionResultError from "./SubmissionResultError";

const SubmissionResult = () => {
  const submissionResult = useAppSelector(selectSubmissionResult);
  const isSubmissionSuccess = useAppSelector(selectSubmissionSuccess);

  if (!submissionResult) {
    return null;
  }

  return isSubmissionSuccess ? (
    <SubmissionResultSuccess />
  ) : (
    <SubmissionResultError />
  );
};

export default SubmissionResult;
