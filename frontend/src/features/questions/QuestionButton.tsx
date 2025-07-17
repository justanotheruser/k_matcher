interface QuestionButtonProps {
  questionId: number;
  text: string
  isSelected: boolean
  onSelected: () => void;
}

export function QuestionButton ({questionId, text, isSelected, onSelected}: QuestionButtonProps) {
  const classes = "text-gray-900 bg-white boroder border-gray-300  hover:bg-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
  const activeClasses = "outline-none ring-4 ring-gray-500"
  return (
    <button
      className={isSelected ? classes + " " + activeClasses : classes}
      key={text}
      onClick={() => onSelected()}
    >
      {text}
    </button>
  );
}

export default QuestionButton;
