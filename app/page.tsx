"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as XLSX from "xlsx";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { main } from "./utility/dutyCalculator.js";
import { ScrollArea } from "@/components/ui/scroll-area"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.jsx";


export default function Home() {
  const formSchema = z.object({
    teachers: z
      .number()
      .min(1, { message: "There should be at least 1 teacher" }),
    teacherFile: z.any(),
    shifts: z.number().min(1, { message: "Size must be at least 1" }),
    arrayValues: z.array(z.number({required_error: "Faculty no is required",invalid_type_error: "Must be a number",}).min(1,{message:"Minimum 1 faculty required"})),
    shiftDates: z.array(z.string()),  // Array of dates
  }).superRefine((data, ctx) => {
    data.arrayValues.forEach((value, index) => {
      if (value > data.teachers) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [`arrayValues`, index], // Dynamically setting the path based on the index
          message: "The number of faculties required should not be more than the number of teachers",
        });
      }
    });
  });
  const [loading, setLoading] = useState(false);
  const [shifts, setShifts] = useState<number | undefined>(undefined);
  const [file, setFile] = useState<File | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    // defaultValues: {
    //   teachers: ,
    //   shifts: 1,
    //   arrayValues: [],
    //   shiftDates: [],
    // },
  });
  //Handle file Upload
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
  
  //Handle Form Submission
  function toExcelCellName(row:number, col:number):String {
    let columnName = '';
    while (col >= 0) {
        columnName = String.fromCharCode((col % 26) + 65) + columnName;
        col = Math.floor(col / 26) - 1;
    }
    return columnName + (row + 1);
  }
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    try {
      console.log("Submit", values, file);
      
      const shiftNames = values.shiftDates;
      shiftNames.push("Total")
      
      console.log(shiftNames);
      console.log("log checks");
      
      if (!file) {
        console.error("No file selected");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result;
        if (!result) {
          console.error("Error: No result from FileReader");
          return;
        }
        
        const workbook = XLSX.read(result, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        XLSX.utils.sheet_add_aoa(worksheet, [shiftNames], { origin: { r: 1, c: 3 } });
        XLSX.utils.sheet_add_aoa(worksheet, [["Total Faculty On Day"],["Total Faculty Required"]], { origin: { r: 2+values.teachers, c: 2 } });
        XLSX.utils.sheet_add_aoa(worksheet, [values.arrayValues], { origin: { r: 3+values.teachers, c: 3 } });
        
        const matrix = await main(values.teachers, values.shifts, values.arrayValues);
        XLSX.utils.sheet_add_aoa(worksheet, matrix, { origin: { r: 2, c: 3 } });
        worksheet['!merges'] = [
          { s: { r: 0, c: 3 }, e: { r: 0, c: 2+values.shiftDates.length } },
          { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
        ];
        for(let i=3;i<values.arrayValues.length+3;i++){
          const formulaCell = toExcelCellName(2+values.teachers,i);
          const startCell = toExcelCellName(2,i);
			    const endCell = toExcelCellName(1+values.teachers,i);
          worksheet[`${formulaCell}`] = { f: `SUM(${startCell}:${endCell})` };
        }
        for(let i=2;i<values.teachers+2;i++){
          const formulaCell2 = toExcelCellName(i,3+values.arrayValues.length);
          const startCell2 = toExcelCellName(i,3);
			    const endCell2 = toExcelCellName(i,3+values.arrayValues.length-1);
          worksheet[`${formulaCell2}`] = { f: `SUM(${startCell2}:${endCell2})` };
        }

        XLSX.writeFile(workbook, "Timetable.xlsx");
      };
  
      reader.onerror = () => {
        console.error("Error reading the file");
      };
  
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error("Submission error:", error);
    }
    finally{
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen flex justify-center items-center">
      <Card>
        <CardHeader>
          <CardTitle>Generate Duties</CardTitle>
          <CardDescription>This form generates the Duties timetable for the given Shifts</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-4 flex-wrap">
              <Card>
                <CardContent className="mt-4">
                  <FormField
                    control={form.control}
                    name="teachers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Faculties</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter number of Facluties"
                            type="number"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value ? Number(e.target.value) : undefined; // Convert to number
                              field.onChange(value); // Set the field value
                            }}
                            min={1}
                            required={true}
                          />
                        </FormControl>
                        <FormDescription>
                          This is the total no of faculties that can be assinged
                          duties
                        </FormDescription>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shifts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shifts</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter Number of Shifts"
                            {...field}
                            onChange={(e)=>{
                              const value = e.target.value ? Number(e.target.value) : undefined
                              field.onChange(value)
                              setShifts(value)
                            }}
                            min={1}
                            required={true}
                          />
                        </FormControl>
                        <FormDescription>Total no of shifts inlcuding Morning/Evening Shifts</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="teacherFile"
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
                            // required={true}
                          />
                        </FormControl>
                        <FormDescription>Excel File Contains the list of all facilities</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div >
                    <Button type="submit" className="mt-4">
                      Generate Result {loading && "Loading"}
                    </Button>
                    <a
                      href={`/Templates/Data Template.xlsx`}
                      download={`$Data Template.xlsx`}
                      className="text-sm underline text-blue-500 ml-4"
                    >
                      Download Template
                    </a>
                  </div>
                </CardContent>
              </Card>
              {shifts && (
                <ScrollArea className="h-[400px]  whitespace-nowrap rounded-md border">
                <div className="grid gap-2 p-2 m-2">
                  <h3 className="text-lg font-medium">Shift Details</h3>
                  <CardDescription>Enter Required Faculties on Shifts</CardDescription>
                  {shifts && Array.from({ length: shifts }, (_, index) => (
                    <Card key={`it${index}`}>
                      <h1 className="mt-6 mx-6 mb-2">Shift {index+1}</h1>
                      <CardContent className="flex gap-2">
                    <FormField
                    key={index}
                    control={form.control}
                    name={`arrayValues.${index}`}
                    render={({ field, fieldState: { error }  }) => (
                      <FormItem >
                          <FormLabel>Faculty Required</FormLabel>
                          <FormControl>
                            <Input
                              className="w-32"
                              type="text"
                              placeholder={`Enter Value`}
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value ? Number(e.target.value) : 0; // Convert to number
                                field.onChange(value); // Set the field value
                              }}
                              required={true}
                              />
                          </FormControl>
                          <FormMessage />
                          {/* {error && <p className="text-red-500">{error.message}</p>} */}
                        </FormItem>
                      )}
                      />
                      <FormField
                        control={form.control}
                        key={`i${index}`}
                        name={`shiftDates.${index}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Enter Shift Date"
                                {...field}
                                required={true}
                                />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    
                    </CardContent>
                  </Card>
                    ))}
                </div>
              </ScrollArea>
              )}

            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
