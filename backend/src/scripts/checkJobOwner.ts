import mongoose from 'mongoose';
import Job from '../models/Job';
import User from '../models/User';

async function checkJobOwner() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/parttimepay';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Job ID from logs
        const jobId = '692560b564e2d18f0b5636a2';

        // Get the job
        const job = await Job.findById(jobId).select('title employer');
        if (!job) {
            console.log('❌ Job not found');
            process.exit(1);
        }

        console.log('\n=== JOB INFORMATION ===');
        console.log('Job ID:', jobId);
        console.log('Job Title:', job.title);
        console.log('Employer ID:', job.employer.toString());

        // Get the employer user
        const employer = await User.findById(job.employer).select('email fullName role');
        if (employer) {
            console.log('\n=== EMPLOYER INFORMATION ===');
            console.log('Employer User ID:', employer._id.toString());
            console.log('Employer Email:', employer.email);
            console.log('Employer Name:', employer.fullName);
            console.log('Employer Role:', employer.role);
        } else {
            console.log('❌ Employer user not found!');
        }

        // Check if ashraf's account exists
        const ashraf = await User.findOne({ email: 'ashraf.khan1973.ak@gmail.com' }).select('_id email fullName role');
        if (ashraf) {
            console.log('\n=== ASHRAF ACCOUNT ===');
            console.log('Ashraf User ID:', ashraf._id.toString());
            console.log('Email:', ashraf.email);
            console.log('Name:', ashraf.fullName);
            console.log('Role:', ashraf.role);
            console.log('\n=== COMPARISON ===');
            console.log('Job employer ID:', job.employer.toString());
            console.log('Ashraf user ID:', ashraf._id.toString());
            console.log('IDs MATCH:', job.employer.toString() === ashraf._id.toString());
        }

        await mongoose.disconnect();
        console.log('\n✅ Done');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkJobOwner();
