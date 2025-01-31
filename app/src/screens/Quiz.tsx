import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Modal,
  ScrollView,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Header } from "@/components";
import { ArrowLeft } from "lucide-react-native";
import { QuizStackParamList } from "@/stacks/QuizStack";
import { useNavigation } from "@react-navigation/native";
import { useFetchMyAssessments } from "@/hooks/api/queries/quiz";

type QuizStackNavigationProp = NativeStackNavigationProp<
  QuizStackParamList,
  "Quiz"
>;

interface QuizState {
  currentQuestionIndex: number;
  answers: Record<number, number>;
  timeRemaining: number;
  quizStarted: boolean;
  quizCompleted: boolean;
  score?: number;
}

const QUIZ_STATE_KEY = "quiz_state";

const { width } = Dimensions.get("window");

const Quiz: React.FC = () => {
  const { data: assessmentData } = useFetchMyAssessments();
  const navigation = useNavigation<QuizStackNavigationProp>();

  const [selectedAssessment, setSelectedAssessment] = useState<
    (typeof assessmentData.data.data)[0] | null
  >(null);
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: {},
    timeRemaining: 0,
    quizStarted: false,
    quizCompleted: false,
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEndQuizModal, setShowEndQuizModal] = useState(false);

  // Merge all questions from all quizzes in the selected assessment
  const allQuestions =
    selectedAssessment?.quizzes?.flatMap((quiz) => quiz.questions) || [];

  useEffect(() => {
    loadQuizState();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizState.quizStarted && !quizState.quizCompleted) {
      timer = setInterval(() => {
        setQuizState((prev) => {
          const newTimeRemaining = prev.timeRemaining - 1;
          if (newTimeRemaining <= 0) {
            handleQuizEnd();
            return { ...prev, timeRemaining: 0, quizCompleted: true };
          }
          return { ...prev, timeRemaining: newTimeRemaining };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizState.quizStarted, quizState.quizCompleted]);

  useEffect(() => {
    if (quizState.quizStarted) {
      saveQuizState();
    }
  }, [quizState]);

  const saveQuizState = async () => {
    try {
      await AsyncStorage.setItem(QUIZ_STATE_KEY, JSON.stringify(quizState));
    } catch (error) {
      console.error("Error saving quiz state:", error);
    }
  };

  const loadQuizState = async () => {
    try {
      const savedState = await AsyncStorage.getItem(QUIZ_STATE_KEY);
      if (savedState) {
        setQuizState(JSON.parse(savedState));
      }
    } catch (error) {
      console.error("Error loading quiz state:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleStartQuiz = () => {
    setShowConfirmModal(false);
    const durationInSeconds = (selectedAssessment?.duration || 0) * 60;
    setQuizState((prev) => ({
      ...prev,
      quizStarted: true,
      timeRemaining: durationInSeconds,
    }));
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setQuizState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [prev.currentQuestionIndex]: answerIndex,
      },
    }));
  };

  const handleNext = () => {
    if (quizState.currentQuestionIndex < allQuestions.length - 1) {
      setQuizState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
    }
  };

  const handleBack = () => {
    if (quizState.currentQuestionIndex > 0) {
      setQuizState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
      }));
    }
  };

  const calculateScore = () => {
    const totalQuestions = allQuestions.length;
    const correctAnswers = Object.entries(quizState.answers).reduce(
      (acc, [questionIndex, answerIndex]) => {
        const correctOption = allQuestions[parseInt(questionIndex)]?.correctOption;
        const selectedOption = [
          allQuestions[parseInt(questionIndex)]?.option1,
          allQuestions[parseInt(questionIndex)]?.option2,
          allQuestions[parseInt(questionIndex)]?.option3,
          allQuestions[parseInt(questionIndex)]?.option4,
        ][answerIndex];
        if (correctOption === selectedOption) {
          return acc + 1;
        }
        return acc;
      },
      0
    );
    return (correctAnswers / totalQuestions) * 100;
  };

  const handleQuizEnd = async () => {
    const score = calculateScore();

    try {
      // Save the quiz result
      await AsyncStorage.setItem(
        "quiz_result",
        JSON.stringify({
          score,
          completedAt: new Date().toISOString(),
          timeSpent: (selectedAssessment?.duration || 0) - quizState.timeRemaining,
        })
      );

      // Clear the ongoing quiz state
      await AsyncStorage.removeItem(QUIZ_STATE_KEY);

      setQuizState((prev) => ({
        ...prev,
        quizCompleted: true,
        score,
      }));
    } catch (error) {
      console.error("Error ending quiz:", error);
      // Still mark the quiz as completed even if saving fails
      setQuizState((prev) => ({
        ...prev,
        quizCompleted: true,
        score,
      }));
    }
  };

  const handleBackHome = async () => {
    await AsyncStorage.removeItem(QUIZ_STATE_KEY);
    navigation.goBack();
  };

  if (!assessmentData?.data?.data?.length) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.content}>
          <Text>No quiz data available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!selectedAssessment) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.content}>
          <Text style={[styles.quizHeaderTitle, , { paddingLeft: 16 , marginTop: 12}]}>Select an Assessment</Text>
          {assessmentData.data.data.map((assessment) => (
            <TouchableOpacity
              key={assessment.id}
              style={styles.assessmentCard}
              onPress={() => setSelectedAssessment(assessment)}>
              <Text style={styles.quizTitle}>{assessment.name}</Text>
              <Text style={styles.quizDescription}>
                {assessment.quizzes?.[0]?.description}
              </Text>
              <Text style={styles.daysLeft}>
                {Math.ceil(
                  (new Date(assessment.endDate).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                days left
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (quizState.quizCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.content}>
          <View style={[styles.quizCard, { flexDirection: "column" }]}>
            <Text style={styles.quizTitle}>Quiz Completed</Text>
            <Text style={styles.scoreText}>
              Your Score: {quizState.score?.toFixed(1)}%
            </Text>
            <Text style={styles.completionText}>
              Time Spent: {formatTime(((selectedAssessment?.duration * 60)|| 0) - quizState.timeRemaining)}
            </Text>
            <TouchableOpacity
              style={[styles.startButton, { paddingHorizontal: 16 }]}
              onPress={handleBackHome}>
              <Text style={styles.startButtonText}>Return to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!quizState.quizStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.content}>
          <View style={styles.quizHeader}>
            <Text style={styles.quizHeaderTitle}>Quiz</Text>
            <Text style={[styles.quizDescription]}>
              {selectedAssessment.quizzes?.[0]?.description}
            </Text>
          </View>
          <View style={styles.quizCard}>
            <Image
              source={require("../assets/quiz.png")}
              style={styles.illustration}
            />
            <View style={styles.quizDetails}>
              <Text style={styles.quizTitle}>
                {selectedAssessment.quizzes?.[0]?.name}
              </Text>
              <View style={styles.quizInfo}>
                <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
                  <Text style={styles.quizInfoTextStrong}>
                    {allQuestions.length}
                  </Text>
                  <Text style={styles.quizInfoText}>Multiple-choice questions</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
                  <Text style={styles.quizInfoTextStrong}>
                    {selectedAssessment.duration}
                  </Text>
                  <Text style={styles.quizInfoText}>Minutes</Text>
                </View>
              </View>
              <Text style={styles.daysLeft}>
                {Math.ceil(
                  (new Date(selectedAssessment.endDate).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                days left
              </Text>
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => setShowConfirmModal(true)}>
                <Text style={styles.startButtonText}>Start now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Modal visible={showConfirmModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Quiz</Text>
              <Text style={styles.modalText}>
                You are about to start a {selectedAssessment.duration} minutes Quiz
                and won't be able to return until you submit. Are you sure you want
                to continue?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonNo]}
                  onPress={() => setShowConfirmModal(false)}>
                  <Text style={styles.modalButtonNoText}>No</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonYes, {backgroundColor: '#0CA554'}]}
                  onPress={handleStartQuiz}>
                  <Text style={styles.modalButtonYesText}>Yes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  const currentQuestion = allQuestions[quizState.currentQuestionIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowEndQuizModal(true)}>
          <ArrowLeft size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Back to Quiz</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionTitle}>
            {selectedAssessment.quizzes?.[0]?.name}
          </Text>
          <Text style={styles.timer}>
            {formatTime(quizState.timeRemaining) }
          </Text>
        </View>
        <Text style={styles.questionProgress}>
          {quizState.currentQuestionIndex + 1} of {allQuestions.length}
        </Text>

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion?.question}</Text>
          <View style={styles.optionsContainer}>
            {[
              currentQuestion?.option1,
              currentQuestion?.option2,
              currentQuestion?.option3,
              currentQuestion?.option4,
            ].map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  quizState.answers[quizState.currentQuestionIndex] === index &&
                    styles.optionButtonSelected,
                ]}
                onPress={() => handleAnswerSelect(index)}>
                <Text
                  style={[
                    styles.optionText,
                    quizState.answers[quizState.currentQuestionIndex] === index &&
                      styles.optionTextSelected,
                  ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {quizState.currentQuestionIndex > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        {quizState.currentQuestionIndex < allQuestions.length - 1 ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => setShowEndQuizModal(true)}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={showEndQuizModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>End Quiz</Text>
            <Text style={styles.modalText}>
              Doing this automatically submits your quiz, recording where you
              stopped and you can not retake the quiz anymore. Are you sure you
              want to End Quiz Now?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonNo]}
                onPress={() => setShowEndQuizModal(false)}>
                <Text style={styles.modalButtonNoText}>Continue Quiz</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonYes]}
                onPress={handleQuizEnd}>
                <Text style={styles.modalButtonYesText}>End Quiz</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FFFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  headerTitle: {
    marginLeft: 16,
    fontSize: 16,
    color: "#666",
  },
  content: {
    flex: 1,
    backgroundColor: "#fff",
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  questionTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
  },
  timer: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
  },
  quizHeader: {
    padding: 16,
  },
  quizHeaderTitle: {
    fontWeight: "600",
    color: "#000",
    fontSize: 24,
    marginBottom: 12,
  },
  quizDescription: {
    fontWeight: "400",
    color: "#667085",
    fontSize: 14,
  },
  questionProgress: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#666",
  },
  questionContainer: {
    padding: 16,
  },
  questionText: {
    fontSize: 16,
    color: "#000",
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  optionButtonSelected: {
    borderColor: "#0CA554",
    borderWidth: 1.5,
  },
  optionText: {
    fontSize: 16,
    color: "#666",
  },
  optionTextSelected: {
    color: "#000",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "#666",
  },
  nextButton: {
    backgroundColor: "#0CA554",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  nextButtonText: {
    fontSize: 16,
    color: "#fff",
  },
  submitButton: {
    backgroundColor: "#0CA554",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  submitButtonText: {
    fontSize: 16,
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonNo: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  modalButtonNoText: {
    fontSize: 16,
    color: "#344054",
  },
  modalButtonYes: {
    backgroundColor: "#D92D20",
  },
  modalButtonYesText: {
    fontSize: 16,
    color: "#fff",
  },
  quizCard: {
    margin: 16,
    padding: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F2F4F7",
    width: width - 32,
  },
  quizDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  illustration: {
    width: "30%",
    height: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F2F4F7",
    overflow: "hidden",
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#101828",
    marginBottom: 8,
  },
  quizInfo: {
    marginBottom: 16,
  },
  quizInfoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  quizInfoTextStrong: {
    fontWeight: "600",
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  daysLeft: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: "#0CA554",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  startButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  assessmentCard: {
    margin: 16,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F2F4F7",
  },
});

export default Quiz;