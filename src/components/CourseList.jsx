function CourseList({ courses, onEdit, onDelete }) {
  // Create a map of course IDs to course names for quick lookup
  const courseMap = new Map(courses.map(course => [course.id, course.course_name]));

  return (
    <div id="courseData">
      {courses.map((course) => (
        <div key={course.id} className="course-item">
          <div className="course-header">
            <h3>{course.course_name}</h3>
            <div className="course-actions">
              <button className="edit-btn" onClick={() => onEdit(course.id)}>Edit</button>
              <button className="delete-btn" onClick={() => onDelete(course.id)}>Delete</button>
            </div>
          </div>
          <div className="prerequisites-display">
            <strong>Prerequisites:</strong>
            {course.course_prerequisites.length > 0 ? (
              <ul>
                {course.course_prerequisites.map((prereqId, i) => (
                  <li key={i}>{courseMap.get(prereqId) || 'Unknown Course'}</li>
                ))}
              </ul>
            ) : (
              <p>No prerequisites</p>
            )}
          </div>
        </div>
      ))}
      <div className="how-to-use">
        <h3>How to Use</h3>
        <p>This tool helps visualize course prerequisites in a skill-tree graph. Add courses by typing their name and pressing Enter or the Add Course button. For prerequisites, type each prerequisite name and press Enter to add it. Use Cmd+Enter to save a course. Edit courses by clicking the Edit button on their card or clicking them in the graph visualization. Click generate graph to see the skill-tree graph.</p>
      </div>
    </div>
  )
}

export default CourseList 