"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider, useWatch, useFieldArray } from "react-hook-form";
import { createJob } from '@/utils/supabase/db/mutations'; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { TypographyH2, TypographyP } from '@/components/ui/typography';
import { Check, Loader2, X, PlusCircle } from 'lucide-react';
import { toast } from "sonner";
import { cn } from '@/lib/utils';

const steps = [
  { id: 1, title: 'Basic Information' },
  { id: 2, title: 'Job Description' },
  { id: 3, title: 'Applicable Questions' },
  { id: 4, title: 'Confirmation' },
];

const StepIndicator = ({ currentStep, setStep }) => (
    <ol className="relative border-l border-border/70">
        {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
                <li key={step.id} className={cn("transition-all", index === steps.length -1 ? 'mb-0' : 'mb-10')}>
                    <div className="flex items-center">
                        <span className="absolute -left-4 flex items-center justify-center w-8 h-8 rounded-full ring-4 ring-background transition-all"
                            style={{
                                backgroundColor: isActive || isCompleted ? 'var(--color-primary)' : 'var(--color-card)',
                                borderColor: isActive || isCompleted ? 'var(--color-primary)' : 'var(--color-border)',
                                borderWidth: '2px'
                            }}
                        >
                            {isCompleted ? (
                                <Check className="w-5 h-5 text-primary-foreground" />
                            ) : (
                                <span className={cn("text-sm font-medium", isActive ? "text-primary-foreground" : "text-muted-foreground")}>
                                    {step.id}
                                </span>
                            )}
                        </span>
                        <div className="ml-8">
                             <button onClick={() => setStep(step.id)} className="text-left cursor-pointer">
                                <h3 className={cn("font-medium text-base", isActive ? "text-foreground" : "text-muted-foreground")}>
                                    {step.title}
                                </h3>
                            </button>
                        </div>
                    </div>
                </li>
            );
        })}
    </ol>
);

const BasicInformationStep = ({ control }) => {
    const salaryType = useWatch({ control, name: 'salary_type' });

    return (
        <div className="space-y-8">
            <TypographyH2 className="text-xl font-semibold">Basic Information</TypographyH2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormField control={control} name="title" rules={{ required: "Job title is required" }} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl><Input {...field} placeholder="Ex: Medical Biller" /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={control} name="industry" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Industry</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select an Option" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Technology">Technology</SelectItem>
                                <SelectItem value="Healthcare">Healthcare</SelectItem>
                                <SelectItem value="Finance">Finance</SelectItem>
                                <SelectItem value="Education">Education</SelectItem>
                                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                                <SelectItem value="Retail">Retail</SelectItem>
                                <SelectItem value="Consulting">Consulting</SelectItem>
                                <SelectItem value="Marketing">Marketing</SelectItem>
                                <SelectItem value="Media & Entertainment">Media & Entertainment</SelectItem>
                                <SelectItem value="Government">Government</SelectItem>
                                <SelectItem value="Non-profit">Non-profit</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={control} name="location" rules={{ required: "Location is required" }} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl><Input {...field} placeholder="Search location" /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={control} name="work_preference" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Work Preference</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select an Option" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="On Site">On Site</SelectItem>
                                <SelectItem value="Hybrid">Hybrid</SelectItem>
                                <SelectItem value="Remote">Remote</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={control} name="employment_type" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Employment Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select an Option" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Full Time">Full Time</SelectItem>
                                <SelectItem value="Part Time">Part Time</SelectItem>
                                <SelectItem value="Contract">Contract</SelectItem>
                                <SelectItem value="Internship">Internship</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={control} name="job_seniority" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Job Seniority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select an Option" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Graduate">Graduate</SelectItem>
                                <SelectItem value="Junior">Junior</SelectItem>
                                <SelectItem value="Mid-level">Mid-level</SelectItem>
                                <SelectItem value="Senior">Senior</SelectItem>
                                <SelectItem value="Lead">Lead</SelectItem>
                                <SelectItem value="Manager">Manager</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={control} name="qualification_level" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Minimum Qualification level required</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select an Option" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="None">None</SelectItem>
                                <SelectItem value="High School">High School</SelectItem>
                                <SelectItem value="Bachelor&apos;s Degree">Bachelor&apos;s Degree</SelectItem>
                                <SelectItem value="Master&apos;s Degree">Master&apos;s Degree</SelectItem>
                                <SelectItem value="PhD">PhD</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={control} name="security_clearance" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Requires Security Clearance</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select an Option" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="None">None</SelectItem>
                                <SelectItem value="DBS/CRB">DBS/CRB</SelectItem>
                                <SelectItem value="SC">SC</SelectItem>
                                <SelectItem value="DV">DV</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={control} name="driving_license" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Requires Driving Licence</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select an Option" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="No">No</SelectItem>
                                <SelectItem value="Yes">Yes</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={control} name="visa_sponsorship" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Can you Provide Visa Sponsorship for this Role?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select an Option" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="No">No</SelectItem>
                                <SelectItem value="Yes">Yes</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
            <hr className="border-border/50" />
            <TypographyH2 className="text-xl font-semibold">Salary Range</TypographyH2>
             <div className="space-y-2">
                 <FormLabel>Salary</FormLabel>
                 <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4">
                    <FormField control={control} name="salary_type" render={({ field }) => (
                        <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger className="w-full sm:w-auto"><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Range">Range</SelectItem>
                                    <SelectItem value="Fixed">Fixed</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />

                    {salaryType === 'Range' ? (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <FormField control={control} name="salary_min" render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Input 
                                            {...field} 
                                            type="number" 
                                            placeholder="0" 
                                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : "")}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <span className="text-muted-foreground">to</span>
                            <FormField control={control} name="salary_max" render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Input 
                                            {...field} 
                                            type="number" 
                                            placeholder="0" 
                                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : "")}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    ) : (
                        <FormField control={control} name="salary_max" render={({ field }) => (
                            <FormItem className="w-full sm:w-auto sm:flex-1">
                                <FormControl>
                                    <Input 
                                        {...field} 
                                        type="number" 
                                        placeholder="Enter fixed salary" 
                                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : "")}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    )}
                    
                    <FormField control={control} name="salary_period" render={({ field }) => (
                        <FormItem>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger className="w-full sm:w-auto"><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="Per Month">Per Month</SelectItem>
                                    <SelectItem value="Per Year">Per Year</SelectItem>
                                    <SelectItem value="Per Hour">Per Hour</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
            </div>
        </div>
    );
};

const JobDescriptionStep = ({ control }) => (
    <div className="space-y-8">
        <TypographyH2 className="text-xl font-semibold">Job Description</TypographyH2>
         <FormField
            control={control}
            name="description"
            rules={{ required: "Job description is required" }}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Full Job Description</FormLabel>
                    <FormControl>
                        <Textarea
                            placeholder="Describe the role, responsibilities, and requirements..."
                            className="min-h-[250px]"
                            {...field}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    </div>
);

const ApplicableQuestionsStep = ({ control }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "application_questions"
    });

    return (
        <div className="space-y-8">
            <TypographyH2 className="text-xl font-semibold">Applicable Questions</TypographyH2>
            <TypographyP>Add questions for candidates to answer when they apply.</TypographyP>
            <div className="space-y-4">
                {fields.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-2">
                        <FormField
                            control={control}
                            name={`application_questions.${index}.question`}
                            render={({ field }) => (
                                <FormItem className="flex-grow">
                                    <FormControl>
                                        <Input {...field} placeholder={`Question ${index + 1}`} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><X className="h-4 w-4" /></Button>
                    </div>
                ))}
            </div>
            <Button type="button" variant="outline" onClick={() => append({ question: "" })}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Question
            </Button>
        </div>
    );
};

const ConfirmationStep = ({ control }) => {
    const values = useWatch({ control });
    return (
        <div className="space-y-8">
            <TypographyH2 className="text-xl font-semibold">Confirmation</TypographyH2>
            <TypographyP>Please review the job details before posting.</TypographyP>
            <Card>
                <CardContent className="p-6">
                    <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(values, null, 2)}</pre>
                </CardContent>
            </Card>
        </div>
    );
};

export default function CreateJobPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const methods = useForm({
        defaultValues: {
            title: "",
            industry: "",
            location: "",
            work_preference: "On Site",
            employment_type: "Full Time",
            job_seniority: "Graduate",
            qualification_level: "None",
            security_clearance: "None",
            driving_license: "No",
            visa_sponsorship: "No",
            salary_type: "Range",
            salary_min: "",
            salary_max: "",
            salary_period: "Per Month",
            description: "",
            application_questions: [],
        },
        mode: "onChange",
    });

    const onSubmit = async (values) => {
        if (currentStep < steps.length) {
            setCurrentStep(prev => prev + 1);
            return;
        }

        setIsSubmitting(true);
        try {
            await createJob(values);
            toast.success("Job post created successfully!");
            router.push('/dashboard/jobs');
        } catch (error) {
            toast.error("Failed to create job post. Please try again.");
            console.error("Job creation error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        } else {
            router.push('/dashboard/jobs');
        }
    };

    return (
        <FormProvider {...methods}>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-8 p-4 md:p-6 h-full">
                <div className="hidden lg:block">
                    <Card>
                        <CardContent className="p-8">
                            <StepIndicator currentStep={currentStep} setStep={setCurrentStep} />
                        </CardContent>
                    </Card>
                </div>
                <div className="max-h-[calc(100vh-10rem)]">
                    <Card className="flex flex-col overflow-hidden">
                        <form onSubmit={methods.handleSubmit(onSubmit)}>
                            <div className="flex-grow overflow-y-auto p-8 max-h-[calc(100vh-15rem)]">
                                {currentStep === 1 && <BasicInformationStep control={methods.control} />}
                                {currentStep === 2 && <JobDescriptionStep control={methods.control} />}
                                {currentStep === 3 && <ApplicableQuestionsStep control={methods.control} />}
                                {currentStep === 4 && <ConfirmationStep control={methods.control} />}
                               
                            </div>

                            <div className="border-t border-border/50 pt-4 px-4 flex justify-between items-center">
                                <Button type="button" variant="ghost" onClick={handleBack} disabled={isSubmitting}>
                                    Back
                                </Button>
                                <div className="flex items-center gap-4">
                                    <TypographyP className="text-sm text-muted-foreground">
                                        Step {currentStep} of {steps.length}
                                    </TypographyP>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {currentStep === steps.length ? 'Finish & Post Job' : 'Continue'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </FormProvider>
    );
} 