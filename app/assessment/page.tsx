"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  Bug,
  Home,
  Phone,
  Upload,
  X,
  AlertTriangle,
} from "lucide-react";
import { AIChatbot } from "@/components/ai-chatbot";
import { ContactFormModal } from "@/components/contact-form-modal";
import { useRouter } from "next/navigation";

interface Question {
  id: number;
  question: string;
  options: { value: string; label: string }[];
  multiple?: boolean;
}

interface UserAnswers {
  [key: number]: string | string[];
}

const pestTypes = [
  "Ants (Carpenter, Argentine, Odorous, etc.)",
  "Spiders",
  "Earwigs",
  "Silverfish",
  "Beetles (Carpet, Weevils, etc.)",
  "Cockroaches (German, Oriental, American, Turkish)",
  "Stored Food Pests (e.g., Indian Meal Moths)",
  "Rodents (Rats, Mice)",
  "Gophers",
  "Moles",
  "Bees",
  "Wasps",
  "Yellow Jackets",
];

const pestSpecificQuestions: { [key: string]: Question[] } = {
  "Ants (Carpenter, Argentine, Odorous, etc.)": [
    {
      id: 2,
      question:
        "Have you observed ants crawling along visible trails (e.g., walls, floors, counters)?",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
    },
    {
      id: 3,
      question: "Where have you seen ants most frequently?",
      options: [
        { value: "kitchen", label: "Kitchen" },
        { value: "bathroom", label: "Bathroom" },
        { value: "bedroom", label: "Bedroom" },
        { value: "living", label: "Living areas" },
      ],
    },
    {
      id: 4,
      question:
        "Are you seeing large numbers of ants, or just a few at a time?",
      options: [
        { value: "hundreds", label: "Large numbers (hundreds)" },
        { value: "few", label: "A few ants at a time" },
        { value: "occasional", label: "Only occasional sightings" },
      ],
    },
    {
      id: 5,
      question:
        "Have you noticed any damage to wood or structures in your home?",
      options: [
        { value: "yes_damage", label: "Yes, visible holes or damage to wood" },
        { value: "no_damage", label: "No, I haven't seen damage" },
      ],
    },
    {
      id: 6,
      question: "Have you noticed any nests or piles of sawdust?",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
    },
  ],
  Spiders: [
    {
      id: 2,
      question:
        "Have you noticed spider webs in corners or hidden areas of your home?",
      options: [
        { value: "often", label: "Yes, often" },
        { value: "occasionally", label: "Occasionally" },
        { value: "no_webs", label: "No webs found" },
      ],
    },
    {
      id: 3,
      question: "How many spiders have you observed?",
      options: [
        { value: "several_large", label: "Several large spiders" },
        { value: "few_small", label: "A few small spiders" },
        { value: "one_two", label: "Only one or two spiders" },
      ],
    },
    {
      id: 4,
      question: "What areas have you seen spiders the most?",
      options: [
        { value: "attic_basement", label: "Attic / Basement" },
        {
          value: "living_areas",
          label: "Living areas (e.g., corners, behind furniture)",
        },
        { value: "outside", label: "Outside, near doors/windows" },
      ],
    },
    {
      id: 5,
      question: "Are you seeing egg sacs or spiderlings (small spider babies)?",
      options: [
        { value: "yes_sacs", label: "Yes, I've seen sacs or babies" },
        {
          value: "no_sacs",
          label: "No, I haven't seen egg sacs or spiderlings",
        },
      ],
    },
  ],
  "Cockroaches (German, Oriental, American, Turkish)": [
    {
      id: 2,
      question: "How often are you seeing cockroaches?",
      options: [
        { value: "daily", label: "Daily or multiple times per day" },
        { value: "occasionally", label: "Occasionally" },
        { value: "rarely", label: "Rarely" },
      ],
    },
    {
      id: 3,
      question: "Have you noticed any cockroach droppings or egg cases?",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
    },
    {
      id: 4,
      question: "Where have you observed the cockroaches?",
      options: [
        { value: "kitchen", label: "Kitchen (food, counters, cabinets)" },
        { value: "bathroom", label: "Bathroom" },
        { value: "appliances", label: "Behind appliances, under sinks" },
        { value: "living", label: "Living areas (e.g., bedrooms)" },
      ],
    },
    {
      id: 5,
      question:
        "Have you noticed any musty odors in areas where roaches are active?",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
    },
  ],
  "Rodents (Rats, Mice)": [
    {
      id: 2,
      question:
        "How often are you hearing scurrying or scratching noises, especially at night?",
      options: [
        { value: "every_night", label: "Every night or often" },
        { value: "occasionally", label: "Occasionally" },
        { value: "never", label: "Never heard anything" },
      ],
    },
    {
      id: 3,
      question:
        "Have you observed rodent droppings or gnaw marks around your home?",
      options: [
        { value: "multiple_places", label: "Yes, in multiple places" },
        { value: "one_area", label: "Only in one area" },
        { value: "no_signs", label: "No visible signs" },
      ],
    },
    {
      id: 4,
      question: "Where have you seen rodents the most?",
      options: [
        { value: "kitchen", label: "Kitchen or pantry" },
        { value: "attic_basement", label: "Attic, basement, or crawl space" },
        {
          value: "living",
          label: "Living areas (under furniture, behind walls)",
        },
      ],
    },
    {
      id: 5,
      question: "Have you noticed any nests or burrows?",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
    },
  ],
};

pestSpecificQuestions["Earwigs"] = [
  {
    id: 2,
    question:
      "Have you noticed earwigs in damp, dark areas (e.g., bathrooms, kitchens, basements)?",
    options: [
      { value: "often", label: "Yes, often" },
      { value: "occasionally", label: "Occasionally" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: 3,
    question:
      "Have you found earwigs in or around potted plants or under debris?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: 4,
    question: "How many earwigs are you seeing at a time?",
    options: [
      { value: "several", label: "Several" },
      { value: "one_two", label: "One or two" },
      { value: "none", label: "No visible pests" },
    ],
  },
];

pestSpecificQuestions["Silverfish"] = [
  {
    id: 2,
    question:
      "Are you noticing silverfish in bathrooms, kitchens, or basements?",
    options: [
      { value: "often", label: "Yes, often" },
      { value: "occasionally", label: "Occasionally" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: 3,
    question: "Have you noticed damage to books, wallpaper, or fabrics?",
    options: [
      { value: "yes_damage", label: "Yes, I've seen holes or damage" },
      { value: "no_damage", label: "No damage" },
    ],
  },
  {
    id: 4,
    question: "How often are you seeing silverfish?",
    options: [
      { value: "daily", label: "Daily or multiple times per week" },
      { value: "occasionally", label: "Occasionally (once a week or less)" },
      { value: "rarely", label: "Rarely or never" },
    ],
  },
];

pestSpecificQuestions["Beetles (Carpet, Weevils, etc.)"] = [
  {
    id: 2,
    question: "Have you noticed beetles in carpets, fabrics, or stored food?",
    options: [
      { value: "carpets", label: "Yes, in carpets/fabrics" },
      { value: "food", label: "Yes, in stored food" },
      { value: "both", label: "Both areas" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: 3,
    question: "Have you seen larvae or damage to materials?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: 4,
    question: "How frequently are you seeing beetles?",
    options: [
      { value: "daily", label: "Daily" },
      { value: "weekly", label: "Weekly" },
      { value: "rarely", label: "Rarely" },
    ],
  },
];

pestSpecificQuestions["Stored Food Pests (e.g., Indian Meal Moths)"] = [
  {
    id: 2,
    question:
      "Have you noticed moths or larvae in dry food items (e.g., flour, grains, cereal)?",
    options: [
      { value: "yes_in_food", label: "Yes, I've seen them in food" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: 3,
    question: "Are you noticing any webbing or damage to food packaging?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: 4,
    question: "Have you thrown away any infested food recently?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
];

pestSpecificQuestions["Gophers"] = [
  {
    id: 2,
    question:
      "Have you noticed mounds or tunnels in your yard, garden, or lawn?",
    options: [
      { value: "multiple", label: "Yes, multiple mounds" },
      { value: "one_two", label: "Only one or two" },
      { value: "no_mounds", label: "No mounds" },
    ],
  },
  {
    id: 3,
    question:
      "Do you notice damage to plants, roots, or underground structures?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: 4,
    question: "Have you seen burrowing activity or noticed gophers?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
];

pestSpecificQuestions["Moles"] = [
  {
    id: 2,
    question: "Have you noticed raised tunnels or mounds in your lawn?",
    options: [
      { value: "multiple", label: "Yes, multiple tunnels/mounds" },
      { value: "few", label: "Only a few" },
      { value: "none", label: "No tunnels or mounds" },
    ],
  },
  {
    id: 3,
    question: "Is there damage to your lawn or garden from tunneling?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: 4,
    question: "Have you actually seen moles or just the damage?",
    options: [
      { value: "seen_moles", label: "I've seen moles" },
      { value: "just_damage", label: "Just the damage" },
    ],
  },
];

pestSpecificQuestions["Bees"] = [
  {
    id: 2,
    question: "Have you noticed bee hives or nests near your home or property?",
    options: [
      { value: "yes_near", label: "Yes, near windows, roof, or eaves" },
      { value: "no_nests", label: "No, I haven't seen any nests" },
    ],
  },
  {
    id: 3,
    question: "Are you seeing bees flying around frequently?",
    options: [
      { value: "frequently", label: "Yes, frequently" },
      { value: "occasionally", label: "Occasionally" },
      { value: "no", label: "No, not seen any" },
    ],
  },
  {
    id: 4,
    question:
      "Have you been stung or noticed aggressive behavior from the bees?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
];

pestSpecificQuestions["Wasps"] = [
  {
    id: 2,
    question: "Have you noticed wasp nests near your home or property?",
    options: [
      { value: "yes_near", label: "Yes, near windows, roof, or eaves" },
      { value: "no_nests", label: "No, I haven't seen any nests" },
    ],
  },
  {
    id: 3,
    question: "Are you seeing wasps flying around frequently?",
    options: [
      { value: "frequently", label: "Yes, frequently" },
      { value: "occasionally", label: "Occasionally" },
      { value: "no", label: "No, not seen any" },
    ],
  },
  {
    id: 4,
    question:
      "Have you been stung or noticed aggressive behavior from the wasps?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
];

pestSpecificQuestions["Yellow Jackets"] = [
  {
    id: 2,
    question:
      "Have you noticed yellow jacket nests near your home or property?",
    options: [
      { value: "yes_near", label: "Yes, near windows, roof, or eaves" },
      { value: "no_nests", label: "No, I haven't seen any nests" },
    ],
  },
  {
    id: 3,
    question: "Are you seeing yellow jackets flying around frequently?",
    options: [
      { value: "frequently", label: "Yes, frequently" },
      { value: "occasionally", label: "Occasionally" },
      { value: "no", label: "No, not seen any" },
    ],
  },
  {
    id: 4,
    question:
      "Have you been stung or noticed aggressive behavior from the yellow jackets?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
];

function calculateSeverity(selectedPest: string, answers: UserAnswers): string {
  const questions = pestSpecificQuestions[selectedPest] || [];
  let severityScore = 0;

  questions.forEach((question) => {
    const answer = answers[question.id] as string;

    // High severity indicators
    if (
      answer === "hundreds" ||
      answer === "daily" ||
      answer === "every_night" ||
      answer === "multiple_places" ||
      answer === "often" ||
      answer === "several_large" ||
      answer === "yes_damage" ||
      answer === "yes_sacs" ||
      answer === "multiple" ||
      answer === "frequently" ||
      (answer === "yes" && question.question.includes("aggressive"))
    ) {
      severityScore += 3;
    }
    // Medium severity indicators
    else if (
      answer === "few" ||
      answer === "occasionally" ||
      answer === "one_area" ||
      answer === "few_small" ||
      answer === "one_two" ||
      answer === "weekly"
    ) {
      severityScore += 2;
    }
    // Low severity indicators
    else if (
      answer === "occasional" ||
      answer === "rarely" ||
      answer === "no_signs" ||
      answer === "no_damage" ||
      answer === "no" ||
      answer === "none"
    ) {
      severityScore += 1;
    }
  });

  const maxPossibleScore = questions.length * 3;
  const severityPercentage = (severityScore / maxPossibleScore) * 100;

  if (severityPercentage >= 70) return "Severe";
  if (severityPercentage >= 40) return "High";
  return "Moderate";
}

const pestRecommendations: { [key: string]: { [key: string]: string[] } } = {
  "Ants (Carpenter, Argentine, Odorous, etc.)": {
    Moderate: [
      "Seal Entry Points: Seal cracks, gaps, and crevices around windows, doors, and walls where ants are entering.",
      "Use Ant Baits: Place ant bait or gel in areas where ants are most active (e.g., kitchen, bathroom). The ants will carry the bait back to the nest.",
    ],
    High: [
      "Seal Entry Points: Seal cracks, gaps, and crevices around windows, doors, and walls where ants are entering.",
      "Use Ant Baits: Place ant bait or gel in areas where ants are most active (e.g., kitchen, bathroom). The ants will carry the bait back to the nest.",
      "Professional Treatment: Consider professional ant control for persistent infestations.",
    ],
    Severe: [
      "Immediate Professional Treatment: Contact a pest control professional immediately for severe ant infestations.",
      "Structural Inspection: Have your property inspected for structural damage, especially with carpenter ants.",
    ],
  },
  Spiders: {
    Moderate: [
      "Vacuum Webs Regularly: Regularly vacuum spider webs, especially in corners, ceilings, and other hidden areas.",
      "Remove Clutter: Clear clutter in dark areas (e.g., closets, basements), as spiders often nest in undisturbed places.",
    ],
    High: [
      "Vacuum Webs Regularly: Regularly vacuum spider webs, especially in corners, ceilings, and other hidden areas.",
      "Remove Clutter: Clear clutter in dark areas (e.g., closets, basements), as spiders often nest in undisturbed places.",
      "Seal Entry Points: Seal cracks and gaps where spiders may enter your home.",
    ],
    Severe: [
      "Professional Treatment: Contact a pest control professional for severe spider infestations.",
      "Species Identification: Have spiders identified to determine if they are dangerous species.",
    ],
  },
  "Cockroaches (German, Oriental, American, Turkish)": {
    Moderate: [
      "Clean Regularly: Cockroaches are attracted to food and grease, so clean kitchen counters, floors, and under appliances daily.",
      "Set Traps: Use cockroach traps or gel bait in areas where you've seen activity.",
      "Fix Leaks: Cockroaches are attracted to moisture, so fix any leaks in pipes or faucets.",
    ],
    High: [
      "Clean Regularly: Cockroaches are attracted to food and grease, so clean kitchen counters, floors, and under appliances daily.",
      "Set Traps: Use cockroach traps or gel bait in areas where you've seen activity.",
      "Fix Leaks: Cockroaches are attracted to moisture, so fix any leaks in pipes or faucets.",
      "Professional Baiting: Consider professional-grade baiting systems for persistent problems.",
    ],
    Severe: [
      "Immediate Professional Treatment: Contact a pest control professional immediately for severe cockroach infestations.",
      "Health Risk Assessment: Cockroaches can spread diseases - immediate action required.",
    ],
  },
  "Rodents (Rats, Mice)": {
    Moderate: [
      "Seal Entry Points: Use steel wool or caulk to seal cracks around windows, doors, and foundation, where rodents can enter.",
      "Set Traps: Use snap traps, live traps, or bait stations along walls and pathways where rodents travel.",
      "Remove Food Sources: Store food in sealed containers, and clean up crumbs or spills immediately.",
      "Remove Clutter: Clear clutter in attics, basements, and under furniture where rodents can nest.",
    ],
    High: [
      "Seal Entry Points: Use steel wool or caulk to seal cracks around windows, doors, and foundation, where rodents can enter.",
      "Set Traps: Use snap traps, live traps, or bait stations along walls and pathways where rodents travel.",
      "Remove Food Sources: Store food in sealed containers, and clean up crumbs or spills immediately.",
      "Remove Clutter: Clear clutter in attics, basements, and under furniture where rodents can nest.",
      "Professional Baiting: Consider professional rodent control programs.",
    ],
    Severe: [
      "Immediate Professional Treatment: Contact a pest control professional immediately for severe rodent infestations.",
      "Health and Safety Assessment: Rodents can spread diseases and cause structural damage - immediate action required.",
    ],
  },
};

pestRecommendations["Earwigs"] = {
  Moderate: [
    "Reduce Moisture: Earwigs are attracted to moisture, so fix any leaks in bathrooms, kitchens, or basements.",
    "Remove Hiding Spots: Clear leaves, mulch, and other debris around the foundation of your home where earwigs may hide.",
  ],
  High: [
    "Reduce Moisture: Earwigs are attracted to moisture, so fix any leaks in bathrooms, kitchens, or basements.",
    "Remove Hiding Spots: Clear leaves, mulch, and other debris around the foundation of your home where earwigs may hide.",
    "Perimeter Treatment: Apply diatomaceous earth around entry points.",
  ],
  Severe: [
    "Professional Treatment: Contact a pest control professional for severe earwig infestations.",
  ],
};

pestRecommendations["Silverfish"] = {
  Moderate: [
    "Reduce Humidity: Use a dehumidifier in damp areas (bathrooms, basements) to lower humidity, which attracts silverfish.",
    "Store Food Properly: Store dry foods like grains and flour in airtight containers.",
  ],
  High: [
    "Reduce Humidity: Use a dehumidifier in damp areas (bathrooms, basements) to lower humidity, which attracts silverfish.",
    "Store Food Properly: Store dry foods like grains and flour in airtight containers.",
    "Seal Cracks: Seal cracks and crevices where silverfish may hide.",
  ],
  Severe: [
    "Professional Treatment: Contact a pest control professional for severe silverfish infestations.",
  ],
};

pestRecommendations["Beetles (Carpet, Weevils, etc.)"] = {
  Moderate: [
    "Vacuum Regularly: Vacuum carpets, floors, furniture, and other places where beetles may be hiding or laying eggs.",
    "Store Dry Goods Properly: If dealing with weevils or other food pests, store dry food in airtight containers.",
    "Wash Fabric Items: Wash blankets, curtains, and rugs in hot water to kill larvae and eggs.",
  ],
  High: [
    "Vacuum Regularly: Vacuum carpets, floors, furniture, and other places where beetles may be hiding or laying eggs.",
    "Store Dry Goods Properly: If dealing with weevils or other food pests, store dry food in airtight containers.",
    "Wash Fabric Items: Wash blankets, curtains, and rugs in hot water to kill larvae and eggs.",
    "Professional Treatment: Consider professional beetle control for persistent infestations.",
  ],
  Severe: [
    "Immediate Professional Treatment: Contact a pest control professional immediately for severe beetle infestations.",
  ],
};

pestRecommendations["Stored Food Pests (e.g., Indian Meal Moths)"] = {
  Moderate: [
    "Inspect and Discard Infested Food: Check all food products in your pantry, especially grains and dried fruits, for signs of infestation. Discard any infested items.",
    "Store Food Properly: Store all dry food products in airtight containers to prevent pests from accessing them.",
    "Vacuum and Clean: Vacuum pantry shelves and surrounding areas to remove larvae, eggs, and webs.",
  ],
  High: [
    "Inspect and Discard Infested Food: Check all food products in your pantry, especially grains and dried fruits, for signs of infestation. Discard any infested items.",
    "Store Food Properly: Store all dry food products in airtight containers to prevent pests from accessing them.",
    "Vacuum and Clean: Vacuum pantry shelves and surrounding areas to remove larvae, eggs, and webs.",
    "Pheromone Traps: Use pheromone traps to monitor and control adult moths.",
  ],
  Severe: [
    "Professional Treatment: Contact a pest control professional for severe stored food pest infestations.",
    "Complete Pantry Overhaul: May require complete cleaning and replacement of all stored food items.",
  ],
};

pestRecommendations["Gophers"] = {
  Moderate: [
    "Set Traps: Use gopher traps in active tunnels or burrows.",
    "Create Barriers: Install underground barriers (e.g., wire mesh) to prevent gophers from digging under fences or gardens.",
  ],
  High: [
    "Set Traps: Use gopher traps in active tunnels or burrows.",
    "Create Barriers: Install underground barriers (e.g., wire mesh) to prevent gophers from digging under fences or gardens.",
    "Professional Baiting: Consider professional gopher control programs.",
  ],
  Severe: [
    "Professional Treatment: Contact a pest control professional for severe gopher infestations.",
  ],
};

pestRecommendations["Moles"] = {
  Moderate: [
    "Set Traps: Use mole traps in active tunnels or burrows.",
    "Create Barriers: Install underground barriers to prevent moles from accessing certain areas.",
  ],
  High: [
    "Set Traps: Use mole traps in active tunnels or burrows.",
    "Create Barriers: Install underground barriers to prevent moles from accessing certain areas.",
    "Professional Treatment: Consider professional mole control for extensive damage.",
  ],
  Severe: [
    "Professional Treatment: Contact a pest control professional for severe mole infestations.",
  ],
};

pestRecommendations["Bees"] = {
  Moderate: [
    "For your safety and the safety of others, we recommend contacting a professional for bee removal.",
    "Do not attempt to remove bee hives yourself.",
  ],
  High: [
    "For your safety and the safety of others, we recommend contacting a professional for bee removal immediately.",
    "Avoid the area where bees are active.",
  ],
  Severe: [
    "IMMEDIATE PROFESSIONAL TREATMENT REQUIRED: Contact a pest control professional immediately for bee removal.",
    "Do not approach bee hives or swarms - serious safety risk.",
  ],
};

pestRecommendations["Wasps"] = {
  Moderate: [
    "For your safety and the safety of others, we recommend contacting a professional for wasp removal.",
    "Do not attempt to remove wasp nests yourself.",
  ],
  High: [
    "For your safety and the safety of others, we recommend contacting a professional for wasp removal immediately.",
    "Avoid the area where wasps are active.",
  ],
  Severe: [
    "IMMEDIATE PROFESSIONAL TREATMENT REQUIRED: Contact a pest control professional immediately for wasp removal.",
    "Do not approach wasp nests - serious safety risk.",
  ],
};

pestRecommendations["Yellow Jackets"] = {
  Moderate: [
    "For your safety and the safety of others, we recommend contacting a professional for yellow jacket removal.",
    "Do not attempt to remove yellow jacket nests yourself.",
  ],
  High: [
    "For your safety and the safety of others, we recommend contacting a professional for yellow jacket removal immediately.",
    "Avoid the area where yellow jackets are active.",
  ],
  Severe: [
    "IMMEDIATE PROFESSIONAL TREATMENT REQUIRED: Contact a pest control professional immediately for yellow jacket removal.",
    "Do not approach yellow jacket nests - serious safety risk.",
  ],
};

function handleContactClick(setShowContactForm: any, setContactType: any) {
  setContactType("call");
  setShowContactForm(true);
}

export default function AssessmentPage() {
  const [currentStep, setCurrentStep] = useState(0); // 0 = pest selection, 1+ = questions
  const [selectedPests, setSelectedPests] = useState<string[]>([]);
  const [primaryPest, setPrimaryPest] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [showResults, setShowResults] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactType, setContactType] = useState<"call">("call");
  const [detailedDescription, setDetailedDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<
    { url: string; filename: string; size: number; type: string }[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUserData = sessionStorage.getItem("userData");
    if (!storedUserData) {
      router.push("/");
      return;
    }
    setUserData(JSON.parse(storedUserData));
  }, [router]);

  const handlePestSelection = (pest: string) => {
    setSelectedPests((prev) => {
      if (prev.includes(pest)) {
        return prev.filter((p) => p !== pest);
      } else {
        return [...prev, pest];
      }
    });
  };

  const startAssessment = () => {
    if (selectedPests.length === 0) return;
    setPrimaryPest(selectedPests[0]); // First selected is priority
    setCurrentStep(1);
  };

  const handleAnswer = (questionId: number, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const nextQuestion = () => {
    const questions = pestSpecificQuestions[primaryPest] || [];
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    } else {
      setCurrentStep(0);
      setCurrentQuestion(0);
    }
  };

  const questions = pestSpecificQuestions[primaryPest] || [];
  const totalSteps = questions.length + 1; // +1 for pest selection
  const progress =
    currentStep === 0
      ? (1 / totalSteps) * 100
      : ((currentStep + currentQuestion + 1) / totalSteps) * 100;

  const getCurrentAnswer = () => {
    if (questions.length === 0) return undefined;
    return answers[questions[currentQuestion].id];
  };

  const isAnswered = () => {
    if (currentStep === 0) return selectedPests.length > 0;
    const answer = getCurrentAnswer();
    if (questions[currentQuestion]?.multiple) {
      return Array.isArray(answer) && answer.length > 0;
    }
    return answer !== undefined;
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const maxSize = 20 * 1024 * 1024; // 20MB in bytes
        const validTypes = ["image/", "video/"];

        if (file.size > maxSize) {
          alert(`File "${file.name}" is too large. Maximum size is 20MB.`);
          return null;
        }

        if (!validTypes.some((type) => file.type.startsWith(type))) {
          alert(`File "${file.name}" is not a valid image or video file.`);
          return null;
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Upload failed");
        }

        return await response.json();
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((result) => result !== null);

      setUploadedFiles((prev) => [...prev, ...successfulUploads]);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload files. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = "";
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Bug className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-background">
        <ResultsPage
          primaryPest={primaryPest}
          answers={answers}
          setShowContactForm={setShowContactForm}
          setContactType={setContactType}
          detailedDescription={detailedDescription}
          setDetailedDescription={setDetailedDescription}
          uploadedFiles={uploadedFiles}
          setUploadedFiles={setUploadedFiles}
          handleFileUpload={handleFileUpload}
          formatFileSize={formatFileSize}
          removeFile={removeFile}
          isUploading={isUploading}
          userData={userData}
          selectedPests={selectedPests} // Pass selectedPests to ResultsPage
        />
        <AIChatbot currentQuestion={-1} answers={answers} />
        <ContactFormModal
          isOpen={showContactForm}
          onClose={() => setShowContactForm(false)}
          contactType={contactType}
          pestInfo={{
            pest: primaryPest,
            activityLevel: calculateSeverity(primaryPest, answers),
            confidence: "High",
          }}
          assessmentAnswers={answers}
          detailedDescription={detailedDescription}
          uploadedFiles={uploadedFiles}
          otherPests={selectedPests.filter((pest) => pest !== primaryPest)} // Pass other pests to contact form
        />
      </div>
    );
  }

  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Bug className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-card-foreground">
                  Pest Assessment Tool
                </h1>
                <p className="text-muted-foreground">
                  Professional pest severity assessment
                </p>
              </div>
              <div className="ml-auto">
                <p className="text-sm text-muted-foreground">
                  Welcome, {userData.name}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">
                Step 1 of {totalSteps}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl text-card-foreground">
                What type(s) of pest are you dealing with?
              </CardTitle>
              <div className="space-y-2">
                <Badge variant="secondary" className="w-fit">
                  Select all that apply
                </Badge>
                <p className="text-sm text-muted-foreground">
                  <strong>Important:</strong> Please select pests in order of
                  importance. The first pest you select will be our primary
                  focus for the detailed assessment.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {pestTypes.map((pest, index) => {
                const isSelected = selectedPests.includes(pest);
                const selectionOrder = selectedPests.indexOf(pest) + 1;

                return (
                  <Button
                    key={pest}
                    variant={isSelected ? "default" : "outline"}
                    className="w-full justify-start text-left h-auto p-4"
                    onClick={() => handlePestSelection(pest)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      {isSelected && <CheckCircle className="w-5 h-5" />}
                      <span className="flex-1">{pest}</span>
                      {isSelected && (
                        <Badge variant="secondary" className="ml-auto">
                          {selectionOrder === 1
                            ? "Primary"
                            : `#${selectionOrder}`}
                        </Badge>
                      )}
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" disabled>
              Previous
            </Button>
            <Button
              onClick={startAssessment}
              disabled={!isAnswered()}
              className="min-w-24"
            >
              Start Assessment
            </Button>
          </div>
        </div>

        <AIChatbot currentQuestion={-1} answers={{}} />
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Bug className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">
                Pest Assessment Tool
              </h1>
              <p className="text-muted-foreground">Assessing: {primaryPest}</p>
            </div>
            <div className="ml-auto">
              <p className="text-sm text-muted-foreground">
                Welcome, {userData.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-card-foreground">
              {question.question}
            </CardTitle>
            {question.multiple && (
              <Badge variant="secondary" className="w-fit">
                Select all that apply
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {question.options.map((option) => {
              const isSelected = question.multiple
                ? Array.isArray(getCurrentAnswer()) &&
                  (getCurrentAnswer() as string[]).includes(option.value)
                : getCurrentAnswer() === option.value;

              return (
                <Button
                  key={option.value}
                  variant={isSelected ? "default" : "outline"}
                  className="w-full justify-start text-left h-auto p-4"
                  onClick={() => {
                    if (question.multiple) {
                      const currentAnswers =
                        (getCurrentAnswer() as string[]) || [];
                      const newAnswers = isSelected
                        ? currentAnswers.filter((a) => a !== option.value)
                        : [...currentAnswers, option.value];
                      handleAnswer(question.id, newAnswers);
                    } else {
                      handleAnswer(question.id, option.value);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    {isSelected && <CheckCircle className="w-5 h-5" />}
                    <span>{option.label}</span>
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={prevQuestion}>
            Previous
          </Button>
          <Button
            onClick={nextQuestion}
            disabled={!isAnswered()}
            className="min-w-24"
          >
            {currentQuestion === questions.length - 1 ? "Get Results" : "Next"}
          </Button>
        </div>
      </div>

      <AIChatbot
        currentQuestion={currentQuestion}
        answers={answers}
        onSuggestAction={(action) => {
          if (action === "next" && isAnswered()) {
            nextQuestion();
          }
        }}
      />
    </div>
  );
}

function ResultsPage({
  primaryPest,
  answers,
  setShowContactForm,
  setContactType,
  detailedDescription,
  setDetailedDescription,
  uploadedFiles,
  setUploadedFiles,
  handleFileUpload,
  formatFileSize,
  removeFile,
  isUploading,
  userData,
  selectedPests, // Added selectedPests prop
}: {
  primaryPest: string;
  answers: UserAnswers;
  setShowContactForm: any;
  setContactType: any;
  detailedDescription: string;
  setDetailedDescription: any;
  uploadedFiles: {
    url: string;
    filename: string;
    size: number;
    type: string;
  }[];
  setUploadedFiles: any;
  handleFileUpload: any;
  formatFileSize: any;
  removeFile: any;
  isUploading: boolean;
  userData: { name: string; email: string };
  selectedPests: string[]; // Added selectedPests prop type
}) {
  const activityLevel = calculateSeverity(primaryPest, answers);
  const recommendation = getRecommendation(activityLevel);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const sendRecommendations = async () => {
      try {
        const otherPests = selectedPests.filter((pest) => pest !== primaryPest);

        const response = await fetch("/api/send-recommendations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userData.email,
            name: userData.name,
            primaryPest,
            otherPests,
            answers,
            activityLevel,
          }),
        });

        if (response.ok) {
          setEmailSent(true);
        }
      } catch (error) {
        console.error("Failed to send recommendations email:", error);
      }
    };

    if (userData && primaryPest && !emailSent) {
      sendRecommendations();
    }
  }, [userData, primaryPest, selectedPests, answers, activityLevel, emailSent]);

  const getThemeColors = (level: string) => {
    switch (level) {
      case "Severe":
        return {
          primary: "bg-red-600 hover:bg-red-700",
          primaryText: "text-white",
          accent: "bg-red-50 border-red-200",
          accentText: "text-red-800",
          badge: "bg-red-100 text-red-800 border-red-300",
          headerBg: "bg-gradient-to-r from-red-600 to-red-700",
          pulse: "animate-pulse",
          glow: "shadow-lg shadow-red-500/25",
        };
      case "High":
        return {
          primary: "bg-orange-600 hover:bg-orange-700",
          primaryText: "text-white",
          accent: "bg-orange-50 border-orange-200",
          accentText: "text-orange-800",
          badge: "bg-orange-100 text-orange-800 border-orange-300",
          headerBg: "bg-gradient-to-r from-orange-600 to-orange-700",
          pulse: "",
          glow: "shadow-md shadow-orange-500/20",
        };
      default: // Moderate
        return {
          primary: "bg-yellow-600 hover:bg-yellow-700",
          primaryText: "text-white",
          accent: "bg-yellow-50 border-yellow-200",
          accentText: "text-yellow-800",
          badge: "bg-yellow-100 text-yellow-800 border-yellow-300",
          headerBg: "bg-gradient-to-r from-yellow-600 to-yellow-700",
          pulse: "",
          glow: "shadow-sm shadow-yellow-500/15",
        };
    }
  };

  const themeColors = getThemeColors(activityLevel);

  function getRecommendation(activityLevel: string) {
    switch (activityLevel) {
      case "Severe":
        return {
          message:
            "🚨 URGENT: You have a severe pest infestation that requires immediate professional intervention. Delaying treatment could lead to significant property damage and health risks.",
          action: "immediate",
        };
      case "High":
        return {
          message:
            "⚠️ WARNING: Your pest problem is escalating and needs prompt attention. Professional treatment is strongly recommended to prevent further spread.",
          action: "recommended",
        };
      default: // Moderate
        return {
          message:
            "⚡ CAUTION: Early signs of pest activity detected. Acting now can prevent a minor issue from becoming a major infestation.",
          action: "optional",
        };
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className={`border-b border-border ${themeColors.headerBg}`}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg ${themeColors.pulse}`}
            >
              <Bug className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Assessment Results
              </h1>
              <p className="text-white/90">
                Your personalized pest identification and recommendations
              </p>
            </div>
            {activityLevel === "Severe" && (
              <div className="ml-auto">
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full animate-pulse">
                  <AlertTriangle className="w-4 h-4 text-white" />
                  <span className="text-sm font-medium text-white">URGENT</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card
          className={`mb-6 ${themeColors.glow} border-2`}
          style={{
            borderColor:
              activityLevel === "Severe"
                ? "#dc2626"
                : activityLevel === "High"
                ? "#ea580c"
                : "#d97706",
          }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Pest Assessment Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Primary Pest
                </p>
                <p className="text-lg font-semibold text-card-foreground">
                  {primaryPest}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Severity Level
                </p>
                <Badge
                  className={`${themeColors.badge} font-bold ${
                    activityLevel === "Severe" ? "animate-pulse" : ""
                  }`}
                >
                  {activityLevel}
                </Badge>
              </div>
            </div>
            {emailSent && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-800 text-sm font-medium">
                  ✅ Detailed recommendations have been sent to {userData.email}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card
          className={`mb-6 ${themeColors.accent} border-2`}
          style={{
            borderColor:
              activityLevel === "Severe"
                ? "#dc2626"
                : activityLevel === "High"
                ? "#ea580c"
                : "#d97706",
          }}
        >
          <CardHeader>
            <CardTitle className={themeColors.accentText}>
              Assessment Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`${themeColors.accentText} mb-4 font-medium text-lg`}>
              {recommendation.message}
            </p>

            {recommendation.action === "immediate" && (
              <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4 mb-4 animate-pulse">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <p className="text-lg font-bold text-red-600">
                    IMMEDIATE ACTION REQUIRED
                  </p>
                </div>
                <p className="text-red-700 font-medium">
                  🔥 Severe pest activity detected. Every hour of delay
                  increases damage and treatment costs. Professional
                  intervention needed NOW!
                </p>
              </div>
            )}

            {recommendation.action === "recommended" && (
              <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <p className="text-lg font-bold text-orange-600">
                    PROMPT ACTION RECOMMENDED
                  </p>
                </div>
                <p className="text-orange-700 font-medium">
                  ⚠️ Your pest problem is escalating. Don't let it become a
                  costly emergency - act now!
                </p>
              </div>
            )}

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-blue-800">
                📧 Check Your Email
              </h4>
              <p className="text-blue-700 text-sm">
                We've sent detailed, pest-specific recommendations to{" "}
                <strong>{userData.email}</strong>. The email includes
                step-by-step guidance for your primary pest ({primaryPest})
                {selectedPests.length > 1 &&
                  ` and ${selectedPests.length - 1} other pest(s) you selected`}
                .
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Describe Your Situation</CardTitle>
            <p className="text-muted-foreground">
              Provide additional details about your pest situation to help our
              experts better understand your needs
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="detailed-description">Additional Details</Label>
              <Textarea
                id="detailed-description"
                placeholder="Describe any additional observations, concerns, or specific areas where you've noticed pest activity..."
                value={detailedDescription}
                onChange={(e) => setDetailedDescription(e.target.value)}
                className="min-h-24 mt-2"
              />
            </div>

            <div>
              <Label htmlFor="file-upload">
                Upload Images or Videos (Max 20MB each)
              </Label>
              <div className="mt-2">
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <Button
                  variant="outline"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                  className="w-full justify-center"
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? "Uploading..." : "Choose Files"}
                </Button>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Uploaded Files:</p>
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {file.filename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)} •{" "}
                          {file.type.startsWith("image/") ? "Image" : "Video"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="ml-2 h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          className={`${themeColors.glow} border-2`}
          style={{
            borderColor:
              activityLevel === "Severe"
                ? "#dc2626"
                : activityLevel === "High"
                ? "#ea580c"
                : "#d97706",
          }}
        >
          <CardHeader>
            <CardTitle className="text-xl">
              🎯 Get Your FREE Professional Consultation
            </CardTitle>
            <p className="text-muted-foreground font-medium">
              {activityLevel === "Severe"
                ? "Emergency consultation available - Don't wait, call now!"
                : activityLevel === "High"
                ? "Priority scheduling available - Secure your spot today!"
                : "Expert advice to prevent escalation - Schedule now!"}
            </p>
          </CardHeader>
          <CardContent>
            <Button
              className={`w-full justify-center text-lg py-6 ${
                themeColors.primary
              } ${themeColors.primaryText} ${
                activityLevel === "Severe" ? "animate-pulse" : ""
              } ${themeColors.glow}`}
              size="lg"
              onClick={() =>
                handleContactClick(setShowContactForm, setContactType)
              }
            >
              <Phone className="w-6 h-6 mr-3" />
              {activityLevel === "Severe"
                ? "🚨 EMERGENCY CONSULTATION - CALL NOW"
                : activityLevel === "High"
                ? "⚡ PRIORITY CONSULTATION - SCHEDULE TODAY"
                : "📞 FREE CONSULTATION - BOOK NOW"}
            </Button>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                {activityLevel === "Severe"
                  ? "⏰ Same-day service available • 24/7 emergency response"
                  : activityLevel === "High"
                  ? "⏰ Next-day service available • Limited slots remaining"
                  : "⏰ Flexible scheduling • Prevention is key"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
