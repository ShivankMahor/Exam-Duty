function m(v, i, j, facultyDuties, totalNeededDuties, totalNeededHoliday) {
    if (i < 0) {
        // Check if all duties and holidays are satisfied
        if (facultyDuties.reduce((a, b) => a + b, 0) === 0 &&
            totalNeededDuties.reduce((a, b) => a + b, 0) === 0 &&
            totalNeededHoliday.reduce((a, b) => a + b, 0) === 0) {
            return true;
        }
        return false;
    }
    // Mark Duty
    if (facultyDuties[i] > 0 && totalNeededDuties[j] > 0) {
        v[i][j] = 1;
        facultyDuties[i] -= 1;
        totalNeededDuties[j] -= 1;

        if (j < v[0].length - 1) {
            if (m(v, i, j + 1, facultyDuties, totalNeededDuties, totalNeededHoliday)) {
                return true;
            }
        } else {
            if (m(v, i - 1, 0, facultyDuties, totalNeededDuties, totalNeededHoliday)) {
                return true;
            }
        }

        // Backtrack
        v[i][j] = -1; // Reset position
        facultyDuties[i] += 1;
        totalNeededDuties[j] += 1;
    }

    // Mark Holiday
    if (totalNeededHoliday[j] > 0) {
        totalNeededHoliday[j] -= 1;
        v[i][j] = 0; // Mark holiday (0 for holiday)

        // Recursion to next position
        if (j < v[0].length - 1) {
            if (m(v, i, j + 1, facultyDuties, totalNeededDuties, totalNeededHoliday)) {
                return true;
            }
        } else {
            if (m(v, i - 1, 0, facultyDuties, totalNeededDuties, totalNeededHoliday)) {
                return true;
            }
        }

        // Backtrack
        v[i][j] = -1; // Reset position
        totalNeededHoliday[j] += 1;
    }

    return false;
}

export async function main(teachers,shifts,totalNeededDuties) {
    console.log("Start:")
    const v = Array.from({ length: teachers }, () => Array(shifts).fill(-1));

    // Number of total duties required for each day (for 7 days)
    // const totalNeededDuties = [14, 14, 14, 14, 9, 14, 14];

    // Number of holidays required for each day
    const totalNeededHoliday = totalNeededDuties.map(duties => teachers - duties);

    // Total duties that need to be distributed among the teachers
    let totalduties = totalNeededDuties.reduce((a, b) => a + b, 0);

    // Faculty duties initialization (based on the distribution of total duties)
    let facultyDuties = Array(teachers).fill(0);

    let tempNoofTeachers = teachers;

    // Distribute duties among teachers
    for (let i = 0; i < teachers; i++) {
        // Distribute as evenly as possible using Math.ceil and adjust remaining duties
        const duty = Math.ceil(totalduties / tempNoofTeachers);
        facultyDuties[i] = duty;
        totalduties -= duty;
        tempNoofTeachers--;
    }

    // Reverse the array of faculty duties
    facultyDuties.reverse();

    // Print the size and distribution of faculty duties
    console.log("Size of Faculty Duties: " + facultyDuties.length);
    console.log("Faculty Duties Distribution: " + facultyDuties.join(' '));

    // Call the backtracking function 'm()'
    const solutionExists = m(v, teachers - 1, 0, facultyDuties, totalNeededDuties, totalNeededHoliday);

    // Print the result matrix
    if (solutionExists) {
        console.log("Solution exists!");
        v.forEach(row => console.log(row.join(' ')));
    } else {
        console.log("No solution found!");
    }
	return v
}

