import { useState, useEffect, useRef } from 'react'

function CourseForm({ onAddCourse, onEditCourse, editingId, setEditingId, courses, onGenerateGraph }) {
  const [courseName, setCourseName] = useState('')
  const [prerequisites, setPrerequisites] = useState([])
  const [prerequisiteInput, setPrerequisiteInput] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionsRef = useRef(null)

  useEffect(() => {
    if (editingId !== null) {
      const course = courses.find(c => c.id === editingId)
      if (course) {
        setCourseName(course.course_name)
        // Create the course map and convert prerequisite IDs to names
        const courseMap = new Map(courses.map(c => [c.id, c.course_name]))
        setPrerequisites(course.course_prerequisites.map(prereqId => courseMap.get(prereqId) || 'Unknown Course'))
      }
    } else {
      // Reset form when not editing
      setCourseName('')
      setPrerequisites([])
      setPrerequisiteInput('')
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
  }, [editingId, courseName, prerequisites])

  // Handle clicks outside suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filterSuggestions = (input) => {
    const inputLower = input.toLowerCase()
    return courses
      .filter(course => 
        course.course_name.toLowerCase().includes(inputLower) &&
        !prerequisites.includes(course.course_name)
      )
      .map(course => course.course_name)
  }

  const handlePrerequisiteInputChange = (e) => {
    const value = e.target.value
    setPrerequisiteInput(value)
    
    if (value.trim()) {
      const filtered = filterSuggestions(value)
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setPrerequisiteInput(suggestion)
    setShowSuggestions(false)
  }

  const addPrerequisite = () => {
    const prerequisite = prerequisiteInput.trim()
    if (prerequisite && !prerequisites.includes(prerequisite)) {
      setPrerequisites([...prerequisites, prerequisite])
      setPrerequisiteInput('')
      setSuggestions([])
      setShowSuggestions(false)
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
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleCancel = () => {
    setEditingId(null)
    setCourseName('')
    setPrerequisites([])
    setPrerequisiteInput('')
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handlePrerequisiteKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (showSuggestions && suggestions.length > 0) {
        handleSuggestionClick(suggestions[0])
      } else {
        addPrerequisite()
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
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
        <div className="prerequisite-input-group" ref={suggestionsRef}>
          <div className="prerequisite-input-wrapper">
            <input
              type="text"
              id="prerequisite"
              value={prerequisiteInput}
              onChange={handlePrerequisiteInputChange}
              onKeyDown={handlePrerequisiteKeyDown}
              placeholder="Enter prerequisite"
              autoComplete="off"
            />
            {showSuggestions && (
              <div className="suggestions-dropdown">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
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