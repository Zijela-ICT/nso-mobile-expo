//Quiz.tsx
import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  View,
  Text,
  Modal,
  Image,
  Dimensions
} from "react-native";
import { Header } from "@/components";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFetchMyAssessments } from "@/hooks/api/queries/quiz";
import { useStartAssessment } from "@/hooks/api/mutations/quiz";
import { ArrowLeft } from "lucide-react-native";
import { QuizStackParamList } from "@/stacks/QuizStack";

type QuizNavigationProp = NativeStackNavigationProp<QuizStackParamList, "Quiz">;

const { width } = Dimensions.get("window");

export const Quiz: React.FC = () => {
  const navigation = useNavigation<QuizNavigationProp>();
  const { data: assessmentData } = useFetchMyAssessments();
  const startAssessment = useStartAssessment();

  const [selectedAssessment, setSelectedAssessment] = useState<
    (typeof assessmentData.data.data)[0] | null
  >(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleStartQuiz = async () => {
    setShowConfirmModal(false);
    try {
      if (selectedAssessment?.id) {
        await startAssessment.mutateAsync(
          { id: selectedAssessment.id },
          {
            onSuccess: (data) => {
              navigation.navigate("QuizQuestions", {
                assessmentId: selectedAssessment.id,
                duration: selectedAssessment.duration,
                quizName: selectedAssessment.quizzes?.[0]?.name
              });
            }
          }
        );
      }
    } catch (error) {
      console.error("Error starting assessment:", error);
    }
  };

  const handleAssessmentSelect = (
    assessment: (typeof assessmentData.data.data)[0]
  ) => {
    setSelectedAssessment(assessment);
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
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}>
          <Text
            style={[
              styles.quizHeaderTitle,
              { paddingLeft: 16, marginTop: 12 }
            ]}>
            Select an Assessment
          </Text>
          {assessmentData.data.data.map((assessment) => (
            <TouchableOpacity
              key={assessment.id}
              style={styles.assessmentCard}
              onPress={() => handleAssessmentSelect(assessment)}>
              <Text style={styles.quizTitle}>{assessment.name}</Text>
              <Text style={styles.quizDescription}>
                {assessment.quizzes?.[0]?.description}
              </Text>
              <Text style={styles.daysLeft}>
                {Math.ceil(
                  (new Date(assessment.endDate).getTime() -
                    new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                days left
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}>
        <View style={styles.quizHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedAssessment(null)}>
            <ArrowLeft size={24} color="#666" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
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
              {/* <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
                <Text style={styles.quizInfoTextStrong}>
                  {selectedAssessment.quizzes?.[0]?.questions?.length || 0}
                </Text>
                <Text style={styles.quizInfoText}>Multiple-choice questions</Text>
              </View> */}
              <View
                style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
                <Text style={styles.quizInfoTextStrong}>
                  {selectedAssessment.duration}
                </Text>
                <Text style={styles.quizInfoText}>Minutes</Text>
              </View>
            </View>
            <Text style={styles.daysLeft}>
              {Math.ceil(
                (new Date(selectedAssessment.endDate).getTime() -
                  new Date().getTime()) /
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
      </ScrollView>

      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Quiz</Text>
            <Text style={styles.modalText}>
              You are about to start a {selectedAssessment.duration} minutes
              Quiz and won't be able to return until you submit. Are you sure
              you want to continue?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonNo]}
                onPress={() => setShowConfirmModal(false)}>
                <Text style={styles.modalButtonNoText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonYes,
                  { backgroundColor: "#0CA554" }
                ]}
                onPress={handleStartQuiz}>
                <Text style={styles.modalButtonYesText}>Yes</Text>
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
  content: {
    flex: 1,
    backgroundColor: "#fff"
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
    overflow: "hidden",
    aspectRatio: 1
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
  contentContainer: {
    flexGrow: 1
  },
  assessmentCard: {
    margin: 16,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F2F4F7"
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
    backgroundColor: "#0CA554"
  },
  modalButtonYesText: {
    fontSize: 16,
    color: "#fff"
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 16
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#666"
  }
});

export default Quiz;
