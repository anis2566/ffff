import { getYear } from "date-fns";

export enum LEVELS {
  Primary = "Primary",
  Secondary = "Secondary",
  HigherSecondary = "Higher Secondary",
}

export enum GROUPS {
  Science = "Science",
  Business_Studies = "Business Studies",
  Humanities = "Humanities",
}

export enum INSTITUTE_TYPES {
  School = "School",
  College = "College",
}

export enum ADMISSION_TYPE {
  Monthly = "Monthly",
  Course = "Course",
}

export enum GENDER {
  Male = "Male",
  Female = "Female",
}

export enum NATIONALITY {
  Bangladeshi = "Bangladeshi",
  Foreigner = "Foreigner",
}

export enum RELIGION {
  Islam = "Islam",
  Hinduism = "Hinduism",
  Christianity = "Christianity",
  Buddhism = "Buddhism",
  Others = "Others",
}

export enum SHIFT {
  Morning = "Morning",
  Day = "Day",
  Evening = "Evening",
}

export enum MONTH {
  January = "January",
  February = "February",
  March = "March",
  April = "April",
  May = "May",
  June = "June",
  July = "July",
  August = "August",
  September = "September",
  October = "October",
  November = "November",
  December = "December",
}

export enum STUDENT_STATUS {
  Present = "Present",
  Absent = "Absent",
}

export enum ADMISSION_STATUS {
  Present = "Present",
  Absent = "Absent",
}

export enum ADMISSION_PAYMENT_STATUS {
  Paid = "Paid",
  Unpaid = "Unpaid",
}

export enum SALARY_STATUS {
  "N/A" = "N/A",
  Initiated = "Initiated",
  Present = "Present",
  Absent = "Absent",
}

export enum SALARY_PAYMENT_STATUS {
  "N/A" = "N/A",
  Paid = "Paid",
  Unpaid = "Unpaid",
}

export enum TEACHER_STATUS {
  Present = "Present",
  Absent = "Absent",
}

export enum PAYMENT_METHOD {
  Cash = "Cash",
  Bank = "Bank",
  "Mobile Banking" = "Mobile Banking",
}

export enum TEACHER_ADVANCE_STATUS {
  Pending = "Pending",
  Approved = "Approved",
  Paid = "Paid",
  Rejected = "Rejected",
}

export enum TEACHER_PAYMENT_STATUS {
  Pending = "Pending",
  Confirmed = "Confirmed",
  Paid = "Paid",
  Rejected = "Rejected",
}

export enum DAYS {
  Saturday = "Saturday",
  Sunday = "Sunday",
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
}

export enum ATTENDANCE_STATUS {
  Present = "Present",
  Absent = "Absent",
}

export enum EXAM_STATUS {
  Published = "Published",
  Unpublished = "Unpublished",
}

export enum DOCUMENT_TYPE {
  Question = "Question",
  Sheet = "Sheet",
}

export enum PRINT_TASK_STATUS {
  Pending = "Pending",
  Printed = "Printed",
}

export enum TODO_STATUS {
  Pending = "Pending",
  Completed = "Completed",
}

export enum ROLE {
  User = "User",
  "Office Assistant" = "Office Assistant",
  Management = "Management",
  HR = "HR",
  Accountant = "Accountant",
  "Computer Operator" = "Computer Operator",
  Admin = "Admin",
}

export enum NOTIFICATION_TYPE {
  Pending = "Pending",
  Scheduled = "Scheduled",
  Sending = "Sending",
  Sent = "Sent",
  Delivered = "Delivered",
  Read = "Read",
  Clicked = "Clicked",
  Failed = "Failed",
}

export enum NOTIFICATION_PRIORITY {
  Low = "Low",
  Normal = "Normal",
  High = "High",
  Urgent = "Urgent",
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 5;
export const DEFAULT_PAGE_SIZE = 5;
export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 30, 40, 50, 100, 200, 500];
export const DEFAULT_SORT_OPTIONS = [
  {
    label: "Newest",
    value: "desc",
  },
  {
    label: "Oldest",
    value: "asc",
  },
];

export const StudentDeactivationReasons = [
  "Family or Personal Issue",
  "Course Completed/Ended",
  "Payment Due",
  "Time Issue",
  "Relocated to Different City/Town",
  "Disciplinary Action",
  "Transfered to Another Institution",
  "Irregular Attendance",
  "Lack of Academic Performance",
  "Other",
];

export const TeacherDeactivationReasons = [
  "Family or Personal Issue",
  "Disciplinary Action",
  "Payment Due",
  "Time Issue",
  "Transfered to Another Institution",
  "Relocated to Different City/Town",
  "Irregular Attendance",
  "Other",
];

const currentYear = getYear(new Date());

export const Session = Array.from({ length: 4 }, (_, i) => {
  const year = currentYear - 2 + i;
  return [
    {
      label: year.toString(),
      value: year.toString(),
    },
    {
      label: `${year}-${year + 1}`,
      value: `${year}-${year + 1}`,
    },
  ];
}).flat();

export const currentSession = [
  currentYear.toString(),
  `${currentYear}-${currentYear + 1}`,
];

export const timeSlots = [
  "9:00 AM - 9:30 AM",
  "9:30 AM - 10:00 AM",
  "10:00 AM - 10:30 AM",
  "10:30 AM - 11:00 AM",
  "11:00 AM - 11:30 AM",
  "11:30 AM - 12:00 PM",
  "12:00 PM - 12:30 PM",
  "12:30 PM - 1:00 PM",
  "1:00 PM - 1:30 PM",
  "1:30 PM - 2:00 PM",
  "2:00 PM - 2:30 PM",
  "2:30 PM - 3:00 PM",
  "3:00 PM - 3:30 PM",
  "3:30 PM - 4:00 PM",
  "4:00 PM - 4:30 PM",
  "4:30 PM - 5:00 PM",
  "5:00 PM - 5:30 PM",
  "5:30 PM - 6:00 PM",
  "6:00 PM - 6:30 PM",
  "6:30 PM - 7:00 PM",
  "7:00 PM - 7:30 PM",
  "7:30 PM - 8:00 PM",
  "8:00 PM - 8:30 PM",
  "8:30 PM - 9:00 PM",
];

export function sortTimeSlots(input: string[]): string[] {
  return input.sort((a, b) => timeSlots.indexOf(a) - timeSlots.indexOf(b));
}

export const formatTime = (time: string, position: "start" | "end") => {
  return time.split("-")[position === "start" ? 0 : 1];
};

export function splitTimeRange(range: string, intervalMinutes = 30) {
  const [startStr, endStr] = range.split("-").map((s) => s.trim());

  const parseTime = (str: string) => {
    const [time, modifier] = str.split(" ");
    let hours = 0,
      minutes = 0;
    if (time) {
      const parts = time.split(":").map(Number);
      hours = parts[0] || 0;
      minutes = parts[1] || 0;
    }

    minutes = minutes || 0;

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const formatTime = (mins: number) => {
    const hours24 = Math.floor(mins / 60);
    const minutes = mins % 60; // now using const
    const modifier = hours24 >= 12 ? "PM" : "AM";
    const hours = hours24 % 12 || 12;

    return `${hours}:${String(minutes).padStart(2, "0")} ${modifier}`;
  };

  const start = parseTime(startStr ?? "");
  const end = parseTime(endStr ?? "");

  const slots: string[] = [];

  for (let t = start; t < end; t += intervalMinutes) {
    const slotStart = formatTime(t);
    const slotEnd = formatTime(Math.min(t + intervalMinutes, end));
    slots.push(`${slotStart} - ${slotEnd}`);
  }

  return slots;
}

export const dayOrder = {
  Saturday: 1,
  Sunday: 2,
  Monday: 3,
  Tuesday: 4,
  Wednesday: 5,
  Thursday: 6,
  Friday: 7,
};

type DaySchedule = {
  day: string;
  times: string[];
};

export function groupByDay(slots: string[]): DaySchedule[] {
  const grouped: Record<string, string[]> = {};

  for (const slot of slots) {
    const [day, ...timeParts] = slot.split(" ");
    const time = timeParts.join(" ");

    if (!day) continue;

    if (!grouped[day]) {
      grouped[day] = [];
    }
    grouped[day].push(time);
  }

  return Object.entries(grouped).map(([day, times]) => ({
    day,
    times,
  }));
}

export const primaryLevels = ["Two", "Three", "Four", "Five"];

export const secondaryLevels = [
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "HSC 1st Year",
  "HSC 2nd Year",
];

export const higherSecondaryLevels = ["HSC 1st Year", "HSC 2nd Year"];

export const modules = [
  {
    name: "Institute",
    actions: ["create", "read", "update", "delete"],
  },
  {
    name: "Subject",
    actions: ["create", "read", "update", "delete"],
  },
  {
    name: "Attendance",
    actions: ["create", "read", "update", "delete"],
  },
  {
    name: "admission_fee",
    actions: ["create", "read", "update", "delete"],
  },
  {
    name: "admission_payment",
    actions: ["create", "read", "update", "delete", "receive_payment"],
  },
  {
    name: "batch_class",
    actions: ["create", "read", "update", "delete"],
  },
  {
    name: "Batch",
    actions: ["create", "read", "update", "delete", "room_plan"],
  },
  {
    name: "Class",
    actions: ["create", "read", "update", "delete"],
  },
  {
    name: "Counter",
    actions: ["create", "read", "update", "delete"],
  },
  {
    name: "Dashboard",
    actions: ["read", "admin", "account", "computer_operator"],
  },
  {
    name: "Document",
    actions: [
      "create",
      "read",
      "update",
      "delete",
      "toggle_received",
      "toggle_finished",
      "push_print",
    ],
  },
  {
    name: "exam_category",
    actions: ["create", "read", "update", "delete"],
  },
  {
    name: "result",
    actions: ["create", "read", "update", "delete"],
  },
  {
    name: "exam",
    actions: ["create", "read", "update", "delete"],
  },
  {
    name: "homework",
    actions: ["create", "read", "update", "delete"],
  },
  {
    name: "house_payment",
    actions: ["create", "read", "update", "delete"],
  },
  {
    name: "house",
    actions: ["create", "read", "update", "delete"],
  },
  {
    name: "institute",
    actions: ["create", "read", "update", "delete"],
  },
  {
    name: "income",
    actions: ["create", "read", "update", "delete"],
  },
  {
    name: "print_task",
    actions: ["create", "read", "update", "delete", "toggle_status"],
  },
  {
    name: "report",
    actions: ["read", "daily", "income", "expense", "final"],
  },
  {
    name: "salary_fee",
    actions: ["create", "read", "update", "delete"],
  },
  {
    name: "salary_payment",
    actions: ["create", "read", "update", "delete", "receive_payment"],
  },
  {
    name: "student_attendance",
    actions: ["create", "read", "update", "delete"],
  },
  {
    name: "student",
    actions: [
      "create",
      "read",
      "update",
      "delete",
      "batch_transfer",
      "toggle_present",
    ],
  },
  {
    name: "subject",
    actions: ["create", "read", "update", "delete"],
  },
  {
    name: "teacher_advance",
    actions: ["create", "read", "update", "delete"],
  },
  {
    name: "teacher_payment",
    actions: ["create", "read", "update", "delete"],
  },
  {
    name: "teacher",
    actions: ["create", "read", "update", "delete"],
  },
  {
    name: "utility_payment",
    actions: ["create", "read", "update", "delete"],
  },
  {
    name: "user",
    actions: ["create", "read", "update", "delete"],
  },
  {
    name: "chat",
    actions: ["read"],
  },
  {
    name: "role",
    actions: ["create", "read", "update", "delete"],
  },
  {
    name: "permission",
    actions: ["create", "read", "update", "delete"],
  },
];

export const actions = ["create", "read", "update", "delete"];
