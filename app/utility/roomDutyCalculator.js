
//Example Data

const Teachers = [
	{ name: "Dr. Diddi Kumara Swamy", assignedShifts: [0, 1, 1] },
	{ name: "Dr. Sourabh Jain", assignedShifts: [0, 1, 1] },
	{ name: "Dr. Bhoopesh Singh Bhati", assignedShifts: [1, 0, 1] },
	{ name: "Dr. Wakar Ahamad", assignedShifts: [1, 1, 0] },
	{ name: "Dr. Vinay Pathak", assignedShifts: [1, 1, 0] },
];

const initialRoomData = [
	{ roomNo: 2501, roomFloor: 1, facultyRequired: [2, 2, 2] },
	{ roomNo: 2502, roomFloor: 2, facultyRequired: [1, 1, 0] },
	{ roomNo: 2503, roomFloor: 3, facultyRequired: [0, 1, 1] },
];

// Function to shuffle an array
function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
	}
}

export async function assignTeachers(teachers, rooms) {
	console.log("Arguments: Teacg",teachers)
	console.log("Arguments: Teacg",teachers.length)
	// console.log("Arguments: room",rooms)
	// console.log("availableTeachers:",teachers.length)
	// Iterate over each room
	rooms.forEach(room => {
		room.allotedTeachers = []; // Initialize array for each room's alloted teachers

		// For each shift in the room
		room.facultyRequired.forEach((facultyCount, shiftIndex) => {
			// Create a list of available teachers for this shift
			let availableTeachers = teachers.filter(teacher => teacher.assignedShifts[shiftIndex] === 1);

			// Shuffle available teachers
			// console.log("availableTeachers:",teachers[0].assignedShifts[0])
			shuffleArray(availableTeachers);
			// Assign required number of teachers to the current shift
			const assignedTeachers = availableTeachers.slice(0, facultyCount).map(teacher => {
				// Set the assigned shift of the teacher to 0
				const teacherIndex = teachers.findIndex(t => t.name === teacher.name);
				teachers[teacherIndex].assignedShifts[shiftIndex] = 0;

				return teacher.name;
			});

			// Add the assigned teachers for this shift to the room
			room.allotedTeachers.push(assignedTeachers);
		});
	});
	console.log("Rooms:",rooms)
	return rooms;
}

// const result = assignTeachers(Teachers,initialRoomData)
// console.dir(result,{depth:null})
