import { useState, useMemo, useEffect } from 'react'
import CourseForm from './components/CourseForm'
import CourseList from './components/CourseList'
import PrerequisiteGraph from './components/PrerequisiteGraph'
import './App.css'

// Generate a unique ID for courses
const generateUniqueId = () => {
  return Math.random().toString(36).substr(2, 9)
}

function App() {
  // Initialize courses from localStorage if available
  const [courses, setCourses] = useState(() => {
    const savedCourses = localStorage.getItem('courses')
    if (savedCourses) {
      try {
        const parsedCourses = JSON.parse(savedCourses)
        // Validate the data structure
        if (!Array.isArray(parsedCourses)) {
          console.error('Invalid courses data in localStorage')
          return []
        }
        return parsedCourses
      } catch (e) {
        console.error('Error parsing courses from localStorage:', e)
        return []
      }
    }
    return []
  })
  const [editingId, setEditingId] = useState(null)
  const [showGraph, setShowGraph] = useState(false)

  // Save courses to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('courses', JSON.stringify(courses))
    } catch (e) {
      console.error('Error saving courses to localStorage:', e)
    }
  }, [courses])

  // Helper function to get course by ID
  const getCourseById = (id) => courses.find(course => course.id === id)

  // Helper function to get course by name
  const getCourseByName = (name) => courses.find(course => course.course_name.toLowerCase() === name.toLowerCase())

  // Topological sort function
  const topologicalSort = (courses) => {
    // Build graph and in-degree map
    const graph = new Map();
    const inDegree = new Map();
    const courseMap = new Map(courses.map(c => [c.id, c]));

    // Initialize graph and in-degree
    courses.forEach(course => {
      graph.set(course.id, []);
      inDegree.set(course.id, 0);
    });

    // Fill graph and in-degree
    courses.forEach(course => {
      course.course_prerequisites.forEach(prereqId => {
        if (graph.has(prereqId)) {
          graph.get(prereqId).push(course.id);
          inDegree.set(course.id, (inDegree.get(course.id) || 0) + 1);
        }
      });
    });

    // Initialize queue with nodes that have in-degree 0
    const queue = Array.from(courses)
      .filter(course => inDegree.get(course.id) === 0)
      .sort((a, b) => a.course_name.localeCompare(b.course_name));

    const result = [];

    // Process the queue
    while (queue.length > 0) {
      const course = queue.shift();
      result.push(course);
      
      // For each node that depends on this course
      (graph.get(course.id) || []).forEach(dependentId => {
        inDegree.set(dependentId, inDegree.get(dependentId) - 1);
        if (inDegree.get(dependentId) === 0) {
          const dependentCourse = courseMap.get(dependentId);
          if (dependentCourse) {
            queue.push(dependentCourse);
            queue.sort((a, b) => a.course_name.localeCompare(b.course_name));
          }
        }
      });
    }

    // If we couldn't process all courses, there's a cycle
    if (result.length !== courses.length) {
      console.warn('Cycle detected in prerequisites!');
      return courses;
    }

    return result;
  }

  // Use memoized sorted courses
  const sortedCourses = useMemo(() => topologicalSort(courses), [courses])

  const addCourse = (courseName, prerequisiteNames) => {
    const existingCourse = getCourseByName(courseName)

    if (existingCourse) {
      alert('This course already exists!')
      return
    }

    // Create new courses for prerequisites that don't exist yet
    const newPrerequisites = []
    prerequisiteNames.forEach(prereqName => {
      let prereqCourse = getCourseByName(prereqName)
      
      if (!prereqCourse) {
        const newId = generateUniqueId()
        prereqCourse = {
          id: newId,
          course_name: prereqName,
          course_prerequisites: []
        }
        setCourses(prevCourses => [...prevCourses, prereqCourse])
      }
      newPrerequisites.push(prereqCourse.id)
    })

    // Add the main course
    const newCourse = {
      id: generateUniqueId(),
      course_name: courseName,
      course_prerequisites: newPrerequisites
    }
    setCourses(prevCourses => [...prevCourses, newCourse])
  }

  const editCourse = (courseId, courseName, prerequisiteNames) => {
    const courseToEdit = getCourseById(courseId)
    if (!courseToEdit) return

    const duplicateCourse = courses.find(
      course => course.id !== courseId && course.course_name.toLowerCase() === courseName.toLowerCase()
    )

    if (duplicateCourse) {
      alert('This course name already exists!')
      return
    }

    // Create new courses for prerequisites that don't exist yet
    const newPrerequisites = []
    prerequisiteNames.forEach(prereqName => {
      let prereqCourse = getCourseByName(prereqName)
      
      if (!prereqCourse) {
        const newId = generateUniqueId()
        prereqCourse = {
          id: newId,
          course_name: prereqName,
          course_prerequisites: []
        }
        setCourses(prevCourses => [...prevCourses, prereqCourse])
      }
      newPrerequisites.push(prereqCourse.id)
    })

    // Update the course
    setCourses(prevCourses => prevCourses.map(course => 
      course.id === courseId 
        ? { ...course, course_name: courseName, course_prerequisites: newPrerequisites }
        : course
    ))
    
    setEditingId(null)
  }

  const deleteCourse = (courseId) => {
    if (confirm('Are you sure you want to delete this course?')) {
      // Remove the course and update all prerequisites that reference it
      setCourses(prevCourses => {
        const updatedCourses = prevCourses
          .filter(course => course.id !== courseId)
          .map(course => ({
            ...course,
            course_prerequisites: course.course_prerequisites.filter(prereqId => prereqId !== courseId)
          }))
        return updatedCourses
      })
    }
  }

  const resetAllCourses = () => {
    if (confirm('Are you sure you want to clear all courses? This action cannot be undone.')) {
      setCourses([])
      localStorage.removeItem('courses')
    }
  }

  const toggleGraph = () => {
    setShowGraph(!showGraph)
  }

  return (
    <div className="container">
      <div className="left-panel">
        <h1>Course Prerequisites Visualizer</h1>
        <CourseForm
          onAddCourse={addCourse}
          onEditCourse={editCourse}
          editingId={editingId}
          setEditingId={setEditingId}
          courses={courses}
          onGenerateGraph={toggleGraph}
        />
        <CourseList
          courses={sortedCourses}
          onEdit={setEditingId}
          onDelete={deleteCourse}
        />
        <button 
          className="reset-btn" 
          onClick={resetAllCourses}
          style={{ marginTop: '1rem', width: '100%' }}
        >
          Clear All Courses
        </button>
      </div>
      {showGraph && (
        <div className="right-panel">
          <PrerequisiteGraph 
            courses={courses} 
            onNodeClick={setEditingId}
          />
        </div>
      )}
    </div>
  )
}

export default App
