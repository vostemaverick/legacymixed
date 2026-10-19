# Firebase Functions

The `removeMember` callable function permanently deletes a selected student's
or non-administrator staff member's Firebase Authentication account and
Firestore profile. It checks the caller's staff profile and admin/principal
role on the server. It does not delete submitted schemes, results, or notices.

Deploy from the repository root after installing the Firebase CLI and signing
in to an account with permission to deploy to the `legacy-secondary` project:

```sh
cd functions
npm install
cd ..
firebase deploy --only functions
```

Cloud Functions deployment requires the Firebase project to have billing and
the required Google Cloud APIs enabled. The admin portal's Remove buttons will
work after `removeMember` has been deployed.

## Staff marks and class results

The staff portal stores subject marks in the Firestore `marks` collection with
`student_id`, `subject`, `class`, `term`, `exam_type`, `marks`, and `teacher_id`
fields. Each teacher also creates a `markSubmissions` record for the class,
subject, term, and exam so the assigned Class Teacher can track outstanding
submissions. Teachers' `subjects` arrays and the optional `classTeacherFor`
field are managed from the Admin Portal. Admins assign students their own
`subjects` arrays when creating a student or from the Student Subjects tab.
Mark entry is limited to students in the selected class who are assigned the
selected subject, and Firestore rules enforce that assignment.

New student accounts use a unique username derived from the student's name and
admission number. The Admin Portal displays a randomly generated one-time
setup code once after account creation; give it to the student securely. On
first login, the student must choose a password before accessing results and
school documents. Existing students can continue using their email and current
password. No setup code is stored in Firestore.

Deploy the Firestore rules from the repository root after reviewing them:

```sh
firebase deploy --only firestore:rules
```

Class mark lists and result slips are generated in the staff portal and use the
browser print dialog; select “Save as PDF” to create PDF files.
