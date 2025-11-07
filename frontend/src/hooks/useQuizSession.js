import { useCallback, useEffect, useRef, useState } from "react";
import { QuizAPI } from "../api/quiz.api";

/**
 * Hook to drive a single quiz session (3 Q per level).
 * Keeps answers client-side, but correctness is checked server-side.
 */
export function useQuizSession({
  lessonId,
  topic = null,
  difficulty = 1,
  count = 3,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]); // [{ mediaUrl, choices }]
  const [answers, setAnswers] = useState([]); // array of indices or -1/null
  const [idx, setIdx] = useState(0);

  // kick off (start quiz)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        setIdx(0);
        setAnswers([]);

        const data = await QuizAPI.start({
          level: difficulty,
          topic,
          count,
        });

        if (!alive) return;
        setSessionId(data.sessionId);
        setQuestions(data.questions || []);
        setAnswers(Array((data.questions || []).length).fill(null));
      } catch (e) {
        if (alive) setError(String(e.message || e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [lessonId, topic, difficulty, count]);

  const total = questions.length;
  const current = questions[idx] || null;

  const selectChoice = useCallback(
    (choiceIdx) => {
      setAnswers((prev) => {
        const next = prev.slice();
        next[idx] = choiceIdx;
        return next;
      });
    },
    [idx]
  );

  // Ask server if current answer is correct.
  // If `givenChoice` is provided (e.g., -1 on timeout), use that instead of selected.
  const checkCurrent = useCallback(
    async (givenChoice = undefined) => {
      if (sessionId == null) return { correct: false, correctIdx: -1 };
      const choice =
        typeof givenChoice === "number"
          ? givenChoice
          : typeof answers[idx] === "number"
            ? answers[idx]
            : -1;

      const data = await QuizAPI.answer({
        sessionId,
        questionIndex: idx,
        choice,
      });
      return data; // { correct, correctIdx }
    },
    [sessionId, idx, answers]
  );

  const next = useCallback(() => {
    setIdx((i) => Math.min(i + 1, total - 1));
  }, [total]);

  const finish = useCallback(async () => {
    if (!sessionId) return null;
    return await QuizAPI.finish({ sessionId });
  }, [sessionId]);

  return {
    loading,
    error,
    current,
    total,
    idx,
    answers,
    selectChoice,
    checkCurrent,
    next,
    finish,
    setIdx,
  };
}
