// Store the courses data
let courses = [];

// Store temporary prerequisites while adding a course
let tempPrerequisites = [];

// Store the index of the course being edited
let editingIndex = -1;

// Function to add a prerequisite to the temporary list
function addPrerequisite() {
    const prerequisiteInput = document.getElementById('prerequisite');
    const prerequisite = prerequisiteInput.value.trim();
    
    if (prerequisite) {
        tempPrerequisites.push(prerequisite);
        updatePrerequisitesList();
        prerequisiteInput.value = ''; // Clear the input
    }
}

// Function to remove a prerequisite from the temporary list
function removePrerequisite(index) {
    tempPrerequisites.splice(index, 1);
    updatePrerequisitesList();
}

// Function to update the prerequisites list in the UI
function updatePrerequisitesList() {
    const prerequisitesList = document.getElementById('prerequisitesList');
    prerequisitesList.innerHTML = '';
    
    tempPrerequisites.forEach((prerequisite, index) => {
        const div = document.createElement('div');
        div.className = 'prerequisite-item';
        div.innerHTML = `
            <span>${prerequisite}</span>
            <button onclick="removePrerequisite(${index})">Remove</button>
        `;
        prerequisitesList.appendChild(div);
    });
}

// Function to add a course with its prerequisites
function addCourse() {
    const courseNameInput = document.getElementById('courseName');
    const courseName = courseNameInput.value.trim();
    
    if (courseName) {
        // Check for duplicate course
        const existingIndex = courses.findIndex(course => course.course_name.toLowerCase() === courseName.toLowerCase());
        
        if (existingIndex !== -1) {
            alert('This course already exists!');
            return;
        }

        // Create a new course object
        const course = {
            course_name: courseName,
            course_prerequisites: [...tempPrerequisites]
        };
        
        // Add to courses array
        courses.push(course);
        
        // Update the display
        updateCourseList();
        
        // Clear the form
        courseNameInput.value = '';
        tempPrerequisites = [];
        updatePrerequisitesList();
    }
}

// Function to edit a course
function editCourse(index) {
    const course = courses[index];
    const courseNameInput = document.getElementById('courseName');
    
    // Set the form to edit mode
    courseNameInput.value = course.course_name;
    tempPrerequisites = [...course.course_prerequisites];
    updatePrerequisitesList();
    
    // Show edit buttons and hide add button
    document.getElementById('addCourseBtn').style.display = 'none';
    document.getElementById('saveEditBtn').style.display = 'inline-block';
    document.getElementById('cancelEditBtn').style.display = 'inline-block';
    
    // Store the index of the course being edited
    editingIndex = index;
}

// Function to save edited course
function saveEdit() {
    const courseNameInput = document.getElementById('courseName');
    const courseName = courseNameInput.value.trim();
    
    if (courseName) {
        // Check for duplicate course (excluding the current course being edited)
        const duplicateIndex = courses.findIndex((course, index) => 
            index !== editingIndex && course.course_name.toLowerCase() === courseName.toLowerCase()
        );
        
        if (duplicateIndex !== -1) {
            alert('This course name already exists!');
            return;
        }

        // Update the course
        courses[editingIndex] = {
            course_name: courseName,
            course_prerequisites: [...tempPrerequisites]
        };
        
        // Update the display
        updateCourseList();
        
        // Reset the form
        cancelEdit();
    }
}

// Function to cancel editing
function cancelEdit() {
    // Clear the form
    document.getElementById('courseName').value = '';
    tempPrerequisites = [];
    updatePrerequisitesList();
    
    // Reset edit mode
    editingIndex = -1;
    
    // Show add button and hide edit buttons
    document.getElementById('addCourseBtn').style.display = 'inline-block';
    document.getElementById('saveEditBtn').style.display = 'none';
    document.getElementById('cancelEditBtn').style.display = 'none';
}

// Function to delete a course
function deleteCourse(index) {
    if (confirm('Are you sure you want to delete this course?')) {
        courses.splice(index, 1);
        updateCourseList();
    }
}

// Function to update the course list display
function updateCourseList() {
    const courseData = document.getElementById('courseData');
    courseData.innerHTML = '';
    
    courses.forEach((course, index) => {
        const courseDiv = document.createElement('div');
        courseDiv.className = 'course-item';
        courseDiv.innerHTML = `
            <div class="course-header">
                <h3>${course.course_name}</h3>
                <div class="course-actions">
                    <button class="edit-btn" onclick="editCourse(${index})">Edit</button>
                    <button class="delete-btn" onclick="deleteCourse(${index})">Delete</button>
                </div>
            </div>
            <div class="prerequisites-display">
                <strong>Prerequisites:</strong>
                ${course.course_prerequisites.length > 0 
                    ? `<ul>${course.course_prerequisites.map(prereq => `<li>${prereq}</li>`).join('')}</ul>`
                    : '<p>No prerequisites</p>'}
            </div>
        `;
        courseData.appendChild(courseDiv);
    });
} 