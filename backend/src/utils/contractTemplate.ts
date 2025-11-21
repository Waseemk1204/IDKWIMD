/**
 * Contract Template Generator
 * Creates detailed contract templates with variable placeholders
 */

export interface ContractTemplateData {
   jobTitle: string;
   companyName: string;
   employeeName: string;
   hourlyRate: number;
   hoursPerWeek: number;
   duration: string;
   startDate: Date;
   endDate: Date;
   location?: string;
   isRemote?: boolean;
   jobDescription?: string;
   responsibilities?: string[];
}

export const generateContractTemplate = (data: ContractTemplateData): string => {
   const {
      jobTitle,
      companyName,
      employeeName,
      hourlyRate,
      hoursPerWeek,
      duration,
      startDate,
      endDate,
      location,
      isRemote,
      jobDescription,
      responsibilities
   } = data;

   const formattedStartDate = startDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
   });
   const formattedEndDate = endDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
   });

   const workLocation = isRemote ? 'Remote' : (location || 'To be determined');
   const weeklyPayment = hourlyRate * hoursPerWeek;
   const totalEstimatedPayment = weeklyPayment * Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));

   return `
PART-TIME EMPLOYMENT CONTRACT

This Employment Contract ("Contract") is entered into on ${formattedStartDate} between:

EMPLOYER:
${companyName}

EMPLOYEE:
${employeeName}

1. POSITION AND DUTIES
   The Employee agrees to work as a ${jobTitle} for the Employer.
   ${jobDescription ? `Job Description: ${jobDescription}` : ''}
   
   ${responsibilities && responsibilities.length > 0 ? `
   Key Responsibilities:
   ${responsibilities.map((resp, idx) => `${idx + 1}. ${resp}`).join('\n   ')}
   ` : ''}

2. COMPENSATION
   - Hourly Rate: ₹${hourlyRate.toLocaleString()} per hour
   - Hours per Week: ${hoursPerWeek} hours
   - Weekly Payment: ₹${weeklyPayment.toLocaleString()}
   - Estimated Total Payment: ₹${totalEstimatedPayment.toLocaleString()} (based on ${duration})
   
   Payment will be made upon approval of submitted timesheets, typically on a weekly basis.

3. WORK SCHEDULE
   - Start Date: ${formattedStartDate}
   - End Date: ${formattedEndDate}
   - Duration: ${duration}
   - Work Location: ${workLocation}
   - Hours per Week: ${hoursPerWeek} hours

4. TERMS AND CONDITIONS
   a) The Employee agrees to submit accurate timesheets on a weekly basis.
   b) Payment will be processed upon Employer's approval of timesheets.
   c) The Employee must maintain professional conduct and meet performance standards.
   d) Either party may terminate this contract with appropriate notice as per platform policies.
   e) All work performed is subject to the Employer's approval and quality standards.

5. CONFIDENTIALITY
   The Employee agrees to maintain confidentiality of any proprietary information
   shared during the course of employment.

6. PLATFORM TERMS
   This contract is governed by Part-Time Pay$ platform terms and conditions.
   Disputes will be resolved through the platform's dispute resolution process.

7. SIGNATURES
   By accepting this contract, both parties agree to the terms outlined above.

   Employer: ${companyName}
   Employee: ${employeeName}
   Date: ${formattedStartDate}

---
This contract is automatically generated and managed by Part-Time Pay$ platform.
Contract ID: [CONTRACT_ID]
Job ID: [JOB_ID]
  `.trim();
};

export default generateContractTemplate;

