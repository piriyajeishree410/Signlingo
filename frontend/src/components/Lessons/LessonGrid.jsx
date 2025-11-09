import { useState, useEffect } from "react";
import LessonCard from "./LessonCard";
import LessonDetailsPanel from "./LessonDetailsPanel";
import { useLessons } from "../../hooks/useLessons";
import { fetchAllUserProgress } from "../../api/userLessons.api";
import styles from "./Lessons.module.css";

export default function LessonGrid() {
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const { lessons, lesson, loading, error } = useLessons(selectedLessonId);
  const [progressMap, setProgressMap] = useState({});

  // ✅ Fetch user's progress when component loads
  useEffect(() => {
    async function loadProgress() {
      try {
        const userId = sessionStorage.getItem("userId"); // pull from storage if saved at login
        const data = await fetchAllUserProgress(userId);

        console.log("Fetched progress data:", data);

        // create a map: { lessonId: true }
        const map = {};
        if (Array.isArray(data)) {
          data.forEach((item) => {
            map[item.lessonId] = true;
          });
        } else if (Array.isArray(data?.progressList)) {
          data.progressList.forEach((p) => {
            map[p.lessonId] = true;
          });
        }

        setProgressMap(map);
        console.log("Progress map:", map);
      } catch (err) {
        console.error("Failed to load user progress:", err);
      }
    }

    if (lessons.length > 0) loadProgress();
  }, [lessons]);

  if (loading) return <p>Loading lessons...</p>;
  if (error) return <p>Error: {error}</p>;

  const layoutClass = selectedLessonId
    ? `${styles.layout} ${styles.panelOpen}`
    : styles.layout;

  return (
    <div className={layoutClass}>
      <div className={styles.gridContainer}>
        <div className={styles.grid}>
          {lessons.map((l, i) => (
            <LessonCard
              key={l._id}
              lesson={{
                ...l,
                started: !!progressMap[l._id],
                color: ["#216869", "#49a078", "#9cc5a1", "#5b8a72"][i % 4],
              }}
              onClick={() => setSelectedLessonId(l._id)}
            />
          ))}
        </div>
      </div>

      {selectedLessonId && lesson && (
      <LessonDetailsPanel
      lesson={{
        ...lesson,
        started: !!progressMap[lesson._id],
      }}
      onClose={() => setSelectedLessonId(null)}
      />
    )}
    </div>
  );
}
