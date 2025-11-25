import mongoose from 'mongoose';
import axios from 'axios';
import { config } from '../config';

const PORT = 5002;
const API_URL = `http://localhost:${PORT}/api/v1`;
let employerToken = '';
let employeeToken = '';
let jobId = '';
let applicationId = '';
let contractId = '';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runTest() {
    try {
        console.log('🚀 Starting Job Flow Test...');

        // 1. Login/Register Users
        console.log('\n1. Authenticating Users...');

        // Employer
        try {
            const res = await axios.post(`${API_URL}/auth/login`, {
                email: 'employer@test.com',
                password: 'password123'
            });
            employerToken = res.data.data.token;
            console.log('✅ Employer logged in');
        } catch (e) {
            // Register if login fails
            const res = await axios.post(`${API_URL}/auth/register`, {
                fullName: 'Test Employer',
                username: 'employer_' + Date.now(),
                email: 'employer@test.com',
                password: 'password123',
                role: 'employer'
            });
            employerToken = res.data.data.token;
            console.log('✅ Employer registered');
        }

        // Employee
        try {
            const res = await axios.post(`${API_URL}/auth/login`, {
                email: 'employee@test.com',
                password: 'password123'
            });
            employeeToken = res.data.data.token;
            console.log('✅ Employee logged in');
        } catch (e) {
            const res = await axios.post(`${API_URL}/auth/register`, {
                fullName: 'Test Employee',
                username: 'employee_' + Date.now(),
                email: 'employee@test.com',
                password: 'password123',
                role: 'employee'
            });
            employeeToken = res.data.data.token;
            console.log('✅ Employee registered');
        }

        // 2. Add Funds to Employer Wallet
        console.log('\n2. Adding Funds to Employer Wallet...');
        await axios.post(`${API_URL}/wallet/test-add-funds`, {
            amount: 50000
        }, { headers: { Authorization: `Bearer ${employerToken}` } });
        console.log('✅ Funds added');

        // 3. Create Job
        console.log('\n3. Creating Job...');
        const jobRes = await axios.post(`${API_URL}/jobs`, {
            title: 'Test Job ' + Date.now(),
            description: 'This is a test job description that is long enough to pass the validation requirements. We need at least 50 characters here.',
            company: 'Test Company Inc.',
            skills: ['React', 'Node.js'],
            requirements: ['2+ years experience', 'Team player'],
            responsibilities: ['Build features', 'Code reviews'],
            category: 'Development',
            hourlyRate: 1000,
            minHourlyRate: 800,
            maxHourlyRate: 1200,
            hoursPerWeek: 20,
            duration: '4 weeks',
            location: 'Remote',
            isRemote: true,
            experienceLevel: 'mid',
            jobType: 'Contract',
            isAcceptingApplications: true,
            status: 'active'
        }, { headers: { Authorization: `Bearer ${employerToken}` } });
        jobId = jobRes.data.data.job._id;
        console.log(`✅ Job created: ${jobId}`);

        // 4. Apply for Job
        console.log('\n4. Applying for Job...');
        const appRes = await axios.post(`${API_URL}/applications/job/${jobId}`, {
            coverLetter: 'I am very excited about this opportunity and believe I am the perfect fit for this job. I have extensive experience with the required technologies.',
            salaryExpectation: 1200
        }, { headers: { Authorization: `Bearer ${employeeToken}` } });
        applicationId = appRes.data.data.application._id;
        console.log(`✅ Application submitted: ${applicationId}`);

        // 5. Employer Makes Offer
        console.log('\n5. Employer Making Offer...');
        await axios.post(`${API_URL}/applications/${applicationId}/offer`, {
            offerAmount: 1100
        }, { headers: { Authorization: `Bearer ${employerToken}` } });
        console.log('✅ Offer sent: 1100/hr');

        // 6. Employee Accepts Offer
        console.log('\n6. Employee Accepting Offer...');
        await axios.post(`${API_URL}/applications/${applicationId}/respond-offer`, {
            status: 'accepted'
        }, { headers: { Authorization: `Bearer ${employeeToken}` } });
        console.log('✅ Offer accepted');

        // 7. Employer Updates Status to Accepted (Triggers Contract Creation)
        console.log('\n7. Creating Contract...');
        const statusRes = await axios.put(`${API_URL}/applications/${applicationId}/status`, {
            status: 'accepted'
        }, { headers: { Authorization: `Bearer ${employerToken}` } });
        contractId = statusRes.data.data.contract._id;
        console.log(`✅ Contract created: ${contractId}`);

        // 8. Submit Timesheet
        console.log('\n8. Submitting Timesheet...');
        const tsRes = await axios.post(`${API_URL}/timesheets`, {
            jobId,
            weekNumber: 1,
            hoursWorked: 10,
            description: 'Worked on backend API'
        }, { headers: { Authorization: `Bearer ${employeeToken}` } });
        const timesheetId = tsRes.data.data.timesheet._id;
        console.log(`✅ Timesheet submitted: ${timesheetId}`);

        // 9. Approve Timesheet
        console.log('\n9. Approving Timesheet...');
        await axios.post(`${API_URL}/timesheets/${timesheetId}/approve`, {}, {
            headers: { Authorization: `Bearer ${employerToken}` }
        });
        console.log('✅ Timesheet approved & Paid');

        // 10. Process Weekly Payouts (Admin)
        console.log('\n10. Processing Weekly Payouts...');
        // Need admin token, but for now we'll skip or assume employer is admin if role check allows
        // Or we can just check wallet balance of employee
        const walletRes = await axios.get(`${API_URL}/wallet`, {
            headers: { Authorization: `Bearer ${employeeToken}` }
        });
        console.log(`✅ Employee Wallet Balance: ${walletRes.data.data.wallet.balance}`);

        // 11. Terminate Contract
        console.log('\n11. Terminating Contract...');
        await axios.post(`${API_URL}/contracts/${contractId}/terminate`, {
            reason: 'Project completed early'
        }, { headers: { Authorization: `Bearer ${employerToken}` } });
        console.log('✅ Contract terminated');

        // 12. Submit Review
        console.log('\n12. Submitting Review...');
        await axios.post(`${API_URL}/reviews`, {
            contractId,
            rating: 5,
            comment: 'Great experience!'
        }, { headers: { Authorization: `Bearer ${employerToken}` } });
        console.log('✅ Review submitted');

        console.log('\n🎉 Test Completed Successfully!');
    } catch (error: any) {
        console.error('\n❌ Test Failed:', error);
        if (error.response) {
            console.error('Response Data:', error.response.data);
            console.error('Response Status:', error.response.status);
        }
    }
}

runTest();
