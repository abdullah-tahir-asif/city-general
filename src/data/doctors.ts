import { Doctor } from '../types';

export const DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Robert Chen',
    specialty: 'Cardiology',
    rating: 4.9,
    experience: 16,
    education: 'MD, FACC - Harvard Medical School',
    availability: ['Monday', 'Tuesday', 'Thursday'],
    slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'],
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&auto=format&fit=crop',
    bio: 'Dr. Chen is a board-certified cardiologist specializing in interventional cardiology and cardiac health disease prevention. Formally trained at HMS, his research is widely published.'
  },
  {
    id: 'doc-2',
    name: 'Dr. Sarah Jenkins',
    specialty: 'Pediatrics',
    rating: 4.8,
    experience: 12,
    education: 'MD, FAAP - Johns Hopkins University School of Medicine',
    availability: ['Monday', 'Wednesday', 'Friday'],
    slots: ['09:30 AM', '10:30 AM', '11:30 AM', '01:30 PM', '03:30 PM'],
    image: 'https://images.unsplash.com/photo-1594824813573-246434e33963?q=80&w=400&auto=format&fit=crop',
    bio: 'Dr. Jenkins provides comprehensive primary care for children of all ages. She has a deep focus on gentle developmental guidance and adolescent wellness coaching.'
  },
  {
    id: 'doc-3',
    name: 'Dr. David Kim',
    specialty: 'Neurology',
    rating: 4.9,
    experience: 18,
    education: 'MD - Stanford Medical Center',
    availability: ['Tuesday', 'Wednesday', 'Thursday'],
    slots: ['08:30 AM', '10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM'],
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop',
    bio: 'Dr. Kim is a recognized authority in clinical neurology, focusing on migraine therapies, neuropathic disease management, and micro-electrophysiology testing.'
  },
  {
    id: 'doc-4',
    name: 'Dr. Elena Taylor',
    specialty: 'Orthopedics',
    rating: 4.7,
    experience: 10,
    education: 'MD - Columbia College of Physicians and Surgeons',
    availability: ['Monday', 'Thursday', 'Friday'],
    slots: ['09:00 AM', '10:30 AM', '01:00 PM', '02:30 PM', '04:00 PM'],
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop',
    bio: 'Dr. Taylor specializes in minimally invasive joint reconstructive surgery, sports medicine, and rehabilitative biomechanics optimization.'
  },
  {
    id: 'doc-5',
    name: 'Dr. Marcus Vance',
    specialty: 'General Medicine',
    rating: 4.9,
    experience: 20,
    education: 'MD - Yale School of Medicine',
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    slots: ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'],
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400&auto=format&fit=crop',
    bio: 'Dr. Vance serves as our lead primary physician. He focuses on comprehensive longitudinal care, lifestyle adjustments, and preventative geriatric therapies.'
  },
  {
    id: 'doc-6',
    name: 'Dr. Aisha Rahman',
    specialty: 'Dermatology',
    rating: 4.8,
    experience: 11,
    education: 'MD - Duke University School of Medicine',
    availability: ['Tuesday', 'Friday'],
    slots: ['09:00 AM', '10:00 AM', '11:45 AM', '02:00 PM', '03:30 PM'],
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
    bio: 'Dr. Rahman specializes in chemical skin analysis, non-invasive skin oncological detection, and advanced topical immunotherapies.'
  }
];
