import { PrismaClient, LessonStatus, TaskStatus, TaskPriority, CalendarEventType, AttendanceStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function daysFromNow(days: number, hour = 9, minute = 0) {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  console.log("Seeding STEAM Hub…");

  // ---------------------------------------------------------------------
  // Clear existing data (idempotent re-seed for local dev)
  // ---------------------------------------------------------------------
  await prisma.activityLog.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.scheduleBlock.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectIdea.deleteMany();
  await prisma.student.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  // ---------------------------------------------------------------------
  // Admin user
  // ---------------------------------------------------------------------
  const passwordHash = await bcrypt.hash("changeme123", 10);
  await prisma.user.create({
    data: {
      name: "Alex Rivera",
      email: "admin@steamhub.app",
      password: passwordHash,
      schoolName: "Meridian International School",
      semesterStart: daysFromNow(-30, 0, 0),
      semesterEnd: daysFromNow(90, 0, 0),
    },
  });

  // ---------------------------------------------------------------------
  // Courses
  // ---------------------------------------------------------------------
  const designArch = await prisma.course.create({
    data: {
      name: "Design & Architecture",
      gradeLevel: "Grade 8",
      description: "An introduction to architectural design thinking — from site analysis to scale models, grounded in the IB Design cycle.",
      color: "#0000FF",
    },
  });

  const robotics = await prisma.course.create({
    data: {
      name: "Robotics & Engineering",
      gradeLevel: "Grade 9",
      description: "Hands-on robotics: sensors, circuits, programming logic, and the engineering design process, building toward an autonomous navigation challenge.",
      color: "#00C853",
    },
  });

  const branding = await prisma.course.create({
    data: {
      name: "Branding & Product Design",
      gradeLevel: "Grade 10",
      description: "Students develop brand identity systems and physical products, from research and positioning through to pitch-ready prototypes.",
      color: "#9333EA",
    },
  });

  const printLab = await prisma.course.create({
    data: {
      name: "3D Printing Lab",
      gradeLevel: "Grades 8-10",
      description: "A cross-grade elective covering CAD fundamentals, slicing, and design for additive manufacturing.",
      color: "#F59E0B",
    },
  });

  // ---------------------------------------------------------------------
  // Units + Lessons
  // ---------------------------------------------------------------------
  async function makeUnits(
    courseId: string,
    units: { name: string; description: string; lessons: { title: string; status: LessonStatus; content?: string }[] }[]
  ) {
    for (let i = 0; i < units.length; i++) {
      const u = units[i];
      const unit = await prisma.unit.create({
        data: { courseId, name: u.name, description: u.description, order: i },
      });
      for (let j = 0; j < u.lessons.length; j++) {
        const l = u.lessons[j];
        await prisma.lesson.create({
          data: {
            unitId: unit.id,
            title: l.title,
            order: j,
            status: l.status,
            content: l.content ?? "",
          },
        });
      }
    }
  }

  await makeUnits(designArch.id, [
    {
      name: "Foundations of Architectural Design",
      description: "Core design-thinking and representation skills used throughout the semester.",
      lessons: [
        { title: "Intro to Design Thinking", status: LessonStatus.COMPLETED },
        { title: "Site Analysis & Context", status: LessonStatus.COMPLETED },
        { title: "Sketching & Orthographic Views", status: LessonStatus.COMPLETED },
        { title: "Scale Models 101", status: LessonStatus.COMPLETED },
      ],
    },
    {
      name: "Sustainable Housing Studio",
      description: "Designing a small dwelling around passive design principles and material research.",
      lessons: [
        { title: "Passive Design Principles", status: LessonStatus.IN_PROGRESS },
        { title: "Material Research", status: LessonStatus.PLANNED },
        { title: "Floor Plan Development", status: LessonStatus.PLANNED },
        { title: "Final Model Build", status: LessonStatus.PLANNED },
      ],
    },
    {
      name: "Community Spaces Exhibition Prep",
      description: "Preparing final boards and models for the end-of-semester exhibition.",
      lessons: [
        { title: "Presentation Boards", status: LessonStatus.PLANNED },
        { title: "Peer Critique", status: LessonStatus.PLANNED },
        { title: "Exhibition Setup", status: LessonStatus.PLANNED },
      ],
    },
  ]);

  await makeUnits(robotics.id, [
    {
      name: "Robotics Fundamentals",
      description: "Sensors, actuators, circuits, and block-based programming logic.",
      lessons: [
        { title: "Intro to Sensors & Actuators", status: LessonStatus.COMPLETED },
        { title: "Circuits & Wiring Basics", status: LessonStatus.COMPLETED },
        { title: "Programming Logic (Block-Based)", status: LessonStatus.COMPLETED },
        { title: "Building the Chassis", status: LessonStatus.IN_PROGRESS },
      ],
    },
    {
      name: "Autonomous Navigation Challenge",
      description: "Line-following, obstacle avoidance, and calibration ahead of the class competition.",
      lessons: [
        { title: "Line-Following Algorithms", status: LessonStatus.PLANNED },
        { title: "Obstacle Avoidance", status: LessonStatus.PLANNED },
        { title: "Sensor Calibration", status: LessonStatus.PLANNED },
        { title: "Competition Trial Runs", status: LessonStatus.PLANNED },
      ],
    },
    {
      name: "Engineering Design Process",
      description: "Framing problems, iterating, and documenting testing.",
      lessons: [
        { title: "Problem Definition", status: LessonStatus.PLANNED },
        { title: "Iterative Prototyping", status: LessonStatus.PLANNED },
        { title: "Testing & Documentation", status: LessonStatus.PLANNED },
      ],
    },
  ]);

  await makeUnits(branding.id, [
    {
      name: "Brand Identity Systems",
      description: "Research, positioning, and visual identity fundamentals.",
      lessons: [
        { title: "Research & Positioning", status: LessonStatus.COMPLETED },
        { title: "Logo Design Fundamentals", status: LessonStatus.COMPLETED },
        { title: "Typography & Color Systems", status: LessonStatus.IN_PROGRESS },
        { title: "Brand Guidelines Doc", status: LessonStatus.PLANNED },
      ],
    },
    {
      name: "Product Design Sprint",
      description: "From user needs to a pitch-ready physical prototype.",
      lessons: [
        { title: "User Needs & Personas", status: LessonStatus.PLANNED },
        { title: "Ideation & Sketching", status: LessonStatus.PLANNED },
        { title: "Prototyping in Cardboard / 3D Print", status: LessonStatus.PLANNED },
        { title: "Pitch Deck Development", status: LessonStatus.PLANNED },
      ],
    },
    {
      name: "Packaging & Market Presentation",
      description: "Structural packaging design and final market-ready presentation.",
      lessons: [
        { title: "Packaging Structure Design", status: LessonStatus.PLANNED },
        { title: "Mockups & Renders", status: LessonStatus.PLANNED },
        { title: "Final Presentation", status: LessonStatus.PLANNED },
      ],
    },
  ]);

  await makeUnits(printLab.id, [
    {
      name: "3D Printing Foundations",
      description: "CAD basics, slicer settings, and troubleshooting your first prints.",
      lessons: [
        { title: "Intro to CAD (Tinkercad / Fusion 360)", status: LessonStatus.COMPLETED },
        { title: "Slicer Settings & Print Prep", status: LessonStatus.COMPLETED },
        { title: "Troubleshooting Common Print Errors", status: LessonStatus.IN_PROGRESS },
        { title: "First Print Project", status: LessonStatus.IN_PROGRESS },
      ],
    },
    {
      name: "Design for Additive Manufacturing",
      description: "Parametric modeling and functional, multi-part prints.",
      lessons: [
        { title: "Parametric Modeling", status: LessonStatus.PLANNED },
        { title: "Functional Prints (Brackets, Joints)", status: LessonStatus.PLANNED },
        { title: "Multi-Part Assemblies", status: LessonStatus.PLANNED },
        { title: "Post-Processing Techniques", status: LessonStatus.PLANNED },
      ],
    },
  ]);

  // ---------------------------------------------------------------------
  // Students + Enrollments
  // ---------------------------------------------------------------------
  const grade8Names = ["Maya Chen", "Lucas Andersen", "Amara Okafor", "Sofia Rossi", "Ravi Patel"];
  const grade9Names = ["Elena Petrova", "Kenji Watanabe", "Zara Ahmed", "Noah Kim", "Isabela Santos"];
  const grade10Names = ["Yuki Tanaka", "Omar Hassan", "Freya Lindqvist", "Diego Fernandez", "Priya Sharma"];

  async function makeStudents(names: string[], gradeLevel: string, homeCourseId: string) {
    const students = [];
    for (const name of names) {
      const email = `${name.toLowerCase().replace(/\s+/g, ".")}@student.meridian.edu`;
      const student = await prisma.student.create({
        data: { name, gradeLevel, email, notes: "" },
      });
      await prisma.enrollment.create({ data: { studentId: student.id, courseId: homeCourseId } });
      await prisma.enrollment.create({ data: { studentId: student.id, courseId: printLab.id } });
      students.push(student);
    }
    return students;
  }

  const grade8Students = await makeStudents(grade8Names, "Grade 8", designArch.id);
  const grade9Students = await makeStudents(grade9Names, "Grade 9", robotics.id);
  const grade10Students = await makeStudents(grade10Names, "Grade 10", branding.id);
  const allStudents = [...grade8Students, ...grade9Students, ...grade10Students];

  // A few teacher observation notes
  await prisma.student.update({
    where: { id: grade8Students[0].id },
    data: { notes: "Strong spatial reasoning — encourage her to mentor peers during model-building sessions." },
  });
  await prisma.student.update({
    where: { id: grade9Students[2].id },
    data: { notes: "Struggles with wiring diagrams; pair with Kenji for the chassis build." },
  });
  await prisma.student.update({
    where: { id: grade10Students[1].id },
    data: { notes: "Excellent presenter — consider for the exhibition keynote pitch." },
  });

  // ---------------------------------------------------------------------
  // Attendance (light sample so the profile summary isn't empty)
  // ---------------------------------------------------------------------
  const attendancePattern: AttendanceStatus[] = [
    AttendanceStatus.PRESENT,
    AttendanceStatus.PRESENT,
    AttendanceStatus.PRESENT,
    AttendanceStatus.LATE,
    AttendanceStatus.PRESENT,
    AttendanceStatus.ABSENT,
    AttendanceStatus.PRESENT,
    AttendanceStatus.PRESENT,
  ];
  for (const student of allStudents) {
    for (let i = 0; i < attendancePattern.length; i++) {
      await prisma.attendance.create({
        data: {
          studentId: student.id,
          date: daysFromNow(-(attendancePattern.length - i) * 2, 8, 30),
          status: attendancePattern[(i + allStudents.indexOf(student)) % attendancePattern.length],
        },
      });
    }
  }

  // ---------------------------------------------------------------------
  // Assignments + Grades
  // ---------------------------------------------------------------------
  const siteAnalysis = await prisma.assignment.create({
    data: {
      courseId: designArch.id,
      title: "Site Analysis Report",
      description: "A written and diagrammatic analysis of an assigned site's climate, context, and constraints.",
      dueDate: daysFromNow(-10),
      maxPoints: 50,
      rubricNotes: "Context (10) · Climate diagrams (15) · Constraints & opportunities (15) · Clarity of communication (10)",
    },
  });

  const circuitCheckpoint = await prisma.assignment.create({
    data: {
      courseId: robotics.id,
      title: "Sensor Circuit Build Checkpoint",
      description: "Wire and test an ultrasonic sensor circuit; submit a labeled photo and short write-up.",
      dueDate: daysFromNow(-4),
      maxPoints: 40,
      rubricNotes: "Wiring correctness (20) · Testing & calibration notes (10) · Write-up clarity (10)",
    },
  });

  const logoPresentation = await prisma.assignment.create({
    data: {
      courseId: branding.id,
      title: "Logo Concept Presentation",
      description: "Present three logo directions for your chosen brand, with rationale tied to your positioning statement.",
      dueDate: daysFromNow(-2),
      maxPoints: 100,
      rubricNotes: "Concept range (30) · Craft & execution (30) · Rationale & positioning (25) · Delivery (15)",
    },
  });

  const firstPrint = await prisma.assignment.create({
    data: {
      courseId: printLab.id,
      title: "First 3D Print Submission",
      description: "Design and print a small functional object (max 8cm) using the slicer settings covered in class.",
      dueDate: daysFromNow(-1),
      maxPoints: 30,
      rubricNotes: "Design intent (10) · Print quality (10) · Reflection notes (10)",
    },
  });

  // Intentionally left ungraded below — it's not due yet, so it shows as "pending".
  await prisma.assignment.create({
    data: {
      courseId: designArch.id,
      title: "Scale Model: Community Space",
      description: "Build a 1:50 scale model of your proposed community space, incorporating passive design principles.",
      dueDate: daysFromNow(6),
      maxPoints: 100,
      rubricNotes: "Craft (30) · Passive design application (30) · Presentation (20) · Documentation (20)",
    },
  });

  async function gradeStudents(
    assignmentId: string,
    students: { id: string }[],
    scoreFn: (i: number) => number,
    feedbackFn: (i: number) => string
  ) {
    for (let i = 0; i < students.length; i++) {
      await prisma.grade.create({
        data: {
          studentId: students[i].id,
          assignmentId,
          score: scoreFn(i),
          feedback: feedbackFn(i),
        },
      });
    }
  }

  await gradeStudents(
    siteAnalysis.id,
    grade8Students,
    (i) => [44, 39, 47, 41, 36][i],
    (i) => ["Thorough climate analysis, tighten the constraints section.", "Good start — dig deeper into site context.", "Excellent diagrams and clear writing.", "Solid work, watch labeling conventions.", "Revisit the sun-path diagram for accuracy."][i]
  );

  await gradeStudents(
    circuitCheckpoint.id,
    grade9Students,
    (i) => [36, 33, 28, 38, 35][i],
    (i) => ["Clean wiring, calibration spot on.", "Good effort, double-check sensor mounting.", "Needs a re-test — noisy readings.", "Excellent documentation.", "Solid checkpoint, minor wiring cleanup needed."][i]
  );

  await gradeStudents(
    logoPresentation.id,
    grade10Students,
    (i) => [92, 78, 85, 71, 96][i],
    (i) => ["Outstanding range of concepts and a confident pitch.", "Solid concepts — rationale needs more depth.", "Strong craft, good positioning tie-in.", "Concepts felt similar — push for more range next time.", "Exceptional — ready for the exhibition wall."][i]
  );

  await gradeStudents(
    firstPrint.id,
    allStudents,
    (i) => [27, 25, 29, 22, 26, 24, 28, 21, 30, 23, 27, 26, 29, 25, 24][i % 15],
    () => "Nice first print — watch first-layer adhesion next time."
  );

  // ---------------------------------------------------------------------
  // Weekly Schedule (Mon–Fri)
  // ---------------------------------------------------------------------
  const semester = "Fall 2026";
  type Block = { day: number; start: string; end: string; room: string; courseId: string };
  const blocks: Block[] = [
    { day: 1, start: "08:30", end: "09:20", room: "Studio A", courseId: designArch.id },
    { day: 1, start: "09:30", end: "10:20", room: "Robotics Lab", courseId: robotics.id },
    { day: 1, start: "11:00", end: "11:50", room: "Fab Lab", courseId: printLab.id },

    { day: 2, start: "08:30", end: "09:20", room: "Design Studio B", courseId: branding.id },
    { day: 2, start: "09:30", end: "10:20", room: "Studio A", courseId: designArch.id },
    { day: 2, start: "13:00", end: "13:50", room: "Fab Lab", courseId: printLab.id },

    { day: 3, start: "08:30", end: "09:20", room: "Robotics Lab", courseId: robotics.id },
    { day: 3, start: "09:30", end: "10:20", room: "Design Studio B", courseId: branding.id },
    { day: 3, start: "11:00", end: "11:50", room: "Studio A", courseId: designArch.id },
    { day: 3, start: "13:00", end: "13:50", room: "Fab Lab", courseId: printLab.id },

    { day: 4, start: "08:30", end: "09:20", room: "Fab Lab", courseId: printLab.id },
    { day: 4, start: "09:30", end: "10:20", room: "Robotics Lab", courseId: robotics.id },
    { day: 4, start: "11:00", end: "11:50", room: "Design Studio B", courseId: branding.id },

    { day: 5, start: "08:30", end: "09:20", room: "Studio A", courseId: designArch.id },
    { day: 5, start: "09:30", end: "10:20", room: "Fab Lab", courseId: printLab.id },
    { day: 5, start: "11:00", end: "11:50", room: "Robotics Lab", courseId: robotics.id },
    { day: 5, start: "13:00", end: "13:50", room: "Design Studio B", courseId: branding.id },
  ];

  for (const b of blocks) {
    await prisma.scheduleBlock.create({
      data: { courseId: b.courseId, dayOfWeek: b.day, startTime: b.start, endTime: b.end, room: b.room, semester },
    });
  }

  // ---------------------------------------------------------------------
  // Calendar events
  // ---------------------------------------------------------------------
  await prisma.calendarEvent.createMany({
    data: [
      { title: "Midterm Exam Week", date: daysFromNow(14), endDate: daysFromNow(18), type: CalendarEventType.EXAM, description: "No regular class blocks — assessment schedule posted separately." },
      { title: "Fall STEAM Exhibition", date: daysFromNow(45), type: CalendarEventType.EXHIBITION, description: "Student showcase for Design & Architecture and Branding & Product Design." },
      { title: "Robotics Regional Competition", date: daysFromNow(52), type: CalendarEventType.EXHIBITION, description: "Off-site — Robotics & Engineering students only." },
      { title: "Autumn Break", date: daysFromNow(25), endDate: daysFromNow(29), type: CalendarEventType.BREAK, description: "School closed." },
      { title: "National Day Holiday", date: daysFromNow(9), type: CalendarEventType.HOLIDAY, description: "School closed." },
      { title: "Winter Break", date: daysFromNow(80), endDate: daysFromNow(94), type: CalendarEventType.BREAK, description: "School closed." },
    ],
  });

  // ---------------------------------------------------------------------
  // Tasks
  // ---------------------------------------------------------------------
  await prisma.task.createMany({
    data: [
      {
        title: "Grade Site Analysis Reports",
        description: "Finish written feedback for the remaining two reports.",
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueDate: daysFromNow(2),
        courseId: designArch.id,
        order: 0,
      },
      {
        title: "Order more PLA filament",
        description: "Running low on black and natural — order before the Print Lab restart.",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: daysFromNow(5),
        order: 1,
      },
      {
        title: "Submit semester grades to registrar",
        description: "Export gradebook and upload to the SIS portal.",
        status: TaskStatus.TODO,
        priority: TaskPriority.URGENT,
        dueDate: daysFromNow(1),
        order: 2,
      },
      {
        title: "Prep robotics competition rubric",
        description: "Draft the scoring rubric for the navigation challenge.",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.URGENT,
        dueDate: daysFromNow(3),
        courseId: robotics.id,
        order: 0,
      },
      {
        title: "Update Branding unit slides",
        description: "Add new typography examples to the identity systems deck.",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.LOW,
        dueDate: daysFromNow(8),
        courseId: branding.id,
        order: 1,
      },
      {
        title: "Book exhibition hall for Design showcase",
        description: "Confirm date with facilities and reserve AV equipment.",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        dueDate: daysFromNow(20),
        order: 2,
      },
      {
        title: "Print name tags for lab stations",
        description: "Laser-cut acrylic tags for the Fab Lab benches.",
        status: TaskStatus.DONE,
        priority: TaskPriority.LOW,
        dueDate: daysFromNow(-6),
        courseId: printLab.id,
        order: 0,
      },
      {
        title: "Review new project idea submissions",
        description: "Went through the project bank and tagged three for next semester.",
        status: TaskStatus.DONE,
        priority: TaskPriority.MEDIUM,
        dueDate: daysFromNow(-3),
        order: 1,
      },
    ],
  });

  // ---------------------------------------------------------------------
  // Project Ideas Bank
  // ---------------------------------------------------------------------
  const ideas = [
    {
      title: "Miniature Sustainable House Model",
      description: "Students design and build a scale model dwelling that applies passive solar heating, natural ventilation, and locally-sourced materials.",
      tags: "architecture,3D printing,sustainability",
      gradeLevel: "Grade 8",
      duration: "3 weeks",
      materials: "Foam board, cardstock, 3D printed accents, craft knives, glue",
      objectives: "Apply passive design principles; communicate architectural intent through a physical scale model.",
      used: true,
      usedCourseId: designArch.id,
      usedDaysAgo: 60,
    },
    {
      title: "Line-Following Robot Challenge",
      description: "Teams build and program a robot that autonomously follows a taped course, culminating in a timed class competition.",
      tags: "robotics,engineering",
      gradeLevel: "Grade 9",
      duration: "4 weeks",
      materials: "Robotics kits, IR sensors, tape, batteries",
      objectives: "Apply sensor feedback loops; iterate through testing and calibration.",
      used: true,
      usedCourseId: robotics.id,
      usedDaysAgo: 40,
    },
    {
      title: "Personal Brand Identity Kit",
      description: "Students develop a personal brand — logo, color palette, typography, and a one-page style guide.",
      tags: "branding,product design",
      gradeLevel: "Grade 10",
      duration: "2 weeks",
      materials: "Sketchbooks, design software (Illustrator/Figma), printer",
      objectives: "Practice positioning and visual identity systems thinking.",
      used: true,
      usedCourseId: branding.id,
      usedDaysAgo: 20,
    },
    {
      title: "Functional Phone Stand (Parametric Design)",
      description: "A short parametric-modeling exercise: design an adjustable phone stand and iterate through two printed revisions.",
      tags: "3D printing,product design,engineering",
      gradeLevel: "Grades 8-10",
      duration: "1 week",
      materials: "3D printer, PLA filament, calipers",
      objectives: "Build fluency with parametric CAD tools; understand tolerances for functional prints.",
      used: false,
    },
    {
      title: "Community Park Redesign Proposal",
      description: "Students survey an underused local space and propose a redesign, presenting to a mock community board.",
      tags: "architecture,sustainability",
      gradeLevel: "Grade 8",
      duration: "3 weeks",
      materials: "Site survey tools, presentation boards, model-making supplies",
      objectives: "Practice stakeholder-centered design and public presentation skills.",
      used: false,
    },
    {
      title: "Robotic Arm Claw Mechanism",
      description: "Design and 3D print a simple servo-driven claw mechanism capable of picking up small objects.",
      tags: "robotics,3D printing,engineering",
      gradeLevel: "Grade 9",
      duration: "3 weeks",
      materials: "Servos, 3D printer, microcontroller, fasteners",
      objectives: "Understand mechanical linkages; integrate CAD design with electronics.",
      used: false,
    },
    {
      title: "Eco-Packaging for a Local Product",
      description: "Students redesign packaging for a real local product using recyclable or compostable materials.",
      tags: "branding,product design,sustainability",
      gradeLevel: "Grade 10",
      duration: "2 weeks",
      materials: "Cardstock, recycled materials, cutting mats, adhesives",
      objectives: "Balance brand expression with material sustainability constraints.",
      used: false,
    },
    {
      title: "Accessible Doorknob Redesign",
      description: "An inclusive design challenge: redesign a common household object for users with limited hand mobility.",
      tags: "product design,engineering,3D printing",
      gradeLevel: "Grades 9-10",
      duration: "2 weeks",
      materials: "3D printer, modeling clay for ergonomic study, calipers",
      objectives: "Practice human-centered and inclusive design methods.",
      used: false,
    },
    {
      title: "School Wayfinding Signage System",
      description: "Design a cohesive signage system to help visitors navigate the school campus, from icon set to material specification.",
      tags: "branding,architecture",
      gradeLevel: "Grades 8-10",
      duration: "2 weeks",
      materials: "Design software, foam board mockups, campus map",
      objectives: "Design systematically across a family of related objects.",
      used: false,
    },
    {
      title: "Weather-Responsive Sensor Garden",
      description: "Build a small garden installation with sensors that respond to light and moisture, logging data over two weeks.",
      tags: "robotics,sustainability,engineering",
      gradeLevel: "Grade 9",
      duration: "4 weeks",
      materials: "Moisture/light sensors, microcontroller, planters, soil, seedlings",
      objectives: "Connect sensor data to real-world environmental systems.",
      used: false,
    },
  ];

  for (const idea of ideas) {
    await prisma.projectIdea.create({
      data: {
        title: idea.title,
        description: idea.description,
        tags: idea.tags,
        gradeLevel: idea.gradeLevel,
        duration: idea.duration,
        materials: idea.materials,
        objectives: idea.objectives,
        usedDate: idea.used ? daysFromNow(-(idea.usedDaysAgo ?? 0)) : null,
        usedCourseId: idea.used ? idea.usedCourseId : null,
      },
    });
  }

  // ---------------------------------------------------------------------
  // Activity log
  // ---------------------------------------------------------------------
  await prisma.activityLog.createMany({
    data: [
      { action: "Added grade", details: "Graded Priya Sharma — Logo Concept Presentation (96/100)", timestamp: daysFromNow(-1, 16, 0) },
      { action: "Created task", details: "Submit semester grades to registrar", timestamp: daysFromNow(-1, 14, 30) },
      { action: "Enrolled student", details: "Enrolled Ravi Patel in 3D Printing Lab", timestamp: daysFromNow(-2, 10, 0) },
      { action: "Marked lesson complete", details: "Building the Chassis — Robotics & Engineering", timestamp: daysFromNow(-2, 9, 15) },
      { action: "Added project idea", details: "Weather-Responsive Sensor Garden", timestamp: daysFromNow(-4, 15, 45) },
      { action: "Created assignment", details: "Scale Model: Community Space — Design & Architecture", timestamp: daysFromNow(-5, 11, 0) },
      { action: "Updated schedule", details: "Adjusted Wednesday block for 3D Printing Lab", timestamp: daysFromNow(-6, 8, 0) },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
