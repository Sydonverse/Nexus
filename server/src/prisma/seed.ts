import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Nexus...');

  // 1. Clean existing records (in proper foreign-key order)
  await prisma.submissionFeedback.deleteMany();
  await prisma.taskSubmission.deleteMany();
  await prisma.taskAssignment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectGroupMember.deleteMany();
  await prisma.projectGroup.deleteMany();
  await prisma.project.deleteMany();
  await prisma.message.deleteMany();
  await prisma.classSchedule.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.pushSubscription.deleteMany();
  await prisma.departmentMember.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await bcrypt.hash('password123', 12);

  // 2. Create Departments
  console.log('Creating departments...');
  const cyberDept = await prisma.department.create({
    data: {
      name: 'Cybersecurity',
      slug: 'cybersecurity',
      description: 'Defensive and offensive security, network intrusion detection, forensics, and ethical hacking.',
      icon: 'shield',
      colorHex: '#ef4444',
    },
  });

  const dataDept = await prisma.department.create({
    data: {
      name: 'Data Analysis',
      slug: 'data-analysis',
      description: 'Data wrangling, exploratory analysis, statistical modeling, machine learning, and BI dashboards.',
      icon: 'bar-chart-2',
      colorHex: '#3b82f6',
    },
  });

  const webDept = await prisma.department.create({
    data: {
      name: 'Web Development',
      slug: 'web-dev',
      description: 'Modern frontend, scalable backend architectures, cloud deployments, and Progressive Web Apps.',
      icon: 'globe',
      colorHex: '#10b981',
    },
  });

  const modelDept = await prisma.department.create({
    data: {
      name: '3D Modelling',
      slug: '3d-modelling',
      description: '3D asset creation, environment design, rigging, and animation for games and real-time visualization.',
      icon: 'box',
      colorHex: '#a855f7',
    },
  });

  const designDept = await prisma.department.create({
    data: {
      name: 'Graphic Design',
      slug: 'graphic-design',
      description: 'Brand identity systems, UI/UX interaction design, digital illustration, and visual communication.',
      icon: 'palette',
      colorHex: '#f59e0b',
    },
  });

  // 3. Create Users
  console.log('Creating hub users...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@nexus.hub',
      passwordHash: defaultPasswordHash,
      firstName: 'Sarah',
      lastName: 'Director',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  // Cybersecurity Tutor & Interns
  const cyberTutor = await prisma.user.create({
    data: {
      email: 'cyber.tutor@nexus.hub',
      passwordHash: defaultPasswordHash,
      firstName: 'Alex',
      lastName: 'Vance',
      role: 'TUTOR',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const cyberIntern1 = await prisma.user.create({
    data: {
      email: 'david.cyber@nexus.hub',
      passwordHash: defaultPasswordHash,
      firstName: 'David',
      lastName: 'Kim',
      role: 'INTERN',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
  });

  const cyberIntern2 = await prisma.user.create({
    data: {
      email: 'maya.cyber@nexus.hub',
      passwordHash: defaultPasswordHash,
      firstName: 'Maya',
      lastName: 'Patel',
      role: 'INTERN',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  // Data Analysis Tutor & Intern
  const dataTutor = await prisma.user.create({
    data: {
      email: 'data.tutor@nexus.hub',
      passwordHash: defaultPasswordHash,
      firstName: 'Evelyn',
      lastName: 'Reed',
      role: 'TUTOR',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
  });

  const dataIntern = await prisma.user.create({
    data: {
      email: 'sam.data@nexus.hub',
      passwordHash: defaultPasswordHash,
      firstName: 'Sam',
      lastName: 'Taylor',
      role: 'INTERN',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    },
  });

  // Web Dev Tutor
  const webTutor = await prisma.user.create({
    data: {
      email: 'web.tutor@nexus.hub',
      passwordHash: defaultPasswordHash,
      firstName: 'Marcus',
      lastName: 'Chen',
      role: 'TUTOR',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    },
  });

  // 4. Enroll Members into Departments
  console.log('Enrolling department memberships...');
  // Cyber enrollments
  await prisma.departmentMember.createMany({
    data: [
      { userId: cyberTutor.id, departmentId: cyberDept.id, role: 'TUTOR', status: 'APPROVED' },
      { userId: cyberIntern1.id, departmentId: cyberDept.id, role: 'INTERN', status: 'APPROVED' },
      { userId: cyberIntern2.id, departmentId: cyberDept.id, role: 'INTERN', status: 'APPROVED' },
      { userId: dataTutor.id, departmentId: dataDept.id, role: 'TUTOR', status: 'APPROVED' },
      { userId: dataIntern.id, departmentId: dataDept.id, role: 'INTERN', status: 'APPROVED' },
      { userId: webTutor.id, departmentId: webDept.id, role: 'TUTOR', status: 'APPROVED' },
    ],
  });

  // 5. Seed Resources for Cybersecurity
  console.log('Seeding learning resources...');
  await prisma.resource.createMany({
    data: [
      {
        departmentId: cyberDept.id,
        uploadedById: cyberTutor.id,
        title: 'OWASP Top 10 Web Security Guide',
        description: 'Comprehensive walkthrough of injection vulnerabilities, broken authentication, and mitigation strategies.',
        fileUrl: '/uploads/sample-owasp-guide.pdf',
        fileName: 'OWASP_Top_10_2026.pdf',
        fileMimeType: 'application/pdf',
        fileSizeBytes: 2450000,
        category: 'REFERENCE',
        tags: 'security,owasp,web-security',
        isPinned: true,
      },
      {
        departmentId: cyberDept.id,
        uploadedById: cyberTutor.id,
        title: 'Network Penetration Testing Lab Script',
        description: 'Bash automation script for network host discovery, port enumeration, and service banner grabbing.',
        fileUrl: '/uploads/sample-nmap-script.sh',
        fileName: 'recon_scan_suite.sh',
        fileMimeType: 'text/x-shellscript',
        fileSizeBytes: 48200,
        category: 'TOOL',
        tags: 'nmap,recon,script',
        isPinned: false,
      },
      {
        departmentId: cyberDept.id,
        uploadedById: cyberTutor.id,
        title: 'Wireshark Packet Analysis Deep-Dive',
        description: 'Practice PCAP capture files showcasing TCP handshakes, TLS negotiation, and suspicious beaconing traffic.',
        fileUrl: '/uploads/sample-traffic.pcap',
        fileName: 'lab_traffic_analysis.pcap',
        fileMimeType: 'application/vnd.tcpdump.pcap',
        fileSizeBytes: 15400000,
        category: 'EXERCISE',
        tags: 'wireshark,packet-analysis,forensics',
        isPinned: false,
      },
      // Data Analysis Resource
      {
        departmentId: dataDept.id,
        uploadedById: dataTutor.id,
        title: 'Pandas & NumPy Performance Optimization Guide',
        description: 'Vectorization patterns, memory reduction techniques, and chunking large datasets.',
        fileUrl: '/uploads/sample-pandas-guide.pdf',
        fileName: 'Data_Wrangling_Mastery.pdf',
        fileMimeType: 'application/pdf',
        fileSizeBytes: 3100000,
        category: 'TUTORIAL',
        tags: 'python,pandas,numpy',
        isPinned: true,
      },
    ],
  });

  // 6. Seed Announcements
  console.log('Seeding announcements...');
  await prisma.announcement.createMany({
    data: [
      {
        departmentId: cyberDept.id,
        authorId: cyberTutor.id,
        title: 'Mid-Cohort Capture The Flag (CTF) Challenge Announced!',
        content: 'Get your tools ready! Next Friday at 2:00 PM we are hosting a 4-hour live CTF covering web exploits, reverse engineering, and cryptography. Top teams receive certifications.',
        priority: 'URGENT',
        isPinned: true,
      },
      {
        departmentId: cyberDept.id,
        authorId: cyberTutor.id,
        title: 'VPN Lab Access Credentials Updated',
        content: 'The OpenVPN profiles for the practice penetration testing lab subnet (10.10.x.x) have been refreshed. Please download your new configuration from the shared lab drive.',
        priority: 'IMPORTANT',
        isPinned: false,
      },
      {
        departmentId: dataDept.id,
        authorId: dataTutor.id,
        title: 'Kaggle Competition Registration is Now Live',
        content: 'All data interns are required to form pairs and register for the healthcare analytics dataset competition.',
        priority: 'NORMAL',
        isPinned: true,
      },
    ],
  });

  // 7. Seed Class Schedules
  console.log('Seeding class schedules...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(12, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 3);
  nextWeek.setHours(14, 0, 0, 0);

  const nextWeekEnd = new Date(nextWeek);
  nextWeekEnd.setHours(16, 30, 0, 0);

  await prisma.classSchedule.createMany({
    data: [
      {
        departmentId: cyberDept.id,
        scheduledById: cyberTutor.id,
        title: 'Hands-on Web Application Penetration Testing',
        description: 'Interactive session exploring SQL injection, cross-site scripting (XSS), and CSRF token bypasses on DVWA.',
        startTime: tomorrow,
        endTime: tomorrowEnd,
        location: 'Cyber Security Lab 2B / Virtual Zoom',
        meetingLink: 'https://nexus.hub/zoom/cyber-lab',
      },
      {
        departmentId: cyberDept.id,
        scheduledById: cyberTutor.id,
        title: 'Incident Response & Memory Forensics Workshop',
        description: 'Extracting artifacts and running Volatility on memory dumps from a compromised Windows server.',
        startTime: nextWeek,
        endTime: nextWeekEnd,
        location: 'Tech Hub Main Auditorium',
        meetingLink: 'https://nexus.hub/zoom/cyber-forensics',
      },
    ],
  });

  // 8. Seed Projects, Groups, and Tasks for Cybersecurity
  console.log('Seeding project management workspace...');
  const cyberProject = await prisma.project.create({
    data: {
      departmentId: cyberDept.id,
      createdById: cyberTutor.id,
      title: 'Enterprise Threat & Vulnerability Assessment',
      description: 'Comprehensive simulated red-team audit of the fictitious OmniCorp infrastructure. Interns will perform OSINT, network vulnerability scanning, web security assessment, and generate an executive remediation report.',
      status: 'IN_PROGRESS',
      startDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
    },
  });

  // Groups
  const groupA = await prisma.projectGroup.create({
    data: {
      projectId: cyberProject.id,
      name: 'Group Alpha (Network & Infrastructure)',
      description: 'Focuses on subnet enumeration, port scanning, and misconfigured services.',
    },
  });

  const groupB = await prisma.projectGroup.create({
    data: {
      projectId: cyberProject.id,
      name: 'Group Bravo (Web App & API Security)',
      description: 'Focuses on API endpoint fuzzing, auth validation, and client-side security.',
    },
  });

  // Assign members to groups
  await prisma.projectGroupMember.createMany({
    data: [
      { groupId: groupA.id, userId: cyberIntern1.id, role: 'LEAD' },
      { groupId: groupB.id, userId: cyberIntern2.id, role: 'LEAD' },
    ],
  });

  // Tasks
  const taskDone = await prisma.task.create({
    data: {
      projectId: cyberProject.id,
      projectGroupId: groupA.id,
      title: 'OSINT & Subdomain Enumeration',
      description: 'Run Amass and Sublist3r to document all public-facing assets of OmniCorp.',
      status: 'DONE',
      priority: 'HIGH',
      sortOrder: 1,
    },
  });

  const taskReview = await prisma.task.create({
    data: {
      projectId: cyberProject.id,
      projectGroupId: groupA.id,
      title: 'External Nmap Network Vulnerability Scan',
      description: 'Perform full SYN port scan on target range 192.168.50.0/24 with NSE vulnerability scripts.',
      status: 'IN_REVIEW',
      priority: 'CRITICAL',
      sortOrder: 2,
    },
  });

  const taskProgress = await prisma.task.create({
    data: {
      projectId: cyberProject.id,
      projectGroupId: groupB.id,
      title: 'API Authentication & JWT Testing',
      description: 'Analyze token signing algorithms, test for secret key brute-force, and inspect role claims.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      sortOrder: 3,
    },
  });

  const taskTodo = await prisma.task.create({
    data: {
      projectId: cyberProject.id,
      projectGroupId: groupB.id,
      title: 'Executive Remediation & Risk Matrix Report',
      description: 'Compile CVSS v3 scores, technical evidence, and prioritized business recommendations into final PDF.',
      status: 'TODO',
      priority: 'MEDIUM',
      sortOrder: 4,
    },
  });

  // Assign tasks
  await prisma.taskAssignment.createMany({
    data: [
      { taskId: taskDone.id, userId: cyberIntern1.id },
      { taskId: taskReview.id, userId: cyberIntern1.id },
      { taskId: taskProgress.id, userId: cyberIntern2.id },
      { taskId: taskTodo.id, userId: cyberIntern2.id },
    ],
  });

  // Submission for the completed task
  const submission1 = await prisma.taskSubmission.create({
    data: {
      taskId: taskDone.id,
      submittedById: cyberIntern1.id,
      notes: 'Completed full passive and active OSINT enumeration. Discovered 14 subdomains and 3 staging servers.',
      fileUrls: JSON.stringify(['/uploads/osint_results.txt']),
    },
  });

  await prisma.submissionFeedback.create({
    data: {
      submissionId: submission1.id,
      reviewerId: cyberTutor.id,
      comment: 'Excellent methodology and thorough DNS reconnaissance. Approved!',
      verdict: 'APPROVED',
    },
  });

  // Submission under review
  await prisma.taskSubmission.create({
    data: {
      taskId: taskReview.id,
      submittedById: cyberIntern1.id,
      notes: 'Nmap XML output generated. Found port 445 open with vulnerable SMBv1 dialect and port 8080 Jenkins unauthenticated dashboard.',
      fileUrls: JSON.stringify(['/uploads/nmap_scan_omnicorp.xml']),
    },
  });

  // 9. Seed Department Messages
  console.log('Seeding department chat messages...');
  await prisma.message.createMany({
    data: [
      {
        departmentId: cyberDept.id,
        senderId: cyberTutor.id,
        content: 'Welcome everyone to the Cybersecurity department space! All lab files and announcements will live right here on Nexus.',
      },
      {
        departmentId: cyberDept.id,
        senderId: cyberIntern1.id,
        content: 'Thanks Alex! Really excited for the penetration testing lab and the CTF next week.',
      },
      {
        departmentId: cyberDept.id,
        senderId: cyberIntern2.id,
        content: 'Just uploaded the initial reconnaissance notes for Group Bravo. Will check the JWT endpoints this afternoon!',
      },
    ],
  });

  console.log('✅ Nexus database successfully seeded with demo accounts and data!');
  console.log(`
  DEMO CREDENTIALS:
  ======================================================
  Admin:               admin@nexus.hub        / password123
  Cyber Tutor:         cyber.tutor@nexus.hub  / password123
  Cyber Intern (David): david.cyber@nexus.hub  / password123
  Cyber Intern (Maya):  maya.cyber@nexus.hub   / password123
  Data Tutor:          data.tutor@nexus.hub   / password123
  Data Intern (Sam):   sam.data@nexus.hub     / password123
  Web Dev Tutor:       web.tutor@nexus.hub    / password123
  ======================================================
  `);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
