"use client";
import axios from 'axios';
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
import { assignTeachers } from '../../utility/roomDutyCalculator'
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type Teacher = {
  name: string;
  assignedShifts: number[];
};
type FileType = {
	Teacher: Teacher[]
	shiftNames: String[]
}

export default function RoomAllotment(){
	const [shifts, setShifts] = useState<number | undefined>();
	const [shiftNameArray, setShiftNameArray] = useState<String[] | undefined>([""])
	const [rooms, setRooms] = useState<number | undefined>(1);
  const [file, setFile] = useState<File | null>(null);
	const [teacherData, setTeacherData] = useState<Teacher[]>([])
	const [updatedValues, setUpdatedValues] = useState<any>([])
	// const formSchema = z.object({
	// 	roomCount: z.number().min(1,{message:"Atleast 1 Room required"}),
	// 	shiftCount: z.number().min(1,{message:"Atleast 1 Shift required"}),
	// 	initialRoomData: z.array(z.object({
	// 		roomNo : z.number(),
	// 		roomFloor: z.number(),
	// 		requiredFaculty : z.number().min(1,{message:"Atlease 1 Faculty is required"}),
	// 		facultyRequired : z.array(z.number())
	// 	})),
	// 	teacherDutyFile : z.any(),
	// 	headingText1 : z.string(),
	// 	headingText2 : z.string(),
	// })
	const formSchema = z.object({
		roomCount: z.number().min(1, { message: "At least 1 Room is required" }),
		initialRoomData: z.array(
			z.object({
				roomNo: z.number(), // Room number must be a number
				roomFloor: z.string(), // Assuming numeric floor values
				requiredFaculty: z.number().min(1, { message: "At least 1 Faculty is required" }),
				facultyRequired: z.array(z.number()),
			})
		),
		teacherDutyFile: z.any(),
		headingText1: z.string(),
		headingText2: z.string(),
	});
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues:{
			roomCount: 1,
			headingText1: "DUTY CHART OF MID-I SEMESTER EXAMINATION SEPTEMBER-2024",
			headingText2: "DATE: 18.09.2024 to 20-09-2024, TIME 09:30 AM TO 10:30 AM ( 1st SHIFT) , 12:00 NN TO 01:00 PM ( 2st SHIFT )& 3:00 PM TO 04:00 PM(3rd Shift)",
			initialRoomData : [
				// {
				// 	roomNo : undefined,
				// 	roomFloor : 1,
				// 	requiredFaculty : 2,
				// 	facultyRequired : Array(shifts).fill(2),
				// }
			],

		}
	})

	async function updateCounts(values: z.infer<typeof formSchema>){
		const correctedValues = values.initialRoomData.map(room => {
			const updatedFacultyRequired = room.facultyRequired.map(item => (item>0 ? room.requiredFaculty : 0))
			return { ...room, facultyRequired : updatedFacultyRequired}
		})
		return correctedValues
	}
	async function readFileValues(file:File): Promise<FileType> {
		return new Promise((resolve, reject) => {
			const Teachers: Teacher[] = [];
			const shiftNames:String[] = []
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
				for(let i = 3;i<lastCol;i++){
					const NameAddress = XLSX.utils.encode_cell({ r: 1, c: i });
					shiftNames.push(worksheet[NameAddress].v)
				}
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
				const resultsData = {Teacher : Teachers, shiftNames}
				resolve(resultsData); // Resolve the promise with Teachers array
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
	
	async function onSubmit(values: z.infer<typeof formSchema>) {
		console.log("Values:",values)
		const updatedValues = await updateCounts(values)
		setUpdatedValues(updatedValues)
		const tempTeachers = JSON.parse(JSON.stringify(teacherData)); 
		const temp = JSON.parse(JSON.stringify(updatedValues)); 
		const result = await assignTeachers(tempTeachers,temp)
		const dutyData = shiftNameArray?.map((_, shiftIndex) => {
			const x = result.map((room: any, roomIndex: number) => {
				if (room.allotedTeachers[shiftIndex].length === 0) {
					return null;  // Return null instead of nothing
				}
				return {
					roomNo: room.roomNo,
					floor: room.roomFloor,
					invigilators: room.allotedTeachers[shiftIndex],
				};
			}).filter((item:any) => item !== null);  // Filter out null values
		
			return x;
		});
		try {
      const response = await axios.post('http://localhost:3000/pages/roomAllotment/api', 
				{
					dutyData,
					shiftNameArray,
					text: {headingText1 : values.headingText1, headingText2: values.headingText2}
				},
				{ // Important for handling binary data
        	responseType: 'blob',
				}
			);

      // Create a URL for the file and trigger the download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'DutyChart.docx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error while downloading the file:', error);
    }		
  }
	
	useEffect(() => {
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

	async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>){
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

		const teachersData = await readFileValues(file)
		console.log("teachersData:",teachersData)
		if(teachersData.shiftNames.length === 0){
			console.error("Shift Names not defined")
		}
		setShifts(teachersData.shiftNames.length)
		setShiftNameArray(teachersData.shiftNames)
		setTeacherData(teachersData.Teacher)
  }
	return (
		<div className="h-screen flex justify-center items-center">
			<Card className='mt-8'>
				<CardHeader>
					<CardTitle>Room Allocation Form</CardTitle>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit, (error) => console.log("Validation Error:", error))}  className="flex gap-4 flex-wrap">
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
										name="headingText1"
										render={({field})=>(
											<FormItem className="space-y-1">
												<FormLabel>Heading Line 1</FormLabel>
													<FormControl>
														<Textarea
															{...field}
														/>
													</FormControl>
												<FormMessage/>
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="headingText2"
										render={({field})=>(
											<FormItem className="space-y-1">
												<FormLabel>Heading Line 2</FormLabel>
												<FormControl>
													<Textarea
														className="min-h-28"
														{...field}
													/>
												</FormControl>
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
                        <FormDescription>Upload the excel file generated from Generate Duties</FormDescription>
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
											<CardContent className="-mx-2 gap-4">
												<div className="grid grid-cols-3 gap-4">
													<FormField
														control={form.control}
														name={`initialRoomData.${roomIndex}.roomNo`}
														render={({field})=>(
															<FormItem className="flex space-x-2 items-center mt-2">
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
															<FormItem className="flex space-x-2 items-center mt-2">
																<FormLabel className="min-w-fit pt-2">Faculty Required</FormLabel>
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
																<FormMessage/>
															</FormItem>
														)}
													/>
													<FormField
														control={form.control}
														name={`initialRoomData.${roomIndex}.roomFloor`}
														render={({field})=>(
															<FormItem className="flex space-x-2 items-center -mb-2">
																<FormLabel className="min-w-fit pt-2">Floor</FormLabel>
																<FormControl>
																	<Input
																		type="text"
																		className="h-9"
																		placeholder="Floor"
																		required = {true}
																		{...field}
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
													<ScrollArea className={`w-fit ${shiftNameArray && shiftNameArray?.length <= 8 ? 'h-fit' : 'h-[120px]'}`}>
													<div className="px-4 p-2 flex flex-wrap gap-4 items-center h-16">
														
														{shiftNameArray && Array.from({length:shifts},(_,shiftIndex)=>(
															<FormField
																key={shiftIndex}
																control={form.control}
																name={`initialRoomData.${roomIndex}.facultyRequired.${shiftIndex}`}
																render={({field})=>(
																	<div className="flex flex-col justify-center items-center space-y-1">
																		<h3 className="text-sm">{shiftNameArray[shiftIndex]}</h3>
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