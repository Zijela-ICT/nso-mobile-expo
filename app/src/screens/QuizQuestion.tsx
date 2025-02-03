// QuizQuestions.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Modal,
  ScrollView,
  BackHandler,
  Platform,
  Dimensions
} from "react-native";
import { ArrowLeft } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFetchSingleAssessment } from "@/hooks/api/queries/quiz";
import { QuizStackParamList } from "@/stacks/QuizStack";

type QuizQuestionsNavigationProp = NativeStackNavigationProp<
  QuizStackParamList,
  "QuizQuestions"
>;

interface QuizState {
  currentQuestionIndex: number;
  answers: Record<number, number>;
  timeRemaining: number;
  quizStarted: boolean;
  quizCompleted: boolean;
}

const QUIZ_STATE_KEY = "quiz_state";
const { width } = Dimensions.get("window");
export const QuizQuestions: React.FC = () => {
  const navigation = useNavigation<QuizQuestionsNavigationProp>();
  const route = useRoute();
  const submitAssessment = useSubmitAssessment();
  const { assessmentId, duration, quizName } = route.params as any;

  const [showEndQuizModal, setShowEndQuizModal] = useState(false);
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: {},
    timeRemaining: duration * 60,
    quizStarted: true,
    quizCompleted: false
  });

  const { data: singleAssessmentData } = useFetchSingleAssessment(assessmentId);

  const allQuestions =
    singleAssessmentData?.data?.quizzes?.flatMap((quiz) => quiz.questions) ||
    [];

  const getOptionString = (index: number) => {
    switch (index) {
      case 0:
        return "option1";
      case 1:
        return "option2";
      case 2:
        return "option3";
      case 3:
        return "option4";
      default:
        return "option1";
    }
  };

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

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        setShowEndQuizModal(true);
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

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

  const handleAnswerSelect = async (answerIndex: number) => {
    setQuizState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [prev.currentQuestionIndex]: answerIndex
      }
    }));

    // Get current question
    const currentQuestion = allQuestions[quizState.currentQuestionIndex];

    try {
      await submitAssessment.mutateAsync({
        id: assessmentId,
        isCompleted: false,
        quizId: singleAssessmentData?.data?.quizzes[0]?.id,
        submission: [
          {
            quizId: singleAssessmentData?.data?.quizzes[0]?.id,
            questions: [
              {
                questionId: currentQuestion.id,
                selectedOption: getOptionString(answerIndex)
              }
            ]
          }
        ]
      });
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  const handleNext = () => {
    if (quizState.currentQuestionIndex < allQuestions.length - 1) {
      setQuizState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    }
  };

  const handleBack = () => {
    if (quizState.currentQuestionIndex > 0) {
      setQuizState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }));
    }
  };

  const handleQuizEnd = async () => {
    try {
      // Submit final assessment with isCompleted = true
      await submitAssessment.mutateAsync({
        id: assessmentId,
        isCompleted: true,
        quizId: singleAssessmentData?.data?.quizzes[0]?.id,
        submission: [
          {
            quizId: singleAssessmentData?.data?.quizzes[0]?.id,
            questions: Object.entries(quizState.answers).map(([questionIndex, answerIndex]) => ({
              questionId: allQuestions[parseInt(questionIndex)].id,
              selectedOption: getOptionString(answerIndex)
            }))
          }
        ]
      });

      await AsyncStorage.removeItem(QUIZ_STATE_KEY);
      setShowEndQuizModal(false);
      navigation.navigate("Quiz");
    } catch (error) {
      console.error("Error ending quiz:", error);
      navigation.navigate("Quiz");
    }
  };

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
          <Text style={styles.questionTitle}>{quizName}</Text>
          <Text style={styles.timer}>
            {formatTime(quizState.timeRemaining)}
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
              currentQuestion?.option4
            ].map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  quizState.answers[quizState.currentQuestionIndex] === index &&
                    styles.optionButtonSelected
                ]}
                onPress={() => handleAnswerSelect(index)}>
                <Text
                  style={[
                    styles.optionText,
                    quizState.answers[quizState.currentQuestionIndex] ===
                      index && styles.optionTextSelected
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
        <TouchableOpacity 
          style={[
            styles.nextButton,
            !quizState.answers[quizState.currentQuestionIndex] && styles.nextButtonDisabled
          ]} 
          disabled={!quizState.answers[quizState.currentQuestionIndex]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            styles.submitButton,
            !quizState.answers[quizState.currentQuestionIndex] && styles.nextButtonDisabled
          ]}
          disabled={!quizState.answers[quizState.currentQuestionIndex]}
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
    backgroundColor: "#F8FFFB"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff"
  },
  headerTitle: {
    marginLeft: 16,
    fontSize: 16,
    color: "#666"
  },
  content: {
    flex: 1,
    backgroundColor: "#fff"
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16
  },
  questionTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000"
  },
  timer: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000"
  },
  quizHeader: {
    padding: 16
  },
  quizHeaderTitle: {
    fontWeight: "600",
    color: "#000",
    fontSize: 24,
    marginBottom: 12
  },
  quizDescription: {
    fontWeight: "400",
    color: "#667085",
    fontSize: 14
  },
  questionProgress: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#666"
  },
  questionContainer: {
    padding: 16
  },
  questionText: {
    fontSize: 16,
    color: "#000",
    marginBottom: 24
  },
  optionsContainer: {
    gap: 12
  },
  nextButtonDisabled: {
    backgroundColor: "#A0AEC0", // or any other color for disabled state
    opacity: 0.5,
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
          height: 2
        },
        shadowOpacity: 0.05,
        shadowRadius: 1
      },
      android: {
        elevation: 2
      }
    })
  },
  optionButtonSelected: {
    borderColor: "#0CA554",
    borderWidth: 1.5
  },
  optionText: {
    fontSize: 16,
    color: "#666"
  },
  optionTextSelected: {
    color: "#000"
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5"
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8
  },
  backButtonText: {
    fontSize: 16,
    color: "#666"
  },
  nextButton: {
    backgroundColor: "#0CA554",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  nextButtonText: {
    fontSize: 16,
    color: "#fff"
  },
  submitButton: {
    backgroundColor: "#0CA554",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  submitButtonText: {
    fontSize: 16,
    color: "#fff"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "90%",
    maxWidth: 400
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8
  },
  modalText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center"
  },
  modalButtonNo: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E5E5"
  },
  modalButtonNoText: {
    fontSize: 16,
    color: "#344054"
  },
  modalButtonYes: {
    backgroundColor: "#D92D20"
  },
  modalButtonYesText: {
    fontSize: 16,
    color: "#fff"
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
    width: width - 32
  },
  quizDetails: {
    flex: 1,
    justifyContent: "space-between"
  },
  illustration: {
    width: "30%",
    height: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F2F4F7",
    overflow: "hidden"
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#101828",
    marginBottom: 8
  },
  quizInfo: {
    marginBottom: 16
  },
  quizInfoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4
  },
  quizInfoTextStrong: {
    fontWeight: "600",
    fontSize: 14,
    color: "#666",
    marginBottom: 4
  },
  daysLeft: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16
  },
  startButton: {
    backgroundColor: "#0CA554",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center"
  },
  startButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500"
  },
  assessmentCard: {
    margin: 16,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F2F4F7"
  },
  scoreText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8
  },
  completionText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24
  }
});
