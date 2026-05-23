# Security Specification - City General Hospital

## 1. Data Invariants
- **User Account Integrity**: A user can only read and write their own profile document (`/users/{userId}`).
- **Self-Assigned Elevation Guard**: No user can elevate themselves or other profiles (RBAC concept).
- **Appointment Ownership**: A user can only read, create, or update an appointment if they are the owner (`request.auth.uid == resource.data.userId` or `request.resource.data.userId == request.auth.uid`).
- **Timestamp Accuracy**: Document timestamps (`createdAt` / `updatedAt`) must strictly match `request.time`. No client can spoof dates.
- **State Transition Integrity**: Cancelled status is a terminal or protected transition, and standard users cannot modify external clinician-specific admin flags.

## 2. The Dirty Dozen Payloads (Vulnerability Test Matrix)
The following payloads check if the security rules successfully throw `PERMISSION_DENIED`:

1. **Malicious Owner Hijack**: Attempt to create a document in `/users/hacker_uid` where the `uid` inside says `"vip_patient"` to spoof profiles.
2. **Ghost Fields Injection**: Attempt to set `isDoctor: true` or `isAdmin: true` in `/users/{userId}` database profiles.
3. **Foreign Profile Read**: User `patient_A` attempts to read `/users/patient_B`.
4. **Appointment Spoofing**: User `patient_A` submits an appointment with `userId: "patient_B"` to make patient B pay/attend.
5. **Foreign Appointment Read**: User `patient_A` queries `/appointments` without filtering by `userId = patient_A`.
6. **Malicious Long ID Attack**: Creating an appointment with ID `APT-` followed by 10,000 extra dummy characters to cause a Denial of Wallet exhaustion.
7. **Time Spoofing Attack**: Attempt to submit `createdAt: "2020-01-01T00:00:00Z"` on a new slot instead of validating with `request.time`.
8. **Invalid Status Transition**: Attempt to update an appointment to return status `Completed` without medical staff authorization.
9. **No Auth Creation**: An anonymous client attempts to register an appointment without an authenticated profile.
10. **Shadow Key Injection**: Injecting a custom unauthorized field such as `bypassSecurityPayCheck: true` in an appointment document.
11. **Malicious String Types**: Submitting a boolean or number in place of the required phone number or doctor name.
12. **Foreign Appointment Mutate**: Attempt to change the `date` of an appointment belonging to another patient.

## 3. Test Runner Design (`firestore.rules.test.ts`)
```ts
// Structural test mockup verifying all payloads throw permission errors:
import { assertSucceeds, assertFails, initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe('City General Hospital Security Rules', () => {
  it('blocks foreign profile reads', async () => {
    const testEnv = await initializeTestEnvironment({ projectId: 'city-general-hospital-dc3a3' });
    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    await assertFails(aliceDb.doc('users/bob').get());
  });

  it('blocks foreign appointment hijacking', async () => {
    const testEnv = await initializeTestEnvironment({ projectId: 'city-general-hospital-dc3a3' });
    const aliceDb = testEnv.authenticatedContext('alice').firestore();
    await assertFails(aliceDb.doc('appointments/appt1').set({
      id: 'appt1',
      userId: 'bob',
      patientName: 'Bob Vance',
      patientEmail: 'bob@vance.com'
    }));
  });
});
```
