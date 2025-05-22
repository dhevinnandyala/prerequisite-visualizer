import { useState, useEffect } from 'react'

function CourseForm({ onAddCourse, onEditCourse, editingId, setEditingId, courses, onGenerateGraph }) {
  const [courseName, setCourseName] = useState('')
  const [prerequisites, setPrerequisites] = useState([])
  const [prerequisiteInput, setPrerequisiteInput] = useState('')

  useEffect(() => {
    if (editingId !== null) {
      const course = courses.find(c => c.id === editingId)
      if (course) {
        setCourseName(course.course_name)
        setPrerequisites([...course.course_prerequisites])
      }
    }
  }, [editingId, courses])

  // Add global keyboard event listener for Cmd/Ctrl + Enter
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        // Only submit if we have a course name
        if (courseName.trim()) {
          handleSubmit(e)
        }
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [editingId, courseName, prerequisites]) // Include dependencies that handleSubmit uses

  const addPrerequisite = () => {
    const prerequisite = prerequisiteInput.trim()
    if (prerequisite) {
      setPrerequisites([...prerequisites, prerequisite])
      setPrerequisiteInput('')
    }
  }

  const removePrerequisite = (index) => {
    setPrerequisites(prerequisites.filter((_, i) => i !== index))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!courseName.trim()) return

    if (editingId === null) {
      onAddCourse(courseName, prerequisites)
    } else {
      onEditCourse(editingId, courseName, prerequisites)
    }

    // Reset form
    setCourseName('')
    setPrerequisites([])
    setPrerequisiteInput('')
  }

  const handleCancel = () => {
    setEditingId(null)
    setCourseName('')
    setPrerequisites([])
    setPrerequisiteInput('')
  }

  const handlePrerequisiteKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addPrerequisite()
    }
  }

  const handleCourseNameKeyDown = (e) => {
    if (e.key === 'Enter' && !prerequisiteInput.trim()) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="courseName">Course Name:</label>
        <input
          type="text"
          id="courseName"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          onKeyDown={handleCourseNameKeyDown}
          placeholder="Enter course name"
        />
      </div>

      <div className="form-group">
        <label htmlFor="prerequisite">Prerequisite:</label>
        <div className="prerequisite-input-group">
          <input
            type="text"
            id="prerequisite"
            value={prerequisiteInput}
            onChange={(e) => setPrerequisiteInput(e.target.value)}
            onKeyDown={handlePrerequisiteKeyDown}
            placeholder="Enter prerequisite"
          />
          <button type="button" onClick={addPrerequisite}>Add</button>
        </div>
      </div>

      {prerequisites.length > 0 && (
        <div className="prerequisites-list">
          {prerequisites.map((prereq, index) => (
            <div key={index} className="prerequisite-item">
              <span>{prereq}</span>
              <button type="button" onClick={() => removePrerequisite(index)}>Remove</button>
            </div>
          ))}
        </div>
      )}

      <div className="form-actions">
        {editingId === null ? (
          <button type="submit" id="addCourseBtn">Add Course</button>
        ) : (
          <>
            <button type="submit" id="saveEditBtn">Save Changes</button>
            <button type="button" id="cancelEditBtn" onClick={handleCancel}>Cancel</button>
          </>
        )}
        <button type="button" id="generateGraphBtn" onClick={onGenerateGraph} className="generate-graph-btn">
          Generate Graph
        </button>
      </div>
    </form>
  )
}

export default CourseForm 