"use client";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Car } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form"
import * as XLSX from "xlsx";
import { array, z } from "zod"
import { Separator } from "@/components/ui/separator";
import { assignTeachers } from '../utility/roomDutyCalculator'

type Teacher = {
  name: string;
  assignedShifts: number[];
};

export default function RoomAllotment(){
	const [shifts, setShifts] = useState<number | undefined>(1);
	const [rooms, setRooms] = useState<number | undefined>(1);
  const [file, setFile] = useState<File | null>(null);
	const formSchema = z.object({
		roomCount: z.number().min(1,{message:"Atleast 1 Room required"}),
		shiftCount: z.number().min(1,{message:"Atleast 1 Shift required"}),
		initialRoomData: z.array(z.object({
			roomNo : z.number(),
			roomFloor : z.number(), 
			requiredFaculty : z.number().min(1,{message:"Atlease 1 Faculty is required"}),
			facultyRequired : z.array(z.number())
		})),
		teacherDutyFile : z.any()
	})
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues:{
			roomCount: 1,
			shiftCount: 1,
			initialRoomData : [
				{
					roomNo : undefined,
					roomFloor : undefined,
					requiredFaculty : undefined,
					facultyRequired : Array(shifts).fill(1),
				}
			],
		}
	})

	async function updateCounts(values: z.infer<typeof formSchema>){
		console.log("values Before: ",values)
		const correctedValues = values.initialRoomData.map(room => {
			const updatedFacultyRequired = room.facultyRequired.map(item => (item>0 ? room.requiredFaculty : 0))
			return { ...room, facultyRequired : updatedFacultyRequired}
		})
		console.log("correctedValues After: ",correctedValues)
		return correctedValues
	}
	async function readFileValues(): Promise<Teacher[]> {
		return new Promise((resolve, reject) => {
			const Teachers: Teacher[] = [];
			const reader = new FileReader();
	
			reader.onload = (e) => {
				const result = e.target?.result;
				if (!result) {
					console.error("Error: No result from FileReader");
					return reject("Error: No result from FileReader");
				}
	
				const workbook = XLSX.read(result, { type: "binary" });
				const worksheet = workbook.Sheets[workbook.SheetNames[0]];
				if (!worksheet['!ref']) {
					console.error("Error: Worksheet has no reference range.");
					return reject("Error: Worksheet has no reference range.");
				}
	
				const range = XLSX.utils.decode_range(worksheet['!ref']);
				const lastRow = range.e.r;
				const lastCol = range.e.c;
	
				// Process rows and columns
				for (let i = 2; i <= lastRow - 2; i++) {
					const assignedShifts = [];
					const NameAddress = XLSX.utils.encode_cell({ r: i, c: 1 });
	
					for (let k = 3; k < lastCol; k++) {
						const cellAddress = XLSX.utils.encode_cell({ r: i, c: k });
						const cell = worksheet[cellAddress];
						if (cell) {
							assignedShifts.push(cell.v);
						} else {
							assignedShifts.push(null);
						}
					}
	
					const Name = worksheet[NameAddress]?.v;
					if (Name) {
						Teachers.push({ name: Name, assignedShifts });
					}
				}
	
				resolve(Teachers); // Resolve the promise with Teachers array
			};
	
			reader.onerror = () => {
				console.error("Error reading the file");
				reject("Error reading the file");
			};
	
			if (!file) {
				console.log("No file found");
				return reject("No file found");
			}
	
			reader.readAsBinaryString(file);
		});
	}
	
	// async function readFileValues(){
	// 	const Teachers:Teacher[] = []
	// 	const reader = new FileReader();
	// 	reader.onload = async (e)=>{
	// 		const result = e.target?.result;
	// 		if(!result){
	// 			console.error("Error: No result from FileReader");
  //       return;
	// 		}

	// 		const workbook = XLSX.read(result,{type:"binary"})
	// 		const worksheet = workbook.Sheets[workbook.SheetNames[0]];
	// 		if (!worksheet['!ref']) {
	// 			console.error("Error: Worksheet has no reference range.");
	// 			return;
	// 		}
	// 		const range = XLSX.utils.decode_range(worksheet['!ref']);
	// 		const lastRow = range.e.r; 
	// 		const lastCol = range.e.c;

	// 		// console.log("Last Row:", lastRow);
	// 		// console.log("Last Column:", lastCol);

			
	// 		for(let i = 2; i<=lastRow-2; i++){
	// 			const assignedShifts = [];
	// 			const NameAddress = XLSX.utils.encode_cell({ r: i, c: 1 });
  //   		for (let k = 3; k < 4; k++) {
	// 				const cellAddress = XLSX.utils.encode_cell({ r: i, c: k });  // Convert row and column to A1-style notation
	// 				const cell = worksheet[cellAddress];  // Access the cell using the A1-style address
	// 				if (cell) {
	// 					assignedShifts.push(cell.v);  // Push the cell value if it exists
	// 				} else {
	// 					assignedShifts.push(null);  // Push null or handle empty cells
	// 				}
  //   		}
	// 			const Name = worksheet[NameAddress].v;
  //   		// console.log(`Assigned shifts for row ${i}:`, assignedShifts);
	// 			Teachers.push({name:Name, assignedShifts})
	// 		}
	// 		// console.log(Teachers)
	// 	}
	// 	reader.onerror = () => {
	// 		console.error("Error reading the file");
	// 	};
	// 	if(!file){
	// 		console.log("No file found")
	// 		return;
	// 	}
	// 	reader.readAsBinaryString(file);
	// 	return Teachers
	// }
	async function onSubmit(values: z.infer<typeof formSchema>) {
		const updatedValues = await updateCounts(values)
		// const teachers = [
		// 	{ name: "Dr. Diddi Kumara Swamy", assignedShifts: [0, 1, 1] },
		// 	{ name: "Dr. Sourabh Jain", assignedShifts: [0, 1, 1] },
		// ];
		const teachers = await readFileValues();
		if (!teachers.length) {
			console.error("No teachers found in the file");
			return;
		}
		// console.log("Output prev",updatedValues);
		// const teachers = [...Teachers];
		const roomsValue = [...updatedValues] 
		console.log("Output after rooms",roomsValue);

		console.log("teachers prev:",teachers);
		const result = await assignTeachers(teachers,roomsValue)
		console.log("Final Result :" , result)
  }
	
	useEffect(() => {
			const shiftCount = form.getValues("shiftCount");
			const initialRoomData = form.getValues("initialRoomData").map((room) => {
				let updatedFacultyRequired = [...room.facultyRequired];
				console.log("updatedFacultyRequired before tt: ",updatedFacultyRequired,shifts)
				updatedFacultyRequired = room.facultyRequired.map((item)=>{
					if(item === 1 || item == undefined){
						return 1;
					}
					return 0;
				})
				updatedFacultyRequired = updatedFacultyRequired.slice(0, shifts);
				console.log("updatedFacultyRequired after: ",updatedFacultyRequired)
				return {
					...room,
					facultyRequired: updatedFacultyRequired,
				};
			});
			// Use form.setValue instead of resetting the entire form
			initialRoomData.forEach((room, index) => {
				form.setValue(`initialRoomData.${index}.facultyRequired`, room.facultyRequired);
			});
	}, [shifts,form]); // Trigger effect on shiftCount change

	useEffect(()=>{
		let initialRoomData = form.getValues('initialRoomData').map((room=>{
			const updatedFacultyRequired = room.facultyRequired.map((item)=>{
				if(item === 1 || item == undefined){
					return 1;
				}
				return 0;
			})
			return {...room,facultyRequired: updatedFacultyRequired}
		}))
		console.log("initialRoomData Before slice: ",initialRoomData)
		initialRoomData = initialRoomData.slice(0,rooms)
		console.log("initialRoomData: after aslice",initialRoomData)
		// initialRoomData.forEach((room, index) => {
		// 	form.setValue(`initialRoomData.${index}`,room);
		// });
		form.reset({
			...form.getValues(),
			initialRoomData: initialRoomData,
		});
	},[rooms,form])

	function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>){
    const file = e.target.files?.[0];
    if(file){
      console.log(file)
      setFile(file)
    }else{
      console.log("No file")
    }
    if (!file) return;
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (fileType !== "xlsx") {
      alert("Please upload a valid Excel (.xlsx) file")
      return;
    }
  }
	return (
		<div className="min-h-screen flex justify-center items-center">
			<Card>
				<CardHeader>
					<CardTitle>Room Allocation Form</CardTitle>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-4 flex-wrap">
							<Card>
								<CardContent  className="mt-4 space-y-2">
									<FormField
										control={form.control}
										name="roomCount"
										render={({field})=>(
											<FormItem className="space-y-1">
												<FormLabel>Number of Rooms</FormLabel>
												<FormControl>
													<Input
														type="number"
														min={1}
														required = {true}
														{...field}
														onChange={(e)=>{
															const val = e.target.value ? Number(e.target.value) : undefined;
															field.onChange(val);
															setRooms(val) 
														}}
													/>
												</FormControl>
												<FormDescription>Specify the number of rooms to be allocated.</FormDescription>
												<FormMessage/>
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="shiftCount"
										render={({field})=>(
											<FormItem className="space-y-1">
												<FormLabel>Number of Shifts</FormLabel>
												<FormControl>
													<Input
														type="number"
														min={1}
														required = {true}
														{...field}
														onChange={(e)=>{
															const val = e.target.value ? Number(e.target.value) : undefined;
															field.onChange(val); 
															setShifts(val)
														}}
													/>
												</FormControl>
												<FormDescription>Enter the total number shifts.</FormDescription>
												<FormMessage/>
											</FormItem>
										)}
									/>
									 <FormField
                    control={form.control}
                    name="teacherDutyFile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teacher List</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            placeholder="Upload Excel file (.xlsx)"
                            {...field}
                            accept=".xlsx"
                            onChange={handleFileUpload}
                            required={true}
                          />
                        </FormControl>
                        <FormDescription>Excel File Contains the list of all facilities</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
									<Button type="submit">Submit</Button>
								</CardContent>
							</Card>
							{shifts && (<Card className="p-4">
									<div className="">	
										<h3 className="text-md font-medium">Room Information</h3>
										<CardDescription className="text-sm">Please enter the details for each room.</CardDescription>
									</div>
									<Separator/>
									<ScrollArea className="h-[500px] pt-2 max-w-[1000px] ">
									{rooms && Array.from({length:rooms},(_,roomIndex)=>(
										<Card key={roomIndex*10} className="mb-2">
											<h1 className="px-4 p-2">Room {roomIndex+1}</h1>
											<Separator/>
											<CardContent className="-mx-2 flex gap-4">
												<div>
													<FormField
														control={form.control}
														name={`initialRoomData.${roomIndex}.roomNo`}
														render={({field})=>(
															<FormItem className="w-56 flex space-x-2 items-center mt-2">
																<FormLabel className="min-w-fit pt-2">Room Number</FormLabel>
																<FormControl>
																	<Input
																		className="h-9"
																		type="number"
																		placeholder="Room No"
																		required = {true}
																		{...field}
																		onChange={(e)=>{
																			const val = e.target.value ? Number(e.target.value) : undefined;
																			field.onChange(val); 
																		}}
																	/>
																</FormControl>
																<FormMessage/>
															</FormItem>
														)}
														/>
													<FormField
														control={form.control}
														name={`initialRoomData.${roomIndex}.requiredFaculty`}
														render={({field})=>(
															<FormItem className="w-56 items-center">
																<div className="w-56 flex items-center mt-2">
																<FormLabel className="min-w-fit pr-2">Faculty Required</FormLabel>
																<FormControl>
																	<Input
																		type="number"
																		className="h-9"
																		placeholder="No"
																		required = {true}
																		{...field}
																		onChange={(e)=>{
																			const val = e.target.value ? Number(e.target.value) : undefined;
																			field.onChange(val); 
																		}}
																	/>
																</FormControl>
																</div>
																<FormMessage/>
															</FormItem>
														)}
														/>
													<FormField
														control={form.control}
														name={`initialRoomData.${roomIndex}.roomFloor`}
														render={({field})=>(
															<FormItem className="w-56 flex space-x-2 items-center -mb-2">
																<FormLabel className="min-w-fit pt-2">Floor</FormLabel>
																<FormControl>
																	<Input
																		type="number"
																		min={0}
																		className="h-9"
																		placeholder="Floor"
																		required = {true}
																		{...field}
																		onChange={(e)=>{
																			const val = e.target.value ? Number(e.target.value) : undefined;
																			field.onChange(val); 
																		}}
																	/>
																</FormControl>
																<FormMessage/>
															</FormItem>
														)}
														/>
												</div>												
												<div>
													<Card className="grid mt-4">	
													<div className="px-4 p-2">	
														<h3 className="">Active Shifts</h3>
														<CardDescription className="text-sm">Teachers will be allocated to rooms for the selected shifts only</CardDescription>
													</div>
													<Separator/>
													<ScrollArea className="w-[600px]">
													<div className="px-4 p-2 flex gap-4 items-center h-16">
														Shifts
														{Array.from({length:shifts},(_,shiftIndex)=>(
															<FormField
																key={shiftIndex}
																control={form.control}
																name={`initialRoomData.${roomIndex}.facultyRequired.${shiftIndex}`}
																render={({field})=>(
																	<div className="flex flex-col justify-center items-center">
																		<h1>{shiftIndex+1}</h1>
																		<Checkbox
																			checked={field.value !== 0}
																			onCheckedChange={(checked) => {
																				console.log("UPdate")
																				// const requiredFaculty = form.getValues(`initialRoomData.${roomIndex}.requiredFaculty`);
																				field.onChange(checked ? 1 : 0);
																			}}
																		/>
																	</div>
																)}
																/>
														))}
													</div>
													<ScrollBar orientation="horizontal" />
													</ScrollArea>
													</Card>
												</div>
											</CardContent>
										</Card>
									))}
							</ScrollArea>
								</Card>		)}						
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	)
}