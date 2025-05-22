function CourseList({ courses, onEdit, onDelete }) {
  return (
    <div id="courseData">
      {courses.map((course, index) => (
        <div key={index} className="course-item">
          <div className="course-header">
            <h3>{course.course_name}</h3>
            <div className="course-actions">
              <button className="edit-btn" onClick={() => onEdit(index)}>Edit</button>
              <button className="delete-btn" onClick={() => onDelete(index)}>Delete</button>
            </div>
          </div>
          <div className="prerequisites-display">
            <strong>Prerequisites:</strong>
            {course.course_prerequisites.length > 0 ? (
              <ul>
                {course.course_prerequisites.map((prereq, i) => (
                  <li key={i}>{prereq}</li>
                ))}
              </ul>
            ) : (
              <p>No prerequisites</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default CourseList 