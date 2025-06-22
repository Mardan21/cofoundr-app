import StepOne from "@/components/ProfileSetup/StepOne";
import StepThree from "@/components/ProfileSetup/StepThree";
import StepTwo from "@/components/ProfileSetup/StepTwo";
import { useAuth } from "@/hooks/useAuth";
import { ProfileSetupData } from "@/types/User";
import { completeProfileSetup, ApiError } from "@/utils/api";
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
    full_name: "",
    profileType: "founder",
    linkedinId: "",
    startupIdea: "",
    bio: "",
    lookingFor: "",
    links: [],
  });

  const [errors, setErrors] = useState<Partial<ProfileSetupData>>({});

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Error", "User not found. Please sign in again.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Call the complete profile setup API flow
      const createdUser = await completeProfileSetup(formData);
      
      // Update the user in the auth context
      const updatedUser = {
        ...createdUser,
        id: user.id, // Keep the existing user ID
        email: user.email, // Keep the existing email
        createdAt: user.createdAt || new Date().toISOString(),
      };

      await updateUser(updatedUser);
      
      Alert.alert(
        "Success!", 
        "Your profile has been created successfully!",
        [
          {
            text: "Continue",
            onPress: () => router.replace("/(app)/browse"),
          }
        ]
      );
    } catch (error) {
      console.error("Profile setup error:", error);
      
      let errorMessage = "Failed to create profile. Please try again.";
      
      if (error instanceof ApiError) {
        if (error.status === 404) {
          errorMessage = "LinkedIn profile not found. We've created your profile with the information you provided. You can update your LinkedIn information later.";
        } else if (error.status === 400) {
          errorMessage = "Invalid data provided. Please check your inputs.";
        } else if (error.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = error.message;
        }
      } else if (error.message.includes("Invalid LinkedIn URL")) {
        errorMessage = "Please provide a valid LinkedIn profile URL.";
      } else if (error.message.includes("SSL") || error.message.includes("certificate")) {
        errorMessage = "LinkedIn data temporarily unavailable. We've created your profile with the information you provided.";
      }
      
      // If it's a LinkedIn-related error but profile was still created, show success with warning
      if (error instanceof ApiError && (error.status === 404 || error.message.includes("LinkedIn"))) {
        Alert.alert(
          "Profile Created!", 
          "Your profile has been created successfully! LinkedIn data is temporarily unavailable, but you can update this information later in your profile settings.",
          [
            {
              text: "Continue",
              onPress: () => router.replace("/(app)/browse"),
            }
          ]
        );
      } else {
        Alert.alert("Error", errorMessage);
      }
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
        <Text style={styles.loadingSubtext}>
          Fetching LinkedIn data and setting up your account
        </Text>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
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
