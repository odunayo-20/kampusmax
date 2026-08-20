import { Campus } from "@/types";

export const campuses: Campus[] = [
  {
    id: "rugipo",
    name: "Rufus Giwa Polytechnic",
    abbreviation: "RUGIPO",
    location: "Owo, Ondo State",
    departments: [
      "Computer Science",
      "Business Administration",
      "Electrical Engineering",
      "Mass Communication",
      "Public Administration",
      "Accounting",
      "Marketing",
      "Science Laboratory Technology",
    ],
  },
  {
    id: "oau",
    name: "Obafemi Awolowo University",
    abbreviation: "OAU",
    location: "Ile-Ife, Osun State",
    departments: ["Computer Science", "Law", "Medicine", "Engineering"],
  },
  {
    id: "ui",
    name: "University of Ibadan",
    abbreviation: "UI",
    location: "Ibadan, Oyo State",
    departments: ["Computer Science", "Medicine", "Engineering", "Arts"],
  },
  {
    id: "unilag",
    name: "University of Lagos",
    abbreviation: "UNILAG",
    location: "Akoka, Lagos State",
    departments: ["Computer Science", "Engineering", "Law", "Business Admin"],
  },
  {
    id: "unn",
    name: "University of Nigeria",
    abbreviation: "UNN",
    location: "Nsukka, Enugu State",
    departments: ["Computer Science", "Engineering", "Medicine", "Law"],
  },
  {
    id: "abu",
    name: "Ahmadu Bello University",
    abbreviation: "ABU",
    location: "Zaria, Kaduna State",
    departments: ["Computer Science", "Engineering", "Agriculture", "Law"],
  },
  {
    id: "uniabuja",
    name: "University of Abuja",
    abbreviation: "UNIABUJA",
    location: "Gwagwalada, FCT",
    departments: ["Computer Science", "Law", "Medicine", "Engineering"],
  },
  {
    id: "futo",
    name: "Federal University of Technology",
    abbreviation: "FUTO",
    location: "Owerri, Imo State",
    departments: ["Computer Science", "Engineering", "Biotechnology"],
  },
];

export const defaultCampus = campuses[0]; // RUGIPO
