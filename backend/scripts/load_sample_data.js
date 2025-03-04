// Sample data loader for MongoDB
// Run with: mongo localhost:27017/govtrack load_sample_data.js

// Clear existing collections
db.users.drop();
db.policies.drop();
db.representatives.drop();
db.quizzes.drop();
db.quiz_results.drop();

// Create sample users
print("Creating sample users...");
const users = [
  {
    _id: ObjectId(),
    auth0_id: "auth0|123456789",
    name: "John Doe",
    email: "john.doe@example.com",
    profile_picture: "https://randomuser.me/api/portraits/men/1.jpg",
    location: {
      city: "New York",
      state: "NY",
      zip: "10001"
    },
    saved_policies: [],
    saved_representatives: [],
    quiz_results: [],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: ObjectId(),
    auth0_id: "auth0|987654321",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    profile_picture: "https://randomuser.me/api/portraits/women/1.jpg",
    location: {
      city: "Los Angeles",
      state: "CA",
      zip: "90001"
    },
    saved_policies: [],
    saved_representatives: [],
    quiz_results: [],
    created_at: new Date(),
    updated_at: new Date()
  }
];
db.users.insertMany(users);

// Create sample representatives
print("Creating sample representatives...");
const representatives = [
  {
    _id: ObjectId(),
    name: "Jane Smith",
    profile_picture: "https://randomuser.me/api/portraits/women/2.jpg",
    party: "Democratic",
    title: "Senator",
    state: "NY",
    district: null,
    biography: "Jane Smith has served as a Senator since 2021. She previously served as a State Representative and has a background in environmental law.",
    contact_info: {
      office_address: "123 Senate Building, Washington DC",
      phone: "202-555-0101",
      email: "jane.smith@senate.gov",
      website: "https://smith.senate.gov"
    },
    social_media: {
      twitter: "SenatorSmith",
      facebook: "SenatorJaneSmith",
      instagram: "senatorsmith"
    },
    committees: [
      {
        name: "Environment and Public Works",
        role: "Chair"
      },
      {
        name: "Budget",
        role: "Member"
      }
    ],
    political_stances: [
      {
        issue: "Climate Change",
        stance: "Supports aggressive action on climate change, including carbon tax and renewable energy investments."
      },
      {
        issue: "Healthcare",
        stance: "Advocates for universal healthcare coverage and lowering prescription drug costs."
      }
    ],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: ObjectId(),
    name: "John Doe",
    profile_picture: "https://randomuser.me/api/portraits/men/2.jpg",
    party: "Republican",
    title: "Representative",
    state: "TX",
    district: "5",
    biography: "John Doe was elected to the House of Representatives in 2022. He has a background in business and served in the military.",
    contact_info: {
      office_address: "456 House Building, Washington DC",
      phone: "202-555-0102",
      email: "john.doe@house.gov",
      website: "https://doe.house.gov"
    },
    social_media: {
      twitter: "RepDoe",
      facebook: "RepresentativeJohnDoe",
      instagram: "repdoe"
    },
    committees: [
      {
        name: "Armed Services",
        role: "Member"
      },
      {
        name: "Small Business",
        role: "Ranking Member"
      }
    ],
    political_stances: [
      {
        issue: "Taxes",
        stance: "Supports lower taxes for individuals and businesses to stimulate economic growth."
      },
      {
        issue: "Immigration",
        stance: "Advocates for stronger border security and merit-based immigration system."
      }
    ],
    created_at: new Date(),
    updated_at: new Date()
  }
];
db.representatives.insertMany(representatives);

// Create sample policies
print("Creating sample policies...");
const policies = [
  {
    _id: ObjectId(),
    title: "Clean Energy Act",
    summary: "A bill to promote clean energy production and reduce carbon emissions.",
    description: "This bill aims to transition the country to clean energy sources by providing tax incentives for renewable energy production, setting emissions standards for power plants, and funding research into new clean energy technologies.",
    category: "Environment",
    level: "Federal",
    status: "Proposed",
    introduced_date: new Date("2023-03-15"),
    last_updated: new Date(),
    sponsors: [representatives[0]._id],
    votes: [
      {
        representative_id: representatives[0]._id,
        vote: "Yes",
        date: new Date("2023-04-10")
      },
      {
        representative_id: representatives[1]._id,
        vote: "No",
        date: new Date("2023-04-10")
      }
    ],
    location: {
      country: "United States",
      state: null,
      city: null
    },
    tags: ["environment", "energy", "climate change"],
    sources: [
      {
        name: "Congress.gov",
        url: "https://www.congress.gov/bill/sample"
      }
    ],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    _id: ObjectId(),
    title: "Tax Relief for Small Businesses Act",
    summary: "A bill to provide tax relief for small businesses affected by economic downturns.",
    description: "This legislation provides tax credits and deductions for small businesses with fewer than 50 employees. It includes provisions for accelerated depreciation of equipment, payroll tax relief, and simplified filing requirements.",
    category: "Economy",
    level: "Federal",
    status: "Passed",
    introduced_date: new Date("2023-02-10"),
    last_updated: new Date(),
    sponsors: [representatives[1]._id],
    votes: [
      {
        representative_id: representatives[0]._id,
        vote: "No",
        date: new Date("2023-03-05")
      },
      {
        representative_id: representatives[1]._id,
        vote: "Yes",
        date: new Date("2023-03-05")
      }
    ],
    location: {
      country: "United States",
      state: null,
      city: null
    },
    tags: ["economy", "taxes", "small business"],
    sources: [
      {
        name: "Congress.gov",
        url: "https://www.congress.gov/bill/sample"
      }
    ],
    created_at: new Date(),
    updated_at: new Date()
  }
];
db.policies.insertMany(policies);

// Create sample quizzes
print("Creating sample quizzes...");
const quizzes = [
  {
    _id: ObjectId(),
    title: "Political Alignment Quiz",
    description: "Find out where you stand on major political issues and which representatives align with your views.",
    category: "General Politics",
    questions: [
      {
        question: "The government should increase environmental regulations to prevent climate change.",
        options: [
          "Strongly Agree",
          "Agree",
          "Neutral",
          "Disagree",
          "Strongly Disagree"
        ],
        representative_stances: [
          {
            representative_id: representatives[0]._id,
            stance: "Strongly Agree"
          },
          {
            representative_id: representatives[1]._id,
            stance: "Disagree"
          }
        ]
      },
      {
        question: "The government should reduce taxes for businesses to stimulate economic growth.",
        options: [
          "Strongly Agree",
          "Agree",
          "Neutral",
          "Disagree",
          "Strongly Disagree"
        ],
        representative_stances: [
          {
            representative_id: representatives[0]._id,
            stance: "Disagree"
          },
          {
            representative_id: representatives[1]._id,
            stance: "Strongly Agree"
          }
        ]
      }
    ],
    created_at: new Date(),
    updated_at: new Date()
  }
];
db.quizzes.insertMany(quizzes);

// Create sample quiz results
print("Creating sample quiz results...");
const quizResults = [
  {
    _id: ObjectId(),
    user_id: users[0]._id,
    quiz_id: quizzes[0]._id,
    answers: [
      {
        question_index: 0,
        answer: "Agree"
      },
      {
        question_index: 1,
        answer: "Neutral"
      }
    ],
    representative_alignment: [
      {
        representative_id: representatives[0]._id,
        alignment_score: 0.75
      },
      {
        representative_id: representatives[1]._id,
        alignment_score: 0.25
      }
    ],
    created_at: new Date()
  }
];
db.quiz_results.insertMany(quizResults);

// Update user with quiz results
db.users.updateOne(
  { _id: users[0]._id },
  { $push: { quiz_results: quizResults[0]._id } }
);

print("Sample data loaded successfully!"); 