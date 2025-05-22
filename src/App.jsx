import { useState, useMemo } from 'react'
import CourseForm from './components/CourseForm'
import CourseList from './components/CourseList'
import PrerequisiteGraph from './components/PrerequisiteGraph'
import './App.css'

function App() {
  const [courses, setCourses] = useState([])
  const [editingIndex, setEditingIndex] = useState(-1)
  const [showGraph, setShowGraph] = useState(false)

  // Topological sort function
  const topologicalSort = (courses) => {
    // Collect all unique course names and prerequisites
    const allNodes = new Set();
    courses.forEach(course => {
      allNodes.add(course.course_name);
      course.course_prerequisites.forEach(prereq => allNodes.add(prereq));
    });

    // Build graph and in-degree map for all nodes
    const graph = new Map();
    const inDegree = new Map();
    allNodes.forEach(node => {
      graph.set(node, []);
      inDegree.set(node, 0);
    });

    // Fill graph and in-degree
    courses.forEach(course => {
      course.course_prerequisites.forEach(prereq => {
        graph.get(prereq); // ensure prereq node exists
        graph.get(course.course_name).push(prereq);
        inDegree.set(prereq, inDegree.get(prereq)); // ensure prereq in-degree exists
        inDegree.set(course.course_name, inDegree.get(course.course_name)); // ensure course in-degree exists
        inDegree.set(prereq, inDegree.get(prereq) + 1);
      });
    });

    // Initialize queue with nodes that have in-degree 0
    const queue = Array.from(allNodes)
      .filter(node => inDegree.get(node) === 0)
      .sort((a, b) => a.localeCompare(b));

    const result = [];
    const courseMap = new Map(courses.map(c => [c.course_name, c]));

    // Process the queue
    while (queue.length > 0) {
      const node = queue.shift();
      if (courseMap.has(node)) {
        result.push(courseMap.get(node));
      }
      // For each node that depends on this node
      courses.forEach(dependent => {
        if (dependent.course_prerequisites.includes(node)) {
          inDegree.set(dependent.course_name, inDegree.get(dependent.course_name) - 1);
          if (inDegree.get(dependent.course_name) === 0) {
            queue.push(dependent.course_name);
            queue.sort((a, b) => a.localeCompare(b));
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

  const addCourse = (courseName, prerequisites) => {
    const existingIndex = courses.findIndex(
      course => course.course_name.toLowerCase() === courseName.toLowerCase()
    )

    if (existingIndex !== -1) {
      alert('This course already exists!')
      return
    }

    // Create new courses for prerequisites that don't exist yet
    const newPrerequisites = [...prerequisites]
    prerequisites.forEach(prereq => {
      const prereqExists = courses.some(
        course => course.course_name.toLowerCase() === prereq.toLowerCase()
      )
      
      if (!prereqExists) {
        setCourses(prevCourses => [...prevCourses, {
          course_name: prereq,
          course_prerequisites: []
        }])
      }
    })

    // Add the main course
    setCourses(prevCourses => [...prevCourses, {
      course_name: courseName,
      course_prerequisites: newPrerequisites
    }])
  }

  const editCourse = (index, courseName, prerequisites) => {
    const duplicateIndex = courses.findIndex(
      (course, i) => i !== index && course.course_name.toLowerCase() === courseName.toLowerCase()
    )

    if (duplicateIndex !== -1) {
      alert('This course name already exists!')
      return
    }

    // Find new prerequisites that need to be created
    const newPrereqCourses = prerequisites
      .filter(prereq => !courses.some(
        course => course.course_name.toLowerCase() === prereq.toLowerCase()
      ))
      .map(prereq => ({
        course_name: prereq,
        course_prerequisites: []
      }))

    // Update courses with both new prerequisite courses and the edited course
    setCourses(prevCourses => {
      const updatedCourses = [...prevCourses]
      updatedCourses[index] = {
        course_name: courseName,
        course_prerequisites: prerequisites
      }
      return [...updatedCourses, ...newPrereqCourses]
    })
    
    setEditingIndex(-1)
  }

  const deleteCourse = (index) => {
    if (confirm('Are you sure you want to delete this course?')) {
      setCourses(prevCourses => prevCourses.filter((_, i) => i !== index))
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
          editingIndex={editingIndex}
          setEditingIndex={setEditingIndex}
          courses={courses}
          onGenerateGraph={toggleGraph}
        />
        <CourseList
          courses={sortedCourses}
          onEdit={setEditingIndex}
          onDelete={deleteCourse}
        />
      </div>
      {showGraph && (
        <div className="right-panel">
          <PrerequisiteGraph courses={courses} />
        </div>
      )}
    </div>
  )
}

export default App
