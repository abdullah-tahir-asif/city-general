export interface Doctor {
  id: string;
  name: string;
  specialty: 'Cardiology' | 'Pediatrics' | 'Neurology' | 'Orthopedics' | 'General Medicine' | 'Dermatology';
  rating: number;
  experience: number;
  education: string;
  availability: string[]; // e.g., ['Monday', 'Wednesday', 'Friday']
  slots: string[]; // e.g., ['09:00 AM', '10:30 AM', '02:00 PM', '04:30 PM']
  image: string;
  bio: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  patientDob: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  timeSlot: string;
  reason: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  createdAt: string;
  userId?: string;
}

export interface MedicalRecord {
  id: string;
  date: string;
  type: 'Lab Result' | 'Clinical Note' | 'Imaging' | 'Vaccination';
  title: string;
  doctorName: string;
  details: string;
  attachmentName?: string;
  status: 'Normal' | 'Attention Required' | 'Action Taken';
}

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  refillsRemaining: number;
  prescribingDoctor: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Expired';
}

export interface VitalRecord {
  date: string;
  heartRate: number;
  bloodPressure: string;
  weight: number;
  bloodSugar: number;
}

export interface BlogArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'Wellness' | 'Heart Health' | 'Pediatrics' | 'Community' | 'Prevention';
  author: string;
  authorRole: string;
  readTime: string;
  publishedDate: string;
  imageUrl: string;
}

export interface PortalMessage {
  id: string;
  sender: 'Patient' | 'Doctor';
  senderName: string;
  text: string;
  timestamp: string;
}
