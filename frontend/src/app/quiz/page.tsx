"use client";

import { useState } from "react";
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Stepper, 
  Step, 
  StepLabel,
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  FormControl, 
  FormLabel,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Divider,
  LinearProgress
} from "@mui/material";
import { useRouter } from "next/navigation";

interface Question {
  id: number;
  text: string;
  options: {
    value: number;
    label: string;
  }[];
}

interface PoliticianMatch {
  id: string;
  name: string;
  party: string;
  position: string;
  imageUrl: string;
  matchPercentage: number;
  answers: {
    questionId: number;
    value: number;
  }[];
}

const mockQuestions: Question[] = [
  {
    id: 1,
    text: "The government should increase taxes on the wealthy to fund social programs.",
    options: [
      { value: 1, label: "Strongly Disagree" },
      { value: 2, label: "Disagree" },
      { value: 3, label: "Neutral" },
      { value: 4, label: "Agree" },
      { value: 5, label: "Strongly Agree" }
    ]
  },
  {
    id: 2,
    text: "Healthcare should be provided as a public service to all citizens.",
    options: [
      { value: 1, label: "Strongly Disagree" },
      { value: 2, label: "Disagree" },
      { value: 3, label: "Neutral" },
      { value: 4, label: "Agree" },
      { value: 5, label: "Strongly Agree" }
    ]
  },
  {
    id: 3,
    text: "The government should prioritize environmental regulations over economic growth.",
    options: [
      { value: 1, label: "Strongly Disagree" },
      { value: 2, label: "Disagree" },
      { value: 3, label: "Neutral" },
      { value: 4, label: "Agree" },
      { value: 5, label: "Strongly Agree" }
    ]
  },
  {
    id: 4,
    text: "Gun ownership is a fundamental right that should be protected.",
    options: [
      { value: 1, label: "Strongly Disagree" },
      { value: 2, label: "Disagree" },
      { value: 3, label: "Neutral" },
      { value: 4, label: "Agree" },
      { value: 5, label: "Strongly Agree" }
    ]
  },
  {
    id: 5,
    text: "Immigration policies should be more restrictive.",
    options: [
      { value: 1, label: "Strongly Disagree" },
      { value: 2, label: "Disagree" },
      { value: 3, label: "Neutral" },
      { value: 4, label: "Agree" },
      { value: 5, label: "Strongly Agree" }
    ]
  },
  {
    id: 6,
    text: "The government should invest more in renewable energy.",
    options: [
      { value: 1, label: "Strongly Disagree" },
      { value: 2, label: "Disagree" },
      { value: 3, label: "Neutral" },
      { value: 4, label: "Agree" },
      { value: 5, label: "Strongly Agree" }
    ]
  },
  {
    id: 7,
    text: "Education should be primarily funded at the federal level.",
    options: [
      { value: 1, label: "Strongly Disagree" },
      { value: 2, label: "Disagree" },
      { value: 3, label: "Neutral" },
      { value: 4, label: "Agree" },
      { value: 5, label: "Strongly Agree" }
    ]
  },
  {
    id: 8,
    text: "The minimum wage should be increased significantly.",
    options: [
      { value: 1, label: "Strongly Disagree" },
      { value: 2, label: "Disagree" },
      { value: 3, label: "Neutral" },
      { value: 4, label: "Agree" },
      { value: 5, label: "Strongly Agree" }
    ]
  },
  {
    id: 9,
    text: "Military spending should be reduced.",
    options: [
      { value: 1, label: "Strongly Disagree" },
      { value: 2, label: "Disagree" },
      { value: 3, label: "Neutral" },
      { value: 4, label: "Agree" },
      { value: 5, label: "Strongly Agree" }
    ]
  },
  {
    id: 10,
    text: "The government should regulate large technology companies more strictly.",
    options: [
      { value: 1, label: "Strongly Disagree" },
      { value: 2, label: "Disagree" },
      { value: 3, label: "Neutral" },
      { value: 4, label: "Agree" },
      { value: 5, label: "Strongly Agree" }
    ]
  }
];

const mockPoliticians: PoliticianMatch[] = [
  {
    id: "1",
    name: "Jane Smith",
    party: "Democratic",
    position: "Senator",
    imageUrl: "https://placehold.co/150",
    matchPercentage: 85,
    answers: [
      { questionId: 1, value: 5 },
      { questionId: 2, value: 5 },
      { questionId: 3, value: 4 },
      { questionId: 4, value: 2 },
      { questionId: 5, value: 1 },
      { questionId: 6, value: 5 },
      { questionId: 7, value: 4 },
      { questionId: 8, value: 5 },
      { questionId: 9, value: 4 },
      { questionId: 10, value: 4 }
    ]
  },
  {
    id: "2",
    name: "John Doe",
    party: "Republican",
    position: "Representative",
    imageUrl: "https://placehold.co/150",
    matchPercentage: 35,
    answers: [
      { questionId: 1, value: 1 },
      { questionId: 2, value: 2 },
      { questionId: 3, value: 2 },
      { questionId: 4, value: 5 },
      { questionId: 5, value: 4 },
      { questionId: 6, value: 2 },
      { questionId: 7, value: 1 },
      { questionId: 8, value: 1 },
      { questionId: 9, value: 1 },
      { questionId: 10, value: 2 }
    ]
  },
  {
    id: "3",
    name: "Emily Johnson",
    party: "Democratic",
    position: "Governor",
    imageUrl: "https://placehold.co/150",
    matchPercentage: 72,
    answers: [
      { questionId: 1, value: 4 },
      { questionId: 2, value: 4 },
      { questionId: 3, value: 3 },
      { questionId: 4, value: 3 },
      { questionId: 5, value: 2 },
      { questionId: 6, value: 4 },
      { questionId: 7, value: 3 },
      { questionId: 8, value: 4 },
      { questionId: 9, value: 3 },
      { questionId: 10, value: 5 }
    ]
  },
  {
    id: "4",
    name: "Michael Williams",
    party: "Independent",
    position: "Mayor",
    imageUrl: "https://placehold.co/150",
    matchPercentage: 60,
    answers: [
      { questionId: 1, value: 3 },
      { questionId: 2, value: 4 },
      { questionId: 3, value: 3 },
      { questionId: 4, value: 3 },
      { questionId: 5, value: 3 },
      { questionId: 6, value: 4 },
      { questionId: 7, value: 2 },
      { questionId: 8, value: 3 },
      { questionId: 9, value: 3 },
      { questionId: 10, value: 3 }
    ]
  },
  {
    id: "5",
    name: "Sarah Brown",
    party: "Republican",
    position: "State Senator",
    imageUrl: "https://placehold.co/150",
    matchPercentage: 42,
    answers: [
      { questionId: 1, value: 2 },
      { questionId: 2, value: 1 },
      { questionId: 3, value: 2 },
      { questionId: 4, value: 5 },
      { questionId: 5, value: 4 },
      { questionId: 6, value: 3 },
      { questionId: 7, value: 1 },
      { questionId: 8, value: 2 },
      { questionId: 9, value: 1 },
      { questionId: 10, value: 3 }
    ]
  }
];

export default function PoliticalQuizPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<PoliticianMatch[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleNext = () => {
    if (activeStep === mockQuestions.length - 1) {
      // Last question, calculate results
      calculateResults();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const questionId = mockQuestions[activeStep].id;
    setAnswers({
      ...answers,
      [questionId]: parseInt(event.target.value)
    });
  };

  const calculateResults = () => {
    setLoading(true);
    
    // In a real app, this would be an API call
    // For now, we'll simulate a calculation with mock data
    setTimeout(() => {
      try {
        // Calculate match percentages
        const calculatedResults = mockPoliticians.map(politician => {
          // Calculate the difference between user answers and politician answers
          let totalDifference = 0;
          let maxPossibleDifference = 0;
          
          mockQuestions.forEach(question => {
            const userAnswer = answers[question.id] || 3; // Default to neutral if not answered
            const politicianAnswer = politician.answers.find(a => a.questionId === question.id)?.value || 3;
            
            // Calculate absolute difference
            const difference = Math.abs(userAnswer - politicianAnswer);
            totalDifference += difference;
            
            // Maximum possible difference is 4 (between 1 and 5)
            maxPossibleDifference += 4;
          });
          
          // Calculate match percentage (invert the difference ratio)
          const matchPercentage = Math.round(100 - (totalDifference / maxPossibleDifference * 100));
          
          return {
            ...politician,
            matchPercentage
          };
        });
        
        // Sort by match percentage (highest first)
        calculatedResults.sort((a, b) => b.matchPercentage - a.matchPercentage);
        
        setResults(calculatedResults);
        setShowResults(true);
        setError("");
      } catch (err) {
        setError("Failed to calculate results. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  const handleReset = () => {
    setActiveStep(0);
    setAnswers({});
    setResults([]);
    setShowResults(false);
  };

  const getPartyColor = (party: string) => {
    switch (party) {
      case "Democratic":
        return "primary";
      case "Republican":
        return "error";
      case "Independent":
        return "success";
      default:
        return "default";
    }
  };

  const currentQuestion = mockQuestions[activeStep];
  const isQuestionAnswered = currentQuestion ? answers[currentQuestion.id] !== undefined : false;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Political Alignment Quiz
      </Typography>
      
      <Typography variant="body1" paragraph>
        Answer these questions to see how your political views align with elected officials. 
        This quiz helps you understand where you stand on key issues compared to politicians.
      </Typography>
      
      {showResults ? (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Your Results
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
          ) : (
            <Box>
              <Grid container spacing={3}>
                {results.map((politician) => (
                  <Grid item xs={12} key={politician.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar 
                            src={politician.imageUrl} 
                            alt={politician.name}
                            sx={{ width: 60, height: 60, mr: 2 }}
                          />
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" component="div">
                              {politician.name}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Chip 
                                label={politician.party} 
                                size="small" 
                                color={getPartyColor(politician.party) as any}
                              />
                              <Chip label={politician.position} size="small" variant="outlined" />
                            </Box>
                          </Box>
                          <Box sx={{ textAlign: 'center', minWidth: 80 }}>
                            <Typography variant="h4" color={
                              politician.matchPercentage > 70 ? "success.main" :
                              politician.matchPercentage > 40 ? "warning.main" : "error.main"
                            }>
                              {politician.matchPercentage}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Match
                            </Typography>
                          </Box>
                        </Box>
                        
                        <LinearProgress 
                          variant="determinate" 
                          value={politician.matchPercentage} 
                          color={
                            politician.matchPercentage > 70 ? "success" :
                            politician.matchPercentage > 40 ? "warning" : "error"
                          }
                          sx={{ height: 8, borderRadius: 4, mb: 2 }}
                        />
                        
                        <Button 
                          size="small" 
                          onClick={() => router.push(`/representatives/${politician.id}`)}
                        >
                          View Profile
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleReset}
                >
                  Take Quiz Again
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      ) : (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {mockQuestions.map((question, index) => (
              <Step key={question.id}>
                <StepLabel>Q{index + 1}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
          ) : (
            <Box>
              <FormControl component="fieldset" sx={{ width: '100%', mb: 4 }}>
                <FormLabel component="legend" sx={{ mb: 2, typography: 'h6' }}>
                  {currentQuestion.text}
                </FormLabel>
                <RadioGroup
                  name={`question-${currentQuestion.id}`}
                  value={answers[currentQuestion.id] || ''}
                  onChange={handleAnswerChange}
                >
                  {currentQuestion.options.map((option) => (
                    <FormControlLabel
                      key={option.value}
                      value={option.value}
                      control={<Radio />}
                      label={option.label}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
              
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  disabled={!isQuestionAnswered}
                >
                  {activeStep === mockQuestions.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      )}
    </Container>
  );
} 