import mongoose from 'mongoose';

const SubjectSchema = new mongoose.Schema({
    branch: { type: String, required: true },
    subjectName: { type: String, required: true },
    subjectCode: { type: String, required: true },
    year: { type: Number, required: true },
    semester: { type: Number, required: true }
});

const UniversitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    department: { type: String, required: true },
    subjects: [SubjectSchema]
});

export default mongoose.model('University', UniversitySchema);
