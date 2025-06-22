import StepOne from "@/components/ProfileSetup/StepOne";
import StepThree from "@/components/ProfileSetup/StepThree";
import StepTwo from "@/components/ProfileSetup/StepTwo";
import { useAuth } from "@/hooks/useAuth";
import { ProfileSetupData } from "@/types/User";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { ActivityIndicator, ProgressBar, Text } from "react-native-paper";

export default function ProfileSetupScreen() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ProfileSetupData>({
    name: "",
    profileType: null,
    linkedinUrl: "",
    githubUsername: "",
    companyName: "",
    showCompany: true,
    bio: "",
  });

  const [errors, setErrors] = useState<Partial<ProfileSetupData>>({});

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const updatedUser = {
        ...user,
        ...formData,
        profileType: formData.profileType!,
      };

      await updateUser(updatedUser);
      router.replace("/(app)/home");
    } catch (error) {
      Alert.alert("Error", "Failed to create profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepOne
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <StepTwo
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <StepThree
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            onBack={handleBack}
            onSubmit={handleSubmit}
          />
        );
    }
  };

  if (isSubmitting) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Creating your profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ProgressBar progress={currentStep / 3} style={styles.progressBar} />

        <Text style={styles.stepIndicator}>Step {currentStep} of 3</Text>

        {renderStep()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  progressBar: {
    marginTop: 40,
    marginBottom: 20,
  },
  stepIndicator: {
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
});
