import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Modal,
  TextInput
} from "react-native";
import { ArrowLeft, ChevronRight } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../stacks/HomeStack";
import { CustomButton, Header } from "@/components";
import { useCreateDecision } from "@/hooks/api/mutations/user";
import { ActivityIndicator } from "react-native";

type NavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  "DynamicFlow"
>;

interface Chapter {
  chapter: string;
  pages: Page[];
  subChapters: SubChapter[];
}

interface SubChapter {
  subChapterTitle: string;
  pages: Page[];
  subSubChapters: SubSubChapter[];
  hasDecisions?: boolean;
  history?: string[];
  examinationsActions?: string[];
  findingsOnExamination?: string[];
  cases?: Case[];
}

interface SubSubChapter {
  subSubChapterTitle: string;
  pages: Page[];
  hasDecisions?: boolean;
  history?: string[];
  examinationsActions?: string[];
  findingsOnExamination?: string[];
  cases?: Case[];
}

interface Page {
  type?: string;
  items?: Array<{
    type: string;
    title?: string;
    content?: string;
    history?: string[];
    examinationsActions?: string[];
    findingsOnExamination?: string[];
    cases?: Case[];
  }>;
}

interface Case {
  findingsOnHistory: string;
  clinicalJudgement: string;
  actions: string[];
  findingsOnExamination: string[];
  decisionScore: number;
  decisionDependencies: string[];
}

interface UserSelections {
  chapterTitle: string;
  subChapterTitle: string;
  subSubChapterTitle?: string;
  examResponses: {
    question: string;
    response: "yes" | "no";
  }[];
  matchingDiagnoses: Case[];
}

type ViewState =
  | "subChapters"
  | "subSubChapters"
  | "history"
  | "examinationActions"
  | "examination"
  | "diagnosis";

interface ExaminationResponse {
  question: string;
  response: "yes" | "no" | null;
}

type DynamicFlowProps = {
  route: {
    params: {
      chapter: Chapter;
      chapterIndex: number;
    };
  };
};

interface ReasonModalProps {
  visible: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (data: {
    reason: string;
    patientId?: string;
    patientAge?: string;
  }) => void;
}

const ReasonModal = ({
  visible,
  onClose,
  onSubmit,
  isLoading
}: ReasonModalProps) => {
  const [reason, setReason] = useState("");
  const [patientId, setPatientId] = useState("");
  const [patientAge, setPatientAge] = useState("");

  const handleSubmit = () => {
    if (!reason) {
      Alert.alert("Error", "Please select a reason");
      return;
    }

    if (reason === "Patient Care" && (!patientId || !patientAge)) {
      Alert.alert("Error", "Please fill in all patient details");
      return;
    }

    onSubmit({
      reason,
      ...(reason === "Patient Care" && {
        patientId,
        patientAge
      })
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Submit Decision</Text>
          <Text style={styles.modalDescription}>
            Please provide additional details
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Reason for Usage</Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() => {
                Alert.alert(
                  "Select Reason",
                  "",
                  [
                    { text: "Tutoring", onPress: () => setReason("Tutoring") },
                    {
                      text: "Self-study",
                      onPress: () => setReason("Self-study")
                    },
                    {
                      text: "Patient Care",
                      onPress: () => setReason("Patient Care")
                    },
                    { text: "Cancel", style: "cancel" }
                  ],
                  { cancelable: true }
                );
              }}>
              <Text style={styles.pickerText}>{reason || "Select reason"}</Text>
              <ChevronRight size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {reason === "Patient Care" && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Patient ID</Text>
                <TextInput
                  style={styles.input}
                  value={patientId}
                  onChangeText={setPatientId}
                  placeholder="Enter patient ID"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Patient Age</Text>
                <TextInput
                  style={styles.input}
                  value={patientAge}
                  onChangeText={setPatientAge}
                  keyboardType="numeric"
                  placeholder="Enter patient age"
                />
              </View>
            </>
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.doneButton} onPress={handleSubmit}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.doneButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const DynamicFlow = ({ route }: DynamicFlowProps) => {
  const { chapter } = route.params;
  const navigation = useNavigation<NavigationProp>();
  const createDecision = useCreateDecision();

  const [currentView, setCurrentView] = useState<ViewState>("subChapters");
  const [selectedChapter] = useState<Chapter>(chapter);
  const [selectedSubChapter, setSelectedSubChapter] =
    useState<SubChapter | null>(null);
  const [selectedSubSubChapter, setSelectedSubSubChapter] =
    useState<SubSubChapter | null>(null);
  const [navigationPath, setNavigationPath] = useState<string[]>([
    chapter.chapter
  ]);
  const [examinationResponses, setExaminationResponses] = useState<
    ExaminationResponse[]
  >([]);
  const [expandedDiagnosis, setExpandedDiagnosis] = useState<number | null>(
    null
  );
  const [userSelections, setUserSelections] = useState<UserSelections>({
    chapterTitle: chapter.chapter,
    subChapterTitle: "",
    subSubChapterTitle: "",
    examResponses: [],
    matchingDiagnoses: []
  });
  const [showReasonModal, setShowReasonModal] = useState(false);

  useEffect(() => {
    if (currentView === "diagnosis") {
      const matchingCases = getMatchingCases();
      setUserSelections((prev) => ({
        ...prev,
        matchingDiagnoses: matchingCases
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView]);

  const getCurrentSelections = () => {
    return {
      ...userSelections,
      examResponses: userSelections.examResponses.filter(
        (r) => r.response === "yes"
      )
    };
  };

  const handleSubChapterSelect = (subChapter: SubChapter) => {
    setSelectedSubChapter(subChapter);
    setUserSelections((prev) => ({
      ...prev,
      subChapterTitle: subChapter.subChapterTitle
    }));

    // Check if subChapter has histories/decisions
    const hasHistory =
      subChapter.history ||
      subChapter.pages?.[0]?.items?.find((item) => item.type === "decision")
        ?.history;

    const hasExaminations =
      subChapter.examinationsActions ||
      subChapter.pages?.[0]?.items?.find((item) => item.type === "decision")
        ?.examinationsActions;

    if (hasHistory || hasExaminations) {
      setCurrentView("history");
    } else {
      setCurrentView("subSubChapters");
    }

    setNavigationPath((prev) => [...prev, subChapter.subChapterTitle]);
  };

  const handleSubSubChapterSelect = (subSubChapter: SubSubChapter) => {
    if (!subSubChapter) {
      console.error("Error: subSubChapter is null or undefined");
      return;
    }

    setSelectedSubSubChapter(subSubChapter);
    setUserSelections((prev) => ({
      ...prev,
      subSubChapterTitle: subSubChapter.subSubChapterTitle
    }));

    // Changed this part - always go to history for sub-sub-chapters
    setCurrentView("history");
    setNavigationPath((prev) => [...prev, subSubChapter.subSubChapterTitle]);
  };

  const handleExaminationResponse = (
    question: string,
    response: "yes" | "no"
  ) => {
    setExaminationResponses((prev) => {
      const existing = prev.find((r) => r.question === question);
      if (existing) {
        return prev.map((r) =>
          r.question === question ? { ...r, response } : r
        );
      }
      return [...prev, { question, response }];
    });

    if (response === "yes") {
      setUserSelections((prev) => ({
        ...prev,
        examResponses: [
          ...prev.examResponses.filter((r) => r.question !== question),
          { question, response }
        ]
      }));
    } else {
      setUserSelections((prev) => ({
        ...prev,
        examResponses: prev.examResponses.filter((r) => r.question !== question)
      }));
    }
  };

  const handleDecisionFlow = (item: SubChapter | SubSubChapter) => {
    if ("subChapterTitle" in item) {
      setSelectedSubChapter(item);
      setUserSelections((prev) => ({
        ...prev,
        subChapterTitle: item.subChapterTitle,
        subSubChapterTitle: ""
      }));
    } else {
      setSelectedSubSubChapter(item);
      setUserSelections((prev) => ({
        ...prev,
        subSubChapterTitle: item.subSubChapterTitle
      }));
    }
    setCurrentView("history");
    setNavigationPath((prev) => [
      ...prev,
      "subChapterTitle" in item ? item.subChapterTitle : item.subSubChapterTitle
    ]);
  };

  const handleContinue = () => {
    if (currentView === "examination") {
      const currentItem = selectedSubSubChapter || selectedSubChapter;
      if (!currentItem) {
        return;
      }

      const findingsOnExamination =
        "findingsOnExamination" in currentItem
          ? currentItem.findingsOnExamination
          : currentItem.pages[0]?.items?.find(
              (item) => item.type === "decision"
            )?.findingsOnExamination;

      if (findingsOnExamination) {
        const updatedResponses = findingsOnExamination.map((finding) => {
          const existing = examinationResponses.find(
            (r) => r.question === finding
          );
          return {
            question: finding,
            response: existing?.response || "no"
          };
        });
        setExaminationResponses(updatedResponses);
      }
      setCurrentView("diagnosis");
    } else if (currentView === "history") {
      setCurrentView("examinationActions");
    } else if (currentView === "examinationActions") {
      setCurrentView("examination");
    }
  };

  const handleBack = () => {
    if (currentView === "examination") {
      setCurrentView("examinationActions");
    } else if (currentView === "examinationActions") {
      setCurrentView("history");
    } else if (currentView === "history") {
      if (selectedSubSubChapter) {
        setCurrentView("subSubChapters");
        setSelectedSubSubChapter(null);
      } else {
        setCurrentView("subChapters");
        setSelectedSubChapter(null);
      }
      setNavigationPath((prev) => prev.slice(0, -1));
    } else if (currentView === "subSubChapters") {
      setCurrentView("subChapters");
      setNavigationPath((prev) => prev.slice(0, -1));
    } else if (currentView === "subChapters") {
      navigation.goBack();
    }
  };

  const hasDecisionContent = (item: SubChapter | SubSubChapter) => {
    // Check direct properties
    if (
      item.history?.length ||
      item.hasDecisions ||
      item.examinationsActions?.length ||
      item.findingsOnExamination?.length
    ) {
      return true;
    }

    // Check in pages
    const hasDecisionInPages = item.pages?.some((page) =>
      page.items?.some(
        (pageItem) =>
          pageItem.type === "decision" ||
          pageItem.history?.length ||
          pageItem.examinationsActions?.length ||
          pageItem.findingsOnExamination?.length
      )
    );

    return hasDecisionInPages;
  };

  const getMatchingCases = () => {
    const currentItem = selectedSubSubChapter || selectedSubChapter;
    if (!currentItem) {
      return [];
    }

    const cases =
      "cases" in currentItem
        ? currentItem.cases
        : currentItem.pages[0]?.items?.find((item) => item.type === "decision")
            ?.cases;

    if (!cases) {
      return [];
    }

    const userPositiveFindings = examinationResponses
      .filter((r) => r.response === "yes")
      .map((r) => r.question);

    return cases.filter((caseItem) => {
      if (caseItem.decisionDependencies.length > 0) {
        return caseItem.decisionDependencies.some((dependency) =>
          userPositiveFindings.includes(dependency)
        );
      }

      const matchingFindings = caseItem.findingsOnExamination.filter(
        (finding) => userPositiveFindings.includes(finding)
      );

      const matchPercentage =
        matchingFindings.length / caseItem.findingsOnExamination.length;

      return matchPercentage >= (caseItem.decisionScore || 0);
    });
  };

  const renderBreadcrumb = () => (
    <View style={styles.breadcrumbContainer}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <ArrowLeft size={30} color="#666" />
      </TouchableOpacity>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.breadcrumb}>
          {navigationPath.map((path, index) => (
            <React.Fragment key={index}>
              {index > 0 && <Text style={styles.breadcrumbSeparator}>›</Text>}
              <Text
                style={[
                  styles.breadcrumbText,
                  index === navigationPath.length - 1 && styles.breadcrumbActive
                ]}>
                {path}
              </Text>
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderListItem = (
    item: SubChapter | SubSubChapter,
    onPress: () => void
  ) => (
    <TouchableOpacity style={styles.listItem} onPress={onPress}>
      <Text style={styles.listItemText}>
        {"subChapterTitle" in item
          ? item.subChapterTitle
          : item.subSubChapterTitle}
      </Text>
      {"hasDecisions" in item && item.hasDecisions ? (
        <TouchableOpacity
          style={styles.decisionButton}
          onPress={() => handleDecisionFlow(item)}>
          <Text style={styles.decisionButtonText}>Decisions</Text>
        </TouchableOpacity>
      ) : (
        <ChevronRight size={20} color="#666" />
      )}
    </TouchableOpacity>
  );

  const renderHistory = () => {
    const currentItem = selectedSubSubChapter || selectedSubChapter;
    if (!currentItem) return null;

    const history =
      currentItem.history ||
      currentItem.pages?.[0]?.items?.find((item) => item.type === "decision")
        ?.history ||
      selectedSubChapter?.history ||
      selectedSubChapter?.pages?.[0]?.items?.find(
        (item) => item.type === "decision"
      )?.history;

    if (!history) return null;

    return (
      <View style={styles.historyContainer}>
        <Text style={styles.historyHeader}>History</Text>
        <Text style={styles.historySubHeader}>
          Ask the following to know the medical history of the patient
        </Text>
        {history.map((question, index) => (
          <View key={index} style={styles.historyItem}>
            <Text style={styles.historyNumber}>{index + 1}.</Text>
            <Text style={styles.historyQuestion}>{question}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderExaminationActions = () => {
    const currentItem = selectedSubSubChapter || selectedSubChapter;
    if (!currentItem) {
      return null;
    }

    const findingsOnExamination =
      currentItem.findingsOnExamination ||
      currentItem.pages[0]?.items?.find((item) => item.type === "decision")
        ?.findingsOnExamination;

    if (!findingsOnExamination) {
      return null;
    }

    return (
      <View style={styles.historyContainer}>
        <Text style={styles.historyHeader}>Examination/Actions</Text>
        <Text style={styles.historySubHeader}>
          Carry out the following examination to further understand the
          condition
        </Text>

        {findingsOnExamination.map((action, index) => (
          <View key={index} style={styles.historyItem}>
            <Text style={styles.historyNumber}>{index + 1}.</Text>
            <Text style={styles.historyQuestion}>{action}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderExamination = () => {
    const currentItem = selectedSubSubChapter || selectedSubChapter;
    if (!currentItem) {
      return null;
    }

    const findingsOnExamination =
      currentItem.findingsOnExamination ||
      currentItem.pages[0]?.items?.find((item) => item.type === "decision")
        ?.findingsOnExamination;

    if (!findingsOnExamination) {
      return null;
    }

    return (
      <View style={styles.examinationContainer}>
        <Text style={styles.historyHeader}>Findings on Examination</Text>
        <Text style={styles.historySubHeader}>
          Select your findings from the given list
        </Text>

        {findingsOnExamination.map((finding, index) => {
          const response = examinationResponses.find(
            (r) => r.question === finding
          );

          return (
            <View key={finding} style={styles.examinationItem}>
              <Text style={styles.examinationNumber}>{index + 1}.</Text>
              <Text style={styles.examinationText}>{finding}</Text>
              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    response?.response === "yes" && styles.checkboxSelectedYes
                  ]}
                  onPress={() => handleExaminationResponse(finding, "yes")}>
                  <Text
                    style={[
                      styles.checkboxText,
                      response?.response === "yes" &&
                        styles.checkboxTextSelected
                    ]}>
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    response?.response === "no" && styles.checkboxSelectedNo
                  ]}
                  onPress={() => handleExaminationResponse(finding, "no")}>
                  <Text
                    style={[
                      styles.checkboxText,
                      response?.response === "no" && styles.checkboxTextSelected
                    ]}>
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleBack}>
            <Text style={styles.viewActionsButtonText}>View Actions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderDiagnosis = () => {
    const matchingCases = getMatchingCases();

    const renderDiagnosisItem = (caseItem: Case, index: number) => {
      const isExpanded = expandedDiagnosis === index;

      const handlePress = () => {
        setExpandedDiagnosis(isExpanded ? null : index);
      };

      return (
        <View key={index} style={styles.diagnosisItem}>
          <TouchableOpacity
            style={[
              styles.diagnosisCollapsed,
              isExpanded && styles.diagnosisCollapsedExpanded
            ]}
            onPress={handlePress}>
            <Text style={styles.judgementText}>
              {caseItem.clinicalJudgement}
            </Text>
            <View style={styles.headerRight}>
              <ChevronRight
                size={20}
                color="#666"
                style={[styles.chevron, isExpanded && styles.chevronExpanded]}
              />
            </View>
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.expandedContent}>
              <Text style={styles.sectionTitle}>
                Associated Findings on Examination
              </Text>
              {caseItem.findingsOnExamination.map((finding, idx) => (
                <View key={idx} style={styles.findingItem}>
                  <Text style={styles.findingNumber}>{idx + 1}.</Text>
                  <Text style={styles.findingText}>{finding}</Text>
                </View>
              ))}

              <Text style={styles.sectionTitle}>Action to be taken</Text>
              {caseItem.actions.map((action, idx) => (
                <View key={idx} style={styles.findingItem}>
                  <Text style={styles.findingNumber}>{idx + 1}.</Text>
                  <Text style={styles.findingText}>{action}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      );
    };

    return (
      <View style={styles.diagnosisContainer}>
        <Text style={styles.subtitle}>Diagnosis</Text>
        <Text style={styles.description}>
          Here are the list of possible diagnosis based on your findings
        </Text>

        {matchingCases.map((caseItem, index) =>
          renderDiagnosisItem(caseItem, index)
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setCurrentView("examination")}>
            <Text style={styles.viewActionsButtonText}>Back</Text>
          </TouchableOpacity>
          <CustomButton
            title="Submit"
            onPress={() => setShowReasonModal(true)}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      {navigationPath.length > 0 && renderBreadcrumb()}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}>
        {currentView === "subChapters" && selectedChapter && (
          <>
            <Text style={styles.title}>{selectedChapter.chapter}</Text>
            {selectedChapter?.subChapters
              ?.filter((subChapter) => hasDecisionContent(subChapter))
              .map((subChapter, index) => (
                <View key={index} style={styles.listContainer}>
                  {renderListItem(subChapter, () =>
                    handleSubChapterSelect(subChapter)
                  )}
                </View>
              ))}
          </>
        )}

        {currentView === "subSubChapters" && selectedSubChapter && (
          <>
            <Text style={styles.title}>
              {selectedSubChapter?.subChapterTitle}
            </Text>
            {selectedSubChapter?.subSubChapters
              ?.filter((subSubChapter) => hasDecisionContent(subSubChapter))
              .map((subSubChapter, index) => (
                <View key={index} style={styles.listContainer}>
                  {renderListItem(subSubChapter, () =>
                    handleSubSubChapterSelect(subSubChapter)
                  )}
                </View>
              ))}
          </>
        )}

        {currentView === "history" &&
          (selectedSubSubChapter || selectedSubChapter) && (
            <>
              <Text style={styles.title}>
                {selectedSubSubChapter?.subSubChapterTitle ||
                  selectedSubChapter?.subChapterTitle}
              </Text>
              {renderHistory()}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleBack}>
                  <Text style={styles.secondaryButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleContinue}>
                  <Text style={styles.primaryButtonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

        {currentView === "examinationActions" &&
          (selectedSubSubChapter || selectedSubChapter) && (
            <>
              <Text style={styles.title}>
                {selectedSubSubChapter?.subSubChapterTitle ||
                  selectedSubChapter?.subChapterTitle}
              </Text>
              {renderExaminationActions()}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleBack}>
                  <Text style={styles.secondaryButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleContinue}>
                  <Text style={styles.primaryButtonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

        {currentView === "examination" &&
          (selectedSubSubChapter || selectedSubChapter) && (
            <>
              <Text style={styles.title}>
                {selectedSubSubChapter?.subSubChapterTitle ||
                  selectedSubChapter?.subChapterTitle}
              </Text>
              {renderExamination()}
            </>
          )}

        {currentView === "diagnosis" &&
          (selectedSubSubChapter || selectedSubChapter) && (
            <>
              <Text style={styles.title}>
                {selectedSubSubChapter?.subSubChapterTitle ||
                  selectedSubChapter?.subChapterTitle}
              </Text>
              {renderDiagnosis()}
            </>
          )}
      </ScrollView>
      <ReasonModal
        visible={showReasonModal}
        onClose={() => setShowReasonModal(false)}
        isLoading={createDecision.isLoading}
        onSubmit={(reasonData) => {
          // Get current selections
          const selections = getCurrentSelections();

          // Transform selections into the format expected by the mutation
          const mutationInput = {
            caseDescription: selections.examResponses
              .map((response) => response.question)
              .join(", "),
            reason: reasonData.reason,
            patientId: reasonData.patientId,
            patientAge: reasonData.patientAge
          };

          // Call mutation with transformed data
          createDecision.mutate(
            { ...mutationInput, ...selections },
            {
              onSuccess: (data) => {
                setShowReasonModal(false);
                Alert.alert("Success", "Decision submitted successfully", [
                  {
                    text: "OK",
                    onPress: () => {
                      navigation.goBack();
                    }
                  }
                ]);
              },
              onError: (error) => {
                console.log("error", error.response);
              }
            }
          );
        }}
      />
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
  headerSection: {
    backgroundColor: "#F8FFFB",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  details: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10
  },

  profileName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#101828"
  },
  cadre: {
    fontSize: 14,
    color: "#667085",
    fontWeight: "400"
  },
  contentContainer: {
    paddingBottom: 80 // Add padding to account for footer
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    padding: 16,
    color: "#000000",
    textTransform: "capitalize"
  },
  breadcrumbContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "#fff"
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#101828",
    marginBottom: 8
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center"
  },
  breadcrumbText: {
    fontSize: 14,
    color: "#98A2B3",
    textTransform: "capitalize"
  },
  breadcrumbActive: {
    color: "#0CA554"
  },
  breadcrumbSeparator: {
    marginHorizontal: 8,
    color: "#666"
  },
  backButton: {
    marginRight: 12
  },
  listContainer: {
    paddingHorizontal: 16,
    marginBottom: 12
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#F2F4F7",
    backgroundColor: "#FCFCFD",
    borderRadius: 8
  },
  listItemText: {
    fontSize: 16,
    color: "black",
    flex: 1,
    textTransform: "capitalize",
    marginRight: 8
  },
  historyContainer: {
    padding: 16
  },
  historyHeader: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8
  },
  historySubHeader: {
    color: "#667085",
    fontSize: 14,
    fontWeight: "400",
    marginBottom: 20
  },
  historyItem: {
    flexDirection: "row",
    marginBottom: 16,
    fontSize: 16
  },
  historyNumber: {
    width: 24,
    fontSize: 16,
    fontWeight: "400",
    color: "#101828"
  },
  historyQuestion: {
    flex: 1,
    fontSize: 16,
    color: "#101828"
  },
  examinationContainer: {
    padding: 16,
    marginBottom: 0
  },
  examinationItem: {
    flexDirection: "row",
    marginBottom: 16
  },
  examinationNumber: {
    width: 24,
    fontSize: 14,
    fontWeight: "500",
    color: "#101828"
  },
  examinationText: {
    flex: 1,
    fontSize: 16,
    color: "#101828"
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FCFCFD"
  },
  pickerText: {
    fontSize: 14,
    color: "#101828"
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0
  },
  primaryButton: {
    backgroundColor: "#0CA554",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    // flex: 1,
    marginLeft: 8
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center"
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "#E5E5E5"
  },
  secondaryButtonText: {
    color: "#101828",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center"
  },
  checkboxContainer: {
    flexDirection: "row",
    gap: 8,
    marginLeft: "auto"
  },
  checkbox: {
    borderWidth: 1,
    borderColor: "#EAECF0",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 32
  },
  checkboxSelectedYes: {
    backgroundColor: "#F6FEF9",
    borderColor: "#D1FADF"
  },
  checkboxSelectedNo: {
    backgroundColor: "#FFFBFA", // Red color for No
    borderColor: "#FDA29B"
  },
  checkboxText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500"
  },
  checkboxTextSelected: {
    color: "#101828"
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 8,
    paddingBottom: 16
  },
  viewActionsButton: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    padding: 12,
    flex: 1
  },
  viewActionsButtonText: {
    color: "#101828",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
    flex: 1
  },
  continueButton: {
    backgroundColor: "#22C55E",
    borderRadius: 8,
    padding: 12,
    flex: 1
  },
  continueButtonDisabled: {
    backgroundColor: "#A1A1AA"
  },
  continueButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500"
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center"
  },
  judgementText: {
    fontSize: 16,
    color: "black"
  },
  diagnosisContainer: {
    padding: 16
  },
  diagnosisSection: {
    marginBottom: 24
  },
  diagnosisHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16
  },
  diagnosisTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#101828",
    flex: 1
  },
  severityBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  severityText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "500"
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#101828",
    marginTop: 16,
    marginBottom: 8
  },
  findingItem: {
    flexDirection: "row",
    marginBottom: 8
  },
  findingNumber: {
    width: 24,
    fontSize: 14,
    color: "#101828"
  },
  findingText: {
    flex: 1,
    fontSize: 14,
    color: "#101828"
  },
  diagnosisItem: {
    marginBottom: 12
  },
  diagnosisCollapsed: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#F2F4F7",
    backgroundColor: "#FCFCFD",
    borderRadius: 8,
    color: "black"
  },
  diagnosisCollapsedExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    color: "black"
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  chevron: {
    transform: [{ rotate: "0deg" }]
  },
  chevronExpanded: {
    transform: [{ rotate: "90deg" }]
  },
  expandedContent: {
    padding: 16,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#F2F4F7",
    backgroundColor: "#FCFCFD",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    width: "90%",
    maxWidth: 400
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#101828",
    marginBottom: 8
  },
  modalDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24
  },
  inputContainer: {
    marginBottom: 16
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#101828",
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#101828"
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 24
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  cancelButtonText: {
    color: "#101828",
    fontSize: 16,
    fontWeight: "500"
  },
  doneButton: {
    backgroundColor: "#22C55E",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24
  },
  doneButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500"
  },
  decisionButton: {
    backgroundColor: "#0CA554",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6
  },
  decisionButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500"
  }
});

export default DynamicFlow;
